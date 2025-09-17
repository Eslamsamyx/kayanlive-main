'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Image from 'next/image';
import { useTranslations, useLocale } from 'next-intl';
import Button from './Button';

// Assets
const imgScreenshot1 = "/assets/01f5d49d03c8455dc99b2ad32446b6657b1949e0.png";
const imgScreenshot3 = "/assets/b0d9ec6faacc00d7ed8b82f3f45ecaa371425181.png";
const imgFrame1 = "/assets/bac2af3eca424e14c720bab9f5fabec434faaa31.svg";
const imgKayanLogo = "/assets/823c27de600ccd2f92af3e073c8e10df3a192e5c.png";

// Mobile assets from Figma
const imgKMobile = "/assets/873e726ea40f8085d26088ffc29bf8dfb68b10ee.png";
const imgVectorMobile = "/assets/280033d008f397b92a0642ef0eb81b067b3be2fd.svg";

// Mobile Slide 2 assets from Figma (node-id 22-982)
const imgPattern0331 = "/assets/2e5da0ba94a7081a8e8355ba87266411fee96738.png";
const imgVector449 = "/assets/b53ce5773ee34aec32d25ec4f653964e5daa91e6.svg";
const imgVector450 = "/assets/e5d598dd977002555d271ede5cc7873782a80e66.svg";
const imgVector451 = "/assets/f6ac75d6fe0a6a5d5012ab737d5a5fb0c39f4591.svg";
const imgVector452 = "/assets/6968639e0eef5880ce6f2caed2594c9c3c396938.svg";
const imgVector453 = "/assets/b6337776440823365c9d6d0693bb95cf16288fe4.svg";
const imgVector454 = "/assets/3929c4e9fb7deebafe5202b5e1f3e0d3f29067c6.svg";
const imgVector455 = "/assets/4b056204cf3f68ba704204632b097b1e0f14e21a.svg";
const imgVector456 = "/assets/9ca75393b1fe472137c4e5a9e4b0739115dc6245.svg";
const imgVector457 = "/assets/6338961563b8749b796fc02fc4ce2146f1b695c8.svg";
const imgVector458 = "/assets/2f1c0518048d573eddb0525c46e5cf3478830322.svg";
const imgVector459 = "/assets/0b8b87749ddbac7e694af683b0ade373c2c2ec6a.svg";
const imgArrow1 = "/assets/d40495f3a82dbc1b73402bf2e9b45f90c56a4c70.svg";

