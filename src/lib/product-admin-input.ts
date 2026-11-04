import { correctSpelling, hasSeoTypo } from '@/lib/seo/product';

const normalizeText = (value: string) => hasSeoTypo(value) ? correctSpelling(value) : value;

export function normalizeProductContent<T extends Record<string, unknown>>(fields: T): T {
  const normalized = { ...fields } as Record<string, unknown>;
  for (const key of ['name', 'mainStoneType', 'secondaryStoneType', 'description']) {
    if (typeof normalized[key] === 'string') normalized[key] = normalizeText(normalized[key]);
  }
  if (Array.isArray(normalized.allStones)) {
    normalized.allStones = normalized.allStones.map(stone => typeof stone === 'string' ? normalizeText(stone) : stone);
  }
  return normalized as T;
}

export function normalizeProductStock(
  fields: Record<string, unknown>,
  current: { inStock?: boolean; stockQuantity?: number } = {},
): Record<string, unknown> {
  if (!Object.hasOwn(fields, 'inStock') && !Object.hasOwn(fields, 'stockQuantity')) return fields;
  const normalized = { ...fields };
  const quantity = Object.hasOwn(fields, 'stockQuantity') ? fields.stockQuantity : current.stockQuantity;
  if (Object.hasOwn(fields, 'stockQuantity') &&
      (typeof quantity !== 'number' || !Number.isInteger(quantity) || quantity < 0)) {
    throw new Error('Available pieces must be a whole number of zero or more.');
  }
  const available = fields.inStock ?? current.inStock;
  if (available === false) normalized.stockQuantity = 0;
  else if (quantity === 0) normalized.inStock = false;
  return normalized;
}
