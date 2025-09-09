'use client';

export default function WorkStatement() {
  return (
    <div className="bg-[#f0f1fa] w-full py-16 md:py-20 lg:py-24">
      <div 
        className="max-w-[1200px] mx-auto px-6 md:px-8 lg:px-10 text-center capitalize font-medium"
        style={{ 
          fontSize: 'clamp(1.2rem, 2.3vw, 35px)',
          color: 'rgba(35,31,32,0.73)'
        }}
      >
        <p className="mb-6" style={{ lineHeight: 'clamp(1.5rem, 2.8vw, 43px)' }}>
          Each case will break down what was delivered, how it was structured, and why it succeeded. For now, our team is available to walk through these highlights and share detailed visual decks on request.
        </p>
        <p className="mb-0" style={{ lineHeight: 'clamp(1.5rem, 2.8vw, 43px)' }}>
          <span>We do not rely on vague claims or polished slogans. </span>
          <span className="font-bold text-[#231f20]">We let results speak</span>
        </p>
      </div>
    </div>
  );
}