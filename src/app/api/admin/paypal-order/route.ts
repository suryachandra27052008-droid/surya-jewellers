import { getPayPalOrder } from '@/lib/server/paypal';
import { findPayPalCheckout } from '@/lib/server/paypal-checkout';
import { POST as recordPayPalPayment } from '@/app/api/save-paypal-order/route';

export async function POST(request: Request) {
  const { orderId } = await request.json();
  if (typeof orderId !== 'string' || !/^[A-Z0-9]{1,80}$/i.test(orderId)) {
    return Response.json({ error: 'Invalid order reference.' }, { status: 400 });
  }
  if (!await findPayPalCheckout(orderId)) {
    return Response.json({ error: 'The item details must be recovered from the original checkout first.' }, { status: 409 });
  }
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
    }, { headers: { 'Cache-Control': 'private, no-store' } });
  } catch {
    return Response.json({ error: 'Unable to read PayPal order status.' }, { status: 502 });
  }
}
