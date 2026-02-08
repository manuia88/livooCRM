import type { NextConfig } from "next";
import path from "path";
import bundleAnalyzer from '@next/bundle-analyzer';

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
});

const nextConfig: NextConfig = {
  typescript: { ignoreBuildErrors: true },

  // Optimizaciones de compilación
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn']
    } : false,
  },

  // Experimental features
  experimental: {
    // Optimizar imports de paquetes grandes
    optimizePackageImports: [
      'lucide-react',
      '@radix-ui/react-icons',
      'recharts',
      'date-fns',
      'lodash-es',
      'framer-motion'
    ],
  },

  turbopack: {
    root: path.resolve(__dirname),
  },

  // Webpack optimizations
  webpack: (config, { dev, isServer }) => {
    // Tree-shaking más agresivo en producción
    if (!dev && !isServer) {
      config.optimization = {
        ...config.optimization,
        usedExports: true,
        sideEffects: true, // Cambiado a true por defecto en Next.js, pero podemos forzarlo si sabemos qué hacemos
      }
    }

    // Resolver aliases para tree-shaking
    config.resolve.alias = {
      ...config.resolve.alias,
      'lodash': 'lodash-es', // Versión ES6 permite tree-shaking
    }

    return config
  },

  // Configuración de imágenes
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60 * 60 * 24 * 365, // 1 año
    remotePatterns: [
      { protocol: 'https', hostname: 'picsum.photos' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: '*.supabase.co' },
    ],
  },

  async headers() {
    // Content Security Policy
    const ContentSecurityPolicy = `
      default-src 'self';
      script-src 'self' 'unsafe-eval' 'unsafe-inline' https://maps.googleapis.com;
      style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
      img-src 'self' blob: data: https://*.supabase.co https://maps.googleapis.com https://maps.gstatic.com https://picsum.photos https://images.unsplash.com https://*.tile.openstreetmap.org;
      font-src 'self' data: https://fonts.gstatic.com;
      connect-src 'self' https://*.supabase.co wss://*.supabase.co https://maps.googleapis.com https://nominatim.openstreetmap.org;
      frame-src 'self' https://maps.googleapis.com;
      worker-src 'self' blob:;
      object-src 'none';
      base-uri 'self';
      form-action 'self';
      frame-ancestors 'none';
      upgrade-insecure-requests;
    `.replace(/\s{2,}/g, ' ').trim();

    return [
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET,POST,PUT,DELETE,OPTIONS'
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Content-Type, Authorization'
          },
          {
            key: 'Access-Control-Max-Age',
            value: '86400' // 24 hours
          },
        ],
      },
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: ContentSecurityPolicy
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(self)'
          },
        ],
      },
    ]
  },
};

export default withBundleAnalyzer(nextConfig);

