import { describe, expect, it, vi } from 'vitest';
import { formatPrice } from '@/stores/currency-store';

vi.mock('@/lib/sanity/client', () => ({ writeClient: {} }));

import { toPaymentAmount } from '@/lib/server/checkout-pricing';

describe('EUR prices and payment amounts', () => {
  it.each([
    [104, '1.00', 100],
    [10400, '100.00', 10000],
    [9999, '96.14', 9614],
    [0, '0.00', 0],
  ])('converts INR %s consistently at 104 rupees per euro', (inr, expected, cents) => {
    expect(formatPrice(inr, 'EUR')).toBe(`\u20ac${expected}`);
    expect(toPaymentAmount(inr, 'EUR')).toMatchObject({
      currency: 'EUR', displayValue: expected, subunits: cents,
    });
  });

  it('preserves existing INR and USD payment conversions', () => {
    expect(toPaymentAmount(1000, 'INR')).toMatchObject({ currency: 'INR', subunits: 100000, displayValue: '1000.00' });
    expect(toPaymentAmount(1000, 'USD')).toMatchObject({ currency: 'USD', subunits: 1200, displayValue: '12.00' });
  });
});
