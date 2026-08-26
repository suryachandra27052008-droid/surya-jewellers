import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: process.cwd(),
  },
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: "suryajewellers.com" }],
        destination: "https://www.suryajewellers.com/:path*",
        permanent: true,
      },
      {
        source: "/products/amethist-bracelets-br07367",
        destination: "/products/amethyst-blue-topaz-bracelet-br07367",
        permanent: true,
      },
      {
        source: "/products/malti-shaphire-bracelets-br06382",
        destination: "/products/multi-sapphire-bracelet-br06382",
        permanent: true,
      },
      {
        source: "/products/cristal-earrings-ear08924",
        destination: "/products/crystal-ruby-earrings-ear08924",
        permanent: true,
      },
    ];
  },
  images: {
    formats: ['image/webp'],
    qualities: [60, 75],
    deviceSizes: [320, 640, 828, 1080, 1920],
    imageSizes: [80, 160, 256],
    minimumCacheTTL: 2678400,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.sanity.io",
      },
      {
        protocol: "https",
        hostname: "placehold.co",
      },
    ],
  },
};

export default nextConfig;
