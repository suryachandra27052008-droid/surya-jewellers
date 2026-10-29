import { createHmac } from 'node:crypto';
import { evaluate, parse } from 'groq-js';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({ docs: new Map<string, Record<string, unknown>>(), revision: 0,
  failures: new Map<string, number>(), token: vi.fn(), fetch: vi.fn(), create: vi.fn(),
  paypal: vi.fn(), paypalCapture: vi.fn(), email: vi.fn(), payment: vi.fn(), paymentOrder: vi.fn(), payments: vi.fn(), capture: vi.fn() }));

vi.mock('@/lib/sanity/client', () => {
  type Operation = { id: string; revision?: string; set: Record<string, unknown>; unset: string[]; inc: Record<string, number>; missing: Record<string, unknown> };
  const builder = (operation: Operation) => {
    const chain = { ifRevisionId: (revision: string) => { operation.revision = revision; return chain; },
      set: (fields: Record<string, unknown>) => { Object.assign(operation.set, fields); return chain; },
      unset: (fields: string[]) => { operation.unset.push(...fields); return chain; },
      setIfMissing: (fields: Record<string, unknown>) => { Object.assign(operation.missing, fields); return chain; },
      inc: (fields: Record<string, number>) => { Object.assign(operation.inc, fields); return chain; },
      commit: () => apply([operation]),
    };
    return chain;
  };
  const apply = async (operations: Operation[]) => {
    for (const key of operations.flatMap(operation => [...Object.keys(operation.set), ...Object.keys(operation.inc)])) {
      const failures = mocks.failures.get(key) || 0;
      if (failures) { mocks.failures.set(key, failures - 1); throw new Error(`Simulated database failure: ${key}`); }
    }
    for (const operation of operations) {
      const doc = mocks.docs.get(operation.id);
      if (!doc || (operation.revision && operation.revision !== doc._rev)) throw new Error('Revision conflict');
    }
    for (const operation of operations) {
      const doc = { ...mocks.docs.get(operation.id)!, ...operation.set };
      for (const [key, value] of Object.entries(operation.missing)) if (doc[key] === undefined) doc[key] = value;
      for (const [key, value] of Object.entries(operation.inc)) doc[key] = Number(doc[key] || 0) + value;
      for (const key of operation.unset) delete doc[key];
      doc._rev = `revision-${++mocks.revision}`;
      mocks.docs.set(operation.id, doc);
    }
  };
  const operation = (id: string): Operation => ({ id, set: {}, unset: [], inc: {}, missing: {} });
  return { writeClient: {
    fetch: vi.fn(async (query: string, params: Record<string, unknown> = {}) => {
      const result = await evaluate(parse(query), { dataset: structuredClone([...mocks.docs.values()]), params });
      return result.get();
    }),
    getDocument: vi.fn(async (id: string) => structuredClone(mocks.docs.get(id))),
    getDocuments: vi.fn(async (ids: string[]) => ids.map(id => structuredClone(mocks.docs.get(id)) || null)),
    createIfNotExists: vi.fn(async (doc: Record<string, unknown> & { _id: string }) => {
      if (mocks.failures.get('create')) { mocks.failures.delete('create'); throw new Error('Simulated database failure'); }
      if (!mocks.docs.has(doc._id)) mocks.docs.set(doc._id, { ...structuredClone(doc), _createdAt: new Date().toISOString(), _rev: `revision-${++mocks.revision}` });
    }),
    patch: (id: string) => builder(operation(id)),
    transaction: () => {
      const operations: Operation[] = [];
      const transaction = { patch: (id: string, callback: (patch: ReturnType<typeof builder>) => unknown) => {
        const op = operation(id); callback(builder(op)); operations.push(op); return transaction;
      }, commit: () => apply(operations) };
      return transaction;
    },
  } };
});
vi.mock('@/lib/email', () => ({ sendOrderReceiptEmail: mocks.email, sendOrderStatusEmail: vi.fn() }));
vi.mock('./paypal', () => ({ getPayPalOrder: mocks.paypal, capturePayPalOrder: mocks.paypalCapture, getPayPalAccessToken: mocks.token }));
vi.mock('./customer-orders', () => ({ checkoutOwner: vi.fn(async () => 'test-owner') }));
vi.mock('./shopping-analytics', () => ({ analyticsContext: vi.fn(), recordShoppingStage: vi.fn() }));
vi.mock('razorpay', () => ({ default: class {
  payments = { fetch: mocks.payment, capture: mocks.capture };
  orders = { create: mocks.create, fetch: mocks.paymentOrder, fetchPayments: mocks.payments };
} }));

