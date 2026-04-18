import { NextResponse } from 'next/server';
import JSZip from 'jszip';
import { put } from '@vercel/blob';

// ─── Category normalisation ───────────────────────────────────────────────────
const CAT: Record<string, string> = {
  earring: 'Earrings', earrings: 'Earrings',
  pendant: 'Pendants', pendants: 'Pendants',
  bracelet: 'Bracelets', bracelets: 'Bracelets',
  tops: 'Studs', stud: 'Studs', studs: 'Studs',
  ring: 'Rings', rings: 'Rings',
  necklace: 'Necklaces', necklaces: 'Necklaces',
  bangle: 'Bangles', bangles: 'Bangles',
  chain: 'Chains', chains: 'Chains',
};

function normaliseCategory(raw: string): string {
  return CAT[raw.trim().toLowerCase()] ?? (raw.trim() || 'Rings');
}

// ─── STEP 1: Parse xl/sharedStrings.xml ──────────────────────────────────────
// Each <si> element is one string entry (index = position in array).
// A <si> may contain plain <t>text</t> or rich text via multiple <r><t>…</t></r>.
// We collect all <t> content inside each <si> and concatenate.
function parseSharedStrings(xml: string): string[] {
  const result: string[] = [];

  // Strip XML declaration / namespaces to simplify matching
  const siRegex = /<si\b[^>]*>([\s\S]*?)<\/si>/g;
  let siMatch: RegExpExecArray | null;

  while ((siMatch = siRegex.exec(xml)) !== null) {
    const siContent = siMatch[1];
    // Collect all <t> elements inside this <si>
    const tRegex = /<t(?:\s[^>]*)?>([^<]*)<\/t>/g;
    let tMatch: RegExpExecArray | null;
    const parts: string[] = [];
    while ((tMatch = tRegex.exec(siContent)) !== null) {
      parts.push(
        tMatch[1]
          .replace(/&amp;/g, '&')
          .replace(/&lt;/g, '<')
          .replace(/&gt;/g, '>')
          .replace(/&quot;/g, '"')
          .replace(/&apos;/g, "'")
      );
    }
    result.push(parts.join(''));
  }

  return result;
}

// ─── STEP 2+3: Parse sheet XML, resolve shared strings ───────────────────────
// Returns Map<rowNumber, Map<colLetter, cellValue>>
// colLetter is the letter part of the cell ref (e.g. "D" from "D2")
function parseSheet(
  xml: string,
  ss: string[]
): Map<number, Map<string, string>> {
  const sheet = new Map<number, Map<string, string>>();

  // Split on <row to process one row block at a time
  const rowBlocks = xml.split(/<row\b/);

  for (let b = 1; b < rowBlocks.length; b++) {
    const block = rowBlocks[b];

    // Row number from r="N"
    const rowNumMatch = block.match(/\br="(\d+)"/);
    if (!rowNumMatch) continue;
    const rowNum = parseInt(rowNumMatch[1], 10);

    const colMap = new Map<string, string>();

    // Each cell: <c r="D2" t="s"><v>5</v></c>  or  <c r="O2"><v>62999</v></c>
    const cellRegex = /<c\b([^>]*)(?:\/>|>([\s\S]*?)<\/c>)/g;
    let cellMatch: RegExpExecArray | null;

    while ((cellMatch = cellRegex.exec(block)) !== null) {
      const attrs = cellMatch[1];
      const inner = cellMatch[2] ?? '';

      // Cell ref like "D2", "N13"
      const refMatch = attrs.match(/\br="([A-Z]+)(\d+)"/);
      if (!refMatch) continue;
      const colLetters = refMatch[1]; // "D", "N", "AA", etc.

      // Cell type: "s" = shared string index, absent = numeric/other
      const typeMatch = attrs.match(/\bt="([^"]+)"/);
      const cType = typeMatch ? typeMatch[1] : '';

      // Raw value inside <v>…</v>
      const vMatch = inner.match(/<v>([^<]*)<\/v>/);
      const rawVal = vMatch ? vMatch[1] : '';

      let value: string;
      if (cType === 's') {
        // Shared string: rawVal is an integer index into ss[]
        const idx = parseInt(rawVal, 10);
        value = ss[idx] ?? '';
      } else if (cType === 'inlineStr') {
        const tMatch = inner.match(/<t[^>]*>([^<]*)<\/t>/);
        value = tMatch ? tMatch[1] : '';
      } else {
        // Numeric or boolean — use rawVal directly
        value = rawVal;
      }

      colMap.set(colLetters, value);
    }

    sheet.set(rowNum, colMap);
  }

  return sheet;
}

function col(sheet: Map<number, Map<string, string>>, row: number, letter: string): string {
  return sheet.get(row)?.get(letter) ?? '';
}

function titleCase(s: string): string {
  if (!s) return '';
  return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
}

function parseStones(raw: string): string[] {
  if (!raw) return [];
  return raw
    .split(/[,;]+/)
    .map((s) => titleCase(s.trim()))
    .filter(Boolean);
}

