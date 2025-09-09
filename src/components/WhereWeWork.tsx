'use client';

import { useState } from 'react';

const imgMapBackground = "/assets/a4bd38b73259c4fd4f099d834871f17ed5486466.png";
const imgPattern = "/assets/ef25fd14e49122ddd6cbc03c8a92caff93500eb7.png";
const imgCheckmark = "/assets/d57e8b023cc2954fe2c89c41bd7f2153074ba9c1.svg";
const imgArrowCircle = "/assets/56835058c52a4359de96b664c4f5e9d586e4da1d.svg";

export default function WhereWeWork() {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div className="bg-white w-full py-24">
      <div className="max-w-[1600px] mx-auto px-20">
        {/* Top Section - Where We Work */}
        <div className="flex justify-between gap-7 items-end mb-24">
          {/* Left Column */}
          <div className="flex flex-col gap-[30px] flex-1 max-w-[543px]">
            {/* Badge */}
            <div 
              className="inline-flex items-center justify-center rounded-[900px] border border-[#7afdd6] bg-[rgba(122,253,214,0.26)]"
              style={{ width: '225px', height: '62px' }}
            >
              <span className="text-[#42967d] text-[20px] uppercase">Where We Work</span>
            </div>
            
            {/* Description */}
            <p className="text-[#808184] text-[24px] leading-[32px] capitalize">
              Headquartered in Saudi Arabia and Dubai, KayanLive delivers high-impact events, from public activations
              and corporate launches to government-led showcases.
            </p>
          </div>

          {/* Right Column - Locations */}
          <div className="flex flex-col gap-6 flex-1 max-w-[697px]">
            <p className="text-[#808184] text-[24px] leading-[32px] capitalize">
              We operate across the GCC:
            </p>
            
            {/* Location Items */}
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-[9px]">
                <img src={imgCheckmark} alt="" className="w-[30px] h-[30px]" />
                <p className="text-[24px] leading-[32px] capitalize">
                  <span className="font-bold text-[#231f20]">Riyadh, Jeddah, Dammam</span>
                  <span className="text-[#231f20]">, and key </span>
                  <span className="font-bold text-[#7afdd6]">Saudi</span>
                  <span className="text-[#231f20]"> cities</span>
                </p>
              </div>
              
              <div className="flex items-center gap-[9px]">
                <img src={imgCheckmark} alt="" className="w-[30px] h-[30px]" />
                <p className="text-[24px] leading-[32px] capitalize">
                  <span className="font-bold text-[#231f20]">Dubai, Abu Dhabi, Sharjah, </span>
                  <span className="text-[#231f20]">and the wider</span>
                  <span className="font-bold text-[#231f20]"> UAE</span>
                </p>
              </div>
              
              <div className="flex items-start gap-[9px]">
                <img src={imgCheckmark} alt="" className="w-[30px] h-[30px] mt-[2px]" />
                <p className="text-[24px] leading-[32px] capitalize">
                  <span className="text-[#231f20]">And through partner networks in</span>
                  <span className="font-bold text-[#231f20]"> Qatar, Oman, Bahrain, and Kuwait</span>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section - CTA Banner */}
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
              Planning <span className="lowercase">an event outside the uae or saudi arabia?</span>
            </h3>
            
            {/* CTA Button with Arrow - Same style as Explore Our Capabilities */}
            <div 
              className="flex items-center gap-0"
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
            >
              <button className="bg-white rounded-[900px] px-[25px] py-[18px] flex items-center gap-3">
                <span className="text-[#2c2c2b] text-[20px] capitalize">Let's Build Together</span>
              </button>
              <div 
                className="bg-white rounded-full flex items-center justify-center transition-all duration-300"
                style={{
                  width: '65px',
                  height: '65px',
                  transform: isHovered ? 'translateX(10px)' : 'translateX(0)'
                }}
              >
                <img 
                  src={imgArrowCircle} 
                  alt="" 
                  className="w-full h-full"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}