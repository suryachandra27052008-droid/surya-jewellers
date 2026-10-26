import { NextResponse } from 'next/server';
import { priceCheckout, toPaymentAmount, type CheckoutCurrency } from '@/lib/server/checkout-pricing';
import { checkoutCustomer } from '@/lib/server/paypal-checkout';
import { reserveStock, releaseStock } from '@/lib/server/inventory-reservations';
import { recordCommerceCheckout } from '@/lib/server/commerce-orders';
import { checkoutOwner } from '@/lib/server/customer-orders';
import { analyticsContext } from '@/lib/server/shopping-analytics';
import { checkoutCancellationToken } from '@/lib/server/checkout-cancellation';
import { isRateLimited } from '@/lib/server/request-security';

export async function POST(request: Request) {
  if (isRateLimited(request, 'checkout-start', 8, 60_000)) return NextResponse.json({ error: 'Please wait before starting another checkout.' }, { status: 429 });
  let reservation: Awaited<ReturnType<typeof reserveStock>> | undefined;
  let stockLines: { _id: string; quantity: number }[] = [];
  try {
    const body = await request.json();
    const customer = checkoutCustomer(body.customer);
    const country = customer.country;
    const currency: CheckoutCurrency = body.currency ?? 'INR';
    const pricing = await priceCheckout(body.items, {
      couponCode: body.couponCode,
      customerEmail: customer.email,
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

    stockLines = pricing.items.map(item => ({ _id: item._id, quantity: item.quantity }));
    reservation = await reserveStock(stockLines);

    const order = await razorpay.orders.create({
      amount: paymentAmount.subunits,
      currency: paymentAmount.currency,
      receipt: `receipt_${Date.now()}`,
      ...(process.env.RAZORPAY_MANUAL_CAPTURE_ENABLED === 'true' && process.env.RAZORPAY_WEBHOOK_SECRET
        ? { payment: { capture: 'manual' as const } } : {}),
      notes: {
        website: 'https://www.suryajewellers.com',
        serverPricedTotalInr: String(pricing.total),
        shippingCountry: country,
      },
    });

    await recordCommerceCheckout('razorpay', order.id, pricing, customer, paymentAmount, reservation, await checkoutOwner(), analyticsContext(body.analyticsSessionId, request.headers));

    return NextResponse.json({ ...order, pricing, cancellationToken: checkoutCancellationToken(order.id, reservation.id) });
  } catch (error) {
    if (reservation) await releaseStock(stockLines, reservation.id).catch(() => {});
    console.error('Order creation error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Could not prepare checkout.' },
      { status: 400 }
    );
  }
}
