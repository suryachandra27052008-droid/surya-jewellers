import type { Metadata } from 'next';
import { client } from '@/lib/sanity/client';
import CategoryLanding, { type LandingProduct } from '@/components/seo/CategoryLanding';
import Link from 'next/link';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: { absolute: 'Silver Necklaces Jaipur | 92.5 Sterling | Surya Jewellers' },
  description:
    'Handcrafted 925 sterling silver necklaces from Surya Jewellers Jaipur. Natural gemstones, Certificate of Authenticity, free shipping across India.',
  alternates: { canonical: 'https://www.suryajewellers.com/silver-necklaces-jaipur' },
  openGraph: {
    title: 'Silver Necklaces Jaipur | 92.5 Sterling | Surya Jewellers',
    description:
      'Handcrafted 925 sterling silver necklaces with natural gemstones from Surya Jewellers Jaipur. Certificate of Authenticity on every piece.',
    url: 'https://www.suryajewellers.com/silver-necklaces-jaipur',
    type: 'website',
    siteName: 'Surya Jewellers',
  },
};

const QUERY = `*[_type == "product" && category->name == "Necklaces" && inStock != false] | order(_updatedAt desc) [0..11] {
  _id, name, "slug": slug.current, sku, price, mainStoneType, "category": category->name, "images": images[0..0][].asset->url
}`;

const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.suryajewellers.com' },
    { '@type': 'ListItem', position: 2, name: 'Silver Necklaces Jaipur', item: 'https://www.suryajewellers.com/silver-necklaces-jaipur' },
  ],
};

export default async function SilverNecklacesJaipurPage() {
  const products = await client.fetch<LandingProduct[]>(QUERY);
  return (
    <CategoryLanding
      h1="Silver Necklaces in Jaipur"
      intro="Explore our collection of handcrafted sterling silver necklaces, made in hallmarked 92.5 silver at our Jaipur workshop. Natural gemstones, Certificate of Authenticity, shipped worldwide."
      products={products}
      breadcrumbSchema={breadcrumbSchema}
      allProductsLink="/products?category=Necklaces"
      bodyContent={
        <>
          <h2 className="font-serif text-2xl text-charcoal mb-3">Handcrafted Silver Necklaces from Jaipur</h2>
          <p>
            A silver necklace from Surya Jewellers is more than an accessory — it is a piece of Jaipur craftsmanship, handmade by skilled artisans using 92.5 sterling silver and natural certified gemstones. Our necklaces range from delicate pendants on fine chains to bold statement pieces set with multiple stones.
          </p>
          <p>
            Every necklace leaves our Jaipur workshop with a Certificate of Authenticity confirming the silver purity, the gemstone type, and the exact carat weight. No synthetic stones, no gold-plated base metal — only hallmarked 92.5 sterling silver.
          </p>
          <h2 className="font-serif text-2xl text-charcoal mb-3 mt-6">Silver Necklaces with Natural Gemstones</h2>
          <p>
            Our necklace collection features natural diamonds, rubies, emeralds, sapphires, opals, moonstones, and more. Each gemstone is ethically sourced from Jaipur&apos;s renowned gemstone market — one of the largest in Asia — and certified for authenticity.
          </p>
          <p className="mt-4">
            <Link href="/silver-pendants-jaipur" className="text-gold underline">Browse silver pendants</Link> ·{' '}
            <Link href="/silver-rings-jaipur" className="text-gold underline">Silver rings</Link> ·{' '}
            <Link href="/contact" className="text-gold underline">Visit our Jaipur showroom</Link>
          </p>
        </>
      }
    />
  );
}
