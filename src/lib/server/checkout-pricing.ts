import { writeClient } from '@/lib/sanity/client';
import { calculateCouponTotals, getActiveCoupon, normalizeCouponCode } from '@/lib/coupon';
import { calculateSaleTotals } from '@/lib/sale';
import { getShipping } from '@/lib/shipping';
import { getProductCanonicalSlug, getProductDisplayName } from '@/lib/seo/product';
import { CURRENCIES, type CurrencyCode } from '@/lib/currency';
import { combineStockLines } from './inventory-reservations';
import { cartLineKey, isRingCategory, readRingSize } from '@/lib/ring-size';

export type CheckoutCurrency = CurrencyCode;

export type CheckoutLineInput = {
  _id?: string;
  quantity?: number;
  ringSize?: number;
};

export type PricedCheckoutItem = {
  _id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  slug: string;
  category?: string;
  ringSize?: number;
};

export type DiscountSnapshot = {
  name: string;
  percent: number;
  amount: number;
  subtotalBeforeDiscount: number;
  code?: string;
  type: 'coupon' | 'sale';
};

export type PricedCheckout = {
  items: PricedCheckoutItem[];
  subtotal: number;
  discount: DiscountSnapshot | null;
  shipping: number;
  total: number;
};

type SourceProduct = {
  _id: string;
  name?: string;
  slug?: string;
  sku?: string;
  price?: number;
  image?: string;
  stockQuantity?: number;
  inStock?: boolean;
  mainStoneType?: string;
  category?: string;
};

const DOC_ID = 'siteSettings';

const SUBUNIT_MULTIPLIER: Record<CheckoutCurrency, number> = {
  INR: 100,
  USD: 100,
  EUR: 100,
  GBP: 100,
  JPY: 1,
  CNY: 100,
};

function cleanQuantity(value: unknown) {
  const n = Number(value);
  if (!Number.isFinite(n)) return 1;
  return Math.max(1, Math.floor(n));
}

function cleanCurrency(value: unknown): CheckoutCurrency {
  const currency = String(value || 'INR').toUpperCase() as CheckoutCurrency;
  return Object.hasOwn(CURRENCIES, currency) ? currency : 'INR';
}

export function toPaymentAmount(totalInr: number, currencyInput: unknown) {
  const currency = cleanCurrency(currencyInput);
  const amount = Number(totalInr || 0) * CURRENCIES[currency].rate;
  return {
    currency,
    amount,
    subunits: Math.round(amount * SUBUNIT_MULTIPLIER[currency]),
    displayValue: currency === 'JPY' ? String(Math.round(amount)) : amount.toFixed(2),
  };
}

async function getCheckoutSettings() {
  return writeClient.fetch(
    `*[_type == "siteSettings" && _id == $id][0]{
      saleEnabled,
      saleName,
      saleDiscountPercent,
      saleStartDate,
      saleEndDate,
      couponEnabled,
      couponCode,
      couponName,
      couponDiscountPercent,
      couponCustomerEmail,
      couponStartDate,
      couponEndDate
    }`,
    { id: DOC_ID }
  );
}

export async function priceCheckout(
  lines: CheckoutLineInput[] | undefined,
  options: {
    couponCode?: string;
    customerEmail?: string;
    requireInStock?: boolean;
    country?: string;
  } = {}
): Promise<PricedCheckout> {
  const inputLines = (lines || []).map(line => ({ _id: String(line._id || '').trim(),
    quantity: cleanQuantity(line.quantity), ringSize: readRingSize(line.ringSize) }));
  const stockLines = combineStockLines(inputLines);
  const quantities = new Map(stockLines.map(line => [line._id, line.quantity]));
  const variants = new Map<string, typeof inputLines[number]>();
  for (const line of inputLines) {
    const key = cartLineKey(line);
    const previous = variants.get(key);
    variants.set(key, { ...line, quantity: line.quantity + (previous?.quantity || 0) });
  }
  const validLines = Array.from(variants.values());

  if (validLines.length === 0) {
    throw new Error('Cart is empty.');
  }

  const ids = Array.from(new Set(validLines.map((line) => line._id)));
  const products = await writeClient.fetch<SourceProduct[]>(
    `*[_type == "product" && _id in $ids]{
      _id,
      name,
      "slug": slug.current,
      sku,
      price,
      "image": images[0].asset->url,
      stockQuantity,
      inStock,
      mainStoneType,
      "category": category->name
    }`,
    { ids }
  );

  const productById = new Map(products.map((product) => [product._id, product]));
  const pricedItems: PricedCheckoutItem[] = validLines.map((line) => {
    const product = productById.get(line._id);
    if (!product) throw new Error('A product in your bag is no longer available.');
    if (options.requireInStock !== false && product.inStock === false) {
      throw new Error(`${getProductDisplayName(product)} is currently out of stock.`);
    }

    const maxQuantity = cleanQuantity(product.stockQuantity ?? 1);
    if (options.requireInStock !== false && (Number(product.stockQuantity) === 0 || (quantities.get(line._id) || 0) > maxQuantity)) {
      throw new Error(`${getProductDisplayName(product)} does not have the requested quantity available.`);
    }
    const quantity = options.requireInStock === false ? line.quantity : Math.min(line.quantity, maxQuantity);
    if (isRingCategory(product.category) && line.ringSize === undefined && options.requireInStock !== false) {
      throw new Error(`Please choose a ring size for ${getProductDisplayName(product)} before checking out.`);
    }
    if (!isRingCategory(product.category) && line.ringSize !== undefined) {
      throw new Error('Ring sizes can only be selected for rings.');
    }
    const price = Math.max(0, Number(product.price) || 0);
    if (price < 1000) {
      throw new Error(`${getProductDisplayName(product)} has a price that requires merchant review.`);
    }

    return {
      _id: product._id,
      name: getProductDisplayName(product),
      price,
      quantity,
      image: product.image || '',
      slug: getProductCanonicalSlug(product),
      category: product.category,
      ...(line.ringSize !== undefined ? { ringSize: line.ringSize } : {}),
    };
  });

  const subtotal = pricedItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const settings = await getCheckoutSettings();
  const couponCode = normalizeCouponCode(options.couponCode);
  const saleTotals = calculateSaleTotals(subtotal, settings);
  const couponTotals = couponCode
    ? calculateCouponTotals(subtotal, settings, couponCode, options.customerEmail)
    : null;

  const coupon = couponCode
    ? getActiveCoupon(settings, couponCode, options.customerEmail)
    : null;
  const couponDiscount = couponTotals?.discountAmount || 0;
  const saleDiscount = saleTotals.discountAmount || 0;
  const useCoupon = Boolean(coupon && couponDiscount >= saleDiscount);
  const discountAmount = useCoupon ? couponDiscount : saleDiscount;
  const discount: DiscountSnapshot | null =
    discountAmount > 0
      ? useCoupon && coupon
        ? {
            name: `${coupon.name} (${coupon.code})`,
            percent: coupon.percent,
            amount: couponDiscount,
            subtotalBeforeDiscount: subtotal,
            code: coupon.code,
            type: 'coupon',
          }
        : saleTotals.sale
          ? {
              name: saleTotals.sale.name,
              percent: saleTotals.sale.percent,
              amount: saleDiscount,
              subtotalBeforeDiscount: subtotal,
              type: 'sale',
            }
          : null
      : null;

  const discountedSubtotal = Math.max(0, subtotal - (discount?.amount || 0));
  const shipping = getShipping(discountedSubtotal, options.country ?? 'IN');

  return {
    items: pricedItems,
    subtotal,
    discount,
    shipping,
    total: discountedSubtotal + shipping,
  };
}
