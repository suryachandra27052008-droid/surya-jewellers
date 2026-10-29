import { describe, expect, it } from 'vitest';
import { auditProductQuality, type QualityProduct } from './product-quality';

const clean: QualityProduct = { _id: 'product-1', name: 'Emerald Ring', sku: 'RNG001', slug: 'emerald-ring-rng001',
  price: 15999, category: 'Rings', images: ['https://cdn.sanity.io/example.jpg'], inStock: true, stockQuantity: 1 };
const kinds = (product: QualityProduct) => auditProductQuality([product])[0]?.issues.map(issue => issue.kind) || [];

describe('read-only merchant product quality checks', () => {
  it('does not flag complete products or an intentionally sold-out piece', () => {
    expect(auditProductQuality([clean])).toEqual([]);
    expect(auditProductQuality([{ ...clean, stockQuantity: 0, inStock: false }])).toEqual([]);
  });
  it.each([19, 50, 0, -1, null, undefined, NaN, Infinity])('flags suspicious or missing prices without guessing a replacement: %s', price => {
    const product = { ...clean, price };
    expect(kinds(product)).toContain('price'); expect(product.price).toBe(price);
  });
  it('does not label expensive jewellery as an error solely for its price', () => {
    expect(kinds({ ...clean, price: 800000 })).not.toContain('price');
  });
  it('finds duplicate SKUs case-insensitively, while preserving leading zeroes', () => {
    const report = auditProductQuality([clean, { ...clean, _id: 'product-2', slug: 'other', sku: ' rng001 ' }]);
    expect(report).toHaveLength(2); expect(report.every(row => row.issues.some(issue => issue.kind === 'sku'))).toBe(true);
    expect(auditProductQuality([{ ...clean, sku: '09' }, { ...clean, _id: 'p2', sku: '9', slug: 'different' }])).toEqual([]);
  });
  it('finds shared public URLs as well as missing or invalid source slugs', () => {
    const report = auditProductQuality([clean, { ...clean, _id: 'p2', sku: 'RNG002' }]);
    expect(report.every(row => row.issues.some(issue => issue.kind === 'url'))).toBe(true);
    expect(kinds({ ...clean, slug: '' })).toContain('url');
    expect(kinds({ ...clean, slug: 'not a slug' })).toContain('url');
  });
  it.each([{ images: [] }, { images: [null] }, { images: [''] }, { images: ['javascript:alert(1)'] }])('flags products without usable photos: %j', ({ images }) => {
    expect(kinds({ ...clean, images })).toContain('images');
  });
  it('flags known spelling errors and missing categories or names without editing them', () => {
    const product = { ...clean, name: 'Amethist Ring', mainStoneType: 'Blue shaphire', secondaryStoneType: 'Kynite Cristal', category: null };
    const before = structuredClone(product); const issues = auditProductQuality([product])[0].issues;
    expect(issues.filter(issue => issue.kind === 'spelling')).toHaveLength(3);
    expect(issues.map(issue => issue.message).join(' ')).toMatch(/Amethyst.*Blue sapphire.*Kyanite Crystal/);
    expect(product).toEqual(before); expect(kinds({ ...clean, name: '' })).toContain('name');
    expect(issues.some(issue => issue.kind === 'category')).toBe(true);
  });
  it.each([-1, 1.5, NaN])('flags invalid inventory quantities: %s', stockQuantity => {
    expect(kinds({ ...clean, stockQuantity })).toContain('stock');
  });
  it('distinguishes stock contradictions from legitimate legacy missing quantities', () => {
    expect(kinds({ ...clean, stockQuantity: 0 })).toContain('stock');
    expect(kinds({ ...clean, inStock: false })).toContain('stock');
    expect(kinds({ ...clean, stockQuantity: undefined })).not.toContain('stock');
  });
});
