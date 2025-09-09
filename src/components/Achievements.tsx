import Image from 'next/image';

const imgMaskGroup = "/assets/638442c54db92ce49b3ad8194a062a52ba973004.png";
const imgEllipse1 = "/assets/575a92ae113574b10651d37ad7654adf9fb7bd85.svg";
const imgEllipse2 = "/assets/dcc83c6de9d9f4b919b448af6ce767c528855540.svg";

export default function Achievements() {
  return (
    <div className="bg-[#2c2c2b] relative w-full overflow-hidden py-24">
      {/* Background Decorative Elements */}
      {/* Large teal ellipse blur - right side */}
      <div 
        className="absolute"
        style={{
          width: '668px',
          height: '689px',
          right: '-100px',
          top: '179px'
        }}
      >
        <Image src={imgEllipse2} alt="" fill className="opacity-60" />
      </div>
      
      {/* Smaller purple ellipse - right side */}
      <div 
        className="absolute"
        style={{
          width: '346px',
          height: '357px',
          right: '100px',
          top: '345px'
        }}
      >
        <Image src={imgEllipse1} alt="" fill className="opacity-50" />
      </div>
      
      {/* Pattern overlay - right side */}
      <div 
        className="absolute bg-center bg-cover bg-no-repeat opacity-70"
        style={{
          backgroundImage: `url('${imgMaskGroup}')`,
          width: '542px',
          height: '542px',
          right: '50px',
          top: '252px'
        }}
      />

      {/* Diamond decoration - left side */}
      <div 
        className="absolute"
        style={{
          width: '40px',
          height: '40px',
          left: '150px',
          top: '50%',
          transform: 'translateY(-50%) rotate(45deg)',
          background: 'rgba(122, 253, 214, 0.3)'
        }}
      />

      {/* Main Content */}
      <div className="max-w-[1600px] mx-auto px-20 relative z-10">
        {/* Title */}
        <h2 
          className="text-center capitalize font-normal mb-20"
          style={{
            fontSize: '200px',
            lineHeight: '200px',
            letterSpacing: '-2px',
            background: 'linear-gradient(90deg, #b8a4ff 0%, #7afdd6 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}
        >
          Achievements
        </h2>

        {/* Stats Table with Glassmorphism */}
        <div 
          className="relative mx-auto rounded-[53px] overflow-hidden"
          style={{
            maxWidth: '1115px',
            background: 'rgba(255, 255, 255, 0.01)',
            backdropFilter: 'blur(50.5px)',
            WebkitBackdropFilter: 'blur(50.5px)',
            border: '2px solid #7afdd6'
          }}
        >
          {/* Header Row with stronger teal background */}
          <div 
            className="grid grid-cols-3 relative"
            style={{
              background: 'rgba(122, 253, 214, 0.22)',
              height: '150px'
            }}
          >
            <div className="flex items-center justify-center px-8">
              <h3 className="text-[#7afdd6] text-[40px] leading-[45px]">(X) Turnaround</h3>
            </div>
            <div 
              className="flex items-center justify-center px-8 relative"
              style={{ background: 'rgba(122, 253, 214, 0.11)' }}
            >
              <h3 className="text-[#7afdd6] text-[40px] leading-[45px] text-center">(%) Increased Press Coverage</h3>
            </div>
            <div className="flex items-center justify-center px-8">
              <h3 className="text-[#7afdd6] text-[40px] leading-[45px]">0 Missed Deadlines</h3>
            </div>
          </div>

          {/* Divider Line */}
          <div className="w-full h-[1px] bg-[#7afdd6] opacity-30" />

          {/* Data Row 1 */}
          <div className="grid grid-cols-3" style={{ height: '112px' }}>
            <div className="flex items-center px-[60px]">
              <p className="text-white text-[25px] leading-[50px]">X Clients Served</p>
            </div>
            <div 
              className="flex items-center px-[60px]"
              style={{ background: 'rgba(122, 253, 214, 0.05)' }}
            >
              <p className="text-white text-[25px] leading-[50px]">X Projects Completed</p>
            </div>
            <div className="flex items-center px-[60px]">
              <p className="text-white text-[25px] leading-[50px]">15+ Years of Expertise</p>
            </div>
          </div>

          {/* Divider Line */}
          <div className="w-full h-[1px] bg-[#7afdd6] opacity-30" />

          {/* Data Row 2 */}
          <div className="grid grid-cols-3" style={{ height: '126px' }}>
            <div className="flex items-center px-[60px]">
              <p className="text-white text-[25px] leading-[50px]">Y Clients Served</p>
            </div>
            <div 
              className="flex items-center px-[60px]"
              style={{ background: 'rgba(122, 253, 214, 0.05)' }}
            >
              <p className="text-white text-[25px] leading-[50px]">Y Projects Completed</p>
            </div>
            <div className="flex items-center px-[60px]">
              <p className="text-white text-[25px] leading-[50px]">15+ Years of Expertise</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}