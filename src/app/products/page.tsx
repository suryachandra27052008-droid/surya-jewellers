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

      {/* Interactive client component for filters + product grid */}
      <Suspense>
        <ProductsClient initialProducts={initialProducts} />
      </Suspense>
    </>
  );
}
