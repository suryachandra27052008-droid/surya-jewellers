import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: { absolute: 'Jewellery Journal | Surya Jewellers Jaipur' },
  description:
    'Jewellery care tips, gemstone guides and styling advice from Surya Jewellers Jaipur.',
  alternates: {
    canonical: 'https://www.suryajewellers.com/blog',
  },
  openGraph: {
    title: 'Jewellery Journal | Surya Jewellers Jaipur',
    description:
      'Jewellery care tips, gemstone guides and styling advice from Surya Jewellers Jaipur.',
    type: 'website',
    url: 'https://www.suryajewellers.com/blog',
    images: [{ url: '/logo_sj.png', width: 512, height: 512, alt: 'Surya Jewellers Journal' }],
  },
  twitter: {
    card: 'summary',
    title: 'Jewellery Journal | Surya Jewellers Jaipur',
    description:
      'Jewellery care tips, gemstone guides and styling advice from our studio in Jaipur.',
    images: ['/logo_sj.png'],
  },
};

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return children;
}
