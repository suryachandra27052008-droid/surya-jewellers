import Link from 'next/link';
import Image from 'next/image';
import { getProductCanonicalSlug, getProductDisplayName, getProductImageAlt } from '@/lib/seo/product';

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

      <div className="pt-32 pb-20 min-h-screen bg-cream">
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
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {products.map((p) => {
                const slug = getProductCanonicalSlug(p);
                const img = p.images[0];
                const name = getProductDisplayName(p);
                const altText = getProductImageAlt(p);
                return (
                  <Link key={p._id} href={`/products/${slug}`} className="group block">
                    <div className="aspect-square relative overflow-hidden rounded-sm bg-gray-100">
                      {img ? (
                        <Image
                          src={img}
                          alt={altText}
                          fill
                          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-charcoal-muted text-xs text-center px-2">
                          {name}
                        </div>
                      )}
                    </div>
                    <div className="pt-2 pb-1">
                      <p className="text-charcoal text-sm font-medium line-clamp-2">{name}</p>
                      <p className="text-gold text-sm mt-0.5">
                        ₹{p.price.toLocaleString('en-IN')}
                      </p>
                    </div>
                  </Link>
                );
              })}
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
