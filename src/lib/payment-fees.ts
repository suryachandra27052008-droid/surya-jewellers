import { CURRENCIES } from '@/lib/currency';

export const CURRENCY_CONVERSION_FEE_PERCENT = 4;
export const CURRENCY_CONVERSION_FEE_LABEL = 'Currency conversion fee (4%)';

export function currencyConversionFee(
  amountInr: number,
  options: { provider?: 'razorpay' | 'paypal'; currency?: unknown } = {},
): number {
  const currency = String(options.currency || 'INR').toUpperCase();
  if (options.provider !== 'razorpay' || currency === 'INR' || !Object.hasOwn(CURRENCIES, currency)) return 0;
  if (!Number.isFinite(amountInr) || amountInr < 0) throw new Error('Invalid currency conversion fee base.');
  // Calculate in INR paise, once, after discounts and shipping.
  return Math.round(amountInr * CURRENCY_CONVERSION_FEE_PERCENT) / 100;
}
