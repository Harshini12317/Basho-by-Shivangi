import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Image optimization
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
    // Enable optimized loading
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  
  // Enable React compiler (if available in this version)
  experimental: {
    // Optimize package imports
    optimizePackageImports: [
      "@next/font",
      "react-icons",
      "lucide-react",
      "framer-motion",
      "gsap",
    ],
  },
  
  // Production optimizations
  compress: true,
  
  // Power-ups
  poweredByHeader: false,
  
  // Make ESLint warnings non-blocking
  eslint: {
    // This allows build to succeed even with warnings
    ignoreDuringBuilds: false,
  },
};

export default nextConfig;
