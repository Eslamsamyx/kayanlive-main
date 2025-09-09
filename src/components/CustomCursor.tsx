'use client';

import { useEffect, useState } from 'react';

export default function CustomCursor() {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isPointer, setIsPointer] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });
      setIsVisible(true);
    };

    const handleMouseEnter = () => setIsVisible(true);
    const handleMouseLeave = () => setIsVisible(false);

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const isClickable = 
        target.tagName === 'A' ||
        target.tagName === 'BUTTON' ||
        target.onclick !== null ||
        target.style.cursor === 'pointer' ||
        target.closest('a') !== null ||
        target.closest('button') !== null;
      
      setIsPointer(isClickable);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseenter', handleMouseEnter);
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mouseover', handleMouseOver);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseenter', handleMouseEnter);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mouseover', handleMouseOver);
    };
  }, []);

  return (
    <>
      {/* Hide default cursor globally */}
      <style jsx global>{`
        * {
          cursor: none !important;
        }
      `}</style>
      
      {/* Custom cursor - Arrow/Pointer shape from Figma */}
      <div
        className={`fixed pointer-events-none z-[9999] transition-transform duration-100 ${
          isVisible ? 'opacity-100' : 'opacity-0'
        }`}
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
          transform: `translate(-5px, -5px) ${isPointer ? 'scale(1.2)' : 'scale(1)'}`,
        }}
      >
        <svg 
          width="38" 
          height="49" 
          viewBox="0 0 38 49" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
          className="transition-all duration-200"
        >
          <path 
            fillRule="evenodd" 
            clipRule="evenodd" 
            d="M1.03509 7.59194C0.666353 4.88743 3.80767 3.13569 5.91469 4.87086L31.1722 25.6708C33.3448 27.4601 32.0796 30.9866 29.265 30.9866H19.2792C18.2449 30.9866 17.2835 31.5194 16.7353 32.3965L11.0187 41.5419C9.531 43.922 5.88146 43.1381 5.5023 40.3571L1.03509 7.59194Z" 
            fill={isPointer ? '#7afdd6' : 'white'}
            className="transition-colors duration-200"
          />
        </svg>
      </div>
    </>
  );
}