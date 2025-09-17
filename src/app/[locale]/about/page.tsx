'use client';

import { useTranslations } from 'next-intl';
import AboutHero from '@/components/AboutHero';
import AboutOrigin from '@/components/AboutOrigin';
import AboutValues from '@/components/AboutValues';
import CallToActionBanner from '@/components/CallToActionBanner';

export default function AboutUsPage() {
  const t = useTranslations('about.page');

  return (
    <div>
      {/* Hero Section - Figma Design */}
      <div className="mx-4 md:mx-8 lg:mx-0">
        <AboutHero />
      </div>

      {/* Origin Section - Figma Design */}
      <div className="-mx-4">
        <AboutOrigin />
      </div>

      {/* Values Section - Figma Design */}
      <div className="-mx-4">
        <AboutValues />
      </div>

      {/* How We Work Section */}
      <div className="-mx-4">
        <CallToActionBanner
          title={t('title')}
          subtitle={t('subtitle')}
          description={t('description')}
          buttonText={t('buttonText')}
          buttonHref="/contact"
          topPadding="pt-24"
          bottomPadding="pb-24"
        />
      </div>
    </div>
  );
}