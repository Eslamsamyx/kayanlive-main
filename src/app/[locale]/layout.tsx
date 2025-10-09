import type { Metadata } from 'next';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getTranslations } from 'next-intl/server';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import CookieConsentManager from '@/components/CookieConsentManager';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'metadata' });

  return {
    title: t('title'),
    description: t('description'),
    keywords: t('keywords'),
    openGraph: {
      title: t('title'),
      description: t('description'),
      locale: locale,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: t('title'),
      description: t('description'),
    },
  };
}

export default async function LocaleLayout({
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
    console.log(`📋 Layout: loading messages for locale="${locale}"`);
    messages = await getMessages({ locale });
  } catch (error) {
    console.error('Failed to load messages:', error);
    messages = {};
  }

  return (
    <NextIntlClientProvider messages={messages} locale={locale}>
      <div className="min-h-screen bg-white overflow-x-hidden">
          <div className="fixed top-0 left-0 right-0 z-50">
          <div className="max-w-[1600px] mx-auto px-4 py-4">
            <Navbar locale={locale} />
          </div>
        </div>
        <main className="pt-32 overflow-x-hidden">
          <div className="max-w-[1600px] mx-auto px-4">
            {children}
          </div>
        </main>
        <Footer />
        <CookieConsentManager />
      </div>
    </NextIntlClientProvider>
  );
}