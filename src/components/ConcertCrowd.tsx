'use client';

import { useEffect, useState } from 'react';

const imgCrowd = "/assets/crowd-people-silhouette-cheerful-fans-600nw-2477878645 1.png";

interface Sparkle {
  id: number;
  x: number;
  y: number;
  animationDelay: number;
}

export default function ConcertCrowd() {
  const [sparkles, setSparkles] = useState<Sparkle[]>([]);

  useEffect(() => {
    // Generate sparkle positions representing phone flashes
    const sparklePositions: Sparkle[] = [];
    
    // Create sparkles across the crowd area where phones would be held up
    for (let i = 0; i < 200; i++) {
      sparklePositions.push({
        id: i,
        // Distribute across the width, concentrated in the middle-upper area where phones are visible
        x: 5 + Math.random() * 90, // 5-95% of width
        y: 30 + Math.random() * 40, // 30-70% of height (where phones would be held)
        animationDelay: Math.random() * 6, // Random delay up to 6s
      });
    }
    
    setSparkles(sparklePositions);
  }, []);

  return (
    <div className="relative w-full bg-white py-20 overflow-hidden">
      <div className="max-w-[1600px] mx-auto px-20">
        {/* Concert Crowd Image */}
        <div 
          className="relative w-full rounded-[40px] overflow-hidden"
          style={{ height: '600px' }}
        >
          {/* Background image */}
          <div 
            className="absolute inset-0 bg-center bg-cover bg-no-repeat"
            style={{ 
              backgroundImage: `url('${imgCrowd}')`,
              filter: 'brightness(0.9)'
            }}
          />
          
          {/* Gradient overlay for depth */}
          <div 
            className="absolute inset-0"
            style={{
              background: 'linear-gradient(to top, rgba(44, 44, 43, 0.4) 0%, transparent 50%, rgba(44, 44, 43, 0.2) 100%)'
            }}
          />
          
          {/* Sparkles representing phone flashes */}
          {sparkles.map((sparkle) => (
            <svg
              key={sparkle.id}
              className="absolute"
              style={{
                left: `${sparkle.x}%`,
                top: `${sparkle.y}%`,
                animation: `sparkle 2s ease-in-out ${sparkle.animationDelay}s infinite`
              }}
              width="8"
              height="8"
              viewBox="0 0 8 8"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M4 0L4.6 3L8 4L4.6 5L4 8L3.4 5L0 4L3.4 3L4 0Z"
                fill="white"
                fillOpacity="0.95"
              />
            </svg>
          ))}
        </div>
      </div>
      
      {/* CSS Animation for sparkles */}
      <style jsx>{`
        @keyframes sparkle {
          0%, 100% {
            opacity: 0;
            transform: scale(0) rotate(0deg);
          }
          50% {
            opacity: 1;
            transform: scale(1) rotate(180deg);
          }
        }
      `}</style>
    </div>
  );
}