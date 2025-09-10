import Image from 'next/image';

const imgPattern = "/assets/1349ad630f81a3bb2a509dd8abfe0e4ef85fa329.png";
const kayanLogo = "/assets/a01d943cb7ebcf5598b83131f56810cf97a4e883.png";

export default function WhyKayanLive() {
  return (
    <div className="bg-white relative w-full overflow-hidden min-h-screen lg:min-h-[1450px]">
      {/* Left Pattern - positioned exactly as in Figma with black filter - Hidden on mobile and tablet */}
      <div 
        className="absolute bg-center bg-cover bg-no-repeat z-0 hidden lg:block"
        style={{ 
          backgroundImage: `url('${imgPattern}')`,
          width: '370px',
          height: '572px',
          left: '-124px',
          top: '3px',
          zIndex: 1,
          filter: 'invert(1) brightness(0)',
          opacity: 0.5
        }}
      />
      
      {/* Right Pattern - Bottom (rotated 180 degrees with black filter) - Hidden on mobile and tablet */}
      <div 
        className="absolute z-0 hidden lg:block"
        style={{ 
          width: '370px',
          height: '572px',
          left: '1084px',
          top: '899px',
          zIndex: 1
        }}
      >
        <div 
          className="bg-center bg-cover bg-no-repeat w-full h-full"
          style={{ 
            backgroundImage: `url('${imgPattern}')`,
            transform: 'rotate(180deg)',
            filter: 'invert(1) brightness(0)',
            opacity: 0.5
          }}
        />
      </div>

      {/* Desktop Content Container */}
      <div className="hidden lg:block max-w-[1600px] mx-auto px-4 md:px-8 lg:px-20 relative z-10" style={{ paddingTop: '85px', paddingBottom: '100px' }}>
        {/* Why heading - Original position */}
        <h2 
          className="text-[#2c2c2b] font-medium capitalize"
          style={{
            fontSize: '220px',
            lineHeight: '168px',
            letterSpacing: '-2.2px',
            marginLeft: '117px',
            marginBottom: '37px',
            fontFamily: '"Poppins", sans-serif'
          }}
        >
          Why
        </h2>

        {/* KayanLive Logo */}
        <div 
          className="bg-center bg-contain bg-no-repeat"
          style={{ 
            backgroundImage: `url('${kayanLogo}')`,
            width: '865px',
            height: '289px',
            marginLeft: 'auto',
            marginRight: '0',
            marginBottom: '12px'
          }}
        />

        {/* Founder Text - Right aligned */}
        <div style={{ 
          width: '884px',
          marginLeft: 'auto',
          marginRight: '0',
          marginBottom: '259px'
        }}>
          <p className="text-[#888888] text-[24px] leading-[32px] text-left" style={{ fontFamily: '"Poppins", sans-serif' }}>
            <span>KayanLive Was Founded By </span>
            <span className="text-[#2c2c2b] font-semibold">Khalid Alhasan</span>
            <span>, A Regional Leader In Experiential Strategy And Event Tech. After Over A Decade Leading High-Profile Activations Through A Leading UAE/Saudi Technology Company, He Launched KayanLive To Bring </span>
            <span className="text-[#2c2c2b] font-semibold">Full-Scale, Cross-Functional Event Delivery</span>
            <span> To Clients Who Need More Than Just A Tech Vendor—They Need A Team Who Understands What&apos;s At Stake, And Knows How To Deliver Under Pressure.</span>
          </p>
        </div>

        {/* First Text Block - Full width */}
        <div style={{ 
          width: '100%',
          maxWidth: '995px',
          marginBottom: '66px'
        }}>
          <p className="text-[#888888] text-[24px] leading-[32px] text-left mb-6" style={{ fontFamily: '"Poppins", sans-serif' }}>
            &quot;Kayan&quot; In Arabic Means Being, Identity, And Existence—And That&apos;s Exactly What We&apos;re About. We Believe Every Brand, Every Organization, And Every Idea Has Something Real Behind It—An Essence That Deserves To Be Seen, Felt, And Remembered.
          </p>
          
          <p className="text-[#888888] text-[24px] leading-[32px] text-left" style={{ fontFamily: '"Poppins", sans-serif' }}>
            That&apos;s Why Our Team Is Built To Work From Pitch To Show Day As One Unit—With No Handoffs, No Friction, And No Gaps.
          </p>
        </div>

        {/* Second Text Block - Full width */}
        <div style={{ 
          width: '100%',
          maxWidth: '995px',
          margin: '0 auto'
        }}>
            <p className="text-[#888888] text-[24px] leading-[32px] text-left mb-6" style={{ fontFamily: '"Poppins", sans-serif' }}>
              We&apos;ve Been The Silent Force Behind Headline Events In Saudi Arabia, Rapid-Turnaround Brand Activations In Riyadh, And Exhibition Setups Across The GCC. Our Speed Doesn&apos;t Sacrifice Quality. It Protects It.
            </p>
            
          <p className="text-[#888888] text-[24px] leading-[32px] text-left" style={{ fontFamily: '"Poppins", sans-serif' }}>
            Whether You&apos;re Launching A Pavilion, Opening A Cultural Event, Or Fixing Someone Else&apos;s Mess, We&apos;re The Partner You Call When The Clock Is Already Ticking.
          </p>
        </div>
      </div>

      {/* Mobile Content Container - Optimized for responsive best practices */}
      <section className="lg:hidden flex flex-col items-center justify-center w-full min-h-screen py-8 px-4 sm:px-6 md:px-8 gap-8 sm:gap-10 md:gap-12">
        {/* Why heading - Mobile version with larger fluid typography */}
        <header className="text-center">
          <h1 
            className="font-medium text-[#2c2c2b] leading-tight tracking-tight"
            style={{
              fontSize: 'clamp(4.5rem, 16vw, 7rem)',
              letterSpacing: 'clamp(-1.5px, -0.2vw, -1.2px)',
              fontFamily: '"Poppins", sans-serif'
            }}
          >
            Why
          </h1>
        </header>
        
        {/* KayanLive Logo - Mobile version with larger size */}
        <div className="flex justify-center w-full max-w-sm">
          <Image 
            src={kayanLogo}
            alt="KayanLive Logo" 
            className="w-full h-auto max-w-[320px] object-contain"
            priority
            width={320}
            height={107}
            style={{ aspectRatio: '267/89' }}
          />
        </div>
        
        {/* Content Section with proper semantic structure */}
        <article className="w-full max-w-lg space-y-6 text-center">
          {/* Founder introduction */}
          <section>
            <h2 className="sr-only">Company Foundation</h2>
            <p 
              className="text-[#555555] leading-relaxed"
              style={{
                fontSize: 'clamp(0.875rem, 3vw, 1rem)',
                lineHeight: 'clamp(1.4, 4vw, 1.6)',
                maxWidth: '45ch',
                margin: '0 auto',
                fontFamily: '"Poppins", sans-serif'
              }}
            >
              KayanLive was founded by{' '}
              <span className="text-[#2c2c2b] font-semibold">Khalid Alhasan</span>
              , a regional leader in experiential strategy and event tech. After over a decade leading high-profile activations through a leading UAE/Saudi technology company, he launched KayanLive to bring{' '}
              <span className="text-[#2c2c2b] font-semibold">full-scale, cross-functional event delivery</span>
              {' '}to clients who need more than just a tech vendor—they need a team who understands what&apos;s at stake, and knows how to deliver under pressure.
            </p>
          </section>
          
          {/* Company philosophy */}
          <section>
            <h2 className="sr-only">Our Philosophy</h2>
            <div className="space-y-4">
              <p 
                className="text-[#555555] leading-relaxed"
                style={{
                  fontSize: 'clamp(0.875rem, 3vw, 1rem)',
                  lineHeight: 'clamp(1.4, 4vw, 1.6)',
                  maxWidth: '50ch',
                  margin: '0 auto',
                  fontFamily: '"Poppins", sans-serif'
                }}
              >
                &quot;Kayan&quot; in Arabic means being, identity, and existence—and that&apos;s exactly what we&apos;re about. We believe every brand, every organization, and every idea has something real behind it—an essence that deserves to be seen, felt, and remembered.
              </p>
              
              <p 
                className="text-[#555555] leading-relaxed"
                style={{
                  fontSize: 'clamp(0.875rem, 3vw, 1rem)',
                  lineHeight: 'clamp(1.4, 4vw, 1.6)',
                  maxWidth: '50ch',
                  margin: '0 auto',
                  fontFamily: '"Poppins", sans-serif'
                }}
              >
                That&apos;s why our team is built to work from pitch to show day as one unit—with no handoffs, no friction, and no gaps.
              </p>
            </div>
          </section>
          
          {/* Company experience and approach */}
          <section>
            <h2 className="sr-only">Our Experience</h2>
            <div className="space-y-4">
              <p 
                className="text-[#555555] leading-relaxed"
                style={{
                  fontSize: 'clamp(0.875rem, 3vw, 1rem)',
                  lineHeight: 'clamp(1.4, 4vw, 1.6)',
                  maxWidth: '50ch',
                  margin: '0 auto',
                  fontFamily: '"Poppins", sans-serif'
                }}
              >
                We&apos;ve been the silent force behind headline events in Saudi Arabia, rapid-turnaround brand activations in Riyadh, and exhibition setups across the GCC. Our speed doesn&apos;t sacrifice quality. It protects it.
              </p>
              
              <p 
                className="text-[#555555] leading-relaxed"
                style={{
                  fontSize: 'clamp(0.875rem, 3vw, 1rem)',
                  lineHeight: 'clamp(1.4, 4vw, 1.6)',
                  maxWidth: '50ch',
                  margin: '0 auto',
                  fontFamily: '"Poppins", sans-serif'
                }}
              >
                Whether you&apos;re launching a pavilion, opening a cultural event, or fixing someone else&apos;s mess, we&apos;re the partner you call when the clock is already ticking.
              </p>
            </div>
          </section>
        </article>
      </section>
    </div>
  );
}