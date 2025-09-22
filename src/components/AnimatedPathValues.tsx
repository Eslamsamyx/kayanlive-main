'use client';

import React, { useRef, useEffect, useState } from 'react';
import { useLocale } from 'next-intl';

interface AnimatedPathValuesProps {
  containerRef?: React.RefObject<HTMLElement | null>;
  className?: string;
}

export default function AnimatedPathValues({ containerRef, className = '' }: AnimatedPathValuesProps) {
  const pathRef = useRef<SVGPathElement>(null);
  const [pathLength, setPathLength] = useState(0);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const locale = useLocale();
  const isRTL = locale === 'ar';

  // Track scroll progress relative to container - exact same as AnimatedPath
  useEffect(() => {
    const handleScroll = () => {
      const targetElement = containerRef?.current || document.documentElement;
      if (!targetElement) return;

      const rect = targetElement.getBoundingClientRect();
      const elementTop = rect.top + window.scrollY;
      const elementHeight = rect.height;
      const currentScroll = window.scrollY;
      const windowHeight = window.innerHeight;

      // Use viewport center as reference
      const viewportCenter = currentScroll + windowHeight / 2;

      // Calculate progress through element (0% at start, 100% at end)
      let progress = (viewportCenter - elementTop) / elementHeight;
      progress = Math.max(0, Math.min(1, progress));

      // Animation speed similar to original AboutValues (1.3x)
      const enhancedProgress = Math.min(1, progress * 1.3);
      setScrollProgress(enhancedProgress);
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [containerRef]);

  // Handle responsive detection
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Extended zigzag path to reach all 7 boxes - adjusted for mobile/desktop
  const pathData = isMobile
    ? `M 300 1200
      C 500 1400, 700 1600, 900 1800
      C 1100 2000, 1100 2200, 900 2400
      C 700 2600, 500 2800, 300 3000
      C 100 3200, 100 3400, 300 3600
      C 500 3800, 700 4000, 900 4200
      C 1100 4400, 1100 4600, 900 4800
      C 700 5000, 500 5200, 300 5400
      C 100 5600, 100 5800, 300 6000
      C 500 6200, 700 6400, 900 6600
      C 1100 6800, 1100 7000, 900 7200
      C 700 7400, 500 7600, 300 7800
      C 200 8000, 300 8200, 400 8400
      C 500 8600, 600 8800, 600 9000`
    : `M 300 500
      C 500 600, 700 700, 900 800
      C 1100 900, 1100 1000, 900 1100
      C 700 1200, 500 1300, 300 1400
      C 100 1500, 100 1600, 300 1700
      C 500 1800, 700 1900, 900 2000
      C 1100 2100, 1100 2200, 900 2300
      C 700 2400, 500 2500, 300 2600
      C 100 2700, 100 2800, 300 2900
      C 500 3000, 700 3100, 900 3200
      C 1100 3300, 1100 3400, 900 3500
      C 700 3600, 600 3700, 600 3800
      C 600 3900, 600 4000, 600 4100`;

  // Set up path length for animation - recalculate when mobile state changes
  useEffect(() => {
    if (pathRef.current) {
      const length = pathRef.current.getTotalLength();
      setPathLength(length);
    }
  }, [isMobile, pathData]);

  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none z-0 ${className}`}>
      <svg 
        className="absolute inset-0 w-full h-full"
        viewBox={isMobile ? "0 0 1200 9000" : "0 0 1200 4200"}
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient 
            id={`pathGradient-${isRTL ? 'rtl' : 'ltr'}`}
            x1="0%" 
            y1="0%" 
            x2="100%" 
            y2="0%" 
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0%" stopColor="#a095e1" />
            <stop offset="20%" stopColor="#7afdd6" />
            <stop offset="40%" stopColor="#a095e1" />
            <stop offset="60%" stopColor="#74cfaa" />
            <stop offset="80%" stopColor="#a095e1" />
            <stop offset="100%" stopColor="#7afdd6" />
          </linearGradient>
          
          {/* Glow effect */}
          <filter id={`glow-${isRTL ? 'rtl' : 'ltr'}`}>
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        
        {/* Main animated path - flat 2D design */}
        <path
          ref={pathRef}
          d={pathData}
          fill="none"
          stroke={`url(#pathGradient-${isRTL ? 'rtl' : 'ltr'})`}
          strokeWidth="35"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray={pathLength}
          strokeDashoffset={pathLength - (pathLength * scrollProgress)}
          style={{
            transition: 'none',
            opacity: 1
          }}
        />
      </svg>
    </div>
  );
}