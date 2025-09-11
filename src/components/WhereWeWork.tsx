'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';

const imgPattern = "/assets/ef25fd14e49122ddd6cbc03c8a92caff93500eb7.png";
const imgCheckmark = "/assets/d57e8b023cc2954fe2c89c41bd7f2153074ba9c1.svg";
const imgArrowCircle = "/assets/56835058c52a4359de96b664c4f5e9d586e4da1d.svg";

export default function WhereWeWork() {
  const t = useTranslations();
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div className="bg-white w-full py-12 md:py-24">
      <div className="max-w-[1600px] mx-auto px-4 md:px-8 lg:px-20">
        {/* Desktop Version - Top Section - Where We Work */}
        <div className="hidden md:flex justify-between gap-7 items-end mb-6 md:mb-12 lg:mb-16">
          {/* Left Column */}
          <div className="flex flex-col gap-[30px] flex-1 max-w-[543px]">
            {/* Badge */}
            <div 
              className="inline-flex items-center justify-center rounded-[900px] border border-[#7afdd6] bg-[rgba(122,253,214,0.26)]"
              style={{ width: '225px', height: '62px' }}
            >
              <span className="text-[#42967d] text-[20px] uppercase">{t('whereWeWork.badge')}</span>
            </div>
            
            {/* Description */}
            <p className="text-[#808184] text-[24px] leading-[32px] capitalize">
              {t('whereWeWork.description')}
            </p>
          </div>

          {/* Right Column - Locations */}
          <div className="flex flex-col gap-6 flex-1 max-w-[697px]">
            <p className="text-[#808184] text-[24px] leading-[32px] capitalize">
              {t('whereWeWork.operateText')}
            </p>
            
            {/* Location Items */}
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-[9px]">
                <Image src={imgCheckmark} alt="" className="w-[30px] h-[30px]" width={30} height={30} />
                <p className="text-[24px] leading-[32px] capitalize">
                  {t('whereWeWork.saudi')}
                </p>
              </div>
              
              <div className="flex items-center gap-[9px]">
                <Image src={imgCheckmark} alt="" className="w-[30px] h-[30px]" width={30} height={30} />
                <p className="text-[24px] leading-[32px] capitalize">
                  {t('whereWeWork.uae')}
                </p>
              </div>
              
              <div className="flex items-start gap-[9px]">
                <Image src={imgCheckmark} alt="" className="w-[30px] h-[30px] mt-[2px]" width={30} height={30} />
                <p className="text-[24px] leading-[32px] capitalize">
                  {t('whereWeWork.partners')}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Version - True Single Column Layout matching reference exactly */}
        <section className="md:hidden flex flex-col gap-[31px] items-start px-[27px] mb-6 md:mb-12 lg:mb-16">
          {/* Badge - Mobile version */}
          <div className="bg-[rgba(122,253,214,0.26)] h-[50px] rounded-[900px] relative w-auto">
            <div className="box-border flex gap-2.5 h-[50px] items-center justify-center overflow-clip px-[27px] py-6 relative">
              <div className="text-[#42967d] text-[14px] text-center text-nowrap uppercase leading-[28px]">
                {t('whereWeWork.badge')}
              </div>
            </div>
            <div aria-hidden="true" className="absolute border border-[#7afdd6] border-solid inset-0 pointer-events-none rounded-[900px]" />
          </div>
          
          {/* Description - Mobile version */}
          <div className="text-[#808184] text-[16px] leading-[20px] w-full capitalize">
            {t('whereWeWork.description')}
          </div>

          {/* GCC Section Header - As next item in single column */}
          <div className="text-[#808184] text-[20px] leading-[20px] capitalize w-full">
            {t('whereWeWork.operateText')}
          </div>
          
          {/* Location Item 1 - As next item in single column */}
          <div className="flex gap-[9px] items-center justify-start w-full">
            <div className="relative shrink-0 size-[25px]">
              <Image src={imgCheckmark} alt="" className="block max-w-none size-full" width={25} height={25} />
            </div>
            <div className="text-[#231f20] text-[18px] leading-[20px] capitalize flex-1">
              {t('whereWeWork.saudi')}
            </div>
          </div>
          
          {/* Location Item 2 - As next item in single column */}
          <div className="flex gap-[9px] items-center justify-start w-full">
            <div className="relative shrink-0 size-[25px]">
              <Image src={imgCheckmark} alt="" className="block max-w-none size-full" width={25} height={25} />
            </div>
            <div className="text-[#231f20] text-[18px] leading-[20px] capitalize flex-1">
              {t('whereWeWork.uae')}
            </div>
          </div>
          
          {/* Location Item 3 - As next item in single column */}
          <div className="flex gap-[9px] items-start justify-start w-full">
            <div className="relative shrink-0 size-[25px]">
              <Image src={imgCheckmark} alt="" className="block max-w-none size-full" width={25} height={25} />
            </div>
            <div className="text-[#231f20] text-[18px] leading-[20px] capitalize flex-1">
              {t('whereWeWork.partners')}
            </div>
          </div>
        </section>

        {/* Bottom Section - CTA Banner - Responsive */}
        <div 
          className="relative overflow-hidden rounded-[25px] md:rounded-[48px]"
          style={{ 
            height: '418px',
            background: 'linear-gradient(135deg, #a095e1 0%, #74cfaa 100%)'
          }}
        >
          {/* Pattern Overlay - Bottom Right - Hidden on mobile for cleaner look */}
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
              className="w-full h-full bg-center bg-cover opacity-20"
              style={{ 
                backgroundImage: `url('${imgPattern}')`,
                transform: 'rotate(90deg)'
              }}
            />
          </div>
          
          {/* Diamond Shape - Left - Hidden on mobile */}
          <div 
            className="absolute hidden md:block"
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

          {/* Mobile Pattern - Top pattern transparent, bottom pattern 100% white */}
          <div className="md:hidden absolute flex h-[373.706px] items-center justify-center translate-x-[-50%] translate-y-[-50%] w-[373.706px]" style={{ top: "calc(50% - 221.641px)", left: "calc(50% + 0.359px)" }}>
            <div className="flex-none rotate-[315deg]">
              <div className="bg-[rgba(255,255,255,0.2)] size-[264.258px]" />
            </div>
          </div>

          <div className="md:hidden absolute bottom-[-125.5px] flex h-[319px] items-center justify-center translate-x-[-50%] w-[315px]" style={{ left: "calc(50% + 3px)" }}>
            <div className="flex-none rotate-[90deg]">
              <div 
                className="bg-center bg-cover bg-no-repeat h-[315px] w-[319px]" 
                style={{ 
                  backgroundImage: `url('${imgPattern}')`,
                  filter: 'brightness(0) invert(1)',
                  opacity: '1'
                }} 
              />
            </div>
          </div>

          {/* Desktop Pattern - Right Side - From Figma */}
          <div className="absolute hidden md:flex bottom-[-223px] h-[757px] items-center justify-center right-[-105px] w-[749px] z-20">
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

          {/* Content - Responsive */}
          <div className="absolute left-4 top-12 md:left-[137px] md:top-20 w-[calc(100%-2rem)] md:w-[550px] flex flex-col gap-[30px] md:gap-[42px] z-10">
            <h3 
              className="text-white capitalize text-center md:text-left"
              style={{
                fontSize: 'clamp(1.875rem, 6vw, 3.125rem)',
                lineHeight: 'clamp(1.2, 4vw, 1.3)',
                maxWidth: '290px',
                margin: '0 auto'
              }}
            >
              {t('whereWeWork.question')}
            </h3>
            
            {/* CTA Button with Arrow - Responsive */}
            <div className="flex justify-center md:justify-start">
              <div 
                className="flex items-center gap-0"
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
              >
                <button className="bg-white rounded-[900px] px-[18px] md:px-[25px] py-[14px] md:py-[18px] flex items-center gap-3">
                  <span 
                    className="text-[#2c2c2b] capitalize whitespace-nowrap"
                    style={{ fontSize: 'clamp(0.875rem, 3vw, 1.25rem)' }}
                  >
                    {t('whereWeWork.cta')}
                  </span>
                </button>
                <div 
                  className="bg-white rounded-full flex items-center justify-center transition-all duration-300"
                  style={{
                    width: 'clamp(45px, 12vw, 65px)',
                    height: 'clamp(45px, 12vw, 65px)',
                    transform: isHovered ? 'translateX(10px)' : 'translateX(0)'
                  }}
                >
                  <Image 
                    src={imgArrowCircle} 
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
    </div>
  );
}