import { availableStock, combineStockLines, reserveStock, releaseStock } from './inventory-reservations';
import { deliverOrderReceipt, findCommerceOrder, recordCommerceCheckout, reconcileCommerceOrder, retryCommerceOrders, type CommerceOrder } from './commerce-orders';
import { cancelCheckout, checkoutCancellationToken } from './checkout-cancellation';
import { renderOrderReceipt } from './order-receipt';
import { POST as createPayPal } from '@/app/api/paypal/create-order/route';
import { POST as createRazorpay } from '@/app/api/create-order/route';
import { POST as paypalWebhook } from '@/app/api/webhooks/paypal/route';
import { POST as razorpayWebhook } from '@/app/api/webhooks/razorpay/route';
import { GET as adminOrders } from '@/app/api/admin/orders/route';

function product(stock = 1) { mocks.docs.set('product-test', { _id: 'product-test', _type: 'product', _rev: 'product-rev', name: 'Test Ring', stockQuantity: stock, inStock: true }); }
function order(provider: 'paypal' | 'razorpay' = 'paypal'): CommerceOrder & { _type: string; _createdAt: string } {
  return { _id: 'orders.test', _type: 'order', _createdAt: new Date().toISOString(), _rev: 'order-rev', checkoutVersion: 2, paymentMethod: provider,
    status: 'pending', razorpayOrderId: 'ORDERTEST', paymentCurrency: 'EUR', paymentAmount: '100.00',
    customer: { name: 'Test Buyer', email: 'buyer@example.com', phone: '000', address: 'Test address', country: 'DE' },
    items: [{ _key: 'item-0', productId: 'product-test', name: 'Original Ring', quantity: 1, price: 10400 }],
    subtotal: 10400, shipping: 0, total: 10400, reservationId: 'reservation-test',
    reservationExpiresAt: new Date(Date.now() + 60_000).toISOString(),
  };
}
function provider(status = 'COMPLETED', value = '100.00') {
  return { id: 'ORDERTEST', status: 'COMPLETED', purchase_units: [{ custom_id: 'server_total_inr_10400',
    payments: { captures: [{ id: 'CAPTURETEST', status, amount: { currency_code: 'EUR', value } }] } }] };
}
beforeEach(() => {
  vi.clearAllMocks(); mocks.docs.clear(); mocks.failures.clear(); mocks.revision = 0; product();
  vi.stubEnv('RAZORPAY_MANUAL_CAPTURE_ENABLED', 'false');
  vi.stubEnv('RAZORPAY_WEBHOOK_SECRET', 'test-webhook-secret');
  vi.stubEnv('NEXT_PUBLIC_RAZORPAY_KEY_ID', 'rzp_test_simulation');
  vi.stubEnv('RAZORPAY_KEY_SECRET', 'test-api-secret');
  vi.stubEnv('ENQUIRY_VERIFICATION_SECRET', 'test-cancellation-secret');
  vi.stubEnv('PAYPAL_WEBHOOK_ID', 'test-paypal-webhook');
  vi.stubEnv('PAYPAL_CLIENT_ID', 'test-paypal-client'); vi.stubEnv('PAYPAL_SECRET', 'test-paypal-secret');
  vi.stubGlobal('fetch', mocks.fetch);
  mocks.fetch.mockReset().mockRejectedValue(new Error('Unexpected network request in offline test'));
  mocks.create.mockReset().mockResolvedValue({ id: 'ORDERTEST', amount: 10000, currency: 'EUR' });
  mocks.token.mockReset().mockResolvedValue('test-paypal-token');
  mocks.paypalCapture.mockReset();
  mocks.email.mockReset(); mocks.paypal.mockReset();
  mocks.paypal.mockResolvedValue(provider()); mocks.email.mockResolvedValue('email-test');
  mocks.paymentOrder.mockResolvedValue({ amount: 10000, currency: 'EUR' });
  mocks.payment.mockResolvedValue({ id: 'payment-test', order_id: 'ORDERTEST', currency: 'EUR', amount: 10000, status: 'authorized' });
  mocks.payments.mockResolvedValue({ items: [] });
  mocks.capture.mockResolvedValue({ id: 'payment-test', status: 'captured' });
});
afterEach(() => { vi.useRealTimers(); vi.unstubAllEnvs(); vi.unstubAllGlobals(); });

