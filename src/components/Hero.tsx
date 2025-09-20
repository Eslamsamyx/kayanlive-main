'use client';

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import Image from 'next/image';
import { useTranslations, useLocale } from 'next-intl';
import Button from './Button';

// Assets - Using optimized versions with responsive variants
const imgScreenshot1Desktop = "/optimized/hero-main/01f5d49d03c8455dc99b2ad32446b6657b1949e0-hero-main-desktop.webp";
const imgScreenshot1Mobile = "/optimized/hero-main/01f5d49d03c8455dc99b2ad32446b6657b1949e0-hero-main-mobile.webp";
const imgScreenshot1Tablet = "/optimized/hero-main/01f5d49d03c8455dc99b2ad32446b6657b1949e0-hero-main-tablet.webp";
const imgScreenshot3 = "/optimized/hero-slide/b0d9ec6faacc00d7ed8b82f3f45ecaa371425181-hero-slide-desktop.webp";
const imgFrame1 = "/assets/bac2af3eca424e14c720bab9f5fabec434faaa31.svg";
const imgKayanLogo = "/optimized/footer-logo/823c27de600ccd2f92af3e073c8e10df3a192e5c-footer-logo-desktop.webp";
const imgKMobile = "/optimized/client-logo/873e726ea40f8085d26088ffc29bf8dfb68b10ee-client-logo-desktop.webp";
const imgVectorMobile = "/assets/280033d008f397b92a0642ef0eb81b067b3be2fd.svg";

// Constants
const SLIDE_INTERVAL = 6000;
const PAUSE_DURATION = 10000;
const TOTAL_SLIDES = 2;

// Reusable slide indicator component within the same file
function SlideIndicators({
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
}) {
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
}

