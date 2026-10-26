import { CURRENCIES } from '@/lib/currency';
import { countryCode } from '@/lib/countries';

export const STANDARD_SHIPPING_FEE = 150;
export const FREE_SHIPPING_THRESHOLD = 2000;
export const INTERNATIONAL_SHIPPING_USD = 30;
export const INTERNATIONAL_SHIPPING_FEE = INTERNATIONAL_SHIPPING_USD / CURRENCIES.USD.rate;

export function normalizeShippingCountry(value: unknown): string {
  const country = typeof value === 'string' ? value.trim().slice(0, 80) : '';
  return countryCode(country) || country;
}

export function isPromoActive(): boolean {
  return false;
}

/** Returns the shipping fee in INR given the order subtotal in INR */
export function getShipping(subtotalINR: number, country: string = 'IN'): number {
  if (normalizeShippingCountry(country) !== 'IN') return INTERNATIONAL_SHIPPING_FEE;
  return subtotalINR >= FREE_SHIPPING_THRESHOLD ? 0 : STANDARD_SHIPPING_FEE;
}
