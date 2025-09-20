'use client';

import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import type { ReactNode } from 'react';

// Constants
const DECORATIVE_IMAGE_PATH = "/optimized/about-hero/1349ad630f81a3bb2a509dd8abfe0e4ef85fa329-about-hero-desktop.webp";
const ANIMATION_TIMING = {
  LOAD_DELAY: 100,
  INTERSECTION_THRESHOLD: 0.1,
  INTERSECTION_ROOT_MARGIN: '100px 0px -50px 0px',
  FALLBACK_DELAY: 300,
  TRANSITION_DURATION: 500
} as const;

// Type definitions
interface ComponentState {
  isLoaded: boolean;
  isVisible: boolean;
  imageLoaded: boolean;
  imageError: boolean;
}

// Safe text sanitization helper
const sanitizeText = (text: ReactNode): string => {
  if (typeof text === 'string') {
    return text.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '').trim();
  }
  return String(text || '').trim();
};

export default function AboutHero() {
  const t = useTranslations('about.hero');

  // Component state management with proper typing
  const [state, setState] = useState<ComponentState>({
    isLoaded: false,
    isVisible: false,
    imageLoaded: false,
    imageError: false
  });

  const sectionRef = useRef<HTMLElement>(null);

  // State update helpers
  const updateState = useCallback((updates: Partial<ComponentState>) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  // Memoized styles to prevent recreation on every render
  const memoizedStyles = useMemo(() => ({
    sectionMinHeight: { minHeight: 'clamp(450px, 50vh, 600px)' },
    mobileHeader: {
      width: "clamp(260px, 70vw, 380px)",
      fontSize: "clamp(60px, 11vw, 85px)",
      lineHeight: "clamp(52px, 9.5vw, 75px)",
      fontFamily: '"Poppins", sans-serif',
      background: 'linear-gradient(to right, #c084fc, #7dd3fc)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      backgroundClip: 'text',
      paddingLeft: "clamp(16px, 4vw, 20px)",
      paddingRight: "clamp(16px, 4vw, 20px)"
    },
    mobileContent: {
      width: "clamp(300px, 85vw, 420px)",
      fontSize: "clamp(20px, 3.5vw, 32px)",
      lineHeight: "1.25em",
      fontFamily: '"Poppins", sans-serif'
    },
    mobileText: {
      width: "clamp(280px, 75vw, 480px)",
      fontSize: "clamp(15px, 2.3vw, 18px)",
      lineHeight: "1.27em",
      fontFamily: '"Poppins", sans-serif'
    },
    desktopSubtitle: {
      fontSize: "clamp(1.8vw, 3.2vw, 48px)",
      lineHeight: "1.3em",
      background: 'linear-gradient(to right, #c084fc, #7dd3fc)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      backgroundClip: 'text',
      fontFamily: '"Poppins", sans-serif'
    },
    desktopDescription: {
      fontSize: "clamp(0.8vw, 1.5vw, 22px)",
      lineHeight: "1.27em",
      fontFamily: '"Poppins", sans-serif'
    },
    gradientTextBase: {
      background: 'linear-gradient(to right, #c084fc, #7dd3fc)',
      WebkitBackgroundClip: 'text',
      MozBackgroundClip: 'text',
      backgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      color: 'transparent'
    }
  }), []);

  // Memoized safe rich text components with accessibility improvements
  const richTextComponents = useMemo(() => ({
    marketStat: (chunks: React.ReactNode) => (
      <span
        className="relative inline-block group cursor-help transition-all duration-200 hover:scale-105 focus:scale-105 focus:outline-2 focus:outline-blue-500 focus:outline-offset-2 font-semibold"
        style={{
          background: 'linear-gradient(135deg, #7dd3fc, #c084fc)',
          WebkitBackgroundClip: 'text',
          MozBackgroundClip: 'text',
          backgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          color: 'transparent',
          padding: '4px 8px',
          borderRadius: '6px',
          marginLeft: '2px',
          marginRight: '2px',
          fontSize: '1.05em',
          filter: 'brightness(1.2)',
          WebkitFilter: 'brightness(1.2)',
          position: 'relative'
        }}
        title={sanitizeText(chunks)}
        role="mark"
        aria-label={`Highlighted statistic: ${sanitizeText(chunks)}`}
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            // Announce the statistic to screen readers
            const announcement = `Market statistic: ${sanitizeText(chunks)}`;
            console.log(announcement); // For development
          }
        }}
      >
        {sanitizeText(chunks)}
      </span>
    ),
    purchaseStat: (chunks: React.ReactNode) => (
      <span
        className="relative inline-block group cursor-help transition-all duration-200 hover:scale-105 focus:scale-105 focus:outline-2 focus:outline-blue-500 focus:outline-offset-2 font-semibold"
        style={{
          background: 'linear-gradient(135deg, #7dd3fc, #c084fc)',
          WebkitBackgroundClip: 'text',
          MozBackgroundClip: 'text',
          backgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          color: 'transparent',
          padding: '4px 8px',
          borderRadius: '6px',
          marginLeft: '2px',
          marginRight: '2px',
          fontSize: '1.05em',
          filter: 'brightness(1.2)',
          WebkitFilter: 'brightness(1.2)',
          position: 'relative'
        }}
        title={sanitizeText(chunks)}
        role="mark"
        aria-label={`Highlighted statistic: ${sanitizeText(chunks)}`}
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            // Announce the statistic to screen readers
            const announcement = `Purchase statistic: ${sanitizeText(chunks)}`;
            console.log(announcement); // For development
          }
        }}
      >
        {sanitizeText(chunks)}
      </span>
    ),
    citation: (chunks: React.ReactNode) => (
      <span className="text-xs text-gray-300" title={sanitizeText(chunks)} role="note">
        {sanitizeText(chunks)}
      </span>
    )
  }), []);

  useEffect(() => {
    const timer = setTimeout(() => {
      updateState({ isLoaded: true });
    }, ANIMATION_TIMING.LOAD_DELAY);
    return () => clearTimeout(timer);
  }, [updateState]);

  // Image loading and error handling
  useEffect(() => {
    const img = new Image();
    const handleImageLoad = () => {
      updateState({ imageLoaded: true, imageError: false });
    };
    const handleImageError = () => {
      updateState({ imageError: true, imageLoaded: false });
      console.warn('Failed to load hero decorative image:', DECORATIVE_IMAGE_PATH);
    };

    img.onload = handleImageLoad;
    img.onerror = handleImageError;
    img.src = DECORATIVE_IMAGE_PATH;

    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [updateState]);

  useEffect(() => {
    // Browser compatibility check
    if (typeof window !== 'undefined' && !window.IntersectionObserver) {
      const timer = setTimeout(() => {
        updateState({ isVisible: true });
      }, ANIMATION_TIMING.FALLBACK_DELAY);
      return () => clearTimeout(timer);
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          updateState({ isVisible: true });
          observer.disconnect(); // Stop observing once visible to prevent memory leaks
        }
      },
      {
        threshold: 0.1,
        rootMargin: '100px 0px -50px 0px'
      }
    );

    // Use ref.current directly in cleanup to prevent stale closure
    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      observer.disconnect(); // Always disconnect observer on cleanup
    };
  }, [updateState]);


  return (
    <section
      ref={sectionRef}
      className="relative bg-[#2c2c2b] overflow-hidden rounded-[25px] md:rounded-[43px] lg:rounded-[61px] w-full"
      style={memoizedStyles.sectionMinHeight}
      aria-label="About KayanLive hero section"
    >
      <style>{`
        /* Consolidated fade up animation - works for both mobile and desktop */
        @keyframes fadeUp {
          from {
            opacity: 0;
            transform: translateY(40px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @-webkit-keyframes fadeUp {
          from {
            opacity: 0;
            -webkit-transform: translateY(40px);
          }
          to {
            opacity: 1;
            -webkit-transform: translateY(0);
          }
        }

        /* Optimized floating animation */
        @keyframes floatGentle {
          0%, 100% {
            filter: brightness(1);
            transform: translateY(0);
          }
          50% {
            filter: brightness(1.05);
            transform: translateY(-10px);
          }
        }

        @-webkit-keyframes floatGentle {
          0%, 100% {
            -webkit-filter: brightness(1);
            -webkit-transform: translateY(0);
          }
          50% {
            -webkit-filter: brightness(1.05);
            -webkit-transform: translateY(-10px);
          }
        }

        /* Simplified pulse animation for mobile */
        @keyframes pulseGlow {
          0%, 100% {
            filter: brightness(1);
            opacity: 0.5;
          }
          50% {
            filter: brightness(1.1);
            opacity: 0.6;
          }
        }

        @-webkit-keyframes pulseGlow {
          0%, 100% {
            -webkit-filter: brightness(1);
            opacity: 0.5;
          }
          50% {
            -webkit-filter: brightness(1.1);
            opacity: 0.6;
          }
        }

        /* Desktop pulse with scale effect */
        @keyframes pulseGlowDesktop {
          0%, 100% {
            transform: scale(1);
            filter: brightness(1);
          }
          50% {
            transform: scale(1.02);
            filter: brightness(1.1);
          }
        }

        @-webkit-keyframes pulseGlowDesktop {
          0%, 100% {
            -webkit-transform: scale(1);
            -webkit-filter: brightness(1);
          }
          50% {
            -webkit-transform: scale(1.02);
            -webkit-filter: brightness(1.1);
          }
        }

        /* Tooltip animation */
        @keyframes tooltipShow {
          from {
            opacity: 0;
            transform: translateX(-50%) translateY(-8px) scale(0.85);
          }
          to {
            opacity: 1;
            transform: translateX(-50%) translateY(-8px) scale(1);
          }
        }

        @-webkit-keyframes tooltipShow {
          from {
            opacity: 0;
            -webkit-transform: translateX(-50%) translateY(-8px) scale(0.85);
          }
          to {
            opacity: 1;
            -webkit-transform: translateX(-50%) translateY(-8px) scale(1);
          }
        }

        /* Unified animation classes with staggered delays */
        .animate-fade-up-1 {
          animation: fadeUp 0.8s ease-out 0.2s both;
          -webkit-animation: fadeUp 0.8s ease-out 0.2s both;
        }

        .animate-fade-up-2 {
          animation: fadeUp 0.8s ease-out 0.4s both;
          -webkit-animation: fadeUp 0.8s ease-out 0.4s both;
        }

        .animate-fade-up-3 {
          animation: fadeUp 0.8s ease-out 0.6s both;
          -webkit-animation: fadeUp 0.8s ease-out 0.6s both;
        }

        /* Desktop uses same animation with different class names for clarity */
        .animate-fade-up-desktop-1 {
          animation: fadeUp 0.8s ease-out 0.2s both;
          -webkit-animation: fadeUp 0.8s ease-out 0.2s both;
        }

        .animate-fade-up-desktop-2 {
          animation: fadeUp 0.8s ease-out 0.4s both;
          -webkit-animation: fadeUp 0.8s ease-out 0.4s both;
        }

        .animate-fade-up-desktop-3 {
          animation: fadeUp 0.8s ease-out 0.6s both;
          -webkit-animation: fadeUp 0.8s ease-out 0.6s both;
        }

        /* Decorative animations */
        .animate-float-gentle {
          animation: floatGentle 4s ease-in-out infinite;
          -webkit-animation: floatGentle 4s ease-in-out infinite;
        }

        .animate-pulse-glow {
          animation: pulseGlow 3s ease-in-out infinite;
          -webkit-animation: pulseGlow 3s ease-in-out infinite;
        }

        .animate-pulse-glow-desktop {
          animation: pulseGlowDesktop 3s ease-in-out infinite;
          -webkit-animation: pulseGlowDesktop 3s ease-in-out infinite;
        }

        /* Optimized tooltip styles */
        .group:hover .tooltip-content {
          opacity: 1;
          transform: translateX(-50%) translateY(-4px) scale(1);
          animation: tooltipShow 0.3s ease forwards;
        }

        .tooltip-content {
          z-index: 9999;
          position: absolute;
        }

        /* Responsive section heights */
        @media (min-width: 768px) {
          section {
            min-height: clamp(500px, 55vh, 700px);
          }
        }

        @media (min-width: 1024px) {
          section {
            min-height: clamp(600px, 60vh, 900px);
          }
        }

        /* Accessibility: High contrast mode support */
        @media (prefers-contrast: high) {
          h1, h2 {
            background: #ffffff;
            -webkit-background-clip: unset;
            -webkit-text-fill-color: unset;
            background-clip: unset;
            color: #ffffff;
            filter: none;
            text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.8);
          }

          .text-gray-300, .text-gray-400 {
            color: #ffffff;
          }

          [role="mark"] {
            background: #ffffff;
            -webkit-background-clip: unset;
            -webkit-text-fill-color: unset;
            background-clip: unset;
            color: #000000;
            background-color: #ffffff;
            filter: none;
          }
        }

        /* Accessibility: Reduced motion preferences */
        @media (prefers-reduced-motion: reduce) {
          * {
            animation-duration: 0.01ms;
            animation-iteration-count: 1;
            transition-duration: 0.01ms;
          }
        }

        /* Accessibility: Enhanced focus and skip link styles */
        [tabindex="0"]:focus-visible {
          outline: 2px solid #3b82f6;
          outline-offset: 2px;
          border-radius: 4px;
        }

        .sr-only:focus {
          position: absolute;
          width: auto;
          height: auto;
          padding: 8px 16px;
          margin: 0;
          overflow: visible;
          clip: auto;
          white-space: nowrap;
          background: #ffffff;
          color: #000000;
          text-decoration: none;
          border-radius: 4px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          z-index: 9999;
        }
      `}</style>

      {/* Loading state */}
      {!state.isLoaded && (
        <div className="absolute inset-0 animate-pulse bg-gray-700 rounded-[25px] md:rounded-[43px] lg:rounded-[61px]" />
      )}

      <div className={`relative min-h-full transition-opacity duration-500 ${state.isLoaded ? 'opacity-100' : 'opacity-0'}`}>

        {/* Mobile/Tablet Content - Centered */}
        <div className="flex flex-col items-center justify-center min-h-full lg:hidden z-10 py-8 px-4">
          <div className="flex flex-col items-center justify-center space-y-6 max-w-full">
            <header
              className={`text-center ${state.isVisible ? 'animate-fade-up-1' : 'opacity-0'}`}
              style={memoizedStyles.mobileHeader}
            >
              <h2>{t('title')}</h2>
            </header>

            <div
              className={`text-center ${state.isVisible ? 'animate-fade-up-2' : 'opacity-0'}`}
              style={{
                width: "clamp(300px, 85vw, 420px)",
                fontSize: "clamp(20px, 3.5vw, 32px)",
                lineHeight: "clamp(22px, 3.8vw, 34px)",
                fontFamily: '"Poppins", sans-serif',
                paddingLeft: "clamp(16px, 4vw, 24px)",
                paddingRight: "clamp(16px, 4vw, 24px)",
                textTransform: 'capitalize',
                overflow: 'visible'
              }}
            >
              <div style={{
                background: 'linear-gradient(to right, #a095e1, #74cfaa)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                wordWrap: 'break-word',
                overflowWrap: 'break-word',
                hyphens: 'auto',
                marginBottom: "clamp(10px, 3vw, 20px)"
              }}>
                {t('subtitle1')}
              </div>
              <div className="text-white">{t('subtitle2')}</div>
            </div>

            <div
              className={`text-[#b2b2b2] text-center ${state.isVisible ? 'animate-fade-up-3' : 'opacity-0'}`}
              style={{
                width: "clamp(280px, 75vw, 480px)",
                fontSize: "clamp(15px, 2.3vw, 18px)",
                lineHeight: "clamp(19px, 3vw, 24px)",
                fontFamily: '"Poppins", sans-serif',
                paddingLeft: "clamp(20px, 5vw, 24px)",
                paddingRight: "clamp(20px, 5vw, 24px)"
              }}
            >
              <div className="mb-4">
                {t.rich('paragraph1', richTextComponents)}
              </div>
              <div>
                {t.rich('paragraph2', richTextComponents)}
              </div>
            </div>
          </div>
        </div>

        {/* Desktop Content - Zig-Zag Layout */}
        <div className="hidden lg:flex lg:flex-col lg:justify-center lg:min-h-full lg:py-8 lg:px-12 xl:px-16">
          <div className="grid grid-cols-12 gap-8 lg:gap-12">
            {/* Title - Top Left */}
            <div className="col-span-6 mb-8">
              <header className={`${state.isVisible ? 'animate-fade-up-desktop-1' : 'opacity-0'}`}>
                <h1
                  className="font-bold z-10"
                  style={{
                    fontSize: "clamp(3.5vw, 9.9vw, 150px)",
                    lineHeight: "0.93em",
                    background: 'linear-gradient(to right, #c084fc, #7dd3fc)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    fontFamily: '"Poppins", sans-serif',
                    margin: 0,
                    filter: 'brightness(1.1)',
                WebkitFilter: 'brightness(1.1)'
                  }}
                  aria-label={`Main heading: ${t('title')}`}
                >
                  {t('title')}
                </h1>
              </header>
            </div>

            {/* Empty space - Top Right */}
            <div className="col-span-6"></div>

            {/* Empty space - Middle Left */}
            <div className="col-span-6"></div>

            {/* Subtitle - Middle Right */}
            <div className="col-span-6 mb-8">
              <div
                className={`text-right font-medium z-10 ${state.isVisible ? 'animate-fade-up-desktop-2' : 'opacity-0'}`}
                style={{
                  fontSize: "clamp(1.8vw, 3.2vw, 48px)",
                  lineHeight: "1.3em",
                  fontFamily: '"Poppins", sans-serif',
                  textTransform: 'capitalize'
                }}
              >
                <div style={{
                  background: 'linear-gradient(to right, #a095e1, #74cfaa)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  display: 'block',
                  marginBottom: 'clamp(8px, 1vw, 16px)'
                }}>
                  {t('subtitle1')}
                </div>
                <div className="text-white">{t('subtitle2')}</div>
              </div>
            </div>

            {/* Paragraphs - Bottom Left */}
            <div className="col-span-6">
              <div
                className={`text-[#cfcfcf] z-10 ${state.isVisible ? 'animate-fade-up-desktop-3' : 'opacity-0'}`}
                style={{
                  fontSize: "clamp(0.8vw, 1.5vw, 22px)",
                  lineHeight: "1.27em",
                  fontFamily: '"Poppins", sans-serif'
                }}
              >
                <div className="mb-4">
                  {t.rich('paragraph1', richTextComponents)}
                </div>
                <div>
                  {t.rich('paragraph2', richTextComponents)}
                </div>
              </div>
            </div>

            {/* Empty space - Bottom Right */}
            <div className="col-span-6"></div>
          </div>
        </div>

        {/* Decorative Elements - Mobile/Tablet - only show if image loaded */}
        {state.imageLoaded && !state.imageError && (
          <div
            className={`absolute lg:hidden transition-opacity duration-500 ${state.isLoaded ? 'animate-float-gentle' : ''} ${state.imageLoaded ? 'opacity-50' : 'opacity-0'}`}
            style={{
              backgroundImage: `url('${DECORATIVE_IMAGE_PATH}')`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
              height: 'clamp(180px, 25vw, 260px)',
              width: 'clamp(115px, 16vw, 170px)',
              right: 'clamp(-15px, -3vw, 15px)',
              top: 'clamp(-70px, -8vw, -40px)',
              zIndex: 1
            }}
            aria-hidden="true"
          />
        )}

        {state.imageLoaded && !state.imageError && (
          <div
            className={`absolute lg:hidden overflow-hidden transition-opacity duration-500 ${state.isLoaded ? 'animate-pulse-glow' : ''} ${state.imageLoaded ? 'opacity-50' : 'opacity-0'}`}
            style={{
              backgroundImage: `url('${DECORATIVE_IMAGE_PATH}')`,
              backgroundSize: 'cover',
              backgroundPosition: 'top center',
              backgroundRepeat: 'no-repeat',
              height: 'clamp(90px, 12vw, 130px)',
              width: 'clamp(115px, 16vw, 170px)',
              right: 'clamp(-25px, -6vw, 5px)',
              bottom: 'clamp(-15px, -2vw, 5px)',
              zIndex: 1
            }}
            aria-hidden="true"
          />
        )}

        {/* Decorative Elements - Desktop - only show if image loaded */}
        {state.imageLoaded && !state.imageError && (
          <>
            <div
              className={`absolute hidden lg:block transition-opacity duration-500 ${state.isLoaded ? 'animate-pulse-glow-desktop' : ''} ${state.imageLoaded ? 'opacity-50' : 'opacity-0'}`}
              style={{
                backgroundImage: `url('${DECORATIVE_IMAGE_PATH}')`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
                height: '49%',
                width: '20%',
                left: '64.5%',
                top: '-24.5%',
                transformOrigin: 'center',
                zIndex: 1
              }}
              aria-hidden="true"
            />

            <div
              className={`absolute hidden lg:block transition-opacity duration-500 ${state.isLoaded ? 'animate-pulse-glow-desktop' : ''} ${state.imageLoaded ? 'opacity-50' : 'opacity-0'}`}
              style={{
                backgroundImage: `url('${DECORATIVE_IMAGE_PATH}')`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
                height: '63%',
                width: '25.7%',
                left: '82%',
                bottom: '-31.5%',
                transformOrigin: 'center',
                zIndex: 1
              }}
              aria-hidden="true"
            />
          </>
        )}
      </div>

      {/* Screen reader skip link */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-white text-black px-4 py-2 rounded z-50 focus:outline-2 focus:outline-blue-500 transition-all duration-200"
        aria-label="Skip to main content"
      >
        {t('skipToContent') || 'Skip to main content'}
      </a>
    </section>
  );
}