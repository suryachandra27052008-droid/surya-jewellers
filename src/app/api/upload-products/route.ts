import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';
import * as XLSX from 'xlsx';
import AdmZip from 'adm-zip';

const CATEGORY_MAP: Record<string, string> = {
  Ring: 'Rings',
  Rings: 'Rings',
  Necklace: 'Necklaces',
  Necklaces: 'Necklaces',
  Bracelet: 'Bracelets',
  Bracelets: 'Bracelets',
  Earring: 'Earrings',
  Earrings: 'Earrings',
  Pendant: 'Pendants',
  Pendants: 'Pendants',
  Bangle: 'Bangles',
  Bangles: 'Bangles',
  Chain: 'Chains',
  Chains: 'Chains',
};

function formatStoneName(raw: string): string {
  if (!raw) return '';
  return raw.charAt(0).toUpperCase() + raw.slice(1).toLowerCase();
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Parse xlsx spreadsheet
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' }) as any[][];

    // Rows 3–7 are index 2–6 (rows 1 & 2 are headers)
    const productRows = rows.slice(2, 7);

    // Extract images from xlsx zip archive
    const zip = new AdmZip(buffer);

    // Ensure public/products/ directory exists
    const productsDir = join(process.cwd(), 'public', 'products');
    if (!existsSync(productsDir)) {
      await mkdir(productsDir, { recursive: true });
    }

    const products = [];

    for (let i = 0; i < Math.min(productRows.length, 5); i++) {
      const row = productRows[i];

      const sku = String(row[3] || '').trim();
      const rawCategory = String(row[1] || '').trim();
      const category = CATEGORY_MAP[rawCategory] || rawCategory || 'Rings';
      const stoneName = formatStoneName(String(row[29] || '').trim());
      const silverWeight = Number(row[12]) || 0;
      const diamondWeight = Number(row[17]) || 0;
      const price = Number(row[34]) || Number(row[35]) || 0;

      const categoryLabel = category.replace(/s$/, '');
      const name = stoneName ? `${stoneName} ${categoryLabel}` : `Silver ${categoryLabel}`;

      // Extract embedded image (image index starts at 1, maps to row index i+1)
      const imageIndex = i + 1;
      let imagePath = '';
      let imageBase64 = '';
      let imageMime = 'image/jpeg';

      const tryPaths = [
        `xl/media/image${imageIndex}.jpeg`,
        `xl/media/image${imageIndex}.jpg`,
        `xl/media/image${imageIndex}.png`,
      ];

      let imageEntry = null;
      let foundExt = 'jpeg';
      for (const p of tryPaths) {
        imageEntry = zip.getEntry(p);
        if (imageEntry) {
          foundExt = p.endsWith('.png') ? 'png' : 'jpeg';
          imageMime = foundExt === 'png' ? 'image/png' : 'image/jpeg';
          break;
        }
      }

      if (imageEntry) {
        const imageData = imageEntry.getData();
        const filename = `${sku || `product_${i + 1}`}.${foundExt}`;
        await writeFile(join(productsDir, filename), imageData);
        imagePath = `/products/${filename}`;
        imageBase64 = `data:${imageMime};base64,${imageData.toString('base64')}`;
      }

      products.push({
        index: i,
        sku,
        category,
        stoneName,
        silverWeight,
        diamondWeight,
        price,
        name,
        imagePath,
        imageBase64,
      });
    }

    return NextResponse.json({ success: true, products });
  } catch (error) {
    console.error('Excel upload error:', error);
    return NextResponse.json({ error: 'Failed to process Excel file' }, { status: 500 });
  }
}
