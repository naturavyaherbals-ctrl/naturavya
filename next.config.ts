import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  /* 
     CRITICAL: Disabling these prevents Vercel from fighting 
     the middleware over URL formatting.
  */
  trailingSlash: false,
  skipTrailingSlashRedirect: true,
  
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
      },
    ],
  },
};

export default nextConfig;