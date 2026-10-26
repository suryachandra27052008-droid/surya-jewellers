import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CurrencyCode } from '@/lib/currency';
export { CURRENCIES, formatPrice, type CurrencyCode } from '@/lib/currency';

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
