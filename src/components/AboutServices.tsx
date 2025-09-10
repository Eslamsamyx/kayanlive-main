'use client';

const imgEventPhoto = "/assets/29064c5a0d86395e45b642fe4e6daf670490f723.png";
const imgKayanLogo = "/assets/823c27de600ccd2f92af3e073c8e10df3a192e5c.png";

export default function AboutServices() {
  return (
    <div className="bg-[#f3f3f3] w-full py-12 sm:py-16 md:py-20">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-8 md:px-12 lg:px-20">
        {/* Company Description */}
        <div className="text-center mb-6 md:mb-12 lg:mb-16">
          <p className="text-[#888888] mb-6 sm:mb-8" style={{ fontSize: 'clamp(18px, 4vw, 32px)', lineHeight: 'clamp(24px, 5vw, 40px)' }}>
            <span>KayanLive Is A Full-Service </span>
            <span className="font-bold text-[#2c2c2b]">Event Management Company</span>
            <span> With Active Offices In The GCC, Strategically Positioned To Deliver </span>
            <span className="font-bold text-[#2c2c2b]">High-Impact Experiences.</span>
          </p>
          
          <p className="text-[#888888] mb-6 sm:mb-8" style={{ fontSize: 'clamp(18px, 4vw, 32px)', lineHeight: 'clamp(24px, 5vw, 40px)' }}>
            <span>We Create Tech-Driven Experiences That Engage, Inform, And Impress—From </span>
            <span className="font-bold text-[#2c2c2b]">
              2D/3D Animation And Holograms To Robotics, AR/VR, And Interactive Environments.
            </span>
            <br />
            <span className="text-[#888888]">
              Trusted Across All Major Cities, From Abu Dhabi To Riyadh, Our Team Delivers Everything In-House—Fast, Flawless, And Fully Integrated.
            </span>
          </p>
          
          <p className="text-[#888888] mb-6 sm:mb-8" style={{ fontSize: 'clamp(18px, 4vw, 32px)', lineHeight: 'clamp(24px, 5vw, 40px)' }}>
            While Others Hesitate, We Execute—Combining Forward-Thinking Creativity With Technical Expertise To Bring Your Vision To Life Swiftly And Seamlessly.
          </p>
          
          <p className="text-[#888888]" style={{ fontSize: 'clamp(18px, 4vw, 32px)', lineHeight: 'clamp(24px, 5vw, 40px)' }}>
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {/* Live Events Card with Image */}
          <div 
            className="bg-[#7afdd6] rounded-[40px] overflow-hidden relative min-h-[300px] lg:h-[491px]"
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
                  width: 'clamp(200px, 40vw, 302px)',
                  height: 'clamp(200px, 40vw, 302px)',
                  transform: 'rotate(-45deg)'
                }}
              >
                <div 
                  className="flex items-center justify-center relative overflow-hidden bg-white/[0.4] backdrop-blur-3xl box-border"
                  style={{ 
                    width: 'clamp(140px, 28vw, 214px)',
                    height: 'clamp(140px, 28vw, 214px)'
                  }}
                >
                  {/* KayanLive Logo inside diamond */}
                  <div 
                    className="bg-center bg-contain bg-no-repeat relative z-10"
                    style={{ 
                      backgroundImage: `url('${imgKayanLogo}')`,
                      width: 'clamp(100px, 20vw, 159px)',
                      height: 'clamp(33px, 7vw, 53px)',
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
            className="bg-white rounded-[35px] border border-[#74cfaa] px-6 sm:px-8 lg:px-12 py-8 sm:py-12 lg:py-16 flex flex-col justify-between min-h-[300px] lg:h-[491px]"
          >
            <div>
              <h3 
                className="font-normal bg-gradient-to-r from-[#a095e1] to-[#74cfaa] bg-clip-text mb-6 sm:mb-8"
                style={{
                  fontSize: 'clamp(32px, 8vw, 80px)',
                  lineHeight: 'clamp(28px, 7vw, 68px)',
                  letterSpacing: 'clamp(-0.8px, -0.2vw, -1.6px)',
                  WebkitTextFillColor: 'transparent',
                  WebkitBackgroundClip: 'text',
                  backgroundClip: 'text'
                }}
              >
                Live Events &<br />Shows
              </h3>
              
              <div className="text-[#888888]" style={{ fontSize: 'clamp(16px, 3vw, 22px)', lineHeight: 'clamp(22px, 4vw, 28px)' }}>
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
        <div className="flex justify-center mt-8 sm:mt-10 md:mt-12">
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
                height: 'clamp(50px, 8vw, 65px)',
                paddingLeft: 'clamp(20px, 4vw, 36px)',
                paddingRight: 'clamp(20px, 4vw, 36px)'
              }}
            >
              <span className="text-[#2c2c2b] font-normal" style={{ fontSize: 'clamp(16px, 3vw, 20px)' }}>
                Explore Our Capabilities
              </span>
            </div>
            
            {/* Arrow circle - animated on hover */}
            <div 
              className="arrow-circle rounded-full bg-[#b8a4ff] flex items-center justify-center pointer-events-none"
              style={{ 
                width: 'clamp(50px, 8vw, 65px)',
                height: 'clamp(50px, 8vw, 65px)',
                flexShrink: 0
              }}
            >
              <svg width="clamp(20, 4vw, 26)" height="clamp(20, 4vw, 26)" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}