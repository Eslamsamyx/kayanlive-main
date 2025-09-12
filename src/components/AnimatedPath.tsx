'use client';

import React, { useRef, useEffect, useState } from 'react';
import { useLocale } from 'next-intl';

interface AnimatedPathProps {
  containerRef?: React.RefObject<HTMLElement>;
  className?: string;
}

export default function AnimatedPath({ containerRef, className = '' }: AnimatedPathProps) {
  const pathRef = useRef<SVGPathElement>(null);
  const [pathLength, setPathLength] = useState(0);
  const [scrollProgress, setScrollProgress] = useState(0);
  const locale = useLocale();
  const isRTL = locale === 'ar';

  // Track scroll progress relative to container
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
      
      // Enhanced speed for dramatic effect
      const enhancedProgress = Math.min(1, progress * 1.2);
      setScrollProgress(enhancedProgress);
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [containerRef]);

  // Set up path length for animation
  useEffect(() => {
    if (pathRef.current) {
      const length = pathRef.current.getTotalLength();
      setPathLength(length);
    }
  }, []);

  // RTL-aware path data - from top corner with random curves to opposite edge
  const pathData = isRTL 
    ? `M 1200 50
       C 1000 120, 900 200, 800 150
       C 700 100, 600 280, 500 220
       C 400 160, 350 350, 250 300
       C 150 250, 100 450, 0 500`
    : `M 0 50  
       C 200 120, 300 200, 400 150
       C 500 100, 600 280, 700 220
       C 800 160, 850 350, 950 300
       C 1050 250, 1100 450, 1200 500`;

  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
      <svg 
        className="absolute inset-0 w-full h-full"
        viewBox="0 0 1200 800"
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
          strokeWidth="25"
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