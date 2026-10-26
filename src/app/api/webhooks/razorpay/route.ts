import { validRazorpayWebhook } from '@/lib/server/payment-webhooks';
import { findCommerceOrder, reconcileCommerceOrder } from '@/lib/server/commerce-orders';

export async function POST(request: Request) {
  if (!process.env.RAZORPAY_WEBHOOK_SECRET) return Response.json({ error: 'Webhook is not configured.' }, { status: 503 });
  const raw = await request.text();
  if (raw.length > 128_000) return new Response(null, { status: 413 });
  if (!validRazorpayWebhook(raw, request.headers.get('x-razorpay-signature'), process.env.RAZORPAY_WEBHOOK_SECRET)) {
    return Response.json({ error: 'Invalid signature.' }, { status: 401 });
  }
  try {
    const event = JSON.parse(raw);
    if (!['payment.authorized', 'payment.captured', 'order.paid'].includes(event.event)) return Response.json({ received: true });
    const payment = event.payload?.payment?.entity;
    if (!payment?.order_id) return Response.json({ error: 'Missing order.' }, { status: 400 });
    const order = await findCommerceOrder('razorpay', payment.order_id);
    if (!order || order.checkoutVersion !== 2) return Response.json({ received: true, needsLegacyReview: true });
    await reconcileCommerceOrder(order, { paymentId: payment.id });
    return Response.json({ received: true });
  } catch {
    return Response.json({ error: 'Processing needs retry.' }, { status: 503 });
  }
}
