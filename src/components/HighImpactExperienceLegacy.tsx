'use client';

import React, { useRef } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { motion, useScroll, useTransform } from 'framer-motion';

const imgBackground = "/assets/29064c5a0d86395e45b642fe4e6daf670490f723.png";
const imgRectangle = "/assets/3f0c70e340a28d47867891894e77a32ca1a022f1.png";
const imgPattern = "/assets/6ebbb286c787b4009100c9f8cd397942ae83de56.png";

// Mobile assets from Figma (node-id 17-486)
const img202508031915NeonConcert = "/assets/3f0c70e340a28d47867891894e77a32ca1a022f1.png";
const imgPattern0341 = "/assets/6ebbb286c787b4009100c9f8cd397942ae83de56.png";

export default function HighImpactExperienceLegacy() {
  const t = useTranslations();
  const locale = useLocale();
  const isRTL = locale === 'ar';
  
  // Ref for scroll animations
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Scroll progress tracking
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });
  
  // Animation values for different words based on RTL/LTR
  // Words should come from far edges of screen (using viewport width)
  // First word (high): from right on LTR, from left on RTL
  const firstWordX = useTransform(
    scrollYProgress,
    [0, 0.3, 0.5, 1],
    isRTL ? ["-100vw", "-50vw", "0vw", "10vw"] : ["100vw", "50vw", "0vw", "-10vw"]
  );
  
  // Middle word (impact): from left on LTR, from right on RTL  
  const middleWordX = useTransform(
    scrollYProgress,
    [0, 0.3, 0.5, 1],
    isRTL ? ["100vw", "50vw", "0vw", "-10vw"] : ["-100vw", "-50vw", "0vw", "10vw"]
  );
  
  // Last word (experience): from right on LTR, from left on RTL
  const lastWordX = useTransform(
    scrollYProgress,
    [0, 0.3, 0.5, 1],
    isRTL ? ["-100vw", "-50vw", "0vw", "10vw"] : ["100vw", "50vw", "0vw", "-10vw"]
  );
  
  // Debug logging
  console.log('🔍 HighImpactExperienceLegacy DEBUG:', { locale, isRTL });
  console.log('🎯 RTL positioning applied via inline styles - no more CSS conflicts');
  
  // Generate unique CSS style tag to override CSS modules with higher specificity
  // Generate stable unique ID for scoped CSS to prevent hydration mismatches
  const uniqueId = `rtl-patterns-${locale}-${isRTL ? 'rtl' : 'ltr'}`;
  const dynamicCSS = `
    <style>
      .${uniqueId} .mobile-pattern { 
        left: ${isRTL ? '0px' : 'auto'} !important;
        right: ${isRTL ? 'auto' : '0px'} !important;
      }
      .${uniqueId} .desktop-pattern { 
        left: ${isRTL ? '0px' : 'auto'} !important;
        right: ${isRTL ? 'auto' : '0px'} !important;
      }
    </style>
  `;
  
  return (
    <div className={uniqueId} ref={containerRef}>
      <div dangerouslySetInnerHTML={{ __html: dynamicCSS }} />
      
      {/* Mobile/Tablet Layout */}
      <div className="block lg:hidden px-4 mt-8 mb-6 md:mb-12 lg:mb-16">
        <div 
          className="bg-[#2c2c2b] overflow-hidden rounded-[25px] relative w-full"
          style={{ height: 'clamp(645px, 85vh, 750px)' }}
        >
            {/* Mobile/Tablet Concert Image - Bottom Section */}
            <div 
              className="absolute bg-center bg-cover bg-no-repeat w-full"
              style={{ 
                height: 'clamp(367px, 50vh, 420px)',
                left: '0px',
                top: 'clamp(320px, 45vh, 380px)',
                backgroundImage: `url('${img202508031915NeonConcert}')`
              }}
            >
              {/* Inner shadow overlay */}
              <div 
                className="absolute inset-0 pointer-events-none"
                style={{
                  boxShadow: 'inset 0px 0px 119px 0px rgba(0,0,0,0.82)'
                }}
              />
            </div>

            {/* Mobile/Tablet Dark Blur Element */}
            <div 
              className="absolute bg-[#2c2c2b] filter"
              style={{
                width: 'calc(100% + 130px)',
                height: 'clamp(132px, 18vh, 160px)',
                left: '-65px',
                top: 'clamp(600px, 80vh, 680px)',
                filter: 'blur(29.5px)'
              }}
            />

            {/* Mobile/Tablet Text Content */}
            <div 
              className="absolute flex flex-col items-center justify-start text-center px-[18px] md:px-[32px]"
              style={{
                width: 'calc(100% - 36px)',
                left: '0px',
                top: 'clamp(30px, 5vh, 50px)',
                fontFamily: '"Poppins", sans-serif',
                fontSize: 'clamp(50px, 12vw, 85px)',
                letterSpacing: 'clamp(-2.4px, -0.3vw, -3px)',
                lineHeight: 'clamp(70px, 16vw, 110px)',
                marginBottom: 'clamp(40px, 8vh, 60px)',
                zIndex: 10
              }}
            >
              {/* Three lines with scroll-linked animations */}
              <div className="w-full flex flex-col items-center text-center space-y-3">
                {/* First line - animated from right/left */}
                <motion.div 
                  className="text-white font-medium"
                  style={{ x: firstWordX }}
                >
                  {t('highImpact.high')}
                </motion.div>
                
                {/* Second line - animated from left/right with gradient */}
                <motion.div 
                  className="bg-clip-text font-medium"
                  style={{ 
                    x: middleWordX,
                    background: isRTL 
                      ? 'linear-gradient(to right, #74cfaa, #a095e1)' 
                      : 'linear-gradient(to left, #74cfaa, #a095e1)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text'
                  }}
                >
                  {t('highImpact.impact')}
                </motion.div>
                
                {/* Third line - animated from right/left */}
                <motion.div 
                  className="text-white font-medium"
                  style={{ x: lastWordX }}
                >
                  {t('highImpact.experience')}
                </motion.div>
              </div>
            </div>

            {/* Mobile Decorative Pattern - Bottom */}
            <div 
              className="bg-center bg-cover bg-no-repeat mobile-pattern"
              style={{ 
                position: 'absolute',
                ...(isRTL ? { left: '0px', right: 'auto' } : { right: '0px', left: 'auto' }),
                width: 'min(360px, 100vw)',
                height: '240px',
                bottom: '-107px',
                backgroundImage: `url('${imgPattern0341}')`,
                transform: isRTL ? 'scaleX(-1)' : 'none',
                opacity: isRTL ? 0.3 : 1,
                zIndex: 1,
                pointerEvents: 'none'
              }}
            />
        </div>
      </div>

      {/* Desktop Layout */}
      <div className="hidden lg:block relative mt-8 mb-6 md:mb-12 lg:mb-16">
      <div
        className="relative overflow-hidden rounded-tl-[61px] rounded-tr-[61px] rounded-bl-[20px] rounded-br-[20px] bg-center bg-cover bg-no-repeat"
        style={{ 
          backgroundImage: `url('${imgBackground}')`,
          height: '873px',
          transform: isRTL ? 'scaleX(-1)' : 'none'
        }}
      >
        {/* Right side image overlay */}
        <div
          className="absolute bg-center bg-cover bg-no-repeat"
          style={{ 
            backgroundImage: `url('${imgRectangle}')`,
            width: '1055px',
            height: '873px',
            [isRTL ? 'left' : 'right']: '399px',
            top: '0'
          }}
        />

        {/* Dark blur overlay for depth */}
        <div
          className="absolute bg-[#2c2c2b] blur-[200px] filter"
          style={{
            width: '1202px',
            height: '1500px',
            left: '-412px',
            top: '-284px'
          }}
        />

        {/* Main text content - aligned with navbar logo */}
        <div className="absolute inset-0 flex items-center z-10" style={{ transform: isRTL ? 'scaleX(-1)' : 'none' }}>
          <div className={`${isRTL ? 'pr-12 text-right' : 'pl-12 text-left'}`}>
            {/* Three lines text with scroll-linked animations */}
            <div className="leading-tight flex flex-col space-y-4">
              {/* First line - animated from right/left */}
              <motion.div 
                className="text-white font-medium"
                style={{
                  x: firstWordX,
                  fontSize: 'clamp(80px, 12vw, 170px)',
                  lineHeight: '1.3em',
                  letterSpacing: '-0.04em'
                }}
              >
                {t('highImpact.high')}
              </motion.div>
              
              {/* Second line - animated from left/right with gradient */}
              <motion.div 
                className="font-medium bg-clip-text"
                style={{
                  x: middleWordX,
                  fontSize: 'clamp(80px, 12vw, 170px)',
                  lineHeight: '1.3em',
                  letterSpacing: '-0.04em',
                  background: isRTL 
                    ? 'linear-gradient(to left, #a095e1, #74cfaa)' 
                    : 'linear-gradient(to right, #a095e1, #74cfaa)',
                  WebkitTextFillColor: 'transparent',
                  WebkitBackgroundClip: 'text',
                  backgroundClip: 'text'
                }}
              >
                {t('highImpact.impact')}
              </motion.div>
              
              {/* Third line - animated from right/left */}
              <motion.div 
                className="text-white font-medium"
                style={{
                  x: lastWordX,
                  fontSize: 'clamp(80px, 12vw, 170px)',
                  lineHeight: '1.3em',
                  letterSpacing: '-0.04em'
                }}
              >
                {t('highImpact.experience')}
              </motion.div>
            </div>
          </div>
        </div>

        {/* Decorative pattern - adjusted positioning */}
        <div
          className="bg-center bg-cover bg-no-repeat desktop-pattern z-0"
          style={{ 
            position: 'absolute',
            ...(isRTL ? { left: '0px', right: 'auto' } : { right: '0px', left: 'auto' }),
            backgroundImage: `url('${imgPattern}')`,
            width: '638px',
            height: '426px',
            top: '531px',
            transform: isRTL ? 'scaleX(-1)' : 'none',
            opacity: isRTL ? 0.3 : 1,
            zIndex: 1,
            pointerEvents: 'none'
          }}
        />

        {/* Inner shadow effect */}
        <div 
          className="absolute inset-0 pointer-events-none"
          style={{
            boxShadow: isRTL 
              ? 'inset 100px 0px 200px 0px #231f20' 
              : 'inset -100px 0px 200px 0px #231f20'
          }}
        />
      </div>
    </div>
    </div>
  );
}