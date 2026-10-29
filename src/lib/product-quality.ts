import { correctSpelling, getProductCanonicalSlug, hasSeoTypo } from '@/lib/seo/product';

export type QualityProduct = { _id: string; name?: string | null; sku?: string | number | null;
  slug?: string | null; price?: number | null; category?: string | null; images?: (string | null)[] | null;
  mainStoneType?: string | null; secondaryStoneType?: string | null;
  inStock?: boolean | null; stockQuantity?: number | null };
export type QualityIssueKind = 'price' | 'images' | 'sku' | 'url' | 'spelling' | 'stock' | 'category' | 'name';
export type QualityIssue = { kind: QualityIssueKind; severity: 'critical' | 'warning'; message: string };
export type ProductQualityRow = { product: QualityProduct; issues: QualityIssue[] };
export const QUALITY_LABELS: Record<QualityIssueKind, string> = { price: 'Price review', images: 'Images',
  sku: 'SKU', url: 'Product URL', spelling: 'Spelling', stock: 'Stock', category: 'Category', name: 'Name' };

const canonicalSlug = (p: QualityProduct) => getProductCanonicalSlug({ _id: p._id,
  name: p.name || '', sku: p.sku ?? undefined, slug: p.slug || '',
  category: p.category || '', mainStoneType: p.mainStoneType || '' });

export function auditProductQuality(products: QualityProduct[]): ProductQualityRow[] {
  const skuCounts = new Map<string, number>();
  const urlCounts = new Map<string, number>();
  for (const p of products) {
    const sku = String(p.sku ?? '').trim().toLowerCase();
    if (sku) skuCounts.set(sku, (skuCounts.get(sku) || 0) + 1);
    const slug = canonicalSlug(p).toLowerCase();
    if (slug) urlCounts.set(slug, (urlCounts.get(slug) || 0) + 1);
  }
  return products.map(product => {
    const issues: QualityIssue[] = [];
    const flag = (kind: QualityIssueKind, severity: QualityIssue['severity'], message: string) => issues.push({ kind, severity, message });
    if (typeof product.price !== 'number' || !Number.isFinite(product.price) || product.price < 1000) {
      flag('price', 'critical', 'Price needs merchant review; the storefront purchase threshold is INR 1,000.');
    }
    if (!Array.isArray(product.images) || !product.images.some(image => typeof image === 'string' && /^https?:\/\//i.test(image))) {
      flag('images', 'warning', 'No usable product photo.');
    }
    const sku = String(product.sku ?? '').trim().toLowerCase();
    if (!sku) flag('sku', 'warning', 'Missing SKU.');
    else if ((skuCounts.get(sku) || 0) > 1) flag('sku', 'critical', 'SKU is shared by more than one product.');
    if (!product.name?.trim()) flag('name', 'warning', 'Missing product name.');
    if (!product.category?.trim()) flag('category', 'warning', 'Category is missing or its reference is unavailable.');
    if (!product.slug?.trim()) flag('url', 'warning', 'No source slug; the storefront currently generates a fallback URL.');
    else if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/i.test(product.slug)) flag('url', 'warning', 'Source slug needs review for invalid URL characters.');
    const canonical = canonicalSlug(product);
    if ((urlCounts.get(canonical.toLowerCase()) || 0) > 1) flag('url', 'critical', 'Public product URL is shared by more than one product.');
    for (const [label, value] of [['Name', product.name], ['Main stone', product.mainStoneType], ['Secondary stone', product.secondaryStoneType]] as const) {
      if (value && hasSeoTypo(value)) {
        const suggestion = correctSpelling(value);
        flag('spelling', 'warning', `${label}: "${value}".${suggestion !== value ? ` Suggested spelling: "${suggestion}".` : ' Check the spelling in the source data.'}`);
      }
    }
    const quantity = product.stockQuantity;
    if (quantity !== undefined && quantity !== null && (!Number.isInteger(quantity) || quantity < 0)) {
      flag('stock', 'critical', 'Stock quantity is not a non-negative whole number.');
    } else if (quantity === 0 && product.inStock !== false) flag('stock', 'critical', 'Marked in stock with zero quantity.');
    else if (typeof quantity === 'number' && quantity > 0 && product.inStock === false) flag('stock', 'warning', 'Marked unavailable but quantity is positive; confirm whether intentional.');
    return { product, issues };
  }).filter(row => row.issues.length).sort((a, b) =>
    Number(b.issues.some(i => i.severity === 'critical')) - Number(a.issues.some(i => i.severity === 'critical')) ||
    (a.product.name || '').localeCompare(b.product.name || ''));
}
