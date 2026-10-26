import { writeClient } from '@/lib/sanity/client';
import { CURRENCIES, type CurrencyCode } from '@/lib/currency';
import { sendOrderReceiptEmail } from '@/lib/email';
import { commitStock, reserveStock, releaseStock } from './inventory-reservations';
import { getPayPalOrder, capturePayPalOrder } from './paypal';
import type { PayPalCheckoutRecord } from './paypal-checkout';
import type { PricedCheckout } from './checkout-pricing';
import { recordShoppingStage, type AnalyticsContext } from './shopping-analytics';

export type CommerceOrder = PayPalCheckoutRecord & {
  checkoutVersion?: number; paymentMethod?: 'paypal' | 'razorpay'; ownerUserId?: string;
  reservationId?: string; reservationExpiresAt?: string; inventoryCommittedAt?: string;
  fulfillmentBlocked?: boolean; processingError?: string; reconciliationAttempts?: number;
  lastReconciledAt?: string; nextReconcileAt?: string; paidAt?: string;
  notificationAttempts?: number; notificationError?: string;
  analytics?: AnalyticsContext;
};

export async function findCommerceOrder(provider: 'paypal' | 'razorpay', orderId: string) {
  return writeClient.fetch<CommerceOrder | null>(
    '*[_type == "order" && paymentMethod == $provider && razorpayOrderId == $orderId][0]',
    { provider, orderId }, { cache: 'no-store' },
  );
}

export async function recordCommerceCheckout(provider: 'paypal' | 'razorpay', id: string, pricing: PricedCheckout,
  customer: CommerceOrder['customer'], payment: { currency: string; displayValue: string },
  reservation: { id: string; expiresAt: string }, ownerUserId?: string, analytics?: AnalyticsContext) {
  await writeClient.createIfNotExists({
    _id: `orders.${provider}-order-${id}`, _type: 'order', checkoutVersion: 2,
    paymentMethod: provider, razorpayOrderId: id, paymentCurrency: payment.currency,
    paymentAmount: payment.displayValue, paymentStatus: 'CREATED', status: 'pending',
    customer, ...(ownerUserId ? { ownerUserId } : {}), reservationId: reservation.id,
    ...(analytics ? { analytics } : {}),
    reservationExpiresAt: reservation.expiresAt,
    items: pricing.items.map((item, index) => ({ _key: `item-${index}`, productId: item._id,
      name: item.name, price: item.price, quantity: item.quantity,
      ...(item.category ? { category: item.category } : {}),
      ...(item.ringSize !== undefined ? { ringSize: item.ringSize } : {}) })),
    subtotal: pricing.subtotal, discount: pricing.discount || undefined,
    shipping: pricing.shipping, total: pricing.total,
    nextReconcileAt: new Date(Date.now() + 60_000).toISOString(),
  });
}

export async function deliverOrderReceipt(order: CommerceOrder) {
  const latest = await writeClient.getDocument<CommerceOrder>(order._id);
  if (!latest || latest.orderConfirmationSentAt || !latest.customer?.email) return;
  if (!Object.hasOwn(CURRENCIES, latest.paymentCurrency)) throw new Error('Unsupported order currency.');
  // Resend retains keys for 24 hours. Older uncertain sends require manual review,
  // rather than risking a duplicate after the provider's idempotency window.
  if (latest.notificationAttempts && latest.paidAt && Date.now() - Date.parse(latest.paidAt) > 23 * 60 * 60_000) return;
  try {
    const emailId = await sendOrderReceiptEmail({ reference: `SJ-${latest.razorpayOrderId}`,
      customer: latest.customer, items: latest.items, discount: latest.discount,
      shipping: latest.shipping, total: latest.total,
      currency: latest.paymentCurrency as CurrencyCode, chargedAmount: latest.paymentAmount,
    }, `order-receipt-${latest.razorpayOrderId}`);
    await writeClient.patch(latest._id).set({ orderConfirmationSentAt: new Date().toISOString(),
      orderConfirmationEmailId: emailId, notificationError: '' }).commit();
  } catch {
    await writeClient.patch(latest._id).set({ notificationError: 'Order confirmation needs retry.' })
      .setIfMissing({ notificationAttempts: 0 }).inc({ notificationAttempts: 1 }).commit();
  }
}

async function markPayment(order: CommerceOrder, captureId: string, state: string, pending: boolean) {
  const latest = await writeClient.getDocument<CommerceOrder>(order._id);
  if (!latest) throw new Error('The saved checkout could not be found.');
  const fields: Record<string, unknown> = { razorpayPaymentId: captureId, paymentStatus: state,
    lastReconciledAt: new Date().toISOString(), processingError: '',
    nextReconcileAt: new Date(Date.now() + 5 * 60_000).toISOString() };
  if (!pending && !['confirmed', 'shipped', 'delivered'].includes(latest.status)) fields.status = 'paid';
  if (!pending && !latest.paidAt) fields.paidAt = new Date().toISOString();
  const patch = writeClient.patch(order._id).set(fields);
  if (latest._rev) patch.ifRevisionId(latest._rev);
  await patch.commit();
  if (pending) {
    if (order.reservationId && !order.inventoryCommittedAt) {
      await reserveStock(order.items.map(item => ({ _id: item.productId, quantity: item.quantity })), order.reservationId, true);
    }
    return { success: true, pending: true, paymentId: captureId };
  }
  try {
    await commitStock(order);
  } catch (error) {
    const committed = await writeClient.getDocument<CommerceOrder>(order._id);
    // A late payment never consumes another buyer's stock or permits dispatch.
    if (!committed?.inventoryCommittedAt) {
      await writeClient.patch(order._id).set({ fulfillmentBlocked: true, needsMerchantReview: true,
        processingError: (error as Error).message }).commit();
    }
  }
  await deliverOrderReceipt({ ...order, ...fields } as CommerceOrder);
  if (order.analytics) await recordShoppingStage('purchase', order.analytics).catch(() => {});
  return { success: true, pending: false, paymentId: captureId };
}

