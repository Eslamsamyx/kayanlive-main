'use client';

import React, { useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { getMarkdownHTML } from '@/utils/markdownUtils';
import AnimatedServiceContent from './AnimatedServiceContent';
import CTAButton from './CTAButton';

// Custom CSS animations for entrance effects
const animationStyles = `
  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(2rem);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes slideInLeft {
    from {
      opacity: 0;
      transform: translateX(-4rem);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }

  @keyframes slideInRight {
    from {
      opacity: 0;
      transform: translateX(4rem);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }

  .animate-fade-in {
    animation: fadeInUp 0.6s ease-out forwards;
  }

  .pipeline-card {
    opacity: 0;
    transform: translateX(-4rem);
  }

  .pipeline-card.slide-in-left {
    animation: slideInLeft 0.8s ease-out forwards;
  }

  .pipeline-card.slide-in-right {
    animation: slideInRight 0.8s ease-out forwards;
    transform: translateX(4rem);
  }
`;

const imgEventPhoto = "/assets/29064c5a0d86395e45b642fe4e6daf670490f723.png";
const imgKayanLogo = "/assets/823c27de600ccd2f92af3e073c8e10df3a192e5c.png";

export default function AboutServices() {
  const t = useTranslations();
  const locale = useLocale();

  // Get animation direction based on card index and screen size
  const getAnimationDirection = (index: number) => {
    if (typeof window === 'undefined') return 'slide-in-left';

    const width = window.innerWidth;
    const isMobile = width < 768; // md breakpoint
    const isTablet = width >= 768 && width < 1024; // lg breakpoint

    let row: number;
    if (isMobile) {
      // Mobile: each card is its own row
      row = index;
    } else if (isTablet) {
      // Tablet: 2 cards per row
      row = Math.floor(index / 2);
    } else {
      // Desktop: 3 cards per row
      row = Math.floor(index / 3);
    }

    // Alternate direction for each row
    return row % 2 === 0 ? 'slide-in-left' : 'slide-in-right';
  };

  // Set up intersection observer for scroll animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const cardIndex = parseInt(entry.target.getAttribute('data-card-index') || '0');
            const direction = getAnimationDirection(cardIndex);

            // Add animation with staggered delay
            setTimeout(() => {
              entry.target.classList.add(direction);
            }, cardIndex * 100); // 100ms delay between cards
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px' // Trigger slightly before coming into view
      }
    );

    // Observe all pipeline cards
    const cards = document.querySelectorAll('.pipeline-card');
    cards.forEach((card) => observer.observe(card));

    return () => observer.disconnect();
  }, []);

  return (
    <div className="bg-[#f3f3f3] w-full py-12 sm:py-16 md:py-20">
      {/* Inject custom CSS animations */}
      <style jsx>{animationStyles}</style>

      <div className="max-w-[1600px] mx-auto px-4 sm:px-8 md:px-12 lg:px-20">
        {/* Section Title */}
        <div className="text-center mb-12 md:mb-16 lg:mb-20">
          <h2
            className="text-[#2c2c2b] font-bold mb-8"
            style={{
              fontSize: 'clamp(32px, 6vw, 64px)',
              lineHeight: 'clamp(40px, 7vw, 72px)',
              letterSpacing: 'clamp(-1px, -0.15vw, -2px)'
            }}
          >
            {t('aboutServices.title')}
          </h2>
        </div>

        {/* Content Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12 md:mb-16 lg:mb-20">

          {/* Card 1 - Market Position */}
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300">
            <div className="flex items-start space-x-4 mb-6">
              <div className="w-12 h-12 bg-gradient-to-r from-[#74cfaa] to-[#a095e1] rounded-2xl flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H3m2 0h4M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-[#2c2c2b] font-semibold text-lg mb-3">{t('aboutServices.cards.marketLeadership')}</h3>
                <p
                  className="text-[#666666] leading-relaxed"
                  style={{ fontSize: 'clamp(16px, 2vw, 18px)', lineHeight: 'clamp(22px, 2.8vw, 26px)' }}
                  dangerouslySetInnerHTML={getMarkdownHTML(t('aboutServices.description1'))}
                />
              </div>
            </div>
          </div>

          {/* Card 2 - Technology & Innovation */}
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300">
            <div className="flex items-start space-x-4 mb-6">
              <div className="w-12 h-12 bg-gradient-to-r from-[#a095e1] to-[#74cfaa] rounded-2xl flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-[#2c2c2b] font-semibold text-lg mb-3">{t('aboutServices.cards.techInnovation')}</h3>
                <p
                  className="text-[#666666] leading-relaxed"
                  style={{ fontSize: 'clamp(16px, 2vw, 18px)', lineHeight: 'clamp(22px, 2.8vw, 26px)' }}
                  dangerouslySetInnerHTML={getMarkdownHTML(t('aboutServices.description2'))}
                />
              </div>
            </div>
          </div>

          {/* Card 3 - Regional Presence */}
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300">
            <div className="flex items-start space-x-4 mb-6">
              <div className="w-12 h-12 bg-gradient-to-r from-[#74cfaa] to-[#a095e1] rounded-2xl flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-[#2c2c2b] font-semibold text-lg mb-3">{t('aboutServices.cards.regionalExcellence')}</h3>
                <p
                  className="text-[#666666] leading-relaxed"
                  style={{ fontSize: 'clamp(16px, 2vw, 18px)', lineHeight: 'clamp(22px, 2.8vw, 26px)' }}
                  dangerouslySetInnerHTML={getMarkdownHTML(t('aboutServices.description3'))}
                />
              </div>
            </div>
          </div>

          {/* Card 4 - Execution Excellence */}
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300">
            <div className="flex items-start space-x-4 mb-6">
              <div className="w-12 h-12 bg-gradient-to-r from-[#a095e1] to-[#74cfaa] rounded-2xl flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-[#2c2c2b] font-semibold text-lg mb-3">{t('aboutServices.cards.swiftExecution')}</h3>
                <p
                  className="text-[#666666] leading-relaxed"
                  style={{ fontSize: 'clamp(16px, 2vw, 18px)', lineHeight: 'clamp(22px, 2.8vw, 26px)' }}
                  dangerouslySetInnerHTML={getMarkdownHTML(t('aboutServices.description4'))}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Highlight Card */}
        <div className="bg-gradient-to-r from-[#74cfaa] to-[#a095e1] rounded-3xl p-8 md:p-12 text-center mb-12 md:mb-16 lg:mb-20">
          <div className="max-w-4xl mx-auto">
            <div className="w-16 h-16 bg-white/20 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
            <h3
              className="text-white font-bold mb-4"
              style={{
                fontSize: 'clamp(20px, 3vw, 28px)',
                lineHeight: 'clamp(26px, 3.5vw, 36px)'
              }}
            >
              {t('aboutServices.whyChoose')}
            </h3>
            <p
              className="text-white/90 leading-relaxed mb-8"
              style={{ fontSize: 'clamp(16px, 2vw, 20px)', lineHeight: 'clamp(22px, 2.8vw, 28px)' }}
              dangerouslySetInnerHTML={getMarkdownHTML(t('aboutServices.description5'))}
            />
            <div className="flex justify-center">
              <a href={`/${locale}/contact`}>
                <CTAButton
                  variant="white"
                  ariaLabel={t('common.contactUs')}
                >
                  {t('common.contactUs')}
                </CTAButton>
              </a>
            </div>
          </div>
        </div>

        {/* Service Pipeline Section */}
        <div className="mb-12 md:mb-16 lg:mb-20">
          {/* Pipeline Title */}
          <div className="text-center mb-16 relative">
            {/* Background decorative elements */}
            <div className="absolute inset-0 flex items-center justify-center opacity-5">
              <div className="w-32 h-32 bg-gradient-to-r from-[#74cfaa] to-[#a095e1] rounded-full blur-3xl"></div>
            </div>

            {/* Title with gradient background */}
            <div className="relative inline-block">
              <div className="bg-gradient-to-r from-[#74cfaa]/10 to-[#a095e1]/10 rounded-2xl px-8 py-6 backdrop-blur-sm border border-[#74cfaa]/20">
                <div className="flex items-center justify-center space-x-4 mb-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-[#74cfaa] to-[#a095e1] rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                    </svg>
                  </div>
                  <span className="text-[#74cfaa] font-semibold text-sm tracking-wider uppercase">
                    {t('aboutServices.servicesLabel')}
                  </span>
                </div>

                <h3 className="text-[#2c2c2b] font-bold leading-tight">
                  <span
                    style={{
                      fontSize: 'clamp(28px, 5vw, 56px)',
                      lineHeight: 'clamp(36px, 6vw, 64px)',
                      letterSpacing: 'clamp(-0.8px, -0.15vw, -1.5px)'
                    }}
                  >
                    {t('aboutServices.pipelineTitle').split(' ')[0]}{'-'}{t('aboutServices.pipelineTitle').split(' ')[1]}{' '}
                  </span>
                  <span
                    className="bg-gradient-to-r from-[#74cfaa] to-[#a095e1] bg-clip-text text-transparent"
                    style={{
                      fontSize: 'clamp(28px, 5vw, 56px)',
                      lineHeight: 'clamp(36px, 6vw, 64px)',
                      letterSpacing: 'clamp(-0.8px, -0.15vw, -1.5px)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent'
                    }}
                  >
                    {t('aboutServices.pipelineTitle').split(' ')[2]}
                  </span>
                  <br />
                  <span
                    style={{
                      fontSize: 'clamp(28px, 5vw, 56px)',
                      lineHeight: 'clamp(36px, 6vw, 64px)',
                      letterSpacing: 'clamp(-0.8px, -0.15vw, -1.5px)'
                    }}
                  >
                    {t('aboutServices.pipelineTitle').split(' ').slice(3).join(' ')}
                  </span>
                </h3>

                {/* Decorative underline */}
                <div className="flex justify-center mt-4">
                  <div className="w-24 h-1 bg-gradient-to-r from-[#74cfaa] to-[#a095e1] rounded-full"></div>
                </div>
              </div>

              {/* Floating accent elements */}
              <div className="absolute -top-2 -right-2 w-4 h-4 bg-[#a095e1] rounded-full opacity-60"></div>
              <div className="absolute -bottom-2 -left-2 w-6 h-6 bg-[#74cfaa] rounded-full opacity-40"></div>
            </div>
          </div>

          {/* Services Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">

            {/* Featured Visual Showcase Card - First Position */}
            <div className="pipeline-card" data-card-index="0">
              <a href={`/${locale}/contact`} className="block h-full cursor-pointer">
                <div className="group relative bg-gradient-to-br from-[#7afdd6] to-[#74cfaa] rounded-3xl overflow-hidden h-full md:col-span-2 lg:col-span-1 min-h-[400px] shadow-xl hover:shadow-2xl transition-shadow duration-500">
                  <AnimatedServiceContent isImage={true} className="absolute inset-0">
                    <div
                      className="w-full h-full bg-center bg-cover bg-no-repeat group-hover:scale-105 transition-transform duration-700"
                      style={{
                        backgroundImage: `url('${imgEventPhoto}')`,
                        backgroundPosition: 'center center',
                        backgroundSize: 'cover'
                      }}
                    />
                  </AnimatedServiceContent>

                  {/* Enhanced glassmorphism overlay */}
                  <div className="absolute inset-0 bg-gradient-to-br from-black/20 to-transparent group-hover:from-black/30 transition-all duration-500"></div>

                  {/* Perfectly centered diamond logo container */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="flex items-center justify-center">
                      {/* Diamond container with perfect centering */}
                      <div
                        className="relative group-hover:scale-110 transition-transform duration-500 flex items-center justify-center"
                        style={{
                          width: 'clamp(200px, 35vw, 300px)',
                          height: 'clamp(200px, 35vw, 300px)',
                          transform: 'rotate(-45deg)'
                        }}
                      >
                        <div
                          className="flex items-center justify-center relative overflow-hidden bg-white/20 backdrop-blur-xl border border-white/30 shadow-2xl group-hover:bg-white/30 transition-all duration-500"
                          style={{
                            width: 'clamp(150px, 25vw, 220px)',
                            height: 'clamp(150px, 25vw, 220px)',
                            borderRadius: '24px'
                          }}
                        >
                          <div
                            className="bg-center bg-contain bg-no-repeat relative z-10 group-hover:scale-110 transition-transform duration-300"
                            style={{
                              backgroundImage: `url('${imgKayanLogo}')`,
                              width: 'clamp(120px, 20vw, 180px)',
                              height: 'clamp(40px, 7vw, 60px)',
                              transform: 'rotate(45deg)',
                              filter: 'brightness(1.2) contrast(1.1)'
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </a>
            </div>

            {/* Live Events & Shows */}
            <div className="pipeline-card" data-card-index="1">
              <div className="group relative bg-white rounded-3xl p-8 border border-gray-100 hover:border-[#74cfaa]/30 transition-all duration-500 h-full hover:shadow-xl hover:shadow-[#74cfaa]/10 overflow-hidden">
                {/* Decorative background elements */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#74cfaa]/5 to-[#a095e1]/5 rounded-full -translate-y-16 translate-x-16 group-hover:scale-150 transition-transform duration-700"></div>

                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-4">
                      <div className="w-16 h-16 bg-gradient-to-br from-[#74cfaa] to-[#a095e1] rounded-2xl flex items-center justify-center shadow-lg shadow-[#74cfaa]/25 group-hover:scale-110 transition-transform duration-300 flex-shrink-0">
                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2m0 0V1h4a2 2 0 012 2v18a2 2 0 01-2 2H4a2 2 0 01-2-2V3a2 2 0 012-2h4v3"></path>
                        </svg>
                      </div>
                      <h4 className="text-[#2c2c2b] font-bold text-xl leading-tight group-hover:text-[#74cfaa] transition-colors duration-300">
                        {t('aboutServices.services.liveEvents.title')}
                      </h4>
                    </div>
                    <div className="w-2 h-2 bg-[#74cfaa] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </div>

                  <p className="text-[#666666] text-base leading-relaxed mb-6">
                    {t('aboutServices.services.liveEvents.description')}
                  </p>

                  <div className="pt-4 border-t border-gray-100">
                    <p
                      className="text-[#74cfaa] text-sm font-semibold"
                      dangerouslySetInnerHTML={getMarkdownHTML(t('aboutServices.services.liveEvents.idealFor'))}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Conferences & Summits */}
            <div className="pipeline-card" data-card-index="2">
              <div className="group relative bg-white rounded-3xl p-8 border border-gray-100 hover:border-[#a095e1]/30 transition-all duration-500 h-full hover:shadow-xl hover:shadow-[#a095e1]/10 overflow-hidden">
                {/* Decorative background elements */}
                <div className="absolute top-0 left-0 w-28 h-28 bg-gradient-to-br from-[#a095e1]/5 to-[#74cfaa]/5 rounded-full -translate-y-14 -translate-x-14 group-hover:scale-150 transition-transform duration-700"></div>

                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-4">
                      <div className="w-16 h-16 bg-gradient-to-br from-[#a095e1] to-[#74cfaa] rounded-2xl flex items-center justify-center shadow-lg shadow-[#a095e1]/25 group-hover:scale-110 transition-transform duration-300 flex-shrink-0">
                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                        </svg>
                      </div>
                      <h4 className="text-[#2c2c2b] font-bold text-xl leading-tight group-hover:text-[#a095e1] transition-colors duration-300">
                        {t('aboutServices.services.conferences.title')}
                      </h4>
                    </div>
                    <div className="w-2 h-2 bg-[#a095e1] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </div>

                  <p className="text-[#666666] text-base leading-relaxed mb-6">
                    {t('aboutServices.services.conferences.description')}
                  </p>

                  <div className="pt-4 border-t border-gray-100">
                    <p
                      className="text-[#a095e1] text-sm font-semibold"
                      dangerouslySetInnerHTML={getMarkdownHTML(t('aboutServices.services.conferences.idealFor'))}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Exhibitions & Brand Experiences */}
            <div className="pipeline-card" data-card-index="3">
              <div className="group relative bg-white rounded-3xl p-8 border border-gray-100 hover:border-[#74cfaa]/30 transition-all duration-500 h-full hover:shadow-xl hover:shadow-[#74cfaa]/10 overflow-hidden">
                {/* Decorative background elements */}
                <div className="absolute bottom-0 right-0 w-24 h-24 bg-gradient-to-br from-[#74cfaa]/5 to-[#a095e1]/5 rounded-full translate-y-12 translate-x-12 group-hover:scale-150 transition-transform duration-700"></div>

                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-4">
                      <div className="w-16 h-16 bg-gradient-to-br from-[#74cfaa] to-[#a095e1] rounded-2xl flex items-center justify-center shadow-lg shadow-[#74cfaa]/25 group-hover:scale-110 transition-transform duration-300 flex-shrink-0">
                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H3m2 0h4M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                        </svg>
                      </div>
                      <h4 className="text-[#2c2c2b] font-bold text-xl leading-tight group-hover:text-[#74cfaa] transition-colors duration-300">
                        {t('aboutServices.services.exhibitions.title')}
                      </h4>
                    </div>
                    <div className="w-2 h-2 bg-[#74cfaa] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </div>

                  <p className="text-[#666666] text-base leading-relaxed mb-6">
                    {t('aboutServices.services.exhibitions.description')}
                  </p>

                  <div className="pt-4 border-t border-gray-100">
                    <p
                      className="text-[#74cfaa] text-sm font-semibold"
                      dangerouslySetInnerHTML={getMarkdownHTML(t('aboutServices.services.exhibitions.idealFor'))}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Immersive AV & Tech */}
            <div className="pipeline-card" data-card-index="4">
              <div className="group relative bg-white rounded-3xl p-8 border border-gray-100 hover:border-[#a095e1]/30 transition-all duration-500 h-full hover:shadow-xl hover:shadow-[#a095e1]/10 overflow-hidden">
                {/* Decorative background elements */}
                <div className="absolute bottom-0 left-0 w-36 h-36 bg-gradient-to-br from-[#a095e1]/5 to-[#74cfaa]/5 rounded-full translate-y-18 -translate-x-18 group-hover:scale-150 transition-transform duration-700"></div>

                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-4">
                      <div className="w-16 h-16 bg-gradient-to-br from-[#a095e1] to-[#74cfaa] rounded-2xl flex items-center justify-center shadow-lg shadow-[#a095e1]/25 group-hover:scale-110 transition-transform duration-300 flex-shrink-0">
                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                        </svg>
                      </div>
                      <h4 className="text-[#2c2c2b] font-bold text-xl leading-tight group-hover:text-[#a095e1] transition-colors duration-300">
                        {t('aboutServices.services.immersiveAV.title')}
                      </h4>
                    </div>
                    <div className="w-2 h-2 bg-[#a095e1] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </div>

                  <p className="text-[#666666] text-base leading-relaxed mb-6">
                    {t('aboutServices.services.immersiveAV.description')}
                  </p>

                  <div className="pt-4 border-t border-gray-100">
                    <p
                      className="text-[#a095e1] text-sm font-semibold"
                      dangerouslySetInnerHTML={getMarkdownHTML(t('aboutServices.services.immersiveAV.idealFor'))}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Last-Call Event Rescue - Premium Featured Card */}
            <div className="pipeline-card" data-card-index="5">
              <div className="group relative bg-gradient-to-br from-[#74cfaa] via-[#8bb4d1] to-[#a095e1] rounded-3xl p-8 text-white h-full md:col-span-2 lg:col-span-1 overflow-hidden shadow-2xl shadow-[#74cfaa]/20">
                {/* Animated background effects */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-20 translate-x-20 group-hover:scale-125 transition-transform duration-700"></div>

                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-18 h-18 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-lg group-hover:bg-white/30 group-hover:scale-110 transition-all duration-300">
                      <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                      </svg>
                    </div>
                    <div className="flex space-x-2">
                      <div className="w-2 h-2 bg-white/60 rounded-full"></div>
                      <div className="w-2 h-2 bg-white/40 rounded-full"></div>
                      <div className="w-2 h-2 bg-white/60 rounded-full"></div>
                    </div>
                  </div>

                  <div className="inline-flex items-center px-3 py-1 bg-white/20 rounded-full text-xs font-semibold mb-4 backdrop-blur-sm">
                    <span>⚡ {t('aboutServices.emergencyResponse')}</span>
                  </div>

                  <h4 className="text-white font-bold text-2xl mb-4 leading-tight">
                    {t('aboutServices.services.eventRescue.title')}
                  </h4>

                  <p className="text-white/90 text-base leading-relaxed mb-6">
                    {t('aboutServices.services.eventRescue.description')}
                  </p>

                  <div className="pt-4 border-t border-white/20">
                    <p
                      className="text-white font-bold text-sm"
                      dangerouslySetInnerHTML={getMarkdownHTML(t('aboutServices.services.eventRescue.idealFor'))}
                    />
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* How We Work Pipeline Section */}
        <div className="mb-12 md:mb-16 lg:mb-20">
          {/* Section Title */}
          <div className="text-center mb-12 md:mb-16">
            {/* Modern Glassmorphism Container */}
            <div className="relative inline-block">
              <div className="relative overflow-hidden bg-gradient-to-r from-[#74cfaa]/5 to-[#a095e1]/5 rounded-3xl backdrop-blur-sm border border-[#74cfaa]/20 px-12 py-10 shadow-xl">
                {/* Background Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>

                {/* Floating Decorative Elements */}
                <div className="absolute -top-3 -left-3 w-6 h-6 bg-gradient-to-r from-[#74cfaa] to-[#a095e1] rounded-full opacity-20 animate-pulse"></div>
                <div className="absolute -bottom-2 -right-4 w-4 h-4 bg-[#a095e1] rounded-full opacity-30"></div>
                <div className="absolute top-1/2 -right-2 w-3 h-3 bg-[#74cfaa] rounded-full opacity-40"></div>

                {/* Content Container */}
                <div className="relative z-10">
                  {/* Enhanced Badge with Animation */}
                  <div
                    className="mb-6 opacity-0 translate-y-8 animate-fade-in"
                    style={{ animationDelay: '0.1s', animationFillMode: 'forwards' }}
                  >
                    <div className="inline-flex items-center justify-center space-x-4 bg-white/20 backdrop-blur-sm rounded-2xl px-6 py-3 border border-white/30">
                      <div className="w-12 h-12 bg-gradient-to-r from-[#74cfaa] to-[#a095e1] rounded-xl flex items-center justify-center shadow-lg">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                        </svg>
                      </div>
                      <span className="text-[#74cfaa] font-bold text-base tracking-wider uppercase">
                        {t('aboutServices.process.badge')}
                      </span>
                    </div>
                  </div>

                  {/* Enhanced Title with Gradient Effect */}
                  <div
                    className="mb-6 opacity-0 translate-y-8 animate-fade-in"
                    style={{ animationDelay: '0.3s', animationFillMode: 'forwards' }}
                  >
                    <h3 className="text-[#2c2c2b] font-bold leading-tight">
                      <span
                        style={{
                          fontSize: 'clamp(36px, 7vw, 64px)',
                          lineHeight: 'clamp(44px, 8vw, 72px)',
                          letterSpacing: 'clamp(-1px, -0.2vw, -2px)'
                        }}
                      >
                        {t('aboutServices.process.title').split(' ')[0]} {t('aboutServices.process.title').split(' ')[1]}{' '}
                      </span>
                      <span
                        className="bg-gradient-to-r from-[#74cfaa] to-[#a095e1] bg-clip-text text-transparent"
                        style={{
                          fontSize: 'clamp(36px, 7vw, 64px)',
                          lineHeight: 'clamp(44px, 8vw, 72px)',
                          letterSpacing: 'clamp(-1px, -0.2vw, -2px)',
                          WebkitBackgroundClip: 'text',
                          WebkitTextFillColor: 'transparent'
                        }}
                      >
                        {t('aboutServices.process.title').split(' ')[2]}
                      </span>
                    </h3>
                  </div>

                  {/* Enhanced Subtitle */}
                  <div
                    className="opacity-0 translate-y-8 animate-fade-in"
                    style={{ animationDelay: '0.5s', animationFillMode: 'forwards' }}
                  >
                    <p
                      className="text-[#666666] leading-relaxed max-w-2xl mx-auto"
                      style={{ fontSize: 'clamp(18px, 3vw, 24px)', lineHeight: 'clamp(26px, 4vw, 34px)' }}
                    >
                      {t.rich('aboutServices.process.subtitle', {
                        strong: (chunks) => (
                          <strong className="text-[#74cfaa]">{chunks}</strong>
                        )
                      })}
                    </p>
                  </div>

                  {/* Decorative Underline */}
                  <div
                    className="flex justify-center mt-6 opacity-0 translate-y-8 animate-fade-in"
                    style={{ animationDelay: '0.7s', animationFillMode: 'forwards' }}
                  >
                    <div className="w-32 h-1 bg-gradient-to-r from-[#74cfaa] to-[#a095e1] rounded-full"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Pipeline Steps */}
          <div className="relative">
            {/* Background Pipeline Line */}
            <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-[#74cfaa] via-[#8bb4d1] to-[#a095e1] transform -translate-y-1/2 opacity-30"></div>

            {/* Pipeline Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12">

              {/* Step 1: Discovery & Briefing */}
              <div className="relative group">
                <div className="bg-white rounded-2xl p-6 border border-gray-100 hover:border-[#74cfaa]/30 transition-all duration-500 hover:shadow-xl hover:shadow-[#74cfaa]/10 relative z-10">
                  {/* Step Number */}
                  <div className="absolute -top-4 left-6 w-8 h-8 bg-gradient-to-r from-[#74cfaa] to-[#a095e1] rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg">
                    1
                  </div>

                  {/* Icon */}
                  <div className="w-12 h-12 bg-gradient-to-br from-[#74cfaa]/10 to-[#a095e1]/10 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                    <svg className="w-6 h-6 text-[#74cfaa]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                    </svg>
                  </div>

                  <h4 className="text-[#2c2c2b] font-bold text-lg mb-2 group-hover:text-[#74cfaa] transition-colors duration-300">
                    {t('aboutServices.process.steps.discovery.title')}
                  </h4>
                  <p className="text-[#666666] text-sm leading-relaxed">
                    {t('aboutServices.process.steps.discovery.description')}
                  </p>
                </div>

                {/* Connector Arrow - Hidden on mobile */}
                <div className="hidden lg:block absolute top-1/2 -right-6 transform -translate-y-1/2 z-20">
                  <div className="w-12 h-12 bg-gradient-to-r from-[#74cfaa] to-[#a095e1] rounded-full flex items-center justify-center shadow-lg">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 7l5 5m0 0l-5 5m5-5H6"/>
                    </svg>
                  </div>
                </div>
              </div>

              {/* Step 2: Creative Experience Design */}
              <div className="relative group">
                <div className="bg-white rounded-2xl p-6 border border-gray-100 hover:border-[#a095e1]/30 transition-all duration-500 hover:shadow-xl hover:shadow-[#a095e1]/10 relative z-10">
                  {/* Step Number */}
                  <div className="absolute -top-4 left-6 w-8 h-8 bg-gradient-to-r from-[#a095e1] to-[#74cfaa] rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg">
                    2
                  </div>

                  {/* Icon */}
                  <div className="w-12 h-12 bg-gradient-to-br from-[#a095e1]/10 to-[#74cfaa]/10 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                    <svg className="w-6 h-6 text-[#a095e1]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a2 2 0 002-2V5z"></path>
                    </svg>
                  </div>

                  <h4 className="text-[#2c2c2b] font-bold text-lg mb-2 group-hover:text-[#a095e1] transition-colors duration-300">
                    {t('aboutServices.process.steps.design.title')}
                  </h4>
                  <p className="text-[#666666] text-sm leading-relaxed">
                    {t('aboutServices.process.steps.design.description')}
                  </p>
                </div>

                {/* Connector Arrow - Hidden on mobile */}
                <div className="hidden lg:block absolute top-1/2 -right-6 transform -translate-y-1/2 z-20">
                  <div className="w-12 h-12 bg-gradient-to-r from-[#a095e1] to-[#74cfaa] rounded-full flex items-center justify-center shadow-lg">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 7l5 5m0 0l-5 5m5-5H6"/>
                    </svg>
                  </div>
                </div>
              </div>

              {/* Step 3: Technical Planning */}
              <div className="relative group">
                <div className="bg-white rounded-2xl p-6 border border-gray-100 hover:border-[#74cfaa]/30 transition-all duration-500 hover:shadow-xl hover:shadow-[#74cfaa]/10 relative z-10">
                  {/* Step Number */}
                  <div className="absolute -top-4 left-6 w-8 h-8 bg-gradient-to-r from-[#74cfaa] to-[#a095e1] rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg">
                    3
                  </div>

                  {/* Icon */}
                  <div className="w-12 h-12 bg-gradient-to-br from-[#74cfaa]/10 to-[#a095e1]/10 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                    <svg className="w-6 h-6 text-[#74cfaa]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                    </svg>
                  </div>

                  <h4 className="text-[#2c2c2b] font-bold text-lg mb-2 group-hover:text-[#74cfaa] transition-colors duration-300">
                    {t('aboutServices.process.steps.planning.title')}
                  </h4>
                  <p className="text-[#666666] text-sm leading-relaxed">
                    {t('aboutServices.process.steps.planning.description')}
                  </p>
                </div>

                {/* Connector Arrow - Hidden on mobile */}
                <div className="hidden lg:block absolute top-1/2 -right-6 transform -translate-y-1/2 z-20">
                  <div className="w-12 h-12 bg-gradient-to-r from-[#74cfaa] to-[#a095e1] rounded-full flex items-center justify-center shadow-lg">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 7l5 5m0 0l-5 5m5-5H6"/>
                    </svg>
                  </div>
                </div>
              </div>

              {/* Step 4: Production & Execution */}
              <div className="relative group">
                <div className="bg-white rounded-2xl p-6 border border-gray-100 hover:border-[#a095e1]/30 transition-all duration-500 hover:shadow-xl hover:shadow-[#a095e1]/10 relative z-10">
                  {/* Step Number */}
                  <div className="absolute -top-4 left-6 w-8 h-8 bg-gradient-to-r from-[#a095e1] to-[#74cfaa] rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg">
                    4
                  </div>

                  {/* Icon */}
                  <div className="w-12 h-12 bg-gradient-to-br from-[#a095e1]/10 to-[#74cfaa]/10 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                    <svg className="w-6 h-6 text-[#a095e1]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"></path>
                    </svg>
                  </div>

                  <h4 className="text-[#2c2c2b] font-bold text-lg mb-2 group-hover:text-[#a095e1] transition-colors duration-300">
                    {t('aboutServices.process.steps.production.title')}
                  </h4>
                  <p className="text-[#666666] text-sm leading-relaxed">
                    {t('aboutServices.process.steps.production.description')}
                  </p>
                </div>

                {/* Connector Arrow - Hidden on mobile */}
                <div className="hidden lg:block absolute top-1/2 -right-6 transform -translate-y-1/2 z-20">
                  <div className="w-12 h-12 bg-gradient-to-r from-[#a095e1] to-[#74cfaa] rounded-full flex items-center justify-center shadow-lg">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 7l5 5m0 0l-5 5m5-5H6"/>
                    </svg>
                  </div>
                </div>
              </div>

              {/* Step 5: Show Control */}
              <div className="relative group">
                <div className="bg-white rounded-2xl p-6 border border-gray-100 hover:border-[#74cfaa]/30 transition-all duration-500 hover:shadow-xl hover:shadow-[#74cfaa]/10 relative z-10">
                  {/* Step Number */}
                  <div className="absolute -top-4 left-6 w-8 h-8 bg-gradient-to-r from-[#74cfaa] to-[#a095e1] rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg">
                    5
                  </div>

                  {/* Icon */}
                  <div className="w-12 h-12 bg-gradient-to-br from-[#74cfaa]/10 to-[#a095e1]/10 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                    <svg className="w-6 h-6 text-[#74cfaa]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1.01M15 10h1.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                  </div>

                  <h4 className="text-[#2c2c2b] font-bold text-lg mb-2 group-hover:text-[#74cfaa] transition-colors duration-300">
                    {t('aboutServices.process.steps.showControl.title')}
                  </h4>
                  <p className="text-[#666666] text-sm leading-relaxed">
                    {t('aboutServices.process.steps.showControl.description')}
                  </p>
                </div>

                {/* Connector Arrow - Hidden on mobile */}
                <div className="hidden lg:block absolute top-1/2 -right-6 transform -translate-y-1/2 z-20">
                  <div className="w-12 h-12 bg-gradient-to-r from-[#74cfaa] to-[#a095e1] rounded-full flex items-center justify-center shadow-lg">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 7l5 5m0 0l-5 5m5-5H6"/>
                    </svg>
                  </div>
                </div>
              </div>

              {/* Step 6: Post-Event (Optional) */}
              <div className="relative group">
                <div className="bg-gradient-to-br from-[#74cfaa]/5 to-[#a095e1]/5 rounded-2xl p-6 border border-[#74cfaa]/20 hover:border-[#a095e1]/40 transition-all duration-500 hover:shadow-xl hover:shadow-[#a095e1]/10 relative z-10">
                  {/* Step Number */}
                  <div className="absolute -top-4 left-6 w-8 h-8 bg-gradient-to-r from-[#a095e1] to-[#74cfaa] rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg">
                    6
                  </div>

                  {/* Optional Badge */}
                  <div className="absolute -top-2 -right-2 bg-[#74cfaa] text-white text-xs px-2 py-1 rounded-full font-semibold">
                    {t('aboutServices.process.steps.postEvent.badge')}
                  </div>

                  {/* Icon */}
                  <div className="w-12 h-12 bg-gradient-to-br from-[#a095e1]/10 to-[#74cfaa]/10 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                    <svg className="w-6 h-6 text-[#a095e1]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                    </svg>
                  </div>

                  <h4 className="text-[#2c2c2b] font-bold text-lg mb-2 group-hover:text-[#a095e1] transition-colors duration-300">
                    {t('aboutServices.process.steps.postEvent.title')}
                  </h4>
                  <p className="text-[#666666] text-sm leading-relaxed">
                    {t('aboutServices.process.steps.postEvent.description')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Button */}
        <div className="flex justify-center mt-6 sm:mt-8 md:mt-10 lg:mt-12 xl:mt-16">
          <div className="max-w-[90vw] sm:max-w-none overflow-hidden">
            <a href={`/${locale}/services`}>
              <CTAButton ariaLabel={t('aboutServices.cta')}>
                {t('aboutServices.cta')}
              </CTAButton>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}