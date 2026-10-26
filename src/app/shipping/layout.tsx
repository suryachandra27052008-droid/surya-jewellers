import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: { absolute: 'Shipping & Returns | Surya Jewellers Jaipur' },
  description:
    'Shipping within India is free on orders from INR 2,000, otherwise INR 150. International shipping is a flat US$30 per order. View shipping and return terms.',
  alternates: {
    canonical: 'https://www.suryajewellers.com/shipping',
  },
  openGraph: {
    title: 'Shipping & Returns | Surya Jewellers',
    description:
      'Free shipping within India on orders from INR 2,000. Flat US$30 international shipping per order. View shipping and return terms.',
    type: 'website',
    url: 'https://www.suryajewellers.com/shipping',
    images: [{ url: '/logo_sj.png', width: 512, height: 512, alt: 'Surya Jewellers' }],
  },
  twitter: {
    card: 'summary',
    title: 'Shipping & Returns | Surya Jewellers',
    description: 'Domestic shipping from INR 150, free from INR 2,000. International shipping: flat US$30 per order.',
    images: ['/logo_sj.png'],
  },
};

export default function ShippingLayout({ children }: { children: React.ReactNode }) {
  return children;
}
