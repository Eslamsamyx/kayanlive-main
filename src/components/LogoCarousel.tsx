'use client';

import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import { useTranslations, useLocale } from 'next-intl';

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

const LogoCard = ({ item, className = '' }: LogoCardProps) => {
  const locale = useLocale();
  const [showTooltip, setShowTooltip] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

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
            sizes="(max-width: 640px) 140px, (max-width: 768px) 180px, (max-width: 1024px) 220px, 260px"
          />
        </div>
      </div>

      <TooltipPortal isVisible={showTooltip} targetRef={cardRef}>
        <div className="max-w-sm bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden backdrop-blur-lg" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
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
  const t = useTranslations();
  const locale = useLocale();
  const [isPaused, setIsPaused] = useState(false);
  const animationRef = useRef<number | undefined>(undefined);
  const trackRef = useRef<HTMLDivElement>(null);
  const scrollPosition = useRef<number>(0);

  const logoItems: LogoItem[] = useMemo(() => [
    {
      id: 1,
      name: 'Tatweer',
      fullName: t('companies.tatweer.fullName'),
      image: '/optimized/logos-tinypng/tatweer.webp',
      industry: t('companies.tatweer.industry'),
      description: t('companies.tatweer.description'),
      headquarters: t('companies.tatweer.headquarters')
    },
    {
      id: 2,
      name: 'DCT Abu Dhabi',
      fullName: t('companies.dctAbuDhabi.fullName'),
      image: '/optimized/logos-tinypng/dct-abu-dhabi.webp',
      industry: t('companies.dctAbuDhabi.industry'),
      description: t('companies.dctAbuDhabi.description'),
      headquarters: t('companies.dctAbuDhabi.headquarters')
    },
    {
      id: 3,
      name: 'MOHAP',
      fullName: t('companies.mohap.fullName'),
      image: '/optimized/logos-tinypng/mohap.webp',
      industry: t('companies.mohap.industry'),
      description: t('companies.mohap.description'),
      headquarters: t('companies.mohap.headquarters')
    },
    {
      id: 4,
      name: 'DHCC',
      fullName: t('companies.dhcc.fullName'),
      image: '/optimized/logos-tinypng/dhcc.webp',
      industry: t('companies.dhcc.industry'),
      description: t('companies.dhcc.description'),
      headquarters: t('companies.dhcc.headquarters')
    },
    {
      id: 5,
      name: 'Thiqah',
      fullName: t('companies.thiqah.fullName'),
      image: '/optimized/logos-tinypng/thiqah-ksa.webp',
      industry: t('companies.thiqah.industry'),
      description: t('companies.thiqah.description'),
      headquarters: t('companies.thiqah.headquarters')
    },
    {
      id: 6,
      name: 'Elm',
      fullName: t('companies.elm.fullName'),
      image: '/optimized/logos-tinypng/elm-ksa.webp',
      industry: t('companies.elm.industry'),
      description: t('companies.elm.description'),
      headquarters: t('companies.elm.headquarters')
    },
    {
      id: 7,
      name: 'Modon',
      fullName: t('companies.modon.fullName'),
      image: '/optimized/logos-tinypng/modon-ksa-1.webp',
      industry: t('companies.modon.industry'),
      description: t('companies.modon.description'),
      headquarters: t('companies.modon.headquarters')
    },
    {
      id: 8,
      name: 'Mave Marketing',
      fullName: t('companies.maveMarketing.fullName'),
      image: '/optimized/logos-tinypng/mave-marketing.svg',
      industry: t('companies.maveMarketing.industry'),
      description: t('companies.maveMarketing.description'),
      headquarters: t('companies.maveMarketing.headquarters')
    },
    {
      id: 9,
      name: 'Tawal',
      fullName: t('companies.tawal.fullName'),
      image: '/optimized/logos-tinypng/tawal-ksa.webp',
      industry: t('companies.tawal.industry'),
      description: t('companies.tawal.description'),
      headquarters: t('companies.tawal.headquarters')
    },
    {
      id: 10,
      name: 'Hisense',
      fullName: t('companies.hisense.fullName'),
      image: '/optimized/logos-tinypng/hisense.webp',
      industry: t('companies.hisense.industry'),
      description: t('companies.hisense.description'),
      headquarters: t('companies.hisense.headquarters')
    },
    {
      id: 11,
      name: 'TDRA',
      fullName: t('companies.tdra.fullName'),
      image: '/optimized/logos-tinypng/tdra.webp',
      industry: t('companies.tdra.industry'),
      description: t('companies.tdra.description'),
      headquarters: t('companies.tdra.headquarters')
    },
    {
      id: 12,
      name: 'HOPSCOTCH',
      fullName: t('companies.hopscotch.fullName'),
      image: '/optimized/logos-tinypng/hopscotch.webp',
      industry: t('companies.hopscotch.industry'),
      description: t('companies.hopscotch.description'),
      headquarters: t('companies.hopscotch.headquarters')
    },
    {
      id: 13,
      name: 'Solutions by STC',
      fullName: t('companies.solutionsByStc.fullName'),
      image: '/optimized/logos-tinypng/solutions-by-stc.webp',
      industry: t('companies.solutionsByStc.industry'),
      description: t('companies.solutionsByStc.description'),
      headquarters: t('companies.solutionsByStc.headquarters')
    },
    {
      id: 14,
      name: 'GO Telecom',
      fullName: t('companies.goTelecom.fullName'),
      image: '/optimized/logos-tinypng/go-telecom-ksa.webp',
      industry: t('companies.goTelecom.industry'),
      description: t('companies.goTelecom.description'),
      headquarters: t('companies.goTelecom.headquarters')
    },
    {
      id: 15,
      name: 'SMT',
      fullName: t('companies.smt.fullName'),
      image: '/optimized/logos-tinypng/smt.webp',
      industry: t('companies.smt.industry'),
      description: t('companies.smt.description'),
      headquarters: t('companies.smt.headquarters')
    },
    {
      id: 16,
      name: 'ADNOC',
      fullName: t('companies.adnoc.fullName'),
      image: '/optimized/logos-tinypng/adnoc.webp',
      industry: t('companies.adnoc.industry'),
      description: t('companies.adnoc.description'),
      headquarters: t('companies.adnoc.headquarters')
    },
    {
      id: 17,
      name: 'Haboob',
      fullName: t('companies.haboob.fullName'),
      image: '/optimized/logos-tinypng/haboob-ksa.webp',
      industry: t('companies.haboob.industry'),
      description: t('companies.haboob.description'),
      headquarters: t('companies.haboob.headquarters')
    },
  ], [t]);

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

  const handleMouseEnter = useCallback(() => setIsPaused(true), []);
  const handleMouseLeave = useCallback(() => setIsPaused(false), []);

  return (
    <section className="relative w-full py-12 overflow-visible px-4 bg-gradient-to-b from-white via-gray-50 to-white">
      {/* Section Header */}
      <header className="text-center mb-12">
        <h2 className="text-3xl font-bold text-[#2c2c2b] mb-3" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
          {t('trustedBy.title')}
        </h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
          {t('trustedBy.description')}
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