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

function correctSpelling(text: string): string {
  return text
    .replace(/\bEmrald\b/g, 'Emerald')
    .replace(/\bemrald\b/g, 'emerald')
    .replace(/\bAmethist\b/g, 'Amethyst')
    .replace(/\bamethist\b/g, 'amethyst')
    .replace(/\bShaphire\b/g, 'Sapphire')
    .replace(/\bshaphire\b/g, 'sapphire')
    .replace(/\bMalti\b/g, 'Multi')
    .replace(/\bmalti\b/g, 'multi')
    .replace(/\bCristal\b/g, 'Crystal')
    .replace(/\bcristal\b/g, 'crystal')
    .replace(/\bearringss\b/gi, 'Earrings')
    .replace(/\bearring\b/gi, 'Earrings');
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

  const stone = product.mainStoneType && product.mainStoneType !== 'None'
    ? product.mainStoneType
    : null;
  const category = product.category || 'Jewellery';
  const cleanName = correctSpelling(product.name);
  const baseName = stone ? `${stone} ${category}` : cleanName;

  const title = `${baseName} in 92.5 Sterling Silver | Surya Jewellers Jaipur`;
  const description = product.description && product.description.length > 50
    ? correctSpelling(product.description.slice(0, 160))
    : `Shop this handcrafted ${baseName} in hallmarked 92.5 sterling silver from Surya Jewellers Jaipur. Includes natural gemstone details and Certificate of Authenticity.`;
  const image = product.images?.[0] ?? '/logo_sj.png';
  const url = `https://www.suryajewellers.com/products/${slug}`;

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
      images: [{ url: image, alt: `${baseName} in 92.5 sterling silver by Surya Jewellers Jaipur` }],
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
