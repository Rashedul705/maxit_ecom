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
        hostname: 'ibb.co',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'www.startech.com.bd',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'startech.com.bd',
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
    const defaultBackend = process.env.NODE_ENV === 'development'
      ? 'http://localhost:5002'
      : 'https://maxitecomapi.maxapi.esp32.site';

    const backend = (
      process.env.BACKEND_URL ||
      process.env.API_URL?.replace(/\/api\/v1\/?$/, '') ||
      process.env.NEXT_PUBLIC_API_URL?.replace(/\/api\/v1\/?$/, '') ||
      defaultBackend
    ).replace(/\/$/, '');

    return [
      {
        source: '/admin',
        destination: '/admin/index.html',
      },
      {
        source: '/admin/',
        destination: '/admin/index.html',
      },
      {
        source: '/admin/assets/:path*',
        destination: '/admin/assets/:path*',
      },
      {
        source: '/admin/:path*',
        destination: '/admin/index.html',
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
