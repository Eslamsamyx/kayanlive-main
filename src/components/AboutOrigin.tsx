'use client';

import { useTranslations } from 'next-intl';
import { useEffect, useState, useRef, useMemo } from 'react';

// Constants
const PATTERN_IMAGE = "/assets/ef25fd14e49122ddd6cbc03c8a92caff93500eb7.png";
const INTERSECTION_THRESHOLD = 0.1;
const INTERSECTION_ROOT_MARGIN = '50px';
const FALLBACK_DELAY = 300;

// Type definitions
interface CardContent {
  title: string;
  paragraphs: React.ReactNode[];
}

interface OriginCardProps {
  title: string;
  paragraphs: React.ReactNode[];
  variant: 'primary' | 'secondary';
  isVisible: boolean;
}

interface BackgroundPatternProps {
  position: 'left' | 'right';
  rotation: string;
}

// Individual card component with enhanced TypeScript
function OriginCard({
  title,
  paragraphs,
  variant,
  isVisible
}: OriginCardProps) {
  const delayClass = variant === 'primary' ? 'animate-delay-100' : 'animate-delay-300';
  const decorationPosition = variant === 'primary' ? 'top-0 right-0' : 'top-0 left-0';
  const gradientDirection = variant === 'primary'
    ? 'from-[#74cfaa]/5 to-[#a095e1]/5'
    : 'from-[#a095e1]/5 to-[#74cfaa]/5';

  return (
    <article
      className={`
        origin-card group
        bg-white/70 backdrop-blur-sm border border-[#74cfaa]/30 rounded-3xl
        relative overflow-hidden
        w-full max-w-sm md:max-w-xs lg:max-w-sm xl:max-w-lg md:flex-1
        flex flex-col
        transition-all duration-[400ms] cubic-bezier(0.4,0,0.2,1)
        hover:translate-y-[-8px] hover:shadow-[0_25px_50px_-12px_rgba(116,207,170,0.25),0_0_0_1px_rgba(116,207,170,0.1)]
        focus-within:translate-y-[-8px] focus-within:shadow-[0_25px_50px_-12px_rgba(116,207,170,0.25),0_0_0_1px_rgba(116,207,170,0.1)]
        focus-within:outline-2 focus-within:outline-[#74cfaa] focus-within:outline-offset-2
        ${isVisible ? `opacity-100 translate-y-0 animate-fade-in-up ${delayClass}` : 'opacity-0 translate-y-8'}
        p-6 sm:p-7 lg:p-8 xl:p-10
      `}
      tabIndex={0}
      role="article"
      aria-labelledby={`card-title-${variant}`}
    >
      {/* Decoration circle */}
      <div
        className={`
          absolute ${decorationPosition} w-32 h-32
          bg-gradient-to-br ${gradientDirection} rounded-full
          -mr-16 -mt-16 transition-all duration-500
          group-hover:scale-150
        `}
      />

      {/* Content */}
      <div className="relative z-10 flex flex-col flex-1">
        <header className="flex-shrink-0 mb-6 md:mb-7 lg:mb-8 xl:mb-10">
          <h2
            id={`card-title-${variant}`}
            className="font-bold capitalize leading-tight font-['Poppins',sans-serif] text-xl sm:text-2xl md:text-xl lg:text-2xl xl:text-3xl"
            style={{
              background: 'linear-gradient(90deg, #a095e1, #74cfaa)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}
          >
            {title}
          </h2>
        </header>

        <div className="text-[#64748b] font-['Poppins',sans-serif] text-base sm:text-lg md:text-base lg:text-lg xl:text-xl leading-relaxed space-y-4 flex-1">
          {paragraphs.map((paragraph, index) => (
            <p
              key={index}
              className="transition-colors duration-300 hover:text-[#475569]"
            >
              {paragraph}
            </p>
          ))}
        </div>
      </div>
    </article>
  );
}

// Background pattern component with error handling and TypeScript
function BackgroundPattern({ position, rotation }: BackgroundPatternProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const positionClasses = position === 'left'
    ? '-left-16 -bottom-12 md:-left-20 md:-bottom-16 lg:-left-24 lg:-bottom-18 xl:-left-32 xl:-bottom-20'
    : '-right-16 -top-12 md:-right-20 md:-top-16 lg:-right-24 lg:-top-18 xl:-right-32 xl:-top-20';

  useEffect(() => {
    const img = new Image();
    img.onload = () => setImageLoaded(true);
    img.onerror = () => setImageError(true);
    img.src = PATTERN_IMAGE;
  }, []);

  // Don't render if image failed to load
  if (imageError) return null;

  return (
    <div
      className={`
        absolute pointer-events-none
        w-48 h-48 sm:w-56 sm:h-56 md:w-64 md:h-64 lg:w-72 lg:h-72 xl:w-80 xl:h-80
        ${positionClasses}
        ${imageLoaded ? 'opacity-25' : 'opacity-0'}
        transition-opacity duration-500
      `}
      style={{
        backgroundImage: imageLoaded ? `url('${PATTERN_IMAGE}')` : 'none',
        backgroundSize: 'contain',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        transform: rotation
      }}
      aria-hidden="true"
    />
  );
}

/**
 * AboutOrigin Component
 *
 * A responsive, accessible section component that displays KayanLive's
 * origin story and approach with animated cards and background patterns.
 *
 * Features:
 * - Intersection Observer for scroll-triggered animations
 * - Responsive design with mobile-first approach
 * - Full accessibility support (WCAG 2.1)
 * - Error boundaries and fallbacks
 * - Browser compatibility with vendor prefixes
 * - Performance optimizations with memoization
 *
 * @returns JSX.Element The rendered component
 */
export default function AboutOrigin() {
  const t = useTranslations('about.origin');
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const sectionRef = useRef<HTMLElement>(null);

  // IntersectionObserver with fallback for older browsers
  useEffect(() => {
    // Fallback for browsers without IntersectionObserver support
    if (typeof window !== 'undefined' && !window.IntersectionObserver) {
      const timer = setTimeout(() => setIsVisible(true), FALLBACK_DELAY);
      return () => clearTimeout(timer);
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect(); // Stop observing once visible
        }
      },
      {
        threshold: INTERSECTION_THRESHOLD,
        rootMargin: INTERSECTION_ROOT_MARGIN
      }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // Memoized card content data to prevent recreation on every render
  const cardData: CardContent[] = useMemo(() => {
    try {
      return [
        {
          title: t('title1') || 'Our Mission',
      paragraphs: [
        t.rich('paragraph1', {
          strong: (chunks: React.ReactNode) => (
            <span className="text-[#2c2c2b] font-semibold">{chunks}</span>
          )
        }),
        t.rich('paragraph2', {
          strong: (chunks: React.ReactNode) => (
            <span className="text-[#2c2c2b] font-semibold">{chunks}</span>
          )
        }),
        t.rich('paragraph3', {
          strong: (chunks: React.ReactNode) => (
            <span className="text-[#2c2c2b] font-semibold">{chunks}</span>
          )
        }),
        t.rich('paragraph4', {
          strong: (chunks: React.ReactNode) => (
            <span className="text-[#2c2c2b] font-semibold">{chunks}</span>
          )
        }),
        <span key="final" className="text-[#475569] font-medium">
          {t('paragraph5') || 'Your success is our commitment.'}
        </span>
      ]
    },
    {
      title: t('title2') || 'Our Approach',
      paragraphs: [
        t('paragraph6') || 'We deliver strategic solutions.',
        t('paragraph7') || 'Our methodology is proven and effective.',
        t.rich('statisticalText', {
          roiStat: (chunks: React.ReactNode) => (
            <span className="relative inline-block font-semibold px-2 py-1 rounded-lg bg-gradient-to-r from-[#74cfaa] to-[#a095e1] bg-clip-text text-transparent text-[1.05em] transition-all duration-300 hover:scale-105 cursor-help">
              {chunks}
            </span>
          ),
          citation: (chunks: React.ReactNode) => (
            <span className="text-xs text-gray-400 ml-1">{chunks}</span>
          )
        }) || 'Experiential activations yield measurable results.',
        <span key="emphasis" className="text-[#2c2c2b] font-medium transition-colors duration-300 hover:text-[#1e293b]">
          {t('paragraph8') || 'We prioritize measurable impact.'}
        </span>,
        t.rich('paragraph9', {
          strong: (chunks: React.ReactNode) => (
            <span className="text-[#2c2c2b] font-semibold">{chunks}</span>
          )
        }) || 'Our approach drives sustainable growth.'
      ]
    }
  ];
    } catch (error) {
      console.warn('Translation error in AboutOrigin:', error);
      return [
        {
          title: 'Our Mission',
          paragraphs: ['Loading content...']
        },
        {
          title: 'Our Approach',
          paragraphs: ['Loading content...']
        }
      ];
    }
  }, [t]);

  return (
    <section
      ref={sectionRef}
      className="relative bg-[#f0f1fa] overflow-hidden isolate w-full min-h-[600px] sm:min-h-[70vh] lg:min-h-[75vh] xl:min-h-[80vh] pt-16 pb-8 sm:pt-20 sm:pb-12 md:pt-24 md:pb-16 lg:pt-28 lg:pb-18 xl:pt-32 xl:pb-20"
      aria-label="About KayanLive origin and capability section"
      role="region"
    >
      {/* Optimized CSS with Browser Support */}
      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
            -webkit-transform: translateY(20px);
            -moz-transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
            -webkit-transform: translateY(0);
            -moz-transform: translateY(0);
          }
        }

        .animate-fade-in-up {
          animation: fadeInUp 0.6s cubic-bezier(0.4, 0, 0.2, 1) forwards;
          -webkit-animation: fadeInUp 0.6s cubic-bezier(0.4, 0, 0.2, 1) forwards;
          will-change: transform, opacity;
        }

        .animate-delay-100 {
          animation-delay: 0.1s;
          -webkit-animation-delay: 0.1s;
        }

        .animate-delay-300 {
          animation-delay: 0.3s;
          -webkit-animation-delay: 0.3s;
        }

        /* Optimized card transitions */
        .origin-card {
          will-change: transform, box-shadow;
          -webkit-transform: translateZ(0);
          transform: translateZ(0);
        }

        /* Browser compatibility for backdrop-blur */
        .origin-card {
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
        }

        /* Respect reduced motion preferences */
        @media (prefers-reduced-motion: reduce) {
          * {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
            -webkit-animation-duration: 0.01ms !important;
            -webkit-transition-duration: 0.01ms !important;
          }

          .origin-card {
            opacity: 1 !important;
            transform: none !important;
            -webkit-transform: none !important;
          }

          .origin-card:hover,
          .origin-card:focus-within {
            transform: none !important;
            -webkit-transform: none !important;
          }
        }

        /* Fallback for unsupported properties */
        @supports not (backdrop-filter: blur(8px)) {
          .origin-card {
            background-color: rgba(255, 255, 255, 0.85);
          }
        }
      `}</style>

      {/* Background Patterns */}
      <BackgroundPattern position="left" rotation="rotate(-15deg)" />
      <BackgroundPattern position="right" rotation="rotate(75deg) scaleY(-1)" />

      {/* Loading State */}
      {!isVisible && (
        <div className="absolute inset-0 animate-pulse bg-gray-200/50" />
      )}

      {/* Main Content */}
      <div className={`relative z-20 flex flex-col justify-center min-h-full transition-opacity duration-700 ${isVisible ? 'opacity-100' : 'opacity-0'} w-full px-4 md:px-6 lg:px-8 xl:px-16`}>
        <div className="w-full max-w-7xl mx-auto">
          {/* Cards Container */}
          <div className="flex flex-col md:flex-row gap-6 md:gap-8 lg:gap-10 xl:gap-12 items-center md:items-stretch justify-center w-full">
            {cardData.map((card, index) => (
              <OriginCard
                key={index}
                title={card.title}
                paragraphs={card.paragraphs}
                variant={index === 0 ? 'primary' : 'secondary'}
                isVisible={isVisible}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Accessibility: Skip Link */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-white text-black px-4 py-2 rounded-lg z-50 font-medium shadow-lg focus:outline-2 focus:outline-[#74cfaa] focus:outline-offset-2 transition-all duration-200"
        aria-label="Skip to next section of content"
        tabIndex={0}
      >
        {t('skipToNext')}
      </a>
    </section>
  );
}