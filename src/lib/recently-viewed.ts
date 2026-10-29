export type ViewedProduct = { id: string; viewedAt: number };
export const RECENTLY_VIEWED_LIMIT = 12;
export const RECENTLY_VIEWED_MAX_AGE = 30 * 24 * 60 * 60_000;
export const validProductId = (id: unknown): id is string => typeof id === 'string' &&
  /^[\w-][\w.-]{0,127}$/.test(id) && !id.startsWith('drafts.');

export function sanitizeViewedProducts(value: unknown, now = Date.now()): ViewedProduct[] {
  if (!Array.isArray(value)) return [];
  const ids = new Set<string>();
  return value.filter((entry): entry is ViewedProduct => Boolean(entry && validProductId(entry.id) &&
    typeof entry.viewedAt === 'number' && Number.isFinite(entry.viewedAt) &&
    entry.viewedAt > now - RECENTLY_VIEWED_MAX_AGE && entry.viewedAt <= now + 60_000))
    .sort((a, b) => b.viewedAt - a.viewedAt)
    .filter(entry => { if (ids.has(entry.id)) return false; ids.add(entry.id); return true; })
    .slice(0, RECENTLY_VIEWED_LIMIT).map(({ id, viewedAt }) => ({ id, viewedAt }));
}

export function recordViewedProduct(entries: ViewedProduct[], id: string, now = Date.now()) {
  if (!validProductId(id)) return sanitizeViewedProducts(entries, now);
  return sanitizeViewedProducts([{ id, viewedAt: now }, ...entries.filter(entry => entry.id !== id)], now);
}
