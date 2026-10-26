'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'motion/react';
import { Suspense, useCallback, useEffect, useRef, useState } from 'react';
import { Check, Clock, TriangleAlert } from 'lucide-react';
import { useCartStore } from '@/stores/cart-store';

function OrderSuccessContent() {
  const searchParams = useSearchParams();
  const rawId = searchParams.get('id');
  const payment = searchParams.get('payment');
  const paypalToken = searchParams.get('token'); // PayPal order ID on redirect-back
  const recoveryOnly = searchParams.get('recover') === '1';

  const clearCart = useCartStore((s) => s.clearCart);
  const [orderId, setOrderId] = useState(rawId || paypalToken || 'N/A');
  const [capturing, setCapturing] = useState(payment === 'paypal' && !!paypalToken);
  const [captureError, setCaptureError] = useState('');
  const [paymentPending, setPaymentPending] = useState(false);
  const captured = useRef(false);

  const recordPayment = useCallback(async () => {
    let pending = null;
    try {
      const raw = localStorage.getItem('paypal_pending_order');
      if (raw) pending = JSON.parse(raw);
    } catch {
      // New checkouts also have a private server-side copy of their items.
    }
    const response = await fetch('/api/save-paypal-order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        paypalOrderId: paypalToken,
        items: pending?.items ?? [],
        customer: pending?.customer ?? {},
        couponCode: pending?.couponCode,
      }),
    });
    const result = await response.json();
    if (!response.ok || !result.success) {
      throw new Error('Your order could not be recorded. Do not pay again; contact support with this reference.');
    }
    setOrderId(result.paymentId || paypalToken || 'N/A');
    setPaymentPending(Boolean(result.pending));
    setCaptureError('');
    if (!result.pending) {
      try { localStorage.removeItem('paypal_pending_order'); } catch { /* Browser storage may be disabled. */ }
      clearCart();
    }
  }, [paypalToken, clearCart]);

  const checkPaymentStatus = async () => {
    setCapturing(true);
    try {
      // Checking a recorded capture never initiates another payment.
      await recordPayment();
    } catch (error) {
      setCaptureError((error as Error).message);
    } finally {
      setCapturing(false);
    }
  };

  useEffect(() => {
    if (payment !== 'paypal' || !paypalToken || captured.current) return;
    captured.current = true;

    async function captureAndSave() {
      try {
        if (!recoveryOnly) {
          const captureRes = await fetch('/api/paypal/capture-order', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ orderID: paypalToken }),
          });
          const capture = await captureRes.json();

          if (!captureRes.ok || capture.error || capture.status === 'VOIDED') {
            throw new Error('PayPal payment could not be confirmed. Do not pay again; contact support with this reference.');
          }
        }
        await recordPayment();
      } catch (err) {
        console.error('PayPal capture error:', err);
        setCaptureError((err as Error).message || 'Order could not be confirmed. Please contact support.');
        setOrderId(paypalToken ?? 'N/A');
      } finally {
        setCapturing(false);
      }
    }

    captureAndSave();
  }, [payment, paypalToken, recordPayment, recoveryOnly]);

  const needsAttention = Boolean(captureError) || orderId === 'N/A';

  if (capturing) {
    return (
      <div className="pt-8 pb-20 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-charcoal-muted text-sm">Confirming your PayPal payment…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-8 pb-20 min-h-screen flex items-center">
      <div className="max-w-lg mx-auto px-4 text-center">
        {/* Animated Checkmark */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.2 }}
          className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-8 ${needsAttention ? 'bg-red-50 text-red-600' : paymentPending ? 'bg-amber-50 text-amber-700' : 'bg-green-50 text-green-500'}`}
        >
          {needsAttention ? <TriangleAlert className="w-12 h-12" /> : paymentPending ? <Clock className="w-12 h-12" /> : <Check className="w-12 h-12" />}
        </motion.div>

        {/* Text */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <span className="text-gold text-xs tracking-[0.4em] uppercase">
            {needsAttention || paymentPending ? 'Order Status' : 'Thank You'}
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl text-charcoal mt-4 mb-4">
            {needsAttention ? 'Order Needs Attention' : paymentPending ? 'Payment Pending' : 'Order Placed Successfully'}
          </h1>
          <p className="text-charcoal-muted text-sm leading-relaxed mb-8">
            {needsAttention
              ? 'We could not confirm and record your order. Please keep your bag and payment reference, and contact us before trying another payment.'
              : paymentPending
                ? 'Your items have been recorded, but PayPal has not completed the payment yet. Your order is pending payment confirmation.'
                : 'Your order has been confirmed. You will receive a confirmation email shortly.'}
          </p>

          {captureError && (
            <p role="alert" className="text-red-600 text-sm mb-4">{captureError}</p>
          )}

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
          {payment === 'paypal' && paypalToken && (needsAttention || paymentPending) && (
            <button onClick={checkPaymentStatus} className="btn-gold w-full mb-4">
              Check Payment Status
            </button>
          )}
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
        <div className="pt-8 pb-20 min-h-screen flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <OrderSuccessContent />
    </Suspense>
  );
}
