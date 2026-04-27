import type { Metadata } from 'next';
import { client } from '@/lib/sanity/client';
import CategoryLanding, { type LandingProduct } from '@/components/seo/CategoryLanding';
import Link from 'next/link';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: { absolute: 'Natural Emerald Silver Rings | Surya Jewellers Jaipur' },
  description:
    'Natural emerald rings in hallmarked 92.5 sterling silver from Surya Jewellers Jaipur. Certified emeralds, Certificate of Authenticity, free shipping.',
  alternates: { canonical: 'https://www.suryajewellers.com/emerald-silver-rings' },
  openGraph: {
    title: 'Natural Emerald Silver Rings | Surya Jewellers Jaipur',
    description:
      'Natural emerald rings handcrafted in 92.5 sterling silver from Surya Jewellers Jaipur. Certified genuine emeralds, Certificate of Authenticity.',
    url: 'https://www.suryajewellers.com/emerald-silver-rings',
    type: 'website',
    siteName: 'Surya Jewellers',
  },
};

const QUERY = `*[_type == "product" && category->name == "Rings" && mainStoneType == "Emerald" && inStock != false] | order(_updatedAt desc) [0..11] {
  _id, name, "slug": slug.current, sku, price, mainStoneType, "category": category->name, "images": images[0..0][].asset->url
}`;

const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.suryajewellers.com' },
    { '@type': 'ListItem', position: 2, name: 'Emerald Silver Rings', item: 'https://www.suryajewellers.com/emerald-silver-rings' },
  ],
};

export default async function EmeraldSilverRingsPage() {
  const products = await client.fetch<LandingProduct[]>(QUERY);
  return (
    <CategoryLanding
      h1="Emerald Rings in 92.5 Sterling Silver"
      intro="Natural emerald rings handcrafted at our Jaipur workshop in hallmarked 92.5 sterling silver. Each ring features a certified natural emerald and is accompanied by a Certificate of Authenticity."
      products={products}
      breadcrumbSchema={breadcrumbSchema}
      allProductsLink="/products?category=Rings"
      bodyContent={
        <>
          <h2 className="font-serif text-2xl text-charcoal mb-3">Natural Emeralds Set in 92.5 Sterling Silver</h2>
          <p>
            Emeralds are among the most prized gemstones in the world, valued for their deep green colour and natural inclusions that give each stone its unique character. Our emerald rings are set with certified natural emeralds — sourced ethically and verified for authenticity. The stone type and carat weight are documented in the Certificate of Authenticity that accompanies every piece.
          </p>
          <p>
            Surya Jewellers has been setting natural gemstones in 92.5 sterling silver since 2003, drawing on Jaipur&apos;s centuries-old tradition of gemstone craftsmanship. The city of Jaipur is known worldwide as a hub for gemstone cutting, setting, and trade — and our craftsmen are trained in this tradition.
          </p>
          <h2 className="font-serif text-2xl text-charcoal mb-3 mt-6">Caring for Your Emerald Ring</h2>
          <p>
            Emeralds are relatively hard (7.5–8 on the Mohs scale) but can be sensitive to sharp impacts. Avoid ultrasonic cleaning, extreme heat, and direct exposure to chemicals. Clean gently with a soft cloth. Surya Jewellers provides complimentary lifetime maintenance — bring your piece to our Jaipur showroom for professional cleaning.
          </p>
          <p className="mt-4">
            <Link href="/silver-rings-jaipur" className="text-gold underline">View all silver rings</Link> or{' '}
            <Link href="/contact" className="text-gold underline">contact us</Link> for bespoke emerald ring commissions.
          </p>
        </>
      }
    />
  );
}
