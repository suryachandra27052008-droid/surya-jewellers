'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'motion/react';
import { Suspense } from 'react';

function OrderSuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('id') || 'N/A';

  return (
    <div className="pt-32 pb-20 min-h-screen flex items-center">
      <div className="max-w-lg mx-auto px-4 text-center">
        {/* Animated Checkmark */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.2 }}
          className="w-24 h-24 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-8"
        >
          <motion.svg
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="w-12 h-12 text-green-500"
          >
            <motion.path
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4.5 12.75l6 6 9-13.5"
            />
          </motion.svg>
        </motion.div>

        {/* Text */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <span className="text-gold text-xs tracking-[0.4em] uppercase">
            Thank You
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl text-charcoal mt-4 mb-4">
            Order Placed Successfully
          </h1>
          <p className="text-charcoal-muted text-sm leading-relaxed mb-8">
            Your order has been confirmed and we are preparing your exquisite
            jewelry for dispatch. You will receive a confirmation email shortly.
          </p>

          {/* Order ID */}
          <div className="bg-cream rounded p-6 mb-8 border border-cream-dark">
            <p className="text-xs tracking-[0.2em] uppercase text-charcoal-muted mb-2">
              Order Reference
            </p>
            <p className="font-mono text-sm text-charcoal font-medium break-all">
              {orderId}
            </p>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/products" className="btn-gold">
              Continue Shopping
            </Link>
            <Link href="/" className="btn-gold-outline">
              Back to Home
            </Link>
          </div>

          {/* Note */}
          <p className="text-xs text-charcoal-muted mt-8">
            Need help? Contact us at{' '}
            <span className="text-gold">suryajewellersjaipur@gmail.com</span>
          </p>
        </motion.div>
      </div>
    </div>
  );
}

export default function OrderSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="pt-32 pb-20 min-h-screen flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <OrderSuccessContent />
    </Suspense>
  );
}
