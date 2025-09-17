'use client';

import { useState, useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';

const imgOutline1 = "/assets/1349ad630f81a3bb2a509dd8abfe0e4ef85fa329.png";

export default function AboutHero() {
  const t = useTranslations('about.hero');
  const [isLoaded, setIsLoaded] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      {
        threshold: 0.1,
        rootMargin: '100px 0px -50px 0px'
      }
    );

    const currentSection = sectionRef.current;
    if (currentSection) {
      observer.observe(currentSection);
    }

    return () => {
      if (currentSection) {
        observer.unobserve(currentSection);
      }
    };
  }, []);


  return (
    <section
      ref={sectionRef}
      className="relative bg-[#2c2c2b] overflow-hidden rounded-[25px] md:rounded-[43px] lg:rounded-[61px] w-full"
      style={{ aspectRatio: '375/500' }}
      aria-label="About KayanLive hero section"
    >
      <style>{`
        @keyframes fadeUp {
          from {
            opacity: 0;
            transform: translateY(40px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeUpDesktop {
          from {
            opacity: 0;
            transform: translateY(40px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes floatGentle {
          0%, 100% {
            filter: brightness(1);
            margin-top: 0px;
          }
          50% {
            filter: brightness(1.05);
            margin-top: -10px;
          }
        }

        @keyframes pulseGlow {
          0%, 100% {
            filter: brightness(1) contrast(1);
            opacity: 0.5;
          }
          50% {
            filter: brightness(1.1) contrast(1.1);
            opacity: 0.6;
          }
        }

        @keyframes pulseGlowDesktop {
          0%, 100% {
            transform: scale(1);
            filter: brightness(1);
          }
          50% {
            transform: scale(1.02);
            filter: brightness(1.1);
          }
        }

        @keyframes tooltipShow {
          from {
            opacity: 0;
            transform: translateX(-50%) translateY(-8px) scale(0.85);
          }
          to {
            opacity: 1;
            transform: translateX(-50%) translateY(-8px) scale(1);
          }
        }

        .animate-fade-up-1 {
          animation: fadeUp 0.8s ease-out 0.2s both;
        }

        .animate-fade-up-2 {
          animation: fadeUp 0.8s ease-out 0.4s both;
        }

        .animate-fade-up-3 {
          animation: fadeUp 0.8s ease-out 0.6s both;
        }

        .animate-fade-up-desktop-1 {
          animation: fadeUpDesktop 0.8s ease-out 0.2s both;
        }

        .animate-fade-up-desktop-2 {
          animation: fadeUpDesktop 0.8s ease-out 0.4s both;
        }

        .animate-fade-up-desktop-3 {
          animation: fadeUpDesktop 0.8s ease-out 0.6s both;
        }

        .animate-float-gentle {
          animation: floatGentle 4s ease-in-out infinite;
        }

        .animate-pulse-glow {
          animation: pulseGlow 3s ease-in-out infinite;
        }

        .animate-pulse-glow-desktop {
          animation: pulseGlowDesktop 3s ease-in-out infinite;
        }

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

        @media (min-width: 768px) {
          section {
            aspect-ratio: 768/600 !important;
          }
        }
        @media (min-width: 1024px) {
          section {
            aspect-ratio: 1512/955 !important;
          }
        }
      `}</style>

      {/* Loading state */}
      {!isLoaded && (
        <div className="absolute inset-0 animate-pulse bg-gray-700 rounded-[25px] md:rounded-[43px] lg:rounded-[61px]" />
      )}

      <div className={`relative h-full transition-opacity duration-500 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}>

        {/* Mobile/Tablet Content - Centered */}
        <div className="absolute inset-0 flex flex-col items-center justify-between lg:hidden z-10 py-8">
          <div></div>
          <div className="flex flex-col items-center">
            <header
              className={`text-center ${isVisible ? 'animate-fade-up-1' : 'opacity-0'}`}
              style={{
                width: "clamp(260px, 70vw, 380px)",
                fontSize: "clamp(60px, 11vw, 85px)",
                lineHeight: "clamp(52px, 9.5vw, 75px)",
                fontFamily: '"Poppins", sans-serif',
                background: 'linear-gradient(to right, #a095e1, #74cfaa)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                marginBottom: "clamp(20px, 4vw, 30px)",
                paddingLeft: "clamp(16px, 4vw, 20px)",
                paddingRight: "clamp(16px, 4vw, 20px)"
              }}
            >
              <h1>{t('title')}</h1>
            </header>

            <div
              className={`text-center ${isVisible ? 'animate-fade-up-2' : 'opacity-0'}`}
              style={{
                width: "clamp(300px, 85vw, 420px)",
                fontSize: "clamp(20px, 3.5vw, 32px)",
                lineHeight: "clamp(22px, 3.8vw, 34px)",
                fontFamily: '"Poppins", sans-serif',
                marginBottom: "clamp(25px, 5vw, 35px)",
                paddingLeft: "clamp(16px, 4vw, 24px)",
                paddingRight: "clamp(16px, 4vw, 24px)",
                textTransform: 'capitalize',
                overflow: 'visible'
              }}
            >
              <div style={{
                background: 'linear-gradient(to right, #a095e1, #74cfaa)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                wordWrap: 'break-word',
                overflowWrap: 'break-word',
                hyphens: 'auto'
              }}>
                {t('subtitle1')}
              </div>
              <div className="text-white" style={{ marginTop: "clamp(10px, 3vw, 20px)" }}>{t('subtitle2')}</div>
            </div>

            <div
              className={`text-[#b2b2b2] text-center ${isVisible ? 'animate-fade-up-3' : 'opacity-0'}`}
              style={{
                width: "clamp(280px, 75vw, 480px)",
                fontSize: "clamp(15px, 2.3vw, 18px)",
                lineHeight: "clamp(19px, 3vw, 24px)",
                fontFamily: '"Poppins", sans-serif',
                paddingLeft: "clamp(20px, 5vw, 24px)",
                paddingRight: "clamp(20px, 5vw, 24px)"
              }}
            >
              <div className="mb-4">
                {t.rich('paragraph1', {
                  marketStat: (chunks) => (
                    <span className="relative inline-block group cursor-help transition-all duration-200 hover:scale-105"
                      style={{
                        background: 'linear-gradient(135deg, #74cfaa, #a095e1)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text',
                        fontWeight: '600',
                        padding: '4px 8px',
                        borderRadius: '6px',
                        marginLeft: '2px',
                        marginRight: '2px',
                        fontSize: '1.05em',
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
              </div>
              <div>
                {t.rich('paragraph2', {
                  purchaseStat: (chunks) => (
                    <span className="relative inline-block group cursor-help transition-all duration-200 hover:scale-105"
                      style={{
                        background: 'linear-gradient(135deg, #74cfaa, #a095e1)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text',
                        fontWeight: '600',
                        padding: '4px 8px',
                        borderRadius: '6px',
                        marginLeft: '2px',
                        marginRight: '2px',
                        fontSize: '1.05em',
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
              </div>
            </div>
          </div>
          <div></div>
        </div>

        {/* Desktop Content - Left/Right Layout */}
        <div className="hidden lg:block">
          <header
            className={`absolute font-bold whitespace-nowrap z-10 ${isVisible ? 'animate-fade-up-desktop-1' : 'opacity-0'}`}
            style={{
              left: "4%",
              top: "7%",
              fontSize: "clamp(3.5vw, 9.9vw, 150px)",
              lineHeight: "0.93em",
              background: 'linear-gradient(to right, #a095e1, #74cfaa)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              fontFamily: '"Poppins", sans-serif'
            }}
          >
            <h1 className="sr-only">About KayanLive</h1>
            <span aria-hidden="true">{t('title')}</span>
          </header>

          <div
            className={`absolute text-right font-medium z-10 ${isVisible ? 'animate-fade-up-desktop-2' : 'opacity-0'}`}
            style={{
              right: "4%",
              top: "28%",
              width: "50%",
              fontSize: "clamp(1.8vw, 3.2vw, 48px)",
              lineHeight: "1.3em",
              fontFamily: '"Poppins", sans-serif',
              textTransform: 'capitalize'
            }}
          >
            <div style={{
              background: 'linear-gradient(to right, #a095e1, #74cfaa)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              display: 'block'
            }}>
              {t('subtitle1')}
            </div>
            <div className="text-white">{t('subtitle2')}</div>
          </div>

          <div
            className={`absolute text-[#cfcfcf] z-10 ${isVisible ? 'animate-fade-up-desktop-3' : 'opacity-0'}`}
            style={{
              left: "4%",
              top: "44%",
              width: "43.5%",
              fontSize: "clamp(0.8vw, 1.5vw, 22px)",
              lineHeight: "1.27em",
              fontFamily: '"Poppins", sans-serif'
            }}
          >
            <div className="mb-4">
              {t.rich('paragraph1', {
                marketStat: (chunks) => (
                  <span className="relative inline-block group cursor-help transition-all duration-200 hover:scale-105"
                    style={{
                      background: 'linear-gradient(135deg, #74cfaa, #a095e1)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text',
                      fontWeight: '600',
                      padding: '4px 8px',
                      borderRadius: '6px',
                      marginLeft: '2px',
                      marginRight: '2px',
                      fontSize: '1.05em',
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
            </div>
            <div>
              {t.rich('paragraph2', {
                purchaseStat: (chunks) => (
                  <span className="relative inline-block group cursor-help transition-all duration-200 hover:scale-105"
                    style={{
                      background: 'linear-gradient(135deg, #74cfaa, #a095e1)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text',
                      fontWeight: '600',
                      padding: '4px 8px',
                      borderRadius: '6px',
                      marginLeft: '2px',
                      marginRight: '2px',
                      fontSize: '1.05em',
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
            </div>
          </div>
        </div>

        {/* Decorative Elements - Mobile/Tablet */}
        <div
          className={`absolute opacity-50 lg:hidden ${isLoaded ? 'animate-float-gentle' : ''}`}
          style={{
            backgroundImage: `url('${imgOutline1}')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            height: 'clamp(180px, 25vw, 260px)',
            width: 'clamp(115px, 16vw, 170px)',
            right: 'clamp(-15px, -3vw, 15px)',
            top: 'clamp(-70px, -8vw, -40px)',
            zIndex: 1
          }}
          aria-hidden="true"
        />

        <div
          className={`absolute opacity-50 lg:hidden overflow-hidden ${isLoaded ? 'animate-pulse-glow' : ''}`}
          style={{
            backgroundImage: `url('${imgOutline1}')`,
            backgroundSize: 'cover',
            backgroundPosition: 'top center',
            backgroundRepeat: 'no-repeat',
            height: 'clamp(90px, 12vw, 130px)',
            width: 'clamp(115px, 16vw, 170px)',
            right: 'clamp(-25px, -6vw, 5px)',
            bottom: 'clamp(-15px, -2vw, 5px)',
            zIndex: 1
          }}
          aria-hidden="true"
        />

        {/* Decorative Elements - Desktop */}
        <div
          className={`absolute opacity-50 hidden lg:block ${isLoaded ? 'animate-pulse-glow-desktop' : ''}`}
          style={{
            backgroundImage: `url('${imgOutline1}')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            height: '49%',
            width: '20%',
            left: '64.5%',
            top: '-24.5%',
            transformOrigin: 'center',
            zIndex: 1
          }}
          aria-hidden="true"
        />

        <div
          className={`absolute opacity-50 hidden lg:block ${isLoaded ? 'animate-pulse-glow-desktop' : ''}`}
          style={{
            backgroundImage: `url('${imgOutline1}')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            height: '63%',
            width: '25.7%',
            left: '82%',
            bottom: '-31.5%',
            transformOrigin: 'center',
            zIndex: 1
          }}
          aria-hidden="true"
        />
      </div>

      {/* Screen reader skip link */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-white text-black px-4 py-2 rounded z-50"
      >
        {t('skipToContent')}
      </a>
    </section>
  );
}