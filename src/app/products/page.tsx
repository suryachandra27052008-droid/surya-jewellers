import type { Metadata } from 'next';
import { Suspense } from 'react';
import { client } from '@/lib/sanity/client';
import ProductsClient, { type InitialProduct } from './ProductsClient';
import { getProductCanonicalSlug, SITE_URL } from '@/lib/seo/product';

export const metadata: Metadata = {
  title: { absolute: 'Collections — 92.5 Sterling Silver | Surya Jewellers' },
  description:
    'Handcrafted 92.5 sterling silver jewellery from Surya Jewellers, Jaipur. Rings, necklaces, earrings & pendants with natural diamonds and gemstones.',
  alternates: {
    canonical: `${SITE_URL}/products`,
  },
};

async function getProductListItems() {
  try {
    const products = await client.fetch<{ _id: string; name?: string; slug?: string; mainStoneType?: string; category?: string; sku?: string }[]>(
      `*[_type == "product" && defined(slug.current)]{ _id, name, "slug": slug.current, mainStoneType, "category": category->name, sku }`,
      {},
      { next: { revalidate: 300 } }
    );
    return products.map((p, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      url: `${SITE_URL}/products/${getProductCanonicalSlug(p)}`,
    }));
  } catch {
    return [];
  }
}

// Fetch the full product list server-side so the initial HTML includes real
// product cards and images — LCP element is discoverable from byte 1.
async function getInitialProducts(): Promise<InitialProduct[]> {
  try {
    return await client.fetch<InitialProduct[]>(
      `*[_type == "product" && inStock != false] | order(_createdAt desc) {
        _id, name,
        "slug": slug.current,
        sku, price,
        "category": category->name,
        silverWeight,
        mainStoneType,
        secondaryStoneType,
        "images": images[0..0][].asset->url,
        inStock,
        stockQuantity,
        _createdAt
      }`,
      {},
      { next: { revalidate: 300 } }
    );
  } catch {
    return [];
  }
}

function SkeletonCard() {
  return (
    <div className="bg-white rounded overflow-hidden border border-[#F5F0E8] flex flex-col">
      <div className="aspect-square bg-[#F5F0E8] animate-pulse" />
      <div className="p-2 sm:p-4 flex flex-col flex-1">
        <div className="h-3 bg-[#F5F0E8] rounded animate-pulse w-4/5 mb-1" />
        <div className="h-3 bg-[#F5F0E8] rounded animate-pulse w-3/5 mb-auto" />
        <div className="h-3 bg-[#F5F0E8] rounded animate-pulse w-2/5 mt-1.5 mb-2 sm:mb-3" />
        <div className="h-[40px] bg-[#F5F0E8] rounded animate-pulse w-full" />
      </div>
    </div>
  );
}

function ProductsGridSkeleton() {
  return (
    <div className="pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Desktop sidebar placeholder — same width as real sidebar */}
          <div className="hidden lg:block lg:w-64 flex-shrink-0">
            <div className="sticky top-20 p-6 rounded min-h-[420px] bg-[#161616]/5" />
          </div>
          {/* Product grid */}
          <div className="flex-1 min-w-0">
            <div className="h-5 w-20 bg-[#F5F0E8] rounded animate-pulse mb-4" />
            <div className="grid grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-6">
              {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default async function ProductsPage() {
  const [initialProducts, itemListElements] = await Promise.all([
    getInitialProducts(),
    getProductListItems(),
  ]);

  const itemListSchema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Surya Jewellers — 92.5 Sterling Silver Jewellery Collections',
    description: 'Handcrafted 92.5 sterling silver jewellery with natural gemstones. Made in Jaipur, India.',
    url: `${SITE_URL}/products`,
    numberOfItems: itemListElements.length,
    itemListElement: itemListElements,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }}
      />

      {/* Page title */}
      <div className="pt-6 pb-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <span className="text-gold text-xs tracking-[0.4em] uppercase">Our Catalog</span>
            <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl mt-4 text-charcoal">
              Collections — 92.5 Sterling Silver Jewellery
            </h1>
            <p className="text-charcoal-muted text-sm mt-6 max-w-2xl mx-auto leading-relaxed">
              Discover Surya Jewellers&rsquo; complete range of handcrafted <strong>92.5 sterling silver jewellery</strong> made in
              Jaipur, India. Every piece is set with certified natural gemstones — diamonds, rubies,
              emeralds, sapphires, and more — and comes with a Certificate of Authenticity.
            </p>
          </div>
        </div>
      </div>

      {/* Interactive client component — Suspense fallback reserves stable height so the
          footer never jumps when the client hydrates (CLS fix). */}
      <Suspense fallback={<ProductsGridSkeleton />}>
        <ProductsClient initialProducts={initialProducts} />
      </Suspense>
    </>
  );
}
