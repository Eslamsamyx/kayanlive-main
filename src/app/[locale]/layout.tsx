import type { Metadata } from 'next';
import { Poppins } from 'next/font/google';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { TRPCReactProvider } from '@/trpc/react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import CustomCursor from '@/components/CustomCursor';
import '@/styles/globals.css';

const poppins = Poppins({ 
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800', '900']
});

export const metadata: Metadata = {
  title: 'KayanLive - Live Streaming Platform',
  description: 'Your premium live streaming platform',
};

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  
  // Load messages for the current locale
  let messages;
  try {
    messages = await getMessages();
  } catch (error) {
    console.error('Failed to load messages:', error);
    messages = {};
  }

  return (
    <html lang={locale} dir={locale === 'ar' ? 'rtl' : 'ltr'}>
      <body className={poppins.className} suppressHydrationWarning>
        <NextIntlClientProvider messages={messages} locale={locale}>
          <TRPCReactProvider>
            <CustomCursor />
            <div className="min-h-screen bg-white">
              <div className="fixed top-0 left-0 right-0 z-50">
                <div className="max-w-[1600px] mx-auto px-4 py-4">
                  <Navbar locale={locale} />
                </div>
              </div>
              <main className="pt-32">
                <div className="max-w-[1600px] mx-auto px-4">
                  {children}
                </div>
              </main>
              <Footer />
            </div>
          </TRPCReactProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}