'use client';

import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';

interface TooltipPortalProps {
  children: React.ReactNode;
  isVisible: boolean;
  targetRef: React.RefObject<HTMLDivElement | null>;
}

function TooltipPortal({ children, isVisible, targetRef }: TooltipPortalProps) {
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (isVisible && targetRef.current) {
      const rect = targetRef.current.getBoundingClientRect();
      setTooltipPosition({
        x: rect.left + rect.width / 2,
        y: rect.top - 8
      });
    }
  }, [isVisible, targetRef]);

  if (!isVisible) return null;

  return createPortal(
    <div
      className="fixed z-[9999] pointer-events-none transform -translate-x-1/2 -translate-y-full"
      style={{
        left: `${tooltipPosition.x}px`,
        top: `${tooltipPosition.y}px`,
      }}
    >
      {children}
    </div>,
    document.body
  );
}

interface LogoItem {
  id: number;
  name: string;
  fullName: string;
  image: string;
  industry: string;
  description: string;
  headquarters: string;
}

interface LogoCardProps {
  item: LogoItem;
  className?: string;
}

// CRITICAL FIX: Memoized LogoCard to prevent unnecessary re-renders
const LogoCard = ({ item, className = '' }: LogoCardProps) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  // CRITICAL FIX: Optimize tooltip interactions for better performance
  const handleMouseEnter = useCallback(() => {
    setShowTooltip(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setShowTooltip(false);
  }, []);

  return (
    <>
      <div
        ref={cardRef}
        className={`flex-shrink-0 flex items-center justify-center ${className}`}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <div
          className="relative flex items-center justify-center h-32 px-12 transition-transform duration-300 ease-out hover:scale-105 cursor-pointer group transform-gpu"
          style={{
            backgroundColor: (item.name === 'HOPSCOTCH' || item.name === 'Mave Marketing') ? '#1c1c1c' : 'transparent',
            borderRadius: (item.name === 'HOPSCOTCH' || item.name === 'Mave Marketing') ? '16px' : '0',
            padding: (item.name === 'HOPSCOTCH' || item.name === 'Mave Marketing') ? '16px' : '0',
            contain: 'layout'
          }}
        >
          <Image
            src={item.image}
            alt={item.fullName}
            width={280}
            height={120}
            className="object-contain w-auto"
            style={{
              maxWidth: '260px',
              height: 'auto',
              maxHeight: (item.name === 'HOPSCOTCH' || item.name === 'Mave Marketing') ? '100px' : '120px'
            }}
            loading="lazy"
            quality={80}
            sizes="260px"
          />
        </div>
      </div>

      <TooltipPortal isVisible={showTooltip} targetRef={cardRef}>
        <div className="max-w-sm bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden backdrop-blur-lg">
          {/* Header with gradient background */}
          <div className="bg-gradient-to-r from-[#74cfaa] to-[#7afdd6] px-6 py-4">
            <h3 className="text-[#2c2c2b] font-bold text-lg leading-tight">{item.fullName}</h3>
            <p className="text-[#2c2c2b]/80 text-sm mt-1">{item.industry}</p>
          </div>

          {/* Content */}
          <div className="px-6 py-4 space-y-3">
            <p className="text-gray-700 text-sm leading-relaxed">
              {item.description}
            </p>

            {/* Location */}
            <div className="flex items-center gap-2 text-gray-600">
              <svg className="w-4 h-4 text-[#74cfaa]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="text-sm">{item.headquarters}</span>
            </div>
          </div>

          {/* Arrow pointer */}
          <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-[1px]">
            <div className="w-0 h-0 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-white" />
            <div className="absolute -top-[9px] left-1/2 -translate-x-1/2 w-0 h-0 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-gray-100" />
          </div>
        </div>
      </TooltipPortal>
    </>
  );
};