describe('atomic inventory reservations', () => {
  it('preserves the selected ring size in the private order snapshot', async () => {
    await recordCommerceCheckout('paypal', 'SIZEORDER', { items: [{ _id: 'product-test', name: 'Test Ring',
      quantity: 1, price: 10400, image: '', slug: 'test-ring', category: 'Rings', ringSize: 12 }],
      subtotal: 10400, discount: null, shipping: 0, total: 10400 }, order().customer,
      { currency: 'EUR', displayValue: '100.00' }, { id: 'reservation-size', expiresAt: '2026-11-01T00:00:00Z' });
    expect(mocks.docs.get('orders.paypal-order-SIZEORDER')?.items).toMatchObject([{ ringSize: 12, category: 'Rings' }]);
  });
  it('allows only one concurrent buyer to reserve the same piece', async () => {
    const results = await Promise.allSettled([
      reserveStock([{ _id: 'product-test', quantity: 1 }], 'buyer-one'),
      reserveStock([{ _id: 'product-test', quantity: 1 }], 'buyer-two'),
    ]);
    expect(results.filter(result => result.status === 'fulfilled')).toHaveLength(1);
    expect(results.filter(result => result.status === 'rejected')).toHaveLength(1);
  });
  it('combines duplicate cart lines rather than allowing a stock bypass', async () => {
    expect(combineStockLines([{ _id: 'product-test', quantity: 1 }, { _id: 'product-test', quantity: 1 }])).toEqual([{ _id: 'product-test', quantity: 2 }]);
    await expect(reserveStock([{ _id: 'product-test', quantity: 1 }, { _id: 'product-test', quantity: 1 }])).rejects.toThrow('unavailable');
  });
  it('does not release another buyer\'s reservation', async () => {
    await reserveStock([{ _id: 'product-test', quantity: 1 }], 'buyer-one');
    await releaseStock([{ _id: 'product-test', quantity: 1 }], 'buyer-two');
    expect(mocks.docs.get('product-test')?.checkoutReservation).toMatchObject({ id: 'buyer-one' });
  });
  it('allows an abandoned expired reservation to be replaced', async () => {
    mocks.docs.get('product-test')!.checkoutReservation = { id: 'old-buyer', expiresAt: '2020-01-01T00:00:00Z', quantity: 1 };
    await reserveStock([{ _id: 'product-test', quantity: 1 }], 'new-buyer');
    expect(mocks.docs.get('product-test')?.checkoutReservation).toMatchObject({ id: 'new-buyer' });
  });
  it('retains a pending-payment hold even after the ordinary hold timeout', async () => {
    mocks.docs.get('product-test')!.checkoutReservation = { id: 'pending-buyer', expiresAt: '2020-01-01T00:00:00Z', quantity: 1, paymentPending: true };
    await expect(reserveStock([{ _id: 'product-test', quantity: 1 }], 'other-buyer')).rejects.toThrow('reserved');
  });
  it('never treats zero stock as one available unit', () => expect(availableStock({ stockQuantity: 0, inStock: true })).toBe(0));
});

