'use client';

const imgEventPhoto = "/assets/29064c5a0d86395e45b642fe4e6daf670490f723.png";
const imgKayanLogo = "/assets/823c27de600ccd2f92af3e073c8e10df3a192e5c.png";

export default function AboutServices() {
  return (
    <div className="bg-[#f3f3f3] w-full py-20">
      <div className="max-w-[1600px] mx-auto px-20">
        {/* Company Description */}
        <div className="text-center mb-20">
          <p className="text-[#888888] text-[32px] leading-[40px] mb-8">
            <span>KayanLive Is A Full-Service </span>
            <span className="font-bold text-[#2c2c2b]">Event Management Company</span>
            <span> With Active Offices In The GCC, Strategically Positioned To Deliver </span>
            <span className="font-bold text-[#2c2c2b]">High-Impact Experiences.</span>
          </p>
          
          <p className="text-[#888888] text-[32px] leading-[40px] mb-8">
            <span>We Create Tech-Driven Experiences That Engage, Inform, And Impress—From </span>
            <span className="font-bold text-[#2c2c2b]">
              2D/3D Animation And Holograms To Robotics, AR/VR, And Interactive Environments.
            </span>
            <br />
            <span className="text-[#888888]">
              Trusted Across All Major Cities, From Abu Dhabi To Riyadh, Our Team Delivers Everything In-House—Fast, Flawless, And Fully Integrated.
            </span>
          </p>
          
          <p className="text-[#888888] text-[32px] leading-[40px] mb-8">
            While Others Hesitate, We Execute—Combining Forward-Thinking Creativity With Technical Expertise To Bring Your Vision To Life Swiftly And Seamlessly.
          </p>
          
          <p className="text-[#888888] text-[32px] leading-[40px]">
            <span>We&apos;re Not Your Typical Event Planning Or Exhibitions Company. When The Plan Shifts And Pressure&apos;s On, We Bring The </span>
            <span className="font-bold text-[#2c2c2b]">Team</span>
            <span>, The </span>
            <span className="font-bold text-[#2c2c2b]">System</span>
            <span>, And The </span>
            <span className="font-bold text-[#2c2c2b]">Speed</span>
            <span> To Make It Work.</span>
          </p>
        </div>

        {/* Service Cards - Full width between navbar edges */}
        <div className="grid grid-cols-2 gap-6">
          {/* Live Events Card with Image */}
          <div 
            className="bg-[#7afdd6] rounded-[40px] overflow-hidden relative"
            style={{ height: '491px' }}
          >
            <div 
              className="absolute inset-0 bg-center bg-cover bg-no-repeat"
              style={{ backgroundImage: `url('${imgEventPhoto}')` }}
            />
            
            {/* Glassmorphism Diamond Overlay */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div 
                className="flex items-center justify-center"
                style={{ 
                  width: '302px',
                  height: '302px',
                  transform: 'rotate(-45deg)'
                }}
              >
                <div 
                  className="flex items-center justify-center relative overflow-hidden"
                  style={{ 
                    width: '214px',
                    height: '214px',
                    background: 'rgba(200, 200, 200, 0.4)',
                    backdropFilter: 'blur(60px) saturate(150%)',
                    WebkitBackdropFilter: 'blur(60px) saturate(150%)',
                    border: '2px solid rgba(220, 220, 220, 0.5)',
                    boxShadow: `
                      inset 0 0 20px rgba(255, 255, 255, 0.3),
                      0 0 40px rgba(255, 255, 255, 0.2)
                    `
                  }}
                >
                  {/* Grayish frosted center with 40% opacity */}
                  <div 
                    className="absolute inset-0"
                    style={{
                      background: `
                        radial-gradient(
                          circle at center,
                          rgba(180, 180, 180, 0.4) 0%,
                          rgba(200, 200, 200, 0.25) 40%,
                          rgba(220, 220, 220, 0.15) 70%,
                          rgba(255, 255, 255, 0.1) 90%
                        )
                      `,
                      backdropFilter: 'blur(20px)',
                      WebkitBackdropFilter: 'blur(20px)',
                      pointerEvents: 'none'
                    }}
                  />
                  
                  {/* Light noise pattern overlay */}
                  <div 
                    className="absolute inset-0"
                    style={{
                      opacity: 0.15,
                      backgroundImage: `
                        repeating-linear-gradient(45deg, transparent, transparent 2px, rgba(255,255,255,.05) 2px, rgba(255,255,255,.05) 4px),
                        repeating-linear-gradient(-45deg, transparent, transparent 2px, rgba(255,255,255,.05) 2px, rgba(255,255,255,.05) 4px)
                      `,
                      pointerEvents: 'none'
                    }}
                  />
                  
                  {/* All edges lighting effect */}
                  <div 
                    className="absolute inset-0"
                    style={{
                      background: `
                        linear-gradient(to right, rgba(255, 255, 255, 0.3) 0%, transparent 10%, transparent 90%, rgba(255, 255, 255, 0.3) 100%),
                        linear-gradient(to bottom, rgba(255, 255, 255, 0.3) 0%, transparent 10%, transparent 90%, rgba(255, 255, 255, 0.3) 100%)
                      `,
                      pointerEvents: 'none'
                    }}
                  />
                  
                  {/* KayanLive Logo inside diamond */}
                  <div 
                    className="bg-center bg-contain bg-no-repeat relative z-10"
                    style={{ 
                      backgroundImage: `url('${imgKayanLogo}')`,
                      width: '159px',
                      height: '53px',
                      transform: 'rotate(45deg)',
                      filter: 'brightness(1.1)'
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Live Events & Shows Text Card */}
          <div 
            className="bg-white rounded-[35px] border border-[#74cfaa] px-12 py-16 flex flex-col justify-between"
            style={{ height: '491px' }}
          >
            <div>
              <h3 
                className="font-normal bg-gradient-to-r from-[#a095e1] to-[#74cfaa] bg-clip-text mb-8"
                style={{
                  fontSize: '80px',
                  lineHeight: '68px',
                  letterSpacing: '-1.6px',
                  WebkitTextFillColor: 'transparent',
                  WebkitBackgroundClip: 'text',
                  backgroundClip: 'text'
                }}
              >
                Live Events &<br />Shows
              </h3>
              
              <div className="text-[#888888] text-[22px] leading-[28px]">
                <p className="mb-6">
                  From Ceremonies And Public Performances To Cultural Spectacles, We Direct And Deliver Stagecraft, Crowd Flow, AV, And Full-Scale Live Show Logistics—Down To Every Last Second Of The Run-Of-Show.
                </p>
                
                <p className="mt-6">
                  <span>Ideal For </span>
                  <span className="text-[#2c2c2b] font-semibold">Corporate Event Management</span>
                  <span> And National Commissions.</span>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Button */}
        <div className="flex justify-center mt-12">
          <style>{`
            @keyframes slideLeftRight {
              0%, 100% { transform: translateX(0); }
              25% { transform: translateX(-5px); }
              75% { transform: translateX(5px); }
            }
            .cta-button:hover .arrow-circle {
              animation: slideLeftRight 1s ease-in-out infinite;
            }
          `}</style>
          
          <button className="cta-button flex items-center gap-2 group relative">
            {/* Main button pill with gradient */}
            <div 
              className="rounded-full flex items-center justify-center pointer-events-none"
              style={{ 
                background: 'linear-gradient(90deg, #7afdd6 0%, #a095e1 60%, #b8a4ff 90%)',
                height: '65px',
                paddingLeft: '36px',
                paddingRight: '36px'
              }}
            >
              <span className="text-[#2c2c2b] text-[20px] font-normal">
                Explore Our Capabilities
              </span>
            </div>
            
            {/* Arrow circle - animated on hover */}
            <div 
              className="arrow-circle rounded-full bg-[#b8a4ff] flex items-center justify-center pointer-events-none"
              style={{ 
                width: '65px',
                height: '65px',
                flexShrink: 0
              }}
            >
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}