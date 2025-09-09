export default function ClientsPartnersContent() {
  return (
    <div className="relative w-full text-[25px] text-[rgba(35,31,32,0.73)] capitalize leading-[0] not-italic">
      {/* Main Content Paragraphs */}
      <div 
        className="absolute font-['Aeonik',_sans-serif] leading-[34px] text-[25px] top-[62px] w-[1170px]"
        style={{ left: "calc(50% - 585px)" }}
      >
        <p className="mb-0">
          <span>
            Behind every successful KayanLive project is a partnership built on alignment, trust, and shared standards of excellence. We do not operate as a vendor. We integrate as a strategic partner, one capable of delivering under pressure and adapting in real time. As a full-service{" "}
          </span>
          <span className="font-['Aeonik',_sans-serif] font-bold not-italic text-[rgba(44,44,43,0.73)]">
            event management company
          </span>
          <span>
            {" "}operating across the GCC—from Saudi Arabia to Abu Dhabi, Dubai, and beyond—we support partners across every stage of delivery—from idea to impact.
          </span>
        </p>
        
        <p className="mb-0">&nbsp;</p>
        
        <p className="mb-0">
          Our clients span government ministries, multinational corporations, public commissions, real estate developers, automotive brands, tourism boards, and creative agencies—many of whom trust our reputation as a leading event company. Each enters with a vision and a set of expectations. Our job is to meet those expectations with precision—and elevate the outcome beyond what was first imagined.
        </p>
      </div>
      
      {/* Bottom Highlighted Text */}
      <div 
        className="absolute font-['Aeonik',_sans-serif] font-bold left-1/2 text-center top-[444px] translate-x-[-50%] w-[1170px]"
      >
        <p className="leading-[34px] text-[25px] text-[rgba(35,31,32,0.73)]">
          Ministry of Culture (KSA), Royal Commission for Riyadh, Vision 2030 Executives, and event planners in Saudi Arabia have all called on us when it matters most.
        </p>
      </div>
    </div>
  );
}