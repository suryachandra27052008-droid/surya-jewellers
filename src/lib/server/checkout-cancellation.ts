import { createHmac, timingSafeEqual } from 'node:crypto';
import { findCommerceOrder } from './commerce-orders';
import { getPayPalOrder } from './paypal';
import { releaseStock } from './inventory-reservations';
import { writeClient } from '@/lib/sanity/client';

export function checkoutCancellationToken(orderId: string, reservationId: string) {
  const secret = process.env.ENQUIRY_VERIFICATION_SECRET;
  if (!secret) return '';
  return createHmac('sha256', secret).update(`cancel-checkout:${orderId}:${reservationId}`).digest('hex');
}

export async function cancelCheckout(provider: 'paypal' | 'razorpay', orderId: string, token: string) {
  const order = await findCommerceOrder(provider, orderId);
  if (!order?.reservationId || order.checkoutVersion !== 2 || !/^[a-f0-9]{64}$/.test(token)) throw new Error('Invalid checkout cancellation.');
  const expected = checkoutCancellationToken(orderId, order.reservationId);
  if (!expected || !timingSafeEqual(Buffer.from(expected), Buffer.from(token))) throw new Error('Invalid checkout cancellation.');
  if (order.inventoryCommittedAt || order.status !== 'pending') return;
  if (provider === 'paypal') {
    const payment = await getPayPalOrder(orderId);
    if (payment.status === 'APPROVED' || payment.purchase_units?.some(unit => unit.payments?.captures?.length)) {
      throw new Error('A payment is already in progress. Check the order status before trying again.');
    }
  } else {
    const Razorpay = (await import('razorpay')).default;
    const razorpay = new Razorpay({ key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!, key_secret: process.env.RAZORPAY_KEY_SECRET! });
    const payments = await razorpay.orders.fetchPayments(orderId);
    if (payments.items.some(payment => ['authorized', 'captured'].includes(payment.status))) {
      throw new Error('A payment is already in progress. Check the order status before trying again.');
    }
  }
  await releaseStock(order.items.map(item => ({ _id: item.productId, quantity: item.quantity })), order.reservationId);
  await writeClient.patch(order._id).set({ status: 'cancelled', checkoutCancelledAt: new Date().toISOString() }).commit();
}
