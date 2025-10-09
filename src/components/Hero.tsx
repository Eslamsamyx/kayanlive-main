'use client';

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import Image from 'next/image';
import { useTranslations, useLocale } from 'next-intl';
import Button from './Button';

const imgScreenshot1Desktop = "/optimized/hero/aeb93871393e6e48280518ae29c12c43432c5df9-hero-main-bg.webp";
const imgScreenshot1Mobile = "/optimized/hero/aeb93871393e6e48280518ae29c12c43432c5df9-hero-main-bg.webp";
const imgScreenshot3 = "/optimized/hero/36266e42711b665cf6180bb2cfbd86ce5dfdc38d-hero-slide2-bg.webp";
const imgFrame1 = "/assets/bac2af3eca424e14c720bab9f5fabec434faaa31.svg";
const imgKayanLogo = "/optimized/hero/c3bd19974a833dd7b9c652f43779f65bc16ed61e-hero-logo-watermark.webp";
const imgKMobile = "/optimized/hero/f5bae82d42d75ffee835aede03ab3d50beabcc07-hero-k-mobile.webp";
const imgVectorMobile = "/assets/280033d008f397b92a0642ef0eb81b067b3be2fd.svg";

// Constants
const SLIDE_INTERVAL = 6000;
const PAUSE_DURATION = 10000;
const TOTAL_SLIDES = 2;

const SlideIndicators = ({
  currentSlide,
  goToSlide,
  totalSlides,
  variant = 'mobile',
  className = '',
  style = {}
}: {
  currentSlide: number;
  goToSlide: (index: number) => void;
  totalSlides: number;
  variant?: 'mobile' | 'desktop';
  className?: string;
  style?: React.CSSProperties;
}) => {
  const isMobile = variant === 'mobile';
  const size = isMobile ? '20.661px' : '35.355px';
  const innerSize = isMobile ? '14.613px' : '25px';
  const activeSize = isMobile ? '8.629px' : '15.79px';
  const gap = isMobile ? '20.66px' : '35.355px';
  const borderWidth = isMobile ? '1.3px' : '2px';
  const rotation = isMobile ? 'rotate(224.999deg)' : 'rotate(315deg)';

  return (
    <div className={`flex ${isMobile ? '' : 'flex-col'} ${className}`} style={{ gap, ...style }}>
      {Array.from({ length: totalSlides }, (_, index) => (
        <button
          key={index}
          onClick={() => goToSlide(index)}
          className="hero-slide-indicator"
          style={{ width: size, height: size }}
          aria-label={`Go to slide ${index + 1}`}
        >
          <div className="flex-none" style={{ transform: rotation }}>
            <div
              className="relative hero-slide-indicator-inner"
              style={{
                width: innerSize,
                height: innerSize,
                backgroundColor: currentSlide === index ? 'transparent' : 'rgba(255,255,255,0.01)',
                border: `${borderWidth} solid #ffffff`
              }}
            >
              {currentSlide === index && (
                <div
                  className="absolute bg-white hero-slide-indicator-active"
                  style={{
                    width: activeSize,
                    height: activeSize,
                    top: isMobile ? 'calc(50% - 0.244px)' : 'calc(50% + 0.23px)',
                    left: isMobile ? 'calc(50% + 0.076px)' : 'calc(50% + 0.117px)',
                    transform: 'translate(-50%, -50%)'
                  }}
                />
              )}
            </div>
          </div>
        </button>
      ))}
    </div>
  );
};

