import createNextIntlPlugin from 'next-intl/plugin';
import crypto from 'crypto';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,

  // Image optimization configuration
  images: {
    // Configure all quality values used in the application
    qualities: [20, 30, 60, 75, 80, 90, 100],
    formats: ['image/webp'],
  },

  // CRITICAL FIX: Ultra-performance optimizations for 100% scores
  experimental: {
    optimizePackageImports: [
      'lucide-react',
      'react-icons',
      '@radix-ui/react-dialog',
      '@radix-ui/react-dropdown-menu',
      '@radix-ui/react-select',
      '@radix-ui/react-tabs'
    ],
    optimizeServerReact: true,
    serverMinification: true,
  },

  // CRITICAL FIX: Enhanced compiler optimizations
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
    // Remove React dev tools in production
    reactRemoveProperties: process.env.NODE_ENV === 'production' ? {
      properties: ['^data-testid$', '^data-test$']
    } : false,
  },

  // Bundle optimization for maximum performance
  webpack: (config, { dev, isServer }) => {
    // CRITICAL FIX: Maximum performance webpack optimizations
    if (!dev && !isServer) {
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          chunks: 'all',
          maxAsyncRequests: 10, // Ultra reduced for 100% performance
          maxInitialRequests: 5, // Ultra reduced for 100% performance
          minSize: 50000, // Larger chunks for fewer requests
          maxSize: 300000, // Increased to reduce splits
          cacheGroups: {
            default: false,
            vendors: false,

            // CRITICAL: Framework chunk - highest priority
            framework: {
              chunks: 'all',
              name: 'framework',
              test: /(?<!node_modules.*)[\\/]node_modules[\\/](react|react-dom|scheduler|prop-types|use-subscription)[\\/]/,
              priority: 60,
              enforce: true,
              minChunks: 1,
              reuseExistingChunk: true,
            },

            // Next.js performance essentials
            nextPerformance: {
              test: /[\\/]node_modules[\\/](next|@next)[\\/]/,
              name: 'next-performance',
              chunks: 'all',
              priority: 55,
              enforce: true,
              maxSize: 180000,
            },

            // I18n libraries - separate chunk
            i18n: {
              test: /[\\/]node_modules[\\/](next-intl|react-intl)[\\/]/,
              name: 'i18n',
              chunks: 'all',
              priority: 50,
              maxSize: 150000,
            },

            // UI libraries - optimized size
            ui: {
              test: /[\\/]node_modules[\\/](@radix-ui|lucide-react|react-icons)[\\/]/,
              name: 'ui-libs',
              chunks: 'all',
              priority: 45,
              minChunks: 1,
              maxSize: 180000,
            },

            // Animation libraries - async only for better TBT
            animations: {
              test: /[\\/]node_modules[\\/](framer-motion|lottie-react|@lottiefiles)[\\/]/,
              name: 'animations',
              chunks: 'async',
              priority: 40,
              enforce: true,
              maxSize: 150000,
            },

            // Database and auth - async loading
            database: {
              test: /[\\/]node_modules[\\/](@prisma|@trpc|@tanstack|next-auth)[\\/]/,
              name: 'database',
              chunks: 'async',
              priority: 35,
              maxSize: 180000,
            },

            // Heavy libraries - size-optimized chunks
            heavyLibs: {
              test(module) {
                return (
                  module.size() > 80000 && // Reduced threshold for better performance
                  /node_modules[/\\]/.test(module.identifier())
                );
              },
              name(module) {
                const hash = crypto.createHash('sha1');
                hash.update(module.identifier());
                return `heavy-${hash.digest('hex').substring(0, 8)}`;
              },
              priority: 30,
              minChunks: 1,
              reuseExistingChunk: true,
              maxSize: 180000,
            },

            // Common modules
            commons: {
              name: 'commons',
              minChunks: 2, // Reduced threshold
              priority: 25,
              chunks: 'all',
              reuseExistingChunk: true,
              maxSize: 150000,
            },
          },
        },

        // CRITICAL FIX: Maximum compression and optimization
        minimize: true,
        usedExports: true,
        sideEffects: false,
        providedExports: true,
        innerGraph: true,
        concatenateModules: true,
        flagIncludedChunks: true,
        mergeDuplicateChunks: true,
        removeAvailableModules: true,
        removeEmptyChunks: true,

        // Advanced tree shaking
        mangleExports: 'size',
      };

      // CRITICAL FIX: Performance-focused resolve
      config.resolve.alias = {
        ...config.resolve.alias,
        // Replace heavy lodash with lighter alternatives where possible
        'lodash/debounce': 'lodash.debounce',
        'lodash/throttle': 'lodash.throttle',
        'lodash/cloneDeep': 'lodash.clonedeep',
      };
    }

    // CRITICAL FIX: Ultra-optimized SVG handling
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
                      convertPathData: {
                        floatPrecision: 2, // Reduce precision for smaller file sizes
                      },
                    },
                  },
                },
                'removeDimensions',
                'removeTitle',
                'removeDesc',
                'removeMetadata',
              ],
            },
            memo: true,
            replaceAttrValues: {
              '#000': 'currentColor',
              '#000000': 'currentColor',
            },
          },
        },
      ],
    });

    // CRITICAL FIX: Development performance
    if (dev) {
      // Don't override devtool in development to avoid performance regressions
      // Next.js will handle the optimal devtool setting
      // Faster builds in development
      config.optimization.removeAvailableModules = false;
      config.optimization.removeEmptyChunks = false;
      config.optimization.splitChunks = false;
    }

    return config;
  },


  // CRITICAL FIX: Performance-optimized headers
  async headers() {
    return [
      // Static assets - maximum caching
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

      // Next.js static files - aggressive caching
      {
        source: '/_next/static/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },

      // Font files - maximum caching
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

      // CRITICAL FIX: Performance and security headers for all pages
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains',
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
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },

      // CSS and JavaScript specific headers
      {
        source: '/_next/static/css/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
          {
            key: 'Content-Type',
            value: 'text/css; charset=utf-8',
          },
        ],
      },
      {
        source: '/_next/static/chunks/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },

  // CRITICAL FIX: Performance redirects and rewrites
  async rewrites() {
    return {
      beforeFiles: [],
      afterFiles: [
        // Image optimization API
        {
          source: '/api/image-proxy/:path*',
          destination: '/api/ultra-image/:path*',
        },
      ],
      fallback: [],
    };
  },

  // CRITICAL FIX: Disable source maps in production for smaller bundles
  productionBrowserSourceMaps: false,

  // TypeScript configuration for performance
  typescript: {
    // Ignore build errors in development for faster builds
    ignoreBuildErrors: process.env.NODE_ENV === 'development',
  },

  // ESLint configuration
  eslint: {
    // Only run ESLint on these directories
    dirs: ['src'],
    // Ignore during builds for faster production builds
    ignoreDuringBuilds: process.env.NODE_ENV === 'production',
  },
};

export default withNextIntl(nextConfig);