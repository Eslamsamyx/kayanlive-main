'use client';

// Assets from Figma
const imgPattern0453 = "/assets/6cdd4333a240b46dead9df86c5a83772e81b76fc.png";
const imgKansi1 = "/assets/bdd0b482d2a4b06725b67356c9cb8f5f989799c7.png";
const imgVector8 = "/assets/47dd71beee42449fc1b6e4720f3ab2a5045e6f9b.svg";
const imgGroup36136 = "/assets/380f31701fab090e70ff718bcec4f0d9f13c7c16.svg";
const imgGroup36137 = "/assets/998232e7f2b2bfc71ea2796c3386b0489faa3a1a.svg";

export default function ExperienceCenters() {
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

      {/* Title Section */}
      <div 
        className="absolute bg-clip-text capitalize not-italic text-center tracking-[-2.7px] translate-x-[-50%]"
        style={{
          fontFamily: "'FONTSPRING DEMO - Visby CF Medium', sans-serif",
          fontSize: '0px',
          lineHeight: '0',
          top: '91px',
          left: 'calc(50% + 0.5px)',
          width: '969px',
          WebkitTextFillColor: 'transparent'
        }}
      >
        <p 
          className="font-bold"
          style={{
            fontFamily: "'FONTSPRING DEMO - Visby CF Demi Bold', sans-serif",
            fontSize: '90px',
            lineHeight: '85px'
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
            Experience Centers and{' '}
          </span>
          <span className="text-[#2c2c2b]">
            Permanent Installations
          </span>
        </p>
      </div>

      {/* Central Timeline Line */}
      <div 
        className="absolute left-1/2 translate-x-[-50%]"
        style={{
          height: '1835.5px',
          width: '0',
          top: '407.5px'
        }}
      >
        <div className="absolute bottom-0 left-[-0.5px] right-[-0.5px] top-0">
          <img 
            alt="" 
            className="block max-w-none size-full" 
            src={imgVector8} 
          />
        </div>
      </div>

      {/* Impact Badge */}
      <div 
        className="absolute left-1/2 overflow-clip rounded-[900px] translate-x-[-50%]"
        style={{
          width: '98px',
          height: '98px',
          top: '319px'
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-[#a095e1] to-[#74cfaa]"></div>
        <div 
          className="absolute capitalize not-italic text-nowrap text-white"
          style={{
            fontFamily: "'Aeonik', sans-serif",
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
          top: '468px'
        }}
      >
        <div 
          className="relative shrink-0"
          style={{
            height: '52.326px',
            width: '85.163px'
          }}
        >
          <img 
            alt="" 
            className="block max-w-none size-full" 
            src={imgGroup36136} 
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
                fontFamily: "'FONTSPRING DEMO - Visby CF Demi Bold', sans-serif",
                background: 'linear-gradient(to right, #a095e1 12.378%, #74cfaa 95.173%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                fontSize: 'clamp(20px, 4vw, 30px)'
              }}
            >
              <p style={{ lineHeight: '36px' }}>
                Digital Experience Centers
              </p>
            </div>
          </div>
          
          <div 
            className="relative shrink-0 text-neutral-400 w-full lowercase not-italic"
            style={{
              fontFamily: "'Aeonik', sans-serif",
              fontSize: '19px',
              lineHeight: '0'
            }}
          >
            <p style={{ lineHeight: '24px' }}>
              We design and build digital experience centers across the GCC—spaces where interaction meets innovation. These are permanent environments that blend immersive storytelling, interactive surfaces, and real-time content to inform, engage, and inspire.
            </p>
          </div>
        </div>
      </div>

      {/* Card 2: Digital Museums */}
      <div 
        className="absolute flex items-center justify-center"
        style={{
          right: 'calc(50% - 26px)',
          top: '835px'
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
              <img 
                alt="" 
                className="block max-w-none size-full" 
                src={imgGroup36137} 
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
                        fontFamily: "'FONTSPRING DEMO - Visby CF Demi Bold', sans-serif",
                        background: 'linear-gradient(to right, #a095e1 12.378%, #74cfaa 95.173%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text',
                        fontSize: '30px',
                      }}
                    >
                      <p style={{ lineHeight: '36px' }}>
                        Digital Museums
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
                      fontFamily: "'Aeonik', sans-serif",
                      fontSize: '19px',
                      lineHeight: '24px'
                    }}
                  >
                    <p className="mb-0">
                      KayanLive builds fully immersive digital museums, combining projection mapping, AR and VR exhibits, gesture-based controls, and responsive media.
                    </p>
                    <p className="mb-0">
                      Our work brings history, culture, and innovation to life in ways that are engaging, educational, and emotionally resonant.
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
          top: '1190px'
        }}
      >
        <div 
          className="relative shrink-0"
          style={{
            height: '52.326px',
            width: '85.163px'
          }}
        >
          <img 
            alt="" 
            className="block max-w-none size-full" 
            src={imgGroup36136} 
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
                        fontFamily: "'FONTSPRING DEMO - Visby CF Demi Bold', sans-serif",
                        background: 'linear-gradient(to right, #a095e1 12.378%, #74cfaa 95.173%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text',
                        fontSize: '30px',
                      }}
                    >
                      <p style={{ lineHeight: '36px' }}>
                        Expo Pavilions
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
                      fontFamily: "'Aeonik', sans-serif",
                      fontSize: '19px',
                      lineHeight: '24px'
                    }}
                  >
                    <p className="mb-0">
                      We design and deliver full-scale expo pavilions, ready for global exhibitions, tourism showcases, and national storytelling.
                    </p>
                    <p className="mb-0">
                      Our pavilions fuse architecture, digital content, spatial choreography, and visitor analytics into seamless, high-impact environments.
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
          top: '1557px'
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
              <img 
                alt="" 
                className="block max-w-none size-full" 
                src={imgGroup36137} 
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
                        fontFamily: "'FONTSPRING DEMO - Visby CF Demi Bold', sans-serif",
                        background: 'linear-gradient(to right, #a095e1 12.378%, #74cfaa 95.173%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text',
                        fontSize: '30px',
                      }}
                    >
                      <p style={{ lineHeight: '36px' }}>
                        Innovation Centers
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
                      fontFamily: "'Aeonik', sans-serif",
                      fontSize: '19px',
                      lineHeight: '24px'
                    }}
                  >
                    <p className="mb-0">
                      Innovation deserves a stage. We build innovation centers that combine interactive demos, holographic displays, robotics, and smart content systems—all within flexible, modular environments.
                    </p>
                    <p className="mb-0">
                      These hubs attract investors, impress officials, and showcase progress with style and clarity.
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
          top: '1914px'
        }}
      >
        <div 
          className="relative shrink-0"
          style={{
            height: '52.326px',
            width: '85.163px'
          }}
        >
          <img 
            alt="" 
            className="block max-w-none size-full" 
            src={imgGroup36136} 
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
                        fontFamily: "'FONTSPRING DEMO - Visby CF Demi Bold', sans-serif",
                        background: 'linear-gradient(to right, #a095e1 12.378%, #74cfaa 95.173%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text',
                        fontSize: '30px',
                      }}
                    >
                      <p style={{ lineHeight: '36px' }}>
                        Permanent Installations
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
                      fontFamily: "'Aeonik', sans-serif",
                      fontSize: '19px',
                      lineHeight: '24px'
                    }}
                  >
                    <p className="mb-0">
                      From national storytelling zones to branded flagship experiences, we deliver permanent installations that fuse architecture, lighting, and digital content into one cohesive space.
                    </p>
                    <p className="mb-0">
                      Built to last. Designed to evolve.
                    </p>
                    <p className="mb-0">&nbsp;</p>
                    <p className="mb-0">
                      As a leading event and exhibition company, we transform venues into interactive environments that live well beyond the launch date.
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