'use client';

import { useTranslations } from 'next-intl';
import HeroTemplate from './HeroTemplate';

export default function AboutHeroNew() {
  const t = useTranslations('about.hero');

  return (
    <HeroTemplate
      ariaLabel={t('ariaLabel')}
      // Mobile content
      mobileTitle={t('title')}
      mobileSubtitleGradient={[t('subtitle1')]}
      mobileSubtitleWhite={t('subtitle2')}
      mobileBodyParagraphs={[
        t('paragraph1Clean'),
        t('paragraph2Clean')
      ]}
      // Desktop content
      desktopTitle={t('title')}
      desktopScreenReaderTitle={`KayanLive ${t('title')}`}
      desktopSubtitleGradient={t('subtitle1')}
      desktopSubtitleWhite={t('subtitle2')}
      desktopBodyParagraphs={[
        t('paragraph1Clean'),
        t('paragraph2Clean')
      ]}
    />
  );
}