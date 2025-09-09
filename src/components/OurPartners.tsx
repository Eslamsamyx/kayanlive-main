const imgRectangle4 = "/assets/174d9ed83a90c0514d54b7cbb68f8656ca74592c.png";
const imgRectangle5 = "/assets/0bb8e976afa37efb2547ff983a789a24c46bc909.png";
const imgRectangle6 = "/assets/0599bc8efb3df6cbf4d2b5cc07e1932dc0d2a400.png";
const imgRectangle7 = "/assets/d079f823333ca8bce293bcab9a39cb1aea4b5439.png";
const imgPattern0212 = "/assets/ef25fd14e49122ddd6cbc03c8a92caff93500eb7.png";
const imgPattern0453 = "/assets/6cdd4333a240b46dead9df86c5a83772e81b76fc.png";
const imgEllipse3622 = "/assets/be40b19cedb243ae93c978dbef58efa811bad082.svg";
const imgEllipse3623 = "/assets/b4cb37a55c71d9acc45332ad3ce54be582b29566.svg";
const imgFrame1618874049 = "/assets/f15686bbafb29a91fa11aa5d183c78004084c430.svg";

export default function OurPartners() {
  return (
    <div className="bg-[#2c2c2b] relative w-full py-20 px-8 overflow-hidden">
      {/* Colored Background Ellipses */}
      <div 
        className="absolute"
        style={{
          right: '10%',
          top: '30%',
          width: '452px',
          height: '683px'
        }}
      >
        <div className="absolute inset-[-58.57%_-88.5%]">
          <img
            src={imgEllipse3622}
            alt=""
            className="block max-w-none w-full h-full opacity-60"
          />
        </div>
      </div>

      <div 
        className="absolute"
        style={{
          right: '18%',
          top: '50%',
          width: '452px',
          height: '684px'
        }}
      >
        <div className="absolute inset-[-58.48%_-88.5%]">
          <img
            src={imgEllipse3623}
            alt=""
            className="block max-w-none w-full h-full opacity-60"
          />
        </div>
      </div>

      {/* Main Content Container */}
      <div className="relative z-10 max-w-7xl mx-auto">
        {/* WHO WE SUPPORT Badge */}
        <div className="inline-flex items-center px-6 py-3 rounded-full border-2 border-[#7afdd6] mb-8">
          <span className="text-[#7afdd6] text-sm font-bold uppercase tracking-wide">
            WHO WE SUPPORT
          </span>
        </div>

        {/* Main Title */}
        <h1 
          className="font-bold mb-16"
          style={{
            fontSize: 'clamp(90px, 10vw, 150px)',
            lineHeight: '1.1',
            background: 'linear-gradient(135deg, #a095e1 0%, #74cfaa 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            fontFamily: "'Aeonik', sans-serif"
          }}
        >
          Our Partners
        </h1>

        {/* Cards Grid - 2x2 Layout */}
        <div className="grid grid-cols-2 gap-6 w-full">
          {/* Government Card - Text at bottom */}
          <div className="relative rounded-3xl overflow-hidden" style={{ aspectRatio: '1280 / 853' }}>
            {/* Background Image */}
            <div 
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url('${imgRectangle4}')` }}
            />
            {/* Gradient Overlay - Smooth fade from bottom */}
            <div className="absolute bottom-0 left-0 right-0 h-[45%]" style={{
              background: `linear-gradient(
                45deg,
                rgba(83, 22, 147, 0.75) 0%,
                rgba(100, 140, 180, 0.65) 25%,
                rgba(122, 253, 214, 0.55) 50%,
                rgba(122, 253, 214, 0.25) 75%,
                transparent 100%
              )`
            }} />
            {/* Text Content */}
            <div className="absolute bottom-8 left-8 right-8">
              <h3 className="text-white text-2xl font-bold mb-2 leading-tight">
                Government And Semi-Government Entities
              </h3>
              <p className="text-white/90 text-sm">
                Cultural Commissions, Ministries, And Public Authorities
              </p>
            </div>
          </div>

          {/* Tourism Card - Text centered */}
          <div className="relative rounded-3xl overflow-hidden" style={{ aspectRatio: '1280 / 853' }}>
            {/* Background Image */}
            <div 
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url('${imgRectangle5}')` }}
            />
            {/* Gradient Overlay - Exact Figma gradient */}
            <div className="absolute inset-0 opacity-[0.50]" style={{
              background: 'linear-gradient(135deg, #74CFAA 0%, #A095E1 100%)'
            }} />
            {/* Text Content - Centered */}
            <div className="absolute inset-0 flex items-center justify-center p-8">
              <h3 className="text-white text-3xl font-bold text-center leading-tight">
                Tourism And<br />Destination Initiatives
              </h3>
            </div>
          </div>

          {/* Marketing Card - Text centered */}
          <div className="relative rounded-3xl overflow-hidden" style={{ aspectRatio: '1280 / 853' }}>
            {/* Background Image */}
            <div 
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url('${imgRectangle6}')` }}
            />
            {/* Gradient Overlay - Exact Figma gradient */}
            <div className="absolute inset-0 opacity-[0.48]" style={{
              background: 'linear-gradient(135deg, #75CEAB 0%, #A095E1 100%)'
            }} />
            {/* Text Content - Perfectly Centered */}
            <div className="absolute inset-0 flex items-center justify-center">
              <h3 className="text-white text-4xl font-bold text-center leading-tight">
                Marketing &<br />Experience Agencies
              </h3>
            </div>
          </div>

          {/* Enterprise Card - Text centered */}
          <div className="relative rounded-3xl overflow-hidden" style={{ aspectRatio: '1280 / 853' }}>
            {/* Background Image */}
            <div 
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url('${imgRectangle7}')` }}
            />
            {/* Gradient Overlay - Exact Figma gradient */}
            <div className="absolute inset-0 opacity-[0.60]" style={{
              background: 'linear-gradient(135deg, #74CFAA 0%, #A095E1 100%)'
            }} />
            {/* Text Content - Centered */}
            <div className="absolute inset-0 flex items-center justify-center p-8">
              <h3 className="text-white text-3xl font-bold text-center leading-tight">
                Enterprise Brands
              </h3>
            </div>
          </div>
        </div>
      </div>

      {/* Top Right Angular Decorative Element */}
      <div 
        className="absolute bg-center bg-cover bg-no-repeat"
        style={{
          backgroundImage: `url('${imgPattern0453}')`,
          top: '-80px',
          right: '-120px',
          width: '400px',
          height: '600px',
          filter: 'brightness(0) invert(1)'
        }}
      />

      {/* Bottom Left Pattern */}
      <div 
        className="absolute bg-center bg-cover bg-no-repeat"
        style={{
          backgroundImage: `url('${imgPattern0212}')`,
          bottom: '-100px',
          left: '-200px',
          width: '400px',
          height: '400px',
          transform: 'rotate(180deg)'
        }}
      />

      {/* Bottom Right Pattern */}
      <div 
        className="absolute bg-center bg-cover bg-no-repeat"
        style={{
          backgroundImage: `url('${imgPattern0212}')`,
          bottom: '-100px',
          right: '-150px',
          width: '450px',
          height: '450px'
        }}
      />
    </div>
  );
}