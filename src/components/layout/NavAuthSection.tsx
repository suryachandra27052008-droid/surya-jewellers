'use client';

import Link from 'next/link';
import { useAuth, UserButton } from '@clerk/nextjs';

export default function NavAuthSection() {
  const { isSignedIn } = useAuth();

  if (isSignedIn) {
    return (
      <UserButton
        appearance={{
          elements: {
            avatarBox: 'w-8 h-8 border border-gold/30',
            userButtonPopoverCard: 'bg-white border border-gray-200 shadow-2xl',
            userButtonPopoverActionButton: 'text-charcoal hover:bg-cream',
            userButtonPopoverActionButtonText: 'text-charcoal',
            userButtonPopoverFooter: 'border-t border-gray-100',
          },
        }}
      />
    );
  }

  return (
    <Link
      href="/sign-in"
      className="hidden md:inline-block text-xs tracking-[0.15em] uppercase text-charcoal hover:text-gold transition-colors duration-300 border border-charcoal/20 hover:border-gold/40 px-4 py-2"
    >
      Sign In
    </Link>
  );
}
