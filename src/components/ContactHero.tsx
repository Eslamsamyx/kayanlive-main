'use client';

import { useState, useEffect, useRef } from 'react';

const imgOutline1 = "/assets/1349ad630f81a3bb2a509dd8abfe0e4ef85fa329.png";

export default function ContactHero() {
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

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, []);

  return (
    <section 
      ref={sectionRef}
      className="relative bg-[#2c2c2b] overflow-hidden rounded-[25px] md:rounded-[43px] lg:rounded-[61px] w-full"
      style={{ aspectRatio: '375/500' }}
      aria-label="Contact KayanLive hero section"
    >
      <style>{`
        @keyframes fadeUp {
          from {
            opacity: 0;
            transform: translateX(-50%) translateY(40px);
          }
          to {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
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
        
        @keyframes rotateSubtle {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
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
        
        .animate-rotate-subtle {
          animation: rotateSubtle 20s linear infinite;
        }
        
        .animate-pulse-glow-desktop {
          animation: pulseGlowDesktop 3s ease-in-out infinite;
        }
        
        .text-center-mobile {
          transform: translateX(-50%);
        }
        
        /* Mobile typography optimizations */
        @media (max-width: 480px) {
          .mobile-text-spacing {
            word-spacing: 0.1em;
            letter-spacing: 0.01em;
          }
          
          .mobile-text-container {
            background: rgba(44, 44, 43, 0.03);
            backdrop-filter: blur(1px);
            border-radius: 8px;
          }
        }
        
        @media (max-width: 375px) {
          .mobile-text-spacing {
            font-size: 0.95em !important;
            line-height: 1.1em !important;
          }
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
        
        {/* Mobile/Tablet Title - Centered */}
        <header
          className={`absolute font-bold z-10 text-center lg:hidden ${isVisible ? 'animate-fade-up-1' : 'opacity-0 text-center-mobile'}`}
          style={{
            left: "50%",
            top: "clamp(8%, 8vw, 10%)",
            width: "clamp(260px, 70vw, 380px)",
            fontSize: "clamp(60px, 11vw, 85px)",
            lineHeight: "clamp(52px, 9.5vw, 75px)",
            background: 'linear-gradient(to right, #a095e1, #74cfaa)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            fontFamily: "'FONTSPRING DEMO - Visby CF Demi Bold', 'Poppins', sans-serif",
            paddingLeft: "clamp(16px, 4vw, 20px)",
            paddingRight: "clamp(16px, 4vw, 20px)"
          }}
        >
          <h1 className="sr-only">Contact KayanLive</h1>
          <span aria-hidden="true">Contact Us</span>
        </header>
        
        {/* Desktop Title - Left Side */}
        <header
          className={`absolute font-bold whitespace-nowrap z-10 hidden lg:block ${isVisible ? 'animate-fade-up-desktop-1' : 'opacity-0'}`}
          style={{
            left: "4%",
            top: "7%",
            fontSize: "clamp(3.5vw, 9.9vw, 150px)",
            lineHeight: "0.93em",
            background: 'linear-gradient(to right, #a095e1, #74cfaa)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            fontFamily: "'FONTSPRING DEMO - Visby CF Demi Bold', 'Poppins', sans-serif"
          }}
        >
          <h1 className="sr-only">Contact KayanLive</h1>
          <span aria-hidden="true">Contact Us</span>
        </header>

        {/* Mobile/Tablet Subtitle - Centered */}
        <aside 
          className={`absolute font-medium z-10 text-center lg:hidden mobile-text-spacing ${isVisible ? 'animate-fade-up-2' : 'opacity-0 text-center-mobile'}`}
          style={{
            left: "50%",
            top: "clamp(28%, 24vw, 30%)",
            width: "clamp(280px, 75vw, 420px)",
            fontSize: "clamp(22px, 3.8vw, 32px)",
            lineHeight: "clamp(24px, 4vw, 34px)",
            fontFamily: "'FONTSPRING DEMO - Visby CF Medium', 'Poppins', sans-serif",
            paddingLeft: "clamp(20px, 5vw, 24px)",
            paddingRight: "clamp(20px, 5vw, 24px)"
          }}
          aria-labelledby="contact-tagline"
        >
          <h2 id="contact-tagline" className="mb-0" style={{ textTransform: 'capitalize' }}>
            <span 
              style={{
                background: 'linear-gradient(to right, #a095e1, #74cfaa)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                display: 'block',
                marginBottom: '0'
              }}
            >
              Precision Built.
            </span>
            <span 
              style={{
                background: 'linear-gradient(to right, #a095e1, #74cfaa)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                display: 'block',
                marginBottom: '0'
              }}
            >
              Pressure Tested.
            </span>
            <span className="text-white" style={{ display: 'block' }}>Experience Driven.</span>
          </h2>
        </aside>
        
        {/* Desktop Subtitle - Right Side */}
        <aside 
          className={`absolute text-right font-medium z-10 hidden lg:block ${isVisible ? 'animate-fade-up-desktop-2' : 'opacity-0'}`}
          style={{
            right: "4%",
            top: "28%",
            width: "50%",
            fontSize: "clamp(1.8vw, 3.2vw, 48px)",
            lineHeight: "1.3em",
            fontFamily: "'FONTSPRING DEMO - Visby CF Medium', 'Poppins', sans-serif"
          }}
          aria-labelledby="contact-tagline-desktop"
        >
          <h2 id="contact-tagline-desktop" className="mb-0" style={{ textTransform: 'capitalize' }}>
            <span 
              style={{
                background: 'linear-gradient(to right, #a095e1, #74cfaa)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                display: 'block'
              }}
            >
              Looking for the best event
            </span>
            <span className="text-white" style={{ display: 'block' }}>management company?</span>
          </h2>
        </aside>

        {/* Mobile/Tablet Body Text - Centered */}
        <article 
          className={`absolute text-[#b2b2b2] z-10 text-center lg:hidden mobile-text-spacing mobile-text-container ${isVisible ? 'animate-fade-up-3' : 'opacity-0 text-center-mobile'}`}
          style={{
            left: "50%",
            top: "clamp(45%, 38vw, 48%)",
            width: "clamp(280px, 75vw, 480px)",
            fontSize: "clamp(15px, 2.3vw, 18px)",
            lineHeight: "clamp(19px, 3vw, 24px)",
            fontFamily: "'Aeonik', 'Poppins', sans-serif",
            paddingLeft: "clamp(20px, 5vw, 24px)",
            paddingRight: "clamp(20px, 5vw, 24px)",
            paddingBottom: "clamp(12px, 4vw, 20px)"
          }}
          aria-labelledby="contact-description"
        >
          <div id="contact-description" className="sr-only">Contact Information</div>
          <p className="mb-0">
            KayanLive delivers structured, high-impact events in the UAE and Saudi Arabia, and across the broader GCC, designed with creative ambition and executed with operational certainty.
          </p>
          <p className="mb-0">&nbsp;</p>
          <p className="mb-0">
            We operate as a full-service KSA event company, also operating in the UAE with deep regional reach. Every service listed here represents a seamless fusion of speed, scale, and strategy.
          </p>
        </article>
        
        {/* Desktop Body Text - Left Side */}
        <article 
          className={`absolute text-[#cfcfcf] z-10 hidden lg:block ${isVisible ? 'animate-fade-up-desktop-3' : 'opacity-0'}`}
          style={{
            left: "4%",
            top: "44%",
            width: "43.5%",
            fontSize: "clamp(0.8vw, 1.5vw, 22px)",
            lineHeight: "1.27em",
            fontFamily: "'Aeonik', 'Poppins', sans-serif"
          }}
          aria-labelledby="contact-description-desktop"
        >
          <div id="contact-description-desktop" className="sr-only">Contact Information</div>
          <p className="mb-0">
            Some reach out with a detailed brief and a six-month runway. Others call when the venue is locked and nothing else is. Either way, we are ready.
          </p>
          <p className="mb-0">&nbsp;</p>
          <p className="mb-0">
            As a leading event agency, KayanLive responds with structure, speed, and clear next steps—no matter where the starting line is.
          </p>
        </article>

        {/* Decorative Outline 1 - Mobile/Tablet Top Right */}
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
            top: 'clamp(-70px, -8vw, -40px)'
          }}
          aria-hidden="true"
        />
        
        {/* Decorative Outline 1 - Desktop Top Right */}
        <div 
          className={`absolute opacity-50 hidden lg:block ${isLoaded ? 'animate-pulse-glow-desktop' : ''}`}
          style={{
            backgroundImage: `url('${imgOutline1}')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            height: '49%', // 469px / 955px = 49%
            width: '20%', // 302px / 1512px = 20%
            left: '64.5%', // 975px / 1512px = 64.5%
            top: '-24.5%', // -234px / 955px = -24.5%
            transformOrigin: 'center'
          }}
          aria-hidden="true"
        />

        {/* Decorative Outline 2 - Mobile/Tablet Bottom Right */}
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
            bottom: 'clamp(-15px, -2vw, 5px)'
          }}
          aria-hidden="true"
        />
        
        {/* Decorative Outline 2 - Desktop Bottom Right */}
        <div 
          className={`absolute opacity-50 hidden lg:block ${isLoaded ? 'animate-pulse-glow-desktop' : ''}`}
          style={{
            backgroundImage: `url('${imgOutline1}')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            height: '63%', // 603px / 955px = 63%
            width: '25.7%', // 388px / 1512px = 25.7%
            left: '82%', // Adjusted to 82% to match AboutHero
            bottom: '-31.5%', // Moved down so only top half is visible, matching AboutHero
            transformOrigin: 'center'
          }}
          aria-hidden="true"
        />
      </div>

      {/* Screen reader skip link for accessibility */}
      <a 
        href="#main-content" 
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-white text-black px-4 py-2 rounded z-50"
      >
        Skip to main content
      </a>
    </section>
  );
}