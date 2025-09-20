'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';

// Assets from Figma
const imgRectangle4236 = "/optimized/gallery-thumbnail/97b98a652c6210a2b4e884e84040708ab75a45fc-gallery-thumbnail-desktop.webp";
const imgRectangle4237 = "/optimized/gallery-thumbnail/a4bd38b73259c4fd4f099d834871f17ed5486466-gallery-thumbnail-desktop.webp";
const imgRectangle4238 = "/optimized/gallery-thumbnail/bdd0b482d2a4b06725b67356c9cb8f5f989799c7-gallery-thumbnail-desktop.webp";
const imgPattern0341 = "/optimized/gallery-thumbnail/6ebbb286c787b4009100c9f8cd397942ae83de56-gallery-thumbnail-desktop.webp";
const imgPattern0212 = "/optimized/cta-background/ef25fd14e49122ddd6cbc03c8a92caff93500eb7-cta-background-desktop.webp";

export default function WorkPreview() {
  const t = useTranslations('work.preview');
  const [isMobile, setIsMobile] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Prevent hydration mismatch
  if (!mounted) {
    return null;
  }
  if (isMobile) {
    // Mobile Layout - Based on Figma Design
    return (
      <div className="bg-[#2c2c2b] overflow-hidden relative rounded-[25px] w-full" style={{ height: 'clamp(600px, 90vh, 750px)' }}>
        {/* Mobile Title Section - Centered and Responsive */}
        <div className="absolute flex flex-col items-center justify-center w-full px-4" style={{ top: 'clamp(20px, 5vh, 40px)' }}>
          <div className="text-white text-center font-medium" style={{
            fontFamily: '"Poppins", sans-serif',
            fontSize: 'clamp(56px, 15vw, 90px)',
            lineHeight: 'clamp(60px, 16vw, 95px)',
            letterSpacing: '-2px',
            marginBottom: '8px'
          }}>
            <p className="mb-0">{t('title.line1')}</p>
            <p className="mb-0">{t('title.line2')}</p>
          </div>
          <div 
            className="bg-clip-text bg-gradient-to-l from-[#74cfaa] to-[#a095e1] text-center font-medium" 
            style={{ 
              WebkitTextFillColor: "transparent",
              fontFamily: '"Poppins", sans-serif',
              fontSize: 'clamp(56px, 15vw, 90px)',
              lineHeight: 'clamp(60px, 16vw, 95px)',
              letterSpacing: '-2px'
            }}
          >
            <p className="mb-0">{t('title.line3')}</p>
          </div>
        </div>
        
        {/* Mobile Images - Tilted/overlapping layout filling component width */}
        <div className="absolute left-0 right-0" style={{ top: 'clamp(260px, 37vh, 320px)' }}>
          {/* Image 1 - Leftmost */}
          <div 
            className="absolute overflow-hidden" 
            style={{
              height: 'clamp(280px, 40vh, 360px)',
              width: 'clamp(420px, 105vw, 500px)',
              left: 'clamp(-120px, -30vw, -100px)',
              top: '0',
              maskImage: 'linear-gradient(to top, transparent 0%, black 25%, black 100%)',
              WebkitMaskImage: 'linear-gradient(to top, transparent 0%, black 25%, black 100%)'
            }}
          >
            <Image 
              alt="" 
              className="block max-w-none size-full object-cover" 
              src={imgRectangle4238}
              fill
              style={{objectFit: 'cover'}}
            />
          </div>
          
          {/* Image 2 - Middle - Overlapping with Image 1 */}
          <div 
            className="absolute overflow-hidden" 
            style={{
              height: 'clamp(280px, 40vh, 360px)',
              width: 'clamp(420px, 105vw, 500px)',
              left: 'clamp(50px, 12.5vw, 90px)',
              top: '0',
              maskImage: 'linear-gradient(to top, transparent 0%, black 25%, black 100%)',
              WebkitMaskImage: 'linear-gradient(to top, transparent 0%, black 25%, black 100%)'
            }}
          >
            <Image 
              alt="" 
              className="block max-w-none size-full object-cover" 
              src={imgRectangle4237}
              fill
              style={{objectFit: 'cover'}}
            />
          </div>
          
          {/* Image 3 - Rightmost - Overlapping with Image 2 */}
          <div 
            className="absolute overflow-hidden" 
            style={{
              height: 'clamp(280px, 40vh, 360px)',
              width: 'clamp(420px, 105vw, 500px)',
              right: 'clamp(-120px, -30vw, -100px)',
              top: '0',
              maskImage: 'linear-gradient(to top, transparent 0%, black 25%, black 100%)',
              WebkitMaskImage: 'linear-gradient(to top, transparent 0%, black 25%, black 100%)'
            }}
          >
            <Image 
              alt="" 
              className="block max-w-none size-full object-cover" 
              src={imgRectangle4236}
              fill
              style={{objectFit: 'cover'}}
            />
          </div>
        </div>
        
        {/* Mobile Blur Effect - White */}
        <div className="absolute bg-white/15 blur-[20px] filter w-full" style={{
          height: 'clamp(80px, 12vh, 120px)',
          bottom: 'clamp(80px, 12vh, 120px)',
          left: '0'
        }} />
        
        {/* Mobile Pattern - Bottom - White */}
        <div 
          className="absolute bg-center bg-cover bg-no-repeat left-1/2 transform -translate-x-1/2"
          style={{ 
            bottom: 'clamp(-60px, -10vh, -80px)',
            height: 'clamp(120px, 20vh, 160px)',
            width: 'clamp(200px, 50vw, 280px)',
            backgroundImage: `url('${imgPattern0341}')`,
            filter: 'brightness(0) invert(1)',
            opacity: 0.8
          }}
        />
      </div>
    );
  }

  // Desktop Layout - Original Design
  return (
    <div className="bg-[#2c2c2b] overflow-clip relative rounded-bl-[20px] rounded-br-[20px] rounded-tl-[61px] rounded-tr-[61px] w-full h-[1031px]">
      {/* Three Event Images - Right Side */}
      <div className="absolute left-[226px] top-0">
        {/* Image 3 - Rightmost */}
        <div className="absolute h-[948px] left-[813px] top-0 w-[631px] overflow-hidden">
          <Image 
            alt="" 
            className="block max-w-none size-full object-cover" 
            src={imgRectangle4236}
            fill
            style={{objectFit: 'cover'}}
          />
          {/* Fade overlay for bottom and left */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#2c2c2b] from-0% via-[#2c2c2b]/50 via-30% to-transparent to-60% opacity-80" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#2c2c2b] via-transparent to-transparent opacity-40" />
        </div>
        
        {/* Image 2 - Middle */}
        <div className="absolute h-[948px] left-[406px] top-0 w-[631px] overflow-hidden">
          <Image 
            alt="" 
            className="block max-w-none size-full object-cover" 
            src={imgRectangle4237}
            fill
            style={{objectFit: 'cover'}}
          />
          {/* Fade overlay for bottom and left */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#2c2c2b] from-0% via-[#2c2c2b]/50 via-30% to-transparent to-60% opacity-80" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#2c2c2b] via-transparent to-transparent opacity-40" />
        </div>
        
        {/* Image 1 - Leftmost */}
        <div className="absolute h-[948px] left-0 top-0 w-[631px] overflow-hidden">
          <Image 
            alt="" 
            className="block max-w-none size-full object-cover" 
            src={imgRectangle4238}
            fill
            style={{objectFit: 'cover'}}
          />
          {/* Fade overlay for bottom and left */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#2c2c2b] from-0% via-[#2c2c2b]/50 via-30% to-transparent to-60% opacity-80" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#2c2c2b] via-transparent to-transparent opacity-40" />
        </div>
      </div>
      
      {/* Blur Effect - Left Side - Responsive */}
      <div className="absolute bg-[#2c2c2b] blur-[100px] filter" style={{
        height: '145%', // 1500px / 1031px = 145%
        left: '-27.2%', // -412px / 1512px = -27.2%
        top: '-27.5%', // -284px / 1031px = -27.5%
        width: '67.1%' // 1015px / 1512px = 67.1%
      }} />
      
      {/* Main Content - Left Side - Responsive */}
      <div className="absolute capitalize flex flex-col items-start justify-start" style={{
        left: '3.8%', // 57px / 1512px = 3.8%
        top: '9.4%', // 97px / 1031px = 9.4%
        width: '51.5%', // 778px / 1512px = 51.5%
        gap: 'clamp(2rem, 3.8vw, 58px)', // 58px responsive
        zIndex: 10 // Above pattern overlays
      }}>
        {/* Title Section */}
        <div className="flex flex-col items-start justify-start w-full font-medium" style={{
          gap: 'clamp(0.75rem, 1.2vw, 18px)', // 18px responsive
          fontSize: 'clamp(4rem, 9.3vw, 140px)', // 140px responsive
          letterSpacing: '-5.6px'
        }}>
          {/* All title text in one container */}
          <div className="text-white w-full space-y-2">
            <p className="mb-0" style={{ lineHeight: 'clamp(4.5rem, 8.5vw, 129px)' }}>{t('title.line1')}</p>
            <p className="mb-0" style={{ lineHeight: 'clamp(4.5rem, 8.5vw, 129px)' }}>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{t('title.line2')}</p>
            <p 
              className="mb-0 bg-clip-text bg-gradient-to-r from-[#a095e1] to-[#74cfaa]" 
              style={{ 
                WebkitTextFillColor: "transparent",
                lineHeight: 'clamp(5rem, 11.6vw, 175px)'
              }}
            >
              {t('title.line3')}
            </p>
          </div>
        </div>
        
        {/* Description Text */}
        <div className="font-medium text-[#fdfdfd]" style={{
          lineHeight: 'clamp(1.2rem, 1.9vw, 28px)', // 28px responsive
          fontSize: 'clamp(1rem, 1.5vw, 22px)', // 22px responsive
          width: 'clamp(300px, 43.5vw, 658px)' // 658px responsive
        }}>
          <p className="mb-0">
            {t('description')}
          </p>
          <p className="mb-0">&nbsp;</p>
          <p className="mb-0">
            {t('positioning')}
          </p>
        </div>
      </div>
      
      
      {/* Pattern Overlay - Bottom Right - Responsive */}
      <div 
        className="absolute bg-center bg-cover bg-no-repeat"
        style={{ 
          height: '44.2%', // 456px / 1031px = 44.2%
          top: '78.6%', // 810px / 1031px = 78.6%
          width: '45.1%', // 682px / 1512px = 45.1%
          left: "calc(50% + 29.7vw)", // 449px / 1512px = 29.7%
          transform: "translateX(-50%)",
          backgroundImage: `url('${imgPattern0341}')` 
        }}
      />
      
      {/* Pattern Overlay - Bottom Left - Responsive */}
      <div className="absolute flex items-center justify-center" style={{
        height: '81.7%', // 842px / 1031px = 81.7%
        left: '-13.8%', // -209px / 1512px = -13.8%
        top: '73.9%', // 762px / 1031px = 73.9%
        width: '55.1%', // 833px / 1512px = 55.1%
        zIndex: 1, // Behind text content
        opacity: 0.3 // Very transparent
      }}>
        <div className="rotate-[90deg] flex-none">
          <div
            className="bg-center bg-cover bg-no-repeat"
            style={{
              height: 'clamp(400px, 55.1vw, 833px)', // 833px responsive
              width: 'clamp(420px, 55.7vw, 842px)', // 842px responsive
              backgroundImage: `url('${imgPattern0212}')`
            }}
          />
        </div>
      </div>
      
      {/* Inner Shadow Effect */}
      <div className="absolute inset-0 pointer-events-none shadow-[-100px_0px_200px_0px_inset_#231f20]" />
    </div>
  );
}