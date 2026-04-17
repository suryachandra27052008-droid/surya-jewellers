import { NextResponse } from 'next/server';
import JSZip from 'jszip';
import { put } from '@vercel/blob';

// App Router route handlers do NOT need bodyParser config — that is Pages Router only.

const CATEGORY_MAP: Record<string, string> = {
  Ring: 'Rings', Rings: 'Rings',
  Necklace: 'Necklaces', Necklaces: 'Necklaces',
  Bracelet: 'Bracelets', Bracelets: 'Bracelets',
  Earring: 'Earrings', Earrings: 'Earrings',
  Pendant: 'Pendants', Pendants: 'Pendants',
  Bangle: 'Bangles', Bangles: 'Bangles',
  Chain: 'Chains', Chains: 'Chains',
};

// Decode XML character entities
function decodeXml(str: string): string {
  return str
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, c) => String.fromCharCode(parseInt(c, 10)));
}

// Parse xl/sharedStrings.xml into a string lookup array
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

// Convert 0-based column index to Excel letter(s): 0→A, 1→B, 25→Z, 26→AA ...
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

// Convert Excel column letters back to 0-based index: A→0, B→1, AD→29 ...
function colIndex(letters: string): number {
  let idx = 0;
  for (let i = 0; i < letters.length; i++) {
    idx = idx * 26 + (letters.charCodeAt(i) - 64);
  }
  return idx - 1;
}