describe('durable payment processing', () => {
  it('records the immutable private checkout before exposing a gateway link', async () => {
    await recordCommerceCheckout('razorpay', 'ORDERTEST', { items: [{ _id: 'product-test', name: 'Original Ring', price: 10400, quantity: 1, image: '', slug: 'ring' }],
      subtotal: 10400, discount: null, shipping: 0, total: 10400 }, order().customer,
    { currency: 'EUR', displayValue: '100.00' }, { id: 'reservation-test', expiresAt: '2026-10-27T00:00:00Z' }, 'user-test');
    expect(mocks.docs.get('orders.razorpay-order-ORDERTEST')).toMatchObject({ ownerUserId: 'user-test', paymentAmount: '100.00', checkoutVersion: 2, status: 'pending' });
  });
  it('processes duplicate callbacks without duplicating stock consumption or email', async () => {
    const saved = order(); mocks.docs.set(saved._id, structuredClone(saved));
    await reconcileCommerceOrder(saved); await reconcileCommerceOrder(saved);
    expect(mocks.docs.get('product-test')).toMatchObject({ stockQuantity: 0, inStock: false });
    expect(mocks.email).toHaveBeenCalledTimes(1);
    expect(mocks.email).toHaveBeenCalledWith(expect.objectContaining({ chargedAmount: '100.00', items: [expect.objectContaining({ name: 'Original Ring', price: 10400 })] }), 'order-receipt-ORDERTEST');
  });
  it('does not overwrite a shipped order when another payment event arrives', async () => {
    const saved = order(); mocks.docs.set(saved._id, { ...saved, status: 'shipped', inventoryCommittedAt: '2026-10-26T10:00:00Z', orderConfirmationSentAt: '2026-10-26T10:00:00Z' });
    await reconcileCommerceOrder(saved);
    expect(mocks.docs.get(saved._id)?.status).toBe('shipped');
  });
  it('does not send a success receipt or consume stock for pending captures', async () => {
    const saved = order(); mocks.docs.set(saved._id, structuredClone(saved)); mocks.paypal.mockResolvedValue(provider('PENDING'));
    expect(await reconcileCommerceOrder(saved)).toMatchObject({ pending: true });
    expect(mocks.email).not.toHaveBeenCalled();
    expect(mocks.docs.get('product-test')).toMatchObject({ stockQuantity: 1, checkoutReservation: { paymentPending: true } });
  });
  it('rejects provider amount mismatches before stock or notification changes', async () => {
    const saved = order(); mocks.docs.set(saved._id, structuredClone(saved)); mocks.paypal.mockResolvedValue(provider('COMPLETED', '99.00'));
    await expect(reconcileCommerceOrder(saved)).rejects.toThrow('amount');
    expect(mocks.docs.get('product-test')?.stockQuantity).toBe(1); expect(mocks.email).not.toHaveBeenCalled();
  });
  it('blocks fulfilment if a late captured payment conflicts with allocated stock', async () => {
    const saved = order(); mocks.docs.set(saved._id, structuredClone(saved)); product(0);
    await reconcileCommerceOrder(saved);
    expect(mocks.docs.get(saved._id)).toMatchObject({ status: 'paid', fulfillmentBlocked: true, needsMerchantReview: true });
    expect(mocks.docs.get('product-test')?.stockQuantity).toBe(0);
  });
  it('retries email separately without repeating inventory changes', async () => {
    const saved = order(); mocks.docs.set(saved._id, structuredClone(saved)); mocks.email.mockRejectedValueOnce(new Error('Email service unavailable'));
    await reconcileCommerceOrder(saved);
    expect(mocks.docs.get(saved._id)?.notificationAttempts).toBe(1);
    await reconcileCommerceOrder(saved);
    expect(mocks.email).toHaveBeenCalledTimes(2); expect(mocks.docs.get('product-test')?.stockQuantity).toBe(0);
    expect(mocks.docs.get(saved._id)?.orderConfirmationEmailId).toBe('email-test');
  });
  it('captures an authorized Razorpay payment only after reserving stock', async () => {
    vi.stubEnv('RAZORPAY_MANUAL_CAPTURE_ENABLED', 'true');
    const saved = order('razorpay'); mocks.docs.set(saved._id, structuredClone(saved));
    await reconcileCommerceOrder(saved, { paymentId: 'payment-test' });
    expect(mocks.capture).toHaveBeenCalledWith('payment-test', 10000, 'EUR');
    expect(mocks.docs.get(saved._id)?.status).toBe('paid');
  });
  it('does not capture a Razorpay authorization if the piece has sold', async () => {
    vi.stubEnv('RAZORPAY_MANUAL_CAPTURE_ENABLED', 'true');
    const saved = order('razorpay'); mocks.docs.set(saved._id, structuredClone(saved)); product(0);
    await expect(reconcileCommerceOrder(saved, { paymentId: 'payment-test' })).rejects.toThrow('unavailable');
    expect(mocks.capture).not.toHaveBeenCalled(); expect(mocks.email).not.toHaveBeenCalled();
  });
});

