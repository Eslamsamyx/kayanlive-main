'use client';

import { useTranslations } from 'next-intl';
import HeroTemplate from './HeroTemplate';

export default function ContactHero() {
  const t = useTranslations('contact.hero');

  return (
    <HeroTemplate
      ariaLabel={t('ariaLabel')}
      mobileTitle={t('mobileTitle')}
      mobileSubtitleGradient={t.raw('mobileSubtitleGradient') as string[]}
      mobileSubtitleWhite={t('mobileSubtitleWhite')}
      mobileBodyParagraphs={t.raw('mobileBodyParagraphs') as string[]}
      desktopTitle={t('desktopTitle')}
      desktopScreenReaderTitle={t('desktopScreenReaderTitle')}
      desktopSubtitleGradient={t('desktopSubtitleGradient')}
      desktopSubtitleWhite={t('desktopSubtitleWhite')}
      desktopBodyParagraphs={t.raw('desktopBodyParagraphs') as string[]}
    />
  );
}