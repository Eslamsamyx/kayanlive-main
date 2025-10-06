'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useTranslations, useLocale } from 'next-intl';

// Assets from Figma - Optimized WebP images
const imgRectangle4241 = "/optimized/work/a3b5baba83b75945699bcee9522e99831a9f57a2-work-outcomes-1.webp";
const imgRectangle4240 = "/optimized/work/a420f3b3a1dde22b002e1620b473ca2e9e6fdbe5-work-outcomes-2.webp";
const imgEllipse3625 = "/assets/60821832f15b930b8fe851aa226b08c11f1ef46b.svg";
const imgMdiTwitter = "/assets/def48b10f3af85b72c9c1340300144e654a156e1.svg";
const imgLogosFacebook = "/assets/69e31bfddbf7233cc0877c3ef5b4edc8be21a2aa.svg";
const imgIcomoonFreeLinkedin2 = "/assets/29c078eff0cb9c150c3699b142068664db1faceb.svg";
const imgSkillIconsInstagram = "/assets/83fa7d33c676fd60c6236412ca0aa58eee80b908.svg";

// Mobile Assets - using the same images from Figma mobile design - Optimized WebP
const imgRectangle4246 = "/optimized/work/425c425068870bb86ed7e8c38ffc7b92e6e39a67-work-mobile-1.webp";
const imgRectangle4247 = "/optimized/work/98504c47236d5a98548c64c0e3cb4305deab026d-work-mobile-2.webp";