// Custom hook for measuring text dimensions and calculating adaptive heights
function useAdaptiveTextHeight() {
  const [textMetrics, setTextMetrics] = useState({
    mobileHeight: 600, // Base height for mobile
    desktopHeight: 955, // Base height for desktop
    mobileTitleHeight: 0,
    desktopTitleHeight: 0,
    desktopDescHeight: 0
  });
  const measureRef = useRef<HTMLDivElement>(null);
  const t = useTranslations();

  const measureText = useCallback(() => {
    if (!measureRef.current) return;

    // Create temporary measuring elements
    const tempContainer = document.createElement('div');
    tempContainer.style.position = 'absolute';
    tempContainer.style.visibility = 'hidden';
    tempContainer.style.top = '-9999px';
    document.body.appendChild(tempContainer);

    try {
      // Measure mobile title
      const mobileTitleEl = document.createElement('div');
      mobileTitleEl.innerHTML = t('hero.title');
      mobileTitleEl.style.fontFamily = "'FONTSPRING DEMO - Visby CF Demi Bold', sans-serif";
      mobileTitleEl.style.fontWeight = 'normal';
      mobileTitleEl.style.fontSize = '22px';
      mobileTitleEl.style.lineHeight = '24px';
      mobileTitleEl.style.width = '281px';
      mobileTitleEl.style.textAlign = 'center';
      mobileTitleEl.style.textTransform = 'capitalize';
      tempContainer.appendChild(mobileTitleEl);
      const mobileTitleHeight = mobileTitleEl.offsetHeight;

      // Measure desktop title
      const desktopTitleEl = document.createElement('div');
      desktopTitleEl.innerHTML = t('hero.title');
      desktopTitleEl.style.fontWeight = 'bold';
      desktopTitleEl.style.fontSize = '50px';
      desktopTitleEl.style.lineHeight = '1.3';
      desktopTitleEl.style.width = '875px';
      desktopTitleEl.style.textTransform = 'capitalize';
      tempContainer.appendChild(desktopTitleEl);
      const desktopTitleHeight = desktopTitleEl.offsetHeight;

      // Measure desktop description
      const desktopDescEl = document.createElement('div');
      desktopDescEl.innerHTML = t('hero.description');
      desktopDescEl.style.fontSize = '28px';
      desktopDescEl.style.lineHeight = '38px';
      desktopDescEl.style.fontWeight = '500';
      desktopDescEl.style.maxWidth = '627px';
      desktopDescEl.style.textAlign = 'center';
      desktopDescEl.style.textTransform = 'capitalize';
      desktopDescEl.style.padding = '0 32px';
      tempContainer.appendChild(desktopDescEl);
      const desktopDescHeight = desktopDescEl.offsetHeight;

      // Calculate adaptive heights based on text measurements with proper constraints
      // Mobile: Base height 600px, adjust if title exceeds ~84px (3 lines), but cap at reasonable max
      const mobileBaseHeight = 600;
      const mobileTitleExpected = 84; // Expected height for 3 lines
      const mobileHeightAdjustment = Math.max(0, mobileTitleHeight - mobileTitleExpected);
      const adaptiveMobileHeight = Math.max(600, Math.min(900, mobileBaseHeight + mobileHeightAdjustment * 2));

      // Desktop: Base height 955px, adjust if title exceeds ~273px (3 lines), but ensure reasonable max
      const desktopBaseHeight = 955;
      const desktopTitleExpected = 273; // Expected height for 3 lines at 70px font
      const desktopDescExpected = 150; // Expected height for description
      const desktopTitleAdjustment = Math.max(0, desktopTitleHeight - desktopTitleExpected);
      const desktopDescAdjustment = Math.max(0, desktopDescHeight - desktopDescExpected);
      const adaptiveDesktopHeight = Math.max(955, Math.min(1400, desktopBaseHeight + Math.max(desktopTitleAdjustment, desktopDescAdjustment) * 1.5));

      setTextMetrics({
        mobileHeight: adaptiveMobileHeight,
        desktopHeight: adaptiveDesktopHeight,
        mobileTitleHeight,
        desktopTitleHeight,
        desktopDescHeight
      });
    } catch (error) {
      console.warn('Text measurement failed:', error);
    } finally {
      document.body.removeChild(tempContainer);
    }
  }, [t]);

  useEffect(() => {
    // Measure on mount and when translations change
    const timer = setTimeout(measureText, 100);
    return () => clearTimeout(timer);
  }, [measureText]);

  return { textMetrics, measureRef };
}

