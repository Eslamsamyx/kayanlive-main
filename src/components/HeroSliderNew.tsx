'use client';

import { useMemo } from 'react';
import Image from 'next/image';
import { useTranslations, useLocale } from 'next-intl';
import { useHeroSlider, useAdaptiveTextHeight } from '@/hooks/useHeroSlider';

// Assets
const imgScreenshot1 = "/assets/01f5d49d03c8455dc99b2ad32446b6657b1949e0.png";
const imgScreenshot3 = "/assets/b0d9ec6faacc00d7ed8b82f3f45ecaa371425181.png";
const imgFrame1 = "/assets/bac2af3eca424e14c720bab9f5fabec434faaa31.svg";
const imgKayanLogo = "/assets/823c27de600ccd2f92af3e073c8e10df3a192e5c.png";
const imgKMobile = "/assets/873e726ea40f8085d26088ffc29bf8dfb68b10ee.png";
const imgVectorMobile = "/assets/280033d008f397b92a0642ef0eb81b067b3be2fd.svg";
const imgPattern0331 = "/assets/2e5da0ba94a7081a8e8355ba87266411fee96738.png";
const imgArrow1 = "/assets/d40495f3a82dbc1b73402bf2e9b45f90c56a4c70.svg";

// Mobile lighting effect vectors
const mobileVectors = {
  imgVector449: "/assets/b53ce5773ee34aec32d25ec4f653964e5daa91e6.svg",
  imgVector450: "/assets/e5d598dd977002555d271ede5cc7873782a80e66.svg",
  imgVector451: "/assets/f6ac75d6fe0a6a5d5012ab737d5a5fb0c39f4591.svg",
  imgVector452: "/assets/6968639e0eef5880ce6f2caed2594c9c3c396938.svg",
  imgVector453: "/assets/b6337776440823365c9d6d0693bb95cf16288fe4.svg",
  imgVector454: "/assets/3929c4e9fb7deebafe5202b5e1f3e0d3f29067c6.svg",
  imgVector455: "/assets/4b056204cf3f68ba704204632b097b1e0f14e21a.svg",
  imgVector456: "/assets/9ca75393b1fe472137c4e5a9e4b0739115dc6245.svg",
  imgVector457: "/assets/6338961563b8749b796fc02fc4ce2146f1b695c8.svg",
  imgVector458: "/assets/2f1c0518048d573eddb0525c46e5cf3478830322.svg",
  imgVector459: "/assets/0b8b87749ddbac7e694af683b0ade373c2c2ec6a.svg",
};

// Slide indicator component
function SlideIndicator({ 
  index, 
  isActive, 
  onClick, 
  isMobile = false 
}: { 
  index: number;
  isActive: boolean; 
  onClick: () => void;
  isMobile?: boolean;
}) {
  const size = isMobile ? { outer: '20.661px', inner: '14.613px', dot: '8.629px' } : { outer: '35.355px', inner: '25px', dot: '15.79px' };
  const rotation = isMobile ? 'rotate(224.999deg)' : 'rotate(315deg)';

  return (
    <button 
      onClick={onClick}
      className="relative flex items-center justify-center"
      style={{ width: size.outer, height: size.outer }}
      aria-label={`Go to slide ${index + 1}`}
    >
      <div className="flex-none" style={{ transform: rotation }}>
        <div 
          className="relative backdrop-blur-[7.5px] backdrop-filter"
          style={{ 
            width: size.inner, 
            height: size.inner,
            backgroundColor: isActive ? 'transparent' : 'rgba(255,255,255,0.01)',
            border: `${isMobile ? '1.3px' : '2px'} solid #ffffff`
          }}
        >
          {isActive && (
            <div 
              className="absolute bg-white translate-x-[-50%] translate-y-[-50%]"
              style={{ 
                width: size.dot,
                height: size.dot,
                top: `calc(50% ${isMobile ? '- 0.244px' : '+ 0.23px'})`,
                left: `calc(50% ${isMobile ? '+ 0.076px' : '+ 0.117px'})`
              }}
            />
          )}
        </div>
      </div>
    </button>
  );
}

