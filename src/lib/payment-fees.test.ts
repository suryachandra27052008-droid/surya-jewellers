import { describe, expect, it } from 'vitest';
import { currencyConversionFee } from './payment-fees';

describe('Razorpay foreign-currency fee', () => {
  it.each(['USD', 'EUR', 'GBP', 'JPY', 'CNY', 'eur'])('adds exactly 4 percent for %s', currency => {
    expect(currencyConversionFee(10000, { provider: 'razorpay', currency })).toBe(400);
  });
  it.each(['INR', 'inr', 'invalid', '', undefined])('leaves domestic or unsupported currency %s unchanged', currency => {
    expect(currencyConversionFee(10000, { provider: 'razorpay', currency })).toBe(0);
  });
  it('leaves PayPal and legacy pricing unchanged', () => {
    expect(currencyConversionFee(10000, { provider: 'paypal', currency: 'EUR' })).toBe(0);
    expect(currencyConversionFee(10000, { currency: 'EUR' })).toBe(0);
    expect(currencyConversionFee(10000)).toBe(0);
  });
  it('rounds the fee once to INR paise and does not gross up or compound it', () => {
    expect(currencyConversionFee(25497, { provider: 'razorpay', currency: 'EUR' })).toBe(1019.88);
    expect(currencyConversionFee(1000.12, { provider: 'razorpay', currency: 'EUR' })).toBe(40);
    expect(currencyConversionFee(0, { provider: 'razorpay', currency: 'EUR' })).toBe(0);
  });
  it.each([-1, NaN, Infinity])('fails closed for an invalid fee base %s', amount => {
    expect(() => currencyConversionFee(amount, { provider: 'razorpay', currency: 'EUR' })).toThrow('Invalid');
  });
});
