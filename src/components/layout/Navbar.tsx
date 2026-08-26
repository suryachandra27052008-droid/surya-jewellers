'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import { motion, AnimatePresence } from 'motion/react';
import { Heart } from 'lucide-react';
import { useCartStore } from '@/stores/cart-store';
import { useCurrencyStore, CURRENCIES, type CurrencyCode } from '@/stores/currency-store';
import { useWishlistStore } from '@/stores/wishlist-store';

const NavAuthSection = dynamic(() => import('./NavAuthSection'), {
  ssr: false,
  loading: () => (
    <Link
      href="/sign-in"
      className="hidden md:inline-block text-xs tracking-[0.15em] uppercase text-charcoal hover:text-gold transition-colors duration-300 border border-charcoal/20 hover:border-gold/40 px-4 py-2"
    >
      Sign In
    </Link>
  ),
});

const MobileAuthLink = dynamic(() => import('./MobileAuthLink'), {
  ssr: false,
  loading: () => (
    <Link
      href="/sign-in"
      className="text-lg tracking-[0.2em] uppercase text-charcoal/60 hover:text-gold transition-colors"
    >
      Sign In
    </Link>
  ),
});

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const toggleCart = useCartStore((s) => s.toggleCart);
  const itemCount = useCartStore((s) => s.getItemCount());
  const wishlistCount = useWishlistStore((s) => s.getCount());
  const [mounted, setMounted] = useState(false);
  const [currencyOpen, setCurrencyOpen] = useState(false);
  const currency = useCurrencyStore((s) => s.currency);
  const setCurrency = useCurrencyStore((s) => s.setCurrency);

  useEffect(() => {
    const mountTimer = window.setTimeout(() => setMounted(true), 0);
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.clearTimeout(mountTimer);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/about', label: 'About Us' },
    { href: '/products', label: 'Collections' },
    { href: '/blog', label: 'Journal' },
    { href: '/contact', label: 'Contact' },
    { href: '/wholesale', label: 'Wholesale' },
  ];

  return (
    <>
      <header
        className={`w-full transition-all duration-300 ${
          scrolled
            ? 'bg-white shadow-md py-3'
            : 'bg-white/80 backdrop-blur-xl shadow-sm py-4'
        }`}
        style={{ borderBottom: scrolled ? '1px solid rgba(212,175,55,0.15)' : '1px solid rgba(212,175,55,0.08)' }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center group">
            <div style={{ background: 'white', borderRadius: '8px', padding: '4px 8px', boxShadow: '0 1px 4px rgba(0,0,0,0.10)' }}>
              <Image
                src="/logo_sj.webp"
                alt="Surya Jewellers — 92.5 Sterling Silver Jewellery Jaipur"
                height={44}
                width={144}
                unoptimized
                style={{ height: '44px', width: 'auto' }}
                priority
                fetchPriority="high"
              />
            </div>
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
          <div className="flex items-center gap-3">
            {/* Currency Selector */}
            {mounted && (
              <div className="relative">
                <button
                  onClick={() => setCurrencyOpen(!currencyOpen)}
                  className="flex items-center gap-1 text-xs text-charcoal hover:text-gold transition-colors px-2 py-1.5 border border-charcoal/15 hover:border-gold/40 rounded"
                >
                  <span>{CURRENCIES[currency].flag}</span>
                  <span className="hidden sm:inline tracking-[0.1em] font-medium">{currency}</span>
                  <svg className="w-3 h-3 opacity-40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {currencyOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setCurrencyOpen(false)} />
                    <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-cream-dark shadow-xl rounded z-50 overflow-hidden">
                      {(Object.keys(CURRENCIES) as CurrencyCode[]).map((code) => (
                        <button
                          key={code}
                          onClick={() => { setCurrency(code); setCurrencyOpen(false); }}
                          className={`flex items-center gap-2.5 w-full text-left px-3 py-2.5 text-sm transition-colors ${
                            currency === code ? 'text-gold bg-gold/5 font-medium' : 'text-charcoal hover:bg-cream'
                          }`}
                        >
                          <span className="text-base">{CURRENCIES[code].flag}</span>
                          <span>{code}</span>
                          <span className="text-charcoal-muted text-xs ml-auto">{CURRENCIES[code].symbol}</span>
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Auth — loaded dynamically to defer Clerk UI hydration */}
            <NavAuthSection />

            <Link
              href="/wishlist"
              className="relative p-2 text-charcoal hover:text-gold transition-colors"
              aria-label="Wishlist"
            >
              <Heart className="h-6 w-6" strokeWidth={1.5} />
              {mounted && wishlistCount > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1 w-5 h-5 bg-gold text-white text-[0.65rem] font-bold rounded-full flex items-center justify-center"
                >
                  {wishlistCount}
                </motion.span>
              )}
            </Link>

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
                <MobileAuthLink
                  onClose={() => setMobileOpen(false)}
                  className="text-lg tracking-[0.2em] uppercase text-charcoal/60 hover:text-gold transition-colors"
                />
              </motion.div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
