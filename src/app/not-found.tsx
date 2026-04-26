import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Page Not Found',
  description: 'The page you are looking for could not be found. Browse our 92.5 sterling silver jewellery collections at Surya Jewellers, Jaipur.',
};

const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    {
      '@type': 'ListItem',
      position: 1,
      name: 'Home',
      item: 'https://www.suryajewellers.com',
    },
    {
      '@type': 'ListItem',
      position: 2,
      name: 'Page Not Found',
      item: 'https://www.suryajewellers.com/404',
    },
  ],
};

export default function NotFound() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <div className="min-h-screen flex flex-col items-center justify-center px-4 pt-20 pb-16 text-center bg-cream">
        <div className="max-w-lg mx-auto">
          <span className="text-gold text-xs tracking-[0.4em] uppercase">404 Error</span>
          <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl mt-4 text-charcoal">
            Page Not Found
          </h1>
          <div className="h-[1px] w-24 bg-gradient-to-r from-transparent via-gold to-transparent mx-auto my-6" />
          <p className="text-charcoal-muted text-base leading-relaxed mb-4">
            The page you are looking for may have been moved, deleted, or never existed. Perhaps you were looking for one of our stunning jewellery collections?
          </p>
          <p className="text-charcoal-muted text-sm mb-10">
            At Surya Jewellers, Jaipur, we craft handcrafted 92.5 sterling silver jewellery with natural diamonds, rubies, emeralds, and sapphires — each piece accompanied by a Certificate of Authenticity.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/"
              className="btn-gold px-8 py-3 text-sm tracking-[0.15em] uppercase font-semibold"
            >
              Back to Home
            </Link>
            <Link
              href="/products"
              className="px-8 py-3 text-sm tracking-[0.15em] uppercase font-semibold border border-charcoal/30 text-charcoal hover:border-gold hover:text-gold transition-colors duration-300"
            >
              Browse Collections
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
