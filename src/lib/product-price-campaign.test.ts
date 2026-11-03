import { describe, expect, it } from 'vitest';
import { planPriceIncrease, planPriceRollback } from './product-price-campaign';

const product = { _id: 'ring', _rev: 'one', sku: 'RNG1', price: 9000, inStock: true, stockQuantity: 1 };
describe('campaign price plan and rollback', () => {
  it('adds exactly 1000 once per eligible record without changing source data', () => {
    const input = structuredClone(product);
    expect(planPriceIncrease([input], 1000).changes).toEqual([{ id: 'ring', revision: 'one', sku: 'RNG1', before: 9000, after: 10000 }]);
    expect(input).toEqual(product);
  });
  it('preserves blocked products, unavailable records and drafts', () => {
    const plan = planPriceIncrease([{ ...product, _id: 'bad1', sku: '20', price: 19 },
      { ...product, _id: 'bad2', sku: '9', price: 50 }, { ...product, _id: 'sold', inStock: false },
      { ...product, _id: 'zero', stockQuantity: 0 }, { ...product, _id: 'drafts.ring' }], 1000);
    expect(plan.changes).toHaveLength(0); expect(plan.skipped).toHaveLength(5);
  });
  it('rejects duplicate records, unrecognized variations and missing revisions', () => {
    expect(() => planPriceIncrease([product, product], 1000)).toThrow('Duplicate');
    expect(() => planPriceIncrease([{ ...product, variants: [{ price: 9000 }] }], 1000)).toThrow('Variation');
    expect(() => planPriceIncrease([{ ...product, _rev: undefined }], 1000)).toThrow('revision');
  });
  it('restores only the saved original value and flags later merchant changes', () => {
    const { changes } = planPriceIncrease([product], 1000);
    expect(planPriceRollback(changes, [{ ...product, price: 10000, _rev: 'two' }])).toMatchObject({ restore: [{ before: 9000, revision: 'two' }], conflicts: [] });
    expect(planPriceRollback(changes, [{ ...product, price: 11000 }])).toEqual({ restore: [], conflicts: ['ring'] });
    expect(planPriceRollback(changes, [product])).toEqual({ restore: [], conflicts: [] });
  });
});
