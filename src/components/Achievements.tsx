'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';

const imgMaskGroup = "/optimized/achievements/638442c54db92ce49b3ad8194a062a52ba973004.webp";
const imgEllipse1 = "/assets/575a92ae113574b10651d37ad7654adf9fb7bd85.svg";
const imgEllipse2 = "/assets/dcc83c6de9d9f4b919b448af6ce767c528855540.svg";

export default function Achievements() {
  const t = useTranslations();
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  return (
    <div 
      className="bg-[#2c2c2b] relative w-full overflow-hidden py-12 md:py-24"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onMouseMove={handleMouseMove}
    >
      {/* Full Background Pattern - Always present but masked */}
      <div 
        className="absolute inset-0 bg-repeat opacity-100"
        style={{
          backgroundImage: `url('${imgMaskGroup}')`,
          backgroundSize: '400px 400px'
        }}
      />
      
      {/* Mask overlay that hides the pattern except around cursor */}
      <div 
        className={`absolute inset-0 bg-[#2c2c2b] transition-opacity duration-300 ${
          isHovered ? 'opacity-100' : 'opacity-100'
        }`}
        style={{
          maskImage: isHovered 
            ? `radial-gradient(circle 300px at ${mousePosition.x}px ${mousePosition.y}px, transparent 0%, transparent 30%, rgba(0,0,0,0.3) 60%, black 80%)` 
            : 'none',
          WebkitMaskImage: isHovered 
            ? `radial-gradient(circle 300px at ${mousePosition.x}px ${mousePosition.y}px, transparent 0%, transparent 30%, rgba(0,0,0,0.3) 60%, black 80%)` 
            : 'none',
        }}
      />

      {/* Desktop Background Decorative Elements - Hidden on mobile */}
      {/* Large teal ellipse blur - right side */}
      <div 
        className="absolute hidden lg:block"
        style={{
          width: '668px',
          height: '689px',
          right: '-100px',
          top: '179px'
        }}
      >
        <Image src={imgEllipse2} alt="" fill className="opacity-60" />
      </div>
      
      {/* Smaller purple ellipse - right side */}
      <div 
        className="absolute hidden lg:block"
        style={{
          width: '346px',
          height: '357px',
          right: '100px',
          top: '345px'
        }}
      >
        <Image src={imgEllipse1} alt="" fill className="opacity-50" />
      </div>
      
      {/* Pattern overlay - right side - Now hidden since we have full background */}
      <div 
        className="absolute bg-center bg-cover bg-no-repeat opacity-70 hidden"
        style={{
          backgroundImage: `url('${imgMaskGroup}')`,
          width: '542px',
          height: '542px',
          right: '50px',
          top: '252px'
        }}
      />

      {/* Diamond decoration - left side */}
      <div 
        className="absolute hidden lg:block"
        style={{
          width: '40px',
          height: '40px',
          left: '150px',
          top: '50%',
          transform: 'translateY(-50%) rotate(45deg)',
          background: 'rgba(122, 253, 214, 0.3)'
        }}
      />

      {/* Desktop Content */}
      <div className="hidden lg:block max-w-[1600px] mx-auto px-4 md:px-8 lg:px-20 relative z-10">
        {/* Title */}
        <h2 
          className="text-center capitalize font-normal mb-6 md:mb-12 lg:mb-16"
          style={{
            fontSize: '200px',
            lineHeight: '200px',
            letterSpacing: '-2px',
            background: 'linear-gradient(90deg, #b8a4ff 0%, #7afdd6 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            fontFamily: '"Poppins", sans-serif'
          }}
        >
          {t('achievements.title')}
        </h2>

        {/* Stats Table with Glassmorphism */}
        <div 
          className="relative mx-auto rounded-[53px] overflow-hidden"
          style={{
            maxWidth: '1115px',
            background: 'rgba(255, 255, 255, 0.01)',
            backdropFilter: 'blur(50.5px)',
            WebkitBackdropFilter: 'blur(50.5px)',
            border: '2px solid #7afdd6'
          }}
        >
          {/* Header Row with stronger teal background */}
          <div 
            className="grid grid-cols-3 relative"
            style={{
              background: 'rgba(122, 253, 214, 0.22)',
              height: '150px'
            }}
          >
            <div className="flex items-center justify-center px-8">
              <h3 className="text-[#7afdd6] text-[40px] leading-[45px]" style={{ fontFamily: '"Poppins", sans-serif' }}>{t('achievements.turnaroundTime')}</h3>
            </div>
            <div 
              className="flex items-center justify-center px-8 relative"
              style={{ background: 'rgba(122, 253, 214, 0.11)' }}
            >
              <h3 className="text-[#7afdd6] text-[40px] leading-[45px] text-center" style={{ fontFamily: '"Poppins", sans-serif' }}>{t('achievements.pressCoverage')}</h3>
            </div>
            <div className="flex items-center justify-center px-8">
              <h3 className="text-[#7afdd6] text-[40px] leading-[45px]" style={{ fontFamily: '"Poppins", sans-serif' }}>{t('achievements.missedDeadlines')}</h3>
            </div>
          </div>

          {/* Divider Line */}
          <div className="w-full h-[1px] bg-[#7afdd6] opacity-30" />

          {/* Data Row 1 */}
          <div className="grid grid-cols-3" style={{ height: '112px' }}>
            <div className="flex items-center px-[60px]">
              <p className="text-white text-[25px] leading-[50px]" style={{ fontFamily: '"Poppins", sans-serif' }}>{t('achievements.clientsServed')}</p>
            </div>
            <div
              className="flex items-center px-[60px]"
              style={{ background: 'rgba(122, 253, 214, 0.05)' }}
            >
              <p className="text-white text-[22px] leading-[28px]" style={{ fontFamily: '"Poppins", sans-serif' }}>{t('achievements.projectsCompleted')}</p>
            </div>
            <div className="flex items-center px-[60px]">
              <p className="text-white text-[25px] leading-[50px]">{t('achievements.yearsExpertise')}</p>
            </div>
          </div>

        </div>
      </div>

      {/* Mobile Version - Matches Figma Design Exactly */}
      <section className="lg:hidden flex flex-col gap-[31px] items-center justify-center px-[27px] py-0 relative w-full">
        {/* Mobile Title */}
        <div 
          className="text-center capitalize font-normal text-[50px] leading-[137px] tracking-[-0.5px] w-full"
          style={{
            background: 'linear-gradient(90deg, #b8a4ff 0%, #7afdd6 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            fontFamily: '"Poppins", sans-serif'
          }}
        >
          {t('achievements.title')}
        </div>

        {/* Mobile Stats Table */}
        <div className="bg-[rgba(255,255,255,0.01)] relative rounded-[24px] w-full">
          <div className="flex flex-col items-center justify-start overflow-clip relative w-full">
            {/* Header Row */}
            <div className="bg-[rgba(122,253,214,0.21)] box-border flex flex-col gap-2.5 items-start justify-start overflow-clip px-[11px] py-3.5 relative w-full rounded-t-[24px]">
              <div className="flex font-normal items-center justify-between leading-[1.12] not-italic relative text-[#7afdd6] text-[14px] w-full" style={{ fontFamily: '"Poppins", sans-serif' }}>
                <div className="relative flex-1 text-center">
                  {t('achievements.turnaroundTime')}
                </div>
                <div className="relative flex-1 text-center">
                  {t('achievements.pressCoverage')}
                </div>
                <div className="relative flex-1 text-center">
                  {t('achievements.missedDeadlines')}
                </div>
              </div>
            </div>

            {/* Data Row 1 */}
            <div className="bg-[rgba(122,253,214,0.03)] relative w-full border-t border-b border-[#888888]">
              <div className="box-border flex flex-col gap-2.5 items-start justify-start overflow-clip px-[11px] py-3.5 relative">
                <div className="flex font-normal items-center justify-between leading-[1.12] not-italic relative text-[14px] text-white w-full" style={{ fontFamily: '"Poppins", sans-serif' }}>
                  <div className="relative flex-1 text-center">
                    {t('achievements.clientsServed')}
                  </div>
                  <div className="relative flex-1 text-center text-[13px] leading-[15px]">
                    {t('achievements.projectsCompleted')}
                  </div>
                  <div className="relative flex-1 text-center">
                    {t('achievements.yearsExpertise')}
                  </div>
                </div>
              </div>
            </div>

          </div>
          
          {/* Border overlay */}
          <div aria-hidden="true" className="absolute border border-[#7afdd6] border-solid inset-0 pointer-events-none rounded-[24px]" />
        </div>
      </section>
    </div>
  );
}