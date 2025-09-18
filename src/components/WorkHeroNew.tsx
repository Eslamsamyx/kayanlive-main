'use client';

import { useTranslations } from 'next-intl';
import HeroTemplate from './HeroTemplate';

export default function WorkHeroNew() {
  const t = useTranslations('work.hero');

  return (
    <HeroTemplate
      ariaLabel={t('ariaLabel')}
      // Mobile content
      mobileTitle={t('title')}
      mobileSubtitleGradient={[t('subtitle1')]}
      mobileSubtitleWhite={t('subtitle2')}
      mobileBodyParagraphs={[
        t('description'),
        t('impactStatement'),
        t('processDescription')
      ]}
      // Desktop content
      desktopTitle={t('title')}
      desktopScreenReaderTitle={`KayanLive ${t('title')}`}
      desktopSubtitleGradient={t('subtitle1')}
      desktopSubtitleWhite={t('subtitle2')}
      desktopBodyParagraphs={[
        t('description'),
        t('impactStatement'),
        t('processDescription')
      ]}
    />
  );
}