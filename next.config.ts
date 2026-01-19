import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'ymndqdqhxzlpteiusuny.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**'
      }
    ]
  },
  eslint: {
    // Allows production builds to complete even with ESLint errors
    ignoreDuringBuilds: true
  }
};

export default nextConfig;
