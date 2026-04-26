import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Collections | Surya Jewellers — 92.5 Sterling Silver',
  description:
    'Browse our exclusive 92.5 sterling silver jewellery collection with natural diamonds, rubies, emeralds and sapphires. One piece one design.',
  alternates: {
    canonical: 'https://www.suryajewellers.com/products',
  },
  openGraph: {
    title: 'Collections | Surya Jewellers — 92.5 Sterling Silver',
    description:
      'Browse our exclusive 92.5 sterling silver jewellery collection with natural diamonds, rubies, emeralds and sapphires. One piece one design.',
    type: 'website',
    url: 'https://www.suryajewellers.com/products',
    images: [{ url: '/logo_sj.png', width: 512, height: 512, alt: 'Surya Jewellers Collections' }],
  },
  twitter: {
    card: 'summary',
    title: 'Collections | Surya Jewellers',
    description:
      '92.5 sterling silver jewellery with natural diamonds, rubies, emeralds and sapphires. Each piece uniquely handcrafted in Jaipur.',
    images: ['/logo_sj.png'],
  },
};

export default function ProductsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
