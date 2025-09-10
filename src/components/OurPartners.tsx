'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';

const imgRectangle4 = "/assets/174d9ed83a90c0514d54b7cbb68f8656ca74592c.png";
const imgRectangle5 = "/assets/0bb8e976afa37efb2547ff983a789a24c46bc909.png";
const imgRectangle6 = "/assets/0599bc8efb3df6cbf4d2b5cc07e1932dc0d2a400.png";
const imgRectangle7 = "/assets/d079f823333ca8bce293bcab9a39cb1aea4b5439.png";
const imgPattern0212 = "/assets/ef25fd14e49122ddd6cbc03c8a92caff93500eb7.png";
const imgPattern0453 = "/assets/6cdd4333a240b46dead9df86c5a83772e81b76fc.png";
const imgEllipse3622 = "/assets/be40b19cedb243ae93c978dbef58efa811bad082.svg";
const imgEllipse3623 = "/assets/b4cb37a55c71d9acc45332ad3ce54be582b29566.svg";

export default function OurPartners() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        // Store actual pixel coordinates within the container
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        setMousePosition({ x, y });
      }
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener('mousemove', handleMouseMove);
      return () => container.removeEventListener('mousemove', handleMouseMove);
    }
  }, []);

  return (
    <div ref={containerRef} className="bg-[#2c2c2b] relative w-full py-12 md:py-20 px-4 md:px-8 overflow-hidden">
      {/* Colored Background Ellipses - Desktop Only following cursor tip */}
      <div 
        className="absolute hidden md:block transition-all duration-500 ease-out pointer-events-none"
        style={{
          left: `${mousePosition.x - 226}px`, // Center ellipse on cursor with offset
          top: `${mousePosition.y - 341}px`,
          width: '452px',
          height: '683px',
        }}
      >
        <div className="absolute inset-[-58.57%_-88.5%]">
          <Image
            src={imgEllipse3622}
            alt=""
            className="block max-w-none w-full h-full opacity-60"
            fill
            style={{objectFit: 'cover'}}
          />
        </div>
      </div>

      <div 
        className="absolute hidden md:block transition-all duration-700 ease-out pointer-events-none"
        style={{
          left: `${mousePosition.x - 150}px`, // Different offset for second ellipse
          top: `${mousePosition.y - 200}px`,
          width: '452px',
          height: '684px',
        }}
      >
        <div className="absolute inset-[-58.48%_-88.5%]">
          <Image
            src={imgEllipse3623}
            alt=""
            className="block max-w-none w-full h-full opacity-60"
            fill
            style={{objectFit: 'cover'}}
          />
        </div>
      </div>

      {/* Main Content Container */}
      <div className="relative z-10 max-w-7xl mx-auto">
        {/* WHO WE SUPPORT Badge */}
        <div className="inline-flex items-center px-6 py-3 rounded-full border-2 border-[#7afdd6] mb-6 md:mb-8">
          <span className="text-[#7afdd6] text-sm font-bold uppercase tracking-wide">
            WHO WE SUPPORT
          </span>
        </div>

        {/* Main Title */}
        <h1 
          className="font-bold mb-8 md:mb-16"
          style={{
            fontSize: 'clamp(70px, 10vw, 150px)',
            lineHeight: 'clamp(75px, 11vw, 160px)', // Increased line height for better spacing
            background: 'linear-gradient(135deg, #a095e1 0%, #74cfaa 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            fontFamily: "'Aeonik', sans-serif",
            letterSpacing: '-0.7px'
          }}
        >
          Our Partners
        </h1>

        {/* Cards Grid - Mobile: Single Column, Desktop: 2x2 */}
        <div className="flex flex-col gap-6 md:grid md:grid-cols-2 md:gap-6 w-full max-w-sm mx-auto md:max-w-none">
          {/* Government Card - Text at bottom with mobile description */}
          <div className="relative rounded-[44px] md:rounded-3xl overflow-hidden w-full aspect-[321/465] md:aspect-[1280/853]">
            {/* Background Image */}
            <div 
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url('${imgRectangle4}')` }}
            />
            
            {/* Mobile: Blur overlay at bottom */}
            <div className="absolute bottom-0 left-0 right-0 md:hidden" style={{
              height: '151px',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)'
            }} />
            
            {/* Desktop: Gradient overlay */}
            <div className="absolute bottom-0 left-0 right-0 h-[45%] hidden md:block" style={{
              background: `linear-gradient(
                45deg,
                rgba(83, 22, 147, 0.75) 0%,
                rgba(100, 140, 180, 0.65) 25%,
                rgba(122, 253, 214, 0.55) 50%,
                rgba(122, 253, 214, 0.25) 75%,
                transparent 100%
              )`
            }} />
            
            {/* Text Content */}
            <div className="absolute bottom-6 left-6 right-6 md:bottom-8 md:left-8 md:right-8">
              <h3 className="text-white font-bold mb-2 md:mb-3 leading-tight" style={{
                fontSize: '20px',
                lineHeight: '18px',
                fontFamily: "'Aeonik', sans-serif"
              }}>
                Government & Semi-Government Bodies
              </h3>
              {/* Mobile description */}
              <p className="text-white/90 md:hidden" style={{
                fontSize: '12px',
                lineHeight: '16px',
                fontFamily: "'Aeonik', sans-serif"
              }}>
                We&apos;ve supported ministries, tourism boards, and royal initiatives on events aligned with Vision 2030, Expo 2020, and National Day celebrations. We understand protocol. We anticipate obstacles. We handle stress before it reaches you.
              </p>
              {/* Desktop description */}
              <p className="text-white/90 text-sm hidden md:block">
                Cultural Commissions, Ministries, And Public Authorities
              </p>
            </div>
          </div>

          {/* Tourism Card - Text centered */}
          <div className="relative rounded-[44px] md:rounded-3xl overflow-hidden w-full aspect-[321/465] md:aspect-[1280/853]">
            {/* Background Image */}
            <div 
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url('${imgRectangle5}')` }}
            />
            {/* Gradient Overlay */}
            <div className="absolute inset-0 opacity-[0.50]" style={{
              background: 'linear-gradient(135deg, #74CFAA 0%, #A095E1 100%)'
            }} />
            {/* Text Content - Centered */}
            <div className="absolute inset-0 flex items-center justify-center p-8">
              <h3 className="text-white font-bold text-center leading-tight text-[30px] md:text-3xl" style={{
                fontFamily: "'Aeonik', sans-serif"
              }}>
                <span className="md:hidden">Multinational &<br />Enterprise Brands</span>
                <span className="hidden md:block">Tourism And<br />Destination Initiatives</span>
              </h3>
            </div>
          </div>

          {/* Marketing Card - Text centered */}
          <div className="relative rounded-[44px] md:rounded-3xl overflow-hidden w-full aspect-[321/465] md:aspect-[1280/853]">
            {/* Background Image */}
            <div 
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url('${imgRectangle6}')` }}
            />
            {/* Gradient Overlay */}
            <div className="absolute inset-0 opacity-[0.48]" style={{
              background: 'linear-gradient(135deg, #75CEAB 0%, #A095E1 100%)'
            }} />
            {/* Text Content - Centered */}
            <div className="absolute inset-0 flex items-center justify-center p-8">
              <h3 className="text-white font-bold text-center leading-tight text-[30px] md:text-4xl" style={{
                fontFamily: "'Aeonik', sans-serif"
              }}>
                <span className="md:hidden">Multinational &<br />Enterprise Brands</span>
                <span className="hidden md:block">Marketing &<br />Experience Agencies</span>
              </h3>
            </div>
          </div>

          {/* Enterprise Card - Text centered */}
          <div className="relative rounded-[44px] md:rounded-3xl overflow-hidden w-full aspect-[321/465] md:aspect-[1280/853]">
            {/* Background Image */}
            <div 
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url('${imgRectangle7}')` }}
            />
            {/* Gradient Overlay */}
            <div className="absolute inset-0 opacity-[0.60]" style={{
              background: 'linear-gradient(135deg, #74CFAA 0%, #A095E1 100%)'
            }} />
            {/* Text Content - Centered */}
            <div className="absolute inset-0 flex items-center justify-center p-8">
              <h3 className="text-white font-bold text-center leading-tight text-[30px] md:text-3xl" style={{
                fontFamily: "'Aeonik', sans-serif"
              }}>
                <span className="md:hidden">Multinational &<br />Enterprise Brands</span>
                <span className="hidden md:block">Enterprise Brands</span>
              </h3>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile: Top Right Angular Decorative Element */}
      <div 
        className="absolute bg-center bg-cover bg-no-repeat md:hidden"
        style={{
          backgroundImage: `url('${imgPattern0453}')`,
          top: '0px',
          right: '-20px',
          width: '143px',
          height: '219px',
          filter: 'brightness(0) invert(1)'
        }}
      />

      {/* Mobile: Bottom Left Pattern */}
      <div className="absolute md:hidden" style={{
        bottom: '-171px',
        left: '61px',
        width: '443px',
        height: '447px'
      }}>
        <div className="flex items-center justify-center w-full h-full">
          <div 
            className="bg-center bg-cover bg-no-repeat transform rotate-90 scale-y-[-100%]"
            style={{
              backgroundImage: `url('${imgPattern0212}')`,
              width: '447px',
              height: '443px'
            }}
          />
        </div>
      </div>

      {/* Desktop: Top Right Angular Decorative Element */}
      <div 
        className="absolute bg-center bg-cover bg-no-repeat hidden md:block"
        style={{
          backgroundImage: `url('${imgPattern0453}')`,
          top: '-80px',
          right: '-120px',
          width: '400px',
          height: '600px',
          filter: 'brightness(0) invert(1)'
        }}
      />

      {/* Desktop: Bottom Left Pattern */}
      <div 
        className="absolute bg-center bg-cover bg-no-repeat hidden md:block"
        style={{
          backgroundImage: `url('${imgPattern0212}')`,
          bottom: '-100px',
          left: '-200px',
          width: '400px',
          height: '400px',
          transform: 'rotate(180deg)'
        }}
      />

      {/* Desktop: Bottom Right Pattern */}
      <div 
        className="absolute bg-center bg-cover bg-no-repeat hidden md:block"
        style={{
          backgroundImage: `url('${imgPattern0212}')`,
          bottom: '-100px',
          right: '-150px',
          width: '450px',
          height: '450px'
        }}
      />
    </div>
  );
}