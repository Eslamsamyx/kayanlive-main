'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import CTAButton from './CTAButton';

// Assets from Figma
const imgOutline1 = "/optimized/about-hero/1349ad630f81a3bb2a509dd8abfe0e4ef85fa329-about-hero-desktop.webp";
const imgPattern0452 = "/optimized/gallery-thumbnail/6cdd4333a240b46dead9df86c5a83772e81b76fc-gallery-thumbnail-desktop.webp";
const imgFreepikTheStyleIsCandidImagePhotographyWithNatural627961 = "/optimized/service-card/0a0c21416d9d9b2c97aedc8aa51e7c6619486a15-service-card-desktop.webp";
const imgEllipse3626 = "/assets/34146dbe8aeb9c1892f700cd9059e41d476db4b0.svg";

// Mobile-specific assets
const imgFrame1618874025 = "/optimized/service-card/0a0c21416d9d9b2c97aedc8aa51e7c6619486a15-service-card-mobile.webp";

interface WorkCallToActionProps {
  locale?: string;
}

export default function WorkCallToAction({ locale = 'en' }: WorkCallToActionProps) {
  const t = useTranslations('work.callToAction');
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
      <div className="bg-[#2c2c2b] box-border flex flex-col gap-[31px] items-center justify-center px-[27px] py-20 relative w-full overflow-hidden min-h-[700px]">
        {/* Decorative Pattern - Mobile - White - Bigger and partially outside */}
        <div 
          className="absolute bg-center bg-cover bg-no-repeat h-[280px] w-[180px]"
          style={{ 
            backgroundImage: `url('${imgPattern0452}')`,
            right: '-50px',
            top: '300px',
            filter: 'brightness(0) invert(1)',
            opacity: 0.8
          }} 
        />
        
        {/* Business Meeting Image */}
        <div 
          className="bg-center bg-cover bg-no-repeat h-[239px] rounded-[20px] w-full max-w-[420px]"
          style={{ backgroundImage: `url('${imgFrame1618874025}')` }}
        />
        
        {/* Content Card with Glass Morphism */}
        <div className="bg-white/[0.03] backdrop-blur-md box-border flex flex-col gap-[25px] items-start justify-center px-[30px] py-[35px] relative rounded-[35px] w-full max-w-[420px] overflow-hidden">
          {/* Gradient Border */}
          <div 
            aria-hidden="true" 
            className="absolute border border-[#74cfaa] border-solid inset-0 pointer-events-none rounded-[35px]" 
          />
          
          {/* Gradient Title */}
          <div 
            className="bg-clip-text bg-gradient-to-r capitalize from-[#a095e1] to-[#74cfaa] w-[200px]"
            style={{
              fontFamily: '"Poppins", sans-serif',
              fontWeight: 'bold',
              fontSize: '30px',
              lineHeight: '31px',
              letterSpacing: '-0.6px',
              WebkitTextFillColor: 'transparent'
            }}
          >
            <p>{t('title')}</p>
          </div>
          
          {/* Content Text */}
          <div className="w-full" style={{
            fontFamily: '"Poppins", sans-serif',
            fontSize: '16px',
            lineHeight: '20px',
            color: '#c3c3c3'
          }}>
            <p className="mb-0">{t('question')}</p>
            <p className="mb-0 text-white font-bold">{t('callout')}</p>
            <p className="mb-0">&nbsp;</p>
            <p>{t('description')}</p>
            <p className="mb-0">&nbsp;</p>
            <p>{t('promise')}</p>
          </div>
        </div>
        
        {/* CTA Button */}
        <CTAButton
          href={`/${locale}/contact`}
          ariaLabel={t('buttonAriaLabel')}
        >
          {t('buttonText')}
        </CTAButton>
      </div>
    );
  }

  // Desktop Layout - Original Design

  return (
    <div
      className="bg-[#2c2c2b] relative w-full overflow-clip"
      style={{ minHeight: 'clamp(600px, 70vw, 1050px)' }}
    >
      {/* Background Decorative Elements */}
      <div 
        className="absolute bg-center bg-cover bg-no-repeat opacity-50" 
        style={{ 
          backgroundImage: `url('${imgOutline1}')`,
          height: 'clamp(600px, 72.4vw, 1094px)',
          left: 'clamp(-400px, -35vw, -500px)',
          top: 'clamp(180px, 20.8vw, 314px)',
          width: 'clamp(400px, 46.6vw, 704px)'
        }} 
      />
      {/* Top-Right Pattern - Completely White */}
      <div 
        className="absolute bg-center bg-cover bg-no-repeat" 
        style={{ 
          backgroundImage: `url('${imgPattern0452}')`,
          height: 'clamp(280px, 30.8vw, 466px)',
          left: 'clamp(800px, 84.2vw, 1273px)',
          top: 'clamp(-40px, -4.3vw, -65px)',
          width: 'clamp(180px, 20.2vw, 305px)',
          filter: 'brightness(0) invert(1)',
          opacity: 0.8
        }} 
      />

      {/* Main Content Container - Responsive and Centered */}
      <div 
        className="absolute flex flex-col items-center justify-start translate-x-[-50%] translate-y-[-50%]"
        style={{
          left: '50%',
          top: 'calc(50% + 0.5px)',
          width: 'clamp(320px, 88.6vw, 1339px)',
          gap: 'clamp(30px, 3vw, 46px)',
          maxWidth: '95vw'
        }}
      >
        {/* Two Column Layout - Responsive */}
        <div 
          className="flex flex-col lg:flex-row items-center justify-center relative w-full"
          style={{ 
            gap: 'clamp(15px, 1.7vw, 25px)'
          }}
        >
          {/* Left Image - Responsive */}
          <div
            className="bg-white overflow-clip relative flex-shrink-0"
            style={{
              minHeight: 'clamp(280px, 33.9vw, 513px)',
              width: 'clamp(320px, 43.5vw, 657px)',
              borderRadius: 'clamp(20px, 2.6vw, 40px)',
              maxWidth: '100%'
            }}
          >
            <div 
              className="absolute bg-center bg-cover bg-no-repeat inset-0" 
              style={{ backgroundImage: `url('${imgFreepikTheStyleIsCandidImagePhotographyWithNatural627961}')` }} 
            />
            {/* Decorative Circle - Responsive */}
            <div 
              className="absolute"
              style={{
                height: 'clamp(180px, 20.6vw, 311px)',
                left: 'clamp(240px, 32.1vw, 485px)',
                top: 'clamp(-95px, -10.5vw, -159px)',
                width: 'clamp(200px, 23.5vw, 356px)'
              }}
            >
              <div className="absolute inset-[-96.46%_-84.27%]">
                <Image alt="" className="block max-w-none size-full" src={imgEllipse3626} fill style={{objectFit: 'cover'}} />
              </div>
            </div>
          </div>

          {/* Right Content Box - Responsive with Glass Morphism */}
          <div
            className="bg-white/[0.03] backdrop-blur-md box-border flex flex-col items-start justify-start relative flex-shrink-0 overflow-hidden"
            style={{
              gap: 'clamp(25px, 2.9vw, 44px)',
              minHeight: 'clamp(280px, 33.9vw, 513px)',
              width: 'clamp(320px, 43.5vw, 657px)',
              padding: 'clamp(25px, 3.3vw, 50px)',
              borderRadius: 'clamp(20px, 2.3vw, 35px)',
              maxWidth: '100%'
            }}
          >
            {/* Simple Green Border */}
            <div 
              aria-hidden="true" 
              className="absolute border border-[#74cfaa] border-solid inset-0 pointer-events-none"
              style={{ borderRadius: 'clamp(20px, 2.3vw, 35px)' }}
            />
            
            {/* Gradient Title - Responsive */}
            <div 
              className="bg-clip-text bg-gradient-to-r capitalize font-normal from-[#a095e1] leading-relaxed not-italic relative to-[#74cfaa]"
              style={{ 
                WebkitTextFillColor: "transparent",
                fontSize: 'clamp(32px, 5.3vw, 80px)',
                letterSpacing: 'clamp(-0.8px, -0.11vw, -1.6px)',
                lineHeight: 'clamp(44px, 6vw, 85px)',
                maxWidth: '100%',
                paddingBottom: 'clamp(8px, 1vw, 12px)'
              }}
            >
              {t('title')}
            </div>

            {/* Content Text - Responsive */}
            <div
              className="font-medium not-italic relative text-[#c3c3c3]"
              style={{
                fontSize: 'clamp(14px, 1.5vw, 22px)',
                lineHeight: 'clamp(18px, 1.9vw, 28px)',
                width: '100%'
              }}
            >
              <p className="font-normal mb-0">{t('question')}</p>
              <p className="font-bold mb-0 text-white">{t('callout')}</p>
              <p className="mb-0">&nbsp;</p>
              <p className="font-normal">{t('description')}</p>
              <p className="mb-0">&nbsp;</p>
              <p className="font-normal">{t('promise')}</p>
            </div>
          </div>
        </div>

        {/* CTA Button */}
        <CTAButton
          href={`/${locale}/contact`}
          ariaLabel={t('buttonAriaLabel')}
        >
          {t('buttonText')}
        </CTAButton>
      </div>
    </div>
  );
}