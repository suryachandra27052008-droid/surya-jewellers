import type { MetadataRoute } from 'next';
import { client } from '@/lib/sanity/client';
import { posts } from '@/app/blog/data';
import { getProductCanonicalSlug, SITE_URL } from '@/lib/seo/product';

const BASE_URL = SITE_URL;

function parseBlogDate(date: string): Date {
  if (date === 'Pinned' || !date) return new Date('2025-01-01');
  const d = new Date(date);
  return isNaN(d.getTime()) ? new Date('2025-01-01') : d;
}

async function getProducts(): Promise<{ slug: string; updatedAt: Date }[]> {
  try {
    const products = await client.fetch<{
      _id: string;
      name?: string;
      slug?: string;
      mainStoneType?: string;
      category?: string;
      sku?: string;
      _updatedAt?: string;
    }[]>(
      `*[_type == "product" && defined(slug.current) && price >= 1000]{ _id, name, "slug": slug.current, mainStoneType, "category": category->name, sku, _updatedAt }`
    );
    return products.map((p) => ({
      slug: getProductCanonicalSlug(p),
      updatedAt: p._updatedAt ? new Date(p._updatedAt) : new Date('2025-01-01'),
    }));
  } catch {
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const products = await getProducts();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: BASE_URL, lastModified: new Date('2026-04-18') },
    { url: `${BASE_URL}/products`, lastModified: new Date('2026-04-18') },
    { url: `${BASE_URL}/about`, lastModified: new Date('2025-06-01') },
    { url: `${BASE_URL}/blog`, lastModified: new Date('2025-03-01') },
    { url: `${BASE_URL}/contact`, lastModified: new Date('2025-01-01') },
    { url: `${BASE_URL}/faqs`, lastModified: new Date('2026-04-29') },
    { url: `${BASE_URL}/wholesale`, lastModified: new Date('2025-01-01') },
    { url: `${BASE_URL}/shipping`, lastModified: new Date('2025-01-01') },
    { url: `${BASE_URL}/jaipur-jewellery`, lastModified: new Date('2026-04-18') },
    { url: `${BASE_URL}/silver-rings-jaipur`, lastModified: new Date('2026-04-26') },
    { url: `${BASE_URL}/925-silver-rings`, lastModified: new Date('2026-04-26') },
    { url: `${BASE_URL}/emerald-silver-rings`, lastModified: new Date('2026-04-26') },
    { url: `${BASE_URL}/ruby-silver-earrings`, lastModified: new Date('2026-04-26') },
    { url: `${BASE_URL}/silver-necklaces-jaipur`, lastModified: new Date('2026-04-26') },
    { url: `${BASE_URL}/silver-bracelets-jaipur`, lastModified: new Date('2026-04-26') },
    { url: `${BASE_URL}/silver-pendants-jaipur`, lastModified: new Date('2026-04-26') },
    { url: `${BASE_URL}/wholesale-silver-jewellery-jaipur`, lastModified: new Date('2026-04-26') },
  ];

  const productRoutes: MetadataRoute.Sitemap = products.map(({ slug, updatedAt }) => ({
    url: `${BASE_URL}/products/${slug}`,
    lastModified: updatedAt,
  }));

  const blogRoutes: MetadataRoute.Sitemap = posts.map((post) => ({
    url: `${BASE_URL}/blog/${post.slug}`,
    lastModified: parseBlogDate(post.date),
  }));

  const all = [...staticRoutes, ...productRoutes, ...blogRoutes];
  const seen = new Set<string>();
  return all.filter(({ url }) => {
    if (seen.has(url)) return false;
    seen.add(url);
    return true;
  });
}
