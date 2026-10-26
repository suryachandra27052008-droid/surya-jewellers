import { NextResponse } from 'next/server';
import { priceCheckout, toPaymentAmount, type CheckoutCurrency } from '@/lib/server/checkout-pricing';
import { normalizeShippingCountry } from '@/lib/shipping';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const country = normalizeShippingCountry(body.country);
    if (!country) return NextResponse.json({ error: 'Please enter your delivery country.' }, { status: 400 });
    const currency: CheckoutCurrency = body.currency ?? 'INR';
    const pricing = await priceCheckout(body.items, {
      couponCode: body.couponCode,
      customerEmail: body.customerEmail,
      country,
    });
    const paymentAmount = toPaymentAmount(pricing.total, currency);

    const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keyId || keyId === 'rzp_test_placeholder' || !keySecret || keySecret === 'placeholder_secret') {
      return NextResponse.json({ error: 'Razorpay is temporarily unavailable.' }, { status: 503 });
    }

    const Razorpay = (await import('razorpay')).default;

    const razorpay = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });

    const order = await razorpay.orders.create({
      amount: paymentAmount.subunits,
      currency: paymentAmount.currency,
      receipt: `receipt_${Date.now()}`,
      notes: {
        website: 'https://www.suryajewellers.com',
        serverPricedTotalInr: String(pricing.total),
        shippingCountry: country,
      },
    });

    return NextResponse.json({ ...order, pricing });
  } catch (error) {
    console.error('Order creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create order', details: String(error) },
      { status: 400 }
    );
  }
}
