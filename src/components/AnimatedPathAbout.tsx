'use client';

import React, { useRef, useEffect, useState } from 'react';

interface AnimatedPathAboutProps {
  containerRef?: React.RefObject<HTMLElement | null>;
  className?: string;
}

export default function AnimatedPathAbout({ containerRef, className = '' }: AnimatedPathAboutProps) {
  const pathRef = useRef<SVGPathElement>(null);
  const [pathLength, setPathLength] = useState(0);
  const [scrollProgress, setScrollProgress] = useState(0);

  // Path data specific to AboutValues - flows through all 7 value boxes
  // Box positions:
  // 1. Purpose (left): 250, 600
  // 2. Precision (right): 950, 1200
  // 3. Innovation (left): 250, 1800
  // 4. Collaboration (right): 950, 2400
  // 5. Speed (left): 250, 3000
  // 6. Cultural (right): 950, 3600
  // 7. Strategic (center): 600, 4200
  const pathData = `M 250 600
    C 350 650, 450 750, 600 900
    C 750 1050, 850 1150, 950 1200
    C 1050 1250, 1100 1350, 1050 1450
    C 1000 1550, 850 1650, 600 1725
    C 350 1800, 275 1800, 250 1800
    C 200 1800, 150 1900, 150 2000
    C 150 2100, 250 2200, 450 2300
    C 650 2400, 850 2400, 950 2400
    C 1050 2400, 1100 2500, 1050 2600
    C 1000 2700, 850 2800, 600 2900
    C 350 3000, 275 3000, 250 3000
    C 200 3000, 150 3100, 150 3200
    C 150 3300, 250 3400, 450 3500
    C 650 3600, 850 3600, 950 3600
    C 1050 3600, 1100 3700, 1050 3800
    C 1000 3900, 900 3950, 750 4050
    C 650 4150, 625 4175, 600 4200`;

  // Track scroll progress relative to container - EXACT copy from AnimatedPath
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

      // Very slow animation - reduced multiplier for slower effect
      const enhancedProgress = Math.min(1, progress * 0.5);
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
  }, [pathData]);

  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none z-0 ${className}`}>
      <svg
        className="absolute inset-0 w-full h-full"
        viewBox="0 0 1200 5000"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient
            id="pathGradientAbout"
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
        </defs>

        {/* Main animated path - flat design without glow, same as WhyKayanLive */}
        <path
          ref={pathRef}
          d={pathData}
          fill="none"
          stroke="url(#pathGradientAbout)"
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