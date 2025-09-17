'use client';

import { useTranslations } from 'next-intl';

export default function WorkStatement() {
  const t = useTranslations('work.statement');
  return (
    <div className="bg-[#f0f1fa] w-full py-16 md:py-20 lg:py-24">
      <div 
        className="max-w-[1200px] mx-auto px-6 md:px-8 lg:px-10 text-center capitalize font-medium"
        style={{ 
          fontSize: 'clamp(1.2rem, 2.3vw, 35px)',
          color: 'rgba(35,31,32,0.73)'
        }}
      >
        <p className="mb-6" style={{ lineHeight: 'clamp(1.5rem, 2.8vw, 43px)' }}>
          {t('description')}
        </p>
        <p className="mb-0" style={{ lineHeight: 'clamp(1.5rem, 2.8vw, 43px)' }}>
          <span>{t('promise')} </span>
          <span className="font-bold text-[#231f20]">{t('commitment')}</span>
        </p>
      </div>
    </div>
  );
}