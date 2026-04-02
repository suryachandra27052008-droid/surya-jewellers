'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'motion/react';
import { SignedIn, SignedOut, UserButton } from '@clerk/nextjs';
import { useCartStore } from '@/stores/cart-store';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const toggleCart = useCartStore((s) => s.toggleCart);
  const itemCount = useCartStore((s) => s.getItemCount());

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/about', label: 'About Us' },
    { href: '/products', label: 'Collections' },
    { href: '/blog', label: 'Journal' },
    { href: '/contact', label: 'Contact' },
  ];

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled
            ? 'glass py-3 shadow-sm'
            : 'bg-transparent py-5'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center group">
            <Image
              src="/logo_sj.webp"
              alt="Surya Jewellers"
              height={50}
              width={160}
              style={{ height: '50px', width: 'auto' }}
              className="drop-shadow-[0_1px_4px_rgba(0,0,0,0.4)]"
              priority
              fetchPriority="high"
            />
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm tracking-[0.15em] uppercase text-charcoal hover:text-gold transition-colors duration-300 relative group"
              >
                {link.label}
                <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-gold group-hover:w-full transition-all duration-300" />
              </Link>
            ))}
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-4">
            {/* Auth */}
            <SignedOut>
              <Link
                href="/sign-in"
                className="hidden md:inline-block text-xs tracking-[0.15em] uppercase text-charcoal hover:text-gold transition-colors duration-300 border border-current/20 px-4 py-2"
              >
                Sign In
              </Link>
            </SignedOut>
            <SignedIn>
              <UserButton
                afterSignOutUrl="/"
                appearance={{
                  elements: {
                    avatarBox: 'w-8 h-8 border border-gold/30',
                    userButtonPopoverCard: 'bg-[#1a1a1a] border border-white/10 shadow-2xl',
                    userButtonPopoverActionButton: 'text-white/70 hover:text-white hover:bg-white/8',
                    userButtonPopoverActionButtonText: 'text-white/70',
                    userButtonPopoverFooter: 'border-t border-white/10',
                  },
                }}
              />
            </SignedIn>

            {/* Cart Button */}
            <button
              onClick={toggleCart}
              className="relative p-2 text-charcoal hover:text-gold transition-colors"
              aria-label="Shopping cart"
              id="cart-toggle"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-6 h-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
                />
              </svg>
              {mounted && itemCount > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1 w-5 h-5 bg-gold text-white text-[0.65rem] font-bold rounded-full flex items-center justify-center"
                >
                  {itemCount}
                </motion.span>
              )}
            </button>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 text-charcoal"
              aria-label="Toggle menu"
              id="mobile-menu-toggle"
            >
              <div className="space-y-1.5">
                <motion.span
                  animate={mobileOpen ? { rotate: 45, y: 6 } : { rotate: 0, y: 0 }}
                  className="block w-6 h-[1.5px] bg-charcoal"
                />
                <motion.span
                  animate={mobileOpen ? { opacity: 0 } : { opacity: 1 }}
                  className="block w-6 h-[1.5px] bg-charcoal"
                />
                <motion.span
                  animate={mobileOpen ? { rotate: -45, y: -6 } : { rotate: 0, y: 0 }}
                  className="block w-6 h-[1.5px] bg-charcoal"
                />
              </div>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-40 bg-cream pt-24 md:hidden"
          >
            <nav className="flex flex-col items-center gap-8 py-12">
              {navLinks.map((link, i) => (
                <motion.div
                  key={link.href}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Link
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className="text-2xl font-serif tracking-[0.15em] text-charcoal hover:text-gold transition-colors"
                  >
                    {link.label}
                  </Link>
                </motion.div>
              ))}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: navLinks.length * 0.1 }}
              >
                <SignedOut>
                  <Link
                    href="/sign-in"
                    onClick={() => setMobileOpen(false)}
                    className="text-lg tracking-[0.2em] uppercase text-charcoal/60 hover:text-gold transition-colors"
                  >
                    Sign In
                  </Link>
                </SignedOut>
                <SignedIn>
                  <Link
                    href="/account"
                    onClick={() => setMobileOpen(false)}
                    className="text-lg tracking-[0.2em] uppercase text-charcoal/60 hover:text-gold transition-colors"
                  >
                    My Account
                  </Link>
                </SignedIn>
              </motion.div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
