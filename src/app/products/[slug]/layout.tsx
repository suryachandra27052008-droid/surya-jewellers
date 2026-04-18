import type { Metadata } from 'next';
import { writeClient } from '@/lib/sanity/client';

type Props = {
  params: Promise<{ slug: string }>;
  children: React.ReactNode;
};

const buildUniqueSlug = (p: {
  mainStoneType?: string;
  category?: string;
  sku?: string;
  _id: string;
}) => {
  const stone = (p.mainStoneType && p.mainStoneType !== 'None' ? p.mainStoneType : 'silver')
    .toLowerCase().replace(/[^a-z0-9]+/g, '-');
  const cat = (p.category || 'jewellery').toLowerCase().replace(/[^a-z0-9]+/g, '-');
  const sku = String(p.sku || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || p._id.slice(-6);
  return `${stone}-${cat}-${sku}`.replace(/-+/g, '-');
};

interface SanityProduct {
  _id: string;
  name: string;
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
      `*[_type == "product"]{ _id, name, description, "images": images[].asset->url, mainStoneType, "category": category->name, sku }`,
      {},
      { next: { revalidate: 60 } }
    );
    product = products.find((p) => buildUniqueSlug(p) === slug)
      ?? products.find((p) => (p as any).slug === slug)
      ?? null;
  } catch {
    // fall through
  }

  if (!product) {
    return { title: 'Product Not Found | Surya Jewellers' };
  }

  const title = `${product.name} | Surya Jewellers`;
  const description = product.description
    ? product.description.slice(0, 160)
    : `${product.name} — handcrafted 92.5 sterling silver jewellery from Surya Jewellers, Jaipur.`;
  const image = product.images?.[0] ?? '/logo_sj.png';
  const url = `https://suryajewellers.shop/products/${slug}`;

  return {
    title,
    description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title,
      description,
      type: 'website',
      url,
      images: [{ url: image, alt: product.name }],
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
