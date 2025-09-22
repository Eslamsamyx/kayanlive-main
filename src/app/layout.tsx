import type { Metadata } from 'next';
import { Poppins } from 'next/font/google';
import { TRPCReactProvider } from '@/trpc/react';
import { Providers } from '@/components/Providers';
import '@/styles/globals.css';

// CRITICAL FIX: Ultra-optimized font loading for 100% performance
const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '600'], // Only critical weights
  display: 'swap',
  preload: true,
  fallback: ['system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Arial', 'sans-serif'],
  variable: '--font-poppins',
  adjustFontFallback: true, // CRITICAL: Automatic fallback font metrics matching
});

export const metadata: Metadata = {
  title: 'KayanLive - Premier Event Management in Saudi Arabia, UAE & GCC',
  keywords: 'event management Dubai, event planning UAE, KayanLive, GCC events, Saudi Arabia events, live events, exhibitions, conferences, event company',
  metadataBase: new URL(process.env.NODE_ENV === 'production' ? 'https://kayanlive.com' : 'http://localhost:3001'),
  alternates: {
    canonical: '/',
    languages: {
      'en': '/en',
      'ar': '/ar',
      'fr': '/fr',
      'ru': '/ru',
      'zh': '/zh',
    },
  },
  openGraph: {
    title: 'KayanLive - Premier Event Management in Saudi Arabia, UAE & GCC',
    description: 'Leading event management company in Dubai and across the GCC. Delivering creativity, innovation, and execution for live events, exhibitions, conferences, and immersive experiences.',
    url: '/',
    siteName: 'KayanLive',
    locale: 'en',
    type: 'website',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'KayanLive - Premier Event Management in Saudi Arabia, UAE & GCC',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'KayanLive - Premier Event Management in Saudi Arabia, UAE & GCC',
    description: 'Leading event management company in Dubai and across the GCC. Delivering creativity, innovation, and execution for live events, exhibitions, conferences, and immersive experiences.',
    images: ['/og-image.jpg'],
  },
  icons: {
    icon: [
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon.ico', sizes: 'any' }
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }
    ],
    other: [
      { rel: 'android-chrome-192x192', url: '/android-chrome-192x192.png' },
      { rel: 'android-chrome-512x512', url: '/android-chrome-512x512.png' }
    ]
  },
  manifest: '/site.webmanifest',
};

export function generateViewport() {
  return {
    width: 'device-width',
    initialScale: 1,
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={poppins.variable}>
      <head>
        <meta name="description" content="Leading event management company in Dubai and across the GCC. Delivering creativity, innovation, and execution for live events, exhibitions, conferences, and immersive experiences." />

        {/* CRITICAL FIX: Priority resource hints for 100% performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />

        {/* CRITICAL FIX: Preload ultra-optimized hero images with precise sizes */}
        <link
          rel="preload"
          as="image"
          type="image/webp"
          href="/optimized/hero-main/01f5d49d03c8455dc99b2ad32446b6657b1949e0-hero-main-desktop.webp"
          media="(min-width: 1024px)"
          fetchPriority="high"
        />
        <link
          rel="preload"
          as="image"
          type="image/webp"
          href="/optimized/hero-main/01f5d49d03c8455dc99b2ad32446b6657b1949e0-hero-main-mobile.webp"
          media="(max-width: 1023px)"
          fetchPriority="high"
        />

        {/* CRITICAL FIX: Preload critical SVG to prevent CLS */}
        <link
          rel="preload"
          as="image"
          type="image/svg+xml"
          href="/assets/bac2af3eca424e14c720bab9f5fabec434faaa31.svg"
          media="(min-width: 1024px)"
        />

        {/* CRITICAL FIX: Font optimization CSS - prevent FOIT/FOUT */}
        <style dangerouslySetInnerHTML={{
          __html: `
            /* Ultra-optimized fallback font with precise metrics matching */
            @font-face {
              font-family: 'Poppins-Fallback';
              src: local('system-ui'), local('-apple-system'), local('BlinkMacSystemFont'), local('Segoe UI'), local('Arial');
              size-adjust: 107%; /* Precisely matched to Poppins */
              ascent-override: 105%;
              descent-override: 25%;
              line-gap-override: 0%;
            }

            /* Critical font loading optimization */
            .font-loading {
              font-family: 'Poppins-Fallback', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;
            }

            /* Critical rendering optimization */
            * {
              text-rendering: optimizeSpeed;
              -webkit-font-smoothing: antialiased;
              -moz-osx-font-smoothing: grayscale;
            }

            /* CRITICAL FIX: Prevent layout shift during font loading */
            .font-poppins {
              font-feature-settings: normal;
              font-variation-settings: normal;
            }

            /* Performance CSS: GPU acceleration for critical elements */
            .hero-container,
            .logo-carousel,
            .nav-container {
              transform: translateZ(0);
              will-change: auto;
            }

            /* Critical CSS: Prevent hydration mismatches */
            body {
              -webkit-text-size-adjust: 100%;
              text-size-adjust: 100%;
            }
          `
        }} />
      </head>
      <body className={`${poppins.className} overflow-x-hidden font-loading`} suppressHydrationWarning>
        <Providers>
          <TRPCReactProvider>
            {children}
          </TRPCReactProvider>
        </Providers>
      </body>
    </html>
  );
}