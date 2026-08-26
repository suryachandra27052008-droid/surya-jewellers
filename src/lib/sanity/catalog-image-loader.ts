import type { ImageLoaderProps } from 'next/image';

const SANITY_IMAGE_HOST = 'cdn.sanity.io';

/**
 * Serve catalogue variants directly from Sanity's image CDN so product images
 * do not consume Vercel Image Optimization transformations.
 */
export function catalogImageLoader({ src, width, quality }: ImageLoaderProps): string {
  try {
    const url = new URL(src);

    if (url.protocol !== 'https:' || url.hostname !== SANITY_IMAGE_HOST) {
      return src;
    }

    url.searchParams.set('w', String(width));
    url.searchParams.set('q', String(quality ?? 75));
    url.searchParams.set('fit', 'max');
    url.searchParams.set('auto', 'format');

    return url.toString();
  } catch {
    return src;
  }
}
