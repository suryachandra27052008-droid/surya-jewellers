import { describe, expect, it } from 'vitest';
import { countryCode, postalCodeError, postalCodeRequired } from './countries';
import { matchesProductSearch } from './product-search';
import { safeTrackingUrl, orderNeedsAttention } from './order-tools';
import { getShipping } from './shipping';

describe('international checkout', () => {
  it.each([['Germany', 'DE'], ['Italy', 'IT'], ['India', 'IN'], ['UK', 'GB'], ['United States of America', 'US']])('normalizes %s without confusing it with another country', (input, code) => {
    expect(countryCode(input)).toBe(code);
  });
  it('rejects an unknown country', () => expect(countryCode('not-a-country')).toBe(''));
  it('validates German, Italian and Indian postcodes separately', () => {
    expect(postalCodeError('DE', '79618')).toBe('');
    expect(postalCodeError('IT', '20121')).toBe('');
    expect(postalCodeError('IN', '302004')).toBe('');
    expect(postalCodeError('IN', '79618')).not.toBe('');
    expect(postalCodeError('GB', 'SW1A 1AA')).toBe('');
  });
  it('allows destinations that do not use a supported postal-code format', () => {
    expect(postalCodeRequired('AE')).toBe(false);
    expect(postalCodeError('AE', '')).toBe('');
  });
  it('keeps current domestic and international shipping prices', () => {
    expect(getShipping(22997, 'Germany')).toBe(2500);
    expect(getShipping(22997, 'Italy')).toBe(2500);
    expect(getShipping(22997, 'India')).toBe(0);
    expect(getShipping(1500, 'India')).toBe(150);
  });
});

describe('catalogue search', () => {
  const product = { name: 'Natural Emerald Ring', sku: 'RNG10011', mainStoneType: 'Emerald', secondaryStoneType: 'Diamond', category: { name: 'Rings' } };
  it.each(['emerald', 'EMERALD RING', 'rng10011', 'diamond ring', ''])('finds %s across product attributes', query => expect(matchesProductSearch(product, query)).toBe(true));
  it('requires every search term to match', () => expect(matchesProductSearch(product, 'emerald bracelet')).toBe(false));
  it('does not confuse rings with earrings just because the word contains ring', () => {
    expect(matchesProductSearch({ name: 'Emerald Earrings', category: { name: 'Earrings' } }, 'emerald ring')).toBe(false);
  });
});

describe('order fulfilment controls', () => {
  it('allows an ordinary HTTPS tracking link', () => expect(safeTrackingUrl('https://example.com/track/123')).toBe('https://example.com/track/123'));
  it.each(['javascript:alert(1)', 'http://example.com', 'https://user:password@example.com'])('rejects unsafe tracking URL %s', value => expect(() => safeTrackingUrl(value)).toThrow());
  it('does not require a tracking link before one exists', () => expect(safeTrackingUrl('')).toBe(''));
  it('flags operational problems without relying on payment status alone', () => {
    expect(orderNeedsAttention({ notificationError: 'Retry needed' })).toBe(true);
    expect(orderNeedsAttention({ fulfillmentBlocked: true })).toBe(true);
    expect(orderNeedsAttention({})).toBe(false);
  });
});
