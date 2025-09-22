'use client';

import Image from 'next/image';
import { useTranslations } from 'next-intl';

// Assets - Optimized WebP images
const imgOutline = "/optimized/clients-partners/7d0b4204ecf2732587fef2b7f191e56d708f7342-clients-outline.webp";
const imgTrustIcon = "/optimized/clients-partners/697adb719405263fe21c93d0aeaf3abc63d886c4-clients-trust-icon.webp";

export default function ClientsPartnersHero() {
  const t = useTranslations('clientsPartners.hero');

  return (
    <section
      className="relative bg-[#2c2c2b] overflow-hidden rounded-[20px] sm:rounded-[30px] md:rounded-[40px] lg:rounded-[50px] xl:rounded-[61px] w-full mb-4 sm:mb-6 md:mb-8"
      aria-labelledby="partners-hero-title"
    >
      {/* Responsive Container with dynamic height */}
      <div className="relative min-h-[400px] sm:min-h-[450px] md:min-h-[500px] lg:min-h-[600px] xl:min-h-[700px] 2xl:min-h-[800px] flex items-center justify-center py-12 sm:py-16 md:py-20 lg:py-24 px-4 sm:px-6 md:px-8">

        {/* Background Decorative Elements - Responsive positioning */}
        {/* Top Right Outline */}
        <div
          className="absolute opacity-30 sm:opacity-40 md:opacity-50 pointer-events-none"
          style={{
            right: 'clamp(-60px, -5vw, -30px)',
            top: 'clamp(-120px, -10vh, -60px)',
            width: 'clamp(120px, 18vw, 350px)',
            height: 'clamp(180px, 27vw, 500px)',
            backgroundImage: `url("${imgOutline}")`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat'
          }}
        />

        {/* Bottom Left Outline */}
        <div
          className="absolute opacity-30 sm:opacity-40 md:opacity-50 pointer-events-none"
          style={{
            left: 'clamp(-100px, -8vw, -50px)',
            bottom: 'clamp(-120px, -10vh, -60px)',
            width: 'clamp(150px, 22vw, 400px)',
            height: 'clamp(220px, 32vw, 550px)',
            backgroundImage: `url("${imgOutline}")`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            transform: 'rotate(180deg)'
          }}
        />

        {/* Main Content Container */}
        <div className="relative z-10 w-full max-w-7xl mx-auto">

          {/* Main Title - Fully Responsive */}
          <h1
            id="partners-hero-title"
            className="font-bold text-center mb-6 sm:mb-8 md:mb-10 lg:mb-12 xl:mb-16 select-none text-[60px] sm:text-[80px] md:text-[120px] lg:text-[160px] xl:text-[200px] 2xl:text-[240px] leading-[0.85] tracking-tighter"
            style={{
              background: 'linear-gradient(135deg, #a095e1 0%, #74cfaa 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              fontFamily: "'Aeonik', 'FONTSPRING DEMO - Visby CF Demi Bold', 'Poppins', sans-serif",
              textTransform: 'capitalize'
            }}
            dangerouslySetInnerHTML={{ __html: t('title') }}
          />

          {/* Cards Container - Responsive Grid */}
          <div className="relative flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 md:gap-8 lg:gap-10 xl:gap-12 px-4 sm:px-0">

            {/* Built on Trust Card - Responsive */}
            <div
              className="relative group cursor-pointer transform transition-all duration-500 hover:scale-105 hover:-translate-y-2 -rotate-3 sm:-rotate-6 md:-rotate-12 hover:rotate-0"
            >
              <div
                className="backdrop-blur-xl rounded-[16px] sm:rounded-[20px] md:rounded-[24px] lg:rounded-[27px] shadow-xl hover:shadow-2xl transition-all duration-500 border overflow-hidden"
                style={{
                  background: 'rgba(160, 149, 225, 0.08)',
                  borderColor: 'rgba(160, 149, 225, 0.15)',
                  backdropFilter: 'blur(20px)'
                }}
              >
                <div className="flex flex-col items-center justify-center p-4 sm:p-5 md:p-6 lg:p-7 xl:p-8 gap-3 sm:gap-4 md:gap-5">
                  {/* Icon with responsive sizing */}
                  <div className="bg-white rounded-full overflow-hidden relative w-[60px] h-[60px] sm:w-[70px] sm:h-[70px] md:w-[80px] md:h-[80px] lg:w-[90px] lg:h-[90px] xl:w-[100px] xl:h-[100px] group-hover:scale-110 transition-transform duration-500">
                    <Image
                      src={imgTrustIcon}
                      alt="Trust icon"
                      fill
                      className="object-cover scale-110"
                      sizes="(max-width: 640px) 60px, (max-width: 768px) 70px, (max-width: 1024px) 80px, (max-width: 1280px) 90px, 100px"
                    />
                  </div>

                  {/* Text with responsive font sizes */}
                  <div
                    className="text-white text-center font-semibold text-[14px] sm:text-[16px] md:text-[20px] lg:text-[24px] xl:text-[26px] leading-tight tracking-tight max-w-[120px] sm:max-w-[140px] md:max-w-[160px]"
                    style={{
                      fontFamily: "'FONTSPRING DEMO - Visby CF Demi Bold', 'Poppins', sans-serif",
                      textTransform: 'capitalize'
                    }}
                    dangerouslySetInnerHTML={{ __html: t('mobileCards.builtOnTrust') }}
                  />
                </div>
              </div>
            </div>

            {/* Delivered Through Partnership Card - Responsive */}
            <div
              className="relative group cursor-pointer transform transition-all duration-500 hover:scale-105 hover:-translate-y-2 rotate-3 sm:rotate-6 md:rotate-12 hover:rotate-0"
            >
              <div
                className="backdrop-blur-xl rounded-[16px] sm:rounded-[20px] md:rounded-[24px] lg:rounded-[27px] shadow-xl hover:shadow-2xl transition-all duration-500 border overflow-hidden"
                style={{
                  background: 'rgba(117, 206, 171, 0.08)',
                  borderColor: 'rgba(117, 206, 171, 0.15)',
                  backdropFilter: 'blur(20px)'
                }}
              >
                <div className="flex items-center justify-center p-4 sm:p-5 md:p-6 lg:p-7 xl:p-8 min-h-[140px] sm:min-h-[160px] md:min-h-[180px] lg:min-h-[200px] xl:min-h-[220px]">
                  <div
                    className="text-white text-center font-semibold text-[14px] sm:text-[16px] md:text-[18px] lg:text-[20px] xl:text-[22px] leading-snug tracking-tight max-w-[120px] sm:max-w-[140px] md:max-w-[160px]"
                    style={{
                      fontFamily: "'FONTSPRING DEMO - Visby CF Demi Bold', 'Poppins', sans-serif",
                      textTransform: 'capitalize'
                    }}
                    dangerouslySetInnerHTML={{ __html: t('mobileCards.deliveredThroughPartnership') }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Animated gradient orbs for visual interest */}
        <div className="absolute top-1/4 left-1/4 w-[200px] h-[200px] sm:w-[300px] sm:h-[300px] md:w-[400px] md:h-[400px] lg:w-[500px] lg:h-[500px] bg-purple-500/10 rounded-full filter blur-[100px] animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-[200px] h-[200px] sm:w-[300px] sm:h-[300px] md:w-[400px] md:h-[400px] lg:w-[500px] lg:h-[500px] bg-teal-500/10 rounded-full filter blur-[100px] animate-pulse animation-delay-2000" />
      </div>
    </section>
  );
}