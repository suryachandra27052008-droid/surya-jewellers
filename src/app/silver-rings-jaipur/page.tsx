import type { Metadata } from 'next';
import { client } from '@/lib/sanity/client';
import CategoryLanding, { type LandingProduct } from '@/components/seo/CategoryLanding';
import Link from 'next/link';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: { absolute: 'Silver Rings Jaipur | 92.5 Sterling Silver | Surya Jewellers' },
  description:
    'Shop handcrafted 925 sterling silver rings in Jaipur from Surya Jewellers. Natural gemstones, Certificate of Authenticity, free shipping across India.',
  alternates: { canonical: 'https://www.suryajewellers.com/silver-rings-jaipur' },
  openGraph: {
    title: 'Silver Rings Jaipur | 92.5 Sterling Silver | Surya Jewellers',
    description:
      'Handcrafted 925 silver rings with natural gemstones from Surya Jewellers Jaipur. Certificate of Authenticity on every piece. Free shipping across India.',
    url: 'https://www.suryajewellers.com/silver-rings-jaipur',
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
    { '@type': 'ListItem', position: 2, name: 'Silver Rings in Jaipur', item: 'https://www.suryajewellers.com/silver-rings-jaipur' },
  ],
};

export default async function SilverRingsJaipurPage() {
  const products = await client.fetch<LandingProduct[]>(QUERY);
  return (
    <CategoryLanding
      h1="Silver Rings in Jaipur"
      intro="Handcrafted in hallmarked 92.5 sterling silver at our Jaipur workshop since 2003. Every ring is set with a certified natural gemstone and accompanied by a Certificate of Authenticity."
      products={products}
      breadcrumbSchema={breadcrumbSchema}
      allProductsLink="/products?category=Rings"
      bodyContent={
        <>
          <h2 className="font-serif text-2xl text-charcoal mb-3">92.5 Sterling Silver Rings — Crafted in Jaipur</h2>
          <p>
            Surya Jewellers has been crafting fine silver rings in Jaipur since 2003. Every ring is made from hallmarked 92.5 sterling silver — 92.5% pure silver, alloyed for lasting durability — and set with certified natural gemstones including diamonds, rubies, emeralds, and sapphires.
          </p>
          <p>
            Our Jaipur craftsmen use traditional silversmithing techniques refined over generations to produce rings of exceptional quality. No two designs are the same: approximately 90% of our pieces are one-of-a-kind, meaning your ring is uniquely yours.
          </p>
          <h2 className="font-serif text-2xl text-charcoal mb-3 mt-6">Why Buy from Surya Jewellers?</h2>
          <ul className="list-disc pl-5 space-y-2">
            <li>Hallmarked 92.5 sterling silver purity on every piece</li>
            <li>Certified natural gemstones — no synthetic substitutes</li>
            <li>Certificate of Authenticity with every purchase</li>
            <li>Free shipping across India; international orders insured</li>
            <li>Complimentary lifetime maintenance at our Jaipur showroom</li>
            <li>Family-owned workshop, founded 2003</li>
          </ul>
          <p className="mt-6">
            Visit our showroom at B-169 Anandpuri, Moti Doongri Rd, near Naila House, Jaipur — open Monday to Saturday, 10 AM to 8 PM.{' '}
            <Link href="/contact" className="text-gold underline">Contact us</Link> or call{' '}
            <a href="tel:+919983939306" className="text-gold">+91 99839 39306</a>.
          </p>
        </>
      }
    />
  );
}
