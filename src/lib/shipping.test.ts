import { describe, expect, it } from 'vitest';
import { getShipping, INTERNATIONAL_SHIPPING_FEE, normalizeShippingCountry } from './shipping';
import { formatPrice } from './currency';

describe('country-based shipping', () => {
  it.each(['Italy', 'IT', 'United States', 'GB', 'Japan', 'Australia'])('charges US$30 for %s regardless of order value', country => {
    expect(getShipping(1000, country)).toBe(INTERNATIONAL_SHIPPING_FEE);
    expect(getShipping(100000, country)).toBe(INTERNATIONAL_SHIPPING_FEE);
    expect(formatPrice(getShipping(100000, country), 'USD')).toBe('$30.00');
  });
  it('keeps domestic thresholds and legacy shipping unchanged', () => {
    expect(getShipping(1999, 'IN')).toBe(150);
    expect(getShipping(2000, 'India')).toBe(0);
    expect(getShipping(22997)).toBe(0);
    expect(normalizeShippingCountry({})).toBe('');
  });
  it.each([['EUR', '€24.04'], ['GBP', '£23.75'], ['JPY', '¥4,450'], ['CNY', '¥217.50']] as const)('converts the international fee to %s', (currency, expected) => {
    expect(formatPrice(INTERNATIONAL_SHIPPING_FEE, currency)).toBe(expected);
  });
});
