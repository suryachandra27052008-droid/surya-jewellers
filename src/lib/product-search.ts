import { correctSpelling } from '@/lib/seo/product';

export type SearchableProduct = { name?: string; displayName?: string; sku?: string | number;
  mainStoneType?: string; secondaryStoneType?: string; category?: { name: string } };

const normalize = (value: string) => correctSpelling(value).normalize('NFKD')
  .replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();

function oneEditApart(a: string, b: string) {
  if (Math.abs(a.length - b.length) > 1) return false;
  let i = 0; let j = 0; let edits = 0;
  while (i < a.length && j < b.length) {
    if (a[i] === b[j]) { i++; j++; continue; }
    if (++edits > 1) return false;
    if (a.length === b.length && a[i] === b[j + 1] && a[i + 1] === b[j]) { i += 2; j += 2; }
    else if (a.length > b.length) i++;
    else if (a.length < b.length) j++;
    else { i++; j++; }
  }
  return edits + Number(i < a.length || j < b.length) <= 1;
}

export function productSearchScore(product: SearchableProduct, query: string): number | null {
  const cleaned = normalize(query.slice(0, 100));
  if (!cleaned) return 0;
  const name = normalize(product.displayName || product.name || '');
  const sku = normalize(String(product.sku ?? ''));
  const words = normalize([name, product.name, sku, product.mainStoneType,
    product.secondaryStoneType, product.category?.name].filter(Boolean).join(' ')).split(/\s+/);
  let score = sku === cleaned ? 500 : name === cleaned ? 300 : name.startsWith(cleaned) ? 100 : 0;
  for (const term of cleaned.split(/\s+/)) {
    if (words.some(word => word.startsWith(term))) score += 30;
    else if (term.length >= 4 && term.length <= 32 && !/\d/.test(term) && words.some(word => oneEditApart(term, word))) score += 5;
    else return null;
  }
  return score;
}

export function matchesProductSearch(product: SearchableProduct, query: string) {
  return productSearchScore(product, query) !== null;
}
