import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: { absolute: 'About Surya Jewellers | Est. 2003, Jaipur' },
  description:
    'Learn about Surya Jewellers founded by Sanjay and Pooja Chandra in 2003. Premium silver jewellery manufacturers in Jaipur with global presence in Hong Kong, Bangkok and Europe.',
  alternates: {
    canonical: 'https://www.suryajewellers.com/about',
  },
  openGraph: {
    title: 'About Surya Jewellers | Est. 2003, Jaipur',
    description:
      'Learn about Surya Jewellers founded by Sanjay and Pooja Chandra in 2003. Premium silver jewellery manufacturers in Jaipur with global presence in Hong Kong, Bangkok and Europe.',
    type: 'website',
    url: 'https://www.suryajewellers.com/about',
    images: [{ url: '/logo_sj.png', width: 512, height: 512, alt: 'Surya Jewellers' }],
  },
  twitter: {
    card: 'summary',
    title: 'About Surya Jewellers | Est. 2003, Jaipur',
    description:
      'Premium 92.5 sterling silver jewellery manufacturers in Jaipur since 2003. Global presence across Hong Kong, Bangkok and Europe.',
    images: ['/logo_sj.png'],
  },
};

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return children;
}
