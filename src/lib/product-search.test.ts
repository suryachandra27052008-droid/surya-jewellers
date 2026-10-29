import { describe, expect, it } from 'vitest';
import { matchesProductSearch, productSearchScore } from './product-search';

const product = { name: 'Emerald Silver Ring', displayName: 'Emerald Silver Ring', sku: 'RNG123',
  mainStoneType: 'Emerald', secondaryStoneType: 'Blue sapphire', category: { name: 'Rings' } };

describe('catalogue search and autocomplete ranking', () => {
  it.each(['emerald', 'EMERALD ring', 'ring emrald', 'rng123', 'RNG12', 'silver', 'blue shaphire'])('matches names, stones, category and SKU: %s', query => {
    expect(matchesProductSearch(product, query)).toBe(true);
  });
  it.each(['emerlad ring', 'emerrald', 'emerld', 'sapphie', 'rign'])('allows one insertion, deletion, substitution or transposition: %s', query => {
    expect(matchesProductSearch(product, query)).toBe(true);
  });
  it.each(['ruby', 'diamond', 'emrld', 'rng124', 'xyz123', 'abc', '123'])('does not invent unrelated matches or fuzzy SKU matches: %s', query => {
    expect(matchesProductSearch(product, query)).toBe(false);
  });
  it('ranks exact SKUs ahead of approximate names', () => {
    expect(productSearchScore(product, 'RNG123')).toBeGreaterThan(productSearchScore({ name: 'RNG123 pendant' }, 'RNG123')!);
    expect(productSearchScore(product, 'emerald')).toBeGreaterThan(productSearchScore(product, 'emerlad')!);
  });
  it('handles accents, punctuation, empty queries and missing fields', () => {
    expect(matchesProductSearch({ name: 'Caf\u00e9 Pearl Pendant' }, 'cafe pearl')).toBe(true);
    expect(matchesProductSearch(product, 'emerald-ring')).toBe(true);
    expect(matchesProductSearch({}, '')).toBe(true);
    expect(matchesProductSearch({}, 'ring')).toBe(false);
  });
});
