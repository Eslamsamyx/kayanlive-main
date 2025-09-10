'use client';

import { useState, useEffect, useRef } from 'react';

// Images
const images = {
  purpose: "/assets/79b8becbbe666db19c2c2dfdebe436eebf271e2e.png",
  precision: "/assets/fe74de8467bf5ef42975b489173519217b1b04d0.png", 
  innovation: "/assets/4bf06f33663f81bd327984084be746509f0caffd.png",
  collaboration: "/assets/3bfce9db290033eb81342a31f55d19a490e552d3.png",
  placeholder: "/assets/c7e54c0605f6e122070c3da28c63679ca3742a85.png"
};

const valuesData = [
  {
    id: 'purpose',
    title: 'Purpose Driven Creativity',
    description: 'Every concept earns its place by serving a goal',
    image: images.purpose,
    position: { row: 1, col: 'left' }
  },
  {
    id: 'precision',
    title: 'Precision Without Hesitation',
    description: 'Plans are built to perform under pressure',
    image: images.precision,
    position: { row: 2, col: 'right' }
  },
  {
    id: 'innovation',
    title: 'Next Level Innovation',
    description: 'Technology meets experience in service of story',
    image: images.innovation,
    position: { row: 3, col: 'left' }
  },
  {
    id: 'collaboration',
    title: 'Trusted Collaboration',
    description: 'We act as a true extension of your team',
    image: images.collaboration,
    position: { row: 4, col: 'right' }
  },
  {
    id: 'speed',
    title: 'Speed Without Sacrifice',
    description: 'Efficiency powered by structure',
    image: images.placeholder,
    position: { row: 5, col: 'left' }
  },
  {
    id: 'cultural',
    title: 'Cultural Intelligence',
    description: 'Execution aligned with local context and audience',
    image: images.placeholder,
    position: { row: 6, col: 'right' }
  },
  {
    id: 'strategic',
    title: 'Strategic Scale',
    description: 'Whether a focused launch or multi-hall expo, we deliver with the reach of a leading exhibition company',
    image: images.placeholder,
    position: { row: 7, col: 'center' }
  }
];

