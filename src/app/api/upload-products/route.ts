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

// ─── sharedStrings parser ─────────────────────────────────────────────────────
function parseSharedStrings(xml: string): string[] {
  const result: string[] = [];
  const siRe = /<si\b[^>]*>([\s\S]*?)<\/si>/g;
  let m: RegExpExecArray | null;
  while ((m = siRe.exec(xml)) !== null) {
    const tRe = /<t(?:\s[^>]*)?>([^<]*)<\/t>/g;
    let t: RegExpExecArray | null;
    const parts: string[] = [];
    while ((t = tRe.exec(m[1])) !== null) {
      parts.push(
        t[1]
          .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
          .replace(/&quot;/g, '"').replace(/&apos;/g, "'")
      );
    }
    result.push(parts.join(''));
  }
  return result;
}

// ─── Sheet parser — returns Map<rowNum, Map<colLetters, resolvedValue>> ────────
function parseSheet(xml: string, ss: string[]): Map<number, Map<string, string>> {
  const sheet = new Map<number, Map<string, string>>();
  const rowBlocks = xml.split(/<row\b/);
  for (let b = 1; b < rowBlocks.length; b++) {
    const block = rowBlocks[b];
    const rowM = block.match(/\br="(\d+)"/);
    if (!rowM) continue;
    const rowNum = parseInt(rowM[1], 10);
    const colMap = new Map<string, string>();
    const cellRe = /<c\b([^>]*)(?:\/>|>([\s\S]*?)<\/c>)/g;
    let cm: RegExpExecArray | null;
    while ((cm = cellRe.exec(block)) !== null) {
      const attrs = cm[1]; const inner = cm[2] ?? '';
      const refM = attrs.match(/\br="([A-Z]+)(\d+)"/);
      if (!refM) continue;
      const colLetters = refM[1];
      const typeM = attrs.match(/\bt="([^"]+)"/);
      const cType = typeM ? typeM[1] : '';
      const vM = inner.match(/<v>([^<]*)<\/v>/);
      const rawVal = vM ? vM[1] : '';
      let value: string;
      if (cType === 's') { value = ss[parseInt(rawVal, 10)] ?? ''; }
      else if (cType === 'inlineStr') { const tM = inner.match(/<t[^>]*>([^<]*)<\/t>/); value = tM ? tM[1] : ''; }
      else { value = rawVal; }
      colMap.set(colLetters, value);
    }
    sheet.set(rowNum, colMap);
  }
  return sheet;
}

function col(sheet: Map<number, Map<string, string>>, row: number, letter: string): string {
  return sheet.get(row)?.get(letter) ?? '';
}

// ─── Dynamic column detection ─────────────────────────────────────────────────
// Scans a header row and maps field names to column letters.
// Falls back to hardcoded letters (from 329.xlsx structure) if not found.
const HEADER_PATTERNS: { field: string; re: RegExp }[] = [
  { field: 'sku',           re: /^sku$/i },
  { field: 'category',      re: /^code$/i },
  { field: 'grossWeight',   re: /gross\s*wt/i },
  { field: 'silverWeight',  re: /silver\s*wt/i },
  { field: 'diamondWeight', re: /diam(ond)?\s*wt|dia\s*wt/i },
  { field: 'csWeight',      re: /cs\s*wt|colou?red\s*stone\s*wt/i },
  { field: 'stoneName',     re: /cs\s*name|stone\s*name/i },
  { field: 'barcode',       re: /barcode|bar\s*code/i },
  { field: 'price',         re: /amount|total\s*rs|^price$|^mrp$/i },
];

const FALLBACK_COLS: Record<string, string> = {
  category:     'B',
  sku:          'D',
  grossWeight:  'H',
  silverWeight: 'M',
  diamondWeight:'R',
  csWeight:     'AA',
  stoneName:    'AD',
  barcode:      'AI',
  price:        'AJ',
};

