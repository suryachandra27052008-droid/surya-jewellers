import { getPayPalOrder } from '@/lib/server/paypal';
import { findPayPalCheckout, recoverPayPalCustomer } from '@/lib/server/paypal-checkout';
import { POST as recordPayPalPayment } from '@/app/api/save-paypal-order/route';
import { getOrderReceiptDelivery, sendOrderReceiptEmail } from '@/lib/email';
import { renderOrderReceipt, type OrderReceipt } from '@/lib/server/order-receipt';
import { CURRENCIES, type CurrencyCode } from '@/lib/currency';
import { writeClient } from '@/lib/sanity/client';
import { isValidEmail } from '@/lib/server/request-security';

function receiptFor(saved: NonNullable<Awaited<ReturnType<typeof findPayPalCheckout>>>): OrderReceipt {
  if (!Object.hasOwn(CURRENCIES, saved.paymentCurrency) || !saved.items?.length || !isValidEmail(saved.customer?.email)) {
    throw new Error('The order items, currency and customer email must be verified first.');
  }
  return { reference: `SJ-${saved.razorpayOrderId}`, customer: saved.customer,
    items: saved.items, discount: saved.discount, shipping: saved.shipping, total: saved.total,
    currency: saved.paymentCurrency as CurrencyCode, chargedAmount: saved.paymentAmount };
}

export async function POST(request: Request) {
  const { orderId, action = 'refresh', items } = await request.json();
  if (typeof orderId !== 'string' || !/^[A-Z0-9]{1,80}$/i.test(orderId)) {
    return Response.json({ error: 'Invalid order reference.' }, { status: 400 });
  }
  if (action === 'recover') {
    const recoveryUrl = new URL(request.url);
    recoveryUrl.searchParams.set('receipt', 'manual');
    return recordPayPalPayment(new Request(recoveryUrl, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ paypalOrderId: orderId, items }),
    }));
  }
  const saved = await findPayPalCheckout(orderId);
  if (!saved) {
    return Response.json({ error: 'The item details must be recovered from the original checkout first.' }, { status: 409 });
  }
  if (action === 'send-confirmation') {
    try {
      if (saved.orderConfirmationSentAt) return Response.json({ success: true, alreadySent: true, emailId: saved.orderConfirmationEmailId });
      const emailId = await sendOrderReceiptEmail(receiptFor(saved), `order-receipt-${orderId}`);
      await writeClient.patch(saved._id).set({ orderConfirmationSentAt: new Date().toISOString(), orderConfirmationEmailId: emailId }).commit();
      return Response.json({ success: true, emailId });
    } catch (error) {
      return Response.json({ error: (error as Error).message }, { status: 502 });
    }
  }
  if (action !== 'refresh') return Response.json({ error: 'Invalid action.' }, { status: 400 });
  // Read the existing capture and reconcile it; this never captures or accepts funds.
  return recordPayPalPayment(new Request(request.url, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ paypalOrderId: orderId }),
  }));
}

export async function GET(request: Request) {
  const orderId = new URL(request.url).searchParams.get('orderId') || '';
  if (!/^[A-Z0-9]{1,80}$/i.test(orderId)) return Response.json({ error: 'Invalid order reference.' }, { status: 400 });
  try {
    const [provider, saved] = await Promise.all([getPayPalOrder(orderId), findPayPalCheckout(orderId)]);
    if (new URL(request.url).searchParams.get('delivery') === 'confirmation') {
      return Response.json(saved?.orderConfirmationEmailId
        ? await getOrderReceiptDelivery(saved.orderConfirmationEmailId)
        : { event: 'not_sent' }, { headers: { 'Cache-Control': 'private, no-store' } });
    }
    if (new URL(request.url).searchParams.get('preview') === 'confirmation' && saved) {
      return Response.json(renderOrderReceipt(receiptFor(saved)), { headers: { 'Cache-Control': 'private, no-store' } });
    }
    return Response.json({
      orderId: provider.id,
      status: provider.status,
      payments: provider.purchase_units?.map(unit => ({
        amount: unit.amount,
        captures: unit.payments?.captures?.map(capture => ({
          id: capture.id, status: capture.status, amount: capture.amount, reason: capture.status_details?.reason,
        })),
      })),
      recordedInWebsite: Boolean(saved),
      items: saved?.items || [],
      customer: saved?.customer || recoverPayPalCustomer(undefined, provider).customer,
    }, { headers: { 'Cache-Control': 'private, no-store' } });
  } catch {
    return Response.json({ error: 'Unable to read PayPal order status.' }, { status: 502 });
  }
}
