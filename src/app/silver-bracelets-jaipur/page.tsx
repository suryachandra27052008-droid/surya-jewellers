import type { Metadata } from 'next';
import { client } from '@/lib/sanity/client';
import CategoryLanding, { type LandingProduct } from '@/components/seo/CategoryLanding';
import Link from 'next/link';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: { absolute: 'Silver Bracelets Jaipur | 92.5 Sterling Silver | Surya Jewellers' },
  description:
    'Handcrafted 925 sterling silver bracelets from Surya Jewellers Jaipur. Natural gemstones, Certificate of Authenticity, free shipping across India.',
  alternates: { canonical: 'https://www.suryajewellers.com/silver-bracelets-jaipur' },
  openGraph: {
    title: 'Silver Bracelets Jaipur | 92.5 Sterling Silver | Surya Jewellers',
    description:
      'Handcrafted 925 sterling silver bracelets with natural gemstones from Surya Jewellers Jaipur. Certificate of Authenticity on every piece.',
    url: 'https://www.suryajewellers.com/silver-bracelets-jaipur',
    type: 'website',
    siteName: 'Surya Jewellers',
  },
};

const QUERY = `*[_type == "product" && category->name == "Bracelets" && inStock != false] | order(_updatedAt desc) [0..11] {
  _id, name, "slug": slug.current, sku, price, mainStoneType, "category": category->name, "images": images[0..0][].asset->url
}`;

const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.suryajewellers.com' },
    { '@type': 'ListItem', position: 2, name: 'Silver Bracelets Jaipur', item: 'https://www.suryajewellers.com/silver-bracelets-jaipur' },
  ],
};

export default async function SilverBraceletsJaipurPage() {
  const products = await client.fetch<LandingProduct[]>(QUERY);
  return (
    <CategoryLanding
      h1="Silver Bracelets in Jaipur"
      intro="Our 92.5 sterling silver bracelets are individually handcrafted at our Jaipur workshop. Each piece is set with natural gemstones and comes with a Certificate of Authenticity."
      products={products}
      breadcrumbSchema={breadcrumbSchema}
      allProductsLink="/products?category=Bracelets"
      bodyContent={
        <>
          <h2 className="font-serif text-2xl text-charcoal mb-3">Sterling Silver Bracelets — Handcrafted in Jaipur</h2>
          <p>
            Our bracelet collection combines the enduring beauty of 92.5 sterling silver with the rich colour of natural gemstones. From delicate gemstone-studded cuffs to bold statement bangles, each bracelet is made to order at our Jaipur workshop by craftsmen with decades of experience.
          </p>
          <p>
            Every piece is hallmarked 92.5 sterling silver and set with certified natural stones. Whether you are looking for an everyday bracelet or a special occasion piece, our collection offers a wide range of styles to suit every taste.
          </p>
          <h2 className="font-serif text-2xl text-charcoal mb-3 mt-6">Popular Gemstones in Our Bracelets</h2>
          <p>
            Our silver bracelets feature natural diamonds, rubies, emeralds, sapphires, amethysts, tourmalines, and aquamarines. The stone type and carat weight are certified and documented in the Certificate of Authenticity included with every purchase.
          </p>
          <p className="mt-4">
            <Link href="/silver-rings-jaipur" className="text-gold underline">Silver rings</Link> ·{' '}
            <Link href="/silver-necklaces-jaipur" className="text-gold underline">Silver necklaces</Link> ·{' '}
            <Link href="/contact" className="text-gold underline">Visit our Jaipur showroom</Link>
          </p>
        </>
      }
    />
  );
}
