import { capturePayPalOrder } from '@/lib/server/paypal';
import { findCommerceOrder, reconcileCommerceOrder } from '@/lib/server/commerce-orders';

export async function POST(request: Request) {
  try {
    const { orderID } = await request.json();
    if (typeof orderID !== 'string' || !/^[A-Z0-9]{1,80}$/i.test(orderID)) {
      return Response.json({ error: 'Invalid PayPal order ID' }, { status: 400 });
    }
    const saved = await findCommerceOrder('paypal', orderID);
    if (saved?.checkoutVersion === 2) {
      const result = await reconcileCommerceOrder(saved, { captureApproved: true });
      return Response.json({ ...result, status: result.pending ? 'PENDING' : 'COMPLETED' });
    }
    return Response.json(await capturePayPalOrder(orderID));
  } catch (error) {
    console.error('PayPal capture-order error:', error);
    return Response.json({ error: 'PayPal payment could not be confirmed. Please check its status before trying again.' }, { status: 502 });
  }
}
