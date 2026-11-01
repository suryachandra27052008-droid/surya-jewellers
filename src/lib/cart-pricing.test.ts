import { describe, expect, it, vi } from 'vitest';
import { cartPricesMatch, currentCartPrices, repriceCart } from './cart-pricing';

const ring = { _id: 'ring-one', price: 6999, quantity: 1, ringSize: 12 };
describe('current cart prices', () => {
  it('refreshes prices without changing quantity, selected size or the original array', () => {
    const before = [ring, { ...ring, ringSize: 14, quantity: 2 }];
    const after = repriceCart(before, new Map([['ring-one', 10999]]));
    expect(after).toEqual([{ ...ring, price: 10999 }, { ...ring, ringSize: 14, quantity: 2, price: 10999 }]);
    expect(before[0].price).toBe(6999);
    expect(cartPricesMatch(before, after)).toBe(false);
    expect(cartPricesMatch(after, after)).toBe(true);
  });
  it('keeps unchanged items stable and rejects missing or unavailable products', () => {
    expect(repriceCart([ring], new Map([['ring-one', 6999]]))[0]).toBe(ring);
    expect(() => repriceCart([ring], new Map())).toThrow('unavailable');
  });
  it('detects concurrent changes to quantity, ring size, removal and price', () => {
    for (const items of [[], [{ ...ring, quantity: 2 }], [{ ...ring, ringSize: 14 }], [{ ...ring, price: 10999 }]]) {
      expect(cartPricesMatch([ring], items)).toBe(false);
    }
  });
  it('requests fresh prices in bounded batches without requesting order data', async () => {
    const items = Array.from({ length: 14 }, (_, index) => ({ ...ring, _id: `ring-${index}` }));
    const fetcher = vi.fn(async (url: string, init: RequestInit) => {
      expect(init.cache).toBe('no-store');
      const ids = new URL(url, 'https://example.com').searchParams.get('ids')!.split(',');
      expect(ids.length).toBeLessThanOrEqual(12);
      return Response.json({ products: ids.map(_id => ({ _id, price: 10999 })) });
    });
    const prices = await currentCartPrices(items, fetcher as typeof fetch);
    expect(fetcher).toHaveBeenCalledTimes(2);
    expect(prices.size).toBe(14);
    expect(repriceCart(items, prices)[0].price).toBe(10999);
  });
  it('does not allow unknown, blocked or sold-out prices into checkout', async () => {
    const fetcher = vi.fn().mockResolvedValue(Response.json({ products: [
      { ...ring, price: 19 }, { _id: 'sold', price: 5999, inStock: false },
      { _id: 'zero', price: 5999, stockQuantity: 0 }, { _id: 'invalid', price: '5999' },
    ] }));
    expect((await currentCartPrices([ring], fetcher)).size).toBe(0);
  });
  it('fails closed on a provider outage and never guesses a price', async () => {
    await expect(currentCartPrices([ring], vi.fn().mockResolvedValue(Response.json({}, { status: 503 })))).rejects.toThrow('could not be checked');
  });
});
