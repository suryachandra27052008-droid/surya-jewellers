import type { Metadata } from 'next';
import { client } from '@/lib/sanity/client';
import CategoryLanding, { type LandingProduct } from '@/components/seo/CategoryLanding';
import Link from 'next/link';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: { absolute: 'Silver Pendants Jaipur | 92.5 Sterling Silver | Surya Jewellers' },
  description:
    'Handcrafted 925 sterling silver pendants from Surya Jewellers Jaipur. Natural gemstones, Certificate of Authenticity, free shipping across India.',
  alternates: { canonical: 'https://www.suryajewellers.com/silver-pendants-jaipur' },
  openGraph: {
    title: 'Silver Pendants Jaipur | 92.5 Sterling Silver | Surya Jewellers',
    description:
      'Handcrafted 925 sterling silver pendants with natural gemstones from Surya Jewellers Jaipur. Certificate of Authenticity on every piece.',
    url: 'https://www.suryajewellers.com/silver-pendants-jaipur',
    type: 'website',
    siteName: 'Surya Jewellers',
  },
};

const QUERY = `*[_type == "product" && category->name == "Pendants" && inStock != false] | order(_updatedAt desc) [0..11] {
  _id, name, "slug": slug.current, sku, price, mainStoneType, "category": category->name, "images": images[0..0][].asset->url
}`;

const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.suryajewellers.com' },
    { '@type': 'ListItem', position: 2, name: 'Silver Pendants Jaipur', item: 'https://www.suryajewellers.com/silver-pendants-jaipur' },
  ],
};

export default async function SilverPendantsJaipurPage() {
  const products = await client.fetch<LandingProduct[]>(QUERY);
  return (
    <CategoryLanding
      h1="Silver Pendants in Jaipur"
      intro="Explore our handcrafted silver pendants in hallmarked 92.5 sterling silver from Surya Jewellers Jaipur. Each pendant features a certified natural gemstone and includes a Certificate of Authenticity."
      products={products}
      breadcrumbSchema={breadcrumbSchema}
      allProductsLink="/products?category=Pendants"
      bodyContent={
        <>
          <h2 className="font-serif text-2xl text-charcoal mb-3">Handcrafted Silver Pendants from Jaipur</h2>
          <p>
            A silver pendant is often the centrepiece of a jewellery collection — and ours are crafted to be worthy of that role. Every pendant is made in hallmarked 92.5 sterling silver at our Jaipur workshop and set with certified natural gemstones, each piece unique.
          </p>
          <p>
            Pendants are available alone or paired with a matching chain. Our craftsmen can also create bespoke pendants to your specification — ideal for personal commissions, gifts, or custom retail orders. Contact us to discuss custom work.
          </p>
          <h2 className="font-serif text-2xl text-charcoal mb-3 mt-6">Pendant Styles and Gemstones</h2>
          <p>
            Our pendant collection spans classic solitaire drops to elaborate multi-stone designs. Gemstones available include natural diamonds, rubies, emeralds, sapphires, opals, moonstones, tanzanite, and many others. Every stone is ethically sourced from Jaipur&apos;s renowned gemstone market.
          </p>
          <p className="mt-4">
            <Link href="/silver-necklaces-jaipur" className="text-gold underline">Silver necklaces</Link> ·{' '}
            <Link href="/silver-rings-jaipur" className="text-gold underline">Silver rings</Link> ·{' '}
            <Link href="/contact" className="text-gold underline">Visit our Jaipur showroom</Link>
          </p>
        </>
      }
    />
  );
}
