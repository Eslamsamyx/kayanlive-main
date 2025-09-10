'use client';

import { useState, useEffect, useRef } from 'react';

const imgPattern = "/assets/ef25fd14e49122ddd6cbc03c8a92caff93500eb7.png";
const imgGovernment = "/assets/cb192ab808312901ac705768d1f69f35ae3c9f61.png";
const imgMultinational = "/assets/79b8becbbe666db19c2c2dfdebe436eebf271e2e.png";
const imgRealEstate = "/assets/97b98a652c6210a2b4e884e84040708ab75a45fc.png";
const imgEventPlanners = "/assets/123269087423c903b101b9352bd92acdab49d86a.png";

export default function Industries() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (containerRef.current && isHovering) {
        const rect = containerRef.current.getBoundingClientRect();
        setMousePosition({
          x: e.clientX - rect.left,
          y: e.clientY - rect.top
        });
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [isHovering]);

  return (
    <div 
      ref={containerRef}
      className="bg-[#2c2c2b] relative overflow-hidden py-20" 
      style={{ width: '100vw' }}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      {/* Cursor-following gradient effect */}
      {isHovering && (
        <div 
          className="absolute pointer-events-none transition-opacity duration-300"
          style={{ 
            width: '800px', 
            height: '800px',
            left: `${mousePosition.x - 400}px`,
            top: `${mousePosition.y - 400}px`,
            background: 'radial-gradient(circle, rgba(184, 164, 255, 0.3) 0%, rgba(122, 253, 214, 0.25) 30%, transparent 60%)',
            filter: 'blur(100px)',
            opacity: 0.6
          }}
        />
      )}

      {/* Background Ellipses from Figma - Teal and Purple glows */}
      <div 
        className="absolute"
        style={{
          width: '452px',
          height: '683px',
          right: '-150px',
          top: '451px'
        }}
      >
        <div 
          className="absolute rounded-full"
          style={{
            width: '452px',
            height: '683px',
            background: 'radial-gradient(circle, rgba(122, 253, 214, 0.6) 0%, transparent 70%)',
            filter: 'blur(120px)'
          }}
        />
      </div>
      
      <div 
        className="absolute"
        style={{
          width: '452px',
          height: '684px',
          right: '-265px',
          bottom: '100px'
        }}
      >
        <div 
          className="absolute rounded-full"
          style={{
            width: '452px',
            height: '684px',
            background: 'radial-gradient(circle, rgba(147, 112, 219, 0.6) 0%, transparent 70%)',
            filter: 'blur(120px)'
          }}
        />
      </div>
      
      {/* Bottom Left Pattern - Exact positioning from Figma */}
      <div 
        className="absolute bg-center bg-cover bg-no-repeat"
        style={{ 
          backgroundImage: `url('${imgPattern}')`,
          width: '894px',
          height: '884px',
          bottom: '-188px',
          left: '-420px',
          opacity: 0.08,
          mixBlendMode: 'lighten'
        }}
      />
      
      {/* Bottom Right Pattern (rotated 90deg and flipped) - Exact from Figma */}
      <div 
        className="absolute"
        style={{ 
          width: '978px',
          height: '967px',
          bottom: '-173px',
          right: '-273px'
        }}
      >
        <div 
          className="bg-center bg-cover bg-no-repeat w-full h-full"
          style={{ 
            backgroundImage: `url('${imgPattern}')`,
            transform: 'rotate(90deg) scaleY(-1)',
            opacity: 0.08,
            mixBlendMode: 'lighten'
          }}
        />
      </div>
      
      {/* Diamond decorations - Scattered around the grid */}
      {/* Left side diamonds */}
      <div 
        className="absolute"
        style={{ 
          width: '35px',
          height: '35px',
          left: '40px',
          top: '55%',
          transform: 'rotate(45deg)',
          background: 'rgba(122, 253, 214, 0.6)',
          filter: 'blur(1px)'
        }}
      />
      
      <div 
        className="absolute"
        style={{ 
          width: '28px',
          height: '28px',
          left: '25px',
          bottom: '350px',
          transform: 'rotate(45deg)',
          background: 'rgba(184, 164, 255, 0.5)',
          filter: 'blur(1px)'
        }}
      />
      
      <div 
        className="absolute"
        style={{ 
          width: '40px',
          height: '40px',
          left: '80px',
          bottom: '250px',
          transform: 'rotate(45deg)',
          background: 'rgba(122, 253, 214, 0.4)',
          filter: 'blur(1px)'
        }}
      />
      
      {/* Bottom diamonds */}
      <div 
        className="absolute"
        style={{ 
          width: '32px',
          height: '32px',
          left: '200px',
          bottom: '80px',
          transform: 'rotate(45deg)',
          background: 'rgba(184, 164, 255, 0.45)',
          filter: 'blur(1px)'
        }}
      />
      
      <div 
        className="absolute"
        style={{ 
          width: '38px',
          height: '38px',
          left: '350px',
          bottom: '60px',
          transform: 'rotate(45deg)',
          background: 'rgba(122, 253, 214, 0.5)',
          filter: 'blur(1px)'
        }}
      />
      
      <div 
        className="absolute"
        style={{ 
          width: '30px',
          height: '30px',
          left: '500px',
          bottom: '90px',
          transform: 'rotate(45deg)',
          background: 'rgba(184, 164, 255, 0.4)',
          filter: 'blur(1px)'
        }}
      />
      
      {/* Right side diamonds */}
      <div 
        className="absolute"
        style={{ 
          width: '34px',
          height: '34px',
          right: '80px',
          top: '45%',
          transform: 'rotate(45deg)',
          background: 'rgba(122, 253, 214, 0.45)',
          filter: 'blur(1px)'
        }}
      />
      
      <div 
        className="absolute"
        style={{ 
          width: '36px',
          height: '36px',
          right: '120px',
          bottom: '180px',
          transform: 'rotate(45deg)',
          background: 'rgba(184, 164, 255, 0.5)',
          filter: 'blur(1px)'
        }}
      />
      
      {/* Main Content - Match navbar content edges exactly */}
      <div className="max-w-[1600px] mx-auto px-20">
        {/* Badge */}
        <div 
          className="inline-flex items-center justify-center rounded-[900px] border-2 border-[#7afdd6] mb-10"
          style={{ width: '266px', height: '62px' }}
        >
          <span className="text-[#7afdd6] text-[20px] uppercase">Who We Work With</span>
        </div>
        
        {/* Title */}
        <h2 
          className="capitalize font-normal mb-14"
          style={{
            fontSize: '200px',
            lineHeight: '200px',
            letterSpacing: '-2px',
            background: 'linear-gradient(90deg, #b8a4ff 0%, #7afdd6 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}
        >
          Industries
        </h2>
        
        {/* Industry Cards Grid - 2x2 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Government Card - Expanded with description */}
          <div 
            className="relative rounded-[44px] overflow-hidden group"
            style={{ height: '465px' }}
          >
            <div 
              className="absolute inset-0 bg-center bg-cover"
              style={{ backgroundImage: `url('${imgGovernment}')` }}
            />
            {/* Bottom blur with gradient overlay - left to right with soft top edge */}
            <div 
              className="absolute"
              style={{ 
                height: '244px',
                bottom: '0',
                left: '0',
                right: '0',
                background: 'linear-gradient(to right, rgba(147, 112, 219, 0.6) 0%, rgba(122, 253, 214, 0.5) 100%)',
                backdropFilter: 'blur(20px)',
                maskImage: 'linear-gradient(180deg, transparent 0%, black 40%, black 100%)',
                WebkitMaskImage: 'linear-gradient(180deg, transparent 0%, black 40%, black 100%)'
              }}
            />
            <div className="absolute" style={{ 
              left: '33px',
              bottom: '40px',
              right: '33px'
            }}>
              <h3 className="text-white font-bold mb-3" style={{ 
                fontSize: '40px',
                lineHeight: '36px'
              }}>
                Government & Semi-Government Bodies
              </h3>
              <p className="text-white" style={{ 
                fontSize: '16px',
                lineHeight: '22px'
              }}>
                We&apos;ve Supported Ministries, Tourism Boards, And Royal Initiatives On Events Aligned With Vision 2030, Expo 2020, And National Day Celebrations. We Understand Protocol. We Anticipate Obstacles. We Handle Stress Before It Reaches You.
              </p>
            </div>
          </div>
          
          {/* Multinational Card */}
          <div 
            className="relative rounded-[44px] overflow-hidden group"
            style={{ height: '465px' }}
          >
            <div 
              className="absolute inset-0 bg-center bg-cover"
              style={{ backgroundImage: `url('${imgMultinational}')` }}
            />
            {/* Purple to teal gradient overlay matching Figma */}
            <div 
              className="absolute inset-0"
              style={{ 
                background: 'linear-gradient(to right, rgba(147, 112, 219, 0.5) 0%, rgba(122, 253, 214, 0.4) 100%)'
              }}
            />
            <div className="absolute inset-0 flex items-center justify-center px-12">
              <h3 className="text-white font-bold text-center" style={{ 
                fontSize: '50px',
                lineHeight: '44px'
              }}>
                Multinational & Enterprise Brands
              </h3>
            </div>
          </div>
          
          {/* Real Estate Card */}
          <div 
            className="relative rounded-[44px] overflow-hidden group"
            style={{ height: '465px' }}
          >
            <div 
              className="absolute inset-0 bg-center bg-cover"
              style={{ backgroundImage: `url('${imgRealEstate}')` }}
            />
            {/* Purple to teal gradient overlay matching Figma */}
            <div 
              className="absolute inset-0"
              style={{ 
                background: 'linear-gradient(to right, rgba(147, 112, 219, 0.55) 0%, rgba(122, 253, 214, 0.45) 100%)'
              }}
            />
            <div className="absolute inset-0 flex items-center justify-center px-12">
              <h3 className="text-white font-bold text-center" style={{ 
                fontSize: '50px',
                lineHeight: '44px'
              }}>
                Real Estate & Automotive Developers
              </h3>
            </div>
          </div>
          
          {/* Event Planners Card */}
          <div 
            className="relative rounded-[44px] overflow-hidden group"
            style={{ height: '465px' }}
          >
            <div 
              className="absolute inset-0 bg-center bg-cover"
              style={{ backgroundImage: `url('${imgEventPlanners}')` }}
            />
            {/* Purple to teal gradient overlay matching Figma */}
            <div 
              className="absolute inset-0"
              style={{ 
                background: 'linear-gradient(to right, rgba(147, 112, 219, 0.45) 0%, rgba(122, 253, 214, 0.5) 100%)'
              }}
            />
            <div className="absolute inset-0 flex items-center justify-center px-12">
              <h3 className="text-white font-bold text-center" style={{ 
                fontSize: '50px',
                lineHeight: '44px'
              }}>
                Event Planners & Marketing Agencies
              </h3>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}