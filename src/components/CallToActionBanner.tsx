'use client';

import React, { useMemo } from 'react';
import CTAButton from './CTAButton';

// Assets from the Figma pattern
const imgPattern = "/optimized/cta-background/ef25fd14e49122ddd6cbc03c8a92caff93500eb7-cta-background-desktop.webp";

interface CallToActionBannerProps {
  title: string;
  subtitle: string;
  description?: string;
  buttonText: string;
  buttonHref?: string;
  topPadding?: string;
  bottomPadding?: string;
}

export default React.memo(function CallToActionBanner({
  title,
  subtitle,
  description,
  buttonText,
  buttonHref,
  topPadding = "pt-24",
  bottomPadding = "pb-24"
}: CallToActionBannerProps) {

  const gradientStyle = useMemo(() => ({
    background: 'linear-gradient(135deg, #a095e1 0%, #74cfaa 100%)'
  }), []);

  const fontStyle = useMemo(() => ({
    fontFamily: '"Poppins", sans-serif'
  }), []);

  return (
    <div className={`bg-white w-full ${topPadding} ${bottomPadding}`}>
      <div className="max-w-[1600px] mx-auto px-4 md:px-8 lg:px-20">
        
        {/* Title Section - Positioned above the banner */}
        <div className="text-center mb-6 md:mb-12 lg:mb-16">
          <h2
            className="font-bold text-[clamp(3rem,8vw,5.625rem)] leading-[1.1] capitalize tracking-[-2.7px] text-[#515151] motion-reduce:transform-none"
            style={fontStyle}
          >
            {title}
          </h2>
        </div>

        {/* CTA Banner - Desktop: Original structure, Mobile: Tall Figma design */}
        <div
          className="relative overflow-hidden rounded-[25px] md:rounded-[48px] min-h-[500px] md:min-h-[450px] flex items-center py-8 md:py-16"
          style={gradientStyle}
          role="banner"
          aria-labelledby="cta-title"
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
          <div className="relative z-10 w-full flex justify-center md:justify-start">
            <div className="w-full max-w-[90%] md:max-w-[567px] md:ml-[137px] flex flex-col gap-[20px] md:gap-[28px] items-center md:items-start px-4 md:px-0">
            <h3
              id="cta-title"
              className="text-white text-[clamp(1.875rem,4vw,3.125rem)] leading-[1.2] capitalize text-center md:text-left max-w-[290px] md:max-w-none md:w-auto motion-reduce:transform-none"
              style={fontStyle}
            >
              {subtitle}
            </h3>

            {/* Description Text */}
            {description && (
              <p className="text-white text-[clamp(1rem,2vw,1.25rem)] leading-[1.4] text-center md:text-left max-w-[320px] md:max-w-[520px] opacity-95" style={fontStyle}>
                {description}
              </p>
            )}

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
    </div>
  );
});