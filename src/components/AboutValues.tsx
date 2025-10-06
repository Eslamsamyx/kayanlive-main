'use client';

import { useState, useEffect, useRef } from 'react';
import { useTranslations, useLocale } from 'next-intl';

// Images - Optimized WebP versions
const images = {
  purpose: "/optimized/aboutvalues/186fa19b930d929977d57fb7f34e5087a46a93cf-purpose.webp",
  precision: "/optimized/aboutvalues/2618b670e3e8c66f745394f1723db8b2ef607736-precision.webp",
  innovation: "/optimized/aboutvalues/d1bc9c6954c4d0731970c6d331f309be8b111274-innovation.webp",
  collaboration: "/optimized/aboutvalues/90b45b1b1535aad0449f46a75aa465f248b51c13-collaboration.webp",
  placeholder: "/optimized/aboutvalues/1f2bf7072b0e4da07cc9892cd3df94f476ca5be4-placeholder.webp"
};

// Value Card Component with Intersection Observer
interface Value {
  title: string;
  description: string;
  image: string;
}

function ValueCard({ value, alignment }: { value: Value, alignment: string }) {
  const [isVisible, setIsVisible] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          // Once visible, stay visible
          if (cardRef.current) {
            observer.unobserve(cardRef.current);
          }
        }
      },
      {
        threshold: 0.1, // Trigger when 10% of the card is visible
        rootMargin: '0px 0px -50px 0px' // Slight offset from bottom
      }
    );

    const currentCard = cardRef.current;
    if (currentCard) {
      observer.observe(currentCard);
    }

    return () => {
      if (currentCard) {
        observer.unobserve(currentCard);
      }
    };
  }, []);

  return (
    <div
      ref={cardRef}
      className={`flex ${alignment}`}
      style={{
        opacity: isVisible ? 1 : 0,
        transform: `translateY(${isVisible ? 0 : 40}px)`,
        transition: 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)'
      }}
    >
      <div className="w-full max-w-sm md:max-w-md lg:max-w-lg">
        {/* Card Image */}
        <div
          className="aspect-[4/3] rounded-3xl bg-cover bg-center mb-4"
          style={{
            backgroundImage: `url(${value.image})`,
            backgroundColor: '#2a2d32'
          }}
        />

        {/* Card Content */}
        <div className="px-2">
          <h3 className="text-white text-lg md:text-xl lg:text-2xl font-bold mb-2" style={{ fontFamily: '"Poppins", sans-serif' }} dir="ltr">
            {value.title}
          </h3>
          <p className="text-gray-400 text-sm leading-relaxed" style={{ fontFamily: '"Poppins", sans-serif' }} dir="ltr">
            {value.description}
          </p>
        </div>
      </div>
    </div>
  );
}


