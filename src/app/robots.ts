import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin/',
          '/api/',
          '/studio/',
          '/account/',
          '/checkout/',
          '/order-success/',
          '/sign-in/',
          '/sign-up/',
          '/sso-callback/',
        ],
      },
    ],
    sitemap: 'https://suryajewellers.com/sitemap.xml',
  };
}
