'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import Image from 'next/image';

// Assets from Figma - Optimized WebP images
const imgPattern0453 = "/optimized/services/387db429def8526f504ca1667390161ed52cad5a-pattern-0453.webp";
const imgKansi1 = "/optimized/services/53aecf124aa977f71eceeef1d247a0a702b96742-kansi-1.webp";
const imgVector8 = "/assets/47dd71beee42449fc1b6e4720f3ab2a5045e6f9b.svg";
const imgGroup36136 = "/assets/380f31701fab090e70ff718bcec4f0d9f13c7c16.svg";
const imgGroup36137 = "/assets/998232e7f2b2bfc71ea2796c3386b0489faa3a1a.svg";

// Mobile version assets
const imgVector8Mobile = "/assets/1eb3acc2c8c88219785b7efeb93b6f426b4134dd.svg";

export default function ExperienceCenters() {
  const t = useTranslations('services.experienceCenters');
  const [isMobile, setIsMobile] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Prevent hydration mismatch
  if (!mounted) {
    return null;
  }

  if (isMobile) {
    // Mobile Layout - Based on Figma Design
    const cards = [
      {
        title: t('centers.digitalExperience.title'),
        description: t('centers.digitalExperience.description'),
        isDark: true
      },
      {
        title: t('centers.digitalMuseums.title'),
        description: t('centers.digitalMuseums.description'),
        isDark: false
      },
      {
        title: t('centers.expoPavilions.title'),
        description: t('centers.expoPavilions.description'),
        isDark: false
      },
      {
        title: t('centers.innovationCenters.title'),
        description: t('centers.innovationCenters.description'),
        isDark: false
      },
      {
        title: t('centers.permanentInstallations.title'),
        description: t('centers.permanentInstallations.description'),
        isDark: false
      }
    ];

    return (
      <div 
        className="bg-[#f3f3f3] box-border flex flex-col gap-[32px] items-center justify-start px-4 py-[48px] relative overflow-hidden"
        style={{ 
          width: '100vw',
          marginLeft: 'calc(-50vw + 50%)'
        }}
      >
        {/* Title - Optimized Mobile-First Typography */}
        <div className="text-center mb-8 px-6 sm:px-8 md:px-12">
          <h1 
            className="font-bold capitalize tracking-[-2.7px] text-[48px] leading-[52px] md:text-[68px] md:leading-[74px] lg:text-[90px] lg:leading-[98px] xl:text-[120px] xl:leading-[130px]"
            style={{
              fontFamily: '"Poppins", sans-serif'
            }}
          >
            <span 
              style={{
                background: 'linear-gradient(to right, #a095e1, #74cfaa)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}
            >
              {t('title').split(' ').slice(0, 3).join(' ')}
            </span>
            <br />
            <span style={{
              color: '#2c2c2b',
              WebkitTextFillColor: '#2c2c2b'
            }}>
              {t('title').split(' ').slice(3).join(' ')}
            </span>
          </h1>
        </div>

        {/* Impact Badge with Dotted Line */}
        <div className="relative flex flex-col items-center">
          {/* Impact Badge */}
          <div className="overflow-clip relative rounded-[900px] size-[98px] z-20">
            <div className="absolute inset-0 bg-gradient-to-r from-[#a095e1] to-[#74cfaa]"></div>
            <div 
              className="absolute capitalize leading-[0] not-italic text-[19px] text-nowrap text-white" 
              style={{ 
                fontFamily: '"Poppins", sans-serif',
                fontWeight: 'bold',
                top: "calc(50% - 6px)", 
                left: "calc(50% - 31px)" 
              }}
            >
              <p className="leading-[24px] whitespace-pre">impact</p>
            </div>
          </div>

          {/* Vertical Line - Starting from impact badge center */}
          <div className="absolute w-0 left-1/2 transform -translate-x-1/2 z-0" style={{ 
            top: "49px", 
            height: `${cards.length * 320 + cards.length * 40}px` 
          }}>
            <div className="absolute left-[-0.5px] right-[-0.5px] h-full">
              <Image src={imgVector8Mobile} alt="" fill style={{objectFit: 'cover'}} />
            </div>
          </div>
        </div>

        {/* Background decorative elements - Better positioning */}
        <div 
          className="absolute bg-center bg-cover bg-no-repeat h-[120px] w-[92px] pointer-events-none" 
          style={{ 
            backgroundImage: `url('${imgKansi1}')`, 
            left: "-46px", 
            top: "180px" 
          }} 
        />
        <div 
          className="absolute bg-center bg-cover bg-no-repeat h-[180px] w-[120px] pointer-events-none" 
          style={{ 
            backgroundImage: `url('${imgPattern0453}')`, 
            right: "-60px", 
            bottom: "60px" 
          }} 
        />

        {/* Cards - Optimized spacing and positioning */}
        {cards.map((card, index) => (
          <div 
            key={index}
            className={`backdrop-blur-[3.5px] backdrop-filter box-border flex flex-col gap-6 items-center justify-start overflow-clip px-6 py-8 relative rounded-[20px] w-full max-w-[380px] mx-auto z-10 ${
              card.isDark 
                ? 'bg-[#2c2c2b] shadow-[0px_75px_70px_0px_rgba(0,0,0,0.11)]'
                : 'bg-white/60 shadow-[0px_20px_30px_0px_rgba(0,0,0,0.06)]'
            }`}
          >
            {/* Header Badge - Centered */}
            <div 
              className={`box-border flex gap-2.5 items-center justify-center overflow-clip px-4 py-5 relative rounded-[900px] w-full ${
                card.isDark ? 'bg-[rgba(66,62,63,0.93)]' : 'bg-[rgba(255,255,255,0.93)]'
              }`}
            >
              <div 
                className="bg-clip-text bg-gradient-to-r capitalize not-italic relative text-center w-full"
                style={{
                  fontFamily: '"Poppins", sans-serif',
                  fontSize: 'clamp(18px, 4vw, 22px)',
                  lineHeight: '1.2',
                  background: 'linear-gradient(to right, #a095e1 12.378%, #74cfaa 95.173%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text'
                }}
              >
                <p>{card.title}</p>
              </div>
            </div>
            
            {/* Description - Centered */}
            <div 
              className={`lowercase not-italic relative text-center w-full ${
                card.isDark ? 'text-neutral-400' : 'text-[#888888]'
              }`}
              style={{ 
                fontFamily: '"Poppins", sans-serif',
                fontSize: 'clamp(14px, 3.5vw, 16px)',
                lineHeight: '1.5'
              }}
            >
              <p>{card.description}</p>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Desktop Layout - Original Design
  return (
    <div 
      className="bg-[#f3f3f3] relative overflow-hidden" 
      style={{ 
        height: '2400px',
        width: '100vw',
        marginLeft: 'calc(-50vw + 50%)'
      }}
    >
      {/* Decorative Background Elements */}
      <div 
        className="absolute bg-center bg-cover bg-no-repeat pointer-events-none"
        style={{
          height: '636px',
          width: '487px',
          left: '-220px',
          top: '0px',
          backgroundImage: `url('${imgKansi1}')`,
        }}
        data-name="kansi 1"
      />
      
      <div 
        className="absolute bg-center bg-cover bg-no-repeat pointer-events-none"
        style={{
          height: '764px',
          width: '501px',
          right: '-250px',
          bottom: '0px',
          backgroundImage: `url('${imgPattern0453}')`,
        }}
        data-name="Pattern 045 3"
      />

      {/* Title Section - Desktop Optimized */}
      <div 
        className="absolute capitalize not-italic text-center tracking-[-2.7px] translate-x-[-50%] z-30"
        style={{
          top: '91px',
          left: 'calc(50% + 0.5px)',
          width: '969px'
        }}
      >
        <h1 
          className="font-bold"
          style={{
            fontFamily: '"Poppins", sans-serif',
            fontSize: '90px',
            lineHeight: '98px'
          }}
        >
          <span 
            style={{
              background: 'linear-gradient(to right, #a095e1, #74cfaa)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}
          >
            {t('title').split(' ').slice(0, 3).join(' ')}
          </span>
          <br />
          <span style={{
            color: '#2c2c2b',
            WebkitTextFillColor: '#2c2c2b'
          }}>
            {t('title').split(' ').slice(3).join(' ')}
          </span>
        </h1>
      </div>

      {/* Central Timeline Line */}
      <div 
        className="absolute left-1/2 translate-x-[-50%] z-0"
        style={{
          height: '1835.5px',
          width: '0',
          top: '548px'
        }}
      >
        <div className="absolute bottom-0 left-[-0.5px] right-[-0.5px] top-0">
          <Image 
            alt="" 
            className="block max-w-none size-full" 
            src={imgVector8} 
            fill
            style={{objectFit: 'cover'}}
          />
        </div>
      </div>

      {/* Impact Badge */}
      <div 
        className="absolute left-1/2 overflow-clip rounded-[900px] translate-x-[-50%] z-20"
        style={{
          width: '98px',
          height: '98px',
          top: '450px'
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-[#a095e1] to-[#74cfaa]"></div>
        <div 
          className="absolute capitalize not-italic text-nowrap text-white"
          style={{
            fontFamily: '"Poppins", sans-serif',
            fontWeight: 'bold',
            fontSize: '19px',
            lineHeight: '0',
            top: 'calc(50% - 6px)',
            left: 'calc(50% - 31px)'
          }}
        >
          <p style={{ lineHeight: '24px', whiteSpace: 'pre' }}>
            impact
          </p>
        </div>
      </div>

      {/* Content Cards */}
      
      {/* Card 1: Digital Experience Centers */}
      <div 
        className="absolute content-stretch flex items-center justify-start"
        style={{
          left: 'calc(50% - 26px)',
          top: '559px'
        }}
      >
        <div 
          className="relative shrink-0"
          style={{
            height: '52.326px',
            width: '85.163px'
          }}
        >
          <Image 
            alt="" 
            className="block max-w-none size-full" 
            src={imgGroup36136} 
            fill
            style={{objectFit: 'cover'}}
          />
        </div>
        
        <div 
          className="backdrop-blur-[3.5px] backdrop-filter bg-[#2c2c2b] box-border content-stretch flex flex-col gap-7 items-start justify-start overflow-clip relative rounded-[45px] shadow-[0px_75px_70px_0px_rgba(0,0,0,0.11)] shrink-0"
          style={{
            width: '497px',
            paddingLeft: '34px',
            paddingRight: '34px',
            paddingTop: '43px',
            paddingBottom: '43px'
          }}
        >
          <div 
            className="bg-[rgba(66,62,63,0.93)] overflow-clip relative rounded-[900px] shrink-0 w-full flex items-center justify-center"
            style={{ height: '69px' }}
          >
            <div 
              className="bg-clip-text bg-gradient-to-r capitalize not-italic text-center"
              style={{
                fontFamily: '"Poppins", sans-serif',
                background: 'linear-gradient(to right, #a095e1 12.378%, #74cfaa 95.173%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                fontSize: 'clamp(20px, 4vw, 30px)'
              }}
            >
              <p style={{ lineHeight: '36px' }}>
                {t('centers.digitalExperience.title')}
              </p>
            </div>
          </div>
          
          <div 
            className="relative shrink-0 text-neutral-400 w-full lowercase not-italic"
            style={{
              fontFamily: '"Poppins", sans-serif',
              fontSize: '19px',
              lineHeight: '0'
            }}
          >
            <p style={{ lineHeight: '24px' }}>
              {t('centers.digitalExperience.description')}
            </p>
          </div>
        </div>
      </div>

      {/* Card 2: Digital Museums */}
      <div 
        className="absolute flex items-center justify-center"
        style={{
          right: 'calc(50% - 26px)',
          top: '886px'
        }}
      >
        <div className="flex-none rotate-[180deg] scale-y-[-100%]">
          <div className="content-stretch flex items-center justify-start relative">
            <div 
              className="relative shrink-0"
              style={{
                height: '52.326px',
                width: '85.163px'
              }}
            >
              <Image 
                alt="" 
                className="block max-w-none size-full" 
                src={imgGroup36137} 
                fill
                style={{objectFit: 'cover'}}
              />
            </div>
            
            <div 
              className="backdrop-blur-[3.5px] backdrop-filter box-border content-stretch flex flex-col gap-7 items-end justify-start overflow-clip relative rounded-[45px] shadow-[0px_39px_102px_0px_rgba(0,0,0,0.05)] shrink-0"
              style={{
                width: '497px',
                paddingLeft: '34px',
                paddingRight: '34px',
                paddingTop: '43px',
                paddingBottom: '43px'
              }}
            >
              <div className="flex items-center justify-center relative shrink-0">
                <div className="flex-none rotate-[180deg] scale-y-[-100%]">
                  <div 
                    className="bg-white overflow-clip relative rounded-[900px] flex items-center justify-center"
                    style={{
                      height: '69px',
                      width: '275px'
                    }}
                  >
                    <div 
                      className="bg-clip-text bg-gradient-to-r capitalize not-italic text-center"
                      style={{
                        fontFamily: '"Poppins", sans-serif',
                        background: 'linear-gradient(to right, #a095e1 12.378%, #74cfaa 95.173%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text',
                        fontSize: '30px',
                      }}
                    >
                      <p style={{ lineHeight: '36px' }}>
                        {t('centers.digitalMuseums.title')}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div 
                className="flex items-center justify-center min-w-full relative shrink-0"
                style={{ width: 'min-content' }}
              >
                <div className="flex-none rotate-[180deg] scale-y-[-100%] w-full">
                  <div 
                    className="relative text-[#6b6b81] w-full lowercase not-italic"
                    style={{
                      fontFamily: '"Poppins", sans-serif',
                      fontSize: '19px',
                      lineHeight: '24px'
                    }}
                  >
                    <p className="mb-0">
                      {t('centers.digitalMuseums.description')}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Card 3: Expo Pavilions */}
      <div 
        className="absolute content-stretch flex items-center justify-start"
        style={{
          left: 'calc(50% - 26px)',
          top: '1201px'
        }}
      >
        <div 
          className="relative shrink-0"
          style={{
            height: '52.326px',
            width: '85.163px'
          }}
        >
          <Image 
            alt="" 
            className="block max-w-none size-full" 
            src={imgGroup36136} 
            fill
            style={{objectFit: 'cover'}}
          />
        </div>
        
        <div className="flex items-center justify-center relative shrink-0">
          <div className="flex-none rotate-[180deg] scale-y-[-100%]">
            <div 
              className="backdrop-blur-[3.5px] backdrop-filter box-border content-stretch flex flex-col gap-7 items-end justify-start overflow-clip relative rounded-[45px] shadow-[0px_39px_102px_0px_rgba(0,0,0,0.05)]"
              style={{
                width: '497px',
                paddingLeft: '34px',
                paddingRight: '34px',
                paddingTop: '43px',
                paddingBottom: '43px'
              }}
            >
              <div className="flex items-center justify-center relative shrink-0">
                <div className="flex-none rotate-[180deg] scale-y-[-100%]">
                  <div 
                    className="bg-white overflow-clip relative rounded-[900px] flex items-center justify-center"
                    style={{
                      height: '69px',
                      width: '250px'
                    }}
                  >
                    <div 
                      className="bg-clip-text bg-gradient-to-r capitalize not-italic text-center"
                      style={{
                        fontFamily: '"Poppins", sans-serif',
                        background: 'linear-gradient(to right, #a095e1 12.378%, #74cfaa 95.173%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text',
                        fontSize: '30px',
                      }}
                    >
                      <p style={{ lineHeight: '36px' }}>
                        {t('centers.expoPavilions.title')}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div 
                className="flex items-center justify-center min-w-full relative shrink-0"
                style={{ width: 'min-content' }}
              >
                <div className="flex-none rotate-[180deg] scale-y-[-100%] w-full">
                  <div 
                    className="relative text-[#6b6b81] w-full lowercase not-italic"
                    style={{
                      fontFamily: '"Poppins", sans-serif',
                      fontSize: '19px',
                      lineHeight: '24px'
                    }}
                  >
                    <p className="mb-0">
                      {t('centers.expoPavilions.description')}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Card 4: Innovation Centers */}
      <div 
        className="absolute flex items-center justify-center"
        style={{
          right: 'calc(50% - 26px)',
          top: '1528px'
        }}
      >
        <div className="flex-none rotate-[180deg] scale-y-[-100%]">
          <div className="content-stretch flex items-center justify-start relative">
            <div 
              className="relative shrink-0"
              style={{
                height: '52.326px',
                width: '85.163px'
              }}
            >
              <Image 
                alt="" 
                className="block max-w-none size-full" 
                src={imgGroup36137} 
                fill
                style={{objectFit: 'cover'}}
              />
            </div>
            
            <div 
              className="backdrop-blur-[3.5px] backdrop-filter box-border content-stretch flex flex-col gap-7 items-end justify-start overflow-clip relative rounded-[45px] shadow-[0px_39px_102px_0px_rgba(0,0,0,0.05)] shrink-0"
              style={{
                width: '497px',
                paddingLeft: '34px',
                paddingRight: '34px',
                paddingTop: '43px',
                paddingBottom: '43px'
              }}
            >
              <div className="flex items-center justify-center relative shrink-0">
                <div className="flex-none rotate-[180deg] scale-y-[-100%]">
                  <div 
                    className="bg-white overflow-clip relative rounded-[900px] flex items-center justify-center"
                    style={{
                      height: '69px',
                      width: '303px'
                    }}
                  >
                    <div 
                      className="bg-clip-text bg-gradient-to-r capitalize not-italic text-center"
                      style={{
                        fontFamily: '"Poppins", sans-serif',
                        background: 'linear-gradient(to right, #a095e1 12.378%, #74cfaa 95.173%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text',
                        fontSize: '30px',
                      }}
                    >
                      <p style={{ lineHeight: '36px' }}>
                        {t('centers.innovationCenters.title')}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div 
                className="flex items-center justify-center min-w-full relative shrink-0"
                style={{ width: 'min-content' }}
              >
                <div className="flex-none rotate-[180deg] scale-y-[-100%] w-full">
                  <div 
                    className="relative text-[#6b6b81] w-full lowercase not-italic"
                    style={{
                      fontFamily: '"Poppins", sans-serif',
                      fontSize: '19px',
                      lineHeight: '24px'
                    }}
                  >
                    <p className="mb-0">
                      {t('centers.innovationCenters.description')}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Card 5: Permanent Installations */}
      <div 
        className="absolute content-stretch flex items-center justify-start"
        style={{
          left: 'calc(50% - 26px)',
          top: '1855px'
        }}
      >
        <div 
          className="relative shrink-0"
          style={{
            height: '52.326px',
            width: '85.163px'
          }}
        >
          <Image 
            alt="" 
            className="block max-w-none size-full" 
            src={imgGroup36136} 
            fill
            style={{objectFit: 'cover'}}
          />
        </div>
        
        <div className="flex items-center justify-center relative shrink-0">
          <div className="flex-none rotate-[180deg] scale-y-[-100%]">
            <div 
              className="backdrop-blur-[3.5px] backdrop-filter box-border content-stretch flex flex-col gap-7 items-end justify-start overflow-clip relative rounded-[45px] shadow-[0px_39px_102px_0px_rgba(0,0,0,0.05)]"
              style={{
                width: '497px',
                paddingLeft: '34px',
                paddingRight: '34px',
                paddingTop: '43px',
                paddingBottom: '43px'
              }}
            >
              <div className="flex items-center justify-center relative shrink-0">
                <div className="flex-none rotate-[180deg] scale-y-[-100%]">
                  <div 
                    className="bg-white overflow-clip relative rounded-[900px] flex items-center justify-center"
                    style={{
                      height: '69px',
                      width: '365px'
                    }}
                  >
                    <div 
                      className="bg-clip-text bg-gradient-to-r capitalize not-italic text-center"
                      style={{
                        fontFamily: '"Poppins", sans-serif',
                        background: 'linear-gradient(to right, #a095e1 12.378%, #74cfaa 95.173%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text',
                        fontSize: '30px',
                      }}
                    >
                      <p style={{ lineHeight: '36px' }}>
                        {t('centers.permanentInstallations.title')}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div 
                className="flex items-center justify-center min-w-full relative shrink-0"
                style={{ width: 'min-content' }}
              >
                <div className="flex-none rotate-[180deg] scale-y-[-100%] w-full">
                  <div 
                    className="relative text-[#6b6b81] w-full lowercase not-italic"
                    style={{
                      fontFamily: '"Poppins", sans-serif',
                      fontSize: '19px',
                      lineHeight: '24px'
                    }}
                  >
                    <p className="mb-0">
                      {t('centers.permanentInstallations.description')}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}