export default function AboutValues() {
  const t = useTranslations('about.values');
  const locale = useLocale();
  const [scrollProgress, setScrollProgress] = useState(0);
  const sectionRef = useRef<HTMLElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const [pathLength, setPathLength] = useState(0);
  const [calculatedHeight, setCalculatedHeight] = useState(0);
  const contentRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [firstBoxOffset, setFirstBoxOffset] = useState(300);
  const cardsContainerRef = useRef<HTMLDivElement>(null);

  // Dynamic values data using translations
  const valuesData = [
    {
      id: 'purpose',
      title: t('cards.purpose.title'),
      description: t('cards.purpose.description'),
      image: images.purpose,
      position: { row: 1, col: 'left' }
    },
    {
      id: 'precision',
      title: t('cards.precision.title'),
      description: t('cards.precision.description'),
      image: images.precision,
      position: { row: 2, col: 'right' }
    },
    {
      id: 'innovation',
      title: t('cards.innovation.title'),
      description: t('cards.innovation.description'),
      image: images.innovation,
      position: { row: 3, col: 'left' }
    },
    {
      id: 'collaboration',
      title: t('cards.collaboration.title'),
      description: t('cards.collaboration.description'),
      image: images.collaboration,
      position: { row: 4, col: 'right' }
    },
    {
      id: 'speed',
      title: t('cards.speed.title'),
      description: t('cards.speed.description'),
      image: images.placeholder,
      position: { row: 5, col: 'left' }
    },
    {
      id: 'cultural',
      title: t('cards.cultural.title'),
      description: t('cards.cultural.description'),
      image: images.placeholder,
      position: { row: 6, col: 'right' }
    },
    {
      id: 'strategic',
      title: t('cards.strategic.title'),
      description: t('cards.strategic.description'),
      image: images.placeholder,
      position: { row: 7, col: 'center' }
    }
  ];

  // Track scroll progress based on Values section only with throttling
  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking && sectionRef.current) {
        requestAnimationFrame(() => {
          try {
            const section = sectionRef.current;
            if (!section) return;

            const rect = section.getBoundingClientRect();
            const sectionTop = rect.top + window.scrollY;
            const sectionHeight = section.offsetHeight;
            const currentScroll = window.scrollY;
            const windowHeight = window.innerHeight;

            // Check if section is in viewport
            const sectionBottom = sectionTop + sectionHeight;
            const viewportBottom = currentScroll + windowHeight;

            // Only start animation when section top is visible in viewport
            const viewportTop = currentScroll;

            // Section hasn't entered viewport yet
            if (sectionTop > viewportBottom) {
              setScrollProgress(0);
              ticking = false;
              return;
            }

            // Section has completely passed
            if (sectionBottom < viewportTop) {
              setScrollProgress(1);
              ticking = false;
              return;
            }

            // Calculate progress ONLY when scrolling through the section itself
            // Use dynamic firstBoxOffset calculated from actual DOM
            const isMobileView = window.innerWidth < 768;

            // The animation should start when the first box is approaching the viewport center
            const firstBoxTop = sectionTop + firstBoxOffset;
            const delayOffset = isMobileView ? 300 : 700; // Less delay on mobile
            const triggerPoint = firstBoxTop - windowHeight + delayOffset;

            // Only start animating after we've scrolled past the trigger point
            if (currentScroll < triggerPoint) {
              setScrollProgress(0);
              ticking = false;
              return;
            }

            // Calculate progress from when first box enters viewport
            const scrolledPastTrigger = currentScroll - triggerPoint;
            const totalScrollRange = sectionHeight - windowHeight; // More accurate range

            let progress = scrolledPastTrigger / totalScrollRange;
            progress = Math.max(0, Math.min(1, progress));

            // Animation speed that keeps pace with scrolling
            // Use a formula that ensures the animation completes when scrolling completes
            const baseLeadProgress = 0.05; // Small base to start smooth
            const speedMultiplier = isMobileView ? 0.85 : 1.2; // Much slower on mobile to match scrolling
            const leadingProgress = Math.min(1, baseLeadProgress + (progress * speedMultiplier));
            setScrollProgress(leadingProgress);

            console.log('AboutValues Animation Debug:', {
              sectionTop,
              firstBoxTop,
              triggerPoint,
              currentScroll,
              windowHeight,
              scrolledPastTrigger,
              totalScrollRange,
              progress,
              leadingProgress,
              pathLength
            });
          } catch (error) {
            console.warn('Error in scroll handler:', error);
          }
          ticking = false;
        });
        ticking = true;
      }
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (ticking) {
        ticking = false;
      }
    };
  }, [firstBoxOffset, pathLength]);

  // Detect mobile screen
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Dynamically calculate first box position
  useEffect(() => {
    const calculateFirstBoxPosition = () => {
      if (cardsContainerRef.current && sectionRef.current) {
        const sectionRect = sectionRef.current.getBoundingClientRect();
        const firstCard = cardsContainerRef.current.querySelector('.flex');

        if (firstCard) {
          const firstCardRect = firstCard.getBoundingClientRect();
          const offset = firstCardRect.top - sectionRect.top;
          setFirstBoxOffset(Math.max(200, offset)); // Minimum 200px offset
        }
      }
    };

    // Calculate after a delay to ensure DOM is ready
    const timer = setTimeout(calculateFirstBoxPosition, 500);
    window.addEventListener('resize', calculateFirstBoxPosition);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', calculateFirstBoxPosition);
    };
  }, [isMobile]);

  // Set up path length for animation with error handling
  useEffect(() => {
    // Add a small delay to ensure SVG is rendered
    const timer = setTimeout(() => {
      try {
        if (pathRef.current && typeof pathRef.current.getTotalLength === 'function') {
          const length = pathRef.current.getTotalLength();
          console.log('AboutValues Path Length:', length);
          if (length && isFinite(length) && length > 0) {
            setPathLength(length);
          } else {
            console.warn('Invalid path length calculated');
          }
        }
      } catch (error) {
        console.warn('Error calculating SVG path length:', error);
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [isMobile]); // Recalculate when mobile state changes

  // Calculate dynamic height based on actual content with error handling
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    let resizeTimer: NodeJS.Timeout | null = null;

    const calculateHeight = () => {
      try {
        if (contentRef.current) {
          const contentHeight = contentRef.current.scrollHeight;
          if (contentHeight && isFinite(contentHeight) && contentHeight > 0) {
            // Add buffer for the pattern at bottom + spacing
            const totalHeight = contentHeight + 250; // 250px buffer for pattern + spacing
            setCalculatedHeight(totalHeight);
          }
        }
      } catch (error) {
        console.warn('Error calculating height:', error);
      }
    };

    // Throttled resize handler
    const handleResize = () => {
      if (resizeTimer) clearTimeout(resizeTimer);
      resizeTimer = setTimeout(calculateHeight, 150);
    };

    // Delay calculation to ensure content is rendered
    timer = setTimeout(calculateHeight, 100);

    // Recalculate on window resize
    window.addEventListener('resize', handleResize);
    return () => {
      if (timer) clearTimeout(timer);
      if (resizeTimer) clearTimeout(resizeTimer);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Recalculate height when scroll progress changes (content might be visible now)
  useEffect(() => {
    if (contentRef.current && calculatedHeight === 0) {
      const contentHeight = contentRef.current.scrollHeight;
      if (contentHeight > 0) {
        setCalculatedHeight(contentHeight + 250); // Updated buffer for pattern + spacing
      }
    }
  }, [scrollProgress, calculatedHeight]);

  return (
    <section 
      ref={sectionRef}
      className="relative bg-[#1f2125] py-20 overflow-hidden w-full max-w-full"
      aria-label="Company values and principles"
      style={{ 
        minHeight: calculatedHeight > 0 ? `${calculatedHeight}px` : 'auto'
      }}
    >
      {/* Title Section - Simple left-aligned */}
      <div className="max-w-7xl mx-auto px-6 md:px-8 lg:px-12 relative mb-6 md:mb-12 lg:mb-16">
        <h2
          className="font-bold capitalize text-left text-[50px] md:text-[100px] lg:text-[200px] leading-[65px] md:leading-[120px] lg:leading-[230px] tracking-0 lg:tracking-[-2px]"
          style={{
            background: 'linear-gradient(90deg, #a095e1, #74cfaa)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            fontFamily: '"Poppins", sans-serif'
          }}
          dir={locale === 'ar' ? 'rtl' : 'ltr'}
        >
          {t('title')}
        </h2>

        {/* Subtitle */}
        <p className="text-white/80 text-base md:text-lg lg:text-xl mt-4 md:mt-6 max-w-3xl leading-relaxed"
           style={{ fontFamily: '"Poppins", sans-serif' }}
           dir={locale === 'ar' ? 'rtl' : 'ltr'}>
          {t('subtitle')}
        </p>

        {/* SVG Logo beside title - Responsive sizing and opacity */}
        <div
          className="absolute opacity-30 md:opacity-40 lg:opacity-50 bg-center bg-cover bg-no-repeat
                     w-[150px] h-[235px] md:w-[250px] md:h-[390px] lg:w-[302px] lg:h-[469px]
                     -top-[80px] md:-top-[150px] lg:-top-[208px] right-0"
          style={{
            backgroundImage: `url('/optimized/aboutvalues/7d0b4204ecf2732587fef2b7f191e56d708f7342-logo-decoration.webp')`
          }}
        />
      </div>

      <div ref={contentRef} className="max-w-7xl mx-auto px-6 md:px-8 lg:px-12 relative">

        {/* Simple SVG Background Path */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none"
          viewBox={isMobile ? "0 0 600 4500" : "0 0 1200 4000"}
          preserveAspectRatio="xMidYMid slice"
        >
          <defs>
            <linearGradient id="repeatingGradient" x1="0%" y1="0%" x2="100%" y2="0%" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#a095e1" />
              <stop offset="20%" stopColor="#7afdd6" />
              <stop offset="40%" stopColor="#a095e1" />
              <stop offset="60%" stopColor="#74cfaa" />
              <stop offset="80%" stopColor="#a095e1" />
              <stop offset="100%" stopColor="#7afdd6" />
            </linearGradient>
          </defs>

          {/* Extended zigzag path through all 7 boxes - responsive for mobile/desktop */}
          <path
            ref={pathRef}
            d={isMobile
              ? // Mobile path - dynamically spaced for 7 boxes
                // Start below the firstBoxOffset for mobile screens
                (() => {
                  // Start at the vertical center of the first box (approximately half the card height up)
                  const startY = Math.max(100, firstBoxOffset - 200); // Move up by 200px to hit box center
                  const endY = 4200;
                  const boxSpacing = (endY - startY) / 6; // 6 gaps for 7 boxes

                  return `M 150 ${startY}
                   C 250 ${startY + boxSpacing * 0.2}, 350 ${startY + boxSpacing * 0.4}, 450 ${startY + boxSpacing * 0.6}
                   C 500 ${startY + boxSpacing * 0.8}, 450 ${startY + boxSpacing}, 400 ${startY + boxSpacing * 1.2}
                   C 350 ${startY + boxSpacing * 1.4}, 200 ${startY + boxSpacing * 1.6}, 150 ${startY + boxSpacing * 1.8}
                   C 100 ${startY + boxSpacing * 2}, 150 ${startY + boxSpacing * 2.2}, 200 ${startY + boxSpacing * 2.4}
                   C 250 ${startY + boxSpacing * 2.6}, 400 ${startY + boxSpacing * 2.8}, 450 ${startY + boxSpacing * 3}
                   C 500 ${startY + boxSpacing * 3.2}, 450 ${startY + boxSpacing * 3.4}, 400 ${startY + boxSpacing * 3.6}
                   C 350 ${startY + boxSpacing * 3.8}, 200 ${startY + boxSpacing * 4}, 150 ${startY + boxSpacing * 4.2}
                   C 100 ${startY + boxSpacing * 4.4}, 150 ${startY + boxSpacing * 4.6}, 200 ${startY + boxSpacing * 4.8}
                   C 250 ${startY + boxSpacing * 5}, 400 ${startY + boxSpacing * 5.2}, 450 ${startY + boxSpacing * 5.4}
                   C 500 ${startY + boxSpacing * 5.6}, 450 ${startY + boxSpacing * 5.8}, 400 ${startY + boxSpacing * 6}
                   C 350 ${endY - 100}, 300 ${endY - 50}, 300 ${endY}`;
                })()
              : // Desktop path - aligned with first box center
                `M 250 250
                 C 450 300, 650 350, 850 400
                 C 1050 450, 1050 550, 850 650
                 C 650 750, 450 850, 250 950
                 C 50 1050, 50 1150, 250 1250
                 C 450 1350, 650 1450, 850 1550
                 C 1050 1650, 1050 1750, 850 1850
                 C 650 1950, 450 2050, 250 2150
                 C 50 2250, 50 2350, 250 2450
                 C 450 2550, 650 2650, 850 2750
                 C 1050 2850, 1050 2950, 850 3050
                 C 650 3150, 600 3250, 600 3350
                 C 600 3450, 600 3550, 600 3550`
            }
            fill="none"
            stroke="url(#repeatingGradient)"
            strokeWidth={isMobile ? "20" : "35"}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray={pathLength}
            strokeDashoffset={pathLength - (pathLength * scrollProgress)}
            style={{
              transition: 'none'
            }}
          />
        </svg>

        {/* Values Cards Container */}
        <div ref={cardsContainerRef} className="relative space-y-32">
          {valuesData.map((value) => {
            const alignment = value.position.col === 'left'
              ? 'justify-start'
              : value.position.col === 'right'
              ? 'justify-end'
              : 'justify-center';

            return (
              <ValueCard
                key={value.id}
                value={value}
                alignment={alignment}
              />
            );
          })}
        </div>

        {/* Outro Text */}
        <div className="mt-20 md:mt-32 max-w-4xl mx-auto px-4">
          <p className="text-white/90 text-center text-base md:text-lg lg:text-xl leading-relaxed"
             style={{ fontFamily: '"Poppins", sans-serif' }}
             dir={locale === 'ar' ? 'rtl' : 'ltr'}>
            {t('outro')}
          </p>
        </div>

        {/* Spacing above pattern */}
        <div className="h-32"></div>
      </div>
      
      {/* Pattern Row - positioned at bottom exactly like footer - OUTSIDE container for full width */}
      <div 
        className="absolute bottom-0 left-0 right-0 overflow-hidden"
        style={{ height: '140px' }}
      >
        <div className="flex absolute bottom-0" style={{ left: '0' }}>
          {/* Generate enough patterns to cover the full width */}
          {Array.from({ length: 15 }, (_, i) => (
            <div
              key={i}
              className="bg-center bg-cover bg-no-repeat flex-shrink-0"
              style={{
                width: '180px',
                height: '180px',
                backgroundImage: `url('/optimized/aboutvalues/b4078e8028eba5003e2e49b208e4f7a73ef31801-bottom-pattern.webp')`,
                opacity: 0.6
              }}
            />
          ))}
        </div>
      </div>
    </section>
  );
}