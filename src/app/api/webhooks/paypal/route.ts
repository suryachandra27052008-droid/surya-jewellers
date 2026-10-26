import { validPayPalWebhook } from '@/lib/server/payment-webhooks';
import { findCommerceOrder, reconcileCommerceOrder } from '@/lib/server/commerce-orders';

export async function POST(request: Request) {
  if (!process.env.PAYPAL_WEBHOOK_ID) return Response.json({ error: 'Webhook is not configured.' }, { status: 503 });
  const raw = await request.text();
  if (raw.length > 128_000) return new Response(null, { status: 413 });
  try {
    const event = JSON.parse(raw);
    if (!await validPayPalWebhook(request, event)) return Response.json({ error: 'Invalid signature.' }, { status: 401 });
    if (!['CHECKOUT.ORDER.APPROVED', 'PAYMENT.CAPTURE.COMPLETED', 'PAYMENT.CAPTURE.PENDING', 'PAYMENT.CAPTURE.DENIED'].includes(event.event_type)) {
      return Response.json({ received: true });
    }
    const id = event.event_type === 'CHECKOUT.ORDER.APPROVED' ? event.resource?.id
      : event.resource?.supplementary_data?.related_ids?.order_id;
    if (!id) return Response.json({ error: 'Missing order.' }, { status: 400 });
    const order = await findCommerceOrder('paypal', id);
    if (!order || order.checkoutVersion !== 2) return Response.json({ received: true, needsLegacyReview: true });
    await reconcileCommerceOrder(order, { captureApproved: true });
    return Response.json({ received: true });
  } catch {
    return Response.json({ error: 'Processing needs retry.' }, { status: 503 });
  }
}
