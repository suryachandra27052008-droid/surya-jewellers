import { NextResponse } from 'next/server';
import { writeClient } from '@/lib/sanity/client';
import { join } from 'path';
import { readFile } from 'fs/promises';

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
  imagePath: string;
  imageBase64: string;
}

export async function POST(request: Request) {
  try {
    const { products } = (await request.json()) as { products: BulkProduct[] };

    if (!products || products.length === 0) {
      return NextResponse.json({ error: 'No products provided' }, { status: 400 });
    }

    const created: string[] = [];
    const errors: string[] = [];

    for (const product of products) {
      try {
        // Resolve or create category
        const categorySlug = slugify(product.category);
        let category = await writeClient.fetch(
          `*[_type == "category" && slug.current == $slug][0]`,
          { slug: categorySlug }
        );
        if (!category) {
          category = await writeClient.create({
            _type: 'category',
            name: product.category,
            slug: { _type: 'slug', current: categorySlug },
          });
        }

        // Upload image to Sanity from public/products/
        const uploadedImages: any[] = [];
        if (product.imagePath) {
          try {
            const localPath = join(process.cwd(), 'public', product.imagePath);
            const imageBuffer = await readFile(localPath);
            const ext = product.imagePath.endsWith('.png') ? 'png' : 'jpeg';
            const asset = await writeClient.assets.upload('image', imageBuffer, {
              filename: `${product.sku}.${ext}`,
            });
            uploadedImages.push({
              _key: `img-${Date.now()}-${product.index}`,
              _type: 'image',
              asset: { _type: 'reference', _ref: asset._id },
            });
          } catch (imgErr) {
            console.error('Image upload failed for', product.sku, imgErr);
          }
        }

        if (uploadedImages.length === 0) {
          errors.push(`${product.sku}: no image available`);
          continue;
        }

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

        created.push(newProduct._id);
      } catch (productErr) {
        console.error('Failed to create product', product.sku, productErr);
        errors.push(`${product.sku}: creation failed`);
      }
    }

    return NextResponse.json({ success: true, created: created.length, errors });
  } catch (error) {
    console.error('Bulk upload error:', error);
    return NextResponse.json({ error: 'Bulk upload failed' }, { status: 500 });
  }
}
