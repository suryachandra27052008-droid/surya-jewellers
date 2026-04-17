import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact Us | Visit Surya Jewellers in Jaipur',
  description:
    'Contact Surya Jewellers in Jaipur. Visit us at B-169 Anandpuri, Moti Doongri Rd. Open Mon–Sat 10AM–8PM. Call +91 99839 39306 or WhatsApp us for enquiries.',
  alternates: {
    canonical: 'https://suryajewellers.shop/contact',
  },
  openGraph: {
    title: 'Contact Surya Jewellers | Jaipur Studio',
    description:
      'Visit our studio at B-169 Anandpuri, Moti Doongri Rd, Jaipur. Open Monday to Saturday, 10AM–8PM. Call or WhatsApp +91 99839 39306.',
    type: 'website',
    url: 'https://suryajewellers.shop/contact',
    images: [{ url: '/logo_sj.png', width: 512, height: 512, alt: 'Surya Jewellers' }],
  },
  twitter: {
    card: 'summary',
    title: 'Contact Surya Jewellers | Jaipur Studio',
    description: 'Visit us at B-169 Anandpuri, Moti Doongri Rd, Jaipur. Call +91 99839 39306.',
    images: ['/logo_sj.png'],
  },
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children;
}
