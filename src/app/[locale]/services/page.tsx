'use client';

import { useTranslations } from 'next-intl';
import ServicesHero from '@/components/ServicesHero';
import ServicesGrid from '@/components/ServicesGrid';
import ExperienceCenters from '@/components/ExperienceCenters';
import CallToActionBanner from '@/components/CallToActionBanner';

export default function ServicesPage() {
  const t = useTranslations('services.callToAction');

  return (
    <div>
      {/* Services Hero Section - Using same design as About page */}
      <div className="mb-6 md:mb-12 lg:mb-16">
        <ServicesHero />
      </div>

      {/* Services Grid - Figma Design */}
      <div className="mb-8 md:mb-12 lg:mb-16">
        <ServicesGrid />
      </div>

      {/* Experience Centers and Permanent Installations */}
      <div className="mb-8 md:mb-12 lg:mb-16">
        <ExperienceCenters />
      </div>


      {/* Not Sure Where To Start Section - Optimized spacing */}
      <div className="-mx-4">
        <div className="bg-white w-full py-12 md:py-16">
          <div className="max-w-[1600px] mx-auto px-4 md:px-8 lg:px-20">
            {/* Custom styled title that should remain */}
            <div className="text-center mb-6">
              <h1 
                className="font-bold text-[48px] md:text-[68px] lg:text-[90px] leading-[52px] md:leading-[74px] lg:leading-[85px] capitalize tracking-[-2.7px]"
                style={{
                  fontFamily: "'FONTSPRING DEMO - Visby CF Demi Bold', sans-serif"
                }}
              >
                <span 
                  style={{
                    background: 'linear-gradient(to right, #a095e1, #74cfaa)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text'
                  }}
                >
                  {t('title').split(' ').slice(0, 3).join(' ')}{' '}
                </span>
                <span className="text-[#2c2c2b]">
                  {t('title').split(' ').slice(3).join(' ')}
                </span>
              </h1>
            </div>
          </div>
        </div>
        
        {/* Use CallToActionBanner for the actual CTA */}
        <CallToActionBanner
          title=""
          subtitle={t('subtitle')}
          buttonText={t('buttonText')}
          topPadding="pt-0"
          bottomPadding="pb-12 md:pb-16"
        />
      </div>
    </div>
  );
}