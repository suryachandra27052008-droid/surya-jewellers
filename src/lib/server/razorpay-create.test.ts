import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
const mocks = vi.hoisted(() => ({ create: vi.fn(), record: vi.fn(), price: vi.fn() }));
vi.mock('razorpay', () => ({ default: class { orders = { create: mocks.create }; } }));
vi.mock('@/lib/server/checkout-pricing', async importOriginal => ({
  ...await importOriginal<typeof import('@/lib/server/checkout-pricing')>(), priceCheckout: mocks.price,
}));
vi.mock('@/lib/server/inventory-reservations', () => ({ reserveStock: vi.fn().mockResolvedValue({ id: 'test-reservation', expiresAt: '2026-11-01T00:00:00Z' }), releaseStock: vi.fn() }));
vi.mock('@/lib/server/commerce-orders', () => ({ recordCommerceCheckout: mocks.record }));
vi.mock('@/lib/server/customer-orders', () => ({ checkoutOwner: vi.fn() }));
vi.mock('@/lib/server/shopping-analytics', () => ({ analyticsContext: vi.fn() }));
import { POST } from '@/app/api/create-order/route';

beforeEach(() => {
  vi.clearAllMocks();
  vi.stubEnv('NEXT_PUBLIC_RAZORPAY_KEY_ID', 'test-key');
  vi.stubEnv('RAZORPAY_KEY_SECRET', 'test-secret');
  vi.stubEnv('RAZORPAY_MANUAL_CAPTURE_ENABLED', '');
  vi.stubEnv('RAZORPAY_WEBHOOK_SECRET', '');
  mocks.create.mockResolvedValue({ id: 'order_test', amount: 1000000, currency: 'INR' });
  mocks.price.mockResolvedValue({ items: [{ _id: 'ring-test', quantity: 1, price: 10000, ringSize: 12 }], subtotal: 10000, total: 10000, shipping: 0, discount: null });
});
afterEach(() => vi.unstubAllEnvs());
const request = () => new Request('http://localhost/api/create-order', { method: 'POST', body: JSON.stringify({
  customer: { fullName: 'Test Buyer', email: 'buyer@example.com', phone: '0000000000', address1: 'Test address', city: 'Test city', country: 'IN', pincode: '123456' },
  items: [{ _id: 'ring-test', quantity: 1, ringSize: 12 }],
}) });

describe('Razorpay release compatibility', () => {
  it('preserves existing provider capture settings by default', async () => {
    expect((await POST(request())).status).toBe(200);
    expect(mocks.create.mock.calls[0][0]).not.toHaveProperty('payment');
    expect(mocks.record.mock.calls[0][2].items[0].ringSize).toBe(12);
  });
  it('does not enable manual capture merely because a webhook is configured', async () => {
    vi.stubEnv('RAZORPAY_WEBHOOK_SECRET', 'test-webhook');
    expect((await POST(request())).status).toBe(200);
    expect(mocks.create.mock.calls[0][0]).not.toHaveProperty('payment');
  });
  it('requires webhook configuration before the manual-capture flag can take effect', async () => {
    vi.stubEnv('RAZORPAY_MANUAL_CAPTURE_ENABLED', 'true');
    expect((await POST(request())).status).toBe(200);
    expect(mocks.create.mock.calls[0][0]).not.toHaveProperty('payment');
  });
  it('enables manual capture only with explicit activation and webhook configuration', async () => {
    vi.stubEnv('RAZORPAY_MANUAL_CAPTURE_ENABLED', 'true'); vi.stubEnv('RAZORPAY_WEBHOOK_SECRET', 'test-webhook');
    expect((await POST(request())).status).toBe(200);
    expect(mocks.create.mock.calls[0][0].payment).toEqual({ capture: 'manual' });
  });
});
