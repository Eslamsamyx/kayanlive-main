'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';

// Assets
const imgScreenshot1 = "/assets/01f5d49d03c8455dc99b2ad32446b6657b1949e0.png";
const imgScreenshot3 = "/assets/b0d9ec6faacc00d7ed8b82f3f45ecaa371425181.png";
const imgFrame1 = "/assets/bac2af3eca424e14c720bab9f5fabec434faaa31.svg";
const imgPattern0212 = "/assets/ef25fd14e49122ddd6cbc03c8a92caff93500eb7.png";
const imgPattern0331 = "/assets/2e5da0ba94a7081a8e8355ba87266411fee96738.png";
const imgKayanLogo = "/assets/823c27de600ccd2f92af3e073c8e10df3a192e5c.png";
const imgArrow1 = "/assets/35f8e962d2ce4403cee4cf1b70df11920a8fa4b6.svg";

export default function Hero() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const totalSlides = 3;

  useEffect(() => {
    if (!isPaused) {
      const interval = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % totalSlides);
      }, 6000);
      return () => clearInterval(interval);
    }
  }, [isPaused, totalSlides]);

  const goToSlide = useCallback((index: number) => {
    setCurrentSlide(index);
    setIsPaused(true);
    setTimeout(() => setIsPaused(false), 10000);
  }, []);

  return (
    <div 
      className="relative bg-[#2c2c2b] overflow-hidden rounded-[61px] mx-4 mb-8"
      style={{ height: '955px' }}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Slide 1 - Main Hero */}
      <div className={`absolute inset-0 transition-opacity duration-1000 ${
        currentSlide === 0 ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}>
        {/* Background Image - exact Figma dimensions */}
        <div 
          className="absolute bg-center bg-cover bg-no-repeat"
          style={{ 
            width: '1659px',
            height: '955px',
            top: '0px',
            left: 'calc(50% - 0.5px)',
            transform: 'translateX(-50%)',
            backgroundImage: `url('${imgScreenshot1}')` 
          }}
        />
        
        {/* Decorative Frame */}
        <div 
          className="absolute"
          style={{ 
            width: '1445.84px',
            height: '290.092px',
            top: '727px',
            left: 'calc(50% - 0.08px)',
            transform: 'translateX(-50%)'
          }}
        >
          <div className="absolute" style={{ 
            bottom: '-32.03%', 
            left: '-10.58%', 
            right: '0', 
            top: '-39.99%' 
          }}>
            <img alt="" className="block w-full h-full max-w-none" src={imgFrame1} />
          </div>
        </div>

        {/* Text Content */}
        <div 
          className="absolute capitalize text-white text-left"
          style={{ 
            fontWeight: 'bold',
            fontSize: '70px',
            lineHeight: '1.3',
            left: '42px',
            top: '750px',
            width: '875px'
          }}
        >
          Welcome to KayanLive, GCC&apos;s Top Event Experts
        </div>

        {/* Slide Indicators */}
        <div className="absolute" style={{ right: '76px', top: '424px' }}>
          <div className="flex flex-col" style={{ gap: '35.355px' }}>
            {[0, 1, 2].map((index) => (
              <button 
                key={index}
                onClick={() => goToSlide(index)}
                className="relative flex items-center justify-center"
                style={{ width: '35.355px', height: '35.355px' }}
                aria-label={`Go to slide ${index + 1}`}
              >
                <div className="flex-none" style={{ transform: 'rotate(315deg)' }}>
                  <div 
                    className="relative backdrop-blur-[7.5px]"
                    style={{ 
                      width: '25px', 
                      height: '25px',
                      backgroundColor: currentSlide === index ? 'transparent' : 'rgba(255,255,255,0.01)',
                      border: '2px solid #ffffff'
                    }}
                  >
                    {currentSlide === index && (
                      <div 
                        className="absolute bg-white"
                        style={{ 
                          width: '15.79px',
                          height: '15.79px',
                          top: 'calc(50% + 0.23px)',
                          left: 'calc(50% + 0.117px)',
                          transform: 'translate(-50%, -50%)'
                        }}
                      />
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Slide 2 - Schedule Consultation */}
      <div className={`absolute inset-0 transition-opacity duration-1000 ${
        currentSlide === 1 ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}>
        {/* Dark gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#4a2b7c] via-[#2c2c2b] to-[#2c2c2b]" />
        
        {/* Light beams from top */}
        <div className="absolute inset-0">
          <div 
            className="absolute"
            style={{
              top: '-20%',
              left: '50%',
              transform: 'translateX(-50%)',
              width: '60%',
              height: '80%',
              background: 'radial-gradient(ellipse at center top, rgba(122,253,214,0.3) 0%, transparent 50%)',
              filter: 'blur(60px)'
            }}
          />
          <div 
            className="absolute"
            style={{
              top: '-10%',
              left: '30%',
              width: '20%',
              height: '60%',
              background: 'linear-gradient(180deg, rgba(184,164,255,0.2) 0%, transparent 70%)',
              filter: 'blur(40px)',
              transform: 'rotate(-15deg)'
            }}
          />
          <div 
            className="absolute"
            style={{
              top: '-10%',
              right: '30%',
              width: '20%',
              height: '60%',
              background: 'linear-gradient(180deg, rgba(184,164,255,0.2) 0%, transparent 70%)',
              filter: 'blur(40px)',
              transform: 'rotate(15deg)'
            }}
          />
        </div>

        {/* Large arrow on left */}
        <div 
          className="absolute opacity-20"
          style={{
            left: '-5%',
            top: '15%',
            width: '30%',
            height: '50%',
            transform: 'rotate(-30deg)'
          }}
        >
          <img src={imgFrame1} alt="" className="w-full h-full object-contain" style={{ filter: 'hue-rotate(260deg)' }} />
        </div>

        {/* CTA Button */}
        <div 
          className="absolute bg-white flex flex-row items-center justify-center gap-8 rounded-[900px] overflow-hidden"
          style={{ 
            width: '340px',
            height: '74px',
            top: 'calc(50% - 0.5px)',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            padding: '20px 25px'
          }}
        >
          <div 
            className="text-[#2c2c2b] capitalize whitespace-nowrap font-medium"
            style={{ 
              fontSize: '20px',
              lineHeight: '28px'
            }}
          >
            Schedule A Consultation
          </div>
          <svg 
            width="16" 
            height="15" 
            viewBox="0 0 16 15" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
          >
            <path 
              d="M1 7.5H15M15 7.5L8.5 1M15 7.5L8.5 14" 
              stroke="#2c2c2b" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            />
          </svg>
        </div>

        {/* Floating diamonds pattern - organized grid */}
        <div 
          className="absolute"
          style={{
            bottom: '10%',
            right: '8%',
            width: '450px',
            height: '350px'
          }}
        >
          {/* Create a more organized diamond grid pattern */}
          {/* Row 1 - Top */}
          <div className="absolute w-12 h-12 rotate-45 bg-[#7afdd6]/20" style={{ top: '0px', right: '100px' }} />
          <div className="absolute w-10 h-10 rotate-45 bg-[#7afdd6]/25" style={{ top: '5px', right: '180px' }} />
          <div className="absolute w-8 h-8 rotate-45 bg-[#7afdd6]/15" style={{ top: '10px', right: '250px' }} />
          
          {/* Row 2 */}
          <div className="absolute w-10 h-10 rotate-45 bg-[#7afdd6]/30" style={{ top: '60px', right: '60px' }} />
          <div className="absolute w-14 h-14 rotate-45 bg-[#7afdd6]/35" style={{ top: '50px', right: '140px' }} />
          <div className="absolute w-8 h-8 rotate-45 bg-[#7afdd6]/25" style={{ top: '65px', right: '220px' }} />
          <div className="absolute w-6 h-6 rotate-45 bg-[#7afdd6]/20" style={{ top: '70px', right: '290px' }} />
          
          {/* Row 3 - Middle prominent */}
          <div className="absolute w-8 h-8 rotate-45 bg-[#7afdd6]/25" style={{ top: '120px', right: '20px' }} />
          <div className="absolute w-16 h-16 rotate-45 bg-[#7afdd6]/40" style={{ top: '110px', right: '90px' }} />
          <div className="absolute w-12 h-12 rotate-45 bg-[#7afdd6]/30" style={{ top: '115px', right: '180px' }} />
          <div className="absolute w-10 h-10 rotate-45 bg-[#7afdd6]/25" style={{ top: '120px', right: '260px' }} />
          <div className="absolute w-6 h-6 rotate-45 bg-[#7afdd6]/15" style={{ top: '130px', right: '330px' }} />
          
          {/* Row 4 */}
          <div className="absolute w-10 h-10 rotate-45 bg-[#7afdd6]/35" style={{ top: '180px', right: '50px' }} />
          <div className="absolute w-14 h-14 rotate-45 bg-[#7afdd6]/30" style={{ top: '175px', right: '130px' }} />
          <div className="absolute w-8 h-8 rotate-45 bg-[#7afdd6]/25" style={{ top: '185px', right: '220px' }} />
          <div className="absolute w-10 h-10 rotate-45 bg-[#7afdd6]/20" style={{ top: '180px', right: '300px' }} />
          
          {/* Row 5 - Bottom */}
          <div className="absolute w-12 h-12 rotate-45 bg-[#7afdd6]/25" style={{ top: '240px', right: '10px' }} />
          <div className="absolute w-8 h-8 rotate-45 bg-[#7afdd6]/30" style={{ top: '245px', right: '80px' }} />
          <div className="absolute w-14 h-14 rotate-45 bg-[#7afdd6]/35" style={{ top: '235px', right: '160px' }} />
          <div className="absolute w-6 h-6 rotate-45 bg-[#7afdd6]/20" style={{ top: '250px', right: '250px' }} />
          <div className="absolute w-8 h-8 rotate-45 bg-[#7afdd6]/15" style={{ top: '245px', right: '320px' }} />
          
          {/* Row 6 - Very bottom */}
          <div className="absolute w-10 h-10 rotate-45 bg-[#7afdd6]/20" style={{ top: '300px', right: '40px' }} />
          <div className="absolute w-12 h-12 rotate-45 bg-[#7afdd6]/25" style={{ top: '295px', right: '120px' }} />
          <div className="absolute w-8 h-8 rotate-45 bg-[#7afdd6]/30" style={{ top: '305px', right: '200px' }} />
          <div className="absolute w-10 h-10 rotate-45 bg-[#7afdd6]/15" style={{ top: '300px', right: '280px' }} />
        </div>

        {/* Slide Indicators */}
        <div className="absolute" style={{ right: '76px', top: '424px' }}>
          <div className="flex flex-col" style={{ gap: '35.355px' }}>
            {[0, 1, 2].map((index) => (
              <button 
                key={index}
                onClick={() => goToSlide(index)}
                className="relative flex items-center justify-center"
                style={{ width: '35.355px', height: '35.355px' }}
                aria-label={`Go to slide ${index + 1}`}
              >
                <div className="flex-none" style={{ transform: 'rotate(315deg)' }}>
                  <div 
                    className="relative backdrop-blur-[7.5px]"
                    style={{ 
                      width: '25px', 
                      height: '25px',
                      backgroundColor: currentSlide === index ? 'transparent' : 'rgba(255,255,255,0.01)',
                      border: '2px solid #ffffff'
                    }}
                  >
                    {currentSlide === index && (
                      <div 
                        className="absolute bg-white"
                        style={{ 
                          width: '15.79px',
                          height: '15.79px',
                          top: 'calc(50% + 0.23px)',
                          left: 'calc(50% + 0.117px)',
                          transform: 'translate(-50%, -50%)'
                        }}
                      />
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Slide 3 - About Text */}
      <div className={`absolute inset-0 transition-opacity duration-1000 ${
        currentSlide === 2 ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}>
        {/* Background Image */}
        <div 
          className="absolute bg-center bg-cover bg-no-repeat"
          style={{ 
            width: '1454px',
            height: '955px',
            top: '0px',
            left: '50%',
            transform: 'translateX(-50%)',
            backgroundImage: `url('${imgScreenshot3}')` 
          }}
        />

        {/* Logo Watermark */}
        <div 
          className="absolute bg-center bg-cover bg-no-repeat opacity-[0.57]"
          style={{ 
            width: '1241px',
            height: '414px',
            left: '238px',
            top: '748px',
            backgroundImage: `url('${imgKayanLogo}')` 
          }}
        />

        {/* Decorative Diamonds - bottom left */}
        <div className="absolute" style={{ left: '30px', top: '834px' }}>
          <div className="flex" style={{ gap: '27px' }}>
            <div 
              className="flex items-center justify-center"
              style={{ width: '87.725px', height: '87.725px' }}
            >
              <div style={{ transform: 'rotate(315deg)' }}>
                <div 
                  className="backdrop-blur-[7.5px]"
                  style={{ 
                    width: '62.042px',
                    height: '62.042px',
                    backgroundColor: 'rgba(255,255,255,0.3)'
                  }}
                />
              </div>
            </div>
            <div 
              className="flex items-center justify-center"
              style={{ width: '87.725px', height: '87.725px' }}
            >
              <div style={{ transform: 'rotate(315deg)' }}>
                <div 
                  className="backdrop-blur-[7.5px]"
                  style={{ 
                    width: '62.042px',
                    height: '62.042px',
                    backgroundColor: 'rgba(255,255,255,0.3)'
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Central Diamond with Text */}
        <div 
          className="absolute flex items-center justify-center"
          style={{ 
            width: '801.992px',
            height: '801.992px',
            top: 'calc(50% + 0.5px)',
            left: '50%',
            transform: 'translate(-50%, -50%)'
          }}
        >
          <div style={{ transform: 'rotate(315deg)' }}>
            <div 
              className="overflow-hidden relative"
              style={{ 
                width: '567.1px',
                height: '567.1px',
                backgroundColor: 'rgba(255,255,255,0.13)'
              }}
            >
              <div 
                className="absolute flex items-center justify-center"
                style={{ 
                  width: '100%',
                  height: '100%',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)'
                }}
              >
                <div style={{ transform: 'rotate(45deg)' }}>
                  <div 
                    className="text-white text-center capitalize px-8"
                    style={{ 
                      maxWidth: '627px',
                      fontSize: '28px',
                      lineHeight: '38px',
                      fontWeight: '500'
                    }}
                  >
                    Premier Event Management in Saudi Arabia, Dubai, and Across 
                    the GCC—Delivering Creativity, Innovation, and Execution All Under One Roof. 
                    When Others Stall, Panic, or Back Down, We Get to Work. Bringing You Elite 
                    Strategy, Fast Execution, And Cultural Fluency Without Compromise.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Slide Indicators */}
        <div className="absolute" style={{ right: '76px', top: '424px' }}>
          <div className="flex flex-col" style={{ gap: '35.355px' }}>
            {[0, 1, 2].map((index) => (
              <button 
                key={index}
                onClick={() => goToSlide(index)}
                className="relative flex items-center justify-center"
                style={{ width: '35.355px', height: '35.355px' }}
                aria-label={`Go to slide ${index + 1}`}
              >
                <div className="flex-none" style={{ transform: 'rotate(315deg)' }}>
                  <div 
                    className="relative backdrop-blur-[7.5px]"
                    style={{ 
                      width: '25px', 
                      height: '25px',
                      backgroundColor: currentSlide === index ? 'transparent' : 'rgba(255,255,255,0.01)',
                      border: '2px solid #ffffff'
                    }}
                  >
                    {currentSlide === index && (
                      <div 
                        className="absolute bg-white"
                        style={{ 
                          width: '15.79px',
                          height: '15.79px',
                          top: 'calc(50% + 0.23px)',
                          left: 'calc(50% + 0.117px)',
                          transform: 'translate(-50%, -50%)'
                        }}
                      />
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}