export default function AboutValues() {
  const [scrollProgress, setScrollProgress] = useState(0);
  const sectionRef = useRef<HTMLElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const [pathLength, setPathLength] = useState(0);
  const [calculatedHeight, setCalculatedHeight] = useState(0);
  const contentRef = useRef<HTMLDivElement>(null);

  // Track scroll progress based on Values section only
  useEffect(() => {
    const handleScroll = () => {
      if (!sectionRef.current) return;
      
      const section = sectionRef.current;
      const sectionTop = section.offsetTop;
      const sectionHeight = section.offsetHeight;  
      const currentScroll = window.scrollY;
      const windowHeight = window.innerHeight;
      
      // Use viewport center as reference point
      const viewportCenter = currentScroll + windowHeight / 2;
      
      // Calculate progress through Values section only (0% at start, 100% at end)
      let progress = (viewportCenter - sectionTop) / sectionHeight;
      progress = Math.max(0, Math.min(1, progress));
      
      // Enhanced curve speed - path moves faster through curves to maintain leading
      const leadingProgress = Math.min(1, progress * 1.3);
      setScrollProgress(leadingProgress);
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Set up path length for animation
  useEffect(() => {
    if (pathRef.current) {
      const length = pathRef.current.getTotalLength();
      setPathLength(length);
    }
  }, []);

  // Calculate dynamic height based on actual content
  useEffect(() => {
    const calculateHeight = () => {
      if (contentRef.current) {
        const contentHeight = contentRef.current.scrollHeight;
        // Add buffer for the pattern at bottom + spacing
        const totalHeight = contentHeight + 250; // 250px buffer for pattern + spacing
        setCalculatedHeight(totalHeight);
      }
    };

    // Delay calculation to ensure content is rendered
    const timer = setTimeout(calculateHeight, 100);
    
    // Recalculate on window resize
    window.addEventListener('resize', calculateHeight);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', calculateHeight);
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
      <div ref={contentRef} className="max-w-7xl mx-auto px-6 md:px-8 lg:px-12 relative">
        {/* Title with SVG Logo */}
        <div className="relative mb-6 md:mb-12 lg:mb-16">
          <h2 
            className="text-[100px] md:text-[130px] lg:text-[150px] font-bold leading-[96px] md:leading-[120px] lg:leading-[144px] capitalize"
            style={{
              background: 'linear-gradient(90deg, #a095e1, #74cfaa)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              fontFamily: '"Poppins", sans-serif'
            }}
          >
            Values That Activate Outcomes
          </h2>
          
          {/* SVG Logo beside title */}
          <div 
            className="absolute w-[302px] h-[469px] opacity-50 bg-center bg-cover bg-no-repeat"
            style={{
              top: '-208px',
              right: '0px',
              backgroundImage: `url('/assets/1349ad630f81a3bb2a509dd8abfe0e4ef85fa329.png')`
            }}
          />
        </div>

        {/* Simple SVG Background Path */}
        <svg 
          className="absolute inset-0 w-full h-full pointer-events-none"
          viewBox="0 0 1200 2400"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="repeatingGradient" x1="0%" y1="0%" x2="100%" y2="0%" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#9ea7ff" />
              <stop offset="14.28%" stopColor="#79e7c7" />
              <stop offset="28.56%" stopColor="#9ea7ff" />
              <stop offset="42.84%" stopColor="#79e7c7" />
              <stop offset="57.12%" stopColor="#9ea7ff" />
              <stop offset="71.4%" stopColor="#79e7c7" />
              <stop offset="85.68%" stopColor="#9ea7ff" />
              <stop offset="100%" stopColor="#79e7c7" />
            </linearGradient>
          </defs>
          
          {/* Smooth path with no sharp edges - extended to last image */}
          <path
            ref={pathRef}
            d="M 200 300
               C 400 250, 600 250, 800 350
               S 1200 450, 1000 550
               S 600 650, 400 750  
               S 0 850, 200 950
               S 600 1050, 800 1150
               S 1200 1250, 1000 1350
               S 600 1450, 400 1550
               S 200 1650, 600 1750
               S 1000 1850, 800 1950
               S 400 2050, 600 2150"
            fill="none"
            stroke="url(#repeatingGradient)"
            strokeWidth="12"
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
        <div className="relative space-y-32">
          {valuesData.map((value, index) => {
            const alignment = value.position.col === 'left' 
              ? 'justify-start' 
              : value.position.col === 'right' 
              ? 'justify-end' 
              : 'justify-center';
            
            // Viewport-based trigger points for instant appearance
            const viewportTriggerPoints = [
              0.15, // Card 1: exactly when entering viewport
              0.29, // Card 2: second card enters viewport
              0.43, // Card 3: third card enters viewport  
              0.57, // Card 4: fourth card enters viewport
              0.71, // Card 5: fifth card enters viewport
              0.85, // Card 6: sixth card enters viewport
              0.99  // Card 7: seventh card enters viewport
            ];
            
            const shouldShow = scrollProgress >= viewportTriggerPoints[index];
            
            return (
              <div 
                key={value.id}
                className={`flex ${alignment}`}
                style={{
                  opacity: shouldShow ? 1 : 0,
                  transform: `translateY(${shouldShow ? 0 : 40}px)`,
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
                    <h3 className="text-white text-lg md:text-xl lg:text-2xl font-bold mb-2" style={{ fontFamily: '"Poppins", sans-serif' }}>
                      {value.title}
                    </h3>
                    <p className="text-gray-400 text-sm leading-relaxed" style={{ fontFamily: '"Poppins", sans-serif' }}>
                      {value.description}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
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
                backgroundImage: `url('/assets/7854b2fa3456db2dfe1f88a71484d2ef952fd4d6.png')`,
                opacity: 0.6
              }}
            />
          ))}
        </div>
      </div>
    </section>
  );
}