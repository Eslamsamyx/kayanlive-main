'use client';

import { useState, useEffect } from 'react';

const imgPattern0212 = "/assets/ef25fd14e49122ddd6cbc03c8a92caff93500eb7.png";

export default function AboutOrigin() {
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
                  The Origin of Capability
                </h2>
              </header>

              <div
                className="text-[#808184] capitalize text-base leading-relaxed"
                style={{
                  fontFamily: '"Poppins", sans-serif'
                }}
              >
                <p className="mb-4">
                  <span>After years of directing high-level brand activations and immersive showcases across the GCC, our founder, </span>
                  <span className="text-[#2c2c2b]">Khalid Alhasan</span>
                  <span>, recognized a pattern: most vendors stalled when speed was critical, and cracked when pressure mounted.</span>
                </p>
                <p className="mb-4">KayanLive was engineered to change the equation.</p>
                <p className="mb-4">
                  <span>What began as a response to regional breakdowns now operates as a trusted name among the </span>
                  <span className="text-[#2c2c2b]">best event management companies</span>
                  <span> in the region. Recognized across the Emirates and broader GCC regions, we&apos;ve earned trust through clarity and execution.</span>
                </p>
                <p className="mb-4">Every layer of planning, production, and performance exists in one unified structure.</p>
                <p>Ideas move faster here because teams align faster. No gaps. No wasted time. Every second is accounted for.</p>
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
                  Built to Lead. Proven to Deliver.
                </h2>
              </header>

              <div
                className="text-[#808184] capitalize text-base leading-relaxed"
                style={{
                  fontFamily: '"Poppins", sans-serif'
                }}
              >
                <p className="mb-4">Our leadership team spans disciplines and industries. From creative directors and AV producers to engineers and logistics specialists, each expert understands what success looks like in high-stakes environments. With years of cumulative experience and region-wide execution, we guide with confidence and act with certainty.</p>
                <p className="mb-4 text-[#2c2c2b]">No chaos. No handoffs. No breakdowns.</p>
                <p>This approach has positioned KayanLive as a trusted execution partner for national ceremonies, multinational product launches, large-scale conferences, and last-call takeovers. The scale adapts, but the outcome remains the same: impact without compromise.</p>
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
                  The Origin of Capability
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
                <p className="mb-0">
                  <span>After years of directing high-level brand activations and immersive showcases across the GCC, our founder, </span>
                  <span className="text-[#2c2c2b]">Khalid Alhasan</span>
                  <span>, recognized a pattern: most vendors stalled when speed was critical, and cracked when pressure mounted.</span>
                </p>
                <p className="mb-0">&nbsp;</p>
                <p className="mb-0">KayanLive was engineered to change the equation.</p>
                <p className="mb-0">
                  <span>What began as a response to regional breakdowns now operates as a trusted name among the </span>
                  <span className="text-[#2c2c2b]">best event management companies</span>
                  <span> in the region. Recognized across the Emirates and broader GCC regions, we&apos;ve earned trust through clarity and execution.</span>
                </p>
                <p className="mb-0">&nbsp;</p>
                <p className="mb-0">Every layer of planning, production, and performance exists in one unified structure.</p>
                <p>Ideas move faster here because teams align faster. No gaps. No wasted time. Every second is accounted for.</p>
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
                  Built to Lead. Proven to Deliver.
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
                <p className="mb-0">Our leadership team spans disciplines and industries. From creative directors and AV producers to engineers and logistics specialists, each expert understands what success looks like in high-stakes environments. With years of cumulative experience and region-wide execution, we guide with confidence and act with certainty.</p>
                <p className="mb-0">&nbsp;</p>
                <p className="mb-0 text-[#2c2c2b]">No chaos. No handoffs. No breakdowns.</p>
                <p className="mb-0">&nbsp;</p>
                <p>This approach has positioned KayanLive as a trusted execution partner for national ceremonies, multinational product launches, large-scale conferences, and last-call takeovers. The scale adapts, but the outcome remains the same: impact without compromise.</p>
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
        Skip to next section
      </a>
    </section>
  );
}