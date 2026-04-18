import { NextResponse } from 'next/server';
import JSZip from 'jszip';
import { put } from '@vercel/blob';

const CATEGORY_MAP: Record<string, string> = {
  Ring: 'Rings', Rings: 'Rings', RING: 'Rings', ring: 'Rings',
  Necklace: 'Necklaces', Necklaces: 'Necklaces', NECKLACE: 'Necklaces',
  Bracelet: 'Bracelets', Bracelets: 'Bracelets', BRACELET: 'Bracelets',
  Earring: 'Earrings', Earrings: 'Earrings', EARRING: 'Earrings',
  Pendant: 'Pendants', Pendants: 'Pendants', PENDANT: 'Pendants',
  TOPS: 'Studs', Tops: 'Studs', tops: 'Studs', TOP: 'Studs',
  Stud: 'Studs', Studs: 'Studs', STUDS: 'Studs', STUD: 'Studs',
  Bangle: 'Bangles', Bangles: 'Bangles', BANGLE: 'Bangles',
  Chain: 'Chains', Chains: 'Chains', CHAIN: 'Chains',
};

function decodeXml(str: string): string {
  return str
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, c) => String.fromCharCode(parseInt(c, 10)));
}

function parseSharedStrings(xml: string): string[] {
  const strings: string[] = [];
  const siRe = /<si>([\s\S]*?)<\/si>/g;
  let si;
  while ((si = siRe.exec(xml)) !== null) {
    const parts: string[] = [];
    const tRe = /<t(?:\s[^>]*)?>([^<]*)<\/t>/g;
    let t;
    while ((t = tRe.exec(si[1])) !== null) {
      parts.push(decodeXml(t[1]));
    }
    strings.push(parts.join(''));
  }
  return strings;
}

function colLetter(idx: number): string {
  let s = '';
  let n = idx + 1;
  while (n > 0) {
    const r = (n - 1) % 26;
    s = String.fromCharCode(65 + r) + s;
    n = Math.floor((n - 1) / 26);
  }
  return s;
}

function colIndex(letters: string): number {
  let idx = 0;
  for (let i = 0; i < letters.length; i++) {
    idx = idx * 26 + (letters.charCodeAt(i) - 64);
  }
  return idx - 1;
}

function parseSheet(
  xml: string,
  sharedStrings: string[]
): Map<number, Map<number, string>> {
  const sheet = new Map<number, Map<number, string>>();

  const rowBlocks = xml.split(/<row\b/);
  for (let b = 1; b < rowBlocks.length; b++) {
    const block = rowBlocks[b];

    const rAttr = block.match(/\br="(\d+)"/);
    if (!rAttr) continue;
    const rowNum = parseInt(rAttr[1], 10);

    const colMap = new Map<number, string>();

    const cellRe = /<c\b([^>]*)(?:\/>|>([\s\S]*?)<\/c>)/g;
    let cm;
    while ((cm = cellRe.exec(block)) !== null) {
      const attrs = cm[1];
      const inner = cm[2] ?? '';

      const refM = attrs.match(/\br="([A-Z]+)(\d+)"/);
      if (!refM) continue;
      const cIdx = colIndex(refM[1]);

      const typeM = attrs.match(/\bt="([^"]+)"/);
      const cType = typeM ? typeM[1] : '';

      let value = '';
      if (cType === 's') {
        const v = inner.match(/<v>(\d+)<\/v>/);
        if (v) value = sharedStrings[parseInt(v[1], 10)] ?? '';
      } else if (cType === 'inlineStr') {
        const t = inner.match(/<t[^>]*>([^<]*)<\/t>/);
        if (t) value = decodeXml(t[1]);
      } else if (cType === 'str') {
        const v = inner.match(/<v>([^<]*)<\/v>/);
        if (v) value = decodeXml(v[1]);
      } else {
        const v = inner.match(/<v>([^<]*)<\/v>/);
        if (v) value = v[1];
      }

      colMap.set(cIdx, value);
    }

    sheet.set(rowNum, colMap);
  }

  return sheet;
}

