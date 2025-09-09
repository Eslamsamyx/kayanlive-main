'use client';

import { useState } from 'react';
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

  return (
    <div 
      className="overflow-clip relative rounded-[82px] -mx-4"
      style={{ height: '807px' }}
    >
      {/* Background Image */}
      <div 
        className="absolute bg-center bg-cover bg-no-repeat h-[807px] left-0 rounded-[48px] top-0 w-[1512px]"
        style={{ backgroundImage: `url('${imgRectangle6}')` }}
      />
      
      {/* Blur Effect */}
      <div className="absolute bg-[#2c2c2b] blur-[200px] filter h-[1500px] left-[-412px] top-[-284px] w-[983px]" />
      
      {/* Decorative Vector Elements - Left Side */}
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
                <img alt="" className="block max-w-none size-full" src={imgVector450} />
              </div>
            </div>
          </div>
        </div>
        
        {/* Vector 3 */}
        <div className="absolute flex h-[517.199px] items-center justify-center left-[496.94px] top-[-239.9px] w-[344.423px]">
          <div className="flex-none rotate-[7.022deg]">
            <div className="h-[485.732px] relative w-[287.262px]">
              <div className="absolute inset-[-24.91%_-42.12%]">
                <img alt="" className="block max-w-none size-full" src={imgVector451} />
              </div>
            </div>
          </div>
        </div>
        
        {/* Vector 4 - Smallest */}
        <div className="absolute flex h-[343.256px] items-center justify-center left-[612.71px] top-[-228.1px] w-[228.553px]">
          <div className="flex-none rotate-[7.027deg]">
            <div className="h-[322.356px] relative w-[190.644px]">
              <div className="absolute inset-[-37.54%_-63.47%]">
                <img alt="" className="block max-w-none size-full" src={imgVector452} />
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Pattern Overlay - Bottom Left */}
      <div 
        className="absolute bg-center bg-cover bg-no-repeat bottom-[-447px] h-[853px] right-[1049px] w-[862px]"
        style={{ backgroundImage: `url('${imgPattern0212}')` }}
      />
      
      {/* Main Content Box */}
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
            <img alt="" className="block max-w-none size-full" src={imgFrame1618874015} />
          </div>
        </div>
      </div>
      
      {/* Pattern Overlay - Top Right */}
      <div 
        className="absolute bg-center bg-cover bg-no-repeat h-[666px] left-[1108px] top-[-17px] w-[437px]"
        style={{ backgroundImage: `url('${imgPattern0452}')` }}
      />
    </div>
  );
}