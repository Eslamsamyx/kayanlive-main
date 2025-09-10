'use client';

import { useState, ReactNode } from 'react';
import Image from 'next/image';

// Common assets
const imgPattern = "/assets/ef25fd14e49122ddd6cbc03c8a92caff93500eb7.png";
const imgCheckmark = "/assets/d57e8b023cc2954fe2c89c41bd7f2153074ba9c1.svg";
const imgArrowCircle = "/assets/56835058c52a4359de96b664c4f5e9d586e4da1d.svg";

interface ChecklistItem {
  text: string;
  highlights?: Array<{
    text: string;
    className?: string;
  }>;
}

interface InfoSectionProps {
  badgeText: string;
  leftDescription: string;
  rightDescription: string;
  checklistItems: ChecklistItem[];
  ctaTitle: string;
  ctaButtonText: string;
  backgroundImage?: string;
  gradientFrom?: string;
  gradientVia?: string;
  gradientTo?: string;
  showTopSection?: boolean;
}

export default function InfoSectionTemplate({
  badgeText,
  leftDescription,
  rightDescription,
  checklistItems,
  ctaTitle,
  ctaButtonText,
  backgroundImage = "/assets/a4bd38b73259c4fd4f099d834871f17ed5486466.png",
  gradientFrom = "#b8a4ff",
  gradientVia = "#7afdd6", 
  gradientTo = "#7afdd6",
  showTopSection = true
}: InfoSectionProps) {
  const [isHovered, setIsHovered] = useState(false);

  const renderChecklistText = (item: ChecklistItem) => {
    if (!item.highlights) {
      return <span className="text-[#231f20]">{item.text}</span>;
    }

    const result: ReactNode[] = [];
    let lastIndex = 0;
    
    item.highlights.forEach((highlight, index) => {
      const startIndex = item.text.indexOf(highlight.text, lastIndex);
      if (startIndex > lastIndex) {
        result.push(
          <span key={`text-${index}`} className="text-[#231f20]">
            {item.text.substring(lastIndex, startIndex)}
          </span>
        );
      }
      
      result.push(
        <span key={`highlight-${index}`} className={highlight.className || "font-bold text-[#231f20]"}>
          {highlight.text}
        </span>
      );
      
      lastIndex = startIndex + highlight.text.length;
    });
    
    if (lastIndex < item.text.length) {
      result.push(
        <span key="final-text" className="text-[#231f20]">
          {item.text.substring(lastIndex)}
        </span>
      );
    }
    
    return result;
  };

  return (
    <div className="bg-white w-full py-24">
      <div className="max-w-[1600px] mx-auto px-20">
        {/* Top Section */}
        {showTopSection && (
          <div className="flex justify-between gap-7 items-end mb-24">
            {/* Left Column */}
            <div className="flex flex-col gap-[30px] flex-1 max-w-[543px]">
              {/* Badge */}
              <div 
                className="inline-flex items-center justify-center rounded-[900px] border border-[#7afdd6] bg-[rgba(122,253,214,0.26)]"
                style={{ width: '225px', height: '62px' }}
              >
                <span className="text-[#42967d] text-[20px] uppercase">{badgeText}</span>
              </div>
              
              {/* Description */}
              <p className="text-[#808184] text-[24px] leading-[32px] capitalize">
                {leftDescription}
              </p>
            </div>

            {/* Right Column - Checklist */}
            <div className="flex flex-col gap-6 flex-1 max-w-[697px]">
              <p className="text-[#808184] text-[24px] leading-[32px] capitalize">
                {rightDescription}
              </p>
              
              {/* Checklist Items */}
              <div className="flex flex-col gap-4">
                {checklistItems.map((item, index) => (
                  <div key={index} className="flex items-start gap-[9px]">
                    <Image src={imgCheckmark} alt="" className="w-[30px] h-[30px] mt-[2px]" width={30} height={30} />
                    <p className="text-[24px] leading-[32px] capitalize">
                      {renderChecklistText(item)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Bottom Section - CTA Banner */}
        <div 
          className="relative overflow-hidden rounded-[48px]"
          style={{ 
            height: '418px',
            background: `linear-gradient(to right, ${gradientFrom}, ${gradientVia}, ${gradientTo})`
          }}
        >
          {/* Background Image */}
          {backgroundImage && (
            <div 
              className="absolute inset-0 bg-center bg-cover mix-blend-multiply opacity-60"
              style={{ backgroundImage: `url('${backgroundImage}')` }}
            />
          )}
          
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

          {/* Small Diamonds Pattern - Right Side */}
          <div className="absolute right-20 top-1/2 -translate-y-1/2">
            {/* Row 1 */}
            <div className="flex gap-8 mb-8">
              <div className="w-6 h-6 bg-white/30 rotate-45" />
              <div className="w-10 h-10 bg-white/40 rotate-45" />
              <div className="w-6 h-6 bg-white/25 rotate-45" />
            </div>
            {/* Row 2 */}
            <div className="flex gap-8 mb-8 ml-4">
              <div className="w-8 h-8 bg-white/35 rotate-45" />
              <div className="w-12 h-12 bg-white/50 rotate-45" />
              <div className="w-8 h-8 bg-white/30 rotate-45" />
              <div className="w-6 h-6 bg-white/25 rotate-45" />
            </div>
            {/* Row 3 */}
            <div className="flex gap-8">
              <div className="w-10 h-10 bg-white/40 rotate-45" />
              <div className="w-6 h-6 bg-white/30 rotate-45" />
              <div className="w-8 h-8 bg-white/35 rotate-45" />
              <div className="w-10 h-10 bg-white/45 rotate-45" />
            </div>
          </div>

          {/* Content */}
          <div className="absolute left-[137px] top-20 w-[550px] flex flex-col gap-[42px] z-10">
            <h3 className="text-white text-[50px] leading-[51px] capitalize">
              {ctaTitle}
            </h3>
            
            {/* CTA Button with Arrow */}
            <div 
              className="flex items-center gap-0"
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
            >
              <button className="bg-white rounded-[900px] px-[25px] py-[18px] flex items-center gap-3">
                <span className="text-[#2c2c2b] text-[20px] capitalize">{ctaButtonText}</span>
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
  );
}