export interface SeasonalSaleSettings {
  saleEnabled?: boolean;
  saleName?: string;
  saleDiscountPercent?: number;
  saleStartDate?: string;
  saleEndDate?: string;
  showSaleBanner?: boolean;
}

export interface ActiveSale {
  name: string;
  percent: number;
  startDate?: string;
  endDate?: string;
}

export interface SaleTotals {
  sale: ActiveSale | null;
  subtotal: number;
  discountAmount: number;
  discountedSubtotal: number;
}

function todayKey(now = new Date()) {
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function clampPercent(value: unknown) {
  const n = Number(value);
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.min(90, n));
}

export function getActiveSale(settings?: SeasonalSaleSettings | null, now = new Date()): ActiveSale | null {
  if (!settings?.saleEnabled) return null;

  const percent = clampPercent(settings.saleDiscountPercent);
  if (percent <= 0) return null;

  const today = todayKey(now);
  if (settings.saleStartDate && today < settings.saleStartDate) return null;
  if (settings.saleEndDate && today > settings.saleEndDate) return null;

  return {
    name: (settings.saleName || 'Seasonal Sale').trim() || 'Seasonal Sale',
    percent,
    startDate: settings.saleStartDate || undefined,
    endDate: settings.saleEndDate || undefined,
  };
}

export function calculateSaleTotals(subtotal: number, settings?: SeasonalSaleSettings | null): SaleTotals {
  const cleanSubtotal = Math.max(0, Number(subtotal) || 0);
  const sale = getActiveSale(settings);
  const discountAmount = sale ? Math.round((cleanSubtotal * sale.percent) / 100) : 0;
  const discountedSubtotal = Math.max(0, cleanSubtotal - discountAmount);

  return {
    sale,
    subtotal: cleanSubtotal,
    discountAmount,
    discountedSubtotal,
  };
}
