'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import Script from 'next/script';
import { motion } from 'motion/react';
import { useCartStore } from '@/stores/cart-store';
import { useCurrencyStore, formatPrice, CURRENCIES } from '@/stores/currency-store';
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js';
import { getShipping, isPromoActive, FREE_SHIPPING_THRESHOLD, STANDARD_SHIPPING_FEE } from '@/lib/shipping';
import AnimatedSection from '@/components/ui/AnimatedSection';

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Razorpay: any;
  }
}

export default function CheckoutPage() {
  const router = useRouter();
  const { items, getSubtotal, clearCart } = useCartStore();
  const { user } = useUser();
  const currency = useCurrencyStore((s) => s.currency);
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    address1: '',
    address2: '',
    city: '',
    state: '',
    pincode: '',
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  // Pre-fill form with Clerk user data
  useEffect(() => {
    if (user) {
      setForm((prev) => ({
        ...prev,
        fullName: prev.fullName || [user.firstName, user.lastName].filter(Boolean).join(' '),
        email: prev.email || user.primaryEmailAddress?.emailAddress || '',
      }));
    }
  }, [user]);

  if (!mounted) {
    return (
      <div className="pt-32 pb-16 text-center">
        <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin mx-auto" />
      </div>
    );
  }

  const subtotal = getSubtotal();
  const shipping = getShipping(subtotal);
  const total = subtotal + shipping;

  if (items.length === 0) {
    return (
      <div className="pt-32 pb-16 text-center">
        <h1 className="font-serif text-3xl text-charcoal mb-4">Your bag is empty</h1>
        <p className="text-charcoal-muted mb-8">Add some pieces before checking out.</p>
        <a href="/products" className="btn-gold">Shop Now</a>
      </div>
    );
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const isFormValid = () => {
    return (
      form.fullName.trim() &&
      form.email.trim() &&
      form.phone.trim() &&
      form.address1.trim() &&
      form.city.trim() &&
      form.state.trim() &&
      form.pincode.trim()
    );
  };

  const handlePayment = async () => {
    if (!isFormValid()) {
      alert('Please fill in all required fields.');
      return;
    }

    setLoading(true);

    try {
      // Create order on backend
      const res = await fetch('/api/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: total }),
      });

      const order = await res.json();

      if (!order.id) {
        // If Razorpay is not configured, simulate success
        clearCart();
        router.push('/order-success?id=DEMO-' + Date.now());
        return;
      }

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: 'Surya Jewellers',
        description: 'Sterling Silver Jewelry Purchase',
        image: 'https://suryajewellers.shop/icon.png',
        order_id: order.id,
        notes: {
          website: 'https://suryajewellers.shop',
        },
        handler: async function (response: { razorpay_payment_id: string; razorpay_order_id: string; razorpay_signature: string }) {
          // Verify payment and save order
          const verifyRes = await fetch('/api/verify-payment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              ...response,
              items: items.map((item) => ({
                _id: item._id,
                name: item.name,
                price: item.price,
                quantity: item.quantity,
              })),
              customer: form,
              subtotal,
              shipping,
              total,
            }),
          });

          const result = await verifyRes.json();
          if (result.success) {
            clearCart();
            router.push(`/order-success?id=${response.razorpay_payment_id}`);
          } else {
            alert('Payment verification failed. Please contact support.');
          }
        },
        prefill: {
          name: form.fullName,
          email: form.email,
          contact: form.phone,
        },
        theme: {
          color: '#D4AF37',
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch {
      // If API fails, simulate success for demo
      clearCart();
      router.push('/order-success?id=DEMO-' + Date.now());
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" />

      <div className="pt-28 pb-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection className="text-center mb-12">
            <span className="text-gold text-xs tracking-[0.4em] uppercase">
              Secure Checkout
            </span>
            <h1 className="font-serif text-3xl sm:text-4xl mt-4 text-charcoal gold-underline">
              Complete Your Order
            </h1>
          </AnimatedSection>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
            {/* Shipping Form */}
            <div className="lg:col-span-3">
              <AnimatedSection>
                <div className="bg-white rounded p-6 sm:p-8 border border-cream-dark">
                  <h2 className="font-serif text-xl mb-6 text-charcoal">Shipping Details</h2>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="sm:col-span-2">
                      <label className="block text-xs tracking-[0.1em] uppercase text-charcoal-muted mb-2">Full Name *</label>
                      <input
                        type="text" name="fullName" value={form.fullName} onChange={handleChange}
                        className="input-field" placeholder="Enter your full name" required
                      />
                    </div>
                    <div>
                      <label className="block text-xs tracking-[0.1em] uppercase text-charcoal-muted mb-2">Email *</label>
                      <input
                        type="email" name="email" value={form.email} onChange={handleChange}
                        className="input-field" placeholder="email@example.com" required
                      />
                    </div>
                    <div>
                      <label className="block text-xs tracking-[0.1em] uppercase text-charcoal-muted mb-2">Phone *</label>
                      <input
                        type="tel" name="phone" value={form.phone} onChange={handleChange}
                        className="input-field" placeholder="+91 98765 43210" required
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-xs tracking-[0.1em] uppercase text-charcoal-muted mb-2">Address Line 1 *</label>
                      <input
                        type="text" name="address1" value={form.address1} onChange={handleChange}
                        className="input-field" placeholder="House/Flat No., Street" required
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-xs tracking-[0.1em] uppercase text-charcoal-muted mb-2">Address Line 2</label>
                      <input
                        type="text" name="address2" value={form.address2} onChange={handleChange}
                        className="input-field" placeholder="Landmark, Area (optional)"
                      />
                    </div>
                    <div>
                      <label className="block text-xs tracking-[0.1em] uppercase text-charcoal-muted mb-2">City *</label>
                      <input
                        type="text" name="city" value={form.city} onChange={handleChange}
                        className="input-field" placeholder="City" required
                      />
                    </div>
                    <div>
                      <label className="block text-xs tracking-[0.1em] uppercase text-charcoal-muted mb-2">State *</label>
                      <input
                        type="text" name="state" value={form.state} onChange={handleChange}
                        className="input-field" placeholder="State" required
                      />
                    </div>
                    <div>
                      <label className="block text-xs tracking-[0.1em] uppercase text-charcoal-muted mb-2">PIN Code *</label>
                      <input
                        type="text" name="pincode" value={form.pincode} onChange={handleChange}
                        className="input-field" placeholder="110001" required maxLength={6}
                      />
                    </div>
                  </div>
                </div>
              </AnimatedSection>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-2">
              <AnimatedSection delay={0.2}>
                <div className="bg-white rounded p-6 sm:p-8 border border-cream-dark sticky top-28">
                  <h2 className="font-serif text-xl mb-6 text-charcoal">Order Summary</h2>

                  {/* Items */}
                  <div className="space-y-4 mb-6">
                    {items.map((item) => (
                      <div key={item._id} className="flex items-center justify-between text-sm">
                        <div className="flex-1 min-w-0">
                          <p className="truncate text-charcoal">{item.name}</p>
                          <p className="text-charcoal-muted text-xs">Qty: {item.quantity}</p>
                        </div>
                        <span className="text-charcoal font-medium ml-4">
                          {formatPrice(item.price * item.quantity, currency)}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="h-[1px] bg-cream-dark mb-4" />

                  {/* Totals */}
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-charcoal-muted">Subtotal</span>
                      <span className="text-charcoal">{formatPrice(subtotal, currency)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-charcoal-muted">Shipping</span>
                      <span className="text-charcoal">
                        {shipping === 0 ? (
                          <span className="text-green-600">Free</span>
                        ) : (
                          formatPrice(shipping, currency)
                        )}
                      </span>
                    </div>
                    {shipping === 0 && isPromoActive() && (
                      <p className="text-xs text-green-600">Free shipping — limited time offer till 4th May 2026!</p>
                    )}
                    {shipping === 0 && !isPromoActive() && (
                      <p className="text-xs text-green-600">Free shipping on orders above {formatPrice(FREE_SHIPPING_THRESHOLD, currency)}!</p>
                    )}
                    {shipping > 0 && (
                      <p className="text-xs text-charcoal-muted">Free shipping on orders above {formatPrice(FREE_SHIPPING_THRESHOLD, currency)}.</p>
                    )}
                  </div>

                  <div className="h-[1px] bg-cream-dark my-4" />

                  <div className="flex justify-between items-baseline mb-6">
                    <span className="text-sm tracking-[0.1em] uppercase text-charcoal-muted">Total</span>
                    <span className="font-serif text-2xl text-charcoal">
                      {formatPrice(total, currency)}
                    </span>
                  </div>

                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    onClick={handlePayment}
                    disabled={loading}
                    className="btn-gold w-full text-center disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Processing...
                      </span>
                    ) : (
                      `Pay ${formatPrice(total, currency)}`
                    )}
                  </motion.button>

                  <p className="text-xs text-charcoal-muted text-center mt-4">
                    🔒 Secured by Razorpay. 100% safe & encrypted.
                  </p>

                  {/* PayPal — international payments */}
                  <div className="flex items-center gap-3 mt-6 mb-4">
                    <div className="flex-1 h-[1px] bg-cream-dark" />
                    <span className="text-xs text-charcoal-muted tracking-[0.15em] uppercase whitespace-nowrap">or pay with</span>
                    <div className="flex-1 h-[1px] bg-cream-dark" />
                  </div>

                  <PayPalScriptProvider
                    options={{
                      clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID ?? 'test',
                      currency: 'USD',
                    }}
                  >
                    <PayPalButtons
                      disabled={!isFormValid() || loading}
                      style={{ layout: 'vertical', shape: 'rect', tagline: false, label: 'paypal' }}
                      createOrder={(_data, actions) => {
                        const usdAmount = (total * CURRENCIES.USD.rate).toFixed(2);
                        return actions.order.create({
                          intent: 'CAPTURE',
                          purchase_units: [
                            {
                              amount: { value: usdAmount, currency_code: 'USD' },
                              description: 'Surya Jewellers — Sterling Silver Jewelry',
                            },
                          ],
                        });
                      }}
                      onApprove={async (_data, actions) => {
                        const capture = await actions.order!.capture();
                        const captureId =
                          capture.purchase_units?.[0]?.payments?.captures?.[0]?.id ??
                          capture.id ??
                          'paypal';
                        const res = await fetch('/api/save-paypal-order', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({
                            paypalOrderId: capture.id,
                            paypalCaptureId: captureId,
                            items: items.map((item) => ({
                              _id: item._id,
                              name: item.name,
                              price: item.price,
                              quantity: item.quantity,
                            })),
                            customer: form,
                            subtotal,
                            shipping,
                            total,
                          }),
                        });
                        const result = await res.json();
                        if (result.success) {
                          clearCart();
                          router.push(`/order-success?id=${capture.id}`);
                        } else {
                          alert(
                            'Order could not be saved. Please contact support. Ref: ' +
                              capture.id
                          );
                        }
                      }}
                    />
                  </PayPalScriptProvider>
                </div>
              </AnimatedSection>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
