'use client';

import Link from 'next/link';
import { useAuth } from '@clerk/nextjs';

interface Props {
  onClose: () => void;
  className?: string;
}

export default function MobileAuthLink({ onClose, className }: Props) {
  const { isSignedIn } = useAuth();
  return (
    <Link
      href={isSignedIn ? '/account' : '/sign-in'}
      onClick={onClose}
      className={className}
    >
      {isSignedIn ? 'My Account' : 'Sign In'}
    </Link>
  );
}
