'use client';

import { useTranslations } from 'next-intl';
import AboutHeroNew from '@/components/AboutHeroNew';
import AboutOrigin from '@/components/AboutOrigin';
import AboutValues from '@/components/AboutValues';
import CallToActionBanner from '@/components/CallToActionBanner';

export default function AboutUsPage() {
  const t = useTranslations('about.page');

  return (
    <div>
      {/* Hero Section - Figma Design */}
      <div className="mx-4 md:mx-8 lg:mx-0">
        <AboutHeroNew />
      </div>

      {/* Origin Section - Figma Design - Full Width */}
      <div className="w-screen relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw]">
        <AboutOrigin />
      </div>

      {/* Values Section - Figma Design */}
      <AboutValues />

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