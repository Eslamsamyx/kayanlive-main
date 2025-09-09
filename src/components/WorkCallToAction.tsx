'use client';

import { useState } from 'react';

// Assets from Figma
const imgOutline1 = "/assets/1349ad630f81a3bb2a509dd8abfe0e4ef85fa329.png";
const imgPattern0452 = "/assets/6cdd4333a240b46dead9df86c5a83772e81b76fc.png";
const imgFreepikTheStyleIsCandidImagePhotographyWithNatural627961 = "/assets/0a0c21416d9d9b2c97aedc8aa51e7c6619486a15.png";
const imgEllipse3626 = "/assets/34146dbe8aeb9c1892f700cd9059e41d476db4b0.svg";
const imgFrame1618874015 = "/assets/ba2718e4fa15b12b3ad4fd4e91c67919d3e1c6f3.svg";

export default function WorkCallToAction() {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div 
      className="bg-[#2c2c2b] relative w-full overflow-clip"
      style={{ minHeight: 'clamp(500px, 57.5vw, 869px)' }}
    >
      {/* Background Decorative Elements */}
      <div 
        className="absolute bg-center bg-cover bg-no-repeat opacity-50" 
        style={{ 
          backgroundImage: `url('${imgOutline1}')`,
          height: 'clamp(600px, 72.4vw, 1094px)',
          left: 'clamp(-400px, -35vw, -500px)',
          top: 'clamp(180px, 20.8vw, 314px)',
          width: 'clamp(400px, 46.6vw, 704px)'
        }} 
      />
      <div 
        className="absolute bg-center bg-cover bg-no-repeat" 
        style={{ 
          backgroundImage: `url('${imgPattern0452}')`,
          height: 'clamp(280px, 30.8vw, 466px)',
          left: 'clamp(800px, 84.2vw, 1273px)',
          top: 'clamp(-40px, -4.3vw, -65px)',
          width: 'clamp(180px, 20.2vw, 305px)',
          filter: 'grayscale(100%) brightness(1.8)',
          opacity: 0.25
        }} 
      />
      
      {/* Light Grey Overlay for Top-Right Pattern */}
      <div 
        className="absolute bg-gray-300"
        style={{ 
          height: 'clamp(280px, 30.8vw, 466px)',
          left: 'clamp(800px, 84.2vw, 1273px)',
          top: 'clamp(-40px, -4.3vw, -65px)',
          width: 'clamp(180px, 20.2vw, 305px)',
          opacity: 0.3,
          mask: `url('${imgPattern0452}')`,
          WebkitMask: `url('${imgPattern0452}')`,
          maskSize: 'cover',
          WebkitMaskSize: 'cover',
          maskPosition: 'center',
          WebkitMaskPosition: 'center',
          maskRepeat: 'no-repeat',
          WebkitMaskRepeat: 'no-repeat'
        }} 
      />

      {/* Main Content Container - Responsive and Centered */}
      <div 
        className="absolute flex flex-col items-center justify-start translate-x-[-50%] translate-y-[-50%]"
        style={{
          left: '50%',
          top: 'calc(50% + 0.5px)',
          width: 'clamp(320px, 88.6vw, 1339px)',
          gap: 'clamp(30px, 3vw, 46px)',
          maxWidth: '95vw'
        }}
      >
        {/* Two Column Layout - Responsive */}
        <div 
          className="flex flex-col lg:flex-row items-center justify-center relative w-full"
          style={{ 
            gap: 'clamp(15px, 1.7vw, 25px)'
          }}
        >
          {/* Left Image - Responsive */}
          <div 
            className="bg-white overflow-clip relative flex-shrink-0"
            style={{
              height: 'clamp(280px, 33.9vw, 513px)',
              width: 'clamp(320px, 43.5vw, 657px)',
              borderRadius: 'clamp(20px, 2.6vw, 40px)',
              maxWidth: '100%'
            }}
          >
            <div 
              className="absolute bg-center bg-cover bg-no-repeat inset-0" 
              style={{ backgroundImage: `url('${imgFreepikTheStyleIsCandidImagePhotographyWithNatural627961}')` }} 
            />
            {/* Decorative Circle - Responsive */}
            <div 
              className="absolute"
              style={{
                height: 'clamp(180px, 20.6vw, 311px)',
                left: 'clamp(240px, 32.1vw, 485px)',
                top: 'clamp(-95px, -10.5vw, -159px)',
                width: 'clamp(200px, 23.5vw, 356px)'
              }}
            >
              <div className="absolute inset-[-96.46%_-84.27%]">
                <img alt="" className="block max-w-none size-full" src={imgEllipse3626} />
              </div>
            </div>
          </div>

          {/* Right Content Box - Responsive with Glass Morphism */}
          <div 
            className="bg-white/[0.03] backdrop-blur-md box-border flex flex-col items-start justify-start relative flex-shrink-0 overflow-hidden"
            style={{
              gap: 'clamp(25px, 2.9vw, 44px)',
              height: 'clamp(280px, 33.9vw, 513px)',
              width: 'clamp(320px, 43.5vw, 657px)',
              padding: 'clamp(25px, 3.3vw, 50px)',
              borderRadius: 'clamp(20px, 2.3vw, 35px)',
              maxWidth: '100%'
            }}
          >
            {/* Simple Green Border */}
            <div 
              aria-hidden="true" 
              className="absolute border border-[#74cfaa] border-solid inset-0 pointer-events-none"
              style={{ borderRadius: 'clamp(20px, 2.3vw, 35px)' }}
            />
            
            {/* Gradient Title - Responsive */}
            <div 
              className="bg-clip-text bg-gradient-to-r capitalize font-normal from-[#a095e1] leading-relaxed not-italic relative to-[#74cfaa]"
              style={{ 
                WebkitTextFillColor: "transparent",
                fontSize: 'clamp(32px, 5.3vw, 80px)',
                letterSpacing: 'clamp(-0.8px, -0.11vw, -1.6px)',
                lineHeight: 'clamp(44px, 6vw, 85px)',
                maxWidth: '100%',
                paddingBottom: 'clamp(8px, 1vw, 12px)'
              }}
            >
              Let's Walk You Through It
            </div>

            {/* Content Text - Responsive */}
            <div 
              className="capitalize font-medium not-italic relative text-[#c3c3c3]"
              style={{
                fontSize: 'clamp(14px, 1.5vw, 22px)',
                lineHeight: 'clamp(18px, 1.9vw, 28px)',
                width: '100%'
              }}
            >
              <p className="font-normal mb-0">
                <span>Need proof of execution</span>
                <span className="text-white">?</span>
              </p>
              <p className="font-normal mb-0">
                <span>Examples of speed under pressure</span>
                <span className="text-white">?</span>
              </p>
              <p className="font-normal mb-0">
                <span>A breakdown of results</span>
                <span className="text-white">?</span>
              </p>
              <p className="mb-0">&nbsp;</p>
              <p className="font-bold mb-0 text-white">Ask for a preview.</p>
              <p className="mb-0">&nbsp;</p>
              <p className="font-normal">Our strategy team will share capability decks, sample builds, and visual walkthroughs relevant to your brief.</p>
            </div>
          </div>
        </div>

        {/* CTA Button - Matching CallToActionHero Reference */}
        <div 
          className="flex items-center justify-center relative"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <div 
            className="rounded-full flex items-center justify-center transition-all duration-300"
            style={{ 
              background: 'linear-gradient(90deg, #7afdd6 0%, #a095e1 60%, #b8a4ff 90%)',
              height: 'clamp(50px, 4.3vw, 65px)',
              padding: '0 clamp(20px, 1.7vw, 25px)'
            }}
          >
            <div 
              className="capitalize font-normal leading-[28px] not-italic text-[#231f20] text-nowrap"
              style={{
                fontSize: 'clamp(16px, 1.3vw, 20px)'
              }}
            >
              Speak With Our Producers
            </div>
          </div>
          <div 
            className="relative transition-all duration-300"
            style={{
              width: 'clamp(50px, 4.3vw, 65px)',
              height: 'clamp(50px, 4.3vw, 65px)',
              transform: isHovered ? 'translateX(10px)' : 'translateX(0)'
            }}
          >
            <img alt="" className="block max-w-none size-full" src={imgFrame1618874015} />
          </div>
        </div>
      </div>
    </div>
  );
}