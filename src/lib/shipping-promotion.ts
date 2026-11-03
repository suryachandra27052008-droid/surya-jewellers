export interface ShippingPromotionSettings {
  shippingPromotionEnabled?: boolean;
  shippingPromotionId?: string;
  shippingPromotionName?: string;
  shippingPromotionStartDate?: string;
  shippingPromotionEndDate?: string;
  shippingPromotionMinOrder?: number;
}

export function campaignDate(value: unknown, end = false): number {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return NaN;
  const date = new Date(`${value}T00:00:00Z`);
  if (!Number.isFinite(date.getTime()) || date.toISOString().slice(0, 10) !== value) return NaN;
  return Date.parse(`${value}T${end ? '23:59:59.999' : '00:00:00.000'}+05:30`);
}

export function getActiveShippingPromotion(settings?: ShippingPromotionSettings | null, now = new Date()) {
  if (settings?.shippingPromotionEnabled !== true) return null;
  const startsAt = campaignDate(settings.shippingPromotionStartDate);
  const endsAt = campaignDate(settings.shippingPromotionEndDate, true);
  const minimum = settings.shippingPromotionMinOrder;
  if (!Number.isFinite(startsAt) || !Number.isFinite(endsAt) || endsAt < startsAt ||
    !Number.isFinite(now.getTime()) || now.getTime() < startsAt || now.getTime() > endsAt ||
    typeof minimum !== 'number' || !Number.isFinite(minimum) || minimum <= 0 || minimum > 100_000_000) return null;
  return {
    id: settings.shippingPromotionId?.trim().slice(0, 80) || 'shipping-offer',
    name: settings.shippingPromotionName?.trim().slice(0, 80) || 'Shipping Special',
    minimum, startsAt, endsAt, endDate: settings.shippingPromotionEndDate!,
  };
}

export function qualifiesForShippingOffer(subtotal: number, minimum: number): boolean {
  return Number.isFinite(subtotal) && subtotal >= 0 && Math.round(subtotal * 100) > Math.round(minimum * 100);
}

export function formatShippingOfferDate(date: string) {
  return new Date(campaignDate(date)).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Asia/Kolkata',
  });
}
