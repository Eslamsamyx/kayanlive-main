const imgBackground = "/assets/29064c5a0d86395e45b642fe4e6daf670490f723.png";
const imgRectangle = "/assets/3f0c70e340a28d47867891894e77a32ca1a022f1.png";
const imgPattern = "/assets/6ebbb286c787b4009100c9f8cd397942ae83de56.png";

export default function HighImpactExperience() {
  return (
    <div className="relative mx-4 mt-8 mb-8">
      <div
        className="relative overflow-hidden rounded-tl-[61px] rounded-tr-[61px] rounded-bl-[20px] rounded-br-[20px] bg-center bg-cover bg-no-repeat"
        style={{ 
          backgroundImage: `url('${imgBackground}')`,
          height: '873px'
        }}
      >
        {/* Right side image overlay */}
        <div
          className="absolute bg-center bg-cover bg-no-repeat"
          style={{ 
            backgroundImage: `url('${imgRectangle}')`,
            width: '1055px',
            height: '873px',
            left: '399px',
            top: '0'
          }}
        />

        {/* Dark blur overlay for depth */}
        <div
          className="absolute bg-[#2c2c2b] blur-[200px] filter"
          style={{
            width: '1202px',
            height: '1500px',
            left: '-412px',
            top: '-284px'
          }}
        />

        {/* Main text content - aligned with navbar logo */}
        <div className="absolute inset-0 flex items-center z-10">
          <div className="pl-12">
            {/* "High Impact" text */}
            <div className="leading-tight">
              <h2 
                className="capitalize text-white font-medium"
                style={{
                  fontSize: 'clamp(80px, 12vw, 170px)',
                  lineHeight: '1.1em',
                  letterSpacing: '-0.04em'
                }}
              >
                <span className="block">High</span>
                <span className="block">Impact</span>
              </h2>
              
              {/* "Experience" with gradient */}
              <h2 
                className="capitalize font-medium bg-gradient-to-r from-[#a095e1] to-[#74cfaa] bg-clip-text"
                style={{
                  fontSize: 'clamp(80px, 12vw, 170px)',
                  lineHeight: '1.2em',
                  letterSpacing: '-0.04em',
                  marginTop: '-0.05em',
                  WebkitTextFillColor: 'transparent',
                  WebkitBackgroundClip: 'text',
                  backgroundClip: 'text'
                }}
              >
                Experience
              </h2>
            </div>
          </div>
        </div>

        {/* Decorative pattern - adjusted positioning */}
        <div
          className="absolute bg-center bg-cover bg-no-repeat z-0"
          style={{ 
            backgroundImage: `url('${imgPattern}')`,
            width: '638px',
            height: '426px',
            left: '800px',
            top: '531px'
          }}
        />

        {/* Inner shadow effect */}
        <div 
          className="absolute inset-0 pointer-events-none"
          style={{
            boxShadow: 'inset -100px 0px 200px 0px #231f20'
          }}
        />
      </div>
    </div>
  );
}