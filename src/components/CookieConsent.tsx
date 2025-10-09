'use client';

import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { useCookieConsent } from '@/hooks/useCookieConsent';
import { Cookie } from 'lucide-react';

export default function CookieConsent() {
  const t = useTranslations('cookies');
  const { showBanner, acceptAll, rejectAll, openPreferences, isLoading } = useCookieConsent();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (showBanner && !isLoading) {
      // Delay visibility to trigger animation
      const timer = setTimeout(() => setIsVisible(true), 100);
      return () => clearTimeout(timer);
    } else {
      setIsVisible(false);
    }
  }, [showBanner, isLoading]);

  if (!showBanner || isLoading) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/40 backdrop-blur-sm z-[9998] transition-opacity duration-300 ${
          isVisible ? 'opacity-100' : 'opacity-0'
        }`}
        aria-hidden="true"
      />

      {/* Banner */}
      <div
        role="dialog"
        aria-labelledby="cookie-consent-title"
        aria-describedby="cookie-consent-description"
        className={`fixed bottom-0 left-0 right-0 z-[9999] transition-transform duration-500 ease-out ${
          isVisible ? 'translate-y-0' : 'translate-y-full'
        }`}
      >
        <div className="max-w-[1600px] mx-auto px-4 pb-6">
          <div className="bg-gradient-to-br from-[#2c2c2b] via-[#1a1a1a] to-[#2c2c2b] rounded-2xl shadow-2xl border border-[#3a3a3a] overflow-hidden">
            {/* Accent gradient line */}
            <div className="h-1 bg-gradient-to-r from-[#a095e1] via-[#7afdd6] to-[#74cfaa]" />

            <div className="p-6 md:p-8">
              <div className="flex flex-col lg:flex-row lg:items-center gap-6">
                {/* Icon and Content */}
                <div className="flex-1 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-r from-[#7afdd6] to-[#74cfaa] flex items-center justify-center">
                      <Cookie className="w-5 h-5 text-[#2c2c2b]" />
                    </div>
                    <h2
                      id="cookie-consent-title"
                      className="text-xl md:text-2xl font-bold text-white"
                      style={{ fontFamily: '"Poppins", sans-serif' }}
                    >
                      {t('banner.title')}
                    </h2>
                  </div>

                  <p
                    id="cookie-consent-description"
                    className="text-[#c3c3c3] text-sm md:text-base leading-relaxed"
                  >
                    {t('banner.description')}
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row lg:flex-col xl:flex-row gap-3 lg:min-w-[280px]">
                  <button
                    onClick={acceptAll}
                    className="flex-1 bg-gradient-to-r from-[#7afdd6] to-[#74cfaa] hover:from-[#6ee8c5] hover:to-[#68e09f] text-[#2c2c2b] font-semibold px-6 py-3 rounded-full transition-all duration-300 shadow-lg hover:shadow-[#7afdd6]/20 hover:scale-105"
                    style={{ fontFamily: '"Poppins", sans-serif' }}
                  >
                    {t('banner.acceptAll')}
                  </button>

                  <button
                    onClick={rejectAll}
                    className="flex-1 bg-[#3a3a3a] hover:bg-[#4a4a4a] text-white font-semibold px-6 py-3 rounded-full transition-all duration-300 border border-[#5a5a5a] hover:border-[#7afdd6]"
                    style={{ fontFamily: '"Poppins", sans-serif' }}
                  >
                    {t('banner.rejectAll')}
                  </button>

                  <button
                    onClick={openPreferences}
                    className="sm:col-span-2 lg:col-span-1 xl:col-span-2 bg-transparent hover:bg-[#3a3a3a] text-[#7afdd6] font-semibold px-6 py-3 rounded-full transition-all duration-300 border border-[#7afdd6] hover:border-[#6ee8c5]"
                    style={{ fontFamily: '"Poppins", sans-serif' }}
                  >
                    {t('banner.customize')}
                  </button>
                </div>
              </div>

              {/* Legal footer */}
              <div className="mt-4 pt-4 border-t border-[#3a3a3a]">
                <p className="text-xs text-[#888888] text-center">
                  {t('legal.gdprCompliance')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
