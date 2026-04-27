import type { Metadata } from 'next';
import { client } from '@/lib/sanity/client';
import CategoryLanding, { type LandingProduct } from '@/components/seo/CategoryLanding';
import Link from 'next/link';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: { absolute: '925 Sterling Silver Rings | Surya Jewellers Jaipur' },
  description:
    'Hallmarked 925 sterling silver rings with natural gemstones from Surya Jewellers Jaipur. Unique designs, Certificate of Authenticity, since 2003.',
  alternates: { canonical: 'https://www.suryajewellers.com/925-silver-rings' },
  openGraph: {
    title: '925 Sterling Silver Rings | Surya Jewellers Jaipur',
    description:
      'Hallmarked 925 sterling silver rings with certified natural gemstones from Surya Jewellers Jaipur. Each ring includes a Certificate of Authenticity.',
    url: 'https://www.suryajewellers.com/925-silver-rings',
    type: 'website',
    siteName: 'Surya Jewellers',
  },
};

const QUERY = `*[_type == "product" && category->name == "Rings" && inStock != false] | order(_updatedAt desc) [0..11] {
  _id, name, "slug": slug.current, sku, price, mainStoneType, "category": category->name, "images": images[0..0][].asset->url
}`;

const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.suryajewellers.com' },
    { '@type': 'ListItem', position: 2, name: '925 Silver Rings', item: 'https://www.suryajewellers.com/925-silver-rings' },
  ],
};

export default async function SilverRings925Page() {
  const products = await client.fetch<LandingProduct[]>(QUERY);
  return (
    <CategoryLanding
      h1="925 Sterling Silver Rings"
      intro="Every ring in our collection carries the 925 hallmark — 92.5% pure silver, certified and verified. Handcrafted at our Jaipur workshop with natural gemstones and a Certificate of Authenticity."
      products={products}
      breadcrumbSchema={breadcrumbSchema}
      allProductsLink="/products?category=Rings"
      bodyContent={
        <>
          <h2 className="font-serif text-2xl text-charcoal mb-3">What Does 925 Sterling Silver Mean?</h2>
          <p>
            925 sterling silver — also written as 92.5 sterling silver — is an alloy composed of 92.5% pure silver and 7.5% other metals, typically copper. This composition gives silver the strength needed for fine jewellery while retaining its characteristic brilliance and lustre. All Surya Jewellers rings are hallmarked 925 sterling silver.
          </p>
          <p>
            Hallmarking is a government-recognised assay that certifies the purity of a precious metal piece. When you see the BIS hallmark on a Surya Jewellers ring, it guarantees the 925 silver purity has been independently verified — not merely claimed by the seller.
          </p>
          <h2 className="font-serif text-2xl text-charcoal mb-3 mt-6">925 Silver Rings with Natural Gemstones</h2>
          <p>
            Our rings feature certified natural gemstones — diamonds, rubies, emeralds, sapphires, and a wide range of semi-precious stones. The type, origin, and carat weight of each stone is documented in your Certificate of Authenticity.
          </p>
          <p className="mt-4">
            <Link href="/products?category=Rings" className="text-gold underline">Browse all rings</Link> or{' '}
            <Link href="/contact" className="text-gold underline">visit our Jaipur showroom</Link> at B-169 Anandpuri, Moti Doongri Rd, near Naila House.
          </p>
        </>
      }
    />
  );
}
