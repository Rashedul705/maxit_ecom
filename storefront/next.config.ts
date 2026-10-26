import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'via.placeholder.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'www.nanopowerbd.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'nanopowerbd.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'i.ibb.co',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'bdshop.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'www.bdshop.com',
        pathname: '/**',
      }
    ],
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  async rewrites() {
    const backend = (
      process.env.BACKEND_URL ||
      process.env.API_URL?.replace(/\/api\/v1\/?$/, '') ||
      process.env.NEXT_PUBLIC_API_URL?.replace(/\/api\/v1\/?$/, '') ||
      'https://maxitecomapi.maxapi.esp32.site'
    ).replace(/\/$/, '');

    return [
      {
        source: '/admin',
        destination: `${backend}/admin/index.html`,
      },
      {
        source: '/admin/',
        destination: `${backend}/admin/index.html`,
      },
      {
        source: '/admin/assets/:path*',
        destination: `${backend}/admin/assets/:path*`,
      },
      {
        source: '/admin/:path*',
        destination: `${backend}/admin/index.html`,
      },
      {
        source: '/api/v1/:path*',
        destination: `${backend}/api/v1/:path*`,
      },
      {
        source: '/api/:path*',
        destination: `${backend}/api/v1/:path*`,
      },
      {
        source: '/uploads/:path*',
        destination: `${backend}/uploads/:path*`,
      },
    ];
  },
};

export default nextConfig;
