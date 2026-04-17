import { NextResponse } from 'next/server';
import { writeClient } from '@/lib/sanity/client';

const slugify = (text: string) =>
  text
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');

function mapStoneType(stoneName: string): string | undefined {
  if (!stoneName) return undefined;
  const s = stoneName.toLowerCase();
  if (s.includes('diamond')) return 'Diamond';
  if (s.includes('ruby')) return 'Ruby';
  if (s.includes('emerald') || s.includes('emrald')) return 'Emerald';
  if (s.includes('sapphire')) return 'Sapphire';
  return undefined;
}

interface BulkProduct {
  index: number;
  sku: string;
  category: string;
  stoneName: string;
  silverWeight: number;
  diamondWeight: number;
  price: number;
  name: string;
  imagePath: string;   // Vercel Blob URL (or empty)
  imageBase64: string; // data:image/jpeg;base64,... — always present for Sanity upload
}

// Get raw image buffer from whatever source is available
async function getImageBuffer(product: BulkProduct): Promise<{ buffer: Buffer; ext: string } | null> {
  // Prefer base64 (already in memory, no extra fetch needed)
  if (product.imageBase64) {
    const match = product.imageBase64.match(/^data:(image\/(\w+));base64,(.+)$/);
    if (match) {
      const ext = match[2] === 'png' ? 'png' : 'jpeg';
      const buffer = Buffer.from(match[3], 'base64');
      console.log(`[bulk] decoded base64 for ${product.sku}: ${buffer.length} bytes`);
      return { buffer, ext };
    }
  }

  // Fallback: fetch from Vercel Blob URL
  if (product.imagePath?.startsWith('http')) {
    console.log(`[bulk] fetching image from blob URL: ${product.imagePath}`);
    try {
      const res = await fetch(product.imagePath);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const ab = await res.arrayBuffer();
      const buffer = Buffer.from(ab);
      const ext = product.imagePath.endsWith('.png') ? 'png' : 'jpeg';
      console.log(`[bulk] fetched blob image for ${product.sku}: ${buffer.length} bytes`);
      return { buffer, ext };
    } catch (err: any) {
      console.error(`[bulk] failed to fetch blob image for ${product.sku}:`, err?.message);
    }
  }

  console.warn(`[bulk] no image source available for ${product.sku}`);
  return null;
}

export async function POST(request: Request) {
  console.log('[bulk] POST received');
  try {
    const body = await request.json() as { products: BulkProduct[] };
    const products = body.products;

    if (!products || products.length === 0) {
      return NextResponse.json({ error: 'No products provided' }, { status: 400 });
    }

    console.log(`[bulk] processing ${products.length} products`);

    const created: string[] = [];
    const errors: string[] = [];

    for (const product of products) {
      console.log(`[bulk] processing product: sku=${product.sku} name="${product.name}" price=${product.price}`);
      try {
        // 1. Resolve or create category
        const categorySlug = slugify(product.category);
        let category = await writeClient.fetch(
          `*[_type == "category" && slug.current == $slug][0]`,
          { slug: categorySlug }
        );
        if (!category) {
          console.log(`[bulk] creating category: ${product.category}`);
          category = await writeClient.create({
            _type: 'category',
            name: product.category,
            slug: { _type: 'slug', current: categorySlug },
          });
        }
        console.log(`[bulk] category resolved: ${category._id}`);

        // 2. Upload image to Sanity
        // Use base64 payload (always available) so no filesystem reads are needed.
        // This works on Vercel serverless where the filesystem is read-only.
        const uploadedImages: any[] = [];
        const imgSource = await getImageBuffer(product);

        if (imgSource) {
          try {
            const asset = await writeClient.assets.upload('image', imgSource.buffer, {
              filename: `${product.sku}.${imgSource.ext}`,
            });
            console.log(`[bulk] image uploaded to Sanity: ${asset._id}`);
            uploadedImages.push({
              _key: `img-${Date.now()}-${product.index}`,
              _type: 'image',
              asset: { _type: 'reference', _ref: asset._id },
            });
          } catch (imgErr: any) {
            console.error(`[bulk] Sanity image upload failed for ${product.sku}:`, imgErr?.message);
            errors.push(`${product.sku}: image upload to Sanity failed — ${imgErr?.message}`);
            continue;
          }
        } else {
          console.warn(`[bulk] skipping ${product.sku} — no image`);
          errors.push(`${product.sku}: no image available`);
          continue;
        }

        // 3. Create product document in Sanity
        const productSlug = slugify(`${product.name}-${product.sku}`);
        const newProduct = await writeClient.create({
          _type: 'product',
          name: product.name,
          slug: { _type: 'slug', current: productSlug },
          sku: product.sku,
          price: product.price,
          category: { _type: 'reference', _ref: category._id },
          silverWeight: product.silverWeight,
          mainStoneType: mapStoneType(product.stoneName),
          totalCaratWeight: product.diamondWeight || undefined,
          images: uploadedImages,
          description: '',
          stockQuantity: 1,
          inStock: true,
          featured: false,
        });

        console.log(`[bulk] product created in Sanity: ${newProduct._id}`);
        created.push(newProduct._id);

      } catch (productErr: any) {
        console.error(`[bulk] failed for ${product.sku}:`, productErr?.message);
        errors.push(`${product.sku}: ${productErr?.message ?? 'creation failed'}`);
      }
    }

    console.log(`[bulk] done — created: ${created.length}, errors: ${errors.length}`);
    return NextResponse.json({ success: true, created: created.length, errors });

  } catch (error: any) {
    console.error('[bulk] unhandled error:', error?.message, error?.stack);
    return NextResponse.json({ error: `Bulk upload failed: ${error?.message ?? 'unknown'}` }, { status: 500 });
  }
}