describe('payment recovery failure boundaries', () => {
  it('respects automatic Razorpay capture and waits for provider confirmation', async () => {
    const saved = order('razorpay'); mocks.docs.set(saved._id, structuredClone(saved));
    expect(await reconcileCommerceOrder(saved, { paymentId: 'payment-test' })).toMatchObject({ pending: true });
    expect(mocks.capture).not.toHaveBeenCalled(); expect(mocks.email).not.toHaveBeenCalled();
    expect(mocks.docs.get('product-test')).toMatchObject({ stockQuantity: 1, checkoutReservation: { paymentPending: true } });
    mocks.payment.mockResolvedValue({ id: 'payment-test', order_id: 'ORDERTEST', amount: 10000, currency: 'EUR', status: 'captured' });
    await reconcileCommerceOrder(saved, { paymentId: 'payment-test' });
    expect(mocks.docs.get('product-test')?.stockQuantity).toBe(0);
    expect(mocks.email).toHaveBeenCalledTimes(1);
  });
  it('does not manually capture without a configured recovery webhook', async () => {
    vi.stubEnv('RAZORPAY_MANUAL_CAPTURE_ENABLED', 'true'); vi.stubEnv('RAZORPAY_WEBHOOK_SECRET', '');
    const saved = order('razorpay'); mocks.docs.set(saved._id, structuredClone(saved));
    await reconcileCommerceOrder(saved, { paymentId: 'payment-test' });
    expect(mocks.capture).not.toHaveBeenCalled();
  });
  it('checks an approved PayPal order amount before calling capture', async () => {
    const saved = order(); mocks.docs.set(saved._id, structuredClone(saved));
    mocks.paypal.mockResolvedValue({ id: 'ORDERTEST', status: 'APPROVED', purchase_units: [{
      custom_id: 'server_total_inr_10400', amount: { currency_code: 'EUR', value: '99.00' },
    }] });
    await expect(reconcileCommerceOrder(saved, { captureApproved: true })).rejects.toThrow('amount');
    expect(mocks.paypalCapture).not.toHaveBeenCalled(); expect(mocks.email).not.toHaveBeenCalled();
  });
  it('recovers an approved PayPal checkout by reserving stock before capture', async () => {
    const saved = order(); mocks.docs.set(saved._id, structuredClone(saved));
    mocks.paypal.mockResolvedValue({ id: 'ORDERTEST', status: 'APPROVED', purchase_units: [{
      custom_id: 'server_total_inr_10400', amount: { currency_code: 'EUR', value: '100.00' },
    }] });
    mocks.paypalCapture.mockImplementation(async () => {
      expect(mocks.docs.get('product-test')).toMatchObject({ stockQuantity: 1, checkoutReservation: { id: saved.reservationId } });
      return provider();
    });
    expect(await reconcileCommerceOrder(saved, { captureApproved: true })).toMatchObject({ pending: false });
    expect(mocks.paypalCapture).toHaveBeenCalledWith('ORDERTEST');
    expect(mocks.docs.get('product-test')?.stockQuantity).toBe(0); expect(mocks.email).toHaveBeenCalledTimes(1);
  });
  it('recovers after a provider timeout without losing the saved checkout', async () => {
    const saved = order(); mocks.docs.set(saved._id, structuredClone(saved));
    mocks.paypal.mockRejectedValueOnce(new Error('Provider timeout'));
    await expect(reconcileCommerceOrder(saved)).rejects.toThrow('timeout');
    expect(mocks.docs.get(saved._id)).toMatchObject({ status: 'pending', reconciliationAttempts: 1, items: saved.items });
    expect(mocks.email).not.toHaveBeenCalled();
    await reconcileCommerceOrder(saved);
    expect(mocks.docs.get(saved._id)).toMatchObject({ status: 'paid', inventoryCommittedAt: expect.any(String) });
    expect(mocks.email).toHaveBeenCalledTimes(1);
  });
  it('does not send a receipt unless the send intent was saved durably', async () => {
    const saved = { ...order(), paidAt: new Date().toISOString() }; mocks.docs.set(saved._id, saved);
    mocks.failures.set('notificationAttempts', 1);
    await expect(deliverOrderReceipt(saved)).rejects.toThrow('database failure');
    expect(mocks.email).not.toHaveBeenCalled();
  });
  it('reuses the same email key if the provider accepted a receipt but its database marker failed', async () => {
    const saved = order(); mocks.docs.set(saved._id, structuredClone(saved));
    const deliveries = new Set<string>();
    mocks.email.mockImplementation(async (_data, key: string) => { deliveries.add(key); return 'email-test'; });
    mocks.failures.set('orderConfirmationSentAt', 1);
    await reconcileCommerceOrder(saved);
    expect(mocks.docs.get(saved._id)).toMatchObject({ notificationAttempts: 1, notificationFirstAttemptAt: expect.any(String), notificationError: expect.any(String) });
    await reconcileCommerceOrder(saved);
    expect(mocks.email).toHaveBeenCalledTimes(2); expect(deliveries.size).toBe(1);
    expect(mocks.docs.get(saved._id)?.orderConfirmationEmailId).toBe('email-test');
    expect(mocks.docs.get('product-test')?.stockQuantity).toBe(0);
  });
  it('stops uncertain email retries before the provider idempotency key expires', async () => {
    const saved = order(); mocks.docs.set(saved._id, structuredClone(saved));
    mocks.failures.set('orderConfirmationSentAt', 1); mocks.failures.set('notificationError', 1);
    await expect(reconcileCommerceOrder(saved)).rejects.toThrow('database failure');
    expect(mocks.email).toHaveBeenCalledTimes(1);
    const later = Date.now() + 24 * 60 * 60_000; vi.useFakeTimers(); vi.setSystemTime(later);
    await reconcileCommerceOrder(saved);
    expect(mocks.email).toHaveBeenCalledTimes(1);
    expect(mocks.docs.get(saved._id)?.notificationError).toContain('uncertain');
  });
  it('never sends a success receipt for an unpaid checkout', async () => {
    const saved = order(); mocks.docs.set(saved._id, structuredClone(saved));
    await deliverOrderReceipt(saved); expect(mocks.email).not.toHaveBeenCalled();
  });
  it('does not downgrade a paid PayPal order on an out-of-order pending result', async () => {
    const saved = order(); mocks.docs.set(saved._id, structuredClone(saved));
    await reconcileCommerceOrder(saved); mocks.paypal.mockResolvedValue(provider('PENDING'));
    expect(await reconcileCommerceOrder(saved)).toMatchObject({ pending: false });
    expect(mocks.docs.get(saved._id)?.paymentStatus).toBe('COMPLETED');
    expect(mocks.docs.get('product-test')?.checkoutReservation).toBeUndefined();
    expect(mocks.email).toHaveBeenCalledTimes(1);
  });
  it.each(['false', 'true'])('does not recapture or reserve sold stock for a stale Razorpay authorization (manual=%s)', async manual => {
    const saved = order('razorpay'); mocks.docs.set(saved._id, structuredClone(saved));
    mocks.payment.mockResolvedValue({ id: 'payment-test', order_id: 'ORDERTEST', amount: 10000, currency: 'EUR', status: 'captured' });
    await reconcileCommerceOrder(saved, { paymentId: 'payment-test' });
    vi.stubEnv('RAZORPAY_MANUAL_CAPTURE_ENABLED', manual);
    mocks.payment.mockResolvedValue({ id: 'payment-test', order_id: 'ORDERTEST', amount: 10000, currency: 'EUR', status: 'authorized' });
    expect(await reconcileCommerceOrder(saved, { paymentId: 'payment-test' })).toMatchObject({ pending: false });
    expect(mocks.capture).not.toHaveBeenCalled(); expect(mocks.email).toHaveBeenCalledTimes(1);
    expect(mocks.docs.get(saved._id)?.paymentStatus).toBe('captured');
    expect(mocks.docs.get('product-test')?.checkoutReservation).toBeUndefined();
  });
  it('does not automatically retry stock allocation forever after repeated conflicts', async () => {
    const saved = order(); mocks.docs.set(saved._id, structuredClone(saved)); product(0);
    await reconcileCommerceOrder(saved);
    for (let attempt = 1; attempt < 5; attempt++) {
      vi.useFakeTimers(); vi.setSystemTime(Date.now() + 16 * 60_000);
      expect(await retryCommerceOrders()).toEqual({ checked: 1, failed: 0 });
    }
    vi.setSystemTime(Date.now() + 16 * 60_000);
    expect(await retryCommerceOrders()).toEqual({ checked: 0, failed: 0 });
    expect(mocks.docs.get(saved._id)).toMatchObject({ inventoryCommitAttempts: 5, fulfillmentBlocked: true, needsMerchantReview: true });
    expect(mocks.docs.get('product-test')?.stockQuantity).toBe(0); expect(mocks.email).toHaveBeenCalledTimes(1);
  });
  it('retries a temporary stock-save failure even after the receipt succeeded', async () => {
    const saved = order(); mocks.docs.set(saved._id, structuredClone(saved));
    mocks.failures.set('inventoryCommittedAt', 1);
    await reconcileCommerceOrder(saved);
    expect(mocks.docs.get(saved._id)).toMatchObject({ fulfillmentBlocked: true, orderConfirmationEmailId: 'email-test' });
    expect(mocks.docs.get('product-test')?.stockQuantity).toBe(1);
    vi.useFakeTimers(); vi.setSystemTime(Date.now() + 16 * 60_000);
    expect(await retryCommerceOrders()).toMatchObject({ checked: 1, failed: 0 });
    expect(mocks.docs.get(saved._id)).toMatchObject({ fulfillmentBlocked: false, inventoryCommittedAt: expect.any(String) });
    expect(mocks.docs.get('product-test')?.stockQuantity).toBe(0); expect(mocks.email).toHaveBeenCalledTimes(1);
  });
  it('finds due shipped-order receipt retries but excludes old, sent and not-yet-due records', async () => {
    const now = Date.now();
    const saved = { ...order(), status: 'shipped', paidAt: new Date(now - 60_000).toISOString(),
      inventoryCommittedAt: new Date(now - 60_000).toISOString(), nextReconcileAt: new Date(now - 1000).toISOString() };
    mocks.docs.set(saved._id, saved);
    mocks.docs.set('orders.legacy', { ...saved, _id: 'orders.legacy', checkoutVersion: undefined });
    mocks.docs.set('orders.sent', { ...saved, _id: 'orders.sent', orderConfirmationSentAt: new Date().toISOString() });
    mocks.docs.set('orders.future', { ...saved, _id: 'orders.future', nextReconcileAt: new Date(now + 3600_000).toISOString() });
    expect(await retryCommerceOrders()).toEqual({ checked: 1, failed: 0 });
    expect(mocks.docs.get(saved._id)?.status).toBe('shipped'); expect(mocks.email).toHaveBeenCalledTimes(1);
  });
});

