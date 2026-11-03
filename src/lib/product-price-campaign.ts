export type PriceProduct = { _id: string; _rev?: string; sku?: string; price?: number;
  inStock?: boolean; stockQuantity?: number; variants?: unknown; variations?: unknown };
export type PriceChange = { id: string; revision: string; sku: string; before: number; after: number };

export function planPriceIncrease(products: PriceProduct[], increase: number) {
  if (!Number.isFinite(increase) || increase <= 0) throw new Error('Invalid price increase.');
  const seen = new Set<string>();
  const changes: PriceChange[] = [];
  const skipped: Array<{ id: string; sku: string; reason: string }> = [];
  for (const product of products) {
    if (seen.has(product._id)) throw new Error('Duplicate product record.');
    seen.add(product._id);
    const sku = String(product.sku || '');
    let reason = '';
    if (product._id.startsWith('drafts.')) reason = 'Draft';
    else if (['20', '9'].includes(sku)) reason = 'Previously blocked SKU; merchant review required';
    else if (!Number.isFinite(product.price) || Number(product.price) < 1000) reason = 'Invalid price; merchant review required';
    else if (product.inStock === false || (product.stockQuantity ?? 1) <= 0) reason = 'Unavailable';
    if (reason) { skipped.push({ id: product._id, sku, reason }); continue; }
    if (product.variants || product.variations) throw new Error('Variation pricing needs an explicit data mapping before applying.');
    if (!product._rev) throw new Error('Product revision is missing.');
    const before = product.price!;
    changes.push({ id: product._id, revision: product._rev, sku, before, after: Math.round((before + increase) * 100) / 100 });
  }
  return { increase, changes, skipped };
}

export function planPriceRollback(changes: PriceChange[], products: PriceProduct[]) {
  const current = new Map(products.map(product => [product._id, product]));
  const restore: PriceChange[] = [], conflicts: string[] = [];
  for (const change of changes) {
    const product = current.get(change.id);
    if (product?.price === change.before) continue;
    if (!product?._rev || product.price !== change.after) { conflicts.push(change.id); continue; }
    restore.push({ ...change, revision: product._rev });
  }
  return { restore, conflicts };
}
