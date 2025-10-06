'use client';

import { memo } from 'react';
import { useTranslations } from 'next-intl';
import { StatisticsBoxesProps } from './types';

const StatisticsBoxes = memo<StatisticsBoxesProps>(({
  variant,
  position = {},
  locale = 'en'
}) => {
  const t = useTranslations();
  const isMobile = variant === 'mobile';

  const containerStyle = {
    ...position,
    ...(isMobile && {
      left: '50%',
      bottom: '75px',
      transform: 'translateX(-50%)'
    }),
    ...(!isMobile && {
      [locale === 'ar' ? 'right' : 'left']: '42px',
      bottom: '50px'
    })
  };

  const boxClasses = isMobile
    ? 'bg-white/10 backdrop-blur-md border border-white/20 rounded-lg px-3 py-2'
    : 'bg-white/10 backdrop-blur-md border border-white/20 rounded-xl px-6 py-4';

  const textClasses = isMobile
    ? 'text-white text-xs font-medium text-center whitespace-nowrap'
    : 'text-white text-lg font-semibold text-center whitespace-nowrap';

  const gap = isMobile ? 'gap-3' : 'gap-6';

  return (
    <div
      className={`absolute flex ${gap}`}
      style={containerStyle}
      role="group"
      aria-label="Company statistics"
    >
      <div className={boxClasses}>
        <div className={textClasses} dir={locale === 'ar' ? 'rtl' : 'ltr'}>
          {t('hero.stats.projects')}
        </div>
      </div>
      <div className={boxClasses}>
        <div className={textClasses} dir={locale === 'ar' ? 'rtl' : 'ltr'}>
          {t('hero.stats.founded')}
        </div>
      </div>
    </div>
  );
});

StatisticsBoxes.displayName = 'StatisticsBoxes';

export default StatisticsBoxes;