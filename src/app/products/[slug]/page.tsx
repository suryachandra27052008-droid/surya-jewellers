import Link from 'next/link';
import { writeClient } from '@/lib/sanity/client';
import ProductDetailClient, { type ProductData, type RelatedProduct } from './ProductDetailClient';
import {
  correctSpelling,
  getProductCanonicalSlug,
  getProductDisplayName,
  getProductMetaDescription,
  SITE_URL,
} from '@/lib/seo/product';

const PRODUCT_QUERY = `
  *[_type == "product"] {
    _id,
    name,
    "slug": slug.current,
    sku,
    price,
    "category": category->name,
    silverWeight,
    grossWeight,
    mainStoneType,
    totalCaratWeight,
    diamondWeight,
    diamondColorClarity,
    secondaryStoneType,
    csWeight,
    barcode,
    "images": images[].asset->url,
    description,
    inStock,
    stockQuantity
  }
`;

// Always fetch fresh product data so image updates from bulk upload are instant.
export const dynamic = 'force-dynamic';
export const dynamicParams = true;

export async function generateStaticParams() {
  try {
    const products = await writeClient.fetch<{ _id: string; name?: string; slug?: string; mainStoneType?: string; category?: string; sku?: string }[]>(
      `*[_type == "product"]{ _id, name, "slug": slug.current, mainStoneType, "category": category->name, sku }`,
      {},
      { next: { revalidate: 3600 } }
    );
    // Generate canonical SEO slugs plus legacy raw slugs/SKUs as valid paths.
    const params: { slug: string }[] = [];
    for (const p of products) {
      params.push({ slug: getProductCanonicalSlug(p) });
      if (p.slug) params.push({ slug: p.slug });
      if (p.sku) params.push({ slug: p.sku });
    }
    return params;
  } catch {
    return [];
  }
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  let products: any[] = [];
  try {
    // Use writeClient (no CDN) so products uploaded after the last build are
    // immediately visible without waiting for CDN cache expiry.
    products = await writeClient.fetch(PRODUCT_QUERY, {}, { cache: 'no-store' });
  } catch {
    // fall through to not-found
  }

  const slugLower = slug.toLowerCase();
  const raw = products.find((p: any) => getProductCanonicalSlug(p) === slug)
    ?? products.find((p: any) => p.slug === slug)
    // Direct SKU match — enables /products/RNG17288 style URLs
    ?? products.find((p: any) => (p.sku || '').toLowerCase() === slugLower)
    ?? products.find((p: any) =>
        (p.name || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') === slug
      );

  if (!raw) {
    return (
      <div className="pt-8 pb-16 text-center">
        <h1 className="font-serif text-3xl text-charcoal mb-4">Product Not Found</h1>
        <p className="text-charcoal-muted mb-8">The piece you are looking for does not exist.</p>
        <Link href="/products" className="btn-gold">
          Back to Collections
        </Link>
      </div>
    );
  }

  const product: ProductData = {
    _id: raw._id,
    name: getProductDisplayName(raw),
    slug: getProductCanonicalSlug(raw),
    sku: raw.sku,
    price: raw.price,
    category: raw.category || 'Rings',
    silverWeight: raw.silverWeight || 0,
    grossWeight: raw.grossWeight || 0,
    mainStoneType: raw.mainStoneType || 'None',
    totalCaratWeight: raw.totalCaratWeight || 0,
    diamondColorClarity: raw.diamondColorClarity || '',
    description: correctSpelling(raw.description || ''),
    inStock: raw.inStock,
    stockQuantity: raw.stockQuantity ?? 1,
    images: raw.images || [],
    secondaryStoneType: raw.secondaryStoneType || '',
    csWeight: Number(raw.csWeight) || 0,
    diamondWeight: Number(raw.diamondWeight) > 0
      ? Number(raw.diamondWeight)
      : (Number(raw.totalCaratWeight) > 0 && Number(raw.totalCaratWeight) !== Number(raw.csWeight)
          ? Number(raw.totalCaratWeight)
          : 0),
    barcode: raw.barcode || '',
  };

  const productSchema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: getProductMetaDescription(raw),
    image: product.images[0] ?? 'https://www.suryajewellers.com/logo_sj.png',
    sku: product.sku,
    brand: {
      '@type': 'Brand',
      name: 'Surya Jewellers',
    },
    material: '92.5 Sterling Silver',
    category: product.category,
    offers: {
      '@type': 'Offer',
      url: `${SITE_URL}/products/${product.slug}`,
      priceCurrency: 'INR',
      price: product.price,
      availability: product.inStock
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
      itemCondition: 'https://schema.org/NewCondition',
      hasMerchantReturnPolicy: {
        '@type': 'MerchantReturnPolicy',
        applicableCountry: 'IN',
        returnPolicyCategory: 'https://schema.org/MerchantReturnFiniteReturnWindow',
        merchantReturnDays: 7,
        returnMethod: 'https://schema.org/ReturnByMail',
        returnFees: 'https://schema.org/FreeReturn',
      },
      shippingDetails: {
        '@type': 'OfferShippingDetails',
        shippingDestination: {
          '@type': 'DefinedRegion',
          addressCountry: 'IN',
        },
        deliveryTime: {
          '@type': 'ShippingDeliveryTime',
          handlingTime: {
            '@type': 'QuantitativeValue',
            minValue: 1,
            maxValue: 2,
            unitCode: 'DAY',
          },
          transitTime: {
            '@type': 'QuantitativeValue',
            minValue: 5,
            maxValue: 7,
            unitCode: 'DAY',
          },
        },
      },
      seller: {
        '@type': 'Organization',
        name: 'Surya Jewellers',
      },
    },
  };

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: SITE_URL,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Collections',
        item: `${SITE_URL}/products`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: product.name,
        item: `${SITE_URL}/products/${product.slug}`,
      },
    ],
  };

  const relatedProducts: RelatedProduct[] = products
    .filter((p: any) => p._id !== raw._id && (p.category || 'Rings') === (raw.category || 'Rings'))
    .slice(0, 3)
    .map((p: any) => ({
      _id: p._id,
      name: correctSpelling(p.name),
      slug: getProductCanonicalSlug(p),
      price: p.price,
      images: p.images || [],
      mainStoneType: p.mainStoneType || 'None',
      category: p.category || 'Rings',
    }));

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <ProductDetailClient product={product} relatedProducts={relatedProducts} />
    </>
  );
}
