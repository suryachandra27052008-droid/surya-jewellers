import type { Metadata } from 'next';
import Link from 'next/link';
import { cache } from 'react';
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

type ProductDoc = {
  _id: string;
  name?: string;
  slug?: string;
  sku?: string;
  price?: number;
  category?: string;
  silverWeight?: number;
  grossWeight?: number;
  mainStoneType?: string;
  totalCaratWeight?: number;
  diamondWeight?: number;
  diamondColorClarity?: string;
  secondaryStoneType?: string;
  csWeight?: number;
  barcode?: string;
  images?: string[];
  description?: string;
  inStock?: boolean;
  stockQuantity?: number;
};

const getProducts = cache(async (): Promise<ProductDoc[]> => {
  try {
    return await writeClient.fetch<ProductDoc[]>(PRODUCT_QUERY, {}, { cache: 'no-store' });
  } catch {
    return [];
  }
});

function findProduct(products: ProductDoc[], slug: string): ProductDoc | undefined {
  const slugLower = slug.toLowerCase();
  return products.find((product) => getProductCanonicalSlug(product) === slug)
    ?? products.find((product) => product.slug === slug)
    ?? products.find((product) => (product.sku || '').toLowerCase() === slugLower)
    ?? products.find((product) =>
      (product.name || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') === slug
    );
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const product = findProduct(await getProducts(), slug);
  if (!product || Number(product.price) < 1000) {
    return { title: 'Product Not Found', robots: { index: false, follow: false } };
  }
  const canonicalSlug = getProductCanonicalSlug(product);
  const displayName = getProductDisplayName(product);
  const title = `${displayName} | 92.5 Silver`;
  const description = getProductMetaDescription(product);
  const image = product.images?.[0];
  return {
    title,
    description,
    alternates: { canonical: `${SITE_URL}/products/${canonicalSlug}` },
    openGraph: {
      title,
      description,
      url: `${SITE_URL}/products/${canonicalSlug}`,
      type: 'website',
      images: image ? [{ url: image, alt: displayName }] : undefined,
    },
  };
}

// Always fetch fresh product data so image updates from bulk upload are instant.
export const dynamic = 'force-dynamic';
export const dynamicParams = true;

export async function generateStaticParams() {
  try {
    const products = await writeClient.fetch<{ _id: string; name?: string; slug?: string; mainStoneType?: string; category?: string; sku?: string }[]>(
      `*[_type == "product" && price >= 1000]{ _id, name, "slug": slug.current, mainStoneType, "category": category->name, sku }`,
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

  const products = await getProducts();
  const raw = findProduct(products, slug);

  if (!raw || Number(raw.price) < 1000) {
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
    sku: raw.sku || '',
    price: raw.price || 0,
    category: raw.category || 'Rings',
    silverWeight: raw.silverWeight || 0,
    grossWeight: raw.grossWeight || 0,
    mainStoneType: correctSpelling(raw.mainStoneType || 'None'),
    totalCaratWeight: raw.totalCaratWeight || 0,
    diamondColorClarity: raw.diamondColorClarity || '',
    description: correctSpelling(raw.description || ''),
    inStock: raw.inStock ?? true,
    stockQuantity: raw.stockQuantity ?? 1,
    images: raw.images || [],
    secondaryStoneType: correctSpelling(raw.secondaryStoneType || ''),
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
    .filter((p) => p._id !== raw._id && Number(p.price) >= 1000 && (p.category || 'Rings') === (raw.category || 'Rings'))
    .slice(0, 3)
    .map((p) => ({
      _id: p._id,
      name: correctSpelling(p.name || ''),
      slug: getProductCanonicalSlug(p),
      price: p.price || 0,
      images: p.images || [],
      mainStoneType: correctSpelling(p.mainStoneType || 'None'),
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
