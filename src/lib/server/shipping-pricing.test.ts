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
});
