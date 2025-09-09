'use client';

import { useState, useEffect } from 'react';

const imgOutline1 = "/assets/1349ad630f81a3bb2a509dd8abfe0e4ef85fa329.png";

export default function AboutHero() {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <section 
      className="relative bg-[#2c2c2b] overflow-hidden rounded-[61px] w-full"
      style={{ aspectRatio: '1512/955', height: 'auto' }}
      aria-label="About KayanLive hero section"
    >
      {/* Loading state */}
      {!isLoaded && (
        <div className="absolute inset-0 animate-pulse bg-gray-700 rounded-[61px]" />
      )}
      
      <div className={`relative h-full transition-opacity duration-500 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}>
        
        {/* Main "About Us" Title - Aspect Ratio Responsive */}
        <header
          className="absolute font-bold whitespace-nowrap z-10"
          style={{
            left: "4%",
            top: "7%", // 67px / 955px = 7%
            fontSize: "clamp(3.5vw, 9.9vw, 150px)",
            lineHeight: "0.93em",
            background: 'linear-gradient(to right, #a095e1, #74cfaa)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            fontFamily: "'FONTSPRING DEMO - Visby CF Demi Bold', 'Poppins', sans-serif"
          }}
        >
          <h1 className="sr-only">About KayanLive</h1>
          <span aria-hidden="true">About Us</span>
        </header>

        {/* Subtitle Text - Right Side - Aspect Ratio Responsive */}
        <aside 
          className="absolute text-right font-medium z-10"
          style={{
            right: "4%",
            top: "28%", // 266px / 955px = 28%
            width: "50%", // Wider to fit text on one line
            fontSize: "clamp(1.8vw, 3.2vw, 48px)",
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
              Strategy Built for Urgency.
            </span>
            <span className="text-white" style={{ display: 'block' }}>Vision Built for Impact.</span>
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
            KayanLive transforms pressure into performance. As a purpose-led top event agency based in the GCC with active operations across the UAE and Saudi Arabia, we create experiences that are fast to deploy, precise in execution, and bold in outcome. When timing is tight and expectations are high, our structure remains firm—and your vision moves forward with clarity.
          </p>
          <p className="mb-0">&nbsp;</p>
          <p className="mb-0">
            Events delivered through KayanLive reach farther, feel sharper, and last longer. Each project is built to lead, not follow.
          </p>
          <p className="mb-0">
            We understand how high-stakes delivery shapes national initiatives.
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