function checkoutRequest(provider: 'paypal' | 'razorpay') {
  return new Request(`https://example.com/api/${provider}/create-order`, { method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-forwarded-for': `offline-test-${requestNumber++}` },
    body: JSON.stringify({ currency: 'EUR', items: [{ _id: 'product-test', quantity: 1, ringSize: 12, price: 1 }],
      customer: { fullName: 'Test Buyer', email: 'buyer@example.com', phone: '1234567890',
        address1: 'Test Street 1', city: 'Berlin', pincode: '10115', country: 'DE' } }),
  });
}
let requestNumber = 0;
function checkoutFixtures() {
  Object.assign(mocks.docs.get('product-test')!, { price: 7900, category: { _ref: 'category-rings' }, sku: 'TEST', slug: { current: 'test-ring' } });
  mocks.docs.set('category-rings', { _id: 'category-rings', _type: 'category', name: 'Rings' });
  mocks.fetch.mockImplementation(async (input: string, init?: RequestInit) => {
    if (input.endsWith('/oauth2/token')) return Response.json({ access_token: 'test-access-token' });
    if (input.endsWith('/verify-webhook-signature')) return Response.json({ verification_status: 'SUCCESS' });
    if (input.endsWith('/checkout/orders') && init?.method === 'POST') return Response.json({ id: 'ORDERTEST', links: [{ rel: 'approve', href: 'https://example.com/test-approval' }] });
    throw new Error('Unexpected network request in offline test');
  });
}
function webhookRequest(provider: 'paypal' | 'razorpay', event?: string) {
  if (provider === 'razorpay') {
    const raw = JSON.stringify({ event: event || 'payment.captured', payload: { payment: { entity: { id: 'payment-test', order_id: 'ORDERTEST', amount: 1 } } } });
    return new Request('https://example.com/api/webhooks/razorpay', { method: 'POST', body: raw,
      headers: { 'x-razorpay-signature': createHmac('sha256', 'test-webhook-secret').update(raw).digest('hex') } });
  }
  return new Request('https://example.com/api/webhooks/paypal', { method: 'POST',
    headers: { 'paypal-auth-algo': 'SHA256withRSA', 'paypal-cert-url': 'https://api.paypal.com/test-cert',
      'paypal-transmission-id': 'test-transmission', 'paypal-transmission-sig': 'test-signature',
      'paypal-transmission-time': new Date().toISOString() },
    body: JSON.stringify({ event_type: event || 'PAYMENT.CAPTURE.COMPLETED', resource: { supplementary_data: { related_ids: { order_id: 'ORDERTEST' } } } }),
  });
}

