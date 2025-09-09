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

export default function AboutValuesSimpleBackup() {
  const [scrollProgress, setScrollProgress] = useState(0);
  const sectionRef = useRef<HTMLElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const [pathLength, setPathLength] = useState(0);

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
      
      // Adaptive leading - path moves faster through curves to stay ahead
      const leadingProgress = Math.min(1, progress * 1.15);
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

  return (
    <section 
      ref={sectionRef}
      className="relative bg-[#1f2125] py-20 overflow-hidden"
      aria-label="Company values and principles"
    >
      <div className="max-w-7xl mx-auto px-6">
        {/* Title */}
        <h2 
          className="text-5xl md:text-7xl font-bold mb-20 leading-tight"
          style={{
            background: 'linear-gradient(90deg, #9ea7ff, #79e7c7)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          Values That<br />Activate Outcomes
        </h2>

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
          
          {/* Main path */}
          <path
            ref={pathRef}
            d="M 200 300 Q 600 400, 1000 500 T 200 900 Q 600 1000, 1000 1100 T 200 1500 Q 600 1600, 1000 1700 T 600 2100"
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
            
            return (
              <div 
                key={value.id}
                className={`flex ${alignment}`}
                style={{
                  opacity: scrollProgress > (index / 7 * 0.85) ? 1 : 0.3,
                  transform: `translateY(${scrollProgress > (index / 7 * 0.85) ? 0 : 20}px)`,
                  transition: 'all 0.6s ease-out'
                }}
              >
                <div className="w-full max-w-md">
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
                    <h3 className="text-white text-xl font-bold mb-2">
                      {value.title}
                    </h3>
                    <p className="text-gray-400 text-sm leading-relaxed">
                      {value.description}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}