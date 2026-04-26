import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Wholesale & B2B | Partner with Surya Jewellers Jaipur',
  description:
    'Wholesale silver jewellery partnerships for retailers and distributors. Factory-direct pricing, 90% exclusive designs, Certificate of Authenticity on every piece. Based in Jaipur.',
  alternates: {
    canonical: 'https://www.suryajewellers.com/wholesale',
  },
  openGraph: {
    title: 'Wholesale Silver Jewellery | Surya Jewellers Jaipur',
    description:
      'Partner with Surya Jewellers for wholesale 92.5 sterling silver jewellery. Factory pricing, certified authentic, global shipping. Enquire today.',
    type: 'website',
    url: 'https://www.suryajewellers.com/wholesale',
    images: [{ url: '/logo_sj.png', width: 512, height: 512, alt: 'Surya Jewellers Wholesale' }],
  },
  twitter: {
    card: 'summary',
    title: 'Wholesale | Surya Jewellers Jaipur',
    description: 'Factory-direct 92.5 sterling silver jewellery for retailers. Certified, exclusive designs.',
    images: ['/logo_sj.png'],
  },
};

export default function WholesaleLayout({ children }: { children: React.ReactNode }) {
  return children;
}
