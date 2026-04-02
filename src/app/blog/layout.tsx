import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'The Journal | Surya Jewellers',
  description:
    'Jewellery care tips, gemstone guides and styling advice from Surya Jewellers Jaipur.',
  keywords: [
    'jewellery care tips',
    'sterling silver care',
    'gemstone guide',
    'how to style silver jewellery',
    'natural diamond guide',
    'Jaipur jewellery blog',
  ],
  openGraph: {
    title: 'The Journal | Surya Jewellers',
    description:
      'Jewellery care tips, gemstone guides and styling advice from Surya Jewellers Jaipur.',
    type: 'website',
    url: 'https://suryajewellers.shop/blog',
    images: [{ url: '/logo_sj.png', width: 512, height: 512, alt: 'Surya Jewellers Journal' }],
  },
  twitter: {
    card: 'summary',
    title: 'The Journal | Surya Jewellers',
    description:
      'Jewellery care tips, gemstone guides and styling advice from our studio in Jaipur.',
    images: ['/logo_sj.png'],
  },
};

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return children;
}
