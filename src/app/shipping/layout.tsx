import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: { absolute: 'Shipping & Returns | Surya Jewellers Jaipur' },
  description:
    'Free shipping across India on all orders. Standard delivery in 5–7 business days. 7-day return window for unused pieces. International shipping available with full insurance.',
  alternates: {
    canonical: 'https://www.suryajewellers.com/shipping',
  },
  openGraph: {
    title: 'Shipping & Returns | Surya Jewellers',
    description:
      'Free shipping across India. Standard delivery 5–7 business days. 7-day returns on unused pieces in original packaging.',
    type: 'website',
    url: 'https://www.suryajewellers.com/shipping',
    images: [{ url: '/logo_sj.png', width: 512, height: 512, alt: 'Surya Jewellers' }],
  },
  twitter: {
    card: 'summary',
    title: 'Shipping & Returns | Surya Jewellers',
    description: 'Free shipping across India. 7-day returns. International orders insured & tracked.',
    images: ['/logo_sj.png'],
  },
};

export default function ShippingLayout({ children }: { children: React.ReactNode }) {
  return children;
}
