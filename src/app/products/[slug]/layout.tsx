import type { Metadata } from 'next';
import { client } from '@/lib/sanity/client';

type Props = {
  params: Promise<{ slug: string }>;
  children: React.ReactNode;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;

  const product = await client.fetch<{ name: string; description?: string; images?: string[] } | null>(
    `*[_type == "product" && slug.current == $slug][0] {
      name,
      description,
      "images": images[].asset->url
    }`,
    { slug },
    { next: { revalidate: 3600 } }
  );

  if (!product) {
    return {
      title: 'Product Not Found | Surya Jewellers',
    };
  }

  const title = `${product.name} | Surya Jewellers`;
  const description = product.description
    ? product.description.slice(0, 160)
    : `${product.name} — handcrafted 92.5 sterling silver jewellery from Surya Jewellers, Jaipur.`;
  const image = product.images?.[0] ?? '/logo_sj.png';

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'website',
      url: `https://suryajewellers.shop/products/${slug}`,
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
