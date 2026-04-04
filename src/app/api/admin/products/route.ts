import { NextResponse } from 'next/server';
import { writeClient, client } from '@/lib/sanity/client';

// Helper to create a slug
const slugify = (text: string) =>
  text
    .toString()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');

export async function GET() {
  try {
    // Fetch products from Sanity
    const products = await client.fetch(`
      *[_type == "product"] | order(_createdAt desc) {
        _id,
        name,
        sku,
        price,
        compareAtPrice,
        "category": category->name,
        silverWeight,
        mainStoneType,
        totalCaratWeight,
        diamondColorClarity,
        "images": images[].asset->url,
        description,
        inStock,
        featured,
        _createdAt,
        _updatedAt
      }
    `);
    
    // Validate and map fields for frontend store
    const formattedProducts = products.map((p: any) => ({
      ...p,
      images: p.images || [],
      createdAt: p._createdAt,
      updatedAt: p._updatedAt,
    }));

    return NextResponse.json({ products: formattedProducts, total: formattedProducts.length });
  } catch (error) {
    console.error('Failed to fetch products', error);
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const contentType = request.headers.get('content-type') || '';
    if (!contentType.includes('multipart/form-data')) {
      return NextResponse.json({ error: 'Expected multipart/form-data' }, { status: 400 });
    }

    const formData = await request.formData();
    console.log('--- Product Creation Started ---');
    console.log('Fields received:', Array.from(formData.keys()));

    // Extract text fields
    const productData = {
      name: formData.get('name') as string,
      sku: formData.get('sku') as string,
      price: Number(formData.get('price')),
      compareAtPrice: formData.get('compareAtPrice') ? Number(formData.get('compareAtPrice')) : undefined,
      categoryName: formData.get('category') as string,
      silverWeight: Number(formData.get('silverWeight')),
      mainStoneType: (formData.get('mainStoneType') as string) || undefined,
      totalCaratWeight: formData.get('totalCaratWeight') ? Number(formData.get('totalCaratWeight')) : undefined,
      diamondColorClarity: (formData.get('diamondColorClarity') as string) || undefined,
      description: (formData.get('description') as string) || '',
      stockQuantity: formData.get('stockQuantity') ? Number(formData.get('stockQuantity')) : 1,
      inStock: formData.get('inStock') === 'true',
      featured: formData.get('featured') === 'true',
    };

    if (!productData.name || !productData.sku || !productData.price || !productData.categoryName) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // 1. Resolve Category
    const categorySlug = slugify(productData.categoryName);
    let category = await writeClient.fetch(`*[_type == "category" && slug.current == $slug][0]`, { slug: categorySlug });
    if (!category) {
      category = await writeClient.create({
        _type: 'category',
        name: productData.categoryName,
        slug: { _type: 'slug', current: categorySlug },
      });
    }

    // 2. Upload images to Sanity
    const imageFiles = formData.getAll('images') as File[];
    const uploadedImages = [];

    for (let i = 0; i < imageFiles.length; i++) {
        const file = imageFiles[i];
        if (file.size === 0) continue;
        
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        
        const asset = await writeClient.assets.upload('image', buffer, {
          filename: file.name
        });
        
        uploadedImages.push({
          _key: `img-${Date.now()}-${i}`,
          _type: 'image',
          asset: { _type: 'reference', _ref: asset._id }
        });
        console.log(`Image ${i+1} uploaded successfully:`, asset._id);
    }

    // Default placeholder if no images
    if (uploadedImages.length === 0) {
       return NextResponse.json({ error: 'At least one image is required.' }, { status: 400 });
    }

    // 3. Create Product
    const newProduct = await writeClient.create({
      _type: 'product',
      name: productData.name,
      slug: { _type: 'slug', current: slugify(productData.name) },
      sku: productData.sku,
      price: productData.price,
      compareAtPrice: productData.compareAtPrice,
      category: { _type: 'reference', _ref: category._id },
      silverWeight: productData.silverWeight,
      mainStoneType: productData.mainStoneType,
      totalCaratWeight: productData.totalCaratWeight,
      diamondColorClarity: productData.diamondColorClarity,
      images: uploadedImages,
      description: productData.description,
      stockQuantity: productData.stockQuantity,
      featured: productData.featured,
      inStock: productData.inStock,
    });

    console.log('Product created successfully in Sanity:', newProduct._id);
    return NextResponse.json({ success: true, product: newProduct }, { status: 201 });
  } catch (error) {
    console.error('Product creation error:', error);
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
  }
}
