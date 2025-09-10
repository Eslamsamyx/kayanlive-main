'use client';

import { useState } from 'react';
import Image from 'next/image';

// Assets from the Figma pattern
const imgPattern = "/assets/ef25fd14e49122ddd6cbc03c8a92caff93500eb7.png";
const imgFrame1618874015 = "/assets/154289bd0be3bf0eddab560357bd09aa27f634bc.svg";

interface JoinOurNetworkTemplateProps {
  title: string;
  subtitle: string;
  buttonText: string;
  buttonHref?: string;
}

export default function JoinOurNetworkTemplate({
  title,
  subtitle,
  buttonText,
  buttonHref
}: JoinOurNetworkTemplateProps) {
  const [isHovered, setIsHovered] = useState(false);

  const ButtonComponent = buttonHref ? 'a' : 'button';
  const buttonProps = buttonHref ? { href: buttonHref } : {};

  return (
    <div className="bg-white w-full py-24">
      <div className="max-w-[1600px] mx-auto px-20">
        
        {/* Title Section - Positioned above the banner */}
        <div className="text-center mb-16">
          <h1 
            className="font-bold text-[90px] leading-[85px] capitalize tracking-[-2.7px] text-[#515151]"
            style={{
              fontFamily: "'FONTSPRING DEMO - Visby CF Demi Bold', sans-serif"
            }}
          >
            {title}
          </h1>
        </div>

        {/* CTA Banner - Desktop: Original structure, Mobile: Tall Figma design */}
        <div 
          className="relative overflow-hidden rounded-[25px] md:rounded-[48px] h-[500px] md:h-[418px]"
          style={{ 
            background: 'linear-gradient(135deg, #a095e1 0%, #74cfaa 100%)'
          }}
        >
          {/* Mobile Decorative Elements - Small screens only */}
          {/* Top Diamond - Mobile only - Large diamond extending above */}
          <div 
            className="absolute sm:hidden flex items-center justify-center"
            style={{
              width: '373.706px',
              height: '373.706px',
              top: '-221.641px',
              left: '50%',
              transform: 'translateX(-50%)'
            }}
          >
            <div 
              className="w-[264.258px] h-[264.258px] bg-white/20"
              style={{
                transform: 'rotate(315deg)'
              }}
            />
          </div>

          {/* Bottom Diamond Pattern - Mobile only - White with 100% opacity */}
          <div 
            className="absolute sm:hidden flex items-center justify-center"
            style={{
              width: '315px',
              height: '319px',
              bottom: '-125.5px',
              left: '50%',
              transform: 'translateX(-50%)'
            }}
          >
            <div 
              className="w-[319px] h-[315px] bg-center bg-cover"
              style={{ 
                backgroundImage: `url('${imgPattern}')`,
                transform: 'rotate(90deg)',
                filter: 'brightness(0) invert(1)',
                opacity: '1'
              }}
            />
          </div>

          {/* Desktop Decorative Elements - Large screens only */}
          {/* Pattern Overlay - Desktop only */}
          <div 
            className="absolute hidden lg:block"
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
          
          {/* Diamond Shape - Left - Desktop only */}
          <div 
            className="absolute hidden lg:block"
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

          {/* Diamond Pattern - Right Side - Desktop only */}
          <div className="absolute hidden lg:block bottom-[-223px] flex h-[757px] items-center justify-center right-[-105px] w-[749px] z-20">
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

          {/* Content - Mobile: Centered and moved down, Desktop: Left-aligned */}
          <div className="absolute left-0 md:left-[137px] top-20 md:top-20 w-full md:w-[567px] flex flex-col gap-[30px] md:gap-[42px] items-center md:items-start justify-start z-10 px-8 md:px-0">
            <h3 className="text-white text-[30px] md:text-[50px] leading-[30px] md:leading-[51px] capitalize text-center md:text-left max-w-[290px] md:max-w-none md:w-auto">
              {subtitle}
            </h3>
            
            {/* CTA Button with Arrow - Height matched circle */}
            <div 
              className="flex items-center gap-0 mx-4 md:mx-0"
            >
              <ButtonComponent 
                {...buttonProps}
                className="bg-white rounded-[900px] px-3 md:px-[25px] py-3 md:py-[18px] flex items-center gap-2 md:gap-3 flex-1 max-w-[240px] md:max-w-none h-12 md:h-16"
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
              >
                <span className="text-[#2c2c2b] text-[14px] md:text-[20px] capitalize text-center leading-tight">
                  {buttonText}
                </span>
              </ButtonComponent>
              <div 
                className="bg-white rounded-full flex items-center justify-center transition-all duration-300 flex-shrink-0 h-12 md:h-16 aspect-square"
                style={{
                  transform: isHovered ? 'translateX(10px)' : 'translateX(0)'
                }}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
              >
                <Image 
                  src={imgFrame1618874015} 
                  alt="" 
                  className="w-6 h-6 md:w-8 md:h-8"
                  width={32}
                  height={32}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}