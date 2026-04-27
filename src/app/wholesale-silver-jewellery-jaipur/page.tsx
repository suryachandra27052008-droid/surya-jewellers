import type { Metadata } from 'next';
import { client } from '@/lib/sanity/client';
import CategoryLanding, { type LandingProduct } from '@/components/seo/CategoryLanding';
import Link from 'next/link';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: { absolute: 'Wholesale Silver Jewellery Jaipur | Surya Jewellers' },
  description:
    'Wholesale 925 silver jewellery direct from Jaipur manufacturer. Supplying global retailers since 2003. Competitive pricing, Certificate of Authenticity.',
  alternates: { canonical: 'https://www.suryajewellers.com/wholesale-silver-jewellery-jaipur' },
  openGraph: {
    title: 'Wholesale Silver Jewellery Jaipur | Surya Jewellers',
    description:
      'Partner with Surya Jewellers for factory-direct 92.5 sterling silver jewellery wholesale from Jaipur. Serving global retailers since 2003.',
    url: 'https://www.suryajewellers.com/wholesale-silver-jewellery-jaipur',
    type: 'website',
    siteName: 'Surya Jewellers',
  },
};

const QUERY = `*[_type == "product" && inStock != false] | order(_updatedAt desc) [0..7] {
  _id, name, "slug": slug.current, sku, price, mainStoneType, "category": category->name, "images": images[0..0][].asset->url
}`;

const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.suryajewellers.com' },
    { '@type': 'ListItem', position: 2, name: 'Wholesale Silver Jewellery Jaipur', item: 'https://www.suryajewellers.com/wholesale-silver-jewellery-jaipur' },
  ],
};

export default async function WholesaleSilverJewelleryPage() {
  const products = await client.fetch<LandingProduct[]>(QUERY);
  return (
    <CategoryLanding
      h1="Wholesale Silver Jewellery from Jaipur"
      intro="Partner with Surya Jewellers for factory-direct 92.5 sterling silver jewellery. Family-owned manufacturer since 2003, supplying retailers, boutiques, and exporters worldwide."
      products={products}
      breadcrumbSchema={breadcrumbSchema}
      allProductsLink="/products"
      bodyContent={
        <>
          <h2 className="font-serif text-2xl text-charcoal mb-3">Wholesale Silver Jewellery Manufacturer, Jaipur</h2>
          <p>
            Surya Jewellers is a family-owned 92.5 sterling silver jewellery manufacturer based in Jaipur, Rajasthan — India&apos;s jewellery manufacturing capital. Since 2003, we have supplied wholesale clients across India, Europe, the Middle East, and Southeast Asia with handcrafted silver jewellery set with certified natural gemstones.
          </p>
          <p>
            Every wholesale piece carries a Certificate of Authenticity, confirming the hallmarked 92.5 sterling silver purity and natural gemstone details. Our designs are approximately 90% exclusive — meaning your retail customers will not find the same pieces elsewhere.
          </p>
          <h2 className="font-serif text-2xl text-charcoal mb-3 mt-6">Wholesale Partner Benefits</h2>
          <ul className="list-disc pl-5 space-y-2">
            <li>Factory-direct pricing from our Jaipur workshop</li>
            <li>Hallmarked 92.5 sterling silver on all pieces</li>
            <li>Certified natural gemstones — diamonds, rubies, emeralds, sapphires and more</li>
            <li>Certificate of Authenticity with each piece for your customers</li>
            <li>90%+ exclusive, one-of-a-kind designs</li>
            <li>Global shipping with full insurance</li>
            <li>Minimum order quantities available for retailers and boutiques</li>
          </ul>
          <h2 className="font-serif text-2xl text-charcoal mb-3 mt-6">Start a Wholesale Partnership</h2>
          <p>
            To enquire about wholesale pricing, minimum order quantities, and product catalogues, contact us at{' '}
            <a href="mailto:suryajewellersjaipur@gmail.com" className="text-gold">suryajewellersjaipur@gmail.com</a>{' '}
            or call{' '}
            <a href="tel:+919983939306" className="text-gold">+91 99839 39306</a>.
          </p>
          <p className="mt-4">
            <Link href="/wholesale" className="text-gold underline">Complete our wholesale enquiry form</Link> or{' '}
            <Link href="/contact" className="text-gold underline">visit our Jaipur showroom</Link> at B-169 Anandpuri, Moti Doongri Rd, near Naila House, Jaipur.
          </p>
        </>
      }
    />
  );
}
