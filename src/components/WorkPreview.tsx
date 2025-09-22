'use client';

import Image from 'next/image';

// Assets from Figma - Optimized WebP images
const imgRectangle4236 = "/optimized/work/90670fd4aa7532055735b4b5798722dbbd71d728-work-preview-1.webp";
const imgRectangle4237 = "/optimized/work/2a4d34f21d6dfbf73191214b2c763f5aa8dee8a4-work-preview-2.webp";
const imgRectangle4238 = "/optimized/work/648cc79cc21b1fc4cac174b9d94eb707507d3754-work-preview-3.webp";
const imgPattern0341 = "/optimized/work/6d82768da6799e3a20aaaf2a69920f81d34888e9-work-pattern-1.webp";
const imgPattern0212 = "/optimized/work/e6df81b755cd4ab7252dbbecf7a43a27372c9ca8-work-pattern-2.webp";

export default function WorkPreview() {
  return (
    <div className="bg-[#2c2c2b] overflow-clip relative rounded-bl-[20px] rounded-br-[20px] rounded-tl-[61px] rounded-tr-[61px] w-full h-[1031px]">
      {/* Three Event Images - Right Side */}
      <div className="absolute left-[226px] top-0">
        {/* Image 3 - Rightmost */}
        <div className="absolute h-[948px] left-[813px] top-0 w-[631px] overflow-hidden">
          <Image
            alt=""
            className="block max-w-none size-full object-cover"
            src={imgRectangle4236}
            fill
            sizes="(max-width: 768px) 100vw, 631px"
            priority
          />
          {/* Fade overlay for bottom and left */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#2c2c2b] from-0% via-[#2c2c2b]/50 via-30% to-transparent to-60% opacity-80" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#2c2c2b] via-transparent to-transparent opacity-40" />
        </div>
        
        {/* Image 2 - Middle */}
        <div className="absolute h-[948px] left-[406px] top-0 w-[631px] overflow-hidden">
          <Image
            alt=""
            className="block max-w-none size-full object-cover"
            src={imgRectangle4237}
            fill
            sizes="(max-width: 768px) 100vw, 631px"
            priority
          />
          {/* Fade overlay for bottom and left */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#2c2c2b] from-0% via-[#2c2c2b]/50 via-30% to-transparent to-60% opacity-80" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#2c2c2b] via-transparent to-transparent opacity-40" />
        </div>
        
        {/* Image 1 - Leftmost */}
        <div className="absolute h-[948px] left-0 top-0 w-[631px] overflow-hidden">
          <Image
            alt=""
            className="block max-w-none size-full object-cover"
            src={imgRectangle4238}
            fill
            sizes="(max-width: 768px) 100vw, 631px"
            priority
          />
          {/* Fade overlay for bottom and left */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#2c2c2b] from-0% via-[#2c2c2b]/50 via-30% to-transparent to-60% opacity-80" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#2c2c2b] via-transparent to-transparent opacity-40" />
        </div>
      </div>
      
      {/* Blur Effect - Left Side - Responsive */}
      <div className="absolute bg-[#2c2c2b] blur-[100px] filter" style={{
        height: '145%', // 1500px / 1031px = 145%
        left: '-27.2%', // -412px / 1512px = -27.2%
        top: '-27.5%', // -284px / 1031px = -27.5%
        width: '67.1%' // 1015px / 1512px = 67.1%
      }} />
      
      {/* Main Content - Left Side - Responsive */}
      <div className="absolute capitalize flex flex-col items-start justify-start" style={{
        left: '3.8%', // 57px / 1512px = 3.8%
        top: '9.4%', // 97px / 1031px = 9.4%
        width: '51.5%', // 778px / 1512px = 51.5%
        gap: 'clamp(2rem, 3.8vw, 58px)' // 58px responsive
      }}>
        {/* Title Section */}
        <div className="flex flex-col items-start justify-start w-full font-medium" style={{
          gap: 'clamp(0.75rem, 1.2vw, 18px)', // 18px responsive
          fontSize: 'clamp(4rem, 9.3vw, 140px)', // 140px responsive
          letterSpacing: '-5.6px'
        }}>
          {/* All title text in one container */}
          <div className="text-white w-full space-y-2">
            <p className="mb-0" style={{ lineHeight: 'clamp(4.5rem, 8.5vw, 129px)' }}>A Preview</p>
            <p className="mb-0" style={{ lineHeight: 'clamp(4.5rem, 8.5vw, 129px)' }}>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;of What&apos;s</p>
            <p 
              className="mb-0 bg-clip-text bg-gradient-to-r from-[#a095e1] to-[#74cfaa]" 
              style={{ 
                WebkitTextFillColor: "transparent",
                lineHeight: 'clamp(5rem, 11.6vw, 175px)'
              }}
            >
              Coming
            </p>
          </div>
        </div>
        
        {/* Description Text */}
        <div className="font-medium text-[#fdfdfd]" style={{
          lineHeight: 'clamp(1.2rem, 1.9vw, 28px)', // 28px responsive
          fontSize: 'clamp(1rem, 1.5vw, 22px)', // 22px responsive
          width: 'clamp(300px, 43.5vw, 658px)' // 658px responsive
        }}>
          <p className="mb-0">
            Our case study archive is growing and will soon feature flagship moments from across the UAE and Saudi Arabia, covering live events, immersive tech activations, public sector launches, and large-scale brand experiences.
          </p>
          <p className="mb-0">&nbsp;</p>
          <p className="mb-0">
            These will highlight the work that positions us among the top event management companies.
          </p>
        </div>
      </div>
      
      {/* Bottom Blur Effect - Responsive */}
      <div className="absolute backdrop-blur-[51.5px] bg-[rgba(217,217,217,0.01)]" style={{
        height: '21.4%', // 221px / 1031px = 21.4%
        left: '0%',
        top: '78.6%', // 810px / 1031px = 78.6%
        width: '96.2%' // 1454px / 1512px = 96.2%
      }} />
      
      {/* Pattern Overlay - Bottom Right - Responsive */}
      <div 
        className="absolute bg-center bg-cover bg-no-repeat"
        style={{ 
          height: '44.2%', // 456px / 1031px = 44.2%
          top: '78.6%', // 810px / 1031px = 78.6%
          width: '45.1%', // 682px / 1512px = 45.1%
          left: "calc(50% + 29.7vw)", // 449px / 1512px = 29.7%
          transform: "translateX(-50%)",
          backgroundImage: `url('${imgPattern0341}')` 
        }}
      />
      
      {/* Pattern Overlay - Bottom Left - Responsive */}
      <div className="absolute flex items-center justify-center" style={{
        height: '81.7%', // 842px / 1031px = 81.7%
        left: '-13.8%', // -209px / 1512px = -13.8%
        top: '73.9%', // 762px / 1031px = 73.9%
        width: '55.1%' // 833px / 1512px = 55.1%
      }}>
        <div className="rotate-[90deg] flex-none">
          <div 
            className="bg-center bg-cover bg-no-repeat"
            style={{ 
              height: 'clamp(400px, 55.1vw, 833px)', // 833px responsive
              width: 'clamp(420px, 55.7vw, 842px)', // 842px responsive
              backgroundImage: `url('${imgPattern0212}')` 
            }}
          />
        </div>
      </div>
      
      {/* Inner Shadow Effect */}
      <div className="absolute inset-0 pointer-events-none shadow-[-100px_0px_200px_0px_inset_#231f20]" />
    </div>
  );
}