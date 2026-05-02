export interface CouponSettings {
  couponEnabled?: boolean;
  couponCode?: string;
  couponName?: string;
  couponDiscountPercent?: number;
  couponCustomerEmail?: string;
  couponStartDate?: string;
  couponEndDate?: string;
}

export interface ActiveCoupon {
  code: string;
  name: string;
  percent: number;
  customerEmail?: string;
  startDate?: string;
  endDate?: string;
}

export interface CouponTotals {
  coupon: ActiveCoupon | null;
  subtotal: number;
  discountAmount: number;
  discountedSubtotal: number;
}

export function normalizeCouponCode(value: unknown) {
  return String(value || '').trim().toUpperCase().replace(/\s+/g, '');
}

function normalizeEmail(value: unknown) {
  return String(value || '').trim().toLowerCase();
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

export function getActiveCoupon(
  settings: CouponSettings | null | undefined,
  code: string,
  email?: string,
  now = new Date()
): ActiveCoupon | null {
  if (!settings?.couponEnabled) return null;

  const expectedCode = normalizeCouponCode(settings.couponCode);
  const enteredCode = normalizeCouponCode(code);
  if (!expectedCode || expectedCode !== enteredCode) return null;

  const percent = clampPercent(settings.couponDiscountPercent);
  if (percent <= 0) return null;

  const today = todayKey(now);
  if (settings.couponStartDate && today < settings.couponStartDate) return null;
  if (settings.couponEndDate && today > settings.couponEndDate) return null;

  const customerEmail = normalizeEmail(settings.couponCustomerEmail);
  if (customerEmail && customerEmail !== normalizeEmail(email)) return null;

  return {
    code: expectedCode,
    name: (settings.couponName || 'Personal Coupon').trim() || 'Personal Coupon',
    percent,
    customerEmail: customerEmail || undefined,
    startDate: settings.couponStartDate || undefined,
    endDate: settings.couponEndDate || undefined,
  };
}

export function calculateCouponTotals(
  subtotal: number,
  settings: CouponSettings | null | undefined,
  code: string,
  email?: string
): CouponTotals {
  const cleanSubtotal = Math.max(0, Number(subtotal) || 0);
  const coupon = getActiveCoupon(settings, code, email);
  const discountAmount = coupon ? Math.round((cleanSubtotal * coupon.percent) / 100) : 0;

  return {
    coupon,
    subtotal: cleanSubtotal,
    discountAmount,
    discountedSubtotal: Math.max(0, cleanSubtotal - discountAmount),
  };
}
