'use client';

import { useTranslations, useLocale } from 'next-intl';
import { getMarkdownHTML } from '@/utils/markdownUtils';
import AnimatedServiceCard from './AnimatedServiceCard';
import AnimatedServiceContent from './AnimatedServiceContent';
import CTAButton from './CTAButton';

const imgEventPhoto = "/assets/29064c5a0d86395e45b642fe4e6daf670490f723.png";
const imgKayanLogo = "/assets/823c27de600ccd2f92af3e073c8e10df3a192e5c.png";

export default function AboutServices() {
  const t = useTranslations();
  const locale = useLocale();

  return (
    <div className="bg-[#f3f3f3] w-full py-12 sm:py-16 md:py-20">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-8 md:px-12 lg:px-20">
        {/* Company Description */}
        <div className="text-center mb-6 md:mb-12 lg:mb-16 overflow-safe">
          <p className="text-[#888888] mb-6 sm:mb-8" style={{ fontSize: 'clamp(18px, 4vw, 32px)', lineHeight: 'clamp(24px, 5vw, 40px)' }}
            dangerouslySetInnerHTML={getMarkdownHTML(t('aboutServices.description1'))}
          />

          <p className="text-[#888888] mb-6 sm:mb-8" style={{ fontSize: 'clamp(18px, 4vw, 32px)', lineHeight: 'clamp(24px, 5vw, 40px)' }}
            dangerouslySetInnerHTML={getMarkdownHTML(t('aboutServices.description2'))}
          />

          <p className="text-[#888888] mb-6 sm:mb-8" style={{ fontSize: 'clamp(18px, 4vw, 32px)', lineHeight: 'clamp(24px, 5vw, 40px)' }}
            dangerouslySetInnerHTML={getMarkdownHTML(t('aboutServices.description3'))}
          />

          <p className="text-[#888888]" style={{ fontSize: 'clamp(18px, 4vw, 32px)', lineHeight: 'clamp(24px, 5vw, 40px)' }}
            dangerouslySetInnerHTML={getMarkdownHTML(t('aboutServices.description4'))}
          />
        </div>

        {/* Service Cards - Full width between navbar edges */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {/* Live Events Card with Image */}
          <AnimatedServiceCard delay={0}>
            <div
              className="bg-[#7afdd6] rounded-[40px] overflow-hidden relative min-h-[300px] lg:h-[491px]"
            >
            <AnimatedServiceContent isImage={true} className="absolute inset-0">
              <div
                className="w-full h-full bg-center bg-cover bg-no-repeat"
                style={{ backgroundImage: `url('${imgEventPhoto}')` }}
              />
            </AnimatedServiceContent>

            {/* Glassmorphism Diamond Overlay */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div
                className="flex items-center justify-center"
                style={{
                  width: 'clamp(200px, 40vw, 302px)',
                  height: 'clamp(200px, 40vw, 302px)',
                  transform: 'rotate(-45deg)'
                }}
              >
                <div
                  className="flex items-center justify-center relative overflow-hidden bg-white/[0.4] backdrop-blur-3xl box-border"
                  style={{
                    width: 'clamp(140px, 28vw, 214px)',
                    height: 'clamp(140px, 28vw, 214px)'
                  }}
                >
                  {/* KayanLive Logo inside diamond */}
                  <div
                    className="bg-center bg-contain bg-no-repeat relative z-10"
                    style={{
                      backgroundImage: `url('${imgKayanLogo}')`,
                      width: 'clamp(100px, 20vw, 159px)',
                      height: 'clamp(33px, 7vw, 53px)',
                      transform: 'rotate(45deg)',
                      filter: 'brightness(1.1)'
                    }}
                  />
                </div>
              </div>
            </div>
            </div>
          </AnimatedServiceCard>

          {/* Live Events & Shows Text Card */}
          <AnimatedServiceCard delay={0.1}>
            <div
              className="bg-white rounded-[35px] border border-[#74cfaa] px-6 sm:px-8 lg:px-12 py-8 sm:py-12 lg:py-16 flex flex-col justify-between min-h-[300px] lg:h-[491px]"
            >
            <div>
              <h3
                className="font-normal bg-gradient-to-r from-[#a095e1] to-[#74cfaa] bg-clip-text mb-6 sm:mb-8 heading-overflow-safe"
                style={{
                  fontSize: 'clamp(32px, 8vw, 80px)',
                  lineHeight: 'clamp(36px, 8.5vw, 85px)',
                  letterSpacing: 'clamp(-0.8px, -0.2vw, -1.6px)',
                  WebkitTextFillColor: 'transparent',
                  WebkitBackgroundClip: 'text',
                  backgroundClip: 'text'
                }}
              >
                <span
                  dangerouslySetInnerHTML={{
                    __html: t('aboutServices.serviceTitle').replace(' & ', ' &<br />')
                  }}
                />

              </h3>

              <div className="text-[#888888]" style={{ fontSize: 'clamp(16px, 3vw, 22px)', lineHeight: 'clamp(22px, 4vw, 28px)' }}>
                <p className="mb-6"
                  dangerouslySetInnerHTML={getMarkdownHTML(t('aboutServices.serviceDescription'))}
                />

                <p className="mt-6"
                  dangerouslySetInnerHTML={getMarkdownHTML(t('aboutServices.idealFor'))}
                />
              </div>
            </div>
            </div>
          </AnimatedServiceCard>
        </div>

        {/* CTA Button */}
        <div className="flex justify-center mt-6 sm:mt-8 md:mt-10 lg:mt-12 xl:mt-16">
          <div className="max-w-[90vw] sm:max-w-none overflow-hidden">
            <CTAButton ariaLabel={t('aboutServices.cta')}>
              {t('aboutServices.cta')}
            </CTAButton>
          </div>
        </div>
      </div>
    </div>
  );
}