export default function WorkOutcomes() {
  const t = useTranslations('work.outcomes');
  const locale = useLocale();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Prevent hydration mismatch
  if (!mounted) {
    return null;
  }

  return (
    <div className="bg-white w-full">
      {/* Mobile Layout (< 1024px) - Simplified breakpoint */}
      <div className="lg:hidden py-10">
        <div className="flex flex-col gap-10 items-center justify-center px-6">
          {/* Title Section */}
          <div className="capitalize flex flex-col gap-3 items-center justify-center text-center w-full max-w-[321px]">
            <div style={{
              fontFamily: '"Poppins", sans-serif',
              fontSize: 'clamp(40px, 8vw, 50px)',
              lineHeight: 'clamp(42px, 8vw, 52px)',
              letterSpacing: '-2px',
              color: '#2c2c2b'
            }}
            dir={locale === 'ar' ? 'rtl' : 'ltr'}>
              <p className="mb-0">{t('title.measurable')}</p>
              <p>{t('title.outcomes')}</p>
            </div>
            <div
              className="bg-clip-text bg-gradient-to-r from-[#a095e1] to-[#74cfaa] w-full"
              style={{
                fontFamily: '"Poppins", sans-serif',
                fontSize: 'clamp(45px, 9vw, 55px)',
                lineHeight: 'clamp(48px, 9vw, 58px)',
                letterSpacing: '-2.2px',
                WebkitTextFillColor: 'transparent',
                paddingTop: '4px',
                paddingBottom: '4px'
              }}
              dir={locale === 'ar' ? 'rtl' : 'ltr'}
            >
              <p>{t('title.realEnvironments')}</p>
            </div>
          </div>

          {/* First Image */}
          <div className="relative h-[226px] w-full max-w-[321px] rounded-[22px] overflow-hidden">
            <Image
              src={imgRectangle4246}
              alt={t('altTexts.showcase')}
              fill
              className="object-cover"
            />
          </div>

          {/* Text Content */}
          <div className="text-center w-full max-w-[321px]" style={{
            fontFamily: '"Poppins", sans-serif',
            fontSize: 'clamp(14px, 4vw, 16px)',
            lineHeight: 'clamp(18px, 5vw, 20px)',
            color: '#888888'
          }}
          dir={locale === 'ar' ? 'rtl' : 'ltr'}>
            <p className="mb-2">{t('mobileDescription')}</p>
            <p className="mb-0">{t('mobilePhilosophy')}</p>
          </div>

          {/* Second Image */}
          <div className="relative h-[226px] w-full max-w-[321px] rounded-[22px] overflow-hidden">
            <Image
              src={imgRectangle4247}
              alt={t('altTexts.showcase')}
              fill
              className="object-cover"
            />
          </div>
        </div>
      </div>

      {/* Desktop Layout (≥ 1024px) */}
      <div className="hidden lg:block">
        {/* Title Section */}
        <div className="max-w-7xl mx-auto px-4 lg:px-8 py-12 lg:py-20">
          <div className="text-center lg:text-left mb-12 lg:mb-16">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-center gap-4 lg:gap-12">
              {/* "Measurable Outcomes" */}
              <div
                className="font-medium text-[#2c2c2b]"
                style={{
                  fontFamily: '"Poppins", sans-serif',
                  fontSize: 'clamp(4rem, 6vw, 6.25rem)',
                  lineHeight: 'clamp(4rem, 6vw, 5.3rem)',
                  letterSpacing: 'clamp(-2px, -0.3vw, -4px)'
                }}
                dir={locale === 'ar' ? 'rtl' : 'ltr'}
              >
                <p className="mb-0">{t('title.measurable')}</p>
                <p>{t('title.outcomes')}</p>
              </div>

              {/* "Real Environments" */}
              <div
                className="bg-clip-text bg-gradient-to-r from-[#a095e1] to-[#74cfaa] font-medium lg:text-right"
                style={{
                  WebkitTextFillColor: 'transparent',
                  fontFamily: '"Poppins", sans-serif',
                  fontSize: 'clamp(4rem, 6vw, 6.25rem)',
                  lineHeight: 'clamp(4rem, 6vw, 5.3rem)',
                  letterSpacing: 'clamp(-2px, -0.3vw, -4px)'
                }}
                dir={locale === 'ar' ? 'rtl' : 'ltr'}
              >
                <p>{t('title.realEnvironments')}.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Content Layout - Flexible height with proper spacing */}
        <div className="relative min-h-[70vh] pb-16 lg:pb-24">
          {/* Left Image - touches left edge */}
          <div className="absolute left-0 top-0 w-[30vw] h-full min-h-[500px]">
            <div className="relative w-full h-full transform scale-y-[-1] rotate-180">
              <Image
                src={imgRectangle4241}
                alt={t('altTexts.showcase')}
                fill
                className="object-cover object-bottom"
              />
            </div>
          </div>

          {/* Right Image - touches right edge */}
          <div className="absolute right-0 top-0 w-[30vw] h-full min-h-[500px]">
            <div className="relative w-full h-full">
              <Image
                src={imgRectangle4240}
                alt={t('altTexts.showcase')}
                fill
                className="object-cover object-top"
              />

              {/* Social Icons Overlay */}
              <div className="absolute inset-0">
                {/* Decorative Circle Background */}
                <div className="absolute bottom-0 right-0 w-48 h-48 transform translate-x-8 translate-y-16 opacity-30 overflow-hidden">
                  <Image
                    src={imgEllipse3625}
                    alt=""
                    fill
                    className="object-contain"
                  />
                </div>

                {/* Social Icons */}
                <div className="absolute flex flex-col gap-4" style={{ bottom: '2rem', [locale === 'ar' ? 'left' : 'right']: '2rem' }}>
                  {/* Twitter */}
                  <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg">
                    <div className="w-6 h-6 relative">
                      <Image
                        src={imgMdiTwitter}
                        alt="Twitter"
                        fill
                        className="object-contain"
                      />
                    </div>
                  </div>

                  {/* Facebook */}
                  <div className="w-12 h-12 bg-white/80 rounded-full flex items-center justify-center shadow-lg transform rotate-12">
                    <div className="w-5 h-5 relative">
                      <Image
                        src={imgLogosFacebook}
                        alt="Facebook"
                        fill
                        className="object-contain"
                      />
                    </div>
                  </div>

                  {/* LinkedIn */}
                  <div className="w-12 h-12 bg-white/60 rounded-full flex items-center justify-center shadow-lg transform -rotate-6">
                    <div className="w-5 h-5 relative">
                      <Image
                        src={imgIcomoonFreeLinkedin2}
                        alt="LinkedIn"
                        fill
                        className="object-contain"
                      />
                    </div>
                  </div>

                  {/* Instagram */}
                  <div className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center shadow-lg transform rotate-6">
                    <div className="w-5 h-5 relative">
                      <Image
                        src={imgSkillIconsInstagram}
                        alt="Instagram"
                        fill
                        className="object-contain"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Center Text Content - Desktop with flexible height */}
          <div className="relative z-10 flex items-center justify-center min-h-[70vh] px-8 py-16">
            <div className="max-w-lg text-center">
              <div
                className="font-medium text-[#5A5A5A] leading-relaxed"
                style={{
                  fontFamily: '"Poppins", sans-serif',
                  fontSize: 'clamp(1.125rem, 1.5vw, 1.5rem)',
                  lineHeight: 'clamp(1.75rem, 2.25vw, 2rem)'
                }}
                dir={locale === 'ar' ? 'rtl' : 'ltr'}
              >
                <p className="mb-4">{t('description')}</p>

                <p className="mb-4">{t('philosophy')}</p>

                <p className="mb-0">{t('alignment')}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}