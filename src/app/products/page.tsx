import type { Metadata } from 'next';
import { Suspense } from 'react';
import { client } from '@/lib/sanity/client';
import ProductsClient from './ProductsClient';

export const metadata: Metadata = {
  title: 'Collections — 92.5 Sterling Silver Jewellery',
  description:
    'Shop Surya Jewellers\' complete range of handcrafted 92.5 sterling silver jewellery — rings, necklaces, earrings, bracelets, pendants and studs set with natural diamonds, rubies, emeralds and sapphires. Made in Jaipur.',
  alternates: {
    canonical: 'https://suryajewellers.shop/products',
  },
};

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

async function getProductListItems() {
  try {
    const products = await client.fetch<{ _id: string; mainStoneType?: string; category?: string; sku?: string }[]>(
      `*[_type == "product" && defined(slug.current)]{ _id, mainStoneType, "category": category->name, sku }`,
      {},
      { next: { revalidate: 300 } }
    );
    return products.map((p, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      url: `https://suryajewellers.shop/products/${buildUniqueSlug(p)}`,
    }));
  } catch {
    return [];
  }
}

const categoryDescriptions = [
  {
    slug: 'rings',
    title: 'Sterling Silver Rings',
    description:
      'Our silver rings collection features solitaire diamond rings, gemstone cocktail rings, stacking bands, and statement pieces — all in hallmarked 92.5 sterling silver. From delicate ruby rings to bold sapphire statement rings, each is crafted by hand in our Jaipur workshop.',
  },
  {
    slug: 'necklaces',
    title: 'Sterling Silver Necklaces',
    description:
      'From emerald pendants on fine chains to layered gemstone necklaces, our sterling silver necklace collection offers timeless elegance. Every necklace is set with natural, certified gemstones and finished to a mirror polish.',
  },
  {
    slug: 'earrings',
    title: 'Sterling Silver Earrings',
    description:
      'Handcrafted sterling silver earrings ranging from simple diamond studs to elaborate jhumka drops set with rubies, opals, and tourmalines. Each pair is lightweight, hypoallergenic, and suitable for everyday wear.',
  },
  {
    slug: 'bracelets',
    title: 'Sterling Silver Bracelets',
    description:
      'Our 92.5 sterling silver bracelets include tennis bracelets set with diamonds, charm bracelets with natural gemstones, and bold cuff designs. A perfect gift for any occasion, each bracelet comes with a Certificate of Authenticity.',
  },
  {
    slug: 'pendants',
    title: 'Sterling Silver Pendants',
    description:
      'Choose from a wide range of sterling silver pendants featuring natural stones — sapphire teardrops, moonstone ovals, emerald drops, and more. Our pendants are crafted to sit beautifully on fine chains and statement neckpieces alike.',
  },
  {
    slug: 'studs',
    title: 'Sterling Silver Studs',
    description:
      'Minimalist yet impactful, our sterling silver studs are set with natural diamonds, rubies, emeralds, and sapphires. The perfect everyday earring, each stud pair is polished to perfection and secured with push-back fittings.',
  },
];

export default async function ProductsPage() {
  const itemListElements = await getProductListItems();

  const itemListSchema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Surya Jewellers — 92.5 Sterling Silver Jewellery Collections',
    description: 'Handcrafted 92.5 sterling silver jewellery with natural gemstones. Made in Jaipur, India.',
    url: 'https://suryajewellers.shop/products',
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
      <div className="pt-24 pb-0">
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
        <ProductsClient />
      </Suspense>

      {/* Category description grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {categoryDescriptions.map((cat) => (
            <div
              key={cat.slug}
              className="bg-cream/60 border border-cream-dark rounded p-5"
            >
              <h2 className="font-serif text-lg text-charcoal mb-2">{cat.title}</h2>
              <p className="text-charcoal-muted text-xs leading-relaxed">{cat.description}</p>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
