import { describe, expect, it } from 'vitest';
import { recordViewedProduct, sanitizeViewedProducts, RECENTLY_VIEWED_MAX_AGE } from './recently-viewed';

const now = 1_800_000_000_000;
describe('private local browsing history', () => {
  it('puts the most recent visit first without repeating a product', () => {
    const original = [{ id: 'ring-1', viewedAt: now - 100 }, { id: 'ring-2', viewedAt: now - 200 }];
    expect(recordViewedProduct(original, 'ring-2', now)).toEqual([{ id: 'ring-2', viewedAt: now }, original[0]]);
    expect(original[1].viewedAt).toBe(now - 200);
  });
  it('stores only bounded IDs and timestamps, never cached names, prices or customer data', () => {
    const result = sanitizeViewedProducts(Array.from({ length: 30 }, (_, i) => ({ id: `product-${i}`, viewedAt: now - i,
      price: 19, email: 'not-stored@example.com', name: 'stale name' })), now);
    expect(result).toHaveLength(12); expect(Object.keys(result[0])).toEqual(['id', 'viewedAt']);
  });
  it('discards expired, future, malformed and duplicate entries', () => {
    expect(sanitizeViewedProducts([null, {}, { id: '../unsafe', viewedAt: now }, { id: 'drafts.product', viewedAt: now },
      { id: 'old', viewedAt: now - RECENTLY_VIEWED_MAX_AGE }, { id: 'future', viewedAt: now + 120_000 },
      { id: 'valid', viewedAt: now }, { id: 'valid', viewedAt: now - 1 }, { id: 'bad-time', viewedAt: 'yesterday' }], now))
      .toEqual([{ id: 'valid', viewedAt: now }]);
    expect(sanitizeViewedProducts('broken', now)).toEqual([]);
    expect(recordViewedProduct([], 'https://other.example', now)).toEqual([]);
  });
});
