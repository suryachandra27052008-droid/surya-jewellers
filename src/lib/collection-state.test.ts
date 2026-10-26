import { describe, expect, it } from 'vitest';
import { collectionHref, readCollectionState, safeCollectionReturn } from './collection-state';

describe('collection navigation state', () => {
  it('round-trips every filter, sort, view and loaded count', () => {
    const href = '/products?q=emerald&category=Rings&stone=Emerald&sort=price-desc&min=1000&max=99000&count=48&view=comfortable';
    expect(collectionHref(readCollectionState(new URL(href, 'https://test.invalid').searchParams))).toBe(href);
    expect(safeCollectionReturn(href)).toBe(href);
  });
  it('uses safe defaults and bounds malformed numeric inputs', () => {
    const state = readCollectionState(new URLSearchParams('min=-5&max=NaN&sort=bad&count=Infinity&view=bad'));
    expect(state).toMatchObject({ min: 0, max: 800000, count: 24, sort: 'featured', view: '' });
    expect(collectionHref(state)).toBe('/products');
    expect(readCollectionState(new URLSearchParams('min=900000&max=1')).max).toBe(800000);
  });
  it.each(['https://evil.invalid/products', '//evil.invalid', '/products/other', '/products/../', '/\\evil.invalid', '/'])('rejects unsafe return URL %s', value => {
    expect(safeCollectionReturn(value)).toBe('/products');
  });
});