// Mobile lighting effects component
function MobileLightingEffects() {
  return (
    <div className="absolute inset-0 overflow-hidden lg:hidden">
      {/* Left side lighting group */}
      <div className="absolute" style={{ left: '-18px', top: '-318px' }}>
        <div className="absolute" style={{ left: '-18px', top: '-219px' }}>
          <div className="absolute" style={{ width: '428.964px', height: '725.449px', left: '-18px', top: '-219px' }}>
            <div className="absolute" style={{ inset: '-34.46% -58.28%' }}>
              <Image alt="" className="block max-w-none size-full" src={mobileVectors.imgVector449} fill style={{ objectFit: 'contain' }} />
            </div>
          </div>
          <div className="absolute" style={{ width: '318.246px', height: '538.206px', left: '49.75px', top: '-147.49px' }}>
            <div className="absolute" style={{ inset: '-18.58% -31.42%' }}>
              <Image alt="" className="block max-w-none size-full" src={mobileVectors.imgVector450} fill style={{ objectFit: 'contain' }} />
            </div>
          </div>
          <div className="absolute" style={{ width: '246.521px', height: '416.827px', left: '104.32px', top: '-138.08px' }}>
            <div className="absolute" style={{ inset: '-29.03% -49.08%' }}>
              <Image alt="" className="block max-w-none size-full" src={mobileVectors.imgVector451} fill style={{ objectFit: 'contain' }} />
            </div>
          </div>
          <div className="absolute" style={{ width: '163.574px', height: '276.63px', left: '187.12px', top: '-138.08px' }}>
            <div className="absolute" style={{ inset: '-43.74% -73.97%' }}>
              <Image alt="" className="block max-w-none size-full" src={mobileVectors.imgVector452} fill style={{ objectFit: 'contain' }} />
            </div>
          </div>
        </div>
      </div>

      {/* Right side lighting group */}
      <div className="absolute" style={{ left: '669.07px', top: '-242.55px' }}>
        <div className="absolute flex items-center justify-center" style={{ width: '514.229px', height: '772.555px', left: '669.29px', top: '-242.55px' }}>
          <div className="flex-none" style={{ transform: 'rotate(172.965deg) scaleY(-100%) skewX(0.032deg)' }}>
            <div className="relative" style={{ width: '429.021px', height: '725.424px' }}>
              <div className="absolute" style={{ inset: '-34.46% -58.27%' }}>
                <Image alt="" className="block max-w-none size-full" src={mobileVectors.imgVector453} fill style={{ objectFit: 'contain' }} />
              </div>
            </div>
          </div>
        </div>
        <div className="absolute flex items-center justify-center" style={{ width: '381.606px', height: '573.028px', left: '721.92px', top: '-163.3px' }}>
          <div className="flex-none" style={{ transform: 'rotate(172.985deg) scaleY(-100%)' }}>
            <div className="relative" style={{ width: '318.192px', height: '538.21px' }}>
              <div className="absolute" style={{ inset: '-18.58% -31.43%' }}>
                <Image alt="" className="block max-w-none size-full" src={mobileVectors.imgVector454} fill style={{ objectFit: 'contain' }} />
              </div>
            </div>
          </div>
        </div>
        <div className="absolute flex items-center justify-center" style={{ width: '295.602px', height: '443.813px', left: '739.88px', top: '-147.29px' }}>
          <div className="flex-none" style={{ transform: 'rotate(172.981deg) scaleY(-100%)' }}>
            <div className="relative" style={{ width: '246.521px', height: '416.827px' }}>
              <div className="absolute" style={{ inset: '-29.03% -49.08%' }}>
                <Image alt="" className="block max-w-none size-full" src={mobileVectors.imgVector451} fill style={{ objectFit: 'contain' }} />
              </div>
            </div>
          </div>
        </div>
        <div className="absolute flex items-center justify-center" style={{ width: '196.162px', height: '294.561px', left: '739.88px', top: '-137.18px' }}>
          <div className="flex-none" style={{ transform: 'rotate(172.976deg) scaleY(-100%)' }}>
            <div className="relative" style={{ width: '163.611px', height: '276.627px' }}>
              <div className="absolute" style={{ inset: '-43.74% -73.96%' }}>
                <Image alt="" className="block max-w-none size-full" src={mobileVectors.imgVector455} fill style={{ objectFit: 'contain' }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Center lighting group */}
      <div className="absolute" style={{ left: '246.38px', top: '-318px' }}>
        <div className="absolute flex items-center justify-center" style={{ width: '698.033px', height: '903.358px', left: '247px', top: '-318px' }}>
          <div className="flex-none" style={{ transform: 'rotate(198.612deg) scaleY(-100%) skewX(359.921deg)' }}>
            <div className="relative" style={{ width: '470.093px', height: '794.539px' }}>
              <div className="absolute" style={{ inset: '-31.46% -53.18%' }}>
                <Image alt="" className="block max-w-none size-full" src={mobileVectors.imgVector456} fill style={{ objectFit: 'contain' }} />
              </div>
            </div>
          </div>
        </div>
        <div className="absolute flex items-center justify-center" style={{ width: '518.208px', height: '669.852px', left: '333.31px', top: '-228.31px' }}>
          <div className="flex-none" style={{ transform: 'rotate(198.567deg) scaleY(-100%)' }}>
            <div className="relative" style={{ width: '348.5px', height: '589.619px' }}>
              <div className="absolute" style={{ inset: '-16.96% -28.69%' }}>
                <Image alt="" className="block max-w-none size-full" src={mobileVectors.imgVector457} fill style={{ objectFit: 'contain' }} />
              </div>
            </div>
          </div>
        </div>
        <div className="absolute flex items-center justify-center" style={{ width: '401.42px', height: '518.856px', left: '389.96px', top: '-212.63px' }}>
          <div className="flex-none" style={{ transform: 'rotate(198.572deg) scaleY(-100%)' }}>
            <div className="relative" style={{ width: '270.062px', height: '456.631px' }}>
              <div className="absolute" style={{ inset: '-26.5% -44.8%' }}>
                <Image alt="" className="block max-w-none size-full" src={mobileVectors.imgVector458} fill style={{ objectFit: 'contain' }} />
              </div>
            </div>
          </div>
        </div>
        <div className="absolute flex items-center justify-center" style={{ width: '266.417px', height: '344.385px', left: '438.88px', top: '-212.63px' }}>
          <div className="flex-none" style={{ transform: 'rotate(198.58deg) scaleY(-100%)' }}>
            <div className="relative" style={{ width: '179.286px', height: '303.033px' }}>
              <div className="absolute" style={{ inset: '-39.93% -67.49%' }}>
                <Image alt="" className="block max-w-none size-full" src={mobileVectors.imgVector459} fill style={{ objectFit: 'contain' }} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Desktop floating diamonds pattern
function DesktopFloatingDiamonds({ locale }: { locale: string }) {
  const diamonds = useMemo(() => [
    // Row 1 - Top
    { top: '0px', right: '100px', size: 'w-12 h-12', opacity: 'bg-[#7afdd6]/20' },
    { top: '5px', right: '180px', size: 'w-10 h-10', opacity: 'bg-[#7afdd6]/25' },
    { top: '10px', right: '250px', size: 'w-8 h-8', opacity: 'bg-[#7afdd6]/15' },
    // Row 2
    { top: '60px', right: '60px', size: 'w-10 h-10', opacity: 'bg-[#7afdd6]/30' },
    { top: '50px', right: '140px', size: 'w-14 h-14', opacity: 'bg-[#7afdd6]/35' },
    { top: '65px', right: '220px', size: 'w-8 h-8', opacity: 'bg-[#7afdd6]/25' },
    { top: '70px', right: '290px', size: 'w-6 h-6', opacity: 'bg-[#7afdd6]/20' },
    // Row 3 - Middle prominent
    { top: '120px', right: '20px', size: 'w-8 h-8', opacity: 'bg-[#7afdd6]/25' },
    { top: '110px', right: '90px', size: 'w-16 h-16', opacity: 'bg-[#7afdd6]/40' },
    { top: '115px', right: '180px', size: 'w-12 h-12', opacity: 'bg-[#7afdd6]/30' },
    { top: '120px', right: '260px', size: 'w-10 h-10', opacity: 'bg-[#7afdd6]/25' },
    { top: '130px', right: '330px', size: 'w-6 h-6', opacity: 'bg-[#7afdd6]/15' },
    // Row 4
    { top: '180px', right: '50px', size: 'w-10 h-10', opacity: 'bg-[#7afdd6]/35' },
    { top: '175px', right: '130px', size: 'w-14 h-14', opacity: 'bg-[#7afdd6]/30' },
    { top: '185px', right: '220px', size: 'w-8 h-8', opacity: 'bg-[#7afdd6]/25' },
    { top: '180px', right: '300px', size: 'w-10 h-10', opacity: 'bg-[#7afdd6]/20' },
    // Row 5 - Bottom
    { top: '240px', right: '10px', size: 'w-12 h-12', opacity: 'bg-[#7afdd6]/25' },
    { top: '245px', right: '80px', size: 'w-8 h-8', opacity: 'bg-[#7afdd6]/30' },
    { top: '235px', right: '160px', size: 'w-14 h-14', opacity: 'bg-[#7afdd6]/35' },
    { top: '250px', right: '250px', size: 'w-6 h-6', opacity: 'bg-[#7afdd6]/20' },
    { top: '245px', right: '320px', size: 'w-8 h-8', opacity: 'bg-[#7afdd6]/15' },
    // Row 6 - Very bottom
    { top: '300px', right: '40px', size: 'w-10 h-10', opacity: 'bg-[#7afdd6]/20' },
    { top: '295px', right: '120px', size: 'w-12 h-12', opacity: 'bg-[#7afdd6]/25' },
    { top: '305px', right: '200px', size: 'w-8 h-8', opacity: 'bg-[#7afdd6]/30' },
    { top: '300px', right: '280px', size: 'w-10 h-10', opacity: 'bg-[#7afdd6]/15' },
  ], []);

  return (
    <>
      {/* RTL Diamond Pattern Styles */}
      <style dangerouslySetInnerHTML={{
        __html: `
          .diamond-pattern-rtl {
            right: 8% !important;
          }
          [dir="rtl"] .diamond-pattern-rtl {
            right: auto !important;
            left: 8% !important;
            transform: scaleX(-1) !important;
          }
        `
      }} />
      
      <div 
        className="absolute diamond-pattern-rtl hidden lg:block"
        style={{
          bottom: '10%',
          width: '450px',
          height: '350px'
        }}
      >
        {diamonds.map((diamond, index) => (
          <div 
            key={index}
            className={`absolute rotate-45 diamond-item ${diamond.size} ${diamond.opacity}`}
            style={{ 
              top: diamond.top, 
              [locale === 'ar' ? 'left' : 'right']: diamond.right 
            }}
          />
        ))}
      </div>
    </>
  );
}

export default function HeroSliderNew() {
  const t = useTranslations();
  const locale = useLocale();
  const { currentSlide, goToSlide, pauseSlider, resumeSlider } = useHeroSlider(3);
  const { textMetrics, measureRef } = useAdaptiveTextHeight();
  
  const isRTL = locale === 'ar';

  return (
    <>
      {/* Hidden measuring container */}
      <div ref={measureRef} className="sr-only" />
      
      {/* Unified Responsive Hero Container */}
      <div 
        className="relative bg-[#2c2c2b] overflow-visible mx-4 mb-8 rounded-[25px] lg:rounded-[61px]"
        style={{ 
          height: `clamp(${textMetrics.mobileHeight}px, 85vh, ${textMetrics.mobileHeight + 200}px)`,
          '@media (min-width: 1024px)': {
            height: `${textMetrics.desktopHeight}px`
          }
        }}
        onTouchStart={pauseSlider}
        onTouchEnd={resumeSlider}
        onMouseEnter={pauseSlider}
        onMouseLeave={resumeSlider}
      >
        {/* Slide 1 - Main Hero */}
        <div className={`absolute inset-0 transition-opacity duration-1000 ${
          currentSlide === 0 ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}>
          {/* Responsive Background Image */}
          <div 
            className="absolute bg-center bg-cover bg-no-repeat lg:bg-center"
            style={{ 
              // Mobile
              inset: '0',
              backgroundImage: `url('${imgScreenshot1}')`,
              // Desktop
              width: `${Math.round(textMetrics.desktopHeight * 1.737)}px`,
              height: `${textMetrics.desktopHeight}px`,
              top: '0px',
              left: 'calc(50% - 0.5px)',
              transform: 'translateX(-50%)'
            }}
          />
          
          {/* Responsive Centered Decorative Logo */}
          <div 
            className="absolute backdrop-blur-[11.5px] backdrop-filter bg-center bg-cover bg-no-repeat opacity-[0.43] translate-x-[-50%] translate-y-[-50%]"
            style={{ 
              left: "calc(50% + 0.5px)",
              top: '50%',
              width: 'clamp(156px, 20vw, 280px)',
              height: 'clamp(248px, 32vw, 446px)',
              backgroundImage: `url('${imgKMobile}')` 
            }}
          />
          
          {/* Mobile Vector Decoration - Only visible on mobile */}
          <div className="absolute lg:hidden" style={{ left: '0px', bottom: '150px', width: '321px', height: '138px' }}>
            <div className="absolute" style={{ inset: '-36.23% -15.58%' }}>
              <Image alt="" className="block max-w-none size-full" src={imgVectorMobile} fill style={{ objectFit: 'contain' }} />
            </div>
          </div>

          {/* Desktop Decorative Frame - Only visible on desktop */}
          <div 
            className="absolute hidden lg:block"
            style={{ 
              width: '1445.84px',
              height: '290.092px',
              top: `${Math.max(727, 727 + (textMetrics.desktopHeight - 955) * 0.6)}px`,
              left: 'calc(50% - 0.08px)',
              transform: 'translateX(-50%)'
            }}
          >
            <div className="absolute" style={{ 
              bottom: '-32.03%', 
              [isRTL ? 'right' : 'left']: '-10.58%',
              [isRTL ? 'left' : 'right']: '0',
              top: '-39.99%',
              transform: isRTL ? 'scaleX(-1)' : 'none'
            }}>
              <Image alt="" className="block w-full h-full max-w-none" src={imgFrame1} fill style={{objectFit: 'contain'}} />
            </div>
          </div>

          {/* Responsive Text Content - Always bottom anchored */}
          <div 
            className="absolute capitalize text-white text-center lg:text-left translate-x-[-50%] lg:translate-x-0"
            style={{ 
              // Mobile
              fontFamily: "'FONTSPRING DEMO - Visby CF Demi Bold', sans-serif",
              fontWeight: 'normal',
              fontSize: '30px',
              lineHeight: '32px',
              left: '50%',
              bottom: '100px',
              width: '281px',
              maxHeight: `${textMetrics.mobileHeight - 140}px`,
              overflow: 'hidden',
              // Desktop overrides
              '@media (min-width: 1024px)': {
                fontWeight: 'bold',
                fontSize: '70px',
                lineHeight: '1.3',
                [isRTL ? 'right' : 'left']: '42px',
                bottom: '120px',
                width: '875px',
                maxHeight: `${textMetrics.desktopHeight - 240}px`,
                textAlign: isRTL ? 'right' : 'left'
              }
            }}
          >
            {t('hero.title')}
          </div>

          {/* Responsive Slide Indicators */}
          {/* Mobile indicators */}
          <div className="absolute flex items-center justify-center translate-x-[-50%] lg:hidden" style={{ left: '50%', bottom: '40px' }}>
            <div className="flex" style={{ gap: '20.66px' }}>
              {[0, 1, 2].map((index) => (
                <SlideIndicator 
                  key={index} 
                  index={index} 
                  isActive={currentSlide === index} 
                  onClick={() => goToSlide(index)}
                  isMobile={true}
                />
              ))}
            </div>
          </div>

          {/* Desktop indicators */}
          <div className="absolute hidden lg:block" style={{ 
            [isRTL ? 'left' : 'right']: '76px', 
            top: '424px' 
          }}>
            <div className="flex flex-col" style={{ gap: '35.355px' }}>
              {[0, 1, 2].map((index) => (
                <SlideIndicator 
                  key={index} 
                  index={index} 
                  isActive={currentSlide === index} 
                  onClick={() => goToSlide(index)}
                  isMobile={false}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Slide 2 - About Text (Mobile) / Schedule Consultation (Desktop) */}
        <div className={`absolute inset-0 transition-opacity duration-1000 ${
          currentSlide === 1 ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}>
          {/* Mobile About Text Layout */}
          <div className="lg:hidden">
            {/* Mobile Background */}
            <div 
              className="absolute inset-0 bg-no-repeat"
              style={{ 
                backgroundImage: `url('${imgScreenshot3}')`,
                backgroundPosition: '47.69% 0%',
                backgroundSize: '373.72% 100%'
              }}
            />

            {/* Mobile Central Diamond with Text */}
            <div 
              className="absolute flex items-center justify-center translate-x-[-50%] translate-y-[-50%]"
              style={{ 
                left: 'calc(50% + 0.36px)',
                top: '50%',
                width: '355.719px',
                height: '355.719px'
              }}
            >
              <div style={{ transform: 'rotate(315deg)' }}>
                <div 
                  className="bg-white/13 backdrop-blur-sm overflow-hidden relative"
                  style={{ 
                    width: '251.532px',
                    height: '251.532px'
                  }}
                >
                  <div 
                    className="absolute flex items-center justify-center translate-x-[-50%]"
                    style={{ 
                      top: 'calc(50% - 170.314px)',
                      left: 'calc(50% + 0.099px)',
                      width: '347.897px',
                      height: '347.897px'
                    }}
                  >
                    <div style={{ transform: 'rotate(45deg)' }}>
                      <div 
                        className="text-white text-center capitalize relative"
                        style={{ 
                          width: '272px',
                          fontFamily: "'FONTSPRING DEMO - Visby CF Medium', 'Satoshi', sans-serif",
                          fontSize: '14px',
                          lineHeight: '20px',
                          fontWeight: 'normal'
                        }}
                      >
                        <p className="mb-0">
                          <span className="text-white">Premier </span>
                          <span className="text-white">Event </span>
                        </p>
                        <p className="mb-0">Management in Saudi </p>
                        <p className="mb-0">
                          <span className="text-white">Arabia</span>
                          <span className="text-white">, Dubai, and Across </span>
                        </p>
                        <p className="mb-0">the GCC—Delivering Creativity, </p>
                        <p className="mb-0">Innovation, and Execution All Under One Roof. When Others Stall, Panic, or Back Down, We Get to Work. Bringing You Elite </p>
                        <p className="mb-0">Strategy, Fast Execution,</p>
                        <p className="mb-0"> And Cultural Fluency</p>
                        <p className="mb-0"> Without </p>
                        <p className="mb-0">Compromise.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Mobile Logo Watermark */}
            <div 
              className="absolute bg-center bg-cover bg-no-repeat opacity-[0.57] translate-x-[-50%] translate-y-[-50%]"
              style={{ 
                top: 'calc(50% + 326px)',
                left: 'calc(50% + 128px)',
                width: '665px',
                height: '222px',
                backgroundImage: `url('${imgKayanLogo}')` 
              }}
            />
          </div>

          {/* Desktop Schedule Consultation Layout */}
          <div className="hidden lg:block">
            {/* Desktop gradient background */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#4a2b7c] via-[#2c2c2b] to-[#2c2c2b]" />
            
            {/* Desktop light beams */}
            <div className="absolute inset-0">
              <div 
                className="absolute"
                style={{
                  top: '-20%',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: '60%',
                  height: '80%',
                  background: 'radial-gradient(ellipse at center top, rgba(122,253,214,0.3) 0%, transparent 50%)',
                  filter: 'blur(60px)'
                }}
              />
              <div 
                className="absolute"
                style={{
                  top: '-10%',
                  left: '30%',
                  width: '20%',
                  height: '60%',
                  background: 'linear-gradient(180deg, rgba(184,164,255,0.2) 0%, transparent 70%)',
                  filter: 'blur(40px)',
                  transform: 'rotate(-15deg)'
                }}
              />
              <div 
                className="absolute"
                style={{
                  top: '-10%',
                  right: '30%',
                  width: '20%',
                  height: '60%',
                  background: 'linear-gradient(180deg, rgba(184,164,255,0.2) 0%, transparent 70%)',
                  filter: 'blur(40px)',
                  transform: 'rotate(15deg)'
                }}
              />
            </div>

            {/* Desktop large arrow */}
            <div 
              className="absolute opacity-20"
              style={{
                [isRTL ? 'right' : 'left']: '-5%',
                top: '15%',
                width: '30%',
                height: '50%',
                transform: isRTL ? 'rotate(-30deg) scaleX(-1)' : 'rotate(-30deg)'
              }}
            >
              <Image src={imgFrame1} alt="" className="w-full h-full object-contain" fill style={{ filter: 'hue-rotate(260deg)', objectFit: 'contain' }} />
            </div>

            {/* Desktop CTA Button */}
            <div 
              className="absolute bg-white flex flex-row items-center justify-center gap-8 rounded-[900px] overflow-hidden"
              style={{ 
                width: '340px',
                height: '74px',
                top: 'calc(50% - 0.5px)',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                padding: '20px 25px'
              }}
            >
              <div 
                className="text-[#2c2c2b] capitalize whitespace-nowrap font-medium"
                style={{ 
                  fontSize: '20px',
                  lineHeight: '28px'
                }}
              >
                {t('hero.cta')}
              </div>
              <svg 
                width="16" 
                height="15" 
                viewBox="0 0 16 15" 
                fill="none" 
                xmlns="http://www.w3.org/2000/svg"
                style={{ transform: isRTL ? 'scaleX(-1)' : 'none' }}
              >
                <path 
                  d="M1 7.5H15M15 7.5L8.5 1M15 7.5L8.5 14" 
                  stroke="#2c2c2b" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                />
              </svg>
            </div>

            {/* Desktop floating diamonds */}
            <DesktopFloatingDiamonds locale={locale} />
          </div>

          {/* Responsive Slide Indicators */}
          {/* Mobile indicators */}
          <div className="absolute flex items-center justify-center translate-x-[-50%] lg:hidden" style={{ left: '50%', bottom: '40px' }}>
            <div className="flex" style={{ gap: '20.66px' }}>
              {[0, 1, 2].map((index) => (
                <SlideIndicator 
                  key={index} 
                  index={index} 
                  isActive={currentSlide === index} 
                  onClick={() => goToSlide(index)}
                  isMobile={true}
                />
              ))}
            </div>
          </div>

          {/* Desktop indicators */}
          <div className="absolute hidden lg:block" style={{ 
            [isRTL ? 'left' : 'right']: '76px', 
            top: '424px' 
          }}>
            <div className="flex flex-col" style={{ gap: '35.355px' }}>
              {[0, 1, 2].map((index) => (
                <SlideIndicator 
                  key={index} 
                  index={index} 
                  isActive={currentSlide === index} 
                  onClick={() => goToSlide(index)}
                  isMobile={false}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Slide 3 - Schedule Consultation (Mobile) / About Text (Desktop) */}
        <div className={`absolute inset-0 transition-opacity duration-1000 ${
          currentSlide === 2 ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}>
          {/* Mobile Schedule Consultation Layout */}
          <div className="lg:hidden">
            {/* Mobile Background */}
            <div className="absolute inset-0 bg-[#2c2c2b]" />
            
            {/* Mobile Purple Gradient Overlay */}
            <div 
              className="absolute inset-0"
              style={{
                background: 'linear-gradient(135deg, #6b46c1 0%, #4c1d95 25%, #374151 50%, #2c2c2b 100%)'
              }}
            />
            
            {/* Mobile lighting effects */}
            <MobileLightingEffects />

            {/* Mobile Pattern Overlay */}
            <div 
              className="absolute bg-center bg-cover bg-no-repeat opacity-30"
              style={{ 
                width: '602px',
                height: '230px',
                left: '-501px',
                top: '-13px',
                backgroundImage: `url('${imgPattern0331}')` 
              }}
            />
            
            {/* Mobile CTA Button */}
            <div 
              className="absolute bg-white flex items-center justify-center gap-2.5 rounded-[900px] overflow-hidden translate-x-[-50%] translate-y-[-50%]"
              style={{ 
                width: 'auto',
                height: '44px',
                top: '50%',
                left: '50%',
                padding: '20px 18px'
              }}
            >
              <div 
                className="text-[#2c2c2b] capitalize whitespace-nowrap font-normal"
                style={{ 
                  fontFamily: "'Aeonik', sans-serif",
                  fontSize: '16px',
                  lineHeight: '28px'
                }}
              >
                {t('hero.cta')}
              </div>
              <div 
                className="relative flex items-center justify-center" 
                style={{ 
                  width: '16px', 
                  height: '16px',
                  transform: isRTL ? 'scaleX(-1)' : 'none'
                }}
              >
                <Image alt="" className="block max-w-none size-full" src={imgArrow1} fill style={{ objectFit: 'contain' }} />
              </div>
            </div>
          </div>

          {/* Desktop About Text Layout */}
          <div className="hidden lg:block">
            {/* Desktop Background Image */}
            <div 
              className="absolute bg-center bg-cover bg-no-repeat"
              style={{ 
                width: `${Math.round(textMetrics.desktopHeight * 1.522)}px`,
                height: `${textMetrics.desktopHeight}px`,
                top: '0px',
                left: '50%',
                transform: 'translateX(-50%)',
                backgroundImage: `url('${imgScreenshot3}')` 
              }}
            />

            {/* Desktop Logo Watermark */}
            <div 
              className="absolute bg-center bg-cover bg-no-repeat opacity-[0.57]"
              style={{ 
                width: '1241px',
                height: '414px',
                left: '238px',
                top: '748px',
                backgroundImage: `url('${imgKayanLogo}')` 
              }}
            />

            {/* Desktop Decorative Diamonds - bottom left */}
            <div className="absolute" style={{ left: '30px', top: '834px' }}>
              <div className="flex" style={{ gap: '27px' }}>
                {[0, 1].map((index) => (
                  <div 
                    key={index}
                    className="flex items-center justify-center"
                    style={{ width: '87.725px', height: '87.725px' }}
                  >
                    <div style={{ transform: 'rotate(315deg)' }}>
                      <div 
                        className="backdrop-blur-[7.5px]"
                        style={{ 
                          width: '62.042px',
                          height: '62.042px',
                          backgroundColor: 'rgba(255,255,255,0.3)'
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Desktop Central Diamond with Text */}
            <div 
              className="absolute flex items-center justify-center"
              style={{ 
                width: '801.992px',
                height: '801.992px',
                top: 'calc(50% + 0.5px)',
                left: '50%',
                transform: 'translate(-50%, -50%)'
              }}
            >
              <div style={{ transform: 'rotate(315deg)' }}>
                <div 
                  className="overflow-hidden relative"
                  style={{ 
                    width: '567.1px',
                    height: '567.1px',
                    backgroundColor: 'rgba(255,255,255,0.13)'
                  }}
                >
                  <div 
                    className="absolute flex items-center justify-center"
                    style={{ 
                      width: '100%',
                      height: '100%',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)'
                    }}
                  >
                    <div style={{ transform: 'rotate(45deg)' }}>
                      <div 
                        className="text-white text-center capitalize px-8"
                        style={{ 
                          maxWidth: '627px',
                          fontSize: '28px',
                          lineHeight: '38px',
                          fontWeight: '500',
                          minHeight: 'fit-content'
                        }}
                      >
                        {t('hero.description')}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Responsive Slide Indicators */}
          {/* Mobile indicators */}
          <div className="absolute flex items-center justify-center translate-x-[-50%] lg:hidden" style={{ left: '50%', bottom: '40px' }}>
            <div className="flex" style={{ gap: '20.66px' }}>
              {[0, 1, 2].map((index) => (
                <SlideIndicator 
                  key={index} 
                  index={index} 
                  isActive={currentSlide === index} 
                  onClick={() => goToSlide(index)}
                  isMobile={true}
                />
              ))}
            </div>
          </div>

          {/* Desktop indicators */}
          <div className="absolute hidden lg:block" style={{ 
            [isRTL ? 'left' : 'right']: '76px', 
            top: '424px' 
          }}>
            <div className="flex flex-col" style={{ gap: '35.355px' }}>
              {[0, 1, 2].map((index) => (
                <SlideIndicator 
                  key={index} 
                  index={index} 
                  isActive={currentSlide === index} 
                  onClick={() => goToSlide(index)}
                  isMobile={false}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}