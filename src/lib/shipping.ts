// Promo: free shipping until end of 4th May 2026 (IST)
export const FREE_SHIPPING_UNTIL = new Date('2026-05-04T23:59:59.999+05:30');
export const STANDARD_SHIPPING_FEE = 150;
export const FREE_SHIPPING_THRESHOLD = 2000;

export function isPromoActive(): boolean {
  return new Date() <= FREE_SHIPPING_UNTIL;
}

/** Returns the shipping fee in INR given the order subtotal in INR */
export function getShipping(subtotalINR: number): number {
  if (isPromoActive()) return 0;
  return subtotalINR >= FREE_SHIPPING_THRESHOLD ? 0 : STANDARD_SHIPPING_FEE;
}
