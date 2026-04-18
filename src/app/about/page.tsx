import type { Metadata } from 'next';
import AboutClient from './AboutClient';

export const metadata: Metadata = {
  title: 'About Surya Jewellers — Our Story, Founders & Craft in Jaipur',
  description:
    'Learn about Surya Jewellers, founded in 2003 by Sanjay and Pooja Chandra in Jaipur. We craft 92.5 sterling silver jewellery set with natural diamonds and precious gemstones, with 90% one-of-a-kind designs.',
  alternates: {
    canonical: 'https://suryajewellers.shop/about',
  },
  openGraph: {
    title: 'About Surya Jewellers — Our Story, Founders & Craft in Jaipur',
    description:
      'Family-owned since 2003. Sanjay and Pooja Chandra craft 92.5 sterling silver jewellery in Jaipur with natural gemstones. 90% one-piece, one-design creations.',
    type: 'website',
    url: 'https://suryajewellers.shop/about',
    siteName: 'Surya Jewellers',
    images: [{ url: '/opengraph-image', width: 1200, height: 630, alt: 'Surya Jewellers — Our Story' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'About Surya Jewellers — Our Story & Craft',
    description: 'Family-owned since 2003 in Jaipur. Natural diamonds, precious gemstones, 92.5 sterling silver.',
    images: ['/opengraph-image'],
  },
};

export default function AboutPage() {
  return <AboutClient />;
}
