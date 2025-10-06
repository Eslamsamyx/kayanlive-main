'use client';

import { memo } from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import Button from '../Button';
import SlideIndicator from './SlideIndicator';
import StatisticsBoxes from './StatisticsBoxes';
import { HeroSlideProps } from './types';
import styles from './Hero.module.css';

// Asset constants
const ASSETS = {
  SCREENSHOT_1: "/optimized/hero-main/01f5d49d03c8455dc99b2ad32446b6657b1949e0-hero-main-desktop.webp",
  SCREENSHOT_3: "/optimized/hero-slide/b0d9ec6faacc00d7ed8b82f3f45ecaa371425181-hero-slide-desktop.webp",
  FRAME_1: "/assets/bac2af3eca424e14c720bab9f5fabec434faaa31.svg",
  KAYAN_LOGO: "/optimized/footer-logo/823c27de600ccd2f92af3e073c8e10df3a192e5c-footer-logo-desktop.webp",
  K_MOBILE: "/optimized/client-logo/873e726ea40f8085d26088ffc29bf8dfb68b10ee-client-logo-mobile.webp",
  VECTOR_MOBILE: "/assets/280033d008f397b92a0642ef0eb81b067b3be2fd.svg"
} as const;

const HeroSlide = memo<HeroSlideProps>(({
  slide,
  isActive,
  variant,
  textMetrics,
  locale,
  onSlideChange,
  totalSlides,
  currentSlide
}) => {
  const t = useTranslations();
  const isMobile = variant === 'mobile';

  // Background image dimensions based on variant and text metrics
  const getBackgroundStyle = () => {
    if (isMobile) {
      // Use mobile-optimized image if available
      const backgroundImage = slide.mobileBackgroundImage || slide.backgroundImage;
      return {
        backgroundImage: `url('${backgroundImage}')`,
        backgroundPosition: slide.backgroundPosition || 'center',
        backgroundSize: slide.backgroundSize || 'cover'
      };
    }

    // Desktop background with responsive dimensions
    const width = slide.type === 'main'
      ? Math.round(textMetrics.desktopHeight * 1.737)
      : Math.round(textMetrics.desktopHeight * 1.522);

    return {
      width: `${width}px`,
      height: `${textMetrics.desktopHeight}px`,
      backgroundImage: `url('${slide.backgroundImage}')`,
      backgroundPosition: slide.backgroundPosition || 'center',
      backgroundSize: slide.backgroundSize || 'cover'
    };
  };

  const renderMainSlideContent = () => (
    <>
      {/* Background Image */}
      <div
        className={`${styles.backgroundImage} ${isMobile ? styles.mobileBackground : styles.desktopBackground}`}
        style={getBackgroundStyle()}
        aria-hidden="true"
      />

      {/* Decorative Logo */}
      <div
        className={`${styles.logoWatermark} ${isMobile ? styles.mobileLogo : styles.desktopLogo}`}
        style={{ backgroundImage: `url('${ASSETS.K_MOBILE}')` }}
        aria-hidden="true"
      />

      {/* Mobile Vector Decoration */}
      {isMobile && (
        <div className="absolute" style={{ left: '0px', bottom: '150px', width: '321px', height: '138px' }}>
          <div className="absolute" style={{ inset: '-36.23% -15.58%' }}>
            <Image
              alt=""
              className="block max-w-none size-full"
              src={ASSETS.VECTOR_MOBILE}
              fill
              style={{ objectFit: 'contain' }}
              aria-hidden="true"
            />
          </div>
        </div>
      )}

      {/* Desktop Decorative Frame */}
      {!isMobile && (
        <div
          className="absolute"
          style={{
            width: '1445.84px',
            height: '290.092px',
            top: `${Math.max(727, 727 + (textMetrics.desktopHeight - 955) * 0.6)}px`,
            left: 'calc(50% - 0.08px)',
            transform: 'translateX(-50%)'
          }}
        >
          <div
            className="absolute"
            style={{
              bottom: '-32.03%',
              [locale === 'ar' ? 'right' : 'left']: '-10.58%',
              [locale === 'ar' ? 'left' : 'right']: '0',
              top: '-39.99%',
              transform: locale === 'ar' ? 'scaleX(-1)' : 'none'
            }}
          >
            <Image
              alt=""
              className="block w-full h-full max-w-none"
              src={ASSETS.FRAME_1}
              fill
              style={{ objectFit: 'contain' }}
              aria-hidden="true"
            />
          </div>
        </div>
      )}

      {/* Text Content */}
      <div
        className={`${styles.textContent} ${isMobile ? styles.mobileText : styles.desktopText}`}
        style={{
          ...(isMobile ? {
            maxHeight: `${textMetrics.mobileHeight - 180}px`
          } : {
            [locale === 'ar' ? 'right' : 'left']: '42px',
            maxHeight: `${textMetrics.desktopHeight - 310}px`,
            textAlign: locale === 'ar' ? 'right' : 'left'
          })
        }}
        dir={locale === 'ar' ? 'rtl' : 'ltr'}
      >
        {t('hero.title')}
      </div>

      {/* Statistics Boxes */}
      <StatisticsBoxes variant={variant} locale={locale} />
    </>
  );

  const renderAboutSlideContent = () => (
    <>
      {/* Background Image */}
      <div
        className={`${styles.backgroundImage} ${isMobile ? styles.mobileBackground : styles.desktopBackground}`}
        style={getBackgroundStyle()}
        aria-hidden="true"
      />

      {/* Logo Watermark */}
      {!isMobile && (
        <div
          className="absolute bg-center bg-cover bg-no-repeat opacity-[0.57]"
          style={{
            width: '1241px',
            height: '414px',
            left: '238px',
            top: '748px',
            backgroundImage: `url('${ASSETS.KAYAN_LOGO}')`
          }}
          aria-hidden="true"
        />
      )}

      {/* Mobile Logo Watermark */}
      {isMobile && (
        <div
          className="absolute bg-center bg-cover bg-no-repeat opacity-[0.57] translate-x-[-50%] translate-y-[-50%]"
          style={{
            top: 'calc(50% + 326px)',
            left: 'calc(50% + 128px)',
            width: '665px',
            height: '222px',
            backgroundImage: `url('${ASSETS.KAYAN_LOGO}')`
          }}
          aria-hidden="true"
        />
      )}

      {/* Desktop Decorative Diamonds */}
      {!isMobile && (
        <div className="absolute" style={{ left: '30px', top: '834px' }}>
          <div className="flex" style={{ gap: '27px' }}>
            {[1, 2].map((index) => (
              <div
                key={index}
                className="flex items-center justify-center"
                style={{ width: '87.725px', height: '87.725px' }}
                aria-hidden="true"
              >
                <div style={{ transform: 'rotate(315deg)' }}>
                  <div
                    className="backdrop-blur-[7.5px]"
                    style={{
                      width: '62.042px',
                      height: '62.042px',
                      backgroundColor: 'rgba(255,255,255,0.3)'
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Central Diamond with Text */}
      <div
        className={`${styles.diamondContainer} ${isMobile ? styles.mobileDiamond : styles.desktopDiamond}`}
      >
        <div style={{ transform: 'rotate(315deg)' }}>
          <div
            className={`${styles.diamondInner} ${isMobile ? styles.mobileDiamondInner : styles.desktopDiamondInner}`}
          >
            <div
              className="absolute flex items-center justify-center"
              style={{
                width: '100%',
                height: '100%',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)'
              }}
            >
              <div style={{ transform: 'rotate(45deg)' }}>
                <div
                  className={`${styles.diamondText} ${isMobile ? styles.mobileDiamondText : styles.desktopDiamondText} flex flex-col items-center justify-center`}
                >
                  <div className={`flex flex-col items-center justify-center gap-3 ${isMobile ? 'mt-8 sm:mt-0' : ''}`}>
                    <p className={`mb-0 font-semibold ${isMobile ? 'text-lg' : 'text-3xl'}`} dir={locale === 'ar' ? 'rtl' : 'ltr'}>
                      {t('hero.slide2Title')}
                    </p>
                    <p className={`mb-0 ${isMobile ? 'text-sm' : 'text-xl'}`} dir={locale === 'ar' ? 'rtl' : 'ltr'}>
                      {t('hero.slide2Subtitle')}
                    </p>
                    <div className="flex justify-center">
                      <Button
                        href={`/${locale}/contact`}
                        variant="default"
                        size={isMobile ? "md" : "lg"}
                        arrowIcon={true}
                      >
                        {t('hero.cta')}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );

  return (
    <div
      className={`${styles.slide} ${isActive ? styles.slideActive : styles.slideInactive}`}
      role="tabpanel"
      aria-labelledby={`slide-${slide.id}`}
      aria-hidden={!isActive}
    >
      {slide.type === 'main' ? renderMainSlideContent() : renderAboutSlideContent()}

      {/* Slide Indicators */}
      <SlideIndicator
        totalSlides={totalSlides}
        currentSlide={currentSlide}
        onSlideChange={onSlideChange}
        variant={variant}
        locale={locale}
      />
    </div>
  );
});

HeroSlide.displayName = 'HeroSlide';

export default HeroSlide;