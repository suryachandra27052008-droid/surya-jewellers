'use client';

import { useEffect, useState } from 'react';
import { calculateSaleTotals, getActiveSale, type ActiveSale, type SeasonalSaleSettings } from '@/lib/sale';

let settingsPromise: Promise<SeasonalSaleSettings | null> | null = null;

function loadSaleSettings() {
  if (!settingsPromise) {
    settingsPromise = fetch('/api/settings', { cache: 'no-store' })
      .then((res) => (res.ok ? res.json() : null))
      .catch(() => null);
  }
  return settingsPromise;
}

export function useSeasonalSale() {
  const [settings, setSettings] = useState<SeasonalSaleSettings | null>(null);

  useEffect(() => {
    let active = true;
    loadSaleSettings().then((nextSettings) => {
      if (active) setSettings(nextSettings);
    });
    return () => {
      active = false;
    };
  }, []);

  const sale = getActiveSale(settings);

  return { settings, sale };
}

export function getSalePrice(price: number, sale: ActiveSale | null) {
  if (!sale || !price) return null;
  return calculateSaleTotals(price, { saleEnabled: true, saleDiscountPercent: sale.percent }).discountedSubtotal;
}
