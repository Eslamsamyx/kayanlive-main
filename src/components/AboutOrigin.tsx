'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';

const imgPattern0212 = "/assets/ef25fd14e49122ddd6cbc03c8a92caff93500eb7.png";

export default function AboutOrigin() {
  const t = useTranslations('about.origin');
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <section
      className="relative bg-[#f0f1fa] overflow-hidden w-full z-10 isolate"
      style={{ minHeight: 'fit-content' }}
      aria-label="About KayanLive origin and capability section"
    >
      <style>{`
        /* Tooltip specific styles */
        .group:hover .tooltip-content {
          opacity: 1 !important;
          transform: translateX(-50%) translateY(-4px) scale(1) !important;
          animation: tooltipShow 0.3s ease forwards;
        }

        /* Ensure higher z-index for tooltips */
        .tooltip-content {
          z-index: 9999 !important;
          position: absolute !important;
        }

        @keyframes tooltipShow {
          from {
            opacity: 0;
            transform: translateX(-50%) translateY(-8px) scale(0.85);
          }
          to {
            opacity: 1;
            transform: translateX(-50%) translateY(-4px) scale(1);
          }
        }
      `}</style>
      {/* Loading state */}
      {!isLoaded && (
        <div className="absolute inset-0 animate-pulse bg-gray-200" />
      )}
      
      {/* Mobile Layout */}
      <div className={`block lg:hidden py-8 md:py-16 pb-16 md:pb-24 transition-opacity duration-500 relative ${isLoaded ? 'opacity-100' : 'opacity-0'}`}>
        
        {/* Mobile Background Pattern 1 */}
        <div 
          className="absolute opacity-20"
          style={{
            backgroundImage: `url('${imgPattern0212}')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            height: '60%',
            width: '40%',
            left: '-30%',
            bottom: '10%'
          }}
          aria-hidden="true"
        />

        {/* Mobile Background Pattern 2 */}
        <div 
          className="absolute opacity-20"
          style={{
            height: '60%',
            width: '40%',
            right: '-25%',
            top: '10%',
            transform: 'rotate(90deg) scaleY(-100%)'
          }}
          aria-hidden="true"
        >
          <div 
            style={{
              backgroundImage: `url('${imgPattern0212}')`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
              height: '100%',
              width: '100%'
            }}
          />
        </div>

        {/* Mobile Content */}
        <div className="relative px-4 md:px-8 py-8 md:py-12 w-full">
          <div className="flex flex-col gap-8 md:gap-10 max-w-4xl mx-auto">

            {/* Mobile Card 1 */}
            <article className="bg-white/80 backdrop-blur-sm border border-[#74cfaa] rounded-[35px] p-6 md:p-8 relative z-10 w-full flex-shrink-0">
              <header className="mb-8">
                <h2
                  className="font-bold capitalize text-2xl md:text-3xl leading-tight"
                  style={{
                    background: 'linear-gradient(to right, #a095e1, #74cfaa)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    letterSpacing: '-0.5px',
                    fontFamily: '"Poppins", sans-serif'
                  }}
                >
                  {t('title1')}
                </h2>
              </header>

              <div
                className="text-[#808184] capitalize text-base leading-relaxed"
                style={{
                  fontFamily: '"Poppins", sans-serif'
                }}
              >
                <p className="mb-4">{t.rich('paragraph1', { strong: (chunks) => <span className="text-[#2c2c2b]">{chunks}</span> })}</p>
                <p className="mb-4">{t.rich('paragraph2', { strong: (chunks) => <span className="text-[#2c2c2b]">{chunks}</span> })}</p>
                <p className="mb-4">{t.rich('paragraph3', { strong: (chunks) => <span className="text-[#2c2c2b]">{chunks}</span> })}</p>
                <p className="mb-4">{t.rich('paragraph4', { strong: (chunks) => <span className="text-[#2c2c2b]">{chunks}</span> })}</p>
                <p>{t('paragraph5')}</p>
              </div>
            </article>

            {/* Mobile Card 2 */}
            <article className="bg-white/80 backdrop-blur-sm border border-[#74cfaa] rounded-[35px] p-6 md:p-8 relative z-20 w-full flex-shrink-0 mb-8 md:mb-12">
              <header className="mb-8">
                <h2
                  className="font-bold capitalize text-2xl md:text-3xl leading-tight"
                  style={{
                    background: 'linear-gradient(to right, #a095e1, #74cfaa)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    letterSpacing: '-0.5px',
                    fontFamily: '"Poppins", sans-serif'
                  }}
                >
                  {t('title2')}
                </h2>
              </header>

              <div
                className="text-[#808184] capitalize text-base leading-relaxed"
                style={{
                  fontFamily: '"Poppins", sans-serif'
                }}
              >
                <p className="mb-4">{t('paragraph6')}</p>
                <p className="mb-4">{t('paragraph7')}</p>
                <p className="mb-4">
                  {t.rich('statisticalText', {
                    roiStat: (chunks) => (
                      <span className="relative inline-block group cursor-help transition-all duration-200 hover:scale-105"
                        style={{
                          background: 'linear-gradient(135deg, #74cfaa, #a095e1)',
                          WebkitBackgroundClip: 'text',
                          WebkitTextFillColor: 'transparent',
                          backgroundClip: 'text',
                          fontWeight: '600',
                          padding: '2px 4px',
                          borderRadius: '4px',
                          marginLeft: '1px',
                          marginRight: '1px',
                          fontSize: '1.02em',
                          filter: 'brightness(1.1)',
                          position: 'relative'
                        }}>
                        {chunks}
                      </span>
                    ),
                    citation: (chunks) => (
                      <span className="text-xs text-gray-400">{chunks}</span>
                    )
                  })}
                </p>
                <p className="mb-4 text-[#2c2c2b]">{t('paragraph8')}</p>
                <p>{t.rich('paragraph9', { strong: (chunks) => <span className="text-[#2c2c2b]">{chunks}</span> })}</p>
              </div>
            </article>

            {/* Clearfix to ensure proper containment */}
            <div className="clear-both"></div>

          </div>
        </div>
      </div>

      {/* Desktop Layout - Original Design */}
      <div className={`hidden lg:block relative transition-opacity duration-500 ${isLoaded ? 'opacity-100' : 'opacity-0'}`} style={{ aspectRatio: '1512/960', height: 'auto' }}>
        
        {/* Desktop Background Pattern 1 - Bottom Left */}
        <div 
          className="absolute opacity-40"
          style={{
            backgroundImage: `url('${imgPattern0212}')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            height: '92%', // 884px / 960px = 92%
            width: '59%', // 894px / 1512px = 59%
            left: '-39%', // Original positioning
            bottom: '-50%' // Original positioning
          }}
          aria-hidden="true"
        />

        {/* Desktop Background Pattern 2 - Bottom Right (rotated) */}
        <div 
          className="absolute opacity-40"
          style={{
            height: '102%', // 978px / 960px = 102%
            width: '64%', // 967px / 1512px = 64%
            right: '-18%', // Original positioning
            bottom: '-58%', // Original positioning
            transform: 'rotate(90deg) scaleY(-100%)'
          }}
          aria-hidden="true"
        >
          <div 
            style={{
              backgroundImage: `url('${imgPattern0212}')`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
              height: '100%',
              width: '100%'
            }}
          />
        </div>

        {/* Desktop Content - Original Absolute Positioning */}
        <div className="absolute inset-0 flex items-center justify-center px-4">
          <div className="flex gap-6 max-w-7xl w-full">
            
            {/* Desktop Card 1 */}
            <article className="bg-white/60 backdrop-blur-sm border border-[#74cfaa] rounded-[35px] p-16 flex-1 relative">
              <header className="mb-11">
                <h2 
                  className="font-bold capitalize"
                  style={{
                    fontSize: "clamp(24px, 2.8vw, 42px)",
                    lineHeight: "1.36em",
                    background: 'linear-gradient(to right, #a095e1, #74cfaa)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    letterSpacing: '-1px',
                    fontFamily: '"Poppins", sans-serif'
                  }}
                >
                  {t('title1')}
                </h2>
              </header>
              
              <div
                className="text-[#808184] capitalize"
                style={{
                  fontSize: "clamp(14px, 1.45vw, 22px)",
                  lineHeight: "1.27em",
                  fontFamily: '"Poppins", sans-serif'
                }}
              >
                <p className="mb-0">{t.rich('paragraph1', { strong: (chunks) => <span className="text-[#2c2c2b]">{chunks}</span> })}</p>
                <p className="mb-0">&nbsp;</p>
                <p className="mb-0">{t.rich('paragraph2', { strong: (chunks) => <span className="text-[#2c2c2b]">{chunks}</span> })}</p>
                <p className="mb-0">{t.rich('paragraph3', { strong: (chunks) => <span className="text-[#2c2c2b]">{chunks}</span> })}</p>
                <p className="mb-0">&nbsp;</p>
                <p className="mb-0">{t.rich('paragraph4', { strong: (chunks) => <span className="text-[#2c2c2b]">{chunks}</span> })}</p>
                <p>{t('paragraph5')}</p>
              </div>
            </article>

            {/* Desktop Card 2 */}
            <article className="bg-white/60 backdrop-blur-sm border border-[#74cfaa] rounded-[35px] p-16 flex-1 relative">
              <header className="mb-11">
                <h2 
                  className="font-bold capitalize"
                  style={{
                    fontSize: "clamp(24px, 2.8vw, 42px)",
                    lineHeight: "1.04em",
                    background: 'linear-gradient(to right, #a095e1, #74cfaa)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    letterSpacing: '-1px',
                    fontFamily: '"Poppins", sans-serif'
                  }}
                >
                  {t('title2')}
                </h2>
              </header>
              
              <div
                className="text-[#808184] capitalize"
                style={{
                  fontSize: "clamp(14px, 1.45vw, 22px)",
                  lineHeight: "1.27em",
                  fontFamily: '"Poppins", sans-serif'
                }}
              >
                <p className="mb-0">{t('paragraph6')}</p>
                <p className="mb-0">&nbsp;</p>
                <p className="mb-0">{t('paragraph7')}</p>
                <p className="mb-0">
                  {t.rich('statisticalText', {
                    roiStat: (chunks) => (
                      <span className="relative inline-block group cursor-help transition-all duration-200 hover:scale-105"
                        style={{
                          background: 'linear-gradient(135deg, #74cfaa, #a095e1)',
                          WebkitBackgroundClip: 'text',
                          WebkitTextFillColor: 'transparent',
                          backgroundClip: 'text',
                          fontWeight: '600',
                          padding: '2px 4px',
                          borderRadius: '4px',
                          marginLeft: '1px',
                          marginRight: '1px',
                          fontSize: '1.02em',
                          filter: 'brightness(1.1)',
                          position: 'relative'
                        }}>
                        {chunks}
                      </span>
                    ),
                    citation: (chunks) => (
                      <span className="text-xs text-gray-400">{chunks}</span>
                    )
                  })}
                </p>
                <p className="mb-0">&nbsp;</p>
                <p className="mb-0 text-[#2c2c2b]">{t('paragraph8')}</p>
                <p>{t.rich('paragraph9', { strong: (chunks) => <span className="text-[#2c2c2b]">{chunks}</span> })}</p>
              </div>
            </article>

          </div>
        </div>
      </div>

      {/* Screen reader skip link for accessibility */}
      <a 
        href="#next-section" 
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-white text-black px-4 py-2 rounded z-50"
      >
        {t('skipToNext')}
      </a>
    </section>
  );
}