export default function Hero() {
  const t = useTranslations();
  const locale = useLocale();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const totalSlides = 2;
  const { textMetrics, measureRef } = useAdaptiveTextHeight();

  useEffect(() => {
    if (!isPaused) {
      const interval = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % totalSlides);
      }, 6000);
      return () => clearInterval(interval);
    }
  }, [isPaused, totalSlides]);

  const goToSlide = useCallback((index: number) => {
    setCurrentSlide(index);
    setIsPaused(true);
    setTimeout(() => setIsPaused(false), 10000);
  }, []);

  // Add basic keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides);
        setIsPaused(true);
        setTimeout(() => setIsPaused(false), 10000);
      } else if (event.key === 'ArrowRight') {
        event.preventDefault();
        setCurrentSlide((prev) => (prev + 1) % totalSlides);
        setIsPaused(true);
        setTimeout(() => setIsPaused(false), 10000);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [totalSlides]);

  return (
    <>
      {/* Hidden measuring container */}
      <div ref={measureRef} className="sr-only" />
      
      {/* Mobile Layout */}
      <div 
        className="relative bg-[#2c2c2b] overflow-hidden rounded-[25px] mx-4 mb-8 lg:hidden"
        style={{ height: `clamp(${textMetrics.mobileHeight}px, 85vh, ${textMetrics.mobileHeight + 200}px)` }}
        onTouchStart={() => setIsPaused(true)}
        onTouchEnd={() => setIsPaused(false)}
      >
        {/* Mobile Slide 1 - Main Hero */}
        <div className={`absolute inset-0 transition-opacity duration-1000 ${
          currentSlide === 0 ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}>
          {/* Mobile Background Image */}
          <div 
            className="absolute inset-0 bg-center bg-cover bg-no-repeat"
            style={{ 
              backgroundImage: `url('${imgScreenshot1}')` 
            }}
          />
          
          {/* Mobile/Tablet Centered Logo - Responsive */}
          <div 
            className="absolute backdrop-blur-[11.5px] backdrop-filter bg-center bg-cover bg-no-repeat opacity-[0.43] translate-x-[-50%] translate-y-[-50%]"
            style={{ 
              left: "calc(50% + 0.5px)",
              top: '50%',
              width: 'clamp(156px, 20vw, 240px)',
              height: 'clamp(248px, 32vw, 382px)',
              backgroundImage: `url('${imgKMobile}')` 
            }}
          />
          
          {/* Mobile Vector Decoration */}
          <div className="absolute" style={{ left: '0px', bottom: '150px', width: '321px', height: '138px' }}>
            <div className="absolute" style={{ inset: '-36.23% -15.58%' }}>
              <Image alt="" className="block max-w-none size-full" src={imgVectorMobile} fill style={{ objectFit: 'contain' }} />
            </div>
          </div>

          {/* Mobile Text Content - Always bottom anchored */}
          <div
            className="absolute capitalize text-white text-center translate-x-[-50%]"
            style={{
              fontFamily: "'FONTSPRING DEMO - Visby CF Demi Bold', sans-serif",
              fontWeight: 'normal',
              fontSize: '22px',
              lineHeight: '24px',
              left: '50%',
              bottom: '120px',
              width: '281px',
              maxHeight: `${textMetrics.mobileHeight - 180}px`,
              overflow: 'hidden',
              wordWrap: 'break-word'
            }}
          >
            {t('hero.title')}
          </div>

          {/* Mobile Statistics Boxes */}
          <div className="absolute flex gap-3 translate-x-[-50%]" style={{ left: '50%', bottom: '75px' }}>
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg px-3 py-2">
              <div className="text-white text-xs font-medium text-center whitespace-nowrap">
                {t('hero.stats.projects')}
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg px-3 py-2">
              <div className="text-white text-xs font-medium text-center whitespace-nowrap">
                {t('hero.stats.founded')}
              </div>
            </div>
          </div>

          {/* Mobile Slide Indicators */}
          <div className="absolute flex items-center justify-center translate-x-[-50%]" style={{ left: '50%', bottom: '40px' }}>
            <div className="flex" style={{ gap: '20.66px' }}>
              {[0, 1].map((index) => (
                <button 
                  key={index}
                  onClick={() => goToSlide(index)}
                  className="relative flex items-center justify-center"
                  style={{ width: '20.661px', height: '20.66px' }}
                  aria-label={`Go to slide ${index + 1}`}
                >
                  <div className="flex-none" style={{ transform: 'rotate(224.999deg)' }}>
                    <div 
                      className="relative backdrop-blur-[7.5px] backdrop-filter"
                      style={{ 
                        width: '14.613px', 
                        height: '14.613px',
                        backgroundColor: 'rgba(255,255,255,0.01)',
                        border: '1.3px solid #ffffff'
                      }}
                    >
                      {currentSlide === index && (
                        <div 
                          className="absolute bg-white translate-x-[-50%] translate-y-[-50%]"
                          style={{ 
                            width: '8.629px',
                            height: '8.629px',
                            top: 'calc(50% - 0.244px)',
                            left: 'calc(50% + 0.076px)'
                          }}
                        />
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Mobile Slide 2 - About Text (Figma Design) */}
        <div className={`absolute inset-0 transition-opacity duration-1000 ${
          currentSlide === 1 ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}>
          {/* Mobile Background - Cropped to mobile dimensions */}
          <div 
            className="absolute inset-0 bg-no-repeat"
            style={{ 
              backgroundImage: `url('${imgScreenshot3}')`,
              backgroundPosition: '47.69% 0%',
              backgroundSize: '373.72% 100%'
            }}
          />

          {/* Mobile Central Diamond with Text */}
          <div
            className="absolute flex items-center justify-center"
            style={{
              left: '50%',
              top: '50%',
              transform: 'translate(-50%, -50%)',
              width: 'clamp(400px, 50vw, 355.719px)',
              height: 'clamp(400px, 50vw, 355.719px)'
            }}
          >
            <div style={{ transform: 'rotate(315deg)' }}>
              <div
                className="bg-white/13 backdrop-blur-sm overflow-hidden relative"
                style={{
                  width: 'clamp(300px, 40vw, 251.532px)',
                  height: 'clamp(300px, 40vw, 251.532px)'
                }}
              >
                <div
                  className="absolute flex items-center justify-center"
                  style={{
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: '100%',
                    height: '100%'
                  }}
                >
                  <div style={{ transform: 'rotate(45deg)' }}>
                    <div
                      className="text-white text-center capitalize relative px-4 flex flex-col items-center justify-center"
                      style={{
                        width: 'clamp(320px, 45vw, 272px)',
                        height: 'clamp(200px, 30vw, 200px)',
                        fontFamily: "'FONTSPRING DEMO - Visby CF Medium', 'Satoshi', sans-serif",
                        fontSize: 'clamp(12px, 2.5vw, 14px)',
                        lineHeight: 'clamp(16px, 3vw, 20px)',
                        fontWeight: 'normal'
                      }}
                    >
                      <div className="flex flex-col items-center justify-center gap-3 mt-8 sm:mt-0">
                        <p className="mb-0 text-lg font-semibold">
                          {t('hero.slide2Title')}
                        </p>
                        <p className="mb-0 text-sm">
                          {t('hero.slide2Subtitle')}
                        </p>
                        <div className="flex justify-center">
                          <Button
                            href={`/${locale}/contact`}
                            variant="default"
                            size="md"
                            arrowIcon={true}
                          >
                            Schedule a Consultation
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Mobile Logo Watermark */}
          <div 
            className="absolute bg-center bg-cover bg-no-repeat opacity-[0.57] translate-x-[-50%] translate-y-[-50%]"
            style={{ 
              top: 'calc(50% + 326px)',
              left: 'calc(50% + 128px)',
              width: '665px',
              height: '222px',
              backgroundImage: `url('${imgKayanLogo}')` 
            }}
          />

          {/* Mobile Slide Indicators for slide 2 */}
          <div className="absolute flex items-center justify-center translate-x-[-50%]" style={{ left: '50%', bottom: '40px' }}>
            <div className="flex" style={{ gap: '20.66px' }}>
              {[0, 1].map((index) => (
                <button 
                  key={index}
                  onClick={() => goToSlide(index)}
                  className="relative flex items-center justify-center"
                  style={{ width: '20.661px', height: '20.66px' }}
                  aria-label={`Go to slide ${index + 1}`}
                >
                  <div className="flex-none" style={{ transform: 'rotate(224.999deg)' }}>
                    <div 
                      className="relative backdrop-blur-[7.5px] backdrop-filter"
                      style={{ 
                        width: '14.613px', 
                        height: '14.613px',
                        backgroundColor: 'rgba(255,255,255,0.01)',
                        border: '1.3px solid #ffffff'
                      }}
                    >
                      {currentSlide === index && (
                        <div 
                          className="absolute bg-white translate-x-[-50%] translate-y-[-50%]"
                          style={{ 
                            width: '8.629px',
                            height: '8.629px',
                            top: 'calc(50% - 0.244px)',
                            left: 'calc(50% + 0.076px)'
                          }}
                        />
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* Desktop Layout - Adaptive Design */}
      <div 
        className="relative bg-[#2c2c2b] overflow-hidden rounded-[61px] mx-4 mb-8 hidden lg:block"
        style={{ height: `${textMetrics.desktopHeight}px` }}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {/* Desktop Slide 1 - Main Hero */}
        <div className={`absolute inset-0 transition-opacity duration-1000 ${
          currentSlide === 0 ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}>
          {/* Background Image - Responsive to dynamic height */}
          <div 
            className="absolute bg-center bg-cover bg-no-repeat"
            style={{ 
              width: `${Math.round(textMetrics.desktopHeight * 1.737)}px`,
              height: `${textMetrics.desktopHeight}px`,
              top: '0px',
              left: 'calc(50% - 0.5px)',
              transform: 'translateX(-50%)',
              backgroundImage: `url('${imgScreenshot1}')` 
            }}
          />
          
          {/* Desktop Centered Decorative Logo */}
          <div 
            className="absolute backdrop-blur-[11.5px] backdrop-filter bg-center bg-cover bg-no-repeat opacity-[0.43] translate-x-[-50%] translate-y-[-50%]"
            style={{ 
              left: "calc(50% + 0.5px)",
              top: '50%',
              width: '280px',
              height: '446px',
              backgroundImage: `url('${imgKMobile}')` 
            }}
          />
          
          {/* Decorative Frame - Adaptive positioning */}
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
            <div className="absolute" style={{ 
              bottom: '-32.03%', 
              [locale === 'ar' ? 'right' : 'left']: '-10.58%',
              [locale === 'ar' ? 'left' : 'right']: '0',
              top: '-39.99%',
              transform: locale === 'ar' ? 'scaleX(-1)' : 'none'
            }}>
              <Image alt="" className="block w-full h-full max-w-none" src={imgFrame1} fill style={{objectFit: 'contain'}} />
            </div>
          </div>

          {/* Text Content - Always bottom anchored */}
          <div
            className="absolute capitalize text-white"
            style={{
              fontWeight: 'bold',
              fontSize: '50px',
              lineHeight: '1.3',
              [locale === 'ar' ? 'right' : 'left']: '42px',
              bottom: '120px',
              width: '875px',
              maxHeight: `${textMetrics.desktopHeight - 310}px`,
              overflow: 'hidden',
              textAlign: locale === 'ar' ? 'right' : 'left',
              wordWrap: 'break-word'
            }}
          >
            {t('hero.title')}
          </div>

          {/* Desktop Statistics Boxes */}
          <div
            className="absolute flex gap-6"
            style={{
              [locale === 'ar' ? 'right' : 'left']: '42px',
              bottom: '50px'
            }}
          >
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl px-6 py-4">
              <div className="text-white text-lg font-semibold text-center whitespace-nowrap">
                {t('hero.stats.projects')}
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl px-6 py-4">
              <div className="text-white text-lg font-semibold text-center whitespace-nowrap">
                {t('hero.stats.founded')}
              </div>
            </div>
          </div>

          {/* Desktop Slide Indicators */}
          <div className="absolute" style={{ 
            [locale === 'ar' ? 'left' : 'right']: '76px', 
            top: '424px' 
          }}>
            <div className="flex flex-col" style={{ gap: '35.355px' }}>
              {[0, 1].map((index) => (
                <button 
                  key={index}
                  onClick={() => goToSlide(index)}
                  className="relative flex items-center justify-center"
                  style={{ width: '35.355px', height: '35.355px' }}
                  aria-label={`Go to slide ${index + 1}`}
                >
                  <div className="flex-none" style={{ transform: 'rotate(315deg)' }}>
                    <div 
                      className="relative backdrop-blur-[7.5px]"
                      style={{ 
                        width: '25px', 
                        height: '25px',
                        backgroundColor: currentSlide === index ? 'transparent' : 'rgba(255,255,255,0.01)',
                        border: '2px solid #ffffff'
                      }}
                    >
                      {currentSlide === index && (
                        <div 
                          className="absolute bg-white"
                          style={{ 
                            width: '15.79px',
                            height: '15.79px',
                            top: 'calc(50% + 0.23px)',
                            left: 'calc(50% + 0.117px)',
                            transform: 'translate(-50%, -50%)'
                          }}
                        />
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Desktop Slide 2 - About Text */}
        <div className={`absolute inset-0 transition-opacity duration-1000 ${
          currentSlide === 1 ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}>
          {/* Background Image - Responsive to dynamic height */}
          <div 
            className="absolute bg-center bg-cover bg-no-repeat"
            style={{ 
              width: `${Math.round(textMetrics.desktopHeight * 1.522)}px`,
              height: `${textMetrics.desktopHeight}px`,
              top: '0px',
              left: '50%',
              transform: 'translateX(-50%)',
              backgroundImage: `url('${imgScreenshot3}')` 
            }}
          />

          {/* Logo Watermark */}
          <div 
            className="absolute bg-center bg-cover bg-no-repeat opacity-[0.57]"
            style={{ 
              width: '1241px',
              height: '414px',
              left: '238px',
              top: '748px',
              backgroundImage: `url('${imgKayanLogo}')` 
            }}
          />

          {/* Decorative Diamonds - bottom left */}
          <div className="absolute" style={{ left: '30px', top: '834px' }}>
            <div className="flex" style={{ gap: '27px' }}>
              <div 
                className="flex items-center justify-center"
                style={{ width: '87.725px', height: '87.725px' }}
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
              <div 
                className="flex items-center justify-center"
                style={{ width: '87.725px', height: '87.725px' }}
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
            </div>
          </div>

          {/* Central Diamond with Text */}
          <div 
            className="absolute flex items-center justify-center"
            style={{ 
              width: '801.992px',
              height: '801.992px',
              top: 'calc(50% + 0.5px)',
              left: '50%',
              transform: 'translate(-50%, -50%)'
            }}
          >
            <div style={{ transform: 'rotate(315deg)' }}>
              <div 
                className="overflow-hidden relative"
                style={{ 
                  width: '567.1px',
                  height: '567.1px',
                  backgroundColor: 'rgba(255,255,255,0.13)'
                }}
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
                      className="text-white text-center capitalize px-8"
                      style={{
                        maxWidth: '627px',
                        fontSize: '28px',
                        lineHeight: '38px',
                        fontWeight: '500',
                        minHeight: 'fit-content'
                      }}
                    >
                      <p className="mb-6 text-3xl font-bold">
                        {t('hero.slide2Title')}
                      </p>
                      <p className="mb-8 text-xl">
                        {t('hero.slide2Subtitle')}
                      </p>
                      <div className="flex justify-center mt-6">
                        <Button
                          href={`/${locale}/contact`}
                          variant="default"
                          size="lg"
                          arrowIcon={true}
                        >
                          Schedule a Consultation
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Desktop Slide Indicators */}
          <div className="absolute" style={{ 
            [locale === 'ar' ? 'left' : 'right']: '76px', 
            top: '424px' 
          }}>
            <div className="flex flex-col" style={{ gap: '35.355px' }}>
              {[0, 1].map((index) => (
                <button 
                  key={index}
                  onClick={() => goToSlide(index)}
                  className="relative flex items-center justify-center"
                  style={{ width: '35.355px', height: '35.355px' }}
                  aria-label={`Go to slide ${index + 1}`}
                >
                  <div className="flex-none" style={{ transform: 'rotate(315deg)' }}>
                    <div 
                      className="relative backdrop-blur-[7.5px]"
                      style={{ 
                        width: '25px', 
                        height: '25px',
                        backgroundColor: currentSlide === index ? 'transparent' : 'rgba(255,255,255,0.01)',
                        border: '2px solid #ffffff'
                      }}
                    >
                      {currentSlide === index && (
                        <div 
                          className="absolute bg-white"
                          style={{ 
                            width: '15.79px',
                            height: '15.79px',
                            top: 'calc(50% + 0.23px)',
                            left: 'calc(50% + 0.117px)',
                            transform: 'translate(-50%, -50%)'
                          }}
                        />
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

      </div>
    </>
  );
}