import { beforeEach, describe, expect, it, vi } from 'vitest';

const { fetchProducts } = vi.hoisted(() => ({ fetchProducts: vi.fn() }));
vi.mock('@/lib/sanity/client', () => ({ writeClient: { fetch: fetchProducts } }));
vi.mock('./ProductDetailClient', () => ({ default: () => null }));
vi.mock('next/navigation', () => ({ notFound: () => { throw new Error('NEXT_HTTP_ERROR_FALLBACK;404'); } }));

import ProductPage, { generateMetadata } from './page';

describe('product route missing-page handling', () => {
  beforeEach(() => { fetchProducts.mockReset(); });

  it('uses a real not-found response for missing product metadata', async () => {
    fetchProducts.mockResolvedValue([]);
    await expect(generateMetadata({ params: Promise.resolve({ slug: 'missing' }) }))
      .rejects.toThrow('NEXT_HTTP_ERROR_FALLBACK;404');
  });

  it('uses the same not-found result for the page', async () => {
    fetchProducts.mockResolvedValue([]);
    await expect(ProductPage({ params: Promise.resolve({ slug: 'missing' }) }))
      .rejects.toThrow('NEXT_HTTP_ERROR_FALLBACK;404');
  });

  it('keeps merchant-review prices unavailable without changing source data', async () => {
    const product = { _id: 'review', name: 'Earrings', slug: 'review', sku: '20', price: 19 };
    fetchProducts.mockResolvedValue([product]);
    await expect(generateMetadata({ params: Promise.resolve({ slug: 'review' }) }))
      .rejects.toThrow('NEXT_HTTP_ERROR_FALLBACK;404');
    expect(product.price).toBe(19);
  });

  it('does not turn CMS outages into missing-product responses', async () => {
    fetchProducts.mockRejectedValue(new Error('CMS unavailable'));
    await expect(generateMetadata({ params: Promise.resolve({ slug: 'existing' }) }))
      .rejects.toThrow('CMS unavailable');
  });
});
