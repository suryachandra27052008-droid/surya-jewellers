import type { Metadata } from 'next';
import AboutClient from './AboutClient';

export const metadata: Metadata = {
  title: { absolute: 'About Surya Jewellers | Story, Founders & Craft Jaipur' },
  description:
    'Family-owned silver jeweller in Jaipur since 2003. Handcrafted 92.5 sterling silver set with certified natural gemstones. 90% one-of-a-kind designs.',
  alternates: {
    canonical: 'https://www.suryajewellers.com/about',
  },
  openGraph: {
    title: 'About Surya Jewellers | Story, Founders & Craft Jaipur',
    description:
      'Family-owned silver jeweller in Jaipur since 2003. Certified natural gemstones, Certificate of Authenticity, lifetime maintenance, worldwide shipping.',
    type: 'website',
    url: 'https://www.suryajewellers.com/about',
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
