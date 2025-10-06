'use client';

import Image from 'next/image';
import { useTranslations, useLocale } from 'next-intl';
import { getMarkdownHTML } from '@/utils/markdownUtils';
import CTAButton from './CTAButton';

const imgPattern = "/optimized/wherewework/ef25fd14e49122ddd6cbc03c8a92caff93500eb7.webp";
const imgCheckmark = "/assets/d57e8b023cc2954fe2c89c41bd7f2153074ba9c1.svg";

export default function WhereWeWork() {
  const t = useTranslations();
  const locale = useLocale();

  return (
    <div className="bg-white w-full py-12 md:py-24">
      <div className="max-w-[1600px] mx-auto px-4 md:px-8 lg:px-20">
        {/* Title Section */}
        <div className="text-center mb-8 md:mb-12 lg:mb-16">
          <h2 className="text-[#2c2c2b] font-bold text-4xl md:text-5xl lg:text-6xl" style={{ fontFamily: '"Poppins", sans-serif' }} dir={locale === 'ar' ? 'rtl' : 'ltr'}>
            {t('whereWeWork.title')}
          </h2>
        </div>

        {/* Desktop Version - Top Section - Where We Work */}
        <div className="hidden md:flex justify-between gap-7 items-end mb-6 md:mb-12 lg:mb-16">
          {/* Left Column */}
          <div className="flex flex-col gap-[30px] flex-1 max-w-[543px]">
            {/* Description */}
            <p className="text-[#5A5A5A] text-[24px] leading-[32px] capitalize" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
              {t('whereWeWork.description')}
            </p>
          </div>

          {/* Right Column - Locations */}
          <div className="flex flex-col gap-6 flex-1 max-w-[697px]">
            <p className="text-[#5A5A5A] text-[24px] leading-[32px] capitalize" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
              {t('whereWeWork.operateText')}
            </p>
            
            {/* Location Items */}
            <div className="flex flex-col gap-4">
              <div className={`flex items-center ${locale === 'ar' ? 'flex-row-reverse' : ''} gap-[9px]`}>
                <Image src={imgCheckmark} alt="" className="w-[30px] h-[30px]" width={30} height={30} />
                <p className="text-[24px] leading-[32px] capitalize" dir={locale === 'ar' ? 'rtl' : 'ltr'}
                  dangerouslySetInnerHTML={getMarkdownHTML(t('whereWeWork.saudi'))}
                />
              </div>

              <div className={`flex items-center ${locale === 'ar' ? 'flex-row-reverse' : ''} gap-[9px]`}>
                <Image src={imgCheckmark} alt="" className="w-[30px] h-[30px]" width={30} height={30} />
                <p className="text-[24px] leading-[32px] capitalize" dir={locale === 'ar' ? 'rtl' : 'ltr'}
                  dangerouslySetInnerHTML={getMarkdownHTML(t('whereWeWork.uae'))}
                />
              </div>

              <div className={`flex items-start ${locale === 'ar' ? 'flex-row-reverse' : ''} gap-[9px]`}>
                <Image src={imgCheckmark} alt="" className="w-[30px] h-[30px] mt-[2px]" width={30} height={30} />
                <p className="text-[24px] leading-[32px] capitalize" dir={locale === 'ar' ? 'rtl' : 'ltr'}
                  dangerouslySetInnerHTML={getMarkdownHTML(t('whereWeWork.partners'))}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Version - True Single Column Layout matching reference exactly */}
        <section className="md:hidden flex flex-col gap-[31px] items-start px-[27px] mb-6 md:mb-12 lg:mb-16">
          {/* Description - Mobile version */}
          <div className="text-[#5A5A5A] text-[16px] leading-[20px] w-full capitalize" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
            {t('whereWeWork.description')}
          </div>

          {/* GCC Section Header - As next item in single column */}
          <div className="text-[#5A5A5A] text-[20px] leading-[20px] capitalize w-full" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
            {t('whereWeWork.operateText')}
          </div>
          
          {/* Location Item 1 - As next item in single column */}
          <div className={`flex gap-[9px] items-center justify-start w-full ${locale === 'ar' ? 'flex-row-reverse' : ''}`}>
            <div className="relative shrink-0 size-[25px]">
              <Image src={imgCheckmark} alt="" className="block max-w-none size-full" width={25} height={25} />
            </div>
            <div className="text-[#231f20] text-[18px] leading-[20px] capitalize flex-1" dir={locale === 'ar' ? 'rtl' : 'ltr'}
              dangerouslySetInnerHTML={getMarkdownHTML(t('whereWeWork.saudi'))}
            />
          </div>

          {/* Location Item 2 - As next item in single column */}
          <div className={`flex gap-[9px] items-center justify-start w-full ${locale === 'ar' ? 'flex-row-reverse' : ''}`}>
            <div className="relative shrink-0 size-[25px]">
              <Image src={imgCheckmark} alt="" className="block max-w-none size-full" width={25} height={25} />
            </div>
            <div className="text-[#231f20] text-[18px] leading-[20px] capitalize flex-1" dir={locale === 'ar' ? 'rtl' : 'ltr'}
              dangerouslySetInnerHTML={getMarkdownHTML(t('whereWeWork.uae'))}
            />
          </div>

          {/* Location Item 3 - As next item in single column */}
          <div className={`flex gap-[9px] items-start justify-start w-full ${locale === 'ar' ? 'flex-row-reverse' : ''}`}>
            <div className="relative shrink-0 size-[25px]">
              <Image src={imgCheckmark} alt="" className="block max-w-none size-full" width={25} height={25} />
            </div>
            <div className="text-[#231f20] text-[18px] leading-[20px] capitalize flex-1" dir={locale === 'ar' ? 'rtl' : 'ltr'}
              dangerouslySetInnerHTML={getMarkdownHTML(t('whereWeWork.partners'))}
            />
          </div>
        </section>

        {/* Bottom Section - CTA Banner - Responsive */}
        <div
          className="relative overflow-hidden rounded-[25px] md:rounded-[48px]"
          style={{
            height: '418px',
            background: 'linear-gradient(135deg, #a095e1 0%, #74cfaa 100%)'
          }}
        >
          {/* Pattern Overlay - Bottom Right - Hidden on mobile for cleaner look */}
          <div
            className="absolute hidden md:block"
            style={{
              width: '749px',
              height: '757px',
              right: '-50px',
              bottom: '-223px'
            }}
          >
            <div
              className="w-full h-full bg-center bg-cover opacity-10"
              style={{
                backgroundImage: `url('${imgPattern}')`
              }}
            />
          </div>

          {/* Diamond Shape - Left - Hidden on mobile */}
          <div
            className="absolute hidden md:block"
            style={{
              width: '614px',
              height: '614px',
              left: '-242px',
              top: '50%',
              transform: 'translateY(-50%)'
            }}
          >
            <div
              className="w-[434px] h-[434px] bg-white/20 absolute top-1/2 left-1/2"
              style={{
                transform: 'translate(-50%, -50%) rotate(45deg)'
              }}
            />
          </div>

          {/* Mobile Pattern - Top pattern transparent, bottom pattern 100% white */}
          <div className="md:hidden absolute flex h-[373.706px] items-center justify-center translate-x-[-50%] translate-y-[-50%] w-[373.706px]" style={{ top: "calc(50% - 221.641px)", left: "calc(50% + 0.359px)" }}>
            <div className="flex-none rotate-[315deg]">
              <div className="bg-[rgba(255,255,255,0.2)] size-[264.258px]" />
            </div>
          </div>

          <div className="md:hidden absolute bottom-[-125.5px] flex h-[319px] items-center justify-center translate-x-[-50%] w-[315px]" style={{ left: "calc(50% + 20px)" }}>
            <div className="flex-none">
              <div
                className="bg-center bg-cover bg-no-repeat h-[315px] w-[319px]"
                style={{
                  backgroundImage: `url('${imgPattern}')`,
                  filter: 'brightness(0) invert(1)',
                  opacity: '1'
                }}
              />
            </div>
          </div>

          {/* Desktop Pattern - Right Side - From Figma */}
          <div className="absolute hidden md:flex bottom-[-223px] h-[757px] items-center justify-center right-[50px] w-[500px] z-0 overflow-visible">
            <div className="flex-none">
              <div
                className="bg-center bg-cover bg-no-repeat h-[749px] w-[757px]"
                style={{
                  backgroundImage: `url('${imgPattern}')`,
                  filter: 'brightness(0) invert(1)',
                  opacity: '0.3'
                }}
              />
            </div>
          </div>

          {/* Content - Responsive */}
          <div className="absolute left-4 md:left-[137px] top-1/2 -translate-y-1/2 w-[calc(100%-2rem)] md:w-[700px] flex flex-col gap-[24px] md:gap-[32px] z-30">
            <h2
              className="text-white text-center md:text-left heading-overflow-safe"
              style={{
                fontSize: 'clamp(1.25rem, 4vw, 2.25rem)',
                lineHeight: 'clamp(1.3, 5vw, 1.4)',
                maxWidth: '100%',
                margin: '0 auto'
              }}
              dir={locale === 'ar' ? 'rtl' : 'ltr'}
              dangerouslySetInnerHTML={getMarkdownHTML(t('whereWeWork.question'))}
            />

            {/* CTA Button - Responsive */}
            <div className="flex justify-center md:justify-start">
              <CTAButton
                variant="white"
                href={`/${locale}/contact`}
                ariaLabel={t('whereWeWork.cta')}
              >
                {t('whereWeWork.cta')}
              </CTAButton>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}