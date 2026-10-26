import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({ price: vi.fn(), create: vi.fn() }));
vi.mock('@/lib/sanity/client', () => ({ writeClient: { createIfNotExists: mocks.create } }));
vi.mock('@/lib/server/checkout-pricing', async importOriginal => ({
  ...await importOriginal<typeof import('@/lib/server/checkout-pricing')>(), priceCheckout: mocks.price,
}));
import { POST } from '@/app/api/paypal/create-order/route';
import { recoverPayPalCustomer } from '@/lib/server/paypal-checkout';

const customer = { fullName: 'Test Buyer', email: 'buyer@example.com', phone: '0000000000',
  address1: 'Test address', city: 'Test city', state: 'Test state', pincode: '123456' };
const fetchMock = vi.fn();
function request(includeCustomer = true) {
  return new Request('http://localhost/api/paypal/create-order', { method: 'POST', body: JSON.stringify({
    currency: 'EUR', customer: includeCustomer ? customer : undefined, items: [{ _id: 'test-product', quantity: 1 }],
  }) });
}

beforeEach(() => {
  vi.clearAllMocks();
  mocks.create.mockResolvedValue({});
  mocks.price.mockResolvedValue({ items: [{ _id: 'test-product', name: 'Test Ring', price: 10400, quantity: 1 }],
    subtotal: 10400, discount: null, shipping: 0, total: 10400 });
  fetchMock.mockReset().mockResolvedValueOnce(Response.json({ access_token: 'test-token' }))
    .mockResolvedValueOnce(Response.json({ id: 'ORDER123', links: [{ rel: 'approve', href: 'https://www.paypal.com/test' }] }));
  vi.stubGlobal('fetch', fetchMock);
});
afterEach(() => vi.unstubAllGlobals());

describe('PayPal checkout preservation', () => {
  it('saves the private item and currency snapshot before returning the payment link', async () => {
    const response = await POST(request());
    expect(response.status).toBe(200);
    expect(mocks.create).toHaveBeenCalledWith(expect.objectContaining({
      _id: 'orders.paypal-order-ORDER123', status: 'pending', paymentCurrency: 'EUR', paymentAmount: '100.00',
      customer: expect.objectContaining({ name: 'Test Buyer', email: 'buyer@example.com' }),
      items: [expect.objectContaining({ productId: 'test-product', name: 'Test Ring', price: 10400 })],
    }));
    expect((await response.json()).links).toHaveLength(1);
  });

  it('does not expose the payment link when the item snapshot cannot be saved', async () => {
    mocks.create.mockRejectedValue(new Error('Database unavailable'));
    const response = await POST(request());
    expect(response.status).toBe(400);
    expect((await response.json()).links).toBeUndefined();
  });

  it('rejects missing shipping details before creating a payment', async () => {
    const response = await POST(request(false));
    expect(response.status).toBe(400);
    expect(fetchMock).not.toHaveBeenCalled();
    expect(mocks.create).not.toHaveBeenCalled();
  });

  it('flags missing legacy customer data without inventing contact or shipping details', () => {
    const result = recoverPayPalCustomer({}, { id: 'ORDER123', status: 'COMPLETED',
      payer: { name: { given_name: 'Test', surname: 'Buyer' }, email_address: 'buyer@example.com' } });
    expect(result).toEqual({ customer: { name: 'Test Buyer', email: 'buyer@example.com', phone: '', address: '' }, needsMerchantReview: true });
  });
});
