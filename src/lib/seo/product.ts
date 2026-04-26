export type ProductSeoInput = {
  _id?: string;
  name?: string;
  slug?: string | { current?: string };
  sku?: string | number;
  mainStoneType?: string;
  category?: string;
  description?: string;
};

const TYPO_PATTERNS = [
  { pattern: /\bEmrald\b/g, replacement: 'Emerald' },
  { pattern: /\bemrald\b/g, replacement: 'emerald' },
  { pattern: /\bAmethist\b/g, replacement: 'Amethyst' },
  { pattern: /\bamethist\b/g, replacement: 'amethyst' },
  { pattern: /\bShaphire\b/g, replacement: 'Sapphire' },
  { pattern: /\bshaphire\b/g, replacement: 'sapphire' },
  { pattern: /\bMalti\b/g, replacement: 'Multi' },
  { pattern: /\bmalti\b/g, replacement: 'multi' },
  { pattern: /\bCristal\b/g, replacement: 'Crystal' },
  { pattern: /\bcristal\b/g, replacement: 'crystal' },
  { pattern: /\bearringss\b/gi, replacement: 'Earrings' },
  { pattern: /\bearring\b/gi, replacement: 'Earrings' },
];

const TYPO_DETECTOR = /\b(emrald|amethist|shaphire|malti|cristal|earringss)\b/i;

export const SITE_URL = 'https://www.suryajewellers.com';

export function correctSpelling(text = '') {
  return TYPO_PATTERNS.reduce(
    (value, { pattern, replacement }) => value.replace(pattern, replacement),
    text
  ).replace(/\s+/g, ' ').trim();
}

export function hasSeoTypo(text = '') {
  return TYPO_DETECTOR.test(text);
}

export function slugify(text = '') {
  return correctSpelling(text)
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function getRawSlug(product: ProductSeoInput) {
  if (typeof product.slug === 'string') return product.slug;
  return product.slug?.current || '';
}

function getSku(product: ProductSeoInput) {
  return String(product.sku || '').trim();
}

export function getProductCanonicalSlug(product: ProductSeoInput) {
  const rawSlug = getRawSlug(product);
  if (rawSlug && !hasSeoTypo(rawSlug)) return rawSlug;

  const sku = slugify(getSku(product));
  const baseName = product.name
    ? correctSpelling(product.name)
    : correctSpelling(
        [product.mainStoneType, product.category].filter(Boolean).join(' ') || 'silver jewellery'
      );
  const baseSlug = slugify(baseName) || 'silver-jewellery';

  return [baseSlug, sku || product._id?.slice(-6)]
    .filter(Boolean)
    .join('-')
    .replace(/-+/g, '-');
}

function truncateDescription(text: string, maxLength = 158) {
  const clean = correctSpelling(text).replace(/\s+/g, ' ').trim();
  if (clean.length <= maxLength) return clean;

  const truncated = clean.slice(0, maxLength - 1);
  const lastSpace = truncated.lastIndexOf(' ');
  return `${truncated.slice(0, lastSpace > 120 ? lastSpace : maxLength - 1).trim()}.`;
}

export function getProductDisplayName(product: ProductSeoInput) {
  const cleanName = correctSpelling(product.name || '');
  if (cleanName) return cleanName;

  return correctSpelling(
    [product.mainStoneType, product.category || 'Jewellery'].filter(Boolean).join(' ')
  );
}

export function getProductSeoTitle(product: ProductSeoInput) {
  const name = getProductDisplayName(product);
  const sku = getSku(product);
  const nameWithSku = sku && !name.toLowerCase().includes(sku.toLowerCase())
    ? `${name} ${sku}`
    : name;

  return `${nameWithSku} in 92.5 Sterling Silver | Surya Jewellers Jaipur`;
}

export function getProductMetaDescription(product: ProductSeoInput) {
  if (product.description && correctSpelling(product.description).length > 80) {
    return truncateDescription(product.description);
  }

  const name = getProductDisplayName(product);
  const sku = getSku(product);
  return truncateDescription(
    `Shop ${name} in hallmarked 92.5 sterling silver from Surya Jewellers Jaipur. Includes Certificate of Authenticity${sku ? `, SKU ${sku}` : ''}.`
  );
}

export function getProductImageAlt(product: ProductSeoInput) {
  return `${getProductDisplayName(product)} in 92.5 sterling silver by Surya Jewellers Jaipur`;
}
