import { NextResponse } from 'next/server';
import { writeClient, client } from '@/lib/sanity/client';

type ProductUpdateBody = Record<string, unknown>;

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const product = await client.fetch(
      `*[_type == "product" && _id == $id][0] {
        ...,
        "category": category->name,
        "images": images[].asset->url,
        "imageRefs": images[]{ "_key": _key, "assetId": asset._ref }
      }`,
      { id }
    );

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json({ product });
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
    const slugify = (text: string) =>
      text.toLowerCase().replace(/\s+/g, '-').replace(/[^\w\-]+/g, '');

    const safeNum = (v: unknown): number | undefined => {
      if (v === null || v === undefined || v === '' || v === 'NaN' || v === 'undefined') return undefined;
      const n = Number(v);
      return isNaN(n) ? undefined : n;
    };

    const contentType = request.headers.get('content-type') || '';
    let body: ProductUpdateBody;
    let keptImageRefs: { _key: string; assetId: string }[] = [];
    let newImageFiles: File[] = [];

    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      body = {
        name: formData.get('name'),
        sku: formData.get('sku'),
        price: formData.get('price'),
        compareAtPrice: formData.get('compareAtPrice'),
        categoryName: formData.get('categoryName'),
        silverWeight: formData.get('silverWeight'),
        mainStoneType: formData.get('mainStoneType'),
        totalCaratWeight: formData.get('totalCaratWeight'),
        diamondColorClarity: formData.get('diamondColorClarity'),
        secondaryStoneType: formData.get('secondaryStoneType'),
        csWeight: formData.get('csWeight'),
        diamondWeight: formData.get('diamondWeight'),
        grossWeight: formData.get('grossWeight'),
        allStones: formData.get('allStones'),
        barcode: formData.get('barcode'),
        stockQuantity: formData.get('stockQuantity'),
        description: formData.get('description'),
        inStock: formData.get('inStock') === 'true',
        featured: formData.get('featured') === 'true',
      };
      keptImageRefs = JSON.parse((formData.get('keptImageRefs') as string) || '[]');
      newImageFiles = (formData.getAll('images') as File[]).filter((f) => f.size > 0);
    } else {
      body = await request.json();
    }

    const updateData: Record<string, unknown> = {
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
      allStones: body.allStones ? JSON.parse(String(body.allStones)) : undefined,
      barcode: body.barcode || undefined,
      description: body.description,
      stockQuantity: safeNum(body.stockQuantity),
      inStock: body.inStock,
      featured: body.featured,
    };

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
    const keptImages = keptImageRefs.map((ref) => ({
      _key: ref._key,
      _type: 'image',
      asset: { _type: 'reference', _ref: ref.assetId },
    }));

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
    if (allImages.length > 0) {
      updateData.images = allImages;
    }

    const updatedProduct = await writeClient.patch(id).set(updateData).commit();
    return NextResponse.json({ success: true, product: updatedProduct });
  } catch (error) {
    console.error('Failed to update product:', error);
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
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete product:', error);
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 });
  }
}