export default function Hero() {
  const t = useTranslations();
  const locale = useLocale();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const pauseTimeoutRef = useRef<number | undefined>(undefined);
  const totalSlides = TOTAL_SLIDES;

  // Client-side hydration check for performance
  useEffect(() => {
    setIsClient(true);
  }, []);

  const containerStyles = useMemo(() => ({
    mobile: {
      height: 'clamp(600px, 85vh, 800px)',
      minHeight: '600px'
    },
    desktop: {
      height: 'clamp(955px, 100vh, 1200px)',
      minHeight: '955px'
    }
  }), []);

  useEffect(() => {
    if (!isPaused && isClient) {
      const interval = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % totalSlides);
      }, SLIDE_INTERVAL);
      return () => clearInterval(interval);
    }
  }, [isPaused, totalSlides, isClient]);

  const goToSlide = useCallback((index: number) => {
    setCurrentSlide(index);
    setIsPaused(true);

    if (pauseTimeoutRef.current) {
      clearTimeout(pauseTimeoutRef.current);
    }

    pauseTimeoutRef.current = setTimeout(() => setIsPaused(false), PAUSE_DURATION) as unknown as number;
  }, []);

  const slideIndicatorProps = useMemo(() => ({
    currentSlide,
    goToSlide,
    totalSlides
  }), [currentSlide, goToSlide, totalSlides]);

  // Keyboard navigation - only add listeners after client hydration
  useEffect(() => {
    if (!isClient) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides);
        setIsPaused(true);

        if (pauseTimeoutRef.current) {
          clearTimeout(pauseTimeoutRef.current);
        }
        pauseTimeoutRef.current = setTimeout(() => setIsPaused(false), PAUSE_DURATION) as unknown as number;
      } else if (event.key === 'ArrowRight') {
        event.preventDefault();
        setCurrentSlide((prev) => (prev + 1) % totalSlides);
        setIsPaused(true);

        if (pauseTimeoutRef.current) {
          clearTimeout(pauseTimeoutRef.current);
        }
        pauseTimeoutRef.current = setTimeout(() => setIsPaused(false), PAUSE_DURATION) as unknown as number;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [totalSlides, isClient]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (pauseTimeoutRef.current) {
        clearTimeout(pauseTimeoutRef.current);
      }
    };
  }, []);

  return (
    <>
      {/* Hidden slide labels for accessibility */}
      <div id="slide-0-label" className="sr-only">Slide 1: Main Hero - KayanLive Brand Showcase</div>
      <div id="slide-1-label" className="sr-only">Slide 2: About Us - Our Vision and Mission</div>

      {/* Live region for slide announcements */}
      <div
        id="carousel-live-region"
        className="sr-only"
        aria-live="polite"
        aria-atomic="true"
      >
        {`Slide ${currentSlide + 1} of ${totalSlides}`}
      </div>

      {/* Skip link for keyboard navigation */}
      <div className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 z-50">
        <button
          onClick={() => {
            const nextSection = document.querySelector('[data-next-section]');
            nextSection?.scrollIntoView({ behavior: 'smooth' });
          }}
          className="bg-white text-black px-4 py-2 rounded-lg font-medium shadow-lg focus:outline-2 focus:outline-blue-600 focus:outline-offset-2"
        >
          Skip hero carousel
        </button>
      </div>

      <style jsx>{`
        .hero-container {
          contain: layout style paint;
        }

        .hero-slide-indicator {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: transform 0.2s ease;
          contain: layout;
        }

        .hero-slide-indicator:hover {
          transform: scale(1.1);
        }

        .hero-slide-indicator:focus {
          outline: 2px solid white;
          outline-offset: 2px;
        }

        .hero-slide-indicator-inner {
          background: rgba(255, 255, 255, 0.1);
          transition: all 0.3s ease;
        }

        .hero-slide-indicator-active {
          transition: all 0.3s ease;
        }

        .hero-backdrop-blur {
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          contain: layout;
        }

        .hero-decorative-blur {
          background: rgba(255, 255, 255, 0.08);
          contain: layout;
        }

        .hero-mobile-content,
        .hero-desktop-content {
          transform: translateZ(0);
          contain: layout;
        }

        .hero-text-stable {
          font-size: clamp(24px, 3vw, 36px);
          line-height: 1.5;
          font-family: var(--font-poppins), 'Poppins-Fallback', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;
          font-display: swap;
          text-rendering: optimizeSpeed;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
          contain: layout;
        }

        @media (prefers-reduced-motion: reduce) {
          .hero-slide-indicator,
          .hero-slide-indicator-inner,
          .hero-slide-indicator-active {
            transition: none;
          }

          .hero-mobile-content,
          .hero-desktop-content {
            transform: none;
          }
        }

        @media (max-width: 768px) {
          .hero-text-stable {
            font-size: clamp(14px, 3.5vw, 18px);
            line-height: clamp(21px, 5vw, 27px);
          }
        }
      `}</style>

      {/* Mobile Layout */}
      <div
        className="hero-container relative bg-[#2c2c2b] overflow-hidden rounded-[25px] mx-4 mb-8 lg:hidden"
        style={containerStyles.mobile}
        onTouchStart={() => setIsPaused(true)}
        onTouchEnd={() => setIsPaused(false)}
        role="region"
        aria-label="Hero carousel"
        aria-live="polite"
        aria-atomic="true"
      >
        {/* Mobile Slide 1 - Main Hero */}
        <div
          className={`absolute inset-0 transition-opacity duration-1000 ${
            currentSlide === 0 ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
          role="tabpanel"
          aria-labelledby="slide-0-label"
          aria-hidden={currentSlide !== 0}
          {...(currentSlide !== 0 && { inert: true })}
        >
          <Image
            src={imgScreenshot1Mobile}
            alt="KayanLive Hero Background"
            fill
            priority
            quality={90}
            sizes="(max-width: 768px) 100vw, 768px"
            loading="eager"
            unoptimized={false}
            className="object-cover object-center"
            placeholder="blur"
            blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEAAoHBwgHBgoICAgLCgoLDhgQDg0NDh0VFhEYIx8lJCIfIiEmKzcvJik0KSEiMEExNDk7Pj4+JS5ESUM8SDc9PjsBCgsLDg0OHBAQHDsoIig7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O//AABEIAAABAAMBEQACEQEDEQH/xAAfAAABBQEBAQEBAQAAAAAAAAAAAQIDBAUGBwgJCgv/xAC1EAACAQMDAgQDBQUEBAAAAX0BAgMABBEFEiExQQYTUWEHInEUMoGRoQgjQrHBFVLR8CQzYnKCCQoWFxgZGiUmJygpKjQ1Njc4OTpDREVGR0hJSlNUVVZXWFlaY2RlZmdoaWpzdHV2d3h5eoOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4eLj5OXm5+jp6vHy8/T19vf4+fr/xAAfAQADAQEBAQEBAQEBAAAAAAAAAQIDBAUGBwgJCgv/xAC1EQACAQIEBAMEBwUEBAABAncAAQIDEQQFITEGEkFRB2FxEyIygZEUQqGxwdHwJSU0YgkWFxgZGiUmJygpKjQ1Njc4OTpDREVGR0hJSlNUVVZXWFlaY2RlZmdoaWpzdHV2d3h5eoGChISFhoeIiYqSk5SVlpeYmZqgo6SlpqeoqaqysbK1tre4ubrCw8TFxsfIycrS09TV1tfY2drh4uPk5ebn6Onq8fLz9PX29/j5+v/aAAwDAQACEQMRAD8A5/w="
            fetchPriority="high"
            style={{
              aspectRatio: '16/9',
              objectFit: 'cover'
            }}
          />

          {/* Mobile/Tablet Centered Logo - Optimized loading */}
          <div
            className="absolute opacity-[0.43] translate-x-[-50%] translate-y-[-50%]"
            style={{
              left: "calc(50% + 0.5px)",
              top: '50%',
              width: 'clamp(156px, 20vw, 240px)',
              height: 'clamp(248px, 32vw, 382px)',
            }}
            aria-hidden="true"
          >
            <Image
              src={imgKMobile}
              alt=""
              fill
              loading="lazy"
              className="object-contain"
              sizes="(max-width: 768px) 240px, 156px"
              quality={90}
            />
          </div>

          {/* Mobile Vector Decoration */}
          <div
            className="absolute"
            style={{ right: '0px', bottom: '120px', width: '450px', height: '200px' }}
            aria-hidden="true"
          >
            <div className="absolute" style={{ inset: '-36.23% -15.58%' }}>
              <Image
                alt=""
                className="block max-w-none size-full"
                src={imgVectorMobile}
                fill
                loading="lazy"
                style={{ objectFit: 'contain' }}
                role="presentation"
              />
            </div>
          </div>

          <div
            className="hero-mobile-content absolute translate-x-[-50%]"
            style={{
              left: '50%',
              bottom: '120px',
              width: 'clamp(320px, 85vw, 400px)'
            }}
          >
            <div
              className="bg-black/40 backdrop-blur-sm rounded-xl px-4 py-3"
              style={{
                border: '1px solid rgba(255, 255, 255, 0.1)'
              }}
            >
              <div
                className="text-white text-center font-semibold mb-2"
                style={{
                  fontFamily: "var(--font-poppins), 'Poppins-Fallback', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif",
                  fontSize: 'clamp(16px, 4vw, 22px)',
                  lineHeight: '1.3',
                  direction: locale === 'ar' ? 'rtl' : 'ltr'
                }}
                dir={locale === 'ar' ? 'rtl' : 'ltr'}
              >
                {t('hero.welcome')}
              </div>
              <div
                className="hero-text-stable capitalize text-white text-center"
                style={{
                  fontFamily: "var(--font-poppins), 'Poppins-Fallback', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif",
                  fontWeight: 'normal',
                  wordWrap: 'break-word',
                  direction: locale === 'ar' ? 'rtl' : 'ltr'
                }}
                dir={locale === 'ar' ? 'rtl' : 'ltr'}
              >
                {t('hero.title')}
              </div>
            </div>
          </div>

          {/* Mobile Statistics Boxes */}
          <div className="absolute flex gap-3 translate-x-[-50%]" style={{ left: '50%', bottom: '75px' }}>
            <div className="bg-white/10 hero-decorative-blur rounded-lg px-3 py-2">
              <div className="text-white text-xs font-medium text-center whitespace-nowrap">
                {t('hero.stats.projects')}
              </div>
            </div>
            <div className="bg-white/10 hero-decorative-blur rounded-lg px-3 py-2">
              <div className="text-white text-xs font-medium text-center whitespace-nowrap">
                {t('hero.stats.founded')}
              </div>
            </div>
          </div>

          {/* Mobile Slide Indicators */}
          <div className="absolute flex items-center justify-center translate-x-[-50%]" style={{ left: '50%', bottom: '40px' }}>
            <SlideIndicators
              {...slideIndicatorProps}
              variant="mobile"
            />
          </div>
        </div>

        {/* Mobile Slide 2 - About Text - Lazy Load */}
        <div
          className={`absolute inset-0 transition-opacity duration-1000 ${
            currentSlide === 1 ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
          role="tabpanel"
          aria-labelledby="slide-1-label"
          aria-hidden={currentSlide !== 1}
          {...(currentSlide !== 1 && { inert: true })}
        >
          {/* PERFORMANCE: Only load slide 2 background when needed */}
          {(currentSlide === 1 || isClient) && (
            <Image
              src={imgScreenshot3}
              alt="KayanLive About Background"
              fill
              loading="lazy"
              quality={75}
              sizes="(max-width: 768px) 100vw, 768px"
              className="object-cover object-center"
            />
          )}

          {/* Mobile Central Diamond with Text */}
          <div
            className="absolute flex items-center justify-center"
            style={{
              left: '50%',
              top: '50%',
              transform: 'translate(-50%, -50%)',
              width: 'clamp(380px, 65vw, 420px)',
              height: 'clamp(380px, 65vw, 420px)'
            }}
          >
            <div style={{ transform: 'rotate(315deg)' }}>
              <div
                className="bg-white/13 hero-decorative-blur overflow-hidden relative"
                style={{
                  width: 'clamp(300px, 55vw, 340px)',
                  height: 'clamp(300px, 55vw, 340px)'
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
                      className="text-white text-center capitalize relative px-4 flex flex-col items-center justify-center hero-text-stable"
                      style={{
                        width: 'clamp(320px, 50vw, 300px)',
                        height: 'clamp(220px, 35vw, 240px)',
                        fontFamily: "var(--font-poppins), 'Poppins-Fallback', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif",
                        fontWeight: 'normal'
                      }}
                    >
                      <div className="flex flex-col items-center justify-center gap-2 px-2" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
                        <p className="mb-0 font-semibold" style={{ fontSize: 'clamp(16px, 3.2vw, 18px)' }}>
                          {t('hero.slide2Title')}
                        </p>
                        <p className="mb-0" style={{ fontSize: 'clamp(14px, 2.8vw, 16px)' }}>
                          {t('hero.slide2Subtitle')}
                        </p>
                        <div className="flex justify-center">
                          <Button
                            href={`/${locale}/contact`}
                            variant="default"
                            size="md"
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

          {/* Mobile Logo Watermark - Background (non-critical) */}
          <div
            className="absolute bg-center bg-cover bg-no-repeat opacity-[0.57] translate-x-[-50%] translate-y-[-50%]"
            style={{
              top: 'calc(50% + 326px)',
              left: 'calc(50% + 128px)',
              width: '665px',
              height: '222px',
              backgroundImage: `url('${imgKayanLogo}')`
            }}
            aria-hidden="true"
          />

          {/* Mobile Slide Indicators for slide 2 */}
          <div className="absolute flex items-center justify-center translate-x-[-50%]" style={{ left: '50%', bottom: '40px' }}>
            <SlideIndicators
              {...slideIndicatorProps}
              variant="mobile"
            />
          </div>
        </div>
      </div>

      {/* Desktop Layout */}
      <div
        className="hero-container relative bg-[#2c2c2b] overflow-hidden rounded-[61px] mx-4 mb-8 hidden lg:block"
        style={containerStyles.desktop}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        role="region"
        aria-label="Hero carousel"
        aria-live="polite"
        aria-atomic="true"
      >
        {/* Desktop Slide 1 - Main Hero */}
        <div
          className={`absolute inset-0 transition-opacity duration-1000 ${
            currentSlide === 0 ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
          role="tabpanel"
          aria-labelledby="slide-0-label"
          aria-hidden={currentSlide !== 0}
          {...(currentSlide !== 0 && { inert: true })}
        >
          <Image
            src={imgScreenshot1Desktop}
            alt="KayanLive Hero Background"
            fill
            priority
            quality={75}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 100vw, (max-width: 1600px) 1600px, 1920px"
            loading="eager"
            className="object-cover object-center"
            placeholder="blur"
            blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEAAoHBwgHBgoICAgLCgoLDhgQDg0NDh0VFhEYIx8lJCIfIiEmKzcvJik0KSEiMEExNDk7Pj4+JS5ESUM8SDc9PjsBCgsLDg0OHBAQHDsoIig7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O//AABEIAAABAAMBEQACEQEDEQH/xAAfAAABBQEBAQEBAQAAAAAAAAAAAQIDBAUGBwgJCgv/xAC1EAACAQMDAgQDBQUEBAAAAX0BAgMABBEFEiExQQYTUWEHInEUMoGRoQgjQrHBFVLR8CQzYnKCCQoWFxgZGiUmJygpKjQ1Njc4OTpDREVGR0hJSlNUVVZXWFlaY2RlZmdoaWpzdHV2d3h5eoOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4eLj5OXm5+jp6vHy8/T19vf4+fr/xAAfAQADAQEBAQEBAQEBAAAAAAAAAQIDBAUGBwgJCgv/xAC1EQACAQIEBAMEBwUEBAABAncAAQIDEQQFITEGEkFRB2FxEyIygZEUQqGxwdHwJSU0YgkWFxgZGiUmJygpKjQ1Njc4OTpDREVGR0hJSlNUVVZXWFlaY2RlZmdoaWpzdHV2d3h5eoGChISFhoeIiYqSk5SVlpeYmZqgo6SlpqeoqaqysbK1tre4ubrCw8TFxsfIycrS09TV1tfY2drh4uPk5ebn6Onq8fLz9PX29/j5+v/aAAwDAQACEQMRAD8A5/w="
            fetchPriority="high"
            style={{
              aspectRatio: '16/9',
              objectFit: 'cover'
            }}
          />

          {/* Desktop Centered Decorative Logo */}
          <div
            className="absolute opacity-[0.43] translate-x-[-50%] translate-y-[-50%]"
            style={{
              left: "calc(50% + 0.5px)",
              top: '50%',
              width: '280px',
              height: '446px',
            }}
            aria-hidden="true"
          >
            <Image
              src={imgKMobile}
              alt=""
              fill
              loading="lazy"
              className="object-contain"
              sizes="280px"
              quality={90}
            />
          </div>

          <div className="absolute left-0 right-0 w-full z-10 pointer-events-none" aria-hidden="true" style={{
            bottom: '60px'
          }}>
            <div className="relative w-full" style={{
              height: '290px',
            }}>
              <Image
                alt=""
                className="block w-full h-full"
                src={imgFrame1}
                width={1920}
                height={290}
                priority
                style={{
                  width: '100%',
                  height: 'auto',
                  objectFit: 'contain',
                  objectPosition: 'bottom'
                }}
                role="presentation"
                placeholder="empty"
              />
            </div>
          </div>

          <div
            className="hero-desktop-content absolute"
            style={{
              [locale === 'ar' ? 'right' : 'left']: '42px',
              bottom: '120px',
              width: 'clamp(700px, 70vw, 1100px)'
            }}
          >
            <div
              className="bg-black/40 backdrop-blur-md rounded-2xl px-8 py-6"
              style={{
                border: '1px solid rgba(255, 255, 255, 0.15)',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
              }}
            >
              <div
                className="text-white font-bold mb-3"
                style={{
                  textAlign: locale === 'ar' ? 'right' : 'left',
                  fontFamily: "var(--font-poppins), 'Poppins-Fallback', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif",
                  fontSize: 'clamp(28px, 3.5vw, 42px)',
                  lineHeight: '1.3',
                  direction: locale === 'ar' ? 'rtl' : 'ltr'
                }}
                dir={locale === 'ar' ? 'rtl' : 'ltr'}
              >
                {t('hero.welcome')}
              </div>
              <div
                className="hero-text-stable capitalize text-white"
                style={{
                  fontWeight: 'normal',
                  textAlign: locale === 'ar' ? 'right' : 'left',
                  wordWrap: 'break-word',
                  fontFamily: "var(--font-poppins), 'Poppins-Fallback', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif",
                  direction: locale === 'ar' ? 'rtl' : 'ltr'
                }}
                dir={locale === 'ar' ? 'rtl' : 'ltr'}
              >
                {t('hero.title')}
              </div>
            </div>
          </div>

          {/* Desktop Statistics Boxes */}
          <div
            className="absolute flex gap-6"
            style={{
              [locale === 'ar' ? 'right' : 'left']: '42px',
              bottom: '50px'
            }}
          >
            <div className="bg-white/10 hero-decorative-blur rounded-xl px-6 py-4">
              <div className="text-white text-lg font-semibold text-center whitespace-nowrap">
                {t('hero.stats.projects')}
              </div>
            </div>
            <div className="bg-white/10 hero-decorative-blur rounded-xl px-6 py-4">
              <div className="text-white text-lg font-semibold text-center whitespace-nowrap">
                {t('hero.stats.founded')}
              </div>
            </div>
          </div>

          {/* Desktop Slide Indicators */}
          <SlideIndicators
            {...slideIndicatorProps}
            variant="desktop"
            className="absolute"
            style={{
              [locale === 'ar' ? 'left' : 'right']: '76px',
              top: '424px'
            }}
          />
        </div>

        {/* Desktop Slide 2 - About Text - Lazy Load */}
        <div
          className={`absolute inset-0 transition-opacity duration-1000 ${
            currentSlide === 1 ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
          role="tabpanel"
          aria-labelledby="slide-1-label"
          aria-hidden={currentSlide !== 1}
          {...(currentSlide !== 1 && { inert: true })}
        >
          {/* PERFORMANCE: Desktop Slide 2 Background - Lazy loaded */}
          {(currentSlide === 1 || isClient) && (
            <Image
              src={imgScreenshot3}
              alt="KayanLive About Background"
              fill
              loading="lazy"
              quality={75}
              sizes="(min-width: 1024px) 100vw, 1600px"
              className="object-cover object-center"
            />
          )}

          {/* Logo Watermark - Background (non-critical) */}
          <div
            className="absolute bg-center bg-cover bg-no-repeat opacity-[0.57]"
            style={{
              width: '1241px',
              height: '414px',
              left: '238px',
              top: '748px',
              backgroundImage: `url('${imgKayanLogo}')`
            }}
            aria-hidden="true"
          />

          {/* Decorative Diamonds - bottom left */}
          <div className="absolute" style={{ left: '30px', top: '834px' }} aria-hidden="true">
            <div className="flex" style={{ gap: '27px' }}>
              <div
                className="flex items-center justify-center"
                style={{ width: '87.725px', height: '87.725px' }}
              >
                <div style={{ transform: 'rotate(315deg)' }}>
                  <div
                    className="hero-decorative-blur"
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
                    className="hero-decorative-blur"
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
                      className="text-white text-center capitalize px-8 hero-text-stable"
                      style={{
                        maxWidth: '627px',
                        fontSize: 'clamp(20px, 2.5vw, 28px)',
                        lineHeight: 'clamp(28px, 3.5vw, 38px)',
                        fontWeight: '500',
                        minHeight: 'fit-content',
                        fontFamily: "var(--font-poppins), 'Poppins-Fallback', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif"
                      }}
                      dir={locale === 'ar' ? 'rtl' : 'ltr'}
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
                          {t('hero.cta')}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Desktop Slide Indicators */}
          <SlideIndicators
            {...slideIndicatorProps}
            variant="desktop"
            className="absolute"
            style={{
              [locale === 'ar' ? 'left' : 'right']: '76px',
              top: '424px'
            }}
          />
        </div>
      </div>
    </>
  );
}