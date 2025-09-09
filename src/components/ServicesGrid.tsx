'use client';

// Assets from Figma
const imgRectangle4242 = "/assets/e05fec393f295d237ade9dff2ad26793496382ba.png"; // 2D/3D Content
const imgRectangle4243 = "/assets/8980a40c08a52f165b1c17b24158f20160d003cc.png"; // Video Editing
const imgRectangle4244 = "/assets/273cea28658e9744d1cd2fbc64a5ba1ac7deeff8.png"; // Conferences
const imgRectangle4245 = "/assets/44d602b7f7ce040ad9592bf1e21de743a7ce86d1.png"; // Hologram
const imgRectangle4246 = "/assets/a255a0faf04e8dcc9b85bbbb16bca93169de897f.png"; // Interactive
const imgRectangle4247 = "/assets/123269087423c903b101b9352bd92acdab49d86a.png"; // Corporate Events
const imgRectangle4248 = "/assets/d4096bba6c0158e37ce51f8a24f9565b007aaa92.png"; // Immersive AV
const imgRectangle4249 = "/assets/409f7073bcfac7c1d7eea78ab2e23cc10f6a16fb.png"; // Tech Driven
const imgRectangle4250 = "/assets/cf27cb2a37e9e3bfd30c1ada4fe4988496b10bbb.png"; // Live Events
const imgFrame1618874049 = "/assets/42a41a16a7cbe5973271220c9e7befa820aa0f6a.svg"; // Arrow icon

