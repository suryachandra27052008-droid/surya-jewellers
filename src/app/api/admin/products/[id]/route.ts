import { NextResponse } from 'next/server';
import { writeClient } from '@/lib/sanity/client';
import { invalidateProductCatalog } from '@/lib/server/catalog-cache';
import { normalizeProductContent, normalizeProductStock } from '@/lib/product-admin-input';

type ProductUpdateBody = Record<string, unknown>;

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const product = await writeClient.fetch(
      `*[_type == "product" && _id == $id][0] {
        ...,
        "category": category->name,
        "images": images[].asset->url,
        "imageRefs": images[]{ "_key": _key, "assetId": asset._ref },
        "imageEntries": images[]{ "_key": _key, "assetId": asset._ref, "url": asset->url }
      }`,
      { id }, { cache: 'no-store' }
    );

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json({ product }, { headers: { 'Cache-Control': 'private, no-store' } });
  } catch (error) {
    console.error('Failed to fetch product:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const current = await writeClient.getDocument<{ _type: string; _rev: string; inStock?: boolean; stockQuantity?: number; images?: Array<{ _key: string; _type: string; asset: { _type: string; _ref: string }; [key: string]: unknown }> }>(id);
    if (!current || current._type !== 'product') return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    const slugify = (text: string) =>
      text.toLowerCase().replace(/\s+/g, '-').replace(/[^\w\-]+/g, '');

    const safeNum = (v: unknown): number | undefined => {
      if (v === null || v === undefined || v === '' || v === 'NaN' || v === 'undefined') return undefined;
      const n = Number(v);
      return Number.isFinite(n) ? n : undefined;
    };

    const contentType = request.headers.get('content-type') || '';
    let body: ProductUpdateBody;
    let keptImageRefs: { _key: string; assetId: string }[] = [];
    let newImageFiles: File[] = [];
    let imagesProvided = false;

    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      body = {};
      for (const key of ['name', 'sku', 'price', 'compareAtPrice', 'categoryName', 'silverWeight', 'mainStoneType',
        'totalCaratWeight', 'diamondColorClarity', 'secondaryStoneType', 'csWeight', 'diamondWeight',
        'grossWeight', 'allStones', 'barcode', 'stockQuantity', 'description', 'revision']) {
        if (formData.has(key)) body[key] = formData.get(key);
      }
      for (const key of ['inStock', 'featured']) if (formData.has(key)) body[key] = formData.get(key) === 'true';
      imagesProvided = formData.has('keptImageRefs') || formData.has('images');
      keptImageRefs = JSON.parse((formData.get('keptImageRefs') as string) || '[]');
      newImageFiles = formData.getAll('images').filter((file): file is File => file instanceof File && file.size > 0);
    } else {
      body = await request.json();
      imagesProvided = Object.hasOwn(body, 'keptImageRefs');
      if (imagesProvided) keptImageRefs = body.keptImageRefs as typeof keptImageRefs;
    }
    if (body.revision && body.revision !== current._rev) {
      return NextResponse.json({ error: 'This product changed since you opened it. Reload the editor before saving.' }, { status: 409 });
    }
    if ((imagesProvided || Object.hasOwn(body, 'price')) && !body.revision) {
      return NextResponse.json({ error: 'Reload the product editor before changing prices or images.' }, { status: 409 });
    }

    let updateData: Record<string, unknown> = {
      name: body.name,
      sku: body.sku,
      price: Number(body.price),
      compareAtPrice: safeNum(body.compareAtPrice),
      silverWeight: Number(body.silverWeight),
      mainStoneType: body.mainStoneType,
      totalCaratWeight: safeNum(body.totalCaratWeight),
      diamondColorClarity: body.diamondColorClarity || undefined,
      secondaryStoneType: body.secondaryStoneType || undefined,
      csWeight: safeNum(body.csWeight),
      diamondWeight: safeNum(body.diamondWeight),
      grossWeight: safeNum(body.grossWeight),
      allStones: Array.isArray(body.allStones) ? body.allStones : body.allStones ? JSON.parse(String(body.allStones)) : undefined,
      barcode: body.barcode || undefined,
      description: body.description,
      stockQuantity: safeNum(body.stockQuantity),
      inStock: body.inStock,
      featured: body.featured,
    };
    // Image-only or stock-only updates must never reset prices or other fields.
    for (const key of Object.keys(updateData)) {
      if (!Object.hasOwn(body, key) || updateData[key] === undefined) delete updateData[key];
    }
    if ('price' in updateData && (!Number.isFinite(updateData.price) || Number(updateData.price) <= 0)) {
      return NextResponse.json({ error: 'Enter a valid positive product price.' }, { status: 400 });
    }
    if (Object.hasOwn(body, 'stockQuantity') && !Object.hasOwn(updateData, 'stockQuantity')) {
      return NextResponse.json({ error: 'Available pieces must be a whole number of zero or more.' }, { status: 400 });
    }
    try {
      updateData = normalizeProductStock(normalizeProductContent(updateData), current);
    } catch (error) {
      return NextResponse.json({ error: (error as Error).message }, { status: 400 });
    }

    const categoryName = body.categoryName ?? body.category;
    if (categoryName) {
      const categoryNameText = String(categoryName);
      const categorySlug = slugify(categoryNameText);
      let category = await writeClient.fetch(`*[_type == "category" && slug.current == $slug][0]`, { slug: categorySlug });
      if (!category) {
        category = await writeClient.create({
          _type: 'category',
          name: categoryNameText,
          slug: { _type: 'slug', current: categorySlug },
        });
      }
      updateData.category = { _type: 'reference', _ref: category._id };
    }

    // Rebuild images array: kept existing refs + newly uploaded
    if (!Array.isArray(keptImageRefs) || keptImageRefs.length + newImageFiles.length > 5 ||
      keptImageRefs.some(ref => !ref || typeof ref._key !== 'string' || typeof ref.assetId !== 'string') ||
      new Set(keptImageRefs.map(ref => ref._key)).size !== keptImageRefs.length) {
      return NextResponse.json({ error: 'Invalid image selection. Reload the editor and try again.' }, { status: 400 });
    }
    const keptImages = keptImageRefs.map(ref => (current.images || []).find(image => image._key === ref._key && image.asset?._ref === ref.assetId));
    if (keptImages.some(image => !image)) {
      return NextResponse.json({ error: 'An image changed since you opened this product. Reload the editor before saving.' }, { status: 409 });
    }

    const uploadedImages = [];
    for (let i = 0; i < newImageFiles.length; i++) {
      const file = newImageFiles[i];
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const asset = await writeClient.assets.upload('image', buffer, { filename: file.name });
      uploadedImages.push({
        _key: `img-${Date.now()}-${i}`,
        _type: 'image',
        asset: { _type: 'reference', _ref: asset._id },
      });
    }

    const allImages = [...keptImages, ...uploadedImages];
    if (imagesProvided) {
      updateData.images = allImages;
    }

    const updatedProduct = await writeClient.patch(id).ifRevisionId(current._rev).set(updateData).commit({ visibility: 'sync' });
    invalidateProductCatalog();
    return NextResponse.json({ success: true, product: updatedProduct }, { headers: { 'Cache-Control': 'private, no-store' } });
  } catch (error) {
    console.error('Failed to update product:', error);
    if ((error as { statusCode?: number }).statusCode === 409) return NextResponse.json({ error: 'This product changed while saving. Reload the editor before trying again.' }, { status: 409 });
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await writeClient.delete(id);
    invalidateProductCatalog();
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete product:', error);
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 });
  }
}
