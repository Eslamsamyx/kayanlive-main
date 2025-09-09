const imgPattern = "/assets/1349ad630f81a3bb2a509dd8abfe0e4ef85fa329.png";
const imgKayanLogo = "/assets/a01d943cb7ebcf5598b83131f56810cf97a4e883.png";

export default function WhyKayanLive() {
  return (
    <div className="bg-white relative w-full overflow-hidden" style={{ minHeight: '1450px' }}>
      {/* Left Pattern - positioned exactly as in Figma with black filter */}
      <div 
        className="absolute bg-center bg-cover bg-no-repeat z-0"
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
      
      {/* Right Pattern - Bottom (rotated 180 degrees with black filter) */}
      <div 
        className="absolute z-0"
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

      {/* Main Content Container */}
      <div className="max-w-[1600px] mx-auto px-20 relative z-10" style={{ paddingTop: '85px', paddingBottom: '100px' }}>
        {/* Why heading - Original position */}
        <h2 
          className="text-[#2c2c2b] font-medium capitalize"
          style={{
            fontSize: '220px',
            lineHeight: '168px',
            letterSpacing: '-2.2px',
            marginLeft: '117px',
            marginBottom: '37px'
          }}
        >
          Why
        </h2>

        {/* KayanLive Logo */}
        <div 
          className="bg-center bg-contain bg-no-repeat"
          style={{ 
            backgroundImage: `url('${imgKayanLogo}')`,
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
          <p className="text-[#888888] text-[24px] leading-[32px] text-left">
            <span>KayanLive Was Founded By </span>
            <span className="text-[#2c2c2b] font-semibold">Khalid Alhasan</span>
            <span>, A Regional Leader In Experiential Strategy And Event Tech. After Over A Decade Leading High-Profile Activations Through A Leading UAE/Saudi Technology Company, He Launched KayanLive To Bring </span>
            <span className="text-[#2c2c2b] font-semibold">Full-Scale, Cross-Functional Event Delivery</span>
            <span> To Clients Who Need More Than Just A Tech Vendor—They Need A Team Who Understands What's At Stake, And Knows How To Deliver Under Pressure.</span>
          </p>
        </div>

        {/* First Text Block - Full width */}
        <div style={{ 
          width: '100%',
          maxWidth: '995px',
          marginBottom: '66px'
        }}>
          <p className="text-[#888888] text-[24px] leading-[32px] text-left mb-6">
            "Kayan" In Arabic Means Being, Identity, And Existence—And That's Exactly What We're About. We Believe Every Brand, Every Organization, And Every Idea Has Something Real Behind It—An Essence That Deserves To Be Seen, Felt, And Remembered.
          </p>
          
          <p className="text-[#888888] text-[24px] leading-[32px] text-left">
            That's Why Our Team Is Built To Work From Pitch To Show Day As One Unit—With No Handoffs, No Friction, And No Gaps.
          </p>
        </div>

        {/* Second Text Block - Full width */}
        <div style={{ 
          width: '100%',
          maxWidth: '995px',
          margin: '0 auto'
        }}>
            <p className="text-[#888888] text-[24px] leading-[32px] text-left mb-6">
              We've Been The Silent Force Behind Headline Events In Saudi Arabia, Rapid-Turnaround Brand Activations In Riyadh, And Exhibition Setups Across The GCC. Our Speed Doesn't Sacrifice Quality. It Protects It.
            </p>
            
          <p className="text-[#888888] text-[24px] leading-[32px] text-left">
            Whether You're Launching A Pavilion, Opening A Cultural Event, Or Fixing Someone Else's Mess, We're The Partner You Call When The Clock Is Already Ticking.
          </p>
        </div>
      </div>
    </div>
  );
}