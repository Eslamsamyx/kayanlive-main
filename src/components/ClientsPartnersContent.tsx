export default function ClientsPartnersContent() {
  return (
    <div className="w-full py-8 md:py-16 lg:py-20">
      <div className="mx-auto px-4 md:px-6" style={{ maxWidth: 'min(1340px, calc(100vw - 172px))' }}>
        
        {/* Main Content Paragraphs */}
        <div className="mb-8 md:mb-12 lg:mb-16">
          <div 
            className="text-center w-full"
            style={{ 
              fontFamily: '"Poppins", sans-serif',
              fontSize: 'clamp(1.1rem, 2.2vw, 1.5rem)',
              lineHeight: 'clamp(1.6rem, 3vw, 2.1rem)',
              color: 'rgba(35,31,32,0.73)'
            }}
          >
            <p className="mb-6 md:mb-8">
              <span>
                Behind every successful KayanLive project is a partnership built on alignment, trust, and shared standards of excellence. We do not operate as a vendor. We integrate as a strategic partner, one capable of delivering under pressure and adapting in real time. As a full-service{" "}
              </span>
              <span className="font-bold" style={{ color: 'rgba(44,44,43,0.73)' }}>
                event management company
              </span>
              <span>
                {" "}operating across the GCC—from Saudi Arabia to Abu Dhabi, Dubai, and beyond—we support partners across every stage of delivery—from idea to impact.
              </span>
            </p>
            
            <p className="mb-0">
              Our clients span government ministries, multinational corporations, public commissions, real estate developers, automotive brands, tourism boards, and creative agencies—many of whom trust our reputation as a leading event company. Each enters with a vision and a set of expectations. Our job is to meet those expectations with precision—and elevate the outcome beyond what was first imagined.
            </p>
          </div>
        </div>
        
        {/* Highlighted Text */}
        <div className="text-center w-full">
          <p 
            className="font-bold mb-0"
            style={{ 
              fontFamily: '"Poppins", sans-serif',
              fontSize: 'clamp(1.1rem, 2.2vw, 1.5rem)',
              lineHeight: 'clamp(1.6rem, 3vw, 2.1rem)',
              color: 'rgba(35,31,32,0.73)'
            }}
          >
            Ministry of Culture (KSA), Royal Commission for Riyadh, Vision 2030 Executives, and event planners in Saudi Arabia have all called on us when it matters most.
          </p>
        </div>
      </div>
    </div>
  );
}