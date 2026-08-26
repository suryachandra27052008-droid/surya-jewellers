import { describe, expect, it } from 'vitest';
import { catalogImageLoader } from './catalog-image-loader';

describe('catalogImageLoader', () => {
  it('creates a responsive Sanity CDN URL', () => {
    const result = catalogImageLoader({
      src: 'https://cdn.sanity.io/images/project/production/example-1200x1600.jpg',
      width: 640,
      quality: 60,
    });
    const url = new URL(result);

    expect(url.hostname).toBe('cdn.sanity.io');
    expect(url.searchParams.get('w')).toBe('640');
    expect(url.searchParams.get('q')).toBe('60');
    expect(url.searchParams.get('fit')).toBe('max');
    expect(url.searchParams.get('auto')).toBe('format');
  });

  it('does not rewrite non-Sanity or malformed sources', () => {
    expect(catalogImageLoader({ src: '/logo_sj.webp', width: 320 })).toBe('/logo_sj.webp');
    expect(
      catalogImageLoader({ src: 'https://example.com/product.jpg', width: 320 }),
    ).toBe('https://example.com/product.jpg');
  });
});