// Parse xl/worksheets/sheet1.xml into Map<rowNum, Map<colIdx, value>>
function parseSheet(
  xml: string,
  sharedStrings: string[]
): Map<number, Map<number, string>> {
  const sheet = new Map<number, Map<number, string>>();

  // Split on <row so we process each row block independently (avoids nested-tag issues)
  const rowBlocks = xml.split(/<row\b/);
  for (let b = 1; b < rowBlocks.length; b++) {
    const block = rowBlocks[b];

    // Extract row number from r="N" attribute
    const rAttr = block.match(/\br="(\d+)"/);
    if (!rAttr) continue;
    const rowNum = parseInt(rAttr[1], 10);

    const colMap = new Map<number, string>();

    // Match every <c ...> ... </c>  OR  <c ... />
    const cellRe = /<c\b([^>]*)(?:\/>|>([\s\S]*?)<\/c>)/g;
    let cm;
    while ((cm = cellRe.exec(block)) !== null) {
      const attrs = cm[1];
      const inner = cm[2] ?? '';

      // Cell reference e.g. r="AD3"
      const refM = attrs.match(/\br="([A-Z]+)(\d+)"/);
      if (!refM) continue;
      const cIdx = colIndex(refM[1]);

      // Cell type
      const typeM = attrs.match(/\bt="([^"]+)"/);
      const cType = typeM ? typeM[1] : '';

      let value = '';
      if (cType === 's') {
        // Shared string index
        const v = inner.match(/<v>(\d+)<\/v>/);
        if (v) value = sharedStrings[parseInt(v[1], 10)] ?? '';
      } else if (cType === 'inlineStr') {
        const t = inner.match(/<t[^>]*>([^<]*)<\/t>/);
        if (t) value = decodeXml(t[1]);
      } else if (cType === 'str') {
        const v = inner.match(/<v>([^<]*)<\/v>/);
        if (v) value = decodeXml(v[1]);
      } else {
        // Numeric / date / boolean
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

export async function POST(request: Request) {
  console.log('[upload-products] POST received');
  try {
    // ── 1. Read multipart file ────────────────────────────────────────────────
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    console.log('[upload-products] file:', file?.name, 'size:', file?.size);

    if (!file || file.size === 0) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    console.log('[upload-products] buffer bytes:', buffer.length);

    // ── 2. Open xlsx as zip ───────────────────────────────────────────────────
    const zip = await JSZip.loadAsync(buffer);
    const zipEntries = Object.keys(zip.files);
    console.log('[upload-products] zip entries (first 20):', zipEntries.slice(0, 20));

    // ── 3. Parse sharedStrings ────────────────────────────────────────────────
    let sharedStrings: string[] = [];
    const ssFile = zip.file('xl/sharedStrings.xml');
    if (ssFile) {
      const ssXml = await ssFile.async('string');
      sharedStrings = parseSharedStrings(ssXml);
      console.log('[upload-products] sharedStrings count:', sharedStrings.length);
      console.log('[upload-products] sharedStrings[0..9]:', sharedStrings.slice(0, 10));
    } else {
      console.log('[upload-products] no sharedStrings.xml (all-numeric sheet?)');
    }

    // ── 4. Parse sheet1 ───────────────────────────────────────────────────────
    // Try common sheet file locations
    const sheetCandidates = [
      'xl/worksheets/sheet1.xml',
      'xl/worksheets/Sheet1.xml',
    ];
    let sheetXml = '';
    for (const path of sheetCandidates) {
      const f = zip.file(path);
      if (f) { sheetXml = await f.async('string'); break; }
    }
    if (!sheetXml) {
      // Try any file under xl/worksheets/
      const ws = zipEntries.find(e => e.match(/xl\/worksheets\/.*\.xml$/i));
      if (ws) sheetXml = await zip.file(ws)!.async('string');
    }
    if (!sheetXml) {
      console.error('[upload-products] sheet XML not found. Entries:', zipEntries);
      return NextResponse.json({ error: 'Could not locate worksheet in xlsx file' }, { status: 400 });
    }
    console.log('[upload-products] sheet XML length:', sheetXml.length);

    const sheet = parseSheet(sheetXml, sharedStrings);
    console.log('[upload-products] parsed row count:', sheet.size);

    // Log rows 1-7 for debugging
    for (let r = 1; r <= 7; r++) {
      const rowMap = sheet.get(r);
      if (rowMap) {
        const preview: Record<string, string> = {};
        rowMap.forEach((v, k) => { preview[colLetter(k)] = v; });
        console.log(`[upload-products] row ${r}:`, JSON.stringify(preview));
      }
    }

    // ── 5. Extract 5 products from rows 3–7 ──────────────────────────────────
    const products = [];

    for (let i = 0; i < 5; i++) {
      const rowNum = i + 3; // rows 3–7 (rows 1+2 are headers)
      const rowData = sheet.get(rowNum);

      if (!rowData || rowData.size === 0) {
        console.log(`[upload-products] row ${rowNum} empty, skipping`);
        continue;
      }

      // Column mapping (0-based): B=1, D=3, M=12, R=17, AD=29, AI=34
      const rawCategory   = cell(sheet, rowNum, 1).trim();   // B
      const sku           = cell(sheet, rowNum, 3).trim();   // D
      const silverWeight  = parseFloat(cell(sheet, rowNum, 12)) || 0; // M
      const diamondWeight = parseFloat(cell(sheet, rowNum, 17)) || 0; // R
      const rawStone      = cell(sheet, rowNum, 29).trim();  // AD
      const price         = parseFloat(cell(sheet, rowNum, 34)) || 0; // AI

      console.log(`[upload-products] row ${rowNum}: sku="${sku}" cat="${rawCategory}" stone="${rawStone}" price=${price}`);

      const category = CATEGORY_MAP[rawCategory] || rawCategory || 'Rings';
      const stoneName = titleCase(rawStone);
      const categoryLabel = category.replace(/s$/, '');
      const name = stoneName ? `${stoneName} ${categoryLabel}` : `Silver ${categoryLabel}`;

      // ── 7. Extract embedded image and upload to Vercel Blob ──────────────
      const imageIndex = i + 1; // image1 → row 3, image2 → row 4 …
      let imagePath = '';
      let imageBase64 = '';

      for (const ext of ['jpeg', 'jpg', 'png']) {
        const imgFile = zip.file(`xl/media/image${imageIndex}.${ext}`);
        if (imgFile) {
          console.log(`[upload-products] found xl/media/image${imageIndex}.${ext}`);
          const imgBuf = await imgFile.async('nodebuffer');
          const mime = ext === 'png' ? 'image/png' : 'image/jpeg';
          const blobExt = ext === 'jpg' ? 'jpeg' : ext;
          const blobName = `products/${sku || `product_${i + 1}`}.${blobExt}`;

          // Upload to Vercel Blob (falls back to base64 if token not configured)
          if (process.env.BLOB_READ_WRITE_TOKEN) {
            try {
              const blob = await put(blobName, imgBuf, {
                access: 'public',
                contentType: mime,
              });
              imagePath = blob.url;
              console.log(`[upload-products] blob url:`, blob.url);
            } catch (blobErr: any) {
              console.error('[upload-products] blob upload failed:', blobErr?.message);
            }
          } else {
            console.log('[upload-products] BLOB_READ_WRITE_TOKEN not set, using base64 preview only');
          }

          // Always provide base64 for the preview table in the browser
          imageBase64 = `data:${mime};base64,${imgBuf.toString('base64')}`;
          break;
        }
      }

      if (!imagePath && !imageBase64) {
        console.log(`[upload-products] no image found for image${imageIndex} (row ${rowNum})`);
      }

      products.push({ index: i, sku, category, stoneName, silverWeight, diamondWeight, price, name, imagePath, imageBase64 });
    }

    console.log(`[upload-products] returning ${products.length} products`);
    return NextResponse.json({ success: true, products });

  } catch (err: any) {
    console.error('[upload-products] unhandled error:', err?.message);
    console.error('[upload-products] stack:', err?.stack);
    return NextResponse.json(
      { error: `Failed to process Excel file: ${err?.message ?? 'unknown error'}` },
      { status: 500 }
    );
  }
}
