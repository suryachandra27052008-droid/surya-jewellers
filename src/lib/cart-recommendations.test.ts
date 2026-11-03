import { describe, expect, it } from 'vitest';
import { cartRecommendations } from './cart-recommendations';
const item = { _id: 'one', name: 'Ring', slug: 'ring', price: 5000, images: ['https://cdn.sanity.io/ring.jpg'], mainStoneType: 'Ruby' };
describe('cart recommendations', () => {
  it('excludes products already in the cart and unavailable or erroneous-price items', () => {
    expect(cartRecommendations([item, { ...item, _id: 'bad', price: 19 }, { ...item, _id: 'sold', inStock: false },
      { ...item, _id: 'zero', stockQuantity: 0 }], [item])).toEqual([]);
  });
  it('prefers matching stones, returns at most two and never mutates source data', () => {
    const list = [{ ...item, _id: 'cheap', price: 2000, mainStoneType: 'Emerald' }, { ...item, _id: 'matching' }, { ...item, _id: 'other' }];
    expect(cartRecommendations(list, [{ _id: 'bag', mainStoneType: 'Ruby' }]).map(p => p._id)).toEqual(['matching', 'other']);
    expect(list[0]._id).toBe('cheap');
  });
});
