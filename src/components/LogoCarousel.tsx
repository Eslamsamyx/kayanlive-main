'use client';

import { useEffect, useRef, useState } from 'react';

export default function LogoCarousel() {
  const [isPaused, setIsPaused] = useState(false);
  const animationRef = useRef<number>();
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<number>(0);

  // Logo items to display (we'll duplicate for seamless scrolling)
  const logoItems = [
    { id: 1, text: 'Logo', width: 120 },
    { id: 2, text: 'Brand Logo', width: 180 },
    { id: 3, text: 'Brand Logo', width: 180 },
    { id: 4, text: 'Brand Logo', width: 180 },
    { id: 5, text: 'Logo', width: 120 },
    { id: 6, text: 'Brand Logo', width: 180 },
    { id: 7, text: 'Logo', width: 120 },
    { id: 8, text: 'Logo', width: 120 },
    { id: 9, text: 'Brand Logo', width: 180 },
  ];

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const animate = () => {
      if (!isPaused) {
        scrollRef.current += 0.5; // Slower, smoother speed
        
        // Calculate total width of one set of logos
        const firstChild = container.firstElementChild as HTMLElement;
        if (firstChild) {
          const totalWidth = firstChild.scrollWidth / 2;
          
          // Reset when we've scrolled one full set
          if (scrollRef.current >= totalWidth) {
            scrollRef.current = 0;
          }
          
          // Apply transform for smooth GPU-accelerated animation
          firstChild.style.transform = `translateX(-${scrollRef.current}px)`;
        }
      }
      
      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPaused]);

  return (
    <div className="relative w-full bg-white py-8 overflow-hidden">
      {/* Main container with ribbon background - full width */}
      <div 
        className="relative"
        style={{ height: '120px' }}
      >
        {/* Background ribbon shape - using CSS instead of SVG for better rendering */}
        <div 
          className="absolute left-0 right-0 flex items-center mx-8"
          style={{ 
            background: 'linear-gradient(90deg, #f8f8f8 0%, #f0f0f0 50%, #f8f8f8 100%)',
            borderRadius: '60px',
            height: '80px',
            top: '20px'
          }}
        />

        {/* Scrolling container - full viewport width */}
        <div 
          ref={containerRef}
          className="relative overflow-hidden h-full flex items-center"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
            <div className="flex items-center whitespace-nowrap will-change-transform">
              {/* First set of logos */}
              {logoItems.map((item) => (
                <div
                  key={`first-${item.id}`}
                  className="flex items-center justify-center px-12"
                  style={{ minWidth: `${item.width}px` }}
                >
                  <div className="flex items-center justify-center h-[60px] px-8 py-4 bg-white rounded-full shadow-sm border border-gray-100">
                    <span className="capitalize font-semibold text-[#2c2c2b] text-[20px]">
                      {item.text}
                    </span>
                  </div>
                </div>
              ))}
              
              {/* Duplicate set for seamless scrolling */}
              {logoItems.map((item) => (
                <div
                  key={`second-${item.id}`}
                  className="flex items-center justify-center px-12"
                  style={{ minWidth: `${item.width}px` }}
                >
                  <div className="flex items-center justify-center h-[60px] px-8 py-4 bg-white rounded-full shadow-sm border border-gray-100">
                    <span className="capitalize font-semibold text-[#2c2c2b] text-[20px]">
                      {item.text}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        {/* Gradient overlays for fade effect */}
        <div 
          className="absolute left-0 top-0 bottom-0 w-32 pointer-events-none z-10"
          style={{ 
            background: 'linear-gradient(90deg, rgba(255,255,255,1) 0%, rgba(255,255,255,0) 100%)' 
          }}
        />
        <div 
          className="absolute right-0 top-0 bottom-0 w-32 pointer-events-none z-10"
          style={{ 
            background: 'linear-gradient(270deg, rgba(255,255,255,1) 0%, rgba(255,255,255,0) 100%)' 
          }}
        />
      </div>
    </div>
  );
}