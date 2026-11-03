import { client } from '@/lib/sanity/client';

export async function GET() {
  try {
    const products = await client.withConfig({ useCdn: false }).fetch(`*[_type == "product" && !(_id in path("drafts.**")) &&
      price >= 1000 && inStock != false && coalesce(stockQuantity, 1) > 0 && defined(slug.current)]
      | order(price asc)[0...16]{_id,name,sku,"slug":slug.current,price,"category":category->name,
        mainStoneType,"images":images[0..0][].asset->url,inStock,stockQuantity}`, {}, { next: { revalidate: 60, tags: ['product-catalog'] } });
    return Response.json({ products }, { headers: { 'Cache-Control': 'no-store' } });
  } catch { return Response.json({ products: [] }, { status: 503 }); }
}
