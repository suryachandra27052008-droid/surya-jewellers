import Link from 'next/link';
import CategoryProductCard from './CategoryProductCard';

export interface LandingProduct {
  _id: string;
  name: string;
  price: number;
  sku: string;
  slug?: string;
  mainStoneType?: string;
  category?: string;
  images: string[];
}

interface CategoryLandingProps {
  h1: string;
  intro: string;
  products: LandingProduct[];
  bodyContent: React.ReactNode;
  breadcrumbSchema: object;
  allProductsLink?: string;
}

const CATEGORY_LINKS = [
  { href: '/silver-rings-jaipur', label: 'Silver Rings' },
  { href: '/925-silver-rings', label: '925 Silver Rings' },
  { href: '/silver-necklaces-jaipur', label: 'Silver Necklaces' },
  { href: '/silver-bracelets-jaipur', label: 'Silver Bracelets' },
  { href: '/silver-pendants-jaipur', label: 'Silver Pendants' },
  { href: '/ruby-silver-earrings', label: 'Ruby Earrings' },
  { href: '/emerald-silver-rings', label: 'Emerald Rings' },
];

const MORE_LINKS = [
  { href: '/products', label: 'All Collections' },
  { href: '/wholesale-silver-jewellery-jaipur', label: 'Wholesale Enquiry' },
  { href: '/jaipur-jewellery', label: 'Visit Our Showroom' },
];

export default function CategoryLanding({
  h1,
  intro,
  products,
  bodyContent,
  breadcrumbSchema,
  allProductsLink = '/products',
}: CategoryLandingProps) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <div className="pt-8 pb-20 min-h-screen bg-cream">
        {/* Hero */}
        <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 text-center">
          <span className="text-gold text-xs tracking-[0.4em] uppercase">
            Surya Jewellers · Est. 2003 · Jaipur
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl mt-4 mb-6 text-charcoal">
            {h1}
          </h1>
          <div className="h-[1px] w-24 bg-gradient-to-r from-transparent via-gold to-transparent mx-auto mb-6" />
          <p className="text-charcoal-muted text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
            {intro}
          </p>
        </section>

        {/* Product grid */}
        {products.length > 0 ? (
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
              {products.map((p, index) => (
                <CategoryProductCard key={p._id} p={p} priority={index < 2} />
              ))}
            </div>
            <div className="text-center mt-10">
              <Link
                href={allProductsLink}
                className="inline-block border border-gold text-gold text-xs tracking-[0.2em] uppercase px-8 py-3 hover:bg-gold hover:text-white transition-colors duration-300"
              >
                View All
              </Link>
            </div>
          </section>
        ) : (
          <div className="text-center py-12">
            <p className="text-charcoal-muted mb-4">No products found in this category.</p>
            <Link href="/products" className="text-gold underline">
              Browse our full collection
            </Link>
          </div>
        )}

        {/* Internal links — Related categories + Quick links */}
        <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 border-t border-cream-dark mt-4">
          <p className="text-[0.65rem] tracking-[0.25em] uppercase text-charcoal-muted mb-3">
            Explore More
          </p>
          <div className="flex flex-wrap gap-2 mb-4">
            {CATEGORY_LINKS.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className="text-xs px-3 py-1.5 border border-cream-dark rounded text-charcoal-muted hover:border-gold hover:text-gold transition-colors"
              >
                {label}
              </Link>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            {MORE_LINKS.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className="text-xs px-3 py-1.5 bg-charcoal/5 rounded text-charcoal-muted hover:bg-gold/10 hover:text-gold transition-colors"
              >
                {label}
              </Link>
            ))}
          </div>
        </section>

        {/* SEO body content */}
        <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="text-charcoal-muted text-sm sm:text-base leading-relaxed space-y-4">
            {bodyContent}
          </div>
        </section>
      </div>
    </>
  );
}
