'use client';

import Image from 'next/image';
import { useTranslations } from 'next-intl';

const imgRectangle6 = "/assets/29064c5a0d86395e45b642fe4e6daf670490f723.png";
const imgPattern0212 = "/assets/ef25fd14e49122ddd6cbc03c8a92caff93500eb7.png";
const imgPattern0452 = "/assets/6cdd4333a240b46dead9df86c5a83772e81b76fc.png";
const imgVector449 = "/assets/f7382026e38c26d5af789578200259cf00d646d5.svg";
const imgVector450 = "/assets/2e7d38a51401314bc36af86961b4180f9a81bc96.svg";
const imgVector451 = "/assets/27f7bc8b7057872a6c373109cb92fc81093df0cd.svg";
const imgVector452 = "/assets/b435e1176051bfb6d5144bfe3e7069007ac2258c.svg";
const imgFrame1618874015 = "/assets/ca9b4647bcda5167d4ae65dc099e9f345b86ecff.svg";

export default function ExecutionSection() {
  const t = useTranslations();
  
  return (
    <div className="relative w-full bg-white overflow-hidden">
      <div className="max-w-[1600px] mx-auto px-4 py-8 md:py-12 lg:py-20">
        <div 
          className="relative rounded-[40px] md:rounded-[60px] lg:rounded-[82px] overflow-hidden" 
          style={{ 
            minHeight: '400px',
            height: 'clamp(400px, 60vh, 807px)'
          }}
        >
          {/* Background Image - Full container */}
          <div
            className="absolute inset-0 bg-center bg-cover bg-no-repeat"
            style={{ 
              backgroundImage: `url('${imgRectangle6}')`,
              borderRadius: 'inherit'
            }}
          />
          
          {/* Dark blur overlay - responsive positioning */}
          <div
            className="absolute bg-[#2c2c2b] blur-[100px] md:blur-[150px] lg:blur-[200px] filter"
            style={{
              width: 'clamp(400px, 65vw, 983px)',
              height: 'clamp(800px, 150vh, 1500px)',
              left: 'clamp(-300px, -25vw, -412px)',
              top: 'clamp(-200px, -20vh, -284px)'
            }}
          />
          
          {/* Decorative arrow shapes - responsive sizing */}
          <div className="absolute hidden lg:block" 
            style={{ 
              left: 'clamp(200px, 21vw, 323px)', 
              top: 'clamp(-300px, -35vh, -351px)' 
            }}>
            {/* Large arrow */}
            <div className="absolute flex items-center justify-center" 
              style={{ 
                width: 'clamp(400px, 40vw, 599px)',
                height: 'clamp(600px, 60vh, 900px)',
                left: 'clamp(200px, 21vw, 323px)',
                top: 'clamp(-300px, -35vh, -351px)'
              }}>
              <div style={{ transform: 'rotate(7.038deg) skewX(0.038deg)' }}>
                <div className="relative" style={{ 
                  width: 'clamp(330px, 33vw, 500px)', 
                  height: 'clamp(560px, 56vh, 845px)' 
                }}>
                  <div className="absolute" style={{ inset: '-29.57% -50.01%' }}>
                    <Image alt="" className="block w-full h-full max-w-none" src={imgVector449} fill style={{objectFit: 'cover'}} />
                  </div>
                </div>
              </div>
            </div>
            
            {/* Medium arrow */}
            <div className="absolute flex items-center justify-center"
              style={{ 
                width: 'clamp(295px, 30vw, 445px)',
                height: 'clamp(445px, 44vh, 668px)',
                left: 'clamp(280px, 28vw, 418px)',
                top: 'clamp(-200px, -25vh, -259px)'
              }}>
              <div style={{ transform: 'rotate(7.015deg)' }}>
                <div className="relative" style={{ 
                  width: 'clamp(245px, 25vw, 371px)', 
                  height: 'clamp(415px, 42vh, 627px)' 
                }}>
                  <div className="absolute" style={{ inset: '-15.94% -26.96%' }}>
                    <Image alt="" className="block w-full h-full max-w-none" src={imgVector450} fill style={{objectFit: 'cover'}} />
                  </div>
                </div>
              </div>
            </div>
            
            {/* Small arrow 1 */}
            <div className="absolute flex items-center justify-center"
              style={{ 
                width: 'clamp(230px, 23vw, 344px)',
                height: 'clamp(345px, 34vh, 517px)',
                left: 'clamp(330px, 33vw, 497px)',
                top: 'clamp(-180px, -24vh, -240px)'
              }}>
              <div style={{ transform: 'rotate(7.022deg)' }}>
                <div className="relative" style={{ 
                  width: 'clamp(190px, 19vw, 287px)', 
                  height: 'clamp(320px, 32vh, 486px)' 
                }}>
                  <div className="absolute" style={{ inset: '-24.91% -42.12%' }}>
                    <Image alt="" className="block w-full h-full max-w-none" src={imgVector451} fill style={{objectFit: 'cover'}} />
                  </div>
                </div>
              </div>
            </div>
            
            {/* Small arrow 2 */}
            <div className="absolute flex items-center justify-center"
              style={{ 
                width: 'clamp(150px, 15vw, 229px)',
                height: 'clamp(230px, 23vh, 343px)',
                left: 'clamp(410px, 41vw, 613px)',
                top: 'clamp(-170px, -23vh, -228px)'
              }}>
              <div style={{ transform: 'rotate(7.027deg)' }}>
                <div className="relative" style={{ 
                  width: 'clamp(125px, 13vw, 191px)', 
                  height: 'clamp(215px, 21vh, 322px)' 
                }}>
                  <div className="absolute" style={{ inset: '-37.54% -63.47%' }}>
                    <Image alt="" className="block w-full h-full max-w-none" src={imgVector452} fill style={{objectFit: 'cover'}} />
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Bottom left pattern - responsive */}
          <div
            className="absolute bg-center bg-cover bg-no-repeat hidden lg:block opacity-60"
            style={{ 
              backgroundImage: `url('${imgPattern0212}')`,
              width: 'clamp(400px, 57vw, 862px)',
              height: 'clamp(400px, 56vh, 853px)',
              bottom: 'clamp(-300px, -30vh, -447px)',
              right: 'clamp(500px, 70vw, 1049px)'
            }}
          />
          
          {/* Main content card - responsive */}
          <div
            className="absolute bg-white/[0.03] backdrop-blur-md flex flex-col gap-8 md:gap-16 lg:gap-[140px] items-start justify-start overflow-hidden px-6 py-8 md:px-10 md:py-12 lg:px-[61px] lg:py-[68px] rounded-[40px] md:rounded-[60px] lg:rounded-[76px] w-[90%] max-w-[854px]"
            style={{ 
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)'
            }}
          >
            {/* Heading - responsive font sizing */}
            <h2 className="capitalize text-white font-normal w-full lg:w-[524px]"
              style={{
                fontSize: 'clamp(32px, 8vw, 80px)',
                lineHeight: 'clamp(36px, 9vw, 77px)'
              }}>
              {t('execution.heading')}
            </h2>
            
            {/* CTA Button - responsive */}
            <div className="flex flex-row items-center">
              <button className="flex items-center justify-center gap-2 md:gap-2.5 bg-[#7afdd6] hover:bg-[#6ee8c5] transition-colors duration-300 rounded-full px-4 py-3 md:px-6 md:py-4 lg:px-[25px] lg:py-[18px] h-[50px] md:h-[60px] lg:h-[65px]">
                <span className="capitalize text-[#231f20] font-normal whitespace-nowrap"
                  style={{
                    fontSize: 'clamp(16px, 2vw, 20px)',
                    lineHeight: 'clamp(22px, 2.5vw, 28px)'
                  }}>
                  {t('execution.cta')}
                </span>
              </button>
              <div className="relative ml-[-3px] md:ml-[-4px] lg:ml-[-5px]"
                style={{
                  width: 'clamp(50px, 5vw, 65px)',
                  height: 'clamp(50px, 5vw, 65px)'
                }}>
                <Image alt="" className="block w-full h-full" src={imgFrame1618874015} fill style={{objectFit: 'cover'}} />
              </div>
            </div>
          </div>
          
          {/* Top right pattern - responsive */}
          <div
            className="absolute bg-center bg-cover bg-no-repeat hidden lg:block opacity-70"
            style={{ 
              backgroundImage: `url('${imgPattern0452}')`,
              width: 'clamp(250px, 29vw, 437px)',
              height: 'clamp(380px, 44vh, 666px)',
              right: 'clamp(-50px, -3vw, -37px)',
              top: 'clamp(-10px, -1vh, -17px)'
            }}
          />
          
          {/* Diamond decoration elements - responsive */}
          <div className="absolute left-4 md:left-6 lg:left-8 bottom-10 md:bottom-16 lg:bottom-20">
            <div className="flex gap-2 md:gap-3 lg:gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div 
                  key={i}
                  className="rotate-45 bg-white/10 backdrop-blur-sm"
                  style={{
                    width: 'clamp(30px, 3vw, 48px)',
                    height: 'clamp(30px, 3vw, 48px)',
                    animation: `pulse ${2 + i * 0.5}s ease-in-out infinite`,
                    animationDelay: `${i * 0.2}s`
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
      
      {/* CSS Animation */}
      <style jsx>{`
        @keyframes pulse {
          0%, 100% {
            opacity: 0.1;
            transform: rotate(45deg) scale(0.8);
          }
          50% {
            opacity: 0.3;
            transform: rotate(45deg) scale(1);
          }
        }
      `}</style>
    </div>
  );
}