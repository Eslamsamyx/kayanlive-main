'use client';

import { useState } from 'react';
import Image from 'next/image';

// Assets from the existing pattern
const imgPattern = "/assets/ef25fd14e49122ddd6cbc03c8a92caff93500eb7.png";
const imgFrame1618874015 = "/assets/154289bd0be3bf0eddab560357bd09aa27f634bc.svg";

export default function NotSureWhereToStart() {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div className="bg-white w-full py-24">
      <div className="max-w-[1600px] mx-auto px-20">
        
        {/* Title Section - Positioned above the banner */}
        <div className="text-center mb-16">
          <h1 
            className="font-bold text-[90px] leading-[85px] capitalize tracking-[-2.7px]"
            style={{
              fontFamily: "'FONTSPRING DEMO - Visby CF Demi Bold', sans-serif"
            }}
          >
            <span 
              style={{
                background: 'linear-gradient(to right, #a095e1, #74cfaa)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}
            >
              Not Sure Where{' '}
            </span>
            <span className="text-[#2c2c2b]">
              To Start?
            </span>
          </h1>
        </div>

        {/* CTA Banner - Exact same structure as WhereWeWork */}
        <div 
          className="relative overflow-hidden rounded-[48px]"
          style={{ 
            height: '418px',
            background: 'linear-gradient(135deg, #a095e1 0%, #74cfaa 100%)'
          }}
        >
          {/* Pattern Overlay - Bottom Right */}
          <div 
            className="absolute"
            style={{
              width: '749px',
              height: '757px',
              right: '-105px',
              bottom: '-223px'
            }}
          >
            <div 
              className="w-full h-full bg-center bg-cover opacity-20"
              style={{ 
                backgroundImage: `url('${imgPattern}')`,
                transform: 'rotate(90deg)'
              }}
            />
          </div>
          
          {/* Diamond Shape - Left */}
          <div 
            className="absolute"
            style={{
              width: '614px',
              height: '614px',
              left: '-242px',
              top: '50%',
              transform: 'translateY(-50%)'
            }}
          >
            <div 
              className="w-[434px] h-[434px] bg-white/20 absolute top-1/2 left-1/2"
              style={{
                transform: 'translate(-50%, -50%) rotate(45deg)'
              }}
            />
          </div>

          {/* Diamond Pattern - Right Side - From Figma */}
          <div className="absolute bottom-[-223px] flex h-[757px] items-center justify-center right-[-105px] w-[749px] z-20">
            <div className="flex-none rotate-[90deg]">
              <div 
                className="bg-center bg-cover bg-no-repeat h-[749px] w-[757px]" 
                style={{ 
                  backgroundImage: `url('${imgPattern}')`,
                  filter: 'brightness(0) invert(1)',
                  opacity: '1'
                }} 
              />
            </div>
          </div>

          {/* Content */}
          <div className="absolute left-[137px] top-20 w-[550px] flex flex-col gap-[42px] z-10">
            <h3 className="text-white text-[50px] leading-[60px] capitalize">
              Every <span className="lowercase">project begins with a single conversation.</span>
            </h3>
            
            {/* CTA Button with Arrow - Same style as WhereWeWork */}
            <div 
              className="flex items-center gap-0"
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
            >
              <button className="bg-white rounded-[900px] px-[25px] py-[18px] flex items-center gap-3">
                <span className="text-[#2c2c2b] text-[20px] capitalize">Speak With Our Strategy Team</span>
              </button>
              <div 
                className="bg-white rounded-full flex items-center justify-center transition-all duration-300"
                style={{
                  width: '65px',
                  height: '65px',
                  transform: isHovered ? 'translateX(10px)' : 'translateX(0)'
                }}
              >
                <Image 
                  src={imgFrame1618874015} 
                  alt="" 
                  className="w-full h-full"
                  fill
                  style={{objectFit: 'cover'}}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}