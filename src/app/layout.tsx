import type { Metadata } from 'next';
import { Poppins } from 'next/font/google';
import { TRPCReactProvider } from '@/trpc/react';
import { Providers } from '@/components/Providers';
import '@/styles/globals.css';

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '600'], // Only critical weights
  display: 'swap', // Use swap for better performance
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
        {/* Google Tag Manager */}
        <script dangerouslySetInnerHTML={{
          __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-P9X25HCJ');`
        }} />
        {/* End Google Tag Manager */}

        <meta name="description" content="Leading event management company in Dubai and across the GCC. Delivering creativity, innovation, and execution for live events, exhibitions, conferences, and immersive experiences." />

        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />

        <link
          rel="preload"
          as="image"
          type="image/webp"
          href="/optimized/hero/aeb93871393e6e48280518ae29c12c43432c5df9-hero-main-bg.webp"
          fetchPriority="high"
        />

        <style dangerouslySetInnerHTML={{
          __html: `
            body {
              font-family: var(--font-poppins, system-ui, -apple-system, sans-serif);
              -webkit-font-smoothing: antialiased;
              -moz-osx-font-smoothing: grayscale;
            }
            .hero-container { contain: layout style paint; }
            img { content-visibility: auto; }
          `
        }} />
      </head>
      <body className={`${poppins.className} overflow-x-hidden font-loading`} suppressHydrationWarning>
        {/* Google Tag Manager (noscript) */}
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-P9X25HCJ"
            height="0"
            width="0"
            style={{ display: 'none', visibility: 'hidden' }}
          />
        </noscript>
        {/* End Google Tag Manager (noscript) */}
        <Providers>
          <TRPCReactProvider>
            {children}
          </TRPCReactProvider>
        </Providers>
      </body>
    </html>
  );
}