import createNextIntlPlugin from 'next-intl/plugin';
import crypto from 'crypto';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,

  // CRITICAL FIX: Enhanced performance optimizations
  experimental: {
    optimizePackageImports: ['lucide-react', 'react-icons'],
    // Enable modern bundling for better performance
    optimizeServerReact: true,
    // Reduce server-side render time
    serverMinification: true,
  },

  // CRITICAL FIX: Compiler optimizations
  compiler: {
    // Remove console logs in production
    removeConsole: process.env.NODE_ENV === 'production',
  },

  turbopack: {
    rules: {
      '*.svg': {
        loaders: ['@svgr/webpack'],
        as: '*.js',
      },
    },
  },

  // Bundle optimization
  webpack: (config, { dev, isServer }) => {
    // CRITICAL FIX: Enhanced bundle optimization for production
    if (!dev && !isServer) {
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          chunks: 'all',
          maxAsyncRequests: 30,
          maxInitialRequests: 20, // Reduced for better initial load
          minSize: 20000, // Increased minimum chunk size
          cacheGroups: {
            default: false,
            vendors: false,
            // Core framework chunk - prioritized
            framework: {
              chunks: 'all',
              name: 'framework',
              test: /(?<!node_modules.*)[\\/]node_modules[\\/](react|react-dom|scheduler|prop-types|use-subscription)[\\/]/,
              priority: 50, // Increased priority
              enforce: true,
              minChunks: 1,
            },
            // Critical performance libraries
            performance: {
              test: /[\\/]node_modules[\\/](next|@next)[\\/]/,
              name: 'next-performance',
              chunks: 'all',
              priority: 45,
              enforce: true,
            },
            // Animation libraries - async only for better initial load
            animations: {
              test: /[\\/]node_modules[\\/](framer-motion|lottie-react|@lottiefiles)[\\/]/,
              name: 'animations',
              chunks: 'async',
              priority: 35,
              enforce: true,
            },
            // UI libraries separation
            ui: {
              test: /[\\/]node_modules[\\/](@radix-ui|lucide-react|react-icons)[\\/]/,
              name: 'ui-libs',
              chunks: 'all',
              priority: 30,
              minChunks: 1,
              maxSize: 244000, // Limit UI chunk size
            },
            // Internationalization
            i18n: {
              test: /[\\/]node_modules[\\/](next-intl|react-intl)[\\/]/,
              name: 'i18n',
              chunks: 'all',
              priority: 25,
            },
            // Large libraries with size optimization
            lib: {
              test(module) {
                return (
                  module.size() > 100000 && // Reduced threshold
                  /node_modules[/\\]/.test(module.identifier())
                );
              },
              name(module) {
                const hash = crypto.createHash('sha1');
                hash.update(module.identifier());
                return hash.digest('hex').substring(0, 8);
              },
              priority: 20,
              minChunks: 1,
              reuseExistingChunk: true,
              maxSize: 244000, // Size limit for better loading
            },
            // Common components
            commons: {
              name: 'commons',
              minChunks: 3, // Increased threshold
              priority: 15,
              chunks: 'all',
              reuseExistingChunk: true,
              maxSize: 244000,
            },
          },
        },
        // CRITICAL FIX: Enhanced minimization
        minimize: true,
        usedExports: true,
        sideEffects: false,
        // Tree shaking improvements
        providedExports: true,
        innerGraph: true,
      };

      // CRITICAL FIX: Performance-focused module concatenation
      config.optimization.concatenateModules = true;

      // CRITICAL FIX: Better compression
      config.optimization.flagIncludedChunks = true;
      config.optimization.mergeDuplicateChunks = true;
      config.optimization.removeAvailableModules = true;
      config.optimization.removeEmptyChunks = true;
    }

    // CRITICAL FIX: Enhanced SVG optimization
    config.module.rules.push({
      test: /\.svg$/,
      use: [
        {
          loader: '@svgr/webpack',
          options: {
            svgoConfig: {
              plugins: [
                {
                  name: 'preset-default',
                  params: {
                    overrides: {
                      removeViewBox: false,
                      cleanupIDs: false,
                    },
                  },
                },
                'removeDimensions',
              ],
            },
            memo: true, // Enable memoization for better performance
          },
        },
      ],
    });

    // CRITICAL FIX: Performance monitoring in development
    if (dev) {
      config.devtool = 'eval-cheap-module-source-map';
    }

    return config;
  },

  // CRITICAL FIX: Enhanced image optimization
  images: {
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [320, 420, 768, 1024, 1200, 1600, 1920], // Added 1600 for better coverage
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384, 512], // Added 512
    minimumCacheTTL: 60 * 60 * 24 * 365, // 1 year
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    // Enable image optimization for better LCP
    unoptimized: false,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'api.dicebear.com',
        pathname: '/**',
      },
    ],
  },

  // CRITICAL FIX: Enhanced caching headers
  async headers() {
    return [
      // Static assets - long-term caching
      {
        source: '/assets/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
        ],
      },
      {
        source: '/optimized/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
        ],
      },
      // Next.js static files
      {
        source: '/_next/static/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      // Font files - aggressive caching
      {
        source: '/_next/static/media/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
          {
            key: 'Cross-Origin-Resource-Policy',
            value: 'cross-origin',
          },
        ],
      },
      // CRITICAL FIX: Performance headers for all pages
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
    ];
  },

  // CRITICAL FIX: Performance-focused redirects
  async rewrites() {
    return {
      beforeFiles: [],
      afterFiles: [],
      fallback: [],
    };
  },
};

export default withNextIntl(nextConfig);