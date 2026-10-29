import { client } from '@/lib/sanity/client';
import { validProductId, RECENTLY_VIEWED_LIMIT } from '@/lib/recently-viewed';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const raw = url.searchParams.get('ids');
  if (raw !== null && raw.length > RECENTLY_VIEWED_LIMIT * 129) {
    return Response.json({ error: 'Invalid product selection.' }, { status: 400 });
  }
  const ids = raw === null ? null : [...new Set(raw.split(','))];
  if (ids && (!ids.length || ids.length > RECENTLY_VIEWED_LIMIT || ids.some(id => !validProductId(id)))) {
    return Response.json({ error: 'Invalid product selection.' }, { status: 400 });
  }
  try {
    const products = await client.fetch(
      `*[_type == "product" && !(_id in path("drafts.**")) && price >= 1000 && ${ids ? '_id in $ids' : 'inStock != false && coalesce(stockQuantity, 1) > 0'}]
        | order(_createdAt desc) { _id, name, "slug": slug.current, sku, price,
          "category": category->name, silverWeight, mainStoneType, secondaryStoneType,
          "images": images[0..0][].asset->url, inStock, stockQuantity, _createdAt }`,
      ids ? { ids } : {}, { next: { revalidate: 60 } },
    );
    return Response.json({ products }, { headers: { 'Cache-Control': 'public, max-age=0, s-maxage=60' } });
  } catch {
    return Response.json({ error: 'The catalogue is temporarily unavailable.' }, { status: 503 });
  }
}
