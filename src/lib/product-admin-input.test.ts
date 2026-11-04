import { describe, expect, it } from 'vitest';
import { normalizeProductContent, normalizeProductStock } from './product-admin-input';

describe('product content saved at source', () => {
  it('corrects gemstone spellings without touching prices, SKU, URLs or images', () => {
    const product = { name: 'Amethist Ring', mainStoneType: 'Blue shaphire',
      secondaryStoneType: 'Kynite', allStones: ['Amethist', 'Cristal'],
      sku: 'Amethist-123', slug: 'amethist-ring', price: 8999, images: ['original'] };
    expect(normalizeProductContent(product)).toEqual({ ...product, name: 'Amethyst Ring',
      mainStoneType: 'Blue sapphire', secondaryStoneType: 'Kyanite', allStones: ['Amethyst', 'Crystal'] });
    expect(product.name).toBe('Amethist Ring');
  });
  it('preserves unrelated text formatting and omitted fields', () => {
    expect(normalizeProductContent({ description: 'Original text\n\nSecond paragraph.' }))
      .toEqual({ description: 'Original text\n\nSecond paragraph.' });
    expect(normalizeProductContent({ featured: true })).toEqual({ featured: true });
  });
});

describe('product stock consistency', () => {
  it('sets quantity to zero when a product is marked unavailable', () => {
    expect(normalizeProductStock({ inStock: false }, { inStock: true, stockQuantity: 4 }))
      .toEqual({ inStock: false, stockQuantity: 0 });
  });
  it('does not let a positive quantity silently restock an unavailable item', () => {
    expect(normalizeProductStock({ stockQuantity: 5 }, { inStock: false, stockQuantity: 0 }))
      .toEqual({ stockQuantity: 0 });
  });
  it('makes zero-quantity products unavailable, and allows explicit restocking', () => {
    expect(normalizeProductStock({ inStock: true, stockQuantity: 0 })).toEqual({ inStock: false, stockQuantity: 0 });
    expect(normalizeProductStock({ inStock: true, stockQuantity: 3 }, { inStock: false, stockQuantity: 0 }))
      .toEqual({ inStock: true, stockQuantity: 3 });
  });
  it('does not change stock during image or content-only updates', () => {
    expect(normalizeProductStock({ name: 'Ring' }, { inStock: false, stockQuantity: 2 })).toEqual({ name: 'Ring' });
  });
  it.each([-1, 0.5, NaN, '1', undefined])('rejects invalid quantities: %s', stockQuantity => {
    expect(() => normalizeProductStock({ stockQuantity })).toThrow('whole number');
  });
});
