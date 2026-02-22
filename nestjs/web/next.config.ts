

// apps/web/next.config.ts
import type { NextConfig } from 'next';
import path from 'path';

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
     domains: ['res.cloudinary.com', 'images.unsplash.com'],

  },
  turbopack: {
    // Spécifier la racine du projet pour éviter les warnings
    root: path.resolve(__dirname, '../../'), // Remonte à la racine du monorepo
  },
};

export default nextConfig;