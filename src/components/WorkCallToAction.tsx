'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useTranslations, useLocale } from 'next-intl';
import CTAButton from './CTAButton';

// Assets from Figma - Optimized WebP images
const imgOutline1 = "/optimized/work-cta/7d0b4204ecf2732587fef2b7f191e56d708f7342-work-cta-outline.webp";
const imgPattern0452 = "/optimized/work-cta/387db429def8526f504ca1667390161ed52cad5a-work-cta-pattern.webp";
const imgFreepikTheStyleIsCandidImagePhotographyWithNatural627961 = "/optimized/work-cta/a9fd0d21f36d5cfd66da463407810fac3f7425a2-work-cta-image.webp";
const imgEllipse3626 = "/assets/34146dbe8aeb9c1892f700cd9059e41d476db4b0.svg";

interface WorkCallToActionProps {
  locale?: string;
}

export default function WorkCallToAction({ locale = 'en' }: WorkCallToActionProps) {
  const t = useTranslations('work.callToAction');
  const currentLocale = useLocale();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Prevent hydration mismatch
  if (!mounted) {
    return null;
  }

  return (
    <section
      className="relative w-full bg-[#2c2c2b] overflow-hidden"
      aria-labelledby="work-cta-title"
    >
      {/* Container with proper padding for all screen sizes */}
      <div className="relative min-h-[600px] md:min-h-[700px] lg:min-h-[800px] xl:min-h-[900px] 2xl:min-h-[1000px]">

        {/* Decorative Circle - At the very top of the component */}
        <div className="absolute -top-24 md:-top-32 lg:-top-40 xl:-top-48 left-1/2 transform -translate-x-1/2 w-48 h-48 md:w-64 md:h-64 lg:w-80 lg:h-80 xl:w-96 xl:h-96 z-0">
          <Image
            src={imgEllipse3626}
            alt=""
            fill
            className="object-contain opacity-50 md:opacity-60 lg:opacity-70"
          />
        </div>

        {/* Top-Right Pattern - Visible on all screen sizes */}
        <div
          className="absolute"
          style={{
            backgroundImage: `url('${imgPattern0452}')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            width: 'clamp(100px, 15vw, 300px)',
            height: 'clamp(150px, 25vw, 450px)',
            right: 'clamp(-30px, -5vw, -100px)',
            top: 'clamp(-20px, -3vw, -60px)',
            filter: 'brightness(0) invert(1)',
            opacity: 0.6
          }}
        />

        {/* Left Background Pattern - Hidden on mobile for performance */}
        <div className="hidden md:block">
          <div
            className="absolute opacity-30 lg:opacity-50"
            style={{
              backgroundImage: `url('${imgOutline1}')`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              width: 'clamp(300px, 35vw, 700px)',
              height: 'clamp(400px, 50vw, 1000px)',
              left: 'clamp(-300px, -25vw, -500px)',
              top: '20%'
            }}
          />
        </div>

        {/* Main Content - Top aligned instead of centered */}
        <div className="relative z-10 min-h-[600px] md:min-h-[700px] lg:min-h-[800px] xl:min-h-[900px] 2xl:min-h-[1000px] px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 py-12 md:py-16 lg:py-20">

          <div className="w-full max-w-7xl mx-auto">
            {/* Grid Layout - Responsive for all screens */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 lg:gap-10 xl:gap-12 items-start">

              {/* Left Column - Image */}
              <div className="relative w-full h-[300px] sm:h-[350px] md:h-[400px] lg:h-[450px] xl:h-[500px] 2xl:h-[550px] rounded-2xl md:rounded-3xl lg:rounded-[40px] overflow-hidden bg-white group">
                {/* Main Image with proper responsive sizing */}
                <Image
                  src={imgFreepikTheStyleIsCandidImagePhotographyWithNatural627961}
                  alt="Business meeting showcasing our work"
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 100vw, 50vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-700"
                  priority
                />

                {/* Subtle gradient overlay for better text contrast on mobile */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent lg:hidden" />
              </div>

              {/* Right Column - Content */}
              <div className="flex items-start justify-center">
                <div className="relative w-full h-full min-h-[300px] sm:min-h-[350px] md:min-h-[400px] lg:min-h-[450px] xl:min-h-[500px] 2xl:min-h-[550px]">
                  {/* Glass Morphism Card */}
                  <div className="h-full bg-white/[0.03] backdrop-blur-md rounded-2xl md:rounded-3xl lg:rounded-[35px] p-6 sm:p-8 md:p-10 lg:p-12 xl:p-14 border border-[#74cfaa]/50 hover:border-[#74cfaa]/70 transition-all duration-500 hover:bg-white/[0.05]">

                    {/* Title with responsive typography */}
                    <h2
                      id="work-cta-title"
                      className="bg-clip-text bg-gradient-to-r from-[#a095e1] to-[#74cfaa] font-bold mb-6 md:mb-8 lg:mb-10"
                      style={{
                        WebkitTextFillColor: 'transparent',
                        fontSize: 'clamp(1.75rem, 4vw, 5rem)',
                        lineHeight: 'clamp(2rem, 4.5vw, 5.5rem)',
                        letterSpacing: 'clamp(-0.5px, -0.08vw, -1.6px)'
                      }}
                      dir={currentLocale === 'ar' ? 'rtl' : 'ltr'}
                    >
                      {t('title')}
                    </h2>

                    {/* Content with better responsive typography */}
                    <div className="space-y-3 md:space-y-4 lg:space-y-5 text-[#c3c3c3]">
                      <p className="text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl leading-relaxed" dir={currentLocale === 'ar' ? 'rtl' : 'ltr'}>
                        {t('question')}
                      </p>

                      <p className="text-white font-bold text-base sm:text-lg md:text-xl lg:text-2xl xl:text-3xl" dir={currentLocale === 'ar' ? 'rtl' : 'ltr'}>
                        {t('callout')}
                      </p>

                      <p className="text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl leading-relaxed pt-2 md:pt-3 lg:pt-4" dir={currentLocale === 'ar' ? 'rtl' : 'ltr'}>
                        {t('description')}
                      </p>

                      <p className="text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl leading-relaxed" dir={currentLocale === 'ar' ? 'rtl' : 'ltr'}>
                        {t('promise')}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* CTA Button - Centered with proper spacing */}
            <div className="flex justify-center mt-8 md:mt-10 lg:mt-12 xl:mt-14">
              <CTAButton
                href={`/${locale}/contact`}
                ariaLabel={t('buttonAriaLabel')}
                className="transform hover:scale-105 transition-transform duration-300"
              >
                {t('buttonText')}
              </CTAButton>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}