function detectColumns(
  sheet: Map<number, Map<string, string>>,
  candidateRows: number[]
): { colMap: Record<string, string>; headerRow: number } {
  let best: Record<string, string> = {};
  let bestCount = 0;
  let headerRow = candidateRows[0];

  for (const rowNum of candidateRows) {
    const rowMap = sheet.get(rowNum);
    if (!rowMap) continue;
    const found: Record<string, string> = {};
    rowMap.forEach((cellValue, colLetter) => {
      const v = cellValue.trim();
      if (!v) return;
      for (const { field, re } of HEADER_PATTERNS) {
        if (!found[field] && re.test(v)) {
          found[field] = colLetter;
        }
      }
    });
    if (Object.keys(found).length > bestCount) {
      bestCount = Object.keys(found).length;
      best = found;
      headerRow = rowNum;
    }
  }

  // Merge with fallbacks for any field not found
  const colMap: Record<string, string> = { ...FALLBACK_COLS, ...best };
  return { colMap, headerRow };
}

function titleCase(s: string): string {
  if (!s) return '';
  return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
}
function parseStones(raw: string): string[] {
  if (!raw) return [];
  return raw.split(/[,;]+/).map((s) => titleCase(s.trim())).filter(Boolean);
}

// ─── Debug helper ─────────────────────────────────────────────────────────────
function dumpRow(
  sheetXml: string,
  sheet: Map<number, Map<string, string>>,
  rowNum: number
): { ref: string; type: string; rawVal: string; resolved: string }[] {
  const cells: { ref: string; type: string; rawVal: string; resolved: string }[] = [];
  const rowPattern = new RegExp(`<row\\b[^>]*\\br="${rowNum}"[^>]*>([\\s\\S]*?)<\\/row>`);
  const rowM = sheetXml.match(rowPattern);
  if (!rowM) return cells;
  const cellRe = /<c\b([^>]*)(?:\/>|>([\s\S]*?)<\/c>)/g;
  let cm: RegExpExecArray | null;
  while ((cm = cellRe.exec(rowM[1])) !== null) {
    const attrs = cm[1]; const inner = cm[2] ?? '';
    const refM = attrs.match(/\br="([A-Z]+\d+)"/);
    const typeM = attrs.match(/\bt="([^"]+)"/);
    const vM = inner.match(/<v>([^<]*)<\/v>/);
    const ref = refM ? refM[1] : '?';
    const type = typeM ? typeM[1] : '(numeric)';
    const rawVal = vM ? vM[1] : '';
    const colLetter = ref.replace(/\d+/g, '');
    const resolved = sheet.get(rowNum)?.get(colLetter) ?? '';
    cells.push({ ref, type, rawVal, resolved });
  }
  return cells;
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

    // ── sharedStrings ────────────────────────────────────────────────────────
    let ss: string[] = [];
    const ssFile = zip.file('xl/sharedStrings.xml');
    if (ssFile) {
      ss = parseSharedStrings(await ssFile.async('string'));
      console.log('[upload-products] sharedStrings count:', ss.length);
      console.log('[upload-products] first 30:', JSON.stringify(ss.slice(0, 30)));
    } else {
      console.warn('[upload-products] WARNING: no sharedStrings.xml');
    }

    // ── Find sheet XML ───────────────────────────────────────────────────────
    let sheetXml = '';
    for (const c of ['xl/worksheets/sheet1.xml', 'xl/worksheets/Sheet1.xml']) {
      const f = zip.file(c); if (f) { sheetXml = await f.async('string'); break; }
    }
    if (!sheetXml) {
      const ws = zipEntries.find((e) => /xl\/worksheets\/.*\.xml$/i.test(e));
      if (ws) sheetXml = await zip.file(ws)!.async('string');
    }
    if (!sheetXml) return NextResponse.json({ error: 'No worksheet found' }, { status: 400 });
    console.log('[upload-products] sheet XML length:', sheetXml.length);

    // ── Parse sheet ──────────────────────────────────────────────────────────
    const sheet = parseSheet(sheetXml, ss);
    console.log('[upload-products] rows parsed:', sheet.size);

    // ── Dynamic column detection — scan rows 1 and 2 for headers ────────────
    const { colMap, headerRow } = detectColumns(sheet, [1, 2]);
    const dataStartRow = headerRow + 1;
    console.log('[upload-products] detected headerRow:', headerRow);
    console.log('[upload-products] detected colMap:', JSON.stringify(colMap));

    // ── Debug info ───────────────────────────────────────────────────────────
    const debugInfo = {
      sharedStringsTotal: ss.length,
      first30SharedStrings: ss.slice(0, 30),
      detectedHeaderRow: headerRow,
      detectedColumns: colMap,
      row1Cells: dumpRow(sheetXml, sheet, 1),
      row2Cells: dumpRow(sheetXml, sheet, 2),
      row3Cells: dumpRow(sheetXml, sheet, 3),
    };
    console.log('[upload-products] row2Cells:', JSON.stringify(debugInfo.row2Cells));
    console.log('[upload-products] row3Cells:', JSON.stringify(debugInfo.row3Cells));

    // ── Extract up to 10 products ────────────────────────────────────────────
    // imageIndex = rowNum - dataStartRow + 1
    // e.g. dataStartRow=3: row3→image1, row4→image2 …
    const products = [];

    for (let i = 0; i < 10; i++) {
      const rowNum = dataStartRow + i;
      const rowMap = sheet.get(rowNum);
      if (!rowMap || rowMap.size === 0) {
        console.log(`[upload-products] row ${rowNum} empty, skipping`);
        continue;
      }

      const rawCategory   = col(sheet, rowNum, colMap.category).trim();
      const sku           = col(sheet, rowNum, colMap.sku).trim();
      const grossWeight   = parseFloat(col(sheet, rowNum, colMap.grossWeight))   || 0;
      const silverWeight  = parseFloat(col(sheet, rowNum, colMap.silverWeight))  || 0;
      const diamondWeight = parseFloat(col(sheet, rowNum, colMap.diamondWeight)) || 0;
      const csWeight      = parseFloat(col(sheet, rowNum, colMap.csWeight))      || 0;
      const rawStones     = col(sheet, rowNum, colMap.stoneName).trim();
      const barcode       = col(sheet, rowNum, colMap.barcode).trim();
      const price         = parseFloat(col(sheet, rowNum, colMap.price))         || 0;

      console.log(
        `[upload-products] row ${rowNum}: sku="${sku}" cat="${rawCategory}"` +
        ` stones="${rawStones}" barcode="${barcode}" price=${price}` +
        ` silver=${silverWeight} diamond=${diamondWeight} cs=${csWeight}`
      );

      const category   = normaliseCategory(rawCategory);
      const stones     = parseStones(rawStones);
      const stoneName  = stones[0] || '';
      const catLabel   = category.replace(/s$/, '');
      const stoneLabel = stones.slice(0, 2).join(' ');
      const name       = stoneLabel ? `${stoneLabel} ${catLabel}` : `Silver ${catLabel}`;

      const imageIndex = rowNum - dataStartRow + 1;
      let imagePath = '', imageBase64 = '';
      for (const ext of ['jpeg', 'jpg', 'png']) {
        const imgFile = zip.file(`xl/media/image${imageIndex}.${ext}`);
        if (imgFile) {
          console.log(`[upload-products] found image${imageIndex}.${ext}`);
          const imgAB  = await imgFile.async('arraybuffer');
          const imgBuf = Buffer.from(imgAB);
          const mime   = ext === 'png' ? 'image/png' : 'image/jpeg';
          const blobKey = `products/${sku || `product_${imageIndex}`}.${ext === 'png' ? 'png' : 'jpeg'}`;
          try {
            const blob = await put(blobKey, imgAB, { access: 'public', contentType: mime, token: process.env.BLOB_READ_WRITE_TOKEN });
            imagePath = blob.url;
            console.log(`[upload-products] blob OK: ${blob.url}`);
          } catch (e: any) { console.error('[upload-products] blob FAILED:', e?.message); }
          imageBase64 = `data:${mime};base64,${imgBuf.toString('base64')}`;
          break;
        }
      }

      const product = { index: i, sku, barcode, category, stones, stoneName, silverWeight, diamondWeight, grossWeight, csWeight, price, name, imagePath, imageBase64 };
      if (i === 0) console.log('[upload-products] product[0]:', JSON.stringify({ ...product, imageBase64: product.imageBase64 ? '[base64]' : '' }));
      products.push(product);
    }

    console.log(`[upload-products] returning ${products.length} products`);
    return NextResponse.json({ success: true, products, debugInfo });

  } catch (err: any) {
    console.error('[upload-products] FATAL:', err?.message, err?.stack);
    return NextResponse.json({ error: `Failed to process Excel file: ${err?.message ?? 'unknown'}` }, { status: 500 });
  }
}
