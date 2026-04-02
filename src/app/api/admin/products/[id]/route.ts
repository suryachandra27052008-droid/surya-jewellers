import { NextResponse } from 'next/server';
import { writeClient, client } from '@/lib/sanity/client';

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
        "images": images[].asset->url
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
    const body = await request.json();

    // Mapping fields if needed
    const updateData: any = {
      name: body.name,
      sku: body.sku,
      price: Number(body.price),
      compareAtPrice: body.compareAtPrice ? Number(body.compareAtPrice) : undefined,
      silverWeight: Number(body.silverWeight),
      mainStoneType: body.mainStoneType,
      totalCaratWeight: body.totalCaratWeight ? Number(body.totalCaratWeight) : undefined,
      diamondColorClarity: body.diamondColorClarity,
      description: body.description,
      inStock: body.inStock,
      featured: body.featured,
    };

    // If category changed, we need to resolve it
    if (body.categoryName) {
      // Slugify helper
      const slugify = (text: string) =>
        text.toLowerCase().replace(/\s+/g, '-').replace(/[^\w\-]+/g, '');
      
      const categorySlug = slugify(body.categoryName);
      let category = await writeClient.fetch(`*[_type == "category" && slug.current == $slug][0]`, { slug: categorySlug });
      
      if (!category) {
        category = await writeClient.create({
          _type: 'category',
          name: body.categoryName,
          slug: { _type: 'slug', current: categorySlug },
        });
      }
      updateData.category = { _type: 'reference', _ref: category._id };
    }

    // Update the product in Sanity
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
