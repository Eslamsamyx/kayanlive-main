'use client';

interface ValueCardProps {
  image: string;
  title: string;
  description: string;
  position: { top: string; left: string };
  className?: string;
}

export default function ValueCard({ 
  image, 
  title, 
  description, 
  position, 
  className = "" 
}: ValueCardProps) {
  return (
    <article 
      className={`absolute ${className}`}
      style={{ 
        top: position.top, 
        left: position.left,
        width: 'clamp(250px, 22vw, 350px)',
        height: 'clamp(300px, 26vw, 400px)'
      }}
    >
      <div 
        className="w-full aspect-[4/3] rounded-[22px] bg-cover bg-center bg-no-repeat mb-3"
        style={{ backgroundImage: `url('${image}')` }}
        role="img"
        aria-label={title}
      />
      <div className="px-1">
        <h3 
          className="text-white font-bold text-base mb-2 capitalize"
          style={{
            fontFamily: "'FONTSPRING DEMO - Visby CF Demi Bold', 'Poppins', sans-serif"
          }}
        >
          {title}
        </h3>
        <p 
          className="text-[#aab0bb] text-sm leading-relaxed m-0 capitalize"
          style={{
            fontFamily: "'Aeonik', 'Poppins', sans-serif"
          }}
        >
          {description}
        </p>
      </div>
    </article>
  );
}