// ─── Main handler ─────────────────────────────────────────────────────────────
export async function POST(request: Request) {
  console.log('[upload-products] POST received');
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    if (!file || file.size === 0) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }
    console.log('[upload-products] file:', file.name, 'size:', file.size);

    const zip = await JSZip.loadAsync(await file.arrayBuffer());
    const zipEntries = Object.keys(zip.files);
    console.log('[upload-products] zip entries:', zipEntries.slice(0, 40));

    // ── STEP 1: sharedStrings ────────────────────────────────────────────────
    let ss: string[] = [];
    const ssFile = zip.file('xl/sharedStrings.xml');
    if (ssFile) {
      const ssXml = await ssFile.async('string');
      ss = parseSharedStrings(ssXml);
      console.log('[upload-products] sharedStrings count:', ss.length);
      console.log('[upload-products] first 20 strings:', JSON.stringify(ss.slice(0, 20)));
    } else {
      console.warn('[upload-products] WARNING: no xl/sharedStrings.xml found');
    }

    // ── STEP 2: find sheet XML ───────────────────────────────────────────────
    let sheetXml = '';
    for (const candidate of ['xl/worksheets/sheet1.xml', 'xl/worksheets/Sheet1.xml']) {
      const f = zip.file(candidate);
      if (f) { sheetXml = await f.async('string'); break; }
    }
    if (!sheetXml) {
      const ws = zipEntries.find((e) => /xl\/worksheets\/.*\.xml$/i.test(e));
      if (ws) sheetXml = await zip.file(ws)!.async('string');
    }
    if (!sheetXml) {
      return NextResponse.json({ error: 'No worksheet found in xlsx' }, { status: 400 });
    }
    console.log('[upload-products] sheet XML length:', sheetXml.length);

    // ── STEP 3: parse sheet ──────────────────────────────────────────────────
    const sheet = parseSheet(sheetXml, ss);
    console.log('[upload-products] total rows parsed:', sheet.size);

    // Debug: dump rows 1-4
    for (let r = 1; r <= 4; r++) {
      const rowMap = sheet.get(r);
      if (rowMap) {
        const obj: Record<string, string> = {};
        rowMap.forEach((v, k) => { obj[k] = v; });
        console.log(`[upload-products] row ${r}:`, JSON.stringify(obj));
      }
    }

    // ── STEP 4: extract up to 10 products (rows 2–11) ───────────────────────
    // Row 1 = header. Row N → image(N-1).jpeg
    const products = [];

    for (let i = 0; i < 10; i++) {
      const rowNum = i + 2; // rows 2–11
      const rowMap = sheet.get(rowNum);

      if (!rowMap || rowMap.size === 0) {
        console.log(`[upload-products] row ${rowNum} empty, skipping`);
        continue;
      }

      // ── STEP 3 (column mapping by letter) ───────────────────────────────
      const rawCategory  = col(sheet, rowNum, 'B').trim();   // shared string
      const sku          = col(sheet, rowNum, 'D').trim();   // shared string (t="s")
      const barcode      = col(sheet, rowNum, 'E').trim();   // numeric
      const grossWeight  = parseFloat(col(sheet, rowNum, 'I')) || 0;
      const silverWeight = parseFloat(col(sheet, rowNum, 'J')) || 0;
      const diamondWeight= parseFloat(col(sheet, rowNum, 'K')) || 0;
      const csWeight     = parseFloat(col(sheet, rowNum, 'M')) || 0;
      const rawStones    = col(sheet, rowNum, 'N').trim();   // shared string (t="s")
      const price        = parseFloat(col(sheet, rowNum, 'O')) || 0;

      console.log(
        `[upload-products] row ${rowNum}: sku="${sku}" cat="${rawCategory}"` +
        ` stones="${rawStones}" barcode="${barcode}" price=${price}` +
        ` silver=${silverWeight} diamond=${diamondWeight}`
      );

      const category    = normaliseCategory(rawCategory);
      const stones      = parseStones(rawStones);           // ["Coral","Emrald","Ruby"]
      const stoneName   = stones[0] || '';
      const catLabel    = category.replace(/s$/, '');
      const stoneLabel  = stones.slice(0, 2).join(' ');
      const name        = stoneLabel
        ? `${stoneLabel} ${catLabel}`
        : `Silver ${catLabel}`;

      // Image: row 2 → image1.jpeg, row 3 → image2.jpeg …
      const imageIndex = rowNum - 1;
      let imagePath  = '';
      let imageBase64 = '';

      for (const ext of ['jpeg', 'jpg', 'png']) {
        const imgFile = zip.file(`xl/media/image${imageIndex}.${ext}`);
        if (imgFile) {
          console.log(`[upload-products] found image${imageIndex}.${ext}`);
          const imgAB   = await imgFile.async('arraybuffer');
          const imgBuf  = Buffer.from(imgAB);
          const mime    = ext === 'png' ? 'image/png' : 'image/jpeg';
          const blobExt = ext === 'png' ? 'png' : 'jpeg';
          const blobKey = `products/${sku || `product_${imageIndex}`}.${blobExt}`;
          try {
            const blob = await put(blobKey, imgAB, {
              access: 'public',
              contentType: mime,
              token: process.env.BLOB_READ_WRITE_TOKEN,
            });
            imagePath = blob.url;
            console.log(`[upload-products] blob OK: ${blob.url}`);
          } catch (e: any) {
            console.error('[upload-products] blob FAILED:', e?.message);
          }
          imageBase64 = `data:${mime};base64,${imgBuf.toString('base64')}`;
          break;
        }
      }

      const product = {
        index: i,
        sku,
        barcode,
        category,
        stones,
        stoneName,
        silverWeight,
        diamondWeight,
        grossWeight,
        csWeight,
        price,
        name,
        imagePath,
        imageBase64,
      };

      if (i === 0) console.log('[upload-products] first parsed product:', JSON.stringify({ ...product, imageBase64: product.imageBase64 ? '[base64]' : '' }));

      products.push(product);
    }

    console.log(`[upload-products] returning ${products.length} products`);
    return NextResponse.json({ success: true, products });

  } catch (err: any) {
    console.error('[upload-products] FATAL:', err?.message, err?.stack);
    return NextResponse.json(
      { error: `Failed to process Excel file: ${err?.message ?? 'unknown'}` },
      { status: 500 }
    );
  }
}
