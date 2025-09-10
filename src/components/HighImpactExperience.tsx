import React from 'react';

const imgBackground = "/assets/29064c5a0d86395e45b642fe4e6daf670490f723.png";
const imgRectangle = "/assets/3f0c70e340a28d47867891894e77a32ca1a022f1.png";
const imgPattern = "/assets/6ebbb286c787b4009100c9f8cd397942ae83de56.png";

// Mobile assets from Figma (node-id 17-486)
const img202508031915NeonConcert = "/assets/3f0c70e340a28d47867891894e77a32ca1a022f1.png";
const imgPattern0341 = "/assets/6ebbb286c787b4009100c9f8cd397942ae83de56.png";

export default function HighImpactExperience() {
  return (
    <>
      {/* Mobile Layout */}
      <div className="block lg:hidden mx-4 mt-8 mb-8">
        <div 
          className="bg-[#2c2c2b] overflow-hidden rounded-[25px] relative w-full"
          style={{ height: '645px' }}
        >
            {/* Mobile Concert Image - Bottom Section */}
            <div 
              className="absolute bg-center bg-cover bg-no-repeat w-full"
              style={{ 
                height: '367px',
                left: '0px',
                top: '278px',
                backgroundImage: `url('${img202508031915NeonConcert}')` 
              }}
            >
              {/* Inner shadow overlay */}
              <div 
                className="absolute inset-0 pointer-events-none"
                style={{
                  boxShadow: 'inset 0px 0px 119px 0px rgba(0,0,0,0.82)'
                }}
              />
            </div>

            {/* Mobile Dark Blur Element */}
            <div 
              className="absolute bg-[#2c2c2b] filter"
              style={{
                width: 'calc(100% + 130px)',
                height: '132px',
                left: '-65px',
                top: '560px',
                filter: 'blur(29.5px)'
              }}
            />

            {/* Mobile Text Content */}
            <div 
              className="absolute capitalize flex flex-col items-center justify-start leading-[0] text-center px-[18px]"
              style={{
                width: 'calc(100% - 36px)',
                left: '0px',
                top: '45.5px',
                fontFamily: "'FONTSPRING DEMO - Visby CF Medium', sans-serif",
                fontSize: 'clamp(50px, 14vw, 75px)',
                letterSpacing: '-2.4px'
              }}
            >
              {/* "High" text */}
              <div 
                className="text-white w-full relative text-center"
                style={{ lineHeight: 'clamp(60px, 16.8vw, 90px)' }}
              >
                <p className="mb-0 text-center">high</p>
              </div>
              
              {/* "Impact" text */}
              <div 
                className="text-white w-full relative text-center"
                style={{ lineHeight: 'clamp(60px, 16.8vw, 90px)' }}
              >
                <p className="mb-0 text-center">impact</p>
              </div>
              
              {/* "Experience" with gradient */}
              <div 
                className="w-full relative bg-gradient-to-l from-[#74cfaa] to-[#a095e1] bg-clip-text text-center"
                style={{ 
                  WebkitTextFillColor: 'transparent',
                  lineHeight: 'clamp(60px, 16.8vw, 90px)'
                }}
              >
                <p className="mb-0 text-center">experience</p>
              </div>
            </div>

            {/* Mobile Decorative Pattern - Bottom */}
            <div 
              className="absolute bg-center bg-cover bg-no-repeat translate-x-[-50%]"
              style={{ 
                width: 'min(360px, 100vw)',
                height: '240px',
                left: '50%',
                bottom: '-107px',
                backgroundImage: `url('${imgPattern0341}')` 
              }}
            />
        </div>
      </div>

      {/* Desktop Layout */}
      <div className="hidden lg:block relative mx-4 mt-8 mb-8">
      <div
        className="relative overflow-hidden rounded-tl-[61px] rounded-tr-[61px] rounded-bl-[20px] rounded-br-[20px] bg-center bg-cover bg-no-repeat"
        style={{ 
          backgroundImage: `url('${imgBackground}')`,
          height: '873px'
        }}
      >
        {/* Right side image overlay */}
        <div
          className="absolute bg-center bg-cover bg-no-repeat"
          style={{ 
            backgroundImage: `url('${imgRectangle}')`,
            width: '1055px',
            height: '873px',
            left: '399px',
            top: '0'
          }}
        />

        {/* Dark blur overlay for depth */}
        <div
          className="absolute bg-[#2c2c2b] blur-[200px] filter"
          style={{
            width: '1202px',
            height: '1500px',
            left: '-412px',
            top: '-284px'
          }}
        />

        {/* Main text content - aligned with navbar logo */}
        <div className="absolute inset-0 flex items-center z-10">
          <div className="pl-12">
            {/* "High Impact" text */}
            <div className="leading-tight">
              <h2 
                className="capitalize text-white font-medium"
                style={{
                  fontSize: 'clamp(80px, 12vw, 170px)',
                  lineHeight: '1.1em',
                  letterSpacing: '-0.04em'
                }}
              >
                <span className="block">High</span>
                <span className="block">Impact</span>
              </h2>
              
              {/* "Experience" with gradient */}
              <h2 
                className="capitalize font-medium bg-gradient-to-r from-[#a095e1] to-[#74cfaa] bg-clip-text"
                style={{
                  fontSize: 'clamp(80px, 12vw, 170px)',
                  lineHeight: '1.2em',
                  letterSpacing: '-0.04em',
                  marginTop: '-0.05em',
                  WebkitTextFillColor: 'transparent',
                  WebkitBackgroundClip: 'text',
                  backgroundClip: 'text'
                }}
              >
                Experience
              </h2>
            </div>
          </div>
        </div>

        {/* Decorative pattern - adjusted positioning */}
        <div
          className="absolute bg-center bg-cover bg-no-repeat z-0"
          style={{ 
            backgroundImage: `url('${imgPattern}')`,
            width: '638px',
            height: '426px',
            left: '800px',
            top: '531px'
          }}
        />

        {/* Inner shadow effect */}
        <div 
          className="absolute inset-0 pointer-events-none"
          style={{
            boxShadow: 'inset -100px 0px 200px 0px #231f20'
          }}
        />
      </div>
      </div>
    </>
  );
}