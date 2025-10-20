import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */

  // Disable type checking during build (faster builds, especially on Vercel)
  typescript: {
    ignoreBuildErrors: false,
  },

  // Disable ESLint during builds (run separately)
  eslint: {
    ignoreDuringBuilds: false,
  },

  // Environment variables that should be available at build time
  env: {
    NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL,
    NEXT_PUBLIC_IS_STAGING: process.env.NEXT_PUBLIC_IS_STAGING,
  },
};

export default nextConfig;
