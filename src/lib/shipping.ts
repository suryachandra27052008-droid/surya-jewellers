export const STANDARD_SHIPPING_FEE = 150;
export const FREE_SHIPPING_THRESHOLD = 2000;

export function isPromoActive(): boolean {
  return false;
}

/** Returns the shipping fee in INR given the order subtotal in INR */
export function getShipping(subtotalINR: number): number {
  return subtotalINR >= FREE_SHIPPING_THRESHOLD ? 0 : STANDARD_SHIPPING_FEE;
}
