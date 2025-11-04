'use client';

import { usePathname } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import CookieConsentManager from '@/components/CookieConsentManager';

interface LocaleLayoutContentProps {
  children: React.ReactNode;
  locale: string;
}

export function LocaleLayoutContent({ children, locale }: LocaleLayoutContentProps) {
  const pathname = usePathname();
  const isDashboard = pathname?.includes('/dashboard');

  // Dashboard pages have their own layout, so we don't wrap them
  if (isDashboard) {
    return <>{children}</>;
  }

  // Regular pages get the navbar and footer
  return (
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
  );
}
