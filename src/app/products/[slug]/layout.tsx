import type { Metadata } from 'next';
import { writeClient } from '@/lib/sanity/client';
import {
  getProductCanonicalSlug,
  getProductImageAlt,
  getProductMetaDescription,
  getProductSeoTitle,
  SITE_URL,
} from '@/lib/seo/product';

type Props = {
  params: Promise<{ slug: string }>;
  children: React.ReactNode;
};

interface SanityProduct {
  _id: string;
  name: string;
  slug?: string;
  description?: string;
  images?: string[];
  mainStoneType?: string;
  category?: string;
  sku?: string;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;

  let product: SanityProduct | null = null;

  try {
    const products = await writeClient.fetch<SanityProduct[]>(
      `*[_type == "product"]{ _id, name, "slug": slug.current, description, "images": images[].asset->url, mainStoneType, "category": category->name, sku }`,
      {},
      { next: { revalidate: 60 } }
    );
    product = products.find((p) => getProductCanonicalSlug(p) === slug)
      ?? products.find((p) => p.slug === slug)
      ?? null;
  } catch {
    // fall through
  }

  if (!product) {
    return { title: { absolute: 'Product Not Found | Surya Jewellers' } };
  }

  const canonicalSlug = getProductCanonicalSlug(product);
  const title = getProductSeoTitle(product);
  const description = getProductMetaDescription(product);
  const image = product.images?.[0] ?? '/logo_sj.png';
  const url = `${SITE_URL}/products/${canonicalSlug}`;

  return {
    title: { absolute: title },
    description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title,
      description,
      type: 'website',
      url,
      images: [{ url: image, alt: getProductImageAlt(product) }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [image],
    },
  };
}

export default function ProductSlugLayout({ children }: { children: React.ReactNode }) {
  return children;
}
