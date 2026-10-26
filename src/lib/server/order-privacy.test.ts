import { beforeEach, describe, expect, it, vi } from 'vitest';
import crypto from 'node:crypto';

const mocks = vi.hoisted(() => ({
  fetch: vi.fn(), create: vi.fn(), patch: vi.fn(),
  set: vi.fn(), commit: vi.fn(), paypal: vi.fn(),
  payment: vi.fn(), paymentOrder: vi.fn(), email: vi.fn(),
  findCheckout: vi.fn(), ifRevision: vi.fn(),
}));
vi.mock('@/lib/sanity/client', () => ({
  writeClient: { fetch: mocks.fetch, createIfNotExists: mocks.create, patch: mocks.patch },
}));
vi.mock('@/lib/email', () => ({ sendOrderConfirmation: mocks.email, sendOrderStatusEmail: mocks.email }));
vi.mock('@/lib/server/paypal', () => ({ getPayPalOrder: mocks.paypal }));
vi.mock('@/lib/server/paypal-checkout', async (importOriginal) => ({
  ...await importOriginal<typeof import('@/lib/server/paypal-checkout')>(),
  findPayPalCheckout: mocks.findCheckout,
}));
vi.mock('razorpay', () => ({ default: class {
  payments = { fetch: mocks.payment };
  orders = { fetch: mocks.paymentOrder };
} }));
vi.mock('@/lib/server/checkout-pricing', () => ({
  priceCheckout: vi.fn().mockResolvedValue({
    items: [{ _id: 'product-test', name: 'Test', price: 2000, quantity: 1 }],
    subtotal: 2000, discount: 0, shipping: 0, total: 2000,
  }),
  toPaymentAmount: vi.fn().mockReturnValue({ currency: 'INR', subunits: 200000, displayValue: '2000.00' }),
}));

import { POST as razorpay } from '@/app/api/verify-payment/route';
import { POST as paypal } from '@/app/api/save-paypal-order/route';
import { GET, PATCH } from '@/app/api/admin/orders/route';
import { priceCheckout } from '@/lib/server/checkout-pricing';

function request(body: unknown) {
  return new Request('http://localhost/api/test', { method: 'POST', body: JSON.stringify(body) });
}

const customer = {
  fullName: 'Test Customer', email: 'buyer@example.com', phone: '0000000000',
  address1: 'Test address', city: 'Test city', state: 'Test state', pincode: '123456',
};

function snapshot() {
  return {
    _id: 'orders.paypal-order-order_test', _rev: 'revision-test', status: 'pending',
    razorpayOrderId: 'order_test', paymentCurrency: 'INR', paymentAmount: '2000.00',
    items: [{ _key: 'item-0', productId: 'product-test', name: 'Original Test', price: 2000, quantity: 1 }],
    customer: { name: 'Test Customer', email: 'buyer@example.com', phone: '000', address: 'Original address' },
    subtotal: 2000, discount: null, shipping: 0, total: 2000,
  };
}

beforeEach(() => {
  vi.clearAllMocks();
  mocks.fetch.mockImplementation((query: string) => Promise.resolve(query.includes('images[0]') ? [] : null));
  mocks.findCheckout.mockResolvedValue(null);
  mocks.create.mockResolvedValue({});
  mocks.patch.mockReturnValue({ set: mocks.set });
  mocks.set.mockReturnValue({ commit: mocks.commit, ifRevisionId: mocks.ifRevision });
  mocks.commit.mockResolvedValue({});
  mocks.paypal.mockResolvedValue({ status: 'COMPLETED', purchase_units: [{
    custom_id: 'server_total_inr_2000', payments: { captures: [{ id: 'capture_test', status: 'COMPLETED',
      amount: { currency_code: 'INR', value: '2000.00' } }] },
  }] });
  mocks.payment.mockResolvedValue({ order_id: 'order_test', status: 'captured', amount: 200000 });
  mocks.paymentOrder.mockResolvedValue({ currency: 'INR', amount: 200000 });
  vi.stubEnv('RAZORPAY_KEY_SECRET', 'test-only-secret');
  vi.stubEnv('NEXT_PUBLIC_RAZORPAY_KEY_ID', 'test-only-key');
});

