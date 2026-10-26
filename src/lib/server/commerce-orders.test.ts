import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({ docs: new Map<string, Record<string, unknown>>(), revision: 0,
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
    getDocument: vi.fn(async (id: string) => structuredClone(mocks.docs.get(id))),
    getDocuments: vi.fn(async (ids: string[]) => ids.map(id => structuredClone(mocks.docs.get(id)) || null)),
    createIfNotExists: vi.fn(async (doc: Record<string, unknown> & { _id: string }) => { if (!mocks.docs.has(doc._id)) mocks.docs.set(doc._id, { ...structuredClone(doc), _rev: `revision-${++mocks.revision}` }); }),
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
vi.mock('@/lib/email', () => ({ sendOrderReceiptEmail: mocks.email }));
vi.mock('./paypal', () => ({ getPayPalOrder: mocks.paypal, capturePayPalOrder: mocks.paypalCapture }));
vi.mock('razorpay', () => ({ default: class {
  payments = { fetch: mocks.payment, capture: mocks.capture };
  orders = { fetch: mocks.paymentOrder, fetchPayments: mocks.payments };
} }));

import { availableStock, combineStockLines, reserveStock, releaseStock } from './inventory-reservations';
import { recordCommerceCheckout, reconcileCommerceOrder, type CommerceOrder } from './commerce-orders';

function product(stock = 1) { mocks.docs.set('product-test', { _id: 'product-test', _rev: 'product-rev', name: 'Test Ring', stockQuantity: stock, inStock: true }); }
function order(provider: 'paypal' | 'razorpay' = 'paypal'): CommerceOrder {
  return { _id: 'orders.test', _rev: 'order-rev', checkoutVersion: 2, paymentMethod: provider,
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
  vi.clearAllMocks(); mocks.docs.clear(); mocks.revision = 0; product();
  mocks.paypal.mockResolvedValue(provider()); mocks.email.mockResolvedValue('email-test');
  mocks.paymentOrder.mockResolvedValue({ amount: 10000, currency: 'EUR' });
  mocks.payment.mockResolvedValue({ id: 'payment-test', order_id: 'ORDERTEST', currency: 'EUR', amount: 10000, status: 'authorized' });
  mocks.payments.mockResolvedValue({ items: [] });
  mocks.capture.mockResolvedValue({ id: 'payment-test', status: 'captured' });
});

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
    const saved = order('razorpay'); mocks.docs.set(saved._id, structuredClone(saved));
    await reconcileCommerceOrder(saved, { paymentId: 'payment-test' });
    expect(mocks.capture).toHaveBeenCalledWith('payment-test', 10000, 'EUR');
    expect(mocks.docs.get(saved._id)?.status).toBe('paid');
  });
  it('does not capture a Razorpay authorization if the piece has sold', async () => {
    const saved = order('razorpay'); mocks.docs.set(saved._id, structuredClone(saved)); product(0);
    await expect(reconcileCommerceOrder(saved, { paymentId: 'payment-test' })).rejects.toThrow('unavailable');
    expect(mocks.capture).not.toHaveBeenCalled(); expect(mocks.email).not.toHaveBeenCalled();
  });
});
