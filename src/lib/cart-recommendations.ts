export type RecommendedProduct = {
  _id: string; name: string; sku?: string; slug: string; price: number; category?: string;
  mainStoneType?: string; images: string[]; stockQuantity?: number; inStock?: boolean;
};

export function cartRecommendations(products: RecommendedProduct[], items: Array<{ _id: string; mainStoneType?: string }>) {
  const excluded = new Set(items.map(item => item._id));
  const stones = new Set(items.map(item => item.mainStoneType?.toLowerCase()).filter(Boolean));
  return products.filter(product => !excluded.has(product._id) && product.inStock !== false &&
    (product.stockQuantity ?? 1) > 0 && Number.isFinite(product.price) && product.price >= 1000 && product.images?.[0])
    .toSorted((a, b) => Number(stones.has(b.mainStoneType?.toLowerCase())) - Number(stones.has(a.mainStoneType?.toLowerCase())) || a.price - b.price)
    .slice(0, 2);
}
