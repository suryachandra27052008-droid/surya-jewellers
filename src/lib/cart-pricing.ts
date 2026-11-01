import { RECENTLY_VIEWED_LIMIT } from '@/lib/recently-viewed';

export type CartPriceLine = { _id: string; price: number; quantity?: number; ringSize?: number };
type CatalogPrice = CartPriceLine & { inStock?: boolean; stockQuantity?: number };

export async function currentCartPrices(items: CartPriceLine[], fetcher: typeof fetch = fetch) {
  const ids = [...new Set(items.map(item => item._id))];
  const prices = new Map<string, number>();
  for (let offset = 0; offset < ids.length; offset += RECENTLY_VIEWED_LIMIT) {
    const response = await fetcher(`/api/catalog?${new URLSearchParams({ ids: ids.slice(offset, offset + RECENTLY_VIEWED_LIMIT).join(',') })}`,
      { cache: 'no-store' });
    if (!response.ok) throw new Error('Current prices could not be checked. Please try again before paying.');
    const { products } = await response.json() as { products: CatalogPrice[] };
    for (const product of products) {
      if (Number.isFinite(product.price) && product.price >= 1000 && product.inStock !== false && product.stockQuantity !== 0) {
        prices.set(product._id, product.price);
      }
    }
  }
  return prices;
}

export function repriceCart<T extends CartPriceLine>(items: T[], prices: Map<string, number>): T[] {
  return items.map(item => {
    const price = prices.get(item._id);
    if (price === undefined) throw new Error('A product in your bag is unavailable. Please remove it before paying.');
    return item.price === price ? item : { ...item, price };
  });
}

export function cartPricesMatch(displayed: CartPriceLine[], current: CartPriceLine[]) {
  return displayed.length === current.length && displayed.every((item, index) =>
    item._id === current[index]._id && item.price === current[index].price &&
    item.quantity === current[index].quantity && item.ringSize === current[index].ringSize);
}
