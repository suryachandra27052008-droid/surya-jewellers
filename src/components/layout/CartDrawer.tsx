'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useCartStore } from '@/stores/cart-store';
import { useCurrencyStore, formatPrice } from '@/stores/currency-store';
import { calculateSaleTotals, type SeasonalSaleSettings } from '@/lib/sale';
import Link from 'next/link';
import Image from 'next/image';
import { catalogImageLoader } from '@/lib/sanity/catalog-image-loader';

export default function CartDrawer() {
  const { items, isOpen, closeCart, removeItem, updateQuantity, getSubtotal } =
    useCartStore();
  const currency = useCurrencyStore((s) => s.currency);
  const [saleSettings, setSaleSettings] = useState<SeasonalSaleSettings | null>(null);

  const subtotal = getSubtotal();
  const { sale, discountAmount, discountedSubtotal } = calculateSaleTotals(subtotal, saleSettings);

  useEffect(() => {
    if (!isOpen) return;
    fetch('/api/settings')
      .then((r) => r.json())
      .then(setSaleSettings)
      .catch(() => setSaleSettings(null));
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 z-50"
            onClick={closeCart}
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-cream z-50 flex flex-col shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-cream-dark">
              <h2 className="font-serif text-xl tracking-[0.1em]">
                Shopping Bag
              </h2>
              <button
                onClick={closeCart}
                className="p-1 hover:text-gold transition-colors"
                aria-label="Close cart"
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
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto px-6 py-4">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1}
                    stroke="currentColor"
                    className="w-16 h-16 text-charcoal-muted/30 mb-4"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
                    />
                  </svg>
                  <p className="font-serif text-lg text-charcoal-muted mb-2">
                    Your bag is empty
                  </p>
                  <p className="text-sm text-charcoal-muted/60 mb-6">
                    Discover our exquisite collections
                  </p>
                  <Link
                    href="/products"
                    onClick={closeCart}
                    className="btn-gold"
                  >
                    Shop Now
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {items.map((item) => (
                    <motion.div
                      key={item._id}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: 100 }}
                      className="flex gap-4 bg-white p-3 rounded"
                    >
                      {/* Image */}
                      <div className="w-20 h-20 bg-cream-dark rounded overflow-hidden flex-shrink-0 relative">
                        {item.image ? (
                          <Image
                            src={item.image}
                            loader={catalogImageLoader}
                            alt={item.name}
                            fill
                            className="object-cover"
                            sizes="80px"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-charcoal-muted/30">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="w-8 h-8">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M21 11.25v8.25a1.5 1.5 0 01-1.5 1.5H5.25a1.5 1.5 0 01-1.5-1.5v-8.25M12 4.875A2.625 2.625 0 109.375 7.5H12m0-2.625V7.5m0-2.625A2.625 2.625 0 1114.625 7.5H12m0 0V21m-8.625-9.75h18c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125h-18c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
                            </svg>
                          </div>
                        )}
                      </div>

                      {/* Details */}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-medium truncate">
                          {item.name}
                        </h3>
                        <p className="text-sm text-gold font-semibold mt-1">
                          {formatPrice(item.price, currency)}
                        </p>

                        {/* Quantity Controls */}
                        <div className="flex items-center gap-3 mt-2">
                          <button
                            onClick={() =>
                              updateQuantity(item._id, item.quantity - 1)
                            }
                            className="w-7 h-7 border border-cream-dark flex items-center justify-center text-sm hover:border-gold transition-colors"
                          >
                            −
                          </button>
                          <span className="text-sm font-medium w-6 text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() =>
                              updateQuantity(item._id, item.quantity + 1)
                            }
                            disabled={item.quantity >= (item.stockQuantity ?? 1)}
                            className="w-7 h-7 border border-cream-dark flex items-center justify-center text-sm hover:border-gold transition-colors disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:border-cream-dark"
                          >
                            +
                          </button>
                          {item.quantity >= (item.stockQuantity ?? 1) && (
                            <span className="text-[10px] text-charcoal-muted/60 uppercase tracking-wide">Max</span>
                          )}
                        </div>
                      </div>

                      {/* Remove */}
                      <button
                        onClick={() => removeItem(item._id)}
                        className="self-start p-1 text-charcoal-muted/40 hover:text-red-500 transition-colors"
                        aria-label={`Remove ${item.name}`}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={1.5}
                          stroke="currentColor"
                          className="w-4 h-4"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="border-t border-cream-dark px-6 py-5 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm tracking-[0.1em] uppercase text-charcoal-muted">
                    Subtotal
                  </span>
                  <span className="text-lg font-serif font-semibold">
                    {formatPrice(subtotal, currency)}
                  </span>
                </div>
                {sale && discountAmount > 0 && (
                  <div className="flex items-center justify-between text-green-700">
                    <span className="text-sm tracking-[0.08em] uppercase">
                      {sale.name} {sale.percent}%
                    </span>
                    <span className="text-sm font-semibold">
                      -{formatPrice(discountAmount, currency)}
                    </span>
                  </div>
                )}
                {sale && discountAmount > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm tracking-[0.1em] uppercase text-charcoal-muted">
                      After Discount
                    </span>
                    <span className="text-lg font-serif font-semibold">
                      {formatPrice(discountedSubtotal, currency)}
                    </span>
                  </div>
                )}
                <p className="text-xs text-charcoal-muted">
                  Shipping & taxes calculated at checkout
                </p>
                <Link
                  href="/checkout"
                  onClick={closeCart}
                  className="btn-gold block text-center w-full"
                >
                  Proceed to Checkout
                </Link>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
