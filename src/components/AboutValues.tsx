'use client';

import { useState, useEffect } from 'react';
import ValueCard from './ValueCard';

const imgOutline1 = "/assets/1349ad630f81a3bb2a509dd8abfe0e4ef85fa329.png";
const imgRectangle4235 = "/assets/79b8becbbe666db19c2c2dfdebe436eebf271e2e.png";
const imgRectangle4236 = "/assets/fe74de8467bf5ef42975b489173519217b1b04d0.png";
const imgRectangle4237 = "/assets/4bf06f33663f81bd327984084be746509f0caffd.png";
const imgRectangle4238 = "/assets/3bfce9db290033eb81342a31f55d19a490e552d3.png";
const imgRectangle4239 = "/assets/c7e54c0605f6e122070c3da28c63679ca3742a85.png";
const imgPattern0111 = "/assets/7854b2fa3456db2dfe1f88a71484d2ef952fd4d6.png";
// SVG vectors removed - focusing on card positioning

const valuesData = [
  {
    id: 'purpose-driven',
    title: 'Purpose Driven Creativity',
    description: 'Every concept earns its place by serving a goal',
    image: imgRectangle4235,
    position: { top: '12%', left: '8%' } // Pattern: Left side
  },
  {
    id: 'precision',
    title: 'Precision Without Hesitation',
    description: 'Plans are built to perform under pressure',
    image: imgRectangle4236,
    position: { top: '24%', left: '65%' } // Pattern: Right side
  },
  {
    id: 'innovation',
    title: 'Next Level Innovation',
    description: 'Technology meets experience in service of story',
    image: imgRectangle4237,
    position: { top: '36%', left: '8%' } // Pattern: Left side
  },
  {
    id: 'collaboration',
    title: 'Trusted Collaboration',
    description: 'We act as a true extension of your team',
    image: imgRectangle4238,
    position: { top: '48%', left: '65%' } // Pattern: Right side
  },
  {
    id: 'speed',
    title: 'Speed Without Sacrifice',
    description: 'Efficiency powered by structure',
    image: imgRectangle4239,
    position: { top: '60%', left: '8%' } // Pattern: Left side
  },
  {
    id: 'cultural',
    title: 'Cultural Intelligence',
    description: 'Execution aligned with local context and audience',
    image: imgRectangle4239,
    position: { top: '68%', left: '65%' } // Pattern: Right side (moved up)
  },
  {
    id: 'strategic',
    title: 'Strategic Scale',
    description: 'Whether a focused launch or multi-hall expo, we deliver with the reach of a leading exhibition company',
    image: imgRectangle4239,
    position: { top: '84%', left: '36%' } // Final: Center position
  }
];

export default function AboutValues() {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <section 
      className="relative bg-[#2c2c2b] overflow-hidden w-full"
      style={{ aspectRatio: '1512/3800', height: 'auto', minHeight: '250vh' }}
      aria-label="Company values and principles"
    >
      {/* Loading state */}
      {!isLoaded && (
        <div className="absolute inset-0 animate-pulse bg-gray-800" />
      )}
      
      <div className={`relative h-full transition-opacity duration-500 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}>
        
        {/* Main Title - Two Lines */}
        <header 
          className="absolute text-left font-bold z-20"
          style={{
            left: "4%",
            top: "2%",
            width: "88%",
            fontSize: "clamp(4vw, 8vw, 120px)",
            lineHeight: "1.1em",
            fontFamily: "'FONTSPRING DEMO - Visby CF Demi Bold', 'Poppins', sans-serif"
          }}
        >
          <h2 className="sr-only">Company Values That Activate Outcomes</h2>
          <div aria-hidden="true" style={{ textTransform: 'capitalize' }}>
            <div 
              style={{
                background: 'linear-gradient(to right, #a095e1, #74cfaa)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              Values That
            </div>
            <div 
              style={{
                background: 'linear-gradient(to right, #a095e1, #74cfaa)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              Activate Outcomes
            </div>
          </div>
        </header>

        {/* Decorative Outline - Top Right */}
        <div 
          className="absolute opacity-50 hidden lg:block"
          style={{
            backgroundImage: `url('${imgOutline1}')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            height: '12%',
            width: '20%',
            left: '74%',
            top: '-3%'
          }}
          aria-hidden="true"
        />

        {/* Dynamic SVG Route - Clean approach */}

        {/* Values Cards - Desktop Flowing Layout */}
        <div className="hidden md:block relative h-full z-20">
          {valuesData.map((value) => (
            <ValueCard
              key={value.id}
              image={value.image}
              title={value.title}
              description={value.description}
              position={value.position}
            />
          ))}
        </div>

        {/* Values Cards - Mobile/Tablet Grid Layout */}
        <div className="md:hidden px-4 pt-32 pb-16">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {valuesData.map((value) => (
              <ValueCard
                key={`mobile-${value.id}`}
                image={value.image}
                title={value.title}
                description={value.description}
                position={{ top: '0', left: '0' }} // Not used in grid layout
                className="relative w-full" // Override absolute positioning for mobile grid
              />
            ))}
          </div>
        </div>

        {/* Bottom Decorative Pattern */}
        <div 
          className="absolute flex opacity-20 hidden lg:block"
          style={{
            left: '-11%',
            bottom: '2%',
            width: '118%',
            height: '8%'
          }}
          aria-hidden="true"
        >
          {[...Array(4)].map((_, index) => (
            <div 
              key={index}
              className="bg-cover bg-center bg-no-repeat"
              style={{
                backgroundImage: `url('${imgPattern0111}')`,
                width: '300px',
                height: '300px',
                marginLeft: index > 0 ? '30px' : '0'
              }}
            />
          ))}
        </div>

      </div>

      {/* Screen reader skip link for accessibility */}
      <a 
        href="#next-section" 
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-white text-black px-4 py-2 rounded z-50"
      >
        Skip to next section
      </a>
    </section>
  );
}