describe('backward-compatible order privacy', () => {
  it('saves existing PayPal callback payloads to a private ID', async () => {
    const response = await paypal(request({ paypalOrderId: 'ORDERTEST', paypalCaptureId: 'capture_test', customer }));
    expect(response.status).toBe(200);
    expect(mocks.create).toHaveBeenCalledWith(expect.objectContaining({ _id: 'orders.paypal-capture_test', total: 2000 }));
  });

  it('saves existing signed Razorpay callback payloads to a private ID', async () => {
    const signature = crypto.createHmac('sha256', 'test-only-secret').update('order_test|payment_test').digest('hex');
    const response = await razorpay(request({ razorpay_order_id: 'order_test', razorpay_payment_id: 'payment_test', razorpay_signature: signature }));
    expect(response.status).toBe(200);
    expect(mocks.create).toHaveBeenCalledWith(expect.objectContaining({ _id: 'orders.razorpay-payment_test', total: 2000 }));
  });

  it('does not create another order when a legacy order exists', async () => {
    mocks.fetch.mockResolvedValue('order-paypal-capture_test');
    const response = await paypal(request({ paypalOrderId: 'ORDERTEST', paypalCaptureId: 'capture_test', customer }));
    expect(await response.json()).toMatchObject({ success: true, duplicate: true });
    expect(mocks.create).not.toHaveBeenCalled();
    expect(mocks.patch).not.toHaveBeenCalled();
  });

  it('rejects invalid signatures without modifying orders', async () => {
    const response = await razorpay(request({ razorpay_order_id: 'order_test', razorpay_payment_id: 'payment_test', razorpay_signature: 'invalid' }));
    expect(response.status).toBe(400);
    expect(mocks.create).not.toHaveBeenCalled();
  });

  it('reads private orders with the authenticated client and prevents response caching', async () => {
    mocks.fetch.mockResolvedValue([{ _id: 'orders.legacy-test', total: 2000, status: 'paid' }]);
    const response = await GET();
    expect(response.headers.get('cache-control')).toBe('private, no-store');
    expect(await response.json()).toMatchObject({ count: 1, totalRevenue: 2000 });
  });

  it('does not allow the order editor to modify other CMS document types', async () => {
    mocks.fetch.mockResolvedValue(false);
    const response = await PATCH(request({ id: 'siteSettings', status: 'paid' }));
    expect(response.status).toBe(404);
    expect(mocks.patch).not.toHaveBeenCalled();
  });

  it('records a pending capture without sending confirmation or changing stock', async () => {
    mocks.paypal.mockResolvedValue({ status: 'COMPLETED', purchase_units: [{
      custom_id: 'server_total_inr_2000', payments: { captures: [{ id: 'capture_test', status: 'PENDING',
        status_details: { reason: 'RECEIVING_PREFERENCE_MANDATES_MANUAL_ACTION' },
        amount: { currency_code: 'INR', value: '2000.00' } }] },
    }] });
    const response = await paypal(request({ paypalOrderId: 'ORDERTEST', customer }));
    expect(await response.json()).toMatchObject({ success: true, pending: true });
    expect(mocks.create).toHaveBeenCalledWith(expect.objectContaining({ status: 'pending', paymentStatus: 'PENDING' }));
    expect(mocks.email).not.toHaveBeenCalled();
    expect(mocks.patch).not.toHaveBeenCalled();
  });

  it('uses the saved items and customer when the browser has lost its cart', async () => {
    mocks.findCheckout.mockResolvedValue(snapshot());
    const response = await paypal(request({ paypalOrderId: 'ORDERTEST', items: [] }));
    expect(response.status).toBe(200);
    expect(mocks.set).toHaveBeenCalledWith(expect.objectContaining({ status: 'paid',
      items: [expect.objectContaining({ name: 'Original Test', price: 2000 })],
    }));
    expect(mocks.ifRevision).toHaveBeenCalledWith('revision-test');
    expect(mocks.patch).toHaveBeenCalledWith('orders.paypal-order-order_test');
    expect(mocks.email).toHaveBeenCalledWith(expect.objectContaining({
      customer: expect.objectContaining({ address: 'Original address' }),
    }));
    expect(priceCheckout).not.toHaveBeenCalled();
  });

  it('rejects a captured amount that differs from the saved checkout', async () => {
    mocks.findCheckout.mockResolvedValue({ ...snapshot(), paymentAmount: '3000.00' });
    const response = await paypal(request({ paypalOrderId: 'ORDERTEST' }));
    expect(response.status).toBe(400);
    expect(mocks.patch).not.toHaveBeenCalled();
  });

  it('keeps the original EUR amount even if conversion or product prices have changed', async () => {
    mocks.findCheckout.mockResolvedValue({ ...snapshot(), paymentCurrency: 'EUR', paymentAmount: '221.13', total: 22997 });
    mocks.paypal.mockResolvedValue({ status: 'COMPLETED', purchase_units: [{
      custom_id: 'server_total_inr_22997', payments: { captures: [{ id: 'capture_test', status: 'PENDING',
        amount: { currency_code: 'EUR', value: '221.13' } }] },
    }] });
    const response = await paypal(request({ paypalOrderId: 'ORDERTEST' }));
    expect(await response.json()).toMatchObject({ success: true, pending: true });
    expect(priceCheckout).not.toHaveBeenCalled();
    expect(mocks.email).not.toHaveBeenCalled();
  });

  it('does not count pending or failed orders as revenue', async () => {
    mocks.fetch.mockResolvedValue([
      { total: 2000, status: 'paid' }, { total: 9999, status: 'pending' }, { total: 5000, status: 'failed' },
    ]);
    expect(await (await GET()).json()).toMatchObject({ count: 3, paidCount: 1, totalRevenue: 2000, avgOrderValue: 2000 });
  });
});