export default function ServicesGrid() {
  return (
    <div className="relative w-full">
      {/* Services Grid Container */}
      <div 
        className="box-border grid gap-4 md:gap-7 py-6 md:py-9"
        style={{
          gridTemplateColumns: 'repeat(2, minmax(0px, 1fr))',
          gridTemplateRows: 'repeat(6, minmax(0px, 1fr))'
        }}
      >
        {/* Row 1: 2D, 3D Content Development - Full Width */}
        <div 
          className="col-span-2 bg-cover bg-center bg-no-repeat overflow-hidden relative rounded-[30px] md:rounded-[61px]"
          style={{ 
            backgroundImage: `url('${imgRectangle4242}')`,
            height: 'clamp(400px, 54.8vw, 828px)'
          }}
        >
          {/* Dark Blur Overlay - Bottom positioned for text contrast */}
          <div className="absolute bottom-0 left-0 right-0 h-1/3">
            <div 
              className="bg-[#1a1a1a] blur-[60px] filter w-full h-full opacity-80"
            />
          </div>
          
          {/* Content */}
          <div className="absolute bottom-6 md:bottom-12 right-4 md:right-12 text-right p-4 md:p-0" style={{ maxWidth: 'clamp(300px, 87vw, 1315px)' }}>
            <h3 
              className="text-white font-bold mb-4 md:mb-7 capitalize"
              style={{
                fontSize: 'clamp(24px, 4vw, 60px)',
                lineHeight: 'clamp(26px, 4.1vw, 62px)'
              }}
            >
              2D, 3D Content Development
            </h3>
            <p 
              className="text-[#cfcfcf] font-medium"
              style={{
                fontSize: 'clamp(14px, 1.5vw, 22px)',
                lineHeight: 'clamp(18px, 1.9vw, 28px)',
                maxWidth: 'clamp(280px, 86vw, 1298px)'
              }}
            >
              We create high-resolution 2D and 3D animation for event environments—from stylized motion graphics to cinematic renderings, character loops, and dynamic product sequences. Whether it's an explainer wall, architectural fly-through, or ambient content for LED tunnels, our in-house motion team delivers visuals that move people—literally and emotionally.
              <br /><br />
              Trusted by cultural commissions and enterprise brands for digital content that commands attention.
            </p>
          </div>
          
          {/* Arrow Icon */}
          <div 
            className="absolute left-4 md:left-[47px]"
            style={{
              top: 'clamp(300px, 47.6vw, 720px)',
              width: 'clamp(25px, 2.5vw, 37.627px)',
              height: 'clamp(32px, 3.2vw, 48.575px)'
            }}
          >
            <img src={imgFrame1618874049} alt="" className="block max-w-none size-full" />
          </div>
        </div>

        {/* Row 2 Left: Video Editing - Half Width */}
        <div 
          className="bg-cover bg-center bg-no-repeat overflow-hidden relative rounded-[30px] md:rounded-[61px]"
          style={{ 
            backgroundImage: `url('${imgRectangle4243}')`,
            height: 'clamp(400px, 54.8vw, 828px)'
          }}
        >
          {/* Dark Blur Overlay - Bottom positioned for text contrast */}
          <div className="absolute bottom-0 left-0 right-0 h-1/3">
            <div 
              className="bg-[#1a1a1a] blur-[60px] filter w-full h-full opacity-80"
            />
          </div>
          
          {/* Content */}
          <div className="absolute bottom-6 md:bottom-12 right-4 md:right-[53px] text-right p-4 md:p-0">
            <h3 
              className="text-white font-bold capitalize"
              style={{
                fontSize: 'clamp(24px, 3.3vw, 50px)',
                lineHeight: 'clamp(26px, 3.4vw, 52px)',
                maxWidth: 'clamp(280px, 39.4vw, 596px)'
              }}
            >
              Video Editing and Real Footage Integration
            </h3>
          </div>
        </div>

        {/* Row 2 Right: Conferences and Forums - Half Width */}
        <div 
          className="bg-cover bg-center bg-no-repeat overflow-hidden relative rounded-[30px] md:rounded-[61px]"
          style={{ 
            backgroundImage: `url('${imgRectangle4244}')`,
            height: 'clamp(400px, 54.8vw, 828px)'
          }}
        >
          {/* Dark Blur Overlay - Bottom positioned for text contrast */}
          <div className="absolute bottom-0 left-0 right-0 h-1/3">
            <div 
              className="bg-[#1a1a1a] blur-[60px] filter w-full h-full opacity-80"
            />
          </div>
          
          {/* Content */}
          <div className="absolute bottom-6 md:bottom-12 right-4 md:right-[50px] text-right p-4 md:p-0">
            <h3 
              className="text-white font-bold capitalize"
              style={{
                fontSize: 'clamp(24px, 3.3vw, 50px)',
                lineHeight: 'clamp(26px, 3.4vw, 52px)',
                maxWidth: 'clamp(190px, 24.9vw, 377px)'
              }}
            >
              Conferences and Forums
            </h3>
          </div>
        </div>

        {/* Row 3: Hologram Activations - Full Width */}
        <div 
          className="col-span-2 bg-cover bg-center bg-no-repeat overflow-hidden relative rounded-[30px] md:rounded-[61px]"
          style={{ 
            backgroundImage: `url('${imgRectangle4245}')`,
            height: 'clamp(400px, 54.8vw, 828px)'
          }}
        >
          {/* Dark Blur Overlay - Bottom positioned for text contrast */}
          <div className="absolute bottom-0 left-0 right-0 h-1/3">
            <div 
              className="bg-[#1a1a1a] blur-[60px] filter w-full h-full opacity-80"
            />
          </div>
          
          {/* Content */}
          <div className="absolute bottom-6 md:bottom-12 right-4 md:right-12 text-right p-4 md:p-0">
            <h3 
              className="text-white font-bold capitalize"
              style={{
                fontSize: 'clamp(32px, 4vw, 60px)',
                lineHeight: 'clamp(34px, 4.1vw, 62px)',
                maxWidth: 'clamp(530px, 70.2vw, 1061px)'
              }}
            >
              Hologram Activations
            </h3>
          </div>
        </div>

        {/* Row 4 Left: Interactive Activations - Half Width */}
        <div 
          className="bg-cover bg-center bg-no-repeat overflow-hidden relative rounded-[30px] md:rounded-[61px]"
          style={{ 
            backgroundImage: `url('${imgRectangle4246}')`,
            height: 'clamp(400px, 54.8vw, 828px)'
          }}
        >
          {/* Dark Blur Overlay - Bottom positioned for text contrast */}
          <div className="absolute bottom-0 left-0 right-0 h-1/3">
            <div 
              className="bg-[#1a1a1a] blur-[60px] filter w-full h-full opacity-80"
            />
          </div>
          
          {/* Content */}
          <div className="absolute bottom-6 md:bottom-12 right-1/2 translate-x-1/2 text-center p-4 md:p-0">
            <h3 
              className="text-white font-bold capitalize"
              style={{
                fontSize: 'clamp(24px, 3.3vw, 50px)',
                lineHeight: 'clamp(26px, 3.4vw, 52px)',
                maxWidth: 'clamp(290px, 38.8vw, 586px)'
              }}
            >
              <span className="block">Interactive</span>
              <span className="block">Activations</span>
            </h3>
          </div>
        </div>

        {/* Row 4 Right: Live Events Entertainment Shows - Half Width */}
        <div 
          className="bg-cover bg-center bg-no-repeat overflow-hidden relative rounded-[30px] md:rounded-[61px]"
          style={{ 
            backgroundImage: `url('${imgRectangle4250}')`,
            height: 'clamp(400px, 54.8vw, 828px)'
          }}
        >
          {/* Dark Blur Overlay - Bottom positioned for text contrast */}
          <div className="absolute bottom-0 left-0 right-0 h-1/3">
            <div 
              className="bg-[#1a1a1a] blur-[60px] filter w-full h-full opacity-80"
            />
          </div>
          
          {/* Content */}
          <div className="absolute bottom-6 md:bottom-12 right-4 md:right-[53px] text-right p-4 md:p-0">
            <h3 
              className="text-white font-bold capitalize"
              style={{
                fontSize: 'clamp(24px, 3.3vw, 50px)',
                lineHeight: 'clamp(26px, 3.4vw, 52px)',
                maxWidth: 'clamp(290px, 39.4vw, 596px)'
              }}
            >
              <span className="block">Live Events</span>
              <span className="block">Entertainment Shows</span>
            </h3>
          </div>
        </div>

        {/* Row 5: Corporate Events - Full Width */}
        <div 
          className="col-span-2 bg-cover bg-center bg-no-repeat overflow-hidden relative rounded-[30px] md:rounded-[61px]"
          style={{ 
            backgroundImage: `url('${imgRectangle4247}')`,
            height: 'clamp(400px, 54.8vw, 828px)'
          }}
        >
          {/* Dark Blur Overlay - Bottom positioned for text contrast */}
          <div className="absolute bottom-0 left-0 right-0 h-1/3">
            <div 
              className="bg-[#1a1a1a] blur-[60px] filter w-full h-full opacity-80"
            />
          </div>
          
          {/* Content */}
          <div className="absolute bottom-6 md:bottom-12 right-4 md:right-12 text-right p-4 md:p-0">
            <h3 
              className="text-white font-bold capitalize"
              style={{
                fontSize: 'clamp(32px, 4vw, 60px)',
                lineHeight: 'clamp(34px, 4.1vw, 62px)',
                maxWidth: 'clamp(530px, 70.2vw, 1061px)'
              }}
            >
              Corporate Events
            </h3>
          </div>
        </div>

        {/* Row 6 Left: Immersive AV Production - Half Width */}
        <div 
          className="bg-cover bg-center bg-no-repeat overflow-hidden relative rounded-[30px] md:rounded-[61px]"
          style={{ 
            backgroundImage: `url('${imgRectangle4248}')`,
            height: 'clamp(400px, 54.8vw, 828px)'
          }}
        >
          {/* Dark Blur Overlay - Bottom positioned for text contrast */}
          <div className="absolute bottom-0 left-0 right-0 h-1/3">
            <div 
              className="bg-[#1a1a1a] blur-[60px] filter w-full h-full opacity-80"
            />
          </div>
          
          {/* Content */}
          <div className="absolute bottom-6 md:bottom-12 right-4 md:right-[53px] text-right p-4 md:p-0">
            <h3 
              className="text-white font-bold capitalize"
              style={{
                fontSize: 'clamp(24px, 3.3vw, 50px)',
                lineHeight: 'clamp(26px, 3.4vw, 52px)',
                maxWidth: 'clamp(282px, 37.3vw, 564px)'
              }}
            >
              Immersive AV Production
            </h3>
          </div>
        </div>

        {/* Row 6 Right: Tech Driven Activations - Half Width */}
        <div 
          className="bg-cover bg-center bg-no-repeat overflow-hidden relative rounded-[30px] md:rounded-[61px]"
          style={{ 
            backgroundImage: `url('${imgRectangle4249}')`,
            height: 'clamp(400px, 54.8vw, 828px)'
          }}
        >
          {/* Dark Blur Overlay - Bottom positioned for text contrast */}
          <div className="absolute bottom-0 left-0 right-0 h-1/3">
            <div 
              className="bg-[#1a1a1a] blur-[60px] filter w-full h-full opacity-80"
            />
          </div>
          
          {/* Content */}
          <div className="absolute bottom-6 md:bottom-12 right-4 md:right-[53px] text-right p-4 md:p-0">
            <h3 
              className="text-white font-bold capitalize"
              style={{
                fontSize: 'clamp(24px, 3.3vw, 50px)',
                lineHeight: 'clamp(26px, 3.4vw, 52px)',
                maxWidth: 'clamp(242px, 32vw, 484px)'
              }}
            >
              Tech Driven Activations
            </h3>
          </div>
        </div>
      </div>
    </div>
  );
}