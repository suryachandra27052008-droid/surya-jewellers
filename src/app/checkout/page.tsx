'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useUser } from '@clerk/nextjs';
import Script from 'next/script';
import { motion } from 'motion/react';
import { useCartStore } from '@/stores/cart-store';
import { useCurrencyStore, formatPrice } from '@/stores/currency-store';
import { getShipping, FREE_SHIPPING_THRESHOLD } from '@/lib/shipping';
import { calculateSaleTotals, type SeasonalSaleSettings } from '@/lib/sale';
import type { ActiveCoupon } from '@/lib/coupon';
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
  const [saleSettings, setSaleSettings] = useState<SeasonalSaleSettings | null>(null);
  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<ActiveCoupon | null>(null);
  const [couponMessage, setCouponMessage] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);
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
    const mountTimer = window.setTimeout(() => setMounted(true), 0);
    fetch('/api/settings')
      .then((r) => r.json())
      .then(setSaleSettings)
      .catch(() => setSaleSettings(null));
    return () => window.clearTimeout(mountTimer);
  }, []);

  useEffect(() => {
    if (!user) return;
    const userTimer = window.setTimeout(() => {
      setForm((prev) => ({
        ...prev,
        fullName: prev.fullName || [user.firstName, user.lastName].filter(Boolean).join(' '),
        email: prev.email || user.primaryEmailAddress?.emailAddress || '',
      }));
    }, 0);
    return () => window.clearTimeout(userTimer);
  }, [user]);

  if (!mounted) {
    return (
      <div className="pt-8 pb-16 text-center">
        <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin mx-auto" />
      </div>
    );
  }

  const subtotal = getSubtotal();
  const saleTotals = calculateSaleTotals(subtotal, saleSettings);
  const { sale } = saleTotals;
  const couponDiscountAmount = appliedCoupon ? Math.round((subtotal * appliedCoupon.percent) / 100) : 0;
  const couponIsBetter = appliedCoupon && couponDiscountAmount >= saleTotals.discountAmount;
  const activeDiscount: {
    name: string;
    percent: number;
    amount: number;
    code?: string;
    type: 'coupon' | 'sale';
  } | null = couponIsBetter
    ? {
        name: `${appliedCoupon.name} (${appliedCoupon.code})`,
        percent: appliedCoupon.percent,
        amount: couponDiscountAmount,
        code: appliedCoupon.code,
        type: 'coupon',
      }
    : sale
      ? {
          name: sale.name,
          percent: sale.percent,
          amount: saleTotals.discountAmount,
          type: 'sale',
        }
      : null;
  const discountAmount = activeDiscount?.amount ?? 0;
  const discountedSubtotal = Math.max(0, subtotal - discountAmount);
  const shipping = getShipping(discountedSubtotal);
  const total = discountedSubtotal + shipping;
  const paypalCurrency = (currency === 'USD' || currency === 'GBP') ? currency : 'USD';
  const checkoutItems = items.map((item) => ({
    _id: item._id,
    quantity: item.quantity,
  }));

  if (items.length === 0) {
    return (
      <div className="pt-8 pb-16 text-center">
        <h1 className="font-serif text-3xl text-charcoal mb-4">Your bag is empty</h1>
        <p className="text-charcoal-muted mb-8">Add some pieces before checking out.</p>
        <Link href="/products" className="btn-gold">Shop Now</Link>
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

  const validateCoupon = async (code = couponInput, quiet = false) => {
    const cleanCode = code.trim().toUpperCase();
    if (!cleanCode) {
      setCouponMessage('Enter a coupon code.');
      return false;
    }

    setCouponLoading(true);
    if (!quiet) setCouponMessage('');

    try {
      const res = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: cleanCode,
          email: form.email,
          subtotal,
        }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        setAppliedCoupon(null);
        setCouponMessage(data.error || 'Coupon could not be applied.');
        return false;
      }

      setAppliedCoupon(data.coupon);
      setCouponInput(data.coupon.code);
      setCouponMessage(`${data.coupon.name} applied: ${data.coupon.percent}% off.`);
      return true;
    } catch {
      setAppliedCoupon(null);
      setCouponMessage('Coupon check failed. Please try again.');
      return false;
    } finally {
      setCouponLoading(false);
    }
  };

  const handlePayment = async () => {
    if (!isFormValid()) {
      alert('Please fill in all required fields.');
      return;
    }

    setLoading(true);

    try {
      if (appliedCoupon) {
        const stillValid = await validateCoupon(appliedCoupon.code, true);
        if (!stillValid) {
          setLoading(false);
          return;
        }
      }

      const res = await fetch('/api/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: checkoutItems,
          couponCode: appliedCoupon?.code,
          customerEmail: form.email,
          currency,
        }),
      });

      const order = await res.json();
      if (!res.ok) {
        alert(order.error || 'Could not create payment order. Please refresh your bag and try again.');
        setLoading(false);
        return;
      }

      console.log('Razorpay order currency:', order.currency ?? currency);

      if (!order.id) throw new Error('Payment order was not created.');

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: 'Surya Jewellers',
        description: 'Sterling Silver Jewelry Purchase',
        image: 'https://www.suryajewellers.com/icon.png',
        order_id: order.id,
        notes: {
          website: 'https://www.suryajewellers.com',
        },
        method: {
          wallet: true,
          card: true,
          upi: true,
          netbanking: true,
        },
        handler: async function (response: { razorpay_payment_id: string; razorpay_order_id: string; razorpay_signature: string }) {
          const verifyRes = await fetch('/api/verify-payment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              ...response,
              items: items.map((item) => ({
                _id: item._id,
                quantity: item.quantity,
              })),
              customer: form,
              couponCode: appliedCoupon?.code,
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
      alert('Payment could not be started. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" />

      <div className="pt-8 pb-20">
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

                  <div className="mb-4 rounded border border-cream-dark bg-cream/40 p-3">
                    <label className="block text-[0.65rem] tracking-[0.15em] uppercase text-charcoal-muted mb-2">
                      Coupon Code
                    </label>
                    <div className="flex gap-2">
                      <input
                        value={couponInput}
                        onChange={(e) => {
                          setCouponInput(e.target.value.toUpperCase().replace(/\s+/g, ''));
                          if (appliedCoupon) setAppliedCoupon(null);
                          if (couponMessage) setCouponMessage('');
                        }}
                        className="input-field h-10 text-sm uppercase"
                        placeholder="SURYA20"
                      />
                      <button
                        type="button"
                        onClick={() => validateCoupon()}
                        disabled={couponLoading || !couponInput.trim()}
                        className="px-4 text-xs tracking-[0.12em] uppercase bg-charcoal text-white hover:bg-gold transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        {couponLoading ? 'Checking' : 'Apply'}
                      </button>
                    </div>
                    {couponMessage && (
                      <p className={`mt-2 text-xs ${appliedCoupon ? 'text-green-700' : 'text-red-600'}`}>
                        {couponMessage}
                      </p>
                    )}
                    {appliedCoupon && sale && saleTotals.discountAmount > couponDiscountAmount && (
                      <p className="mt-2 text-xs text-charcoal-muted">
                        Seasonal sale gives a better discount, so it will be used instead.
                      </p>
                    )}
                  </div>

                  {/* Totals */}
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-charcoal-muted">Subtotal</span>
                      <span className="text-charcoal">{formatPrice(subtotal, currency)}</span>
                    </div>
                    {activeDiscount && discountAmount > 0 && (
                      <div className="flex justify-between text-green-700">
                        <span>{activeDiscount?.name} {activeDiscount?.percent}%</span>
                        <span>-{formatPrice(discountAmount, currency)}</span>
                      </div>
                    )}
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
                    {shipping === 0 && (
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

                  {currency === 'INR' && (
                    <p className="text-xs text-charcoal-muted text-center mt-2">
                      💳 PayPal available — select USD or other currency above
                    </p>
                  )}

                  {/* PayPal — international payments (non-INR) */}
                  {currency !== 'INR' && (
                    <>
                      <div className="flex items-center gap-3 mt-6 mb-4">
                        <div className="flex-1 h-[1px] bg-cream-dark" />
                        <span className="text-xs text-charcoal-muted tracking-[0.15em] uppercase whitespace-nowrap">or pay with</span>
                        <div className="flex-1 h-[1px] bg-cream-dark" />
                      </div>

                      <motion.button
                        whileTap={{ scale: 0.97 }}
                        onClick={async () => {
                          try {
                            localStorage.setItem(
                              'paypal_pending_order',
                              JSON.stringify({
                                items: items.map((item) => ({
                                  _id: item._id,
                                  quantity: item.quantity,
                                })),
                                customer: form,
                                couponCode: appliedCoupon?.code,
                              })
                            );
                            const res = await fetch('/api/paypal/create-order', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({
                                items: checkoutItems,
                                couponCode: appliedCoupon?.code,
                                customerEmail: form.email,
                                currency: paypalCurrency,
                              })
                            });
                            const data = await res.json();
                            console.log('PayPal order:', data);
                            const approvalUrl = data.links?.find((l: { rel: string }) => l.rel === 'approve')?.href;
                            if (approvalUrl) {
                              window.location.href = approvalUrl;
                            } else {
                              alert('PayPal error: ' + JSON.stringify(data));
                            }
                          } catch(err) {
                            alert('Error: ' + (err as Error).message);
                          }
                        }}
                        className="btn-gold w-full flex items-center justify-center gap-2.5"
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="white" aria-hidden="true">
                          <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944.901C5.026.382 5.474 0 5.998 0h7.46c2.57 0 4.578.543 5.69 1.81 1.01 1.15 1.304 2.42 1.012 4.287-.023.143-.047.288-.077.437-.983 5.05-4.349 6.797-8.647 6.797h-2.19c-.524 0-.968.382-1.05.9l-1.12 7.106zm14.146-14.42a3.35 3.35 0 0 0-.607-.541c-.013.076-.026.175-.041.254-.59 3.025-2.566 4.643-5.813 4.643h-2.19c-.11 0-.217.012-.321.034l-.814 5.158 1.066-6.748c.082-.518.526-.9 1.05-.9h2.19c4.298 0 7.664-1.747 8.647-6.797.03-.149.054-.294.077-.437-.36-.282-.77-.528-1.244-.666z"/>
                        </svg>
                        Pay with PayPal
                      </motion.button>
                    </>
                  )}
                </div>
              </AnimatedSection>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
