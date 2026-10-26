import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({ fetch: vi.fn() }));
vi.mock('@/lib/sanity/client', () => ({ writeClient: { fetch: mocks.fetch } }));
import { priceCheckout } from './checkout-pricing';

beforeEach(() => {
  mocks.fetch.mockReset().mockImplementation(async (query: string) => query.includes('_type == "product"')
    ? [{ _id: 'ring-one', name: 'Emerald Ring', price: 10000, stockQuantity: 3, inStock: true, category: 'Rings' }]
    : {});
});

describe('ring sizes at server checkout', () => {
  it('keeps different sizes separate and merges only identical size lines', async () => {
    const result = await priceCheckout([
      { _id: 'ring-one', quantity: 1, ringSize: 12 }, { _id: 'ring-one', quantity: 1, ringSize: 14 },
      { _id: 'ring-one', quantity: 1, ringSize: 12 },
    ]);
    expect(result.items.map(({ ringSize, quantity }) => ({ ringSize, quantity }))).toEqual([
      { ringSize: 12, quantity: 2 }, { ringSize: 14, quantity: 1 },
    ]);
    expect(result.subtotal).toBe(30000);
  });
  it('enforces aggregate stock across sizes', async () => {
    await expect(priceCheckout([{ _id: 'ring-one', quantity: 2, ringSize: 12 },
      { _id: 'ring-one', quantity: 2, ringSize: 14 }])).rejects.toThrow('quantity available');
  });
  it('requires size before starting a new ring payment', async () => {
    await expect(priceCheckout([{ _id: 'ring-one', quantity: 1 }])).rejects.toThrow('choose a ring size');
  });
  it.each([0, 4, 21, 12.5, '12', '<script>'])('rejects invalid size %s', async ringSize => {
    await expect(priceCheckout([{ _id: 'ring-one', quantity: 1, ringSize: ringSize as number }])).rejects.toThrow('ring size');
  });
  it('does not invent sizes for older paid orders', async () => {
    const result = await priceCheckout([{ _id: 'ring-one', quantity: 1 }], { requireInStock: false });
    expect(result.items[0].ringSize).toBeUndefined();
  });
  it('rejects sizes on non-ring products', async () => {
    mocks.fetch.mockResolvedValue([{ _id: 'stud-one', name: 'Ruby Stud', price: 5000, category: 'Studs' }]);
    await expect(priceCheckout([{ _id: 'stud-one', quantity: 1, ringSize: 12 }])).rejects.toThrow('only be selected for rings');
  });
});
