'use client';

import { useTranslations, useLocale } from 'next-intl';

export default function ClientsPartnersContent() {
  const t = useTranslations('clientsPartners.content');
  const locale = useLocale();
  return (
    <div className="w-full py-8 md:py-16 lg:py-20">
      <div className="mx-auto px-4 md:px-6" style={{ maxWidth: 'min(1340px, calc(100vw - 172px))' }}>
        
        {/* Main Content Paragraphs */}
        <div className="mb-8 md:mb-12 lg:mb-16">
          <div
            className="text-center w-full"
            style={{
              fontFamily: '"Poppins", sans-serif',
              fontSize: 'clamp(1.1rem, 2.2vw, 1.5rem)',
              lineHeight: 'clamp(1.6rem, 3vw, 2.1rem)',
              color: 'rgba(35,31,32,0.73)'
            }}
            dir={locale === 'ar' ? 'rtl' : 'ltr'}
          >
            <p className="mb-6 md:mb-8">
              <span>
                {t('description1')}{" "}
              </span>
              <span className="font-bold" style={{ color: 'rgba(44,44,43,0.73)' }}>
                {t('eventManagementCompany')}
              </span>
              <span>
                {t('description2')}
              </span>
            </p>

            <p className="mb-0">
              {t('description3')}
            </p>
          </div>
        </div>

        {/* Highlighted Text */}
        <div className="text-center w-full">
          <p
            className="font-bold mb-0"
            style={{
              fontFamily: '"Poppins", sans-serif',
              fontSize: 'clamp(1.1rem, 2.2vw, 1.5rem)',
              lineHeight: 'clamp(1.6rem, 3vw, 2.1rem)',
              color: 'rgba(35,31,32,0.73)'
            }}
            dir={locale === 'ar' ? 'rtl' : 'ltr'}
          >
{t('testimonial')}
          </p>
        </div>
      </div>
    </div>
  );
}