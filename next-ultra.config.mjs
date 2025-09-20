import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // Enhanced image configuration for 2024
  images: {
    // Modern format support (in priority order)
    formats: ['image/avif', 'image/webp'],

    // Optimized device sizes for responsive images
    deviceSizes: [
      320,  // Mobile small
      420,  // Mobile large
      768,  // Tablet
      1024, // Desktop small
      1200, // Desktop medium
      1440, // Desktop large
      1920, // Desktop XL
      2560  // 2K displays
    ],

    // Icon and small image sizes
    imageSizes: [16, 32, 48, 64, 96, 128, 192, 256, 384, 512],

    // Cache optimization
    minimumCacheTTL: 60 * 60 * 24 * 365, // 1 year for optimized images
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",

    // Remote patterns for external images
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
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'cdn.kayanlive.com', // Your CDN
        pathname: '/**',
      }
    ],

    // Loader configuration for ultra-optimized images
    loader: 'custom',
    loaderFile: './src/lib/ultra-image-loader.ts',

    // Quality settings per image type
    quality: 85, // Default quality

    // Enable experimental features
    unoptimized: false,
    priority: true, // Enable priority hints
  },

  // Enhanced headers for client hints and performance
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          // Client Hints for adaptive image serving
          {
            key: 'Accept-CH',
            value: 'DPR, Viewport-Width, Width, Save-Data, Sec-CH-UA-Mobile, Sec-CH-Prefers-Reduced-Motion'
          },
          {
            key: 'Vary',
            value: 'Accept-CH, DPR, Viewport-Width, Width, Save-Data'
          },
          // Performance headers
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          }
        ],
      },
      // Specific headers for optimized images
      {
        source: '/ultra-optimized/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable' // 1 year cache for optimized images
          },
          {
            key: 'Content-Security-Policy',
            value: "default-src 'none'; img-src 'self' data:; style-src 'unsafe-inline'"
          }
        ],
      },
      // Service Worker headers
      {
        source: '/ultra-image-sw.js',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=0, must-revalidate'
          },
          {
            key: 'Service-Worker-Allowed',
            value: '/'
          }
        ],
      }
    ];
  },

  // Experimental features for performance
  experimental: {
    optimizeCss: true,
    optimizeServerReact: true,
    turbo: {
      loaders: {
        '.svg': ['@svgr/webpack'],
      },
    },
    webVitalsAttribution: ['CLS', 'LCP', 'FCP', 'FID', 'TTFB', 'INP'],
  },

  // Webpack optimizations for image processing
  webpack: (config, { dev, isServer }) => {
    // Image optimization for build time
    if (!dev && !isServer) {
      config.module.rules.push({
        test: /\.(png|jpe?g|gif|svg)$/,
        use: [
          {
            loader: 'file-loader',
            options: {
              publicPath: '/_next/static/images/',
              outputPath: 'static/images/',
              name: '[name]-[hash].[ext]',
            },
          },
          {
            loader: 'image-webpack-loader',
            options: {
              mozjpeg: {
                progressive: true,
                quality: 85,
              },
              optipng: {
                enabled: false,
              },
              pngquant: {
                quality: [0.65, 0.90],
                speed: 4,
              },
              gifsicle: {
                interlaced: false,
              },
              webp: {
                quality: 85,
                method: 6,
              },
              avif: {
                quality: 50,
                speed: 2,
              },
            },
          },
        ],
      });
    }

    // Service Worker support
    if (!isServer) {
      config.module.rules.push({
        test: /ultra-image-sw\.js$/,
        use: {
          loader: 'file-loader',
          options: {
            name: '[name].[ext]',
            publicPath: '/_next/static/',
            outputPath: 'static/',
          },
        },
      });
    }

    return config;
  },

  // Environment variables for image optimization
  env: {
    ULTRA_IMAGE_OPTIMIZATION: 'true',
    BLURHASH_ENABLED: 'true',
    CLIENT_HINTS_ENABLED: 'true',
    NETWORK_AWARE_LOADING: 'true',
  },

  // Output configuration for static export
  output: 'standalone',

  // Compression
  compress: true,

  // Power-user optimizations
  poweredByHeader: false,
  generateEtags: true,

  // Bundle analyzer
  ...(process.env.ANALYZE === 'true' && {
    bundleAnalyzerConfig: {
      enabled: true,
      openAnalyzer: true,
    },
  }),
};

export default withNextIntl(nextConfig);