async function expireCheckout(order: CommerceOrder) {
  if (order.reservationId) await releaseStock(order.items.map(item => ({ _id: item.productId, quantity: item.quantity })), order.reservationId);
  await writeClient.patch(order._id).set({ status: 'expired', checkoutExpiredAt: new Date().toISOString(), lastReconciledAt: new Date().toISOString() }).commit();
}

export async function reconcileCommerceOrder(order: CommerceOrder, options: { captureApproved?: boolean; paymentId?: string } = {}) {
  try {
    if (order.paymentMethod === 'paypal') {
      let provider = await getPayPalOrder(order.razorpayOrderId);
      let unit = provider.purchase_units?.[0];
      if (provider.status === 'APPROVED' && !unit?.payments?.captures?.length && options.captureApproved) {
        if (!order.reservationId) throw new Error('Checkout stock reservation is missing.');
        await reserveStock(order.items.map(item => ({ _id: item.productId, quantity: item.quantity })), order.reservationId);
        provider = await capturePayPalOrder(order.razorpayOrderId);
        unit = provider.purchase_units?.[0];
      }
      const capture = unit?.payments?.captures?.[0];
      if (!capture) {
        if (Date.parse(order.reservationExpiresAt || '') < Date.now()) await expireCheckout(order);
        return { success: true, pending: true, paymentId: order.razorpayOrderId };
      }
      if (capture.amount?.currency_code !== order.paymentCurrency || capture.amount?.value !== order.paymentAmount ||
        unit?.custom_id !== `server_total_inr_${order.total}`) throw new Error('Provider amount does not match the saved order.');
      if (!capture.id || !['COMPLETED', 'PENDING'].includes(capture.status || '')) {
        await expireCheckout(order);
        await writeClient.patch(order._id).set({ status: 'failed', paymentStatus: capture.status || 'FAILED' }).commit();
        return { success: false, pending: false, paymentId: capture.id };
      }
      return await markPayment(order, capture.id, capture.status!, capture.status === 'PENDING');
    }
    const Razorpay = (await import('razorpay')).default;
    const razorpay = new Razorpay({ key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!, key_secret: process.env.RAZORPAY_KEY_SECRET! });
    const providerOrder = await razorpay.orders.fetch(order.razorpayOrderId);
    const payments = options.paymentId ? [await razorpay.payments.fetch(options.paymentId)]
      : (await razorpay.orders.fetchPayments(order.razorpayOrderId)).items;
    let payment = payments.find(entry => ['captured', 'authorized'].includes(entry.status));
    if (!payment) {
      if (Date.parse(order.reservationExpiresAt || '') < Date.now()) await expireCheckout(order);
      return { success: true, pending: true, paymentId: order.razorpayOrderId };
    }
    const factor = order.paymentCurrency === 'JPY' ? 1 : 100;
    const expected = Math.round(Number(order.paymentAmount) * factor);
    if (payment.order_id !== order.razorpayOrderId || payment.currency !== order.paymentCurrency ||
      Number(payment.amount) !== expected || Number(providerOrder.amount) !== expected) {
      throw new Error('Provider amount does not match the saved order.');
    }
    if (payment.status === 'authorized') {
      if (!order.reservationId) throw new Error('Checkout stock reservation is missing.');
      await reserveStock(order.items.map(item => ({ _id: item.productId, quantity: item.quantity })), order.reservationId, true);
      payment = await razorpay.payments.capture(payment.id, expected, order.paymentCurrency);
    }
    return await markPayment(order, payment.id, payment.status, payment.status !== 'captured');
  } catch (error) {
    await writeClient.patch(order._id).set({ processingError: 'Payment/order reconciliation needs attention.',
      lastReconciledAt: new Date().toISOString(), nextReconcileAt: new Date(Date.now() + 15 * 60_000).toISOString() })
      .setIfMissing({ reconciliationAttempts: 0 }).inc({ reconciliationAttempts: 1 }).commit();
    throw error;
  }
}

export async function retryCommerceOrders() {
  const orders = await writeClient.fetch<CommerceOrder[]>(
    `*[_type == "order" && checkoutVersion == 2 &&
      ((status == "pending" && coalesce(nextReconcileAt, _createdAt) <= $now) ||
       (status == "paid" && !defined(orderConfirmationSentAt) && coalesce(notificationAttempts, 0) < 5))]
      | order(_createdAt asc)[0...30]`, { now: new Date().toISOString() }, { cache: 'no-store' });
  let failed = 0;
  for (const order of orders) {
    try { await reconcileCommerceOrder(order, { captureApproved: true }); } catch { failed++; }
  }
  return { checked: orders.length, failed };
}
