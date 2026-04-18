import { notFound } from 'next/navigation';
import Link from 'next/link';
import { writeClient } from '@/lib/sanity/client';
import ProductDetailClient, { type ProductData, type RelatedProduct } from './ProductDetailClient';

const buildUniqueSlug = (p: {
  mainStoneType?: string;
  category?: string;
  sku?: string;
  _id: string;
}) => {
  const stone = (p.mainStoneType && p.mainStoneType !== 'None' ? p.mainStoneType : 'silver')
    .toLowerCase().replace(/[^a-z0-9]+/g, '-');
  const cat = (p.category || 'jewellery').toLowerCase().replace(/[^a-z0-9]+/g, '-');
  const sku = String(p.sku || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || p._id.slice(-6);
  return `${stone}-${cat}-${sku}`.replace(/-+/g, '-');
};

const PRODUCT_QUERY = `
  *[_type == "product"] {
    _id,
    name,
    "slug": slug.current,
    sku,
    price,
    "category": category->name,
    silverWeight,
    mainStoneType,
    totalCaratWeight,
    diamondColorClarity,
    secondaryStoneType,
    csWeight,
    barcode,
    "images": images[].asset->url,
    description,
    inStock,
    stockQuantity
  }
`;

// Always fetch fresh product data so image updates from bulk upload are instant.
export const dynamic = 'force-dynamic';
export const dynamicParams = true;

export async function generateStaticParams() {
  try {
    const products = await writeClient.fetch<{ _id: string; mainStoneType?: string; category?: string; sku?: string }[]>(
      `*[_type == "product"]{ _id, mainStoneType, "category": category->name, sku }`,
      {},
      { next: { revalidate: 3600 } }
    );
    // Generate both the computed slug AND the raw SKU as valid static paths
    const params: { slug: string }[] = [];
    for (const p of products) {
      params.push({ slug: buildUniqueSlug(p) });
      if (p.sku) params.push({ slug: p.sku });
    }
    return params;
  } catch {
    return [];
  }
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  let products: any[] = [];
  try {
    // Use writeClient (no CDN) so products uploaded after the last build are
    // immediately visible without waiting for CDN cache expiry.
    products = await writeClient.fetch(PRODUCT_QUERY, {}, { cache: 'no-store' });
  } catch {
    // fall through to not-found
  }

  const slugLower = slug.toLowerCase();
  const raw = products.find((p: any) => buildUniqueSlug(p) === slug)
    ?? products.find((p: any) => p.slug === slug)
    // Direct SKU match — enables /products/RNG17288 style URLs
    ?? products.find((p: any) => (p.sku || '').toLowerCase() === slugLower)
    ?? products.find((p: any) =>
        (p.name || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') === slug
      );

  if (!raw) {
    return (
      <div className="pt-32 pb-16 text-center">
        <h1 className="font-serif text-3xl text-charcoal mb-4">Product Not Found</h1>
        <p className="text-charcoal-muted mb-8">The piece you are looking for does not exist.</p>
        <Link href="/products" className="btn-gold">
          Back to Collections
        </Link>
      </div>
    );
  }

  const product: ProductData = {
    _id: raw._id,
    name: raw.name,
    slug: buildUniqueSlug(raw),
    sku: raw.sku,
    price: raw.price,
    category: raw.category || 'Rings',
    silverWeight: raw.silverWeight || 0,
    mainStoneType: raw.mainStoneType || 'None',
    totalCaratWeight: raw.totalCaratWeight || 0,
    diamondColorClarity: raw.diamondColorClarity || '',
    description: raw.description || '',
    inStock: raw.inStock,
    stockQuantity: raw.stockQuantity ?? 1,
    images: raw.images || [],
    secondaryStoneType: raw.secondaryStoneType || '',
    csWeight: raw.csWeight || 0,
    barcode: raw.barcode || '',
  };

  const productSchema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description || `${product.name} — handcrafted 92.5 sterling silver jewellery from Surya Jewellers, Jaipur.`,
    image: product.images[0] ?? 'https://suryajewellers.shop/logo_sj.png',
    sku: product.sku,
    brand: {
      '@type': 'Brand',
      name: 'Surya Jewellers',
    },
    material: '92.5 Sterling Silver',
    offers: {
      '@type': 'Offer',
      url: `https://suryajewellers.shop/products/${product.slug}`,
      priceCurrency: 'INR',
      price: product.price,
      availability: product.inStock
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
      seller: {
        '@type': 'Organization',
        name: 'Surya Jewellers',
      },
    },
  };

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: 'https://suryajewellers.shop',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Collections',
        item: 'https://suryajewellers.shop/products',
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: product.name,
        item: `https://suryajewellers.shop/products/${product.slug}`,
      },
    ],
  };

  const relatedProducts: RelatedProduct[] = products
    .filter((p: any) => p._id !== raw._id && (p.category || 'Rings') === (raw.category || 'Rings'))
    .slice(0, 3)
    .map((p: any) => ({
      _id: p._id,
      name: p.name,
      slug: buildUniqueSlug(p),
      price: p.price,
      images: p.images || [],
      mainStoneType: p.mainStoneType || 'None',
      category: p.category || 'Rings',
    }));

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <ProductDetailClient product={product} relatedProducts={relatedProducts} />
    </>
  );
}
