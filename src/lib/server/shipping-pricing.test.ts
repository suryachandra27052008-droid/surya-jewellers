import { describe, expect, it, vi } from 'vitest';

vi.mock('@/lib/sanity/client', () => ({ writeClient: {
  fetch: vi.fn(async (query: string) => query.includes('_type == "product"') ? [{
    _id: 'test-product', name: 'Test Ring', price: 22997, stockQuantity: 1, inStock: true,
    sku: 'TEST1', slug: 'test-ring', category: 'Rings',
  }] : null),
} }));
import { priceCheckout, toPaymentAmount } from './checkout-pricing';

describe('server international shipping totals', () => {
  it('adds the same shipping used by checkout before converting the payment amount', async () => {
    const pricing = await priceCheckout([{ _id: 'test-product', quantity: 1, ringSize: 12 }], { country: 'Italy' });
    expect(pricing.shipping).toBe(2500);
    expect(pricing.total).toBe(25497);
    expect(toPaymentAmount(pricing.total, 'EUR')).toMatchObject({ subunits: 24516, displayValue: '245.16' });
    expect(toPaymentAmount(pricing.total, 'USD')).toMatchObject({ subunits: 30596, displayValue: '305.96' });
  });
  it('preserves the old domestic-shipping total for old callbacks and India', async () => {
    expect((await priceCheckout([{ _id: 'test-product', quantity: 1 }], { requireInStock: false })).total).toBe(22997);
    expect((await priceCheckout([{ _id: 'test-product', quantity: 1, ringSize: 12 }], { country: 'India' })).shipping).toBe(0);
  });
  it('adds the opt-in Razorpay fee after international shipping, preserving product prices', async () => {
    const pricing = await priceCheckout([{ _id: 'test-product', quantity: 1, ringSize: 12 }], {
      country: 'Italy', provider: 'razorpay', currency: 'EUR',
    });
    expect(pricing).toMatchObject({ subtotal: 22997, shipping: 2500, currencyConversionFee: 1019.88, total: 26516.88 });
    expect(pricing.items[0]).toMatchObject({ price: 22997, ringSize: 12 });
    expect(toPaymentAmount(pricing.total, 'EUR')).toMatchObject({ subunits: 25497, displayValue: '254.97' });
  });
  it.each([
    { provider: 'razorpay' as const, currency: 'INR' },
    { provider: 'paypal' as const, currency: 'EUR' },
    { currency: 'EUR' },
  ])('does not add a fee to %j', async options => {
    const pricing = await priceCheckout([{ _id: 'test-product', quantity: 1, ringSize: 12 }], { country: 'Italy', ...options });
    expect(pricing.total).toBe(25497);
    expect(pricing.currencyConversionFee).toBeUndefined();
  });
});
