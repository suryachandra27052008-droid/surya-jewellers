import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: { absolute: 'Wishlist | Surya Jewellers' },
  robots: {
    index: false,
    follow: false,
  },
};

export default function WishlistLayout({ children }: { children: React.ReactNode }) {
  return children;
}
