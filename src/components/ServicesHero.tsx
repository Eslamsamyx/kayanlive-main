'use client';

import { useState, useEffect } from 'react';

const imgOutline1 = "/assets/1349ad630f81a3bb2a509dd8abfe0e4ef85fa329.png";

export default function ServicesHero() {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <section 
      className="relative bg-[#2c2c2b] overflow-hidden rounded-[61px] w-full"
      style={{ aspectRatio: '1512/955', height: 'auto' }}
      aria-label="Our Services hero section"
    >
      {/* Loading state */}
      {!isLoaded && (
        <div className="absolute inset-0 animate-pulse bg-gray-700 rounded-[61px]" />
      )}
      
      <div className={`relative h-full transition-opacity duration-500 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}>
        
        {/* Main "Our Services" Title - Aspect Ratio Responsive */}
        <header
          className="absolute font-bold whitespace-nowrap z-10"
          style={{
            left: "4%",
            top: "7%", // 67px / 955px = 7%
            fontSize: "clamp(3vw, 8.5vw, 130px)",
            lineHeight: "0.93em",
            background: 'linear-gradient(to right, #a095e1, #74cfaa)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            fontFamily: "'FONTSPRING DEMO - Visby CF Demi Bold', 'Poppins', sans-serif"
          }}
        >
          <h1 className="sr-only">Our Services</h1>
          <span aria-hidden="true">Our Services</span>
        </header>

        {/* Subtitle Text - Right Side - Aspect Ratio Responsive */}
        <aside 
          className="absolute text-right font-medium z-10"
          style={{
            right: "4%",
            top: "28%", // 266px / 955px = 28%
            width: "50%", // Increased from 40% to 50% to fit entire sentence on one line
            fontSize: "clamp(1.6vw, 2.8vw, 42px)",
            lineHeight: "1.3em",
            fontFamily: "'FONTSPRING DEMO - Visby CF Medium', 'Poppins', sans-serif"
          }}
          aria-labelledby="company-tagline"
        >
          <h2 id="company-tagline" className="mb-0" style={{ textTransform: 'capitalize' }}>
            <span 
              style={{
                background: 'linear-gradient(to right, #a095e1, #74cfaa)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                display: 'block'
              }}
            >
              Precision Built. Pressure Tested.
            </span>
            <span className="text-white" style={{ display: 'block' }}>Experience Driven.</span>
          </h2>
        </aside>

        {/* Main Body Text - Left Side - Aspect Ratio Responsive */}
        <article 
          className="absolute text-[#b2b2b2] z-10"
          style={{
            left: "4%",
            top: "48%", // Increased spacing below paragraph
            width: "50.5%", // 764px / 1512px = 50.5%
            fontSize: "clamp(0.8vw, 1.5vw, 22px)",
            lineHeight: "1.27em",
            fontFamily: "'Aeonik', 'Poppins', sans-serif"
          }}
          aria-labelledby="company-description"
        >
          <div id="company-description" className="sr-only">Company Description</div>
          <p className="mb-0">
            KayanLive delivers structured, high-impact events in the UAE and Saudi Arabia, and across the broader GCC, designed with creative ambition and executed with operational certainty.
          </p>
          <p className="mb-0">&nbsp;</p>
          <p className="mb-0">
            We operate as a full-service KSA event company, also operating in the UAE with deep regional reach. Every service listed here represents a seamless fusion of speed, scale, and strategy.
          </p>
        </article>

        {/* Decorative Outline 1 - Top Right - Aspect Ratio Responsive */}
        <div 
          className="absolute opacity-50 hidden lg:block"
          style={{
            backgroundImage: `url('${imgOutline1}')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            height: '49%', // 469px / 955px = 49%
            width: '20%', // 302px / 1512px = 20%
            left: '66%', // Centered above tagline
            top: '-24.5%' // -234px / 955px = -24.5%
          }}
          aria-hidden="true"
        />

        {/* Decorative Outline 2 - Bottom Right - Aspect Ratio Responsive */}
        <div 
          className="absolute opacity-50 hidden lg:block"
          style={{
            backgroundImage: `url('${imgOutline1}')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            height: '63%', // 603px / 955px = 63%
            width: '25.7%', // 388px / 1512px = 25.7%
            left: '82%', // Adjusted to 82%
            bottom: '-31.5%' // Moved down so only top half is visible
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