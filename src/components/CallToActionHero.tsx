'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';

// Assets from Figma
const imgRectangle6 = "/assets/29064c5a0d86395e45b642fe4e6daf670490f723.png";
const imgPattern0212 = "/assets/ef25fd14e49122ddd6cbc03c8a92caff93500eb7.png";
const imgPattern0452 = "/assets/6cdd4333a240b46dead9df86c5a83772e81b76fc.png";
const imgVector449 = "/assets/f7382026e38c26d5af789578200259cf00d646d5.svg";
const imgVector450 = "/assets/2e7d38a51401314bc36af86961b4180f9a81bc96.svg";
const imgVector451 = "/assets/27f7bc8b7057872a6c373109cb92fc81093df0cd.svg";
const imgVector452 = "/assets/b435e1176051bfb6d5144bfe3e7069007ac2258c.svg";
const imgFrame1618874015 = "/assets/4a3ffff37e95986459c2da2bd6d49aaab2861815.svg";

export default function CallToActionHero() {
  const [isHovered, setIsHovered] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const componentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        // Trigger animation when component is at center of viewport
        if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
          setIsVisible(true);
          // Optional: Add console log for debugging
          // console.log('CallToActionHero animation triggered', { intersectionRatio: entry.intersectionRatio });
        }
      },
      {
        threshold: [0, 0.25, 0.5, 0.75, 1], // Multiple thresholds for more reliable detection
        rootMargin: '-5% 0px -5% 0px' // Slight margin for better triggering
      }
    );

    const currentElement = componentRef.current;
    if (currentElement) {
      observer.observe(currentElement);
    }

    return () => {
      if (currentElement) {
        observer.unobserve(currentElement);
      }
    };
  }, []);

  return (
    <div ref={componentRef} className="w-full">
      {/* Desktop Version */}
      <div 
        className="overflow-clip relative rounded-[82px] -mx-4 hidden lg:block"
        style={{ height: '807px' }}
      >
      {/* Background Image */}
      <div 
        className="absolute bg-center bg-cover bg-no-repeat h-[807px] left-0 rounded-[48px] top-0 w-[1512px]"
        style={{ backgroundImage: `url('${imgRectangle6}')` }}
      />
      
      {/* Blur Effect */}
      <div className="absolute bg-[#2c2c2b] blur-[200px] filter h-[1500px] left-[-412px] top-[-284px] w-[983px]" />
      
      {/* Decorative Vector Elements - Left Side - Desktop Only */}
      <div className="absolute left-[322.69px] top-[-350.91px]">
        {/* Vector 1 - Largest */}
        <div className="absolute flex h-[900.283px] items-center justify-center left-[322.99px] top-[-350.91px] w-[599.173px]">
          <div className="flex-none rotate-[7.038deg] skew-x-[0.038deg]">
            <div className="h-[845.341px] relative w-[499.932px]">
              <div className="absolute inset-[-29.57%_-50.01%]">
                <Image alt="" className="block max-w-none" src={imgVector449} fill />
              </div>
            </div>
          </div>
        </div>
        
        {/* Vector 2 */}
        <div className="absolute flex h-[667.772px] items-center justify-center left-[417.86px] top-[-258.55px] w-[444.839px]">
          <div className="flex-none rotate-[7.015deg]">
            <div className="h-[627.184px] relative w-[370.943px]">
              <div className="absolute inset-[-15.94%_-26.96%]">
                <Image alt="" className="block max-w-none size-full" src={imgVector450} fill style={{objectFit: 'cover'}} />
              </div>
            </div>
          </div>
        </div>
        
        {/* Vector 3 */}
        <div className="absolute flex h-[517.199px] items-center justify-center left-[496.94px] top-[-239.9px] w-[344.423px]">
          <div className="flex-none rotate-[7.022deg]">
            <div className="h-[485.732px] relative w-[287.262px]">
              <div className="absolute inset-[-24.91%_-42.12%]">
                <Image alt="" className="block max-w-none size-full" src={imgVector451} fill style={{objectFit: 'cover'}} />
              </div>
            </div>
          </div>
        </div>
        
        {/* Vector 4 - Smallest */}
        <div className="absolute flex h-[343.256px] items-center justify-center left-[612.71px] top-[-228.1px] w-[228.553px]">
          <div className="flex-none rotate-[7.027deg]">
            <div className="h-[322.356px] relative w-[190.644px]">
              <div className="absolute inset-[-37.54%_-63.47%]">
                <Image alt="" className="block max-w-none size-full" src={imgVector452} fill style={{objectFit: 'cover'}} />
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Pattern Overlay - Bottom Left - Desktop Only */}
      <div 
        className="absolute bg-center bg-cover bg-no-repeat bottom-[-447px] h-[853px] right-[1049px] w-[862px]"
        style={{ backgroundImage: `url('${imgPattern0212}')` }}
      />
      
      {/* Main Content Box - Desktop Only */}
      <div 
        className="absolute bg-white/[0.03] backdrop-blur-md box-border content-stretch flex flex-col gap-[140px] items-start justify-start overflow-hidden px-[61px] py-[68px] rounded-[76px] translate-x-[-50%] translate-y-[-50%] w-[854px]"
        style={{ 
          top: "calc(50% - 0.5px)", 
          left: "calc(50% - 214px)" 
        }}
      >
        {/* Main Title */}
        <div className="capitalize font-['Aeonik:Regular',_sans-serif] leading-[0] not-italic relative shrink-0 text-[80px] text-white w-[524px]">
          <p className="leading-[77px]">
            <span>Where </span>
            <span className="font-['Aeonik:Regular',_sans-serif] lowercase not-italic">Others Struggle, We Execute with Precision</span>
          </p>
        </div>
        
        {/* CTA Button */}
        <div 
          className="content-stretch flex items-center justify-start relative shrink-0"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <div 
            className="rounded-full flex items-center justify-center h-[65px] px-[25px]"
            style={{ 
              background: 'linear-gradient(90deg, #7afdd6 0%, #a095e1 60%, #b8a4ff 90%)'
            }}
          >
            <div className="capitalize font-['Aeonik:Regular',_sans-serif] leading-[28px] not-italic text-[#231f20] text-[20px] text-nowrap">
              get support today
            </div>
          </div>
          <div 
            className="relative shrink-0 size-[65px] transition-all duration-300"
            style={{
              transform: isHovered ? 'translateX(10px)' : 'translateX(0)'
            }}
          >
            <Image alt="" className="block max-w-none size-full" src={imgFrame1618874015} fill style={{objectFit: 'cover'}} />
          </div>
        </div>
      </div>
      
      {/* Pattern Overlay - Top Right - White with Entrance Animation - Desktop Only */}
      <div 
        className="absolute bg-center bg-cover bg-no-repeat h-[666px] left-[1108px] w-[437px] transition-all duration-1500 ease-out"
        style={{ 
          backgroundImage: `url('${imgPattern0452}')`,
          filter: 'brightness(0) invert(1)',
          transform: isVisible ? 'translateY(0)' : 'translateY(-100%)',
          top: isVisible ? '-17px' : '-683px',
          opacity: isVisible ? 1 : 0,
          transitionDelay: isVisible ? '200ms' : '0ms'
        }}
      />
      </div>

      {/* Tablet Version */}
      <div 
        className="overflow-clip relative rounded-[48px] -mx-4 hidden md:block lg:hidden"
        style={{ height: '600px' }}
      >
        <div 
          className="absolute bg-center bg-cover bg-no-repeat h-full left-0 rounded-[48px] top-0 w-full"
          style={{ backgroundImage: `url('${imgRectangle6}')` }}
        />
        <div className="absolute bg-[#2c2c2b] blur-[150px] filter h-[1000px] left-[-300px] top-[-200px] w-[700px]" />
        
        <div 
          className="absolute bg-white/[0.03] backdrop-blur-md box-border flex flex-col gap-[80px] items-center justify-center overflow-hidden px-[40px] py-[50px] rounded-[48px] translate-x-[-50%] translate-y-[-50%] w-[90%] max-w-[600px]"
          style={{ 
            top: "50%", 
            left: "50%" 
          }}
        >
          <div className="capitalize font-['Aeonik:Regular',_sans-serif] leading-[0] not-italic relative shrink-0 text-[56px] text-center text-white">
            <p className="leading-[60px]">
              <span>Where </span>
              <span className="font-['Aeonik:Regular',_sans-serif] lowercase not-italic">Others Struggle, We Execute with Precision</span>
            </p>
          </div>
          
          <div 
            className="flex items-center justify-center relative shrink-0"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            <div 
              className="rounded-full flex items-center justify-center h-[56px] px-[22px]"
              style={{ 
                background: 'linear-gradient(90deg, #7afdd6 0%, #a095e1 60%, #b8a4ff 90%)'
              }}
            >
              <div className="capitalize font-['Aeonik:Regular',_sans-serif] leading-[28px] not-italic text-[#231f20] text-[18px] text-nowrap">
                get support today
              </div>
            </div>
            <div 
              className="relative shrink-0 size-[56px] transition-all duration-300"
              style={{
                transform: isHovered ? 'translateX(10px)' : 'translateX(0)'
              }}
            >
              <Image alt="" className="block max-w-none size-full" src={imgFrame1618874015} fill style={{objectFit: 'cover'}} />
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Version - Matches Figma Design Exactly */}
      <div className="md:hidden overflow-clip relative rounded-[24px] -mx-4" style={{ height: '500px' }}>
        <div 
          className="absolute bg-center bg-cover bg-no-repeat h-full left-0 rounded-[24px] top-0 w-full"
          style={{ backgroundImage: `url('${imgRectangle6}')` }}
        />
        <div className="flex flex-col gap-[31px] items-center justify-center px-[27px] py-0 relative h-full">
          <div className="bg-[rgba(255,255,255,0.03)] backdrop-blur-md box-border flex flex-col gap-[60px] items-start justify-center overflow-clip px-[32px] py-[40px] relative rounded-[20px] shrink-0 w-full">
            <div className="capitalize font-['Aeonik:Regular',_sans-serif] leading-[0] not-italic relative shrink-0 text-left text-white w-full">
              <p className="leading-[50px] text-[48px]">
                <span>Where </span>
                <span className="font-['Aeonik:Regular',_sans-serif] lowercase not-italic">Others Struggle, We Execute with Precision</span>
              </p>
            </div>
            <div 
              className="flex items-center justify-start relative shrink-0"
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
            >
              <div 
                className="rounded-full flex items-center justify-center h-[44px] px-[18px]"
                style={{ 
                  background: 'linear-gradient(90deg, #7afdd6 0%, #a095e1 60%, #b8a4ff 90%)'
                }}
              >
                <div className="capitalize font-['Aeonik:Regular',_sans-serif] leading-[28px] not-italic text-[#231f20] text-[16px] text-nowrap">
                  get support today
                </div>
              </div>
              <div 
                className="relative shrink-0 size-[44px] transition-all duration-300"
                style={{
                  transform: isHovered ? 'translateX(10px)' : 'translateX(0)'
                }}
              >
                <Image alt="" className="block max-w-none size-full" src={imgFrame1618874015} fill style={{objectFit: 'cover'}} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}