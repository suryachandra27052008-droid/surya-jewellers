import type { Metadata } from 'next';
import { client } from '@/lib/sanity/client';
import CategoryLanding, { type LandingProduct } from '@/components/seo/CategoryLanding';
import Link from 'next/link';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: { absolute: 'Ruby Silver Earrings in 92.5 Sterling Silver | Surya Jewellers Jaipur' },
  description:
    'Shop natural ruby earrings in hallmarked 92.5 sterling silver from Surya Jewellers Jaipur. Certified natural rubies, Certificate of Authenticity, free shipping.',
  alternates: { canonical: 'https://www.suryajewellers.com/ruby-silver-earrings' },
  openGraph: {
    title: 'Ruby Silver Earrings in 92.5 Sterling Silver | Surya Jewellers Jaipur',
    description:
      'Natural ruby earrings handcrafted in 92.5 sterling silver from Surya Jewellers Jaipur. Certified genuine rubies, Certificate of Authenticity.',
    url: 'https://www.suryajewellers.com/ruby-silver-earrings',
    type: 'website',
    siteName: 'Surya Jewellers',
  },
};

const QUERY = `*[_type == "product" && mainStoneType == "Ruby" && inStock != false] | order(_updatedAt desc) [0..11] {
  _id, name, "slug": slug.current, sku, price, mainStoneType, "category": category->name, "images": images[0..0][].asset->url
}`;

const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.suryajewellers.com' },
    { '@type': 'ListItem', position: 2, name: 'Ruby Silver Earrings', item: 'https://www.suryajewellers.com/ruby-silver-earrings' },
  ],
};

export default async function RubySilverEarringsPage() {
  const products = await client.fetch<LandingProduct[]>(QUERY);
  return (
    <CategoryLanding
      h1="Ruby Earrings in 92.5 Sterling Silver"
      intro="Natural ruby jewellery handcrafted at our Jaipur workshop in hallmarked 92.5 sterling silver. Each piece features a certified natural ruby and is accompanied by a Certificate of Authenticity."
      products={products}
      breadcrumbSchema={breadcrumbSchema}
      allProductsLink="/products?category=Earrings"
      bodyContent={
        <>
          <h2 className="font-serif text-2xl text-charcoal mb-3">Natural Rubies in 92.5 Sterling Silver</h2>
          <p>
            Rubies are among the most precious gemstones — prized for their vivid red colour, hardness, and rarity. All rubies used by Surya Jewellers are certified natural stones, sourced ethically and documented for authenticity. Each piece comes with a Certificate of Authenticity confirming the stone type, carat weight, and silver purity.
          </p>
          <p>
            Our craftsmen in Jaipur have decades of experience setting natural rubies in 92.5 sterling silver. Jaipur&apos;s gemstone district is one of the world&apos;s largest — giving us access to the finest natural stones and master setters who work to the highest standards.
          </p>
          <h2 className="font-serif text-2xl text-charcoal mb-3 mt-6">Ruby Jewellery Styles</h2>
          <p>
            Our ruby collection spans earrings, rings, necklaces, and bracelets. Ruby earrings are particularly popular as they pair the vibrant red of the stone with the cool lustre of 92.5 sterling silver — a classic combination that suits every occasion from everyday wear to formal events.
          </p>
          <p className="mt-4">
            <Link href="/products" className="text-gold underline">Browse our full collection</Link> or{' '}
            <Link href="/contact" className="text-gold underline">contact our Jaipur studio</Link> to discuss a custom ruby piece.
          </p>
        </>
      }
    />
  );
}
