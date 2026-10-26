export type CurrencyCode = 'INR' | 'USD' | 'EUR' | 'GBP' | 'JPY' | 'CNY';

export const CURRENCIES: Record<CurrencyCode, { symbol: string; name: string; flag: string; rate: number }> = {
  INR: { symbol: '₹', name: 'Indian Rupee', flag: '🇮🇳', rate: 1 },
  USD: { symbol: '$', name: 'US Dollar', flag: '🇺🇸', rate: 0.012 },
  EUR: { symbol: '€', name: 'Euro', flag: '🇪🇺', rate: 1 / 104 },
  GBP: { symbol: '£', name: 'British Pound', flag: '🇬🇧', rate: 0.0095 },
  JPY: { symbol: '¥', name: 'Japanese Yen', flag: '🇯🇵', rate: 1.78 },
  CNY: { symbol: '¥', name: 'Chinese Yuan', flag: '🇨🇳', rate: 0.087 },
};

export function formatPrice(inrAmount: number, currency: CurrencyCode): string {
  const { rate, symbol } = CURRENCIES[currency];
  const converted = inrAmount * rate;
  if (currency === 'INR') return `₹${Math.round(converted).toLocaleString('en-IN')}`;
  if (currency === 'JPY') return `¥${Math.round(converted).toLocaleString()}`;
  return `${symbol}${converted.toFixed(2)}`;
}

export function roundedCurrencyAmount(inrAmount: number, currency: CurrencyCode) {
  const decimals = currency === 'JPY' ? 0 : 2;
  return Number((inrAmount * CURRENCIES[currency].rate).toFixed(decimals));
}
