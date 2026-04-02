import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type CurrencyCode = 'INR' | 'USD' | 'GBP' | 'JPY' | 'CNY';

export const CURRENCIES: Record<CurrencyCode, { symbol: string; name: string; flag: string; rate: number }> = {
  INR: { symbol: '₹', name: 'Indian Rupee', flag: '🇮🇳', rate: 1 },
  USD: { symbol: '$', name: 'US Dollar', flag: '🇺🇸', rate: 0.012 },
  GBP: { symbol: '£', name: 'British Pound', flag: '🇬🇧', rate: 0.0095 },
  JPY: { symbol: '¥', name: 'Japanese Yen', flag: '🇯🇵', rate: 1.78 },
  CNY: { symbol: '¥', name: 'Chinese Yuan', flag: '🇨🇳', rate: 0.087 },
};

interface CurrencyState {
  currency: CurrencyCode;
  setCurrency: (c: CurrencyCode) => void;
}

export const useCurrencyStore = create<CurrencyState>()(
  persist(
    (set) => ({
      currency: 'INR',
      setCurrency: (currency) => set({ currency }),
    }),
    { name: 'surya-currency' }
  )
);

export function formatPrice(inrAmount: number, currency: CurrencyCode): string {
  const { rate, symbol } = CURRENCIES[currency];
  const converted = inrAmount * rate;

  if (currency === 'INR') {
    return `₹${Math.round(converted).toLocaleString('en-IN')}`;
  }
  if (currency === 'JPY') {
    return `¥${Math.round(converted).toLocaleString()}`;
  }
  return `${symbol}${converted.toFixed(2)}`;
}
