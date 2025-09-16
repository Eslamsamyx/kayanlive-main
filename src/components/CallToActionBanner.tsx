'use client';

import { useState } from 'react';
import Image from 'next/image';
import CTAButton from './CTAButton';

// Assets from the Figma pattern
const imgPattern = "/assets/ef25fd14e49122ddd6cbc03c8a92caff93500eb7.png";
const imgFrame1618874015 = "/assets/154289bd0be3bf0eddab560357bd09aa27f634bc.svg";

interface CallToActionBannerProps {
  title: string;
  subtitle: string;
  buttonText: string;
  buttonHref?: string;
  topPadding?: string;
  bottomPadding?: string;
}

export default function CallToActionBanner({
  title,
  subtitle,
  buttonText,
  buttonHref,
  topPadding = "pt-24",
  bottomPadding = "pb-24"
}: CallToActionBannerProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div className={`bg-white w-full ${topPadding} ${bottomPadding}`}>
      <div className="max-w-[1600px] mx-auto px-4 md:px-8 lg:px-20">
        
        {/* Title Section - Positioned above the banner */}
        <div className="text-center mb-6 md:mb-12 lg:mb-16">
          <h1 
            className="font-bold text-[90px] leading-[85px] capitalize tracking-[-2.7px] text-[#515151]"
            style={{
              fontFamily: '"Poppins", sans-serif'
            }}
          >
            {title}
          </h1>
        </div>

        {/* CTA Banner - Desktop: Original structure, Mobile: Tall Figma design */}
        <div
          className="relative overflow-hidden rounded-[25px] md:rounded-[48px] h-[500px] md:h-[450px]"
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
                opacity: '0.3'
              }}
            />
          </div>

          {/* Desktop & Tablet Decorative Elements - Medium screens and up */}
          {/* Pattern Overlay - Desktop: normal opacity, Tablet: very low opacity */}
          <div 
            className="absolute hidden md:block"
            style={{
              width: '749px',
              height: '757px',
              right: '-105px',
              bottom: '-223px'
            }}
          >
            <div 
              className="w-full h-full bg-center bg-cover md:opacity-5 lg:opacity-20"
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
                  opacity: '0.3'
                }} 
              />
            </div>
          </div>

          {/* Content - Mobile: Centered, Desktop: Left-aligned */}
          <div className="absolute left-1/2 -translate-x-1/2 md:left-[137px] md:translate-x-0 top-20 md:top-20 w-full max-w-[90%] md:max-w-[567px] md:w-[567px] flex flex-col gap-[30px] md:gap-[42px] items-center md:items-start justify-start z-10 px-4 md:px-0">
            <h3 className="text-white text-[30px] md:text-[50px] leading-[36px] md:leading-[60px] capitalize text-center md:text-left max-w-[290px] md:max-w-none md:w-auto" style={{ fontFamily: '"Poppins", sans-serif' }}>
              {subtitle}
            </h3>
            
            {/* CTA Button */}
            <CTAButton
              variant="white"
              href={buttonHref}
              ariaLabel={buttonText}
            >
              {buttonText}
            </CTAButton>
          </div>
        </div>
      </div>
    </div>
  );
}