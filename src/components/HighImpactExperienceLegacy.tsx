'use client';

import React from 'react';
import { useTranslations, useLocale } from 'next-intl';
import Image from 'next/image';

const imgKayanLogo = "/assets/823c27de600ccd2f92af3e073c8e10df3a192e5c.png";

export default function HighImpactExperienceLegacy() {
  const t = useTranslations();
  const locale = useLocale();
  const isRTL = locale === 'ar';

  return (
    <div className="bg-white py-12 sm:py-16 md:py-20 lg:py-24">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-8 md:px-12 lg:px-20">

        {/* Mobile Layout */}
        <div className="block lg:hidden">
          <div className="text-center mb-8">
            {/* KayanLive Logo */}
            <div className="flex justify-center mb-8">
              <div className="relative w-[160px] h-[53px]">
                <Image
                  src={imgKayanLogo}
                  alt="KayanLive Logo"
                  fill
                  className="object-contain"
                  style={{ filter: 'brightness(0.2)' }} // Dark version of logo
                />
              </div>
            </div>

            {/* Main Content */}
            <div className="space-y-6">
              <h2
                className="text-[#2c2c2b] font-semibold leading-tight"
                style={{
                  fontSize: 'clamp(20px, 5vw, 28px)',
                  lineHeight: 'clamp(26px, 6vw, 36px)'
                }}
              >
                {t('highImpact.title')}
              </h2>

              <p
                className="text-[#666666] leading-relaxed"
                style={{
                  fontSize: 'clamp(16px, 3.5vw, 20px)',
                  lineHeight: 'clamp(22px, 4.5vw, 28px)'
                }}
              >
                {t('highImpact.subtitle')}
              </p>
            </div>
          </div>

          {/* Mobile Testimonial */}
          <div className="bg-[#f8f9fa] rounded-2xl p-6 border-l-4 border-[#74cfaa]">
            <blockquote className="mb-4">
              <p
                className="text-[#2c2c2b] font-medium italic"
                style={{
                  fontSize: 'clamp(16px, 3.5vw, 18px)',
                  lineHeight: 'clamp(22px, 4.5vw, 26px)'
                }}
              >
                "{t('highImpact.testimonial')}"
              </p>
            </blockquote>
            <cite
              className="text-[#74cfaa] font-semibold not-italic"
              style={{ fontSize: 'clamp(14px, 3vw, 16px)' }}
            >
              — {t('highImpact.testimonialAuthor')}
            </cite>
          </div>
        </div>

        {/* Desktop Layout */}
        <div className="hidden lg:block">
          <div className="grid grid-cols-12 gap-8 items-center">

            {/* Left Side - Logo */}
            <div className={`${isRTL ? 'col-span-4 order-2' : 'col-span-4 order-1'} flex justify-center`}>
              <div className="relative w-[240px] h-[80px]">
                <Image
                  src={imgKayanLogo}
                  alt="KayanLive Logo"
                  fill
                  className="object-contain"
                  style={{ filter: 'brightness(0.2)' }} // Dark version of logo
                />
              </div>
            </div>

            {/* Right Side - Content */}
            <div className={`${isRTL ? 'col-span-8 order-1 text-right' : 'col-span-8 order-2 text-left'}`}>
              <div className="space-y-8">
                {/* Main Content */}
                <div className="space-y-6">
                  <h2
                    className="text-[#2c2c2b] font-semibold leading-tight max-w-4xl"
                    style={{
                      fontSize: 'clamp(28px, 3.5vw, 42px)',
                      lineHeight: 'clamp(36px, 4.5vw, 54px)'
                    }}
                  >
                    {t('highImpact.title')}
                  </h2>

                  <p
                    className="text-[#666666] leading-relaxed max-w-3xl"
                    style={{
                      fontSize: 'clamp(18px, 1.8vw, 24px)',
                      lineHeight: 'clamp(26px, 2.6vw, 36px)'
                    }}
                  >
                    {t('highImpact.subtitle')}
                  </p>
                </div>

                {/* Desktop Testimonial */}
                <div className="bg-[#f8f9fa] rounded-2xl p-8 border-l-4 border-[#74cfaa] max-w-4xl">
                  <blockquote className="mb-4">
                    <p
                      className="text-[#2c2c2b] font-medium italic"
                      style={{
                        fontSize: 'clamp(18px, 2vw, 24px)',
                        lineHeight: 'clamp(26px, 2.8vw, 34px)'
                      }}
                    >
                      "{t('highImpact.testimonial')}"
                    </p>
                  </blockquote>
                  <cite
                    className="text-[#74cfaa] font-semibold not-italic"
                    style={{ fontSize: 'clamp(16px, 1.6vw, 20px)' }}
                  >
                    — {t('highImpact.testimonialAuthor')}
                  </cite>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}