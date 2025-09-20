'use client';

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useLocale } from 'next-intl';
import HeroSlide from './HeroSlide';
import { useTextMetrics } from './useTextMetrics';
import { HeroSlideData, HeroCarouselProps } from './types';
import styles from './Hero.module.css';

// Asset constants - Using optimized images
const SLIDE_DATA: HeroSlideData[] = [
  {
    id: 0,
    type: 'main',
    backgroundImage: "/optimized/hero-main/01f5d49d03c8455dc99b2ad32446b6657b1949e0-hero-main-desktop.webp",
    mobileBackgroundImage: "/optimized/hero-main/01f5d49d03c8455dc99b2ad32446b6657b1949e0-hero-main-mobile.webp",
    tabletBackgroundImage: "/optimized/hero-main/01f5d49d03c8455dc99b2ad32446b6657b1949e0-hero-main-tablet.webp"
  },
  {
    id: 1,
    type: 'about',
    backgroundImage: "/optimized/hero-slide/1402feda00b479d56347dca419118793a7b45676-hero-slide-desktop.webp",
    mobileBackgroundImage: "/optimized/hero-slide/1402feda00b479d56347dca419118793a7b45676-hero-slide-mobile.webp",
    tabletBackgroundImage: "/optimized/hero-slide/1402feda00b479d56347dca419118793a7b45676-hero-slide-tablet.webp",
    backgroundPosition: '47.69% 0%',
    backgroundSize: '373.72% 100%'
  }
] as const;

// Custom hook for carousel logic
function useCarousel(
  totalSlides: number,
  autoPlayInterval: number = 6000,
  pauseTimeout: number = 10000
) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const pauseTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  // Auto-play effect
  useEffect(() => {
    if (!isPaused) {
      const interval = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % totalSlides);
      }, autoPlayInterval);
      return () => clearInterval(interval);
    }
  }, [isPaused, totalSlides, autoPlayInterval]);

  // Manual slide navigation
  const goToSlide = useCallback((index: number) => {
    setCurrentSlide(index);
    setIsPaused(true);

    // Clear existing timeout
    if (pauseTimeoutRef.current) {
      clearTimeout(pauseTimeoutRef.current);
    }

    // Set new timeout
    pauseTimeoutRef.current = setTimeout(() => setIsPaused(false), pauseTimeout);
  }, [pauseTimeout]);

  // Navigation with keyboard support
  const navigate = useCallback((direction: 'next' | 'prev') => {
    const newIndex = direction === 'next'
      ? (currentSlide + 1) % totalSlides
      : (currentSlide - 1 + totalSlides) % totalSlides;
    goToSlide(newIndex);
  }, [currentSlide, totalSlides, goToSlide]);

  // Pause/resume controls
  const pause = useCallback(() => setIsPaused(true), []);
  const resume = useCallback(() => setIsPaused(false), []);

  // Cleanup
  useEffect(() => {
    return () => {
      if (pauseTimeoutRef.current) {
        clearTimeout(pauseTimeoutRef.current);
      }
    };
  }, []);

  return {
    currentSlide,
    isPaused,
    goToSlide,
    navigate,
    pause,
    resume
  };
}

// Keyboard navigation hook
function useKeyboardNavigation(navigate: (direction: 'next' | 'prev') => void) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      switch (event.key) {
        case 'ArrowLeft':
          event.preventDefault();
          navigate('prev');
          break;
        case 'ArrowRight':
          event.preventDefault();
          navigate('next');
          break;
        case 'Home':
          event.preventDefault();
          // Navigate to first slide (implement if needed)
          break;
        case 'End':
          event.preventDefault();
          // Navigate to last slide (implement if needed)
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [navigate]);
}

const Hero: React.FC<HeroCarouselProps> = ({
  slides = SLIDE_DATA,
  autoPlayInterval = 6000,
  pauseOnHover = true,
  pauseOnTouch = true,
  className = ''
}) => {
  const locale = useLocale();
  const textMetrics = useTextMetrics();
  const totalSlides = slides.length;

  const {
    currentSlide,
    goToSlide,
    navigate,
    pause,
    resume
  } = useCarousel(totalSlides, autoPlayInterval);

  // Enable keyboard navigation
  useKeyboardNavigation(navigate);

  // Memoize slides to prevent unnecessary re-renders
  const memoizedSlides = useMemo(() => slides, [slides]);

  // Mobile container props
  const mobileContainerProps = {
    className: `${styles.heroContainer} ${styles.mobileHero} lg:hidden ${className}`,
    style: {
      height: `clamp(${textMetrics.mobileHeight}px, 85vh, ${textMetrics.mobileHeight + 200}px)`
    },
    ...(pauseOnTouch && {
      onTouchStart: pause,
      onTouchEnd: resume
    })
  };

  // Desktop container props
  const desktopContainerProps = {
    className: `${styles.heroContainer} ${styles.desktopHero} hidden lg:block ${className}`,
    style: {
      height: `${textMetrics.desktopHeight}px`
    },
    ...(pauseOnHover && {
      onMouseEnter: pause,
      onMouseLeave: resume
    })
  };

  // Common accessibility props
  const accessibilityProps = {
    role: "region" as const,
    'aria-label': "Hero carousel",
    'aria-live': "polite" as const,
    'aria-atomic': true
  };

  return (
    <>
      {/* Mobile Layout */}
      <div {...mobileContainerProps} {...accessibilityProps}>
        {memoizedSlides.map((slide) => (
          <HeroSlide
            key={`mobile-${slide.id}`}
            slide={slide}
            isActive={currentSlide === slide.id}
            variant="mobile"
            textMetrics={textMetrics}
            locale={locale}
            onSlideChange={goToSlide}
            totalSlides={totalSlides}
            currentSlide={currentSlide}
          />
        ))}
      </div>

      {/* Desktop Layout */}
      <div {...desktopContainerProps} {...accessibilityProps}>
        {memoizedSlides.map((slide) => (
          <HeroSlide
            key={`desktop-${slide.id}`}
            slide={slide}
            isActive={currentSlide === slide.id}
            variant="desktop"
            textMetrics={textMetrics}
            locale={locale}
            onSlideChange={goToSlide}
            totalSlides={totalSlides}
            currentSlide={currentSlide}
          />
        ))}
      </div>
    </>
  );
};

export default Hero;