import type { MetadataRoute } from 'next';
import { client } from '@/lib/sanity/client';
import { posts } from '@/app/blog/data';

const BASE_URL = 'https://suryajewellers.com';

const buildUniqueSlug = (p: {
  mainStoneType?: string;
  category?: string;
  sku?: string;
  _id: string;
  _updatedAt?: string;
}) => {
  const stone = (p.mainStoneType && p.mainStoneType !== 'None' ? p.mainStoneType : 'silver')
    .toLowerCase().replace(/[^a-z0-9]+/g, '-');
  const cat = (p.category || 'jewellery').toLowerCase().replace(/[^a-z0-9]+/g, '-');
  const sku = String(p.sku || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || p._id.slice(-6);
  return `${stone}-${cat}-${sku}`.replace(/-+/g, '-');
};

function parseBlogDate(date: string): Date {
  if (date === 'Pinned' || !date) return new Date('2025-01-01');
  const d = new Date(date);
  return isNaN(d.getTime()) ? new Date('2025-01-01') : d;
}

async function getProducts(): Promise<{ slug: string; updatedAt: Date }[]> {
  try {
    const products = await client.fetch<{
      _id: string;
      mainStoneType?: string;
      category?: string;
      sku?: string;
      _updatedAt?: string;
    }[]>(
      `*[_type == "product" && defined(slug.current)]{ _id, mainStoneType, "category": category->name, sku, _updatedAt }`
    );
    return products.map((p) => ({
      slug: buildUniqueSlug(p),
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
    { url: `${BASE_URL}/collections`, lastModified: new Date('2026-04-18') },
    { url: `${BASE_URL}/about`, lastModified: new Date('2025-06-01') },
    { url: `${BASE_URL}/blog`, lastModified: new Date('2025-03-01') },
    { url: `${BASE_URL}/contact`, lastModified: new Date('2025-01-01') },
    { url: `${BASE_URL}/wholesale`, lastModified: new Date('2025-01-01') },
    { url: `${BASE_URL}/shipping`, lastModified: new Date('2025-01-01') },
    { url: `${BASE_URL}/jaipur-jewellery`, lastModified: new Date('2026-04-18') },
  ];

  const productRoutes: MetadataRoute.Sitemap = products.map(({ slug, updatedAt }) => ({
    url: `${BASE_URL}/products/${slug}`,
    lastModified: updatedAt,
  }));

  const blogRoutes: MetadataRoute.Sitemap = posts.map((post) => ({
    url: `${BASE_URL}/blog/${post.slug}`,
    lastModified: parseBlogDate(post.date),
  }));

  return [...staticRoutes, ...productRoutes, ...blogRoutes];
}