describe.each(['paypal', 'razorpay'] as const)('%s route recovery with isolated provider boundaries', gateway => {
  const create = gateway === 'paypal' ? createPayPal : createRazorpay;
  const webhook = gateway === 'paypal' ? paypalWebhook : razorpayWebhook;
  it('recovers a lost return callback through verified webhooks, then exposes one complete admin order', async () => {
    checkoutFixtures();
    const response = await create(checkoutRequest(gateway)); expect(response.status).toBe(200);
    const prepared = await response.json(); expect(prepared.id).toBe('ORDERTEST');
    const snapshot = await findCommerceOrder(gateway, prepared.id);
    expect(snapshot).toMatchObject({ status: 'pending', paymentCurrency: 'EUR', paymentAmount: '100.00',
      shipping: 2500, total: 10400, ownerUserId: 'test-owner', customer: { country: 'DE', address: 'Test Street 1, Berlin, 10115, Germany' },
      items: [{ price: 7900, ringSize: 12 }] });
    expect(mocks.docs.get('product-test')).toMatchObject({ stockQuantity: 1, checkoutReservation: { id: snapshot!.reservationId } });
    expect(mocks.email).not.toHaveBeenCalled();
    mocks.payment.mockResolvedValue({ id: 'payment-test', order_id: 'ORDERTEST', amount: 10000, currency: 'EUR', status: 'captured' });
    expect((await webhook(webhookRequest(gateway))).status).toBe(200);
    expect((await webhook(webhookRequest(gateway))).status).toBe(200);
    const admin = await adminOrders(); expect(admin.headers.get('Cache-Control')).toBe('private, no-store');
    const data = await admin.json(); expect(data.count).toBe(1); expect(data.paidCount).toBe(1);
    expect(data.orders[0]).toMatchObject({ status: 'paid', items: [{ ringSize: 12, price: 7900 }], customer: { country: 'DE' } });
    expect(mocks.docs.get('product-test')).toMatchObject({ stockQuantity: 0, inStock: false });
    expect(mocks.email).toHaveBeenCalledTimes(1); expect(mocks.capture).not.toHaveBeenCalled();
    const receipt = renderOrderReceipt(mocks.email.mock.calls[0][0]);
    expect(receipt.text).toContain('Ring size (India): 12'); expect(receipt.text).toContain('Order total: \u20ac100.00');
  });
  it('does not expose a payment link if saving the checkout fails and releases its reservation', async () => {
    checkoutFixtures(); mocks.failures.set('create', 1);
    const response = await create(checkoutRequest(gateway)); expect(response.status).toBe(400);
    expect(await response.json()).not.toHaveProperty('id');
    expect(await findCommerceOrder(gateway, 'ORDERTEST')).toBeNull();
    expect(mocks.docs.get('product-test')?.checkoutReservation).toBeUndefined(); expect(mocks.email).not.toHaveBeenCalled();
  });
  it('rejects forged webhooks without changing stock, payment status or sending mail', async () => {
    checkoutFixtures(); await create(checkoutRequest(gateway));
    const request = webhookRequest(gateway);
    if (gateway === 'razorpay') request.headers.set('x-razorpay-signature', 'forged');
    else mocks.fetch.mockResolvedValue(Response.json({ verification_status: 'FAILURE' }));
    expect((await webhook(request)).status).toBe(401);
    expect((await findCommerceOrder(gateway, 'ORDERTEST'))?.status).toBe('pending');
    expect(mocks.docs.get('product-test')?.stockQuantity).toBe(1); expect(mocks.email).not.toHaveBeenCalled();
  });
  it('returns a retryable error on provider outage and then recovers using the same private snapshot', async () => {
    checkoutFixtures(); await create(checkoutRequest(gateway));
    if (gateway === 'paypal') mocks.paypal.mockRejectedValueOnce(new Error('Provider timeout'));
    else mocks.paymentOrder.mockRejectedValueOnce(new Error('Provider timeout'));
    expect((await webhook(webhookRequest(gateway))).status).toBe(503);
    expect((await findCommerceOrder(gateway, 'ORDERTEST'))?.status).toBe('pending'); expect(mocks.email).not.toHaveBeenCalled();
    mocks.payment.mockResolvedValue({ id: 'payment-test', order_id: 'ORDERTEST', amount: 10000, currency: 'EUR', status: 'captured' });
    expect((await webhook(webhookRequest(gateway))).status).toBe(200);
    expect(mocks.docs.get('product-test')?.stockQuantity).toBe(0); expect(mocks.email).toHaveBeenCalledTimes(1);
  });
  it('rejects a provider currency mismatch without allocating stock or sending a receipt', async () => {
    checkoutFixtures(); await create(checkoutRequest(gateway));
    if (gateway === 'paypal') {
      const wrong = provider(); wrong.purchase_units[0].payments.captures[0].amount.currency_code = 'USD';
      mocks.paypal.mockResolvedValue(wrong);
    } else mocks.payment.mockResolvedValue({ id: 'payment-test', order_id: 'ORDERTEST', amount: 10000, currency: 'USD', status: 'captured' });
    expect((await webhook(webhookRequest(gateway))).status).toBe(503);
    expect(mocks.docs.get('product-test')?.stockQuantity).toBe(1); expect(mocks.email).not.toHaveBeenCalled();
  });
  it('cancels an unpaid abandoned checkout using only its signed cancellation token', async () => {
    checkoutFixtures(); await create(checkoutRequest(gateway));
    const saved = (await findCommerceOrder(gateway, 'ORDERTEST'))!;
    mocks.paypal.mockResolvedValue({ id: 'ORDERTEST', status: 'CREATED' });
    await expect(cancelCheckout(gateway, 'ORDERTEST', 'bad')).rejects.toThrow('Invalid');
    await cancelCheckout(gateway, 'ORDERTEST', checkoutCancellationToken('ORDERTEST', saved.reservationId!));
    expect((await findCommerceOrder(gateway, 'ORDERTEST'))?.status).toBe('cancelled');
    expect(mocks.docs.get('product-test')).toMatchObject({ stockQuantity: 1 });
    expect(mocks.docs.get('product-test')?.checkoutReservation).toBeUndefined(); expect(mocks.email).not.toHaveBeenCalled();
  });
});