export default function Hero() {
  const t = useTranslations();
  const locale = useLocale();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [frameImageLoaded, setFrameImageLoaded] = useState(false);
  const pauseTimeoutRef = useRef<number | undefined>(undefined);
  const totalSlides = TOTAL_SLIDES;

  // Client-side hydration check for performance
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Memoized style calculations
  const containerStyles = useMemo(() => ({
    mobile: {
      height: 'var(--hero-mobile-height)',
      minHeight: '600px'
    },
    desktop: {
      height: 'var(--hero-desktop-height)',
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

    // Clear existing timeout
    if (pauseTimeoutRef.current) {
      clearTimeout(pauseTimeoutRef.current);
    }

    // Set new timeout
    pauseTimeoutRef.current = setTimeout(() => setIsPaused(false), PAUSE_DURATION) as unknown as number;
  }, []);

  // Memoized slide indicator props for performance
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
          --hero-mobile-height: clamp(600px, 85vh, 800px);
          --hero-desktop-height: clamp(955px, 100vh, 1200px);
        }

        .hero-slide-indicator {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
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
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          will-change: auto;
          transform: translateZ(0);
        }

        .hero-decorative-blur {
          /* Use background instead of backdrop-filter for better performance */
          background: rgba(255, 255, 255, 0.08);
          will-change: auto;
        }

        .hero-mobile-content {
          will-change: transform;
        }

        .hero-desktop-content {
          will-change: transform;
        }

        /* CRITICAL FIX: Reserve space for decorative frame to prevent CLS */
        .hero-frame-container {
          /* Fixed dimensions prevent layout shift */
          width: 1445.84px;
          height: 290.092px;
          position: absolute;
          top: clamp(727px, calc(727px + (var(--hero-desktop-height) - 955px) * 0.6), 900px);
          left: calc(50% - 0.08px);
          transform: translateX(-50%);
          /* Ensure space is reserved even before image loads */
          background: transparent;
          contain: layout;
        }

        .hero-frame-inner {
          position: absolute;
          bottom: -32.03%;
          top: -39.99%;
          /* Prevent layout shifts by maintaining aspect ratio */
          width: 100%;
          height: 100%;
        }

        /* CRITICAL FIX: Font loading optimization */
        .hero-text-stable {
          /* Reserve font space to prevent CLS */
          font-size: clamp(36px, 4vw, 50px);
          line-height: 1.3;
          /* Use fallback that matches final font metrics */
          font-family: 'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
          font-display: swap;
          /* Stabilize text rendering */
          text-rendering: optimizeSpeed;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }

        @media (prefers-reduced-motion: reduce) {
          .hero-backdrop-blur {
            backdrop-filter: none;
            -webkit-backdrop-filter: none;
            background-color: rgba(255, 255, 255, 0.1);
          }

          .hero-decorative-blur {
            background-color: rgba(255, 255, 255, 0.1);
          }

          .hero-slide-indicator,
          .hero-slide-indicator-inner,
          .hero-slide-indicator-active {
            transition: none;
          }

          .hero-mobile-content,
          .hero-desktop-content {
            will-change: auto;
          }
        }

        @media (max-width: 768px) {
          .hero-backdrop-blur {
            backdrop-filter: blur(5px);
          }

          .hero-decorative-blur {
            backdrop-filter: blur(3px);
          }

          .hero-text-stable {
            font-size: clamp(18px, 4.5vw, 22px);
            line-height: clamp(20px, 5vw, 24px);
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
          {/* CRITICAL FIX: Mobile Background Image - Maximum LCP optimization */}
          <Image
            src={imgScreenshot1Mobile}
            alt="KayanLive Hero Background"
            fill
            priority
            quality={50}
            sizes="(max-width: 768px) 100vw, 768px"
            className="object-cover object-center"
            placeholder="blur"
            blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyiwjHvYmUAR+IRqzHMa2biSqKmZcPYLBJDlDMZqYJJGgkC+4RP5QTLcNNXCpqGHaWCzzJEyswzGYOEgBqhNY6nJJAWZlOUQqyh1iB9ZYXhrOVmNTNATaTZHPZ4m/d6rKGlLFgZWT8/nfKE7SzyN0HHf6ORPKRK7Xt4m4NeVuNNY6nJJAWZlOUQqyh1iB9ZYXhr"
            fetchPriority="high"
            style={{
              aspectRatio: '16/9',
              objectFit: 'cover'
            }}
          />

          {/* Mobile/Tablet Centered Logo - Background Image (smaller, non-critical) */}
          <div
            className="absolute hero-backdrop-blur bg-center bg-cover bg-no-repeat opacity-[0.43] translate-x-[-50%] translate-y-[-50%]"
            style={{
              left: "calc(50% + 0.5px)",
              top: '50%',
              width: 'clamp(156px, 20vw, 240px)',
              height: 'clamp(248px, 32vw, 382px)',
              backgroundImage: `url('${imgKMobile}')`
            }}
            aria-hidden="true"
          />

          {/* Mobile Vector Decoration - Lazy loaded */}
          <div
            className="absolute"
            style={{ left: '0px', bottom: '150px', width: '321px', height: '138px' }}
            aria-hidden="true"
          >
            <div className="absolute" style={{ inset: '-36.23% -15.58%' }}>
              <Image
                alt="Decorative vector pattern"
                className="block max-w-none size-full"
                src={imgVectorMobile}
                fill
                loading="lazy"
                style={{ objectFit: 'contain' }}
                role="img"
                onError={() => console.warn('Failed to load vector mobile image')}
              />
            </div>
          </div>

          {/* Mobile Text Content - CRITICAL FIX: Stable text metrics */}
          <div
            className="hero-mobile-content hero-text-stable absolute capitalize text-white text-center translate-x-[-50%]"
            style={{
              fontFamily: "'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif",
              fontWeight: 'normal',
              left: '50%',
              bottom: '120px',
              width: 'clamp(260px, 70vw, 281px)',
              wordWrap: 'break-word'
            }}
          >
            {t('hero.title')}
          </div>

          {/* Mobile Statistics Boxes */}
          <div className="absolute flex gap-3 translate-x-[-50%]" style={{ left: '50%', bottom: '75px' }}>
            <div className="bg-white/10 hero-decorative-blur border border-white/20 rounded-lg px-3 py-2">
              <div className="text-white text-xs font-medium text-center whitespace-nowrap">
                {t('hero.stats.projects')}
              </div>
            </div>
            <div className="bg-white/10 hero-decorative-blur border border-white/20 rounded-lg px-3 py-2">
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
              quality={60}
              sizes="(max-width: 768px) 100vw, 400px"
              className="object-cover"
              style={{
                objectPosition: '47.69% 0%',
                transform: 'scale(3.7372)'
              }}
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
                        fontFamily: "'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif",
                        fontWeight: 'normal'
                      }}
                    >
                      <div className="flex flex-col items-center justify-center gap-2 px-2">
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
          {/* CRITICAL FIX: Desktop Background Image - Maximum LCP optimization */}
          <Image
            src={imgScreenshot1Desktop}
            alt="KayanLive Hero Background"
            fill
            priority
            quality={50}
            sizes="(min-width: 1600px) 1600px, (min-width: 1024px) 100vw, 1600px"
            className="object-cover object-center"
            placeholder="blur"
            blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyiwjHvYmUAR+IRqzHMa2biSqKmZcPYLBJDlDMZqYJJGgkC+4RP5QTLcNNXCpqGHaWCzzJEyswzGYOEgBqhNY6nJJAWZlOUQqyh1iB9ZYXhrOVmNTNATaTZHPZ4m/d6rKGlLFgZWT8/nfKE7SzyN0HHf6ORPKRK7Xt4m4NeVuNNY6nJJAWZlOUQqyh1iB9ZYXhr"
            fetchPriority="high"
            style={{
              aspectRatio: '16/9',
              objectFit: 'cover'
            }}
          />

          {/* Desktop Centered Decorative Logo - Background (non-critical) */}
          <div
            className="absolute hero-backdrop-blur bg-center bg-cover bg-no-repeat opacity-[0.43] translate-x-[-50%] translate-y-[-50%]"
            style={{
              left: "calc(50% + 0.5px)",
              top: '50%',
              width: '280px',
              height: '446px',
              backgroundImage: `url('${imgKMobile}')`
            }}
            aria-hidden="true"
          />

          {/* CRITICAL FIX: Decorative Frame - Fixed container to prevent CLS */}
          <div className="hero-frame-container" aria-hidden="true">
            <div className="hero-frame-inner" style={{
              [locale === 'ar' ? 'right' : 'left']: '-10.58%',
              [locale === 'ar' ? 'left' : 'right']: '0',
              transform: locale === 'ar' ? 'scaleX(-1)' : 'none'
            }}>
              <Image
                alt="Decorative frame border"
                className="block max-w-none"
                src={imgFrame1}
                width={1445}
                height={290}
                priority
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain'
                }}
                role="img"
                onLoad={() => setFrameImageLoaded(true)}
                onError={() => console.warn('Failed to load frame image')}
                placeholder="empty"
              />
            </div>
          </div>

          {/* Text Content - CRITICAL FIX: Stable text metrics */}
          <div
            className="hero-desktop-content hero-text-stable absolute capitalize text-white"
            style={{
              fontWeight: 'bold',
              [locale === 'ar' ? 'right' : 'left']: '42px',
              bottom: '120px',
              width: 'clamp(600px, 60vw, 875px)',
              textAlign: locale === 'ar' ? 'right' : 'left',
              wordWrap: 'break-word',
              fontFamily: "'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif"
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
            <div className="bg-white/10 hero-decorative-blur border border-white/20 rounded-xl px-6 py-4">
              <div className="text-white text-lg font-semibold text-center whitespace-nowrap">
                {t('hero.stats.projects')}
              </div>
            </div>
            <div className="bg-white/10 hero-decorative-blur border border-white/20 rounded-xl px-6 py-4">
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
              quality={60}
              sizes="(min-width: 1024px) 100vw, 1200px"
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
                        fontFamily: "'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif"
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