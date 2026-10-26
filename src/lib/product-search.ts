export function matchesProductSearch(product: { name?: string; displayName?: string; sku?: string | number;
  mainStoneType?: string; secondaryStoneType?: string; category?: { name: string } }, query: string) {
  const normalize = (value: string) => value.normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
  const haystack = normalize([product.displayName, product.name, product.sku, product.mainStoneType,
    product.secondaryStoneType, product.category?.name].filter(Boolean).join(' '));
  const words = haystack.split(/\s+/);
  return normalize(query).split(/\s+/).filter(Boolean).every(term => words.some(word => word.startsWith(term)));
}
