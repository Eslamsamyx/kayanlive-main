'use client';

import { useEffect, useState } from 'react';

const imgCrowd = "/assets/crowd-people-silhouette-cheerful-fans-600nw-2477878645 1.png";

interface MovingFlashlight {
  id: number;
  startX: number;
  startY: number;
  animationDelay: number;
  size: number;
  intensity: number;
  movementType: 'sway' | 'circle' | 'figure8' | 'drift';
  speed: number;
  direction: number;
}

export default function ConcertCrowd() {
  const [movingFlashlights, setMovingFlashlights] = useState<MovingFlashlight[]>([]);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Check if device is mobile for performance optimization
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    // Generate moving flashlight positions representing people with phones at concert
    const flashlightPositions: MovingFlashlight[] = [];
    
    // Many white sparkles to mimic camera flashes at concert
    const flashlightCount = isMobile ? 150 : 300;
    
    // Movement patterns for realistic crowd behavior
    const movementTypes: ('sway' | 'circle' | 'figure8' | 'drift')[] = ['sway', 'circle', 'figure8', 'drift'];
    
    // Create moving flashlights in the upper portion where people hold phones up
    for (let i = 0; i < flashlightCount; i++) {
      flashlightPositions.push({
        id: i,
        // Starting positions distributed across the crowd
        startX: 5 + Math.random() * 90, // 5-95% of width (spread across entire crowd)
        startY: 5 + Math.random() * 40, // 5-45% of height (upper half where phones are held)
        animationDelay: Math.random() * 8, // Random timing (0-8s) for natural variation
        size: 2 + Math.random() * 6, // Smaller sparkle size 2-8px for many tiny flashes
        intensity: 0.9 + Math.random() * 0.1, // High intensity 0.9-1.0 for bright white sparkles
        movementType: movementTypes[Math.floor(Math.random() * movementTypes.length)],
        speed: 0.5 + Math.random() * 1.5, // Speed multiplier 0.5-2.0
        direction: Math.random() * 360, // Random starting direction 0-360 degrees
      });
    }
    
    setMovingFlashlights(flashlightPositions);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, [isMobile]);

  return (
    <div className="relative w-full bg-white py-8 md:py-20 overflow-hidden">
      <div className="max-w-[1600px] mx-auto px-4 md:px-8 lg:px-20">
        {/* Concert Crowd Image */}
        <div 
          className="relative w-full rounded-[16px] md:rounded-[40px] overflow-hidden"
          style={{ 
            height: 'clamp(300px, 50vh, 600px)',
            aspectRatio: '16/9'
          }}
        >
          {/* Background image */}
          <div 
            className="absolute inset-0 bg-center bg-cover bg-no-repeat"
            style={{ 
              backgroundImage: `url('${imgCrowd}')`
            }}
          />
          
          
          {/* Moving flashlights representing people with phones moving at concert */}
          {movingFlashlights.map((flashlight) => (
            <div
              key={flashlight.id}
              className="absolute will-change-transform rounded-full pointer-events-none"
              style={{
                left: `${flashlight.startX}%`,
                top: `${flashlight.startY}%`,
                width: `${flashlight.size * (isMobile ? 0.8 : 1)}px`,
                height: `${flashlight.size * (isMobile ? 0.8 : 1)}px`,
                background: `radial-gradient(circle, 
                  rgba(255, 255, 255, ${flashlight.intensity}) 0%, 
                  rgba(255, 255, 255, ${flashlight.intensity * 0.95}) 15%, 
                  rgba(255, 255, 255, ${flashlight.intensity * 0.8}) 30%, 
                  rgba(255, 255, 255, ${flashlight.intensity * 0.4}) 60%,
                  transparent 100%)`,
                boxShadow: `
                  0 0 ${flashlight.size * 2}px rgba(255, 255, 255, ${flashlight.intensity}),
                  0 0 ${flashlight.size * 4}px rgba(255, 255, 255, ${flashlight.intensity * 0.9}),
                  0 0 ${flashlight.size * 8}px rgba(255, 255, 255, ${flashlight.intensity * 0.6}),
                  0 0 ${flashlight.size * 12}px rgba(255, 255, 255, ${flashlight.intensity * 0.3})
                `,
                animation: `
                  ${flashlight.movementType}Movement ${6 + flashlight.speed * 3}s linear ${flashlight.animationDelay}s infinite,
                  flashBurst ${0.4 + Math.random() * 0.3}s ease-in-out ${flashlight.animationDelay}s infinite
                `,
                transform: `translate3d(-50%, -50%, 0) rotate(${flashlight.direction}deg)`,
                transformOrigin: 'center center'
              }}
              aria-hidden="true"
            />
          ))}
        </div>
      </div>
      
      {/* CSS Animations for moving flashlights with realistic crowd movement patterns */}
      <style jsx>{`
        /* Swaying movement - like people swaying side to side */
        @keyframes swayMovement {
          0% { transform: translate3d(-50%, -50%, 0) translateX(0px) translateY(0px); }
          25% { transform: translate3d(-50%, -50%, 0) translateX(10px) translateY(-3px); }
          50% { transform: translate3d(-50%, -50%, 0) translateX(0px) translateY(-5px); }
          75% { transform: translate3d(-50%, -50%, 0) translateX(-10px) translateY(-3px); }
          100% { transform: translate3d(-50%, -50%, 0) translateX(0px) translateY(0px); }
        }

        /* Circular movement - like people turning around */
        @keyframes circleMovement {
          0% { transform: translate3d(-50%, -50%, 0) translateX(0px) translateY(0px); }
          25% { transform: translate3d(-50%, -50%, 0) translateX(15px) translateY(-8px); }
          50% { transform: translate3d(-50%, -50%, 0) translateX(0px) translateY(-15px); }
          75% { transform: translate3d(-50%, -50%, 0) translateX(-15px) translateY(-8px); }
          100% { transform: translate3d(-50%, -50%, 0) translateX(0px) translateY(0px); }
        }

        /* Figure-8 movement - complex dancing motion */
        @keyframes figure8Movement {
          0% { transform: translate3d(-50%, -50%, 0) translateX(0px) translateY(0px); }
          12.5% { transform: translate3d(-50%, -50%, 0) translateX(12px) translateY(-8px); }
          25% { transform: translate3d(-50%, -50%, 0) translateX(0px) translateY(-15px); }
          37.5% { transform: translate3d(-50%, -50%, 0) translateX(-12px) translateY(-8px); }
          50% { transform: translate3d(-50%, -50%, 0) translateX(0px) translateY(0px); }
          62.5% { transform: translate3d(-50%, -50%, 0) translateX(12px) translateY(8px); }
          75% { transform: translate3d(-50%, -50%, 0) translateX(0px) translateY(15px); }
          87.5% { transform: translate3d(-50%, -50%, 0) translateX(-12px) translateY(8px); }
          100% { transform: translate3d(-50%, -50%, 0) translateX(0px) translateY(0px); }
        }

        /* Drift movement - slow random-like drift */
        @keyframes driftMovement {
          0% { transform: translate3d(-50%, -50%, 0) translateX(0px) translateY(0px); }
          20% { transform: translate3d(-50%, -50%, 0) translateX(8px) translateY(-12px); }
          40% { transform: translate3d(-50%, -50%, 0) translateX(-5px) translateY(-18px); }
          60% { transform: translate3d(-50%, -50%, 0) translateX(-15px) translateY(-8px); }
          80% { transform: translate3d(-50%, -50%, 0) translateX(10px) translateY(5px); }
          100% { transform: translate3d(-50%, -50%, 0) translateX(0px) translateY(0px); }
        }

        /* Flash burst animation - quick white sparkles like camera flashes */
        @keyframes flashBurst {
          0% { 
            opacity: 0;
            transform: scale(0.3);
            filter: brightness(1);
          }
          5% { 
            opacity: 1;
            transform: scale(1.5);
            filter: brightness(3);
          }
          10% { 
            opacity: 1;
            transform: scale(1.2);
            filter: brightness(2.5);
          }
          20% { 
            opacity: 0.8;
            transform: scale(1);
            filter: brightness(2);
          }
          40% { 
            opacity: 0.4;
            transform: scale(0.8);
            filter: brightness(1.5);
          }
          100% { 
            opacity: 0;
            transform: scale(0.3);
            filter: brightness(1);
          }
        }

        /* Respect user's motion preferences */
        @media (prefers-reduced-motion: reduce) {
          div[aria-hidden="true"] {
            animation: none !important;
            opacity: 0.15 !important;
            transform: translate3d(-50%, -50%, 0) scale(1) !important;
            filter: brightness(1) !important;
            box-shadow: 0 0 8px rgba(255, 255, 255, 0.3) !important;
          }
        }

        /* Mobile performance optimizations */
        @media (max-width: 768px) {
          div[aria-hidden="true"] {
            will-change: transform, opacity;
          }
          @keyframes swayMovement {
            0%, 100% { transform: translate3d(-50%, -50%, 0) translateX(0px) translateY(0px); }
            50% { transform: translate3d(-50%, -50%, 0) translateX(10px) translateY(-5px); }
          }
          @keyframes circleMovement {
            0%, 100% { transform: translate3d(-50%, -50%, 0) translateX(0px) translateY(0px); }
            50% { transform: translate3d(-50%, -50%, 0) translateX(15px) translateY(-12px); }
          }
          @keyframes figure8Movement {
            0%, 100% { transform: translate3d(-50%, -50%, 0) translateX(0px) translateY(0px); }
            25% { transform: translate3d(-50%, -50%, 0) translateX(8px) translateY(-10px); }
            75% { transform: translate3d(-50%, -50%, 0) translateX(-8px) translateY(10px); }
          }
        }

        /* Enhanced effects for desktop */
        @media (min-width: 1024px) {
          div[aria-hidden="true"] {
            filter: blur(0.3px);
          }
        }
      `}</style>
    </div>
  );
}