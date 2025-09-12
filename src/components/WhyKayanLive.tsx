'use client';

import Image from 'next/image';
import { useTranslations, useLocale } from 'next-intl';
import { useRef } from 'react';
import { getMarkdownHTML } from '@/utils/markdownUtils';
import AnimatedPath from './AnimatedPath';

const imgPattern = "/assets/1349ad630f81a3bb2a509dd8abfe0e4ef85fa329.png";
const kayanLogo = "/assets/a01d943cb7ebcf5598b83131f56810cf97a4e883.png";

export default function WhyKayanLive() {
  const t = useTranslations();
  const locale = useLocale();
  const sectionRef = useRef<HTMLDivElement>(null);
  
  return (
    <div ref={sectionRef} className="bg-white relative w-full overflow-hidden min-h-screen lg:min-h-[1450px]">
      {/* Left/Right Pattern - positioned exactly as in Figma with black filter - Hidden on mobile and tablet */}
      <div 
        className="absolute bg-center bg-cover bg-no-repeat z-0 hidden lg:block"
        style={{ 
          backgroundImage: `url('${imgPattern}')`,
          width: '370px',
          height: '572px',
          [locale === 'ar' ? 'right' : 'left']: '-124px',
          top: '3px',
          zIndex: 1,
          filter: 'invert(1) brightness(0)',
          opacity: 0.5
        }}
      />
      
      {/* Right/Left Pattern - Bottom (rotated 180 degrees with black filter) - Hidden on mobile and tablet */}
      <div 
        className="absolute z-0 hidden lg:block"
        style={{ 
          width: '370px',
          height: '572px',
          [locale === 'ar' ? 'left' : 'right']: '84px',
          top: '899px',
          zIndex: 1
        }}
      >
        <div 
          className="bg-center bg-cover bg-no-repeat w-full h-full"
          style={{ 
            backgroundImage: `url('${imgPattern}')`,
            transform: 'rotate(180deg)',
            filter: 'invert(1) brightness(0)',
            opacity: 0.5
          }}
        />
      </div>

      {/* Animated Path */}
      <AnimatedPath containerRef={sectionRef} />

      {/* Desktop Content Container */}
      <div className="hidden lg:block max-w-[1600px] mx-auto px-4 md:px-8 lg:px-20 relative z-10" style={{ paddingTop: '85px', paddingBottom: '100px' }}>
        {/* Why heading - Original position */}
        <h2 
          className="text-[#2c2c2b] font-medium capitalize"
          style={{
            fontSize: '220px',
            lineHeight: '230px',
            letterSpacing: '-2.2px',
            marginLeft: '117px',
            marginBottom: '37px',
            fontFamily: '"Poppins", sans-serif'
          }}
        >
          {t('whyKayan.title')}
        </h2>

        {/* KayanLive Logo */}
        <div 
          className="bg-center bg-contain bg-no-repeat"
          style={{ 
            backgroundImage: `url('${kayanLogo}')`,
            width: '865px',
            height: '289px',
            marginLeft: 'auto',
            marginRight: '0',
            marginBottom: '12px'
          }}
        />

        {/* Founder Text - Right aligned */}
        <div style={{ 
          width: '884px',
          marginLeft: 'auto',
          marginRight: '0',
          marginBottom: '259px'
        }}>
          <p className="text-[#888888] text-[24px] leading-[32px] text-left" style={{ fontFamily: '"Poppins", sans-serif' }}
            dangerouslySetInnerHTML={getMarkdownHTML(t('whyKayan.founderText'))}
          />
        </div>

        {/* First Text Block - Full width */}
        <div style={{ 
          width: '100%',
          maxWidth: '995px',
          marginBottom: '66px'
        }}>
          <p className="text-[#888888] text-[24px] leading-[32px] text-left mb-6" style={{ fontFamily: '"Poppins", sans-serif' }}
            dangerouslySetInnerHTML={getMarkdownHTML(t('whyKayan.philosophy1'))}
          />
          
          <p className="text-[#888888] text-[24px] leading-[32px] text-left" style={{ fontFamily: '"Poppins", sans-serif' }}
            dangerouslySetInnerHTML={getMarkdownHTML(t('whyKayan.philosophy2'))}
          />
        </div>

        {/* Second Text Block - Full width */}
        <div style={{ 
          width: '100%',
          maxWidth: '995px',
          margin: '0 auto'
        }}>
            <p className="text-[#888888] text-[24px] leading-[32px] text-left mb-6" style={{ fontFamily: '"Poppins", sans-serif' }}
              dangerouslySetInnerHTML={getMarkdownHTML(t('whyKayan.experience1'))}
            />
            
          <p className="text-[#888888] text-[24px] leading-[32px] text-left" style={{ fontFamily: '"Poppins", sans-serif' }}
            dangerouslySetInnerHTML={getMarkdownHTML(t('whyKayan.experience2'))}
          />
        </div>
      </div>

      {/* Mobile Content Container - Optimized for responsive best practices */}
      <section className="lg:hidden flex flex-col items-center justify-center w-full min-h-screen py-8 px-4 sm:px-6 md:px-8 gap-8 sm:gap-10 md:gap-12">
        {/* Why heading - Mobile version with larger fluid typography */}
        <header className="text-center">
          <h1 
            className="font-medium text-[#2c2c2b] leading-tight tracking-tight"
            style={{
              fontSize: 'clamp(4.5rem, 16vw, 7rem)',
              letterSpacing: 'clamp(-1.5px, -0.2vw, -1.2px)',
              fontFamily: '"Poppins", sans-serif'
            }}
          >
            {t('whyKayan.title')}
          </h1>
        </header>
        
        {/* KayanLive Logo - Mobile version with larger size */}
        <div className="flex justify-center w-full max-w-sm">
          <Image 
            src={kayanLogo}
            alt="KayanLive Logo" 
            className="w-full h-auto max-w-[320px] object-contain"
            priority
            width={320}
            height={107}
            style={{ aspectRatio: '267/89' }}
          />
        </div>
        
        {/* Content Section with proper semantic structure */}
        <article className="w-full max-w-lg space-y-6 text-center">
          {/* Founder introduction */}
          <section>
            <h2 className="sr-only">Company Foundation</h2>
            <p 
              className="text-[#555555] leading-relaxed"
              style={{
                fontSize: 'clamp(0.875rem, 3vw, 1rem)',
                lineHeight: 'clamp(1.4, 4vw, 1.6)',
                maxWidth: '45ch',
                margin: '0 auto',
                fontFamily: '"Poppins", sans-serif'
              }}
              dangerouslySetInnerHTML={getMarkdownHTML(t('whyKayan.founderText'))}
            />
          </section>
          
          {/* Company philosophy */}
          <section>
            <h2 className="sr-only">Our Philosophy</h2>
            <div className="space-y-4">
              <p 
                className="text-[#555555] leading-relaxed"
                style={{
                  fontSize: 'clamp(0.875rem, 3vw, 1rem)',
                  lineHeight: 'clamp(1.4, 4vw, 1.6)',
                  maxWidth: '50ch',
                  margin: '0 auto',
                  fontFamily: '"Poppins", sans-serif'
                }}
                dangerouslySetInnerHTML={getMarkdownHTML(t('whyKayan.philosophy1'))}
              />
              
              <p 
                className="text-[#555555] leading-relaxed"
                style={{
                  fontSize: 'clamp(0.875rem, 3vw, 1rem)',
                  lineHeight: 'clamp(1.4, 4vw, 1.6)',
                  maxWidth: '50ch',
                  margin: '0 auto',
                  fontFamily: '"Poppins", sans-serif'
                }}
                dangerouslySetInnerHTML={getMarkdownHTML(t('whyKayan.philosophy2'))}
              />
            </div>
          </section>
          
          {/* Company experience and approach */}
          <section>
            <h2 className="sr-only">Our Experience</h2>
            <div className="space-y-4">
              <p 
                className="text-[#555555] leading-relaxed"
                style={{
                  fontSize: 'clamp(0.875rem, 3vw, 1rem)',
                  lineHeight: 'clamp(1.4, 4vw, 1.6)',
                  maxWidth: '50ch',
                  margin: '0 auto',
                  fontFamily: '"Poppins", sans-serif'
                }}
                dangerouslySetInnerHTML={getMarkdownHTML(t('whyKayan.experience1'))}
              />
              
              <p 
                className="text-[#555555] leading-relaxed"
                style={{
                  fontSize: 'clamp(0.875rem, 3vw, 1rem)',
                  lineHeight: 'clamp(1.4, 4vw, 1.6)',
                  maxWidth: '50ch',
                  margin: '0 auto',
                  fontFamily: '"Poppins", sans-serif'
                }}
                dangerouslySetInnerHTML={getMarkdownHTML(t('whyKayan.experience2'))}
              />
            </div>
          </section>
        </article>
      </section>
    </div>
  );
}