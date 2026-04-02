import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Collections | Surya Jewellers — 92.5 Sterling Silver',
  description:
    'Browse our exclusive 92.5 sterling silver jewellery collection with natural diamonds, rubies, emeralds and sapphires. One piece one design.',
  keywords: [
    '92.5 sterling silver jewellery',
    'silver rings with diamonds',
    'natural ruby jewellery',
    'emerald silver necklace',
    'sapphire earrings',
    'handcrafted jewellery Jaipur',
    'one of a kind jewellery',
  ],
  openGraph: {
    title: 'Collections | Surya Jewellers — 92.5 Sterling Silver',
    description:
      'Browse our exclusive 92.5 sterling silver jewellery collection with natural diamonds, rubies, emeralds and sapphires. One piece one design.',
    type: 'website',
    url: 'https://suryajewellers.shop/products',
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
