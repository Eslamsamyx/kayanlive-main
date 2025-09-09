import ClientsPartnersContent from '@/components/ClientsPartnersContent';
import OurPartners from '@/components/OurPartners';
import JoinOurNetwork from '@/components/JoinOurNetwork';

export default async function ClientsPartnersPage({
  params
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params;

  return (
    <div>
      {/* Mobile Hero Section - Figma Design */}
      <section className="relative bg-[#2c2c2b] overflow-hidden rounded-[25px] w-full mb-8 md:hidden" style={{ aspectRatio: '375/500' }}>
        {/* Mobile Decorative Outline 1 - Top Right */}
        <div 
          className="absolute opacity-50"
          style={{
            backgroundImage: 'url("/assets/1349ad630f81a3bb2a509dd8abfe0e4ef85fa329.png")',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            height: '226px',
            width: '145px',
            right: 'calc(50% - 88px - 72.5px)', // Positioning from left: calc(50% + 88px)
            top: '-122px'
          }}
        />
        
        {/* Mobile Decorative Outline 2 - Bottom Right */}
        <div 
          className="absolute opacity-50"
          style={{
            backgroundImage: 'url("/assets/1349ad630f81a3bb2a509dd8abfe0e4ef85fa329.png")',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            height: '226px',
            width: '145px',
            right: 'calc(50% - 73px - 72.5px)', // Positioning from left: calc(50% + 73px)
            bottom: '-125px' // Adjusted from top: 601px
          }}
        />
        
        {/* Mobile Centered Content */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex flex-col items-center justify-center w-[296px]">
            {/* Mobile Title */}
            <h1 
              className="font-bold text-center mb-[-20px]"
              style={{
                fontSize: '80px',
                lineHeight: '70px',
                background: 'linear-gradient(135deg, #a095e1 0%, #74cfaa 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                fontFamily: "'Aeonik', sans-serif",
                textTransform: 'capitalize',
                width: '294px'
              }}
            >
              Clients<br />& Partners
            </h1>
            
            {/* Mobile Overlapping Cards Container */}
            <div className="relative w-full h-[213px] mt-[-20px]">
              {/* Delivered Through Partnership Card - Mobile */}
              <div 
                className="absolute flex items-center justify-center"
                style={{
                  width: '195.756px',
                  height: '213.204px',
                  left: '119px',
                  top: '20px'
                }}
              >
                <div 
                  className="rounded-[20px] flex items-center justify-center px-2 py-[21px] overflow-hidden"
                  style={{
                    width: '125px',
                    height: '210px',
                    transform: 'rotate(15.142deg)',
                    background: 'rgba(117, 206, 171, 0.08)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(117, 206, 171, 0.15)'
                  }}
                >
                  <div 
                    className="text-white text-center w-full"
                    style={{
                      fontSize: '16px',
                      lineHeight: '18px',
                      letterSpacing: '-0.6px',
                      fontFamily: "'FONTSPRING DEMO - Visby CF Demi Bold', 'Poppins', sans-serif",
                      textTransform: 'capitalize'
                    }}
                  >
                    Delivered<br />Through<br />Partnership
                  </div>
                </div>
              </div>
              
              {/* Built on Trust Card - Mobile */}
              <div 
                className="absolute flex items-center justify-center"
                style={{
                  width: '193.364px',
                  height: '205.252px',
                  left: '0px',
                  top: '78.859px'
                }}
              >
                <div 
                  className="rounded-[20px] flex flex-col gap-[12px] items-center justify-center px-[12px] py-[19px] overflow-hidden"
                  style={{
                    width: '130px',
                    height: '200px',
                    transform: 'rotate(-15deg)',
                    background: 'rgba(160, 149, 225, 0.08)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(160, 149, 225, 0.15)'
                  }}
                >
                  {/* Icon Circle */}
                  <div className="bg-white rounded-full overflow-hidden relative" style={{ width: '75px', height: '75px' }}>
                    <div 
                      className="absolute bg-center bg-cover bg-no-repeat"
                      style={{
                        width: '80px',
                        height: '80px',
                        top: 'calc(50% + 1.5px)',
                        left: 'calc(50% - 0.5px)',
                        transform: 'translate(-50%, -50%)',
                        backgroundImage: 'url("/assets/6f6ce5ee6422e315524d4c876dbb7b8a3e609a69.png")'
                      }}
                    />
                  </div>
                  
                  {/* Text */}
                  <div 
                    className="text-white text-center w-full"
                    style={{
                      fontSize: '18px',
                      lineHeight: '20px',
                      letterSpacing: '-0.6px',
                      fontFamily: "'FONTSPRING DEMO - Visby CF Demi Bold', 'Poppins', sans-serif",
                      textTransform: 'capitalize',
                      minWidth: 'min-content'
                    }}
                  >
                    Built on<br />Trust
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Desktop Hero Section - Existing */}
      <section className="relative bg-[#2c2c2b] overflow-hidden rounded-[25px] md:rounded-[43px] lg:rounded-[61px] w-full mb-8 min-h-[500px] md:min-h-[600px] lg:min-h-[700px] hidden md:block">
        {/* Background Image */}
        <div 
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: 'url("http://localhost:3000/assets/7b15ebb5-2b87-4f31-a6fd-cd98c5a8c2e3.png")',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat'
          }}
        />
        
        {/* Main Title - Full Size */}
        <div className="absolute inset-0 z-10 flex items-center justify-center">
          <h1 
            className="font-bold text-center leading-none select-none"
            style={{
              fontSize: 'clamp(120px, 20vw, 400px)',
              background: 'linear-gradient(135deg, #a095e1 0%, #74cfaa 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              fontFamily: "'FONTSPRING DEMO - Visby CF Demi Bold', 'Poppins', sans-serif",
              lineHeight: '0.85'
            }}
          >
            Clients &<br />Partners
          </h1>
        </div>
        
        {/* Built on Trust Card */}
        <div 
          className="absolute z-20 hidden md:block"
          style={{
            width: '160px',
            height: '220px',
            left: '38%',
            top: '5%',
            transform: 'rotate(-15deg)',
            background: 'rgba(160, 149, 225, 0.08)',
            backdropFilter: 'blur(10px)',
            borderRadius: '27px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
            border: '1px solid rgba(160, 149, 225, 0.15)'
          }}
        >
          <div className="flex flex-col gap-[15px] items-center justify-center h-full px-[12px] py-[19px]">
            {/* Icon Circle - White Background */}
            <div className="bg-white rounded-full w-[90px] h-[90px] flex items-center justify-center relative overflow-hidden">
              <div 
                className="absolute bg-center bg-cover bg-no-repeat w-[100px] h-[100px]"
                style={{
                  top: 'calc(50% + 5px)',
                  left: 'calc(50% + 0.5px)',
                  transform: 'translate(-50%, -50%)',
                  backgroundImage: `url('/assets/6f6ce5ee6422e315524d4c876dbb7b8a3e609a69.png')`
                }}
              />
            </div>
            
            {/* Text */}
            <div 
              className="text-center text-white w-full"
              style={{
                fontSize: '26px',
                lineHeight: '28px',
                letterSpacing: '-1.0px',
                fontFamily: "'FONTSPRING DEMO - Visby CF Demi Bold', 'Poppins', sans-serif",
                textTransform: 'capitalize',
                minWidth: 'min-content'
              }}
            >
              Built on<br />Trust
            </div>
          </div>
        </div>
        
        {/* Delivered Through Partnership Card */}
        <div 
          className="absolute z-20 hidden md:block"
          style={{
            width: '160px',
            height: '220px',
            right: '15%',
            bottom: '35%',
            transform: 'rotate(12deg)',
            background: 'rgba(117, 206, 171, 0.08)',
            backdropFilter: 'blur(10px)',
            borderRadius: '27px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
            border: '1px solid rgba(117, 206, 171, 0.15)'
          }}
        >
          <div className="flex items-center justify-center h-full px-[12px] py-6">
            <div 
              className="text-center text-white w-full"
              style={{
                fontSize: '22px',
                lineHeight: '30px',
                letterSpacing: '-0.8px',
                fontFamily: "'FONTSPRING DEMO - Visby CF Demi Bold', 'Poppins', sans-serif",
                textTransform: 'capitalize'
              }}
            >
              Delivered<br />Through<br />Partnership
            </div>
          </div>
        </div>
        
        {/* Decorative Outline Elements - Exact Figma Positioning */}
        <div 
          className="absolute opacity-50"
          style={{
            left: '971px',
            top: '-168px',
            width: '240px',
            height: '372px',
            backgroundImage: 'url("/assets/1349ad630f81a3bb2a509dd8abfe0e4ef85fa329.png")',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat'
          }}
        />
        
        <div 
          className="absolute opacity-50"
          style={{
            left: '-158px',
            top: '499px',
            width: '316px',
            height: '491px',
            backgroundImage: 'url("/assets/1349ad630f81a3bb2a509dd8abfe0e4ef85fa329.png")',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat'
          }}
        />
      </section>
      
      {/* Full-Width Content Section */}
      <div className="-mx-4 relative min-h-[600px] bg-white px-8 md:px-12 lg:px-16">
        <ClientsPartnersContent />
      </div>

      {/* Our Partners Section */}
      <div className="-mx-4 mb-8">
        <OurPartners />
      </div>

      {/* Join Our Network Section */}
      <div className="-mx-4 mb-8">
        <JoinOurNetwork />
      </div>
    </div>
  );
}