import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  
  // Image optimization configuration
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60,
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },

  // Turbopack configuration (empty to silence warning)
  turbopack: {},

  // Enable webpack bundle analyzer only when explicitly requested
  webpack: (config, { isServer, dev }) => {
    // Bundle analyzer for development only when ANALYZE env is set
    if (dev && !isServer && process.env.ANALYZE === 'true') {
      const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer')
      config.plugins.push(
        new BundleAnalyzerPlugin({
          analyzerMode: 'static',
          reportFilename: './analyze/client.html',
          openAnalyzer: true,
        })
      )
    }

    return config
  },

  // Enable experimental features for better performance
  experimental: {
    optimizePackageImports: [
      'recharts',
      '@schedule-x/react',
      '@schedule-x/calendar',
      'lucide-react',
      '@radix-ui/react-dialog',
      '@radix-ui/react-dropdown-menu',
      '@radix-ui/react-select',
    ],
  },

  // Compiler options for optimizations
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn'],
    } : false,
  },
};

export default nextConfig;


