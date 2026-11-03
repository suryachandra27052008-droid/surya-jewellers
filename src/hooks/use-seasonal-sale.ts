'use client';

import { calculateSaleTotals, type ActiveSale } from '@/lib/sale';
import { useStorefrontSettings } from './use-storefront-settings';

export function useSeasonalSale() {
  const { settings, sale } = useStorefrontSettings();
  return { settings, sale };
}

export function getSalePrice(price: number, sale: ActiveSale | null) {
  if (!sale || !price) return null;
  return calculateSaleTotals(price, { saleEnabled: true, saleDiscountPercent: sale.percent }).discountedSubtotal;
}
