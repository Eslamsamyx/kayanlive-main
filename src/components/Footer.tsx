const imgPattern = "/assets/7854b2fa3456db2dfe1f88a71484d2ef952fd4d6.png";
const imgLogo = "/assets/4cd3a29fae1600ce972e006c913de48875053bd8.png";

export default function Footer() {
  return (
    <footer className="relative w-full bg-white" style={{ paddingTop: '150px', paddingBottom: '200px' }}>
      {/* Container for centered content */}
      <div className="relative w-full max-w-[1600px] mx-auto px-4">
        {/* Logo - centered and prominent */}
        <div className="flex justify-center mb-6 md:mb-12 lg:mb-16">
          <div
            className="bg-center bg-contain bg-no-repeat"
            style={{ 
              width: '429px',
              height: '143px',
              backgroundImage: `url('${imgLogo}')` 
            }}
          />
        </div>

        {/* Copyright Text */}
        <div className="text-center">
          <p className="text-[25px] tracking-[0.25px]">
            <span className="text-[#2c2c2b] font-semibold">2025</span>
            <span className="text-[#999999]"> all rights reserved </span>
            <span className="text-[#2c2c2b] font-semibold">KayanLive.com</span>
          </p>
        </div>
      </div>

      {/* Pattern Row - positioned at bottom */}
      <div 
        className="absolute bottom-0 left-0 right-0 overflow-hidden"
        style={{ height: '140px' }}
      >
        <div className="flex absolute bottom-0" style={{ left: '0' }}>
          {/* Generate enough patterns to cover the full width */}
          {Array.from({ length: 15 }, (_, i) => (
            <div
              key={i}
              className="bg-center bg-cover bg-no-repeat flex-shrink-0"
              style={{ 
                width: '180px',
                height: '180px',
                backgroundImage: `url('${imgPattern}')`,
                opacity: 0.6
              }}
            />
          ))}
        </div>
      </div>
    </footer>
  );
}