export default function LogoCarousel() {
  const [isPaused, setIsPaused] = useState(false);
  const animationRef = useRef<number | undefined>(undefined);
  const trackRef = useRef<HTMLDivElement>(null);
  const scrollPosition = useRef<number>(0);

  // CRITICAL FIX: Optimized logo data - memoized to prevent re-creation
  const logoItems: LogoItem[] = useMemo(() => [
    {
      id: 1,
      name: 'Tatweer',
      fullName: 'Tatweer Educational Technologies Co.',
      image: '/optimized/logos-tinypng/tatweer.webp',
      industry: 'Educational Technology',
      description: 'A digital solutions company providing technology-driven educational solutions and services across Saudi Arabia and UAE.',
      headquarters: 'Riyadh, Saudi Arabia'
    },
    {
      id: 2,
      name: 'DCT Abu Dhabi',
      fullName: 'Department of Culture and Tourism',
      image: '/optimized/logos-tinypng/dct-abu-dhabi.webp',
      industry: 'Government Tourism & Culture',
      description: 'Principal authority driving sustainable growth of Abu Dhabi\'s culture and tourism sectors.',
      headquarters: 'Abu Dhabi, UAE'
    },
    {
      id: 3,
      name: 'MOHAP',
      fullName: 'Ministry of Health & Prevention',
      image: '/optimized/logos-tinypng/mohap.webp',
      industry: 'Healthcare Governance',
      description: 'Federal entity ensuring proactive healthcare services through world-class policies and programs.',
      headquarters: 'Abu Dhabi, UAE'
    },
    {
      id: 4,
      name: 'DHCC',
      fullName: 'Dubai Healthcare City',
      image: '/optimized/logos-tinypng/dhcc.webp',
      industry: 'Healthcare Infrastructure',
      description: 'A healthcare free zone combining medical services, education, research, and wellness facilities.',
      headquarters: 'Dubai, UAE'
    },
    {
      id: 5,
      name: 'Thiqah',
      fullName: 'Thiqah Business Services',
      image: '/optimized/logos-tinypng/thiqah-ksa.webp',
      industry: 'Digital Solutions',
      description: 'Provides customized digital platforms for governmental and private sector partners.',
      headquarters: 'Riyadh, Saudi Arabia'
    },
    {
      id: 6,
      name: 'Elm',
      fullName: 'Elm Information Security Company',
      image: '/optimized/logos-tinypng/elm-ksa.webp',
      industry: 'Information Security',
      description: 'Saudi company specializing in digital government services and cybersecurity solutions.',
      headquarters: 'Riyadh, Saudi Arabia'
    },
    {
      id: 7,
      name: 'Modon',
      fullName: 'Saudi Authority for Industrial Cities',
      image: '/optimized/logos-tinypng/modon-ksa-1.webp',
      industry: 'Industrial Development',
      description: 'Manages 39 industrial cities across Saudi Arabia with investments over 440 billion riyals.',
      headquarters: 'Riyadh, Saudi Arabia'
    },
    {
      id: 8,
      name: 'Mave Marketing',
      fullName: 'Mave Marketing Solution',
      image: '/optimized/logos-tinypng/mave-marketing.svg',
      industry: 'Marketing Services',
      description: 'Full-service agency offering event, production, creative, and technology solutions.',
      headquarters: 'Riyadh, Saudi Arabia'
    },
    {
      id: 9,
      name: 'Tawal',
      fullName: 'Tawal Telecom Infrastructure',
      image: '/optimized/logos-tinypng/tawal-ksa.webp',
      industry: 'Telecommunications',
      description: 'Saudi Arabia\'s largest telecom infrastructure company managing over 21,000 towers.',
      headquarters: 'Riyadh, Saudi Arabia'
    },
    {
      id: 10,
      name: 'Hisense',
      fullName: 'Hisense Electronics',
      image: '/optimized/logos-tinypng/hisense.webp',
      industry: 'Consumer Electronics',
      description: 'World\'s fourth-largest TV manufacturer with global production facilities.',
      headquarters: 'Qingdao, China'
    },
    {
      id: 11,
      name: 'TDRA',
      fullName: 'Telecommunications and Digital Government Regulatory Authority',
      image: '/optimized/logos-tinypng/tdra.webp',
      industry: 'Telecom Regulation',
      description: 'UAE federal agency regulating telecommunications and enabling digital transformation.',
      headquarters: 'Abu Dhabi, UAE'
    },
    {
      id: 12,
      name: 'HOPSCOTCH',
      fullName: 'HOPSCOTCH Entertainment Company',
      image: '/optimized/logos-tinypng/hopscotch.webp',
      industry: 'Communication & Entertainment',
      description: 'International communication group with 40 offices specializing in PR and digital communication.',
      headquarters: 'Paris, France'
    },
    {
      id: 13,
      name: 'Solutions by STC',
      fullName: 'Saudi Telecom Company Solutions',
      image: '/optimized/logos-tinypng/solutions-by-stc.webp',
      industry: 'IT Services',
      description: 'Pioneer in IT services offering comprehensive digital transformation solutions.',
      headquarters: 'Riyadh, Saudi Arabia'
    },
    {
      id: 14,
      name: 'GO Telecom',
      fullName: 'GO Telecom KSA',
      image: '/optimized/logos-tinypng/go-telecom-ksa.webp',
      industry: 'Telecommunications',
      description: 'Saudi Arabia\'s second fixed-line operator providing voice and broadband services.',
      headquarters: 'Riyadh, Saudi Arabia'
    },
    {
      id: 15,
      name: 'SMT',
      fullName: 'Security Management Technology',
      image: '/optimized/logos-tinypng/smt.webp',
      industry: 'Cybersecurity',
      description: 'End-to-end cybersecurity services, consultancy, and IT infrastructure solutions.',
      headquarters: 'Amman, Jordan'
    },
    {
      id: 16,
      name: 'ADNOC',
      fullName: 'Abu Dhabi National Oil Company',
      image: '/optimized/logos-tinypng/adnoc.webp',
      industry: 'Energy & Petrochemicals',
      description: 'Leading diversified energy group focusing on responsible hydrocarbon exploration.',
      headquarters: 'Abu Dhabi, UAE'
    },
    {
      id: 17,
      name: 'Haboob',
      fullName: 'Haboob Knowledge Solutions',
      image: '/optimized/logos-tinypng/haboob-ksa.webp',
      industry: 'Cybersecurity',
      description: 'Leading Saudi cybersecurity company providing integrated security services.',
      headquarters: 'Riyadh, Saudi Arabia'
    },
  ], []);

  // CRITICAL FIX: Optimized animation logic with better performance
  useEffect(() => {
    const animate = () => {
      if (!isPaused && trackRef.current) {
        scrollPosition.current += 0.8; // Reduced from 1.2 for better performance

        // Calculate the width of one complete set of logos
        const logoWidth = 310; // Logo max-width (260px) + gap (50px)
        const totalWidth = logoItems.length * logoWidth;

        // Reset position when we've scrolled one full set
        if (scrollPosition.current >= totalWidth) {
          scrollPosition.current = 0;
        }

        // CRITICAL FIX: Optimized transform with better performance
        trackRef.current.style.transform = `translateX(-${scrollPosition.current}px)`;
        trackRef.current.style.willChange = 'transform';
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPaused, logoItems.length]);

  // CRITICAL FIX: Optimized mouse event handlers
  const handleMouseEnter = useCallback(() => setIsPaused(true), []);
  const handleMouseLeave = useCallback(() => setIsPaused(false), []);

  return (
    <section className="relative w-full py-12 overflow-visible px-4 bg-gradient-to-b from-white via-gray-50 to-white">
      {/* Section Header */}
      <header className="text-center mb-12">
        <h2 className="text-3xl font-bold text-[#2c2c2b] mb-3">
          Trusted by Industry Leaders
        </h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Delivering exceptional events for prestigious organizations across the GCC region
        </p>
      </header>

      {/* Main Carousel Container - Light Mode with Depth */}
      <div className="relative">
        {/* Light background with modern depth */}
        <div className="bg-white rounded-[61px] mx-1 sm:mx-4 px-4 md:px-6 lg:px-8 py-4 md:py-5 relative shadow-xl">

          {/* Inner gradient overlay for depth */}
          <div className="absolute inset-0 rounded-[61px] bg-gradient-to-br from-gray-50/30 via-transparent to-gray-50/20 pointer-events-none" />

          {/* Subtle accent border */}
          <div className="absolute inset-0 rounded-[61px] border border-gray-100 pointer-events-none" />

          {/* Viewport Container - This controls what's visible */}
          <div
            className="relative overflow-x-hidden overflow-y-visible"
            style={{
              height: 'auto',
              contain: 'layout'
            }}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            {/* Scrolling Track - This moves horizontally */}
            <div
              ref={trackRef}
              className="flex items-center py-2 gap-12"
              style={{
                width: `${logoItems.length * 310 * 2}px`, // Double width for seamless loop
                contain: 'layout',
                transition: isPaused ? 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)' : 'none'
              }}
            >
              {/* First Set of Logos */}
              {logoItems.map((item) => (
                <LogoCard
                  key={`first-${item.id}`}
                  item={item}
                  className="flex-shrink-0"
                />
              ))}

              {/* Duplicate Set for Seamless Scrolling */}
              {logoItems.map((item) => (
                <LogoCard
                  key={`second-${item.id}`}
                  item={item}
                  className="flex-shrink-0"
                />
              ))}
            </div>

            {/* Light fade overlays */}
            <div className="absolute left-0 top-0 bottom-0 w-16 pointer-events-none z-10"
                 style={{
                   background: 'linear-gradient(90deg, rgba(255, 255, 255, 1) 0%, rgba(255, 255, 255, 0.8) 40%, transparent 100%)',
                 }} />
            <div className="absolute right-0 top-0 bottom-0 w-16 pointer-events-none z-10"
                 style={{
                   background: 'linear-gradient(270deg, rgba(255, 255, 255, 1) 0%, rgba(255, 255, 255, 0.8) 40%, transparent 100%)',
                 }} />
          </div>

          {/* Premium shadow for depth */}
          <div className="absolute inset-0 rounded-[61px] pointer-events-none"
               style={{
                 boxShadow: '0 15px 40px -15px rgba(0, 0, 0, 0.1), inset 0 0 20px rgba(0, 0, 0, 0.02)'
               }} />
        </div>
      </div>

      {/* Bottom Accent */}
      <div className="mt-8 mx-auto w-20 h-1 bg-gradient-to-r from-[#74cfaa] to-[#7afdd6] rounded-full" />
    </section>
  );
}