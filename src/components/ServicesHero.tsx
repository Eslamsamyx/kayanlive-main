'use client';

import { useTranslations } from 'next-intl';
import HeroTemplate from './HeroTemplate';

export default function ServicesHero() {
  const t = useTranslations('services.hero');

  return (
    <HeroTemplate
      ariaLabel={t('ariaLabel')}
      mobileTitle={t('title')}
      mobileSubtitleGradient={t('subtitleGradient').split('. ')}
      mobileSubtitleWhite={t('subtitleWhite')}
      mobileBodyParagraphs={[
        t('bodyParagraph1'),
        "",
        t('bodyParagraph2')
      ]}
      desktopTitle={t('title')}
      desktopScreenReaderTitle={t('screenReaderTitle')}
      desktopSubtitleGradient={t('subtitleGradient')}
      desktopSubtitleWhite={t('subtitleWhite')}
      desktopBodyParagraphs={[
        t('bodyParagraph1'),
        "",
        t('bodyParagraph2')
      ]}
    />
  );
}