function cell(sheet: Map<number, Map<number, string>>, row: number, col: number): string {
  return sheet.get(row)?.get(col) ?? '';
}

function titleCase(s: string): string {
  if (!s) return '';
  return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
}

// Parse comma-separated stone names like "CORAL, EMRALD, RUBY" → ["Coral", "Emrald", "Ruby"]
function parseStones(raw: string): string[] {
  if (!raw) return [];
  return raw
    .split(/[,;]+/)
    .map((s) => titleCase(s.trim()))
    .filter(Boolean);
}

export async function POST(request: Request) {
  console.log('[upload-products] POST received');
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    console.log('[upload-products] file:', file?.name, 'size:', file?.size);

    if (!file || file.size === 0) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const zip = await JSZip.loadAsync(buffer);
    const zipEntries = Object.keys(zip.files);
    console.log('[upload-products] zip entries (first 30):', zipEntries.slice(0, 30));

    // Parse sharedStrings
    let sharedStrings: string[] = [];
    const ssFile = zip.file('xl/sharedStrings.xml');
    if (ssFile) {
      const ssXml = await ssFile.async('string');
      sharedStrings = parseSharedStrings(ssXml);
      console.log('[upload-products] sharedStrings count:', sharedStrings.length);
      console.log('[upload-products] first 15 sharedStrings:', sharedStrings.slice(0, 15));
    }

    // Find sheet XML
    const sheetCandidates = ['xl/worksheets/sheet1.xml', 'xl/worksheets/Sheet1.xml'];
    let sheetXml = '';
    for (const path of sheetCandidates) {
      const f = zip.file(path);
      if (f) { sheetXml = await f.async('string'); break; }
    }
    if (!sheetXml) {
      const ws = zipEntries.find(e => e.match(/xl\/worksheets\/.*\.xml$/i));
      if (ws) sheetXml = await zip.file(ws)!.async('string');
    }
    if (!sheetXml) {
      return NextResponse.json({ error: 'Could not locate worksheet in xlsx file' }, { status: 400 });
    }

    const sheet = parseSheet(sheetXml, sharedStrings);
    console.log('[upload-products] parsed row count:', sheet.size);

    // Log rows 1-7 to debug column layout
    for (let r = 1; r <= 7; r++) {
      const rowMap = sheet.get(r);
      if (rowMap) {
        const preview: Record<string, string> = {};
        rowMap.forEach((v, k) => { preview[colLetter(k)] = v; });
        console.log(`[upload-products] row ${r}:`, JSON.stringify(preview));
      }
    }

    // ── Column layout (0-based indices) ─────────────────────────────────────
    // A=0  Sno
    // B=1  Category (Ring, Earring, Pendant, TOPS …)  ← shared string
    // C=2  Picture (skip)
    // D=3  SKU (EAR08923, PND11208 …)                 ← shared string
    // E=4  Barcode (42418 …)                           ← number
    // F=5  Metal
    // G=6  Purity
    // H=7  Pcs
    // I=8  Gross Weight
    // J=9  Silver Weight                               ← number
    // K=10 Diamond Weight                              ← number
    // L=11 Pearl Weight                                ← number
    // M=12 CS Weight (colored stone weight)            ← number
    // N=13 CS Name / Stone Names (CORAL, EMRALD …)    ← shared string
    // O=14 Price                                       ← number
    // ─────────────────────────────────────────────────────────────────────────
    // Row 1 = header row (skip)
    // Row 2 = first product  → xl/media/image1.jpeg
    // Row 3 = second product → xl/media/image2.jpeg  etc.
    // ─────────────────────────────────────────────────────────────────────────

    const products = [];

    for (let i = 0; i < 5; i++) {
      const rowNum = i + 2; // rows 2–6 (row 1 is header)
      const rowData = sheet.get(rowNum);

      if (!rowData || rowData.size === 0) {
        console.log(`[upload-products] row ${rowNum} empty, skipping`);
        continue;
      }

      const rawCategory  = cell(sheet, rowNum, 1).trim();   // B
      const sku          = cell(sheet, rowNum, 3).trim();   // D  shared string
      const barcode      = cell(sheet, rowNum, 4).trim();   // E  number stored as string
      const silverWeight = parseFloat(cell(sheet, rowNum, 9))  || 0; // J
      const diamondWeight= parseFloat(cell(sheet, rowNum, 10)) || 0; // K
      const pearlWeight  = parseFloat(cell(sheet, rowNum, 11)) || 0; // L
      const csWeight     = parseFloat(cell(sheet, rowNum, 12)) || 0; // M
      const rawStones    = cell(sheet, rowNum, 13).trim();  // N  shared string
      const price        = parseFloat(cell(sheet, rowNum, 14)) || 0; // O

      console.log(`[upload-products] row ${rowNum}: sku="${sku}" cat="${rawCategory}" stones="${rawStones}" barcode="${barcode}" price=${price}`);

      // Normalise category
      const category = CATEGORY_MAP[rawCategory] || titleCase(rawCategory) || 'Rings';

      // Parse stones
      const stones = parseStones(rawStones); // ["Coral", "Emrald", "Ruby", "Turquoise"]
      const stoneName = stones[0] || '';     // primary stone for backward-compat field

      // Build readable product name
      const categoryLabel = category.replace(/s$/, '');
      const stoneLabel = stones.slice(0, 2).join(' ');
      const name = stoneLabel
        ? `${stoneLabel} ${categoryLabel}`
        : `Silver ${categoryLabel}`;

      // Image: row 2 → image1, row 3 → image2, …
      const imageIndex = rowNum - 1;
      let imagePath = '';
      let imageBase64 = '';

      console.log(`[upload-products] looking for image${imageIndex}`);
      for (const ext of ['jpeg', 'jpg', 'png', 'PNG', 'JPG', 'JPEG']) {
        const imgFile = zip.file(`xl/media/image${imageIndex}.${ext}`);
        if (imgFile) {
          console.log(`[upload-products] found xl/media/image${imageIndex}.${ext}`);
          const imgArrayBuffer = await imgFile.async('arraybuffer');
          const imgBuf = Buffer.from(imgArrayBuffer);
          const mime = ext.toLowerCase() === 'png' ? 'image/png' : 'image/jpeg';
          const blobExt = ext.toLowerCase() === 'png' ? 'png' : 'jpeg';
          const blobKey = `products/${sku || `product_${imageIndex}`}.${blobExt}`;

          try {
            const blob = await put(blobKey, imgArrayBuffer, {
              access: 'public',
              contentType: mime,
              token: process.env.BLOB_READ_WRITE_TOKEN,
            });
            imagePath = blob.url;
            console.log(`[upload-products] blob upload OK: ${blob.url}`);
          } catch (blobErr: any) {
            console.error('[upload-products] blob upload FAILED:', blobErr?.message);
          }

          imageBase64 = `data:${mime};base64,${imgBuf.toString('base64')}`;
          break;
        }
      }

      if (!imagePath && !imageBase64) {
        console.log(`[upload-products] no image found for image${imageIndex}`);
      }

      products.push({
        index: i,
        sku,
        barcode,
        category,
        stones,          // full array: ["Coral", "Emrald", "Ruby"]
        stoneName,       // first stone (backward compat)
        silverWeight,
        diamondWeight,
        pearlWeight,
        csWeight,
        price,
        name,
        imagePath,
        imageBase64,
      });
    }

    console.log(`[upload-products] returning ${products.length} products`);
    return NextResponse.json({ success: true, products });

  } catch (err: any) {
    console.error('[upload-products] unhandled error:', err?.message, err?.stack);
    return NextResponse.json(
      { error: `Failed to process Excel file: ${err?.message ?? 'unknown error'}` },
      { status: 500 }
    );
  }
}
