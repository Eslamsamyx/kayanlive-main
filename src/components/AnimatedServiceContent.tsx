'use client';

import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import { useMouseTracking, useVibration, useShockwave } from '@/hooks/useAdvancedAnimations';

interface AnimatedServiceContentProps {
  children: React.ReactNode;
  className?: string;
  isImage?: boolean;
}

export default function AnimatedServiceContent({ 
  children, 
  className = '',
  isImage = false
}: AnimatedServiceContentProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  
  // Mouse tracking for cursor following
  const { followX, followY, isHovered } = useMouseTracking(contentRef);
  
  // Vibration effect
  const { vibrateX, vibrateY } = useVibration(isHovered, 2);
  
  // Shockwave effect
  const { triggerShockwave, createShockwave } = useShockwave();

  // Only apply effects to image content
  if (!isImage) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      ref={contentRef}
      className={`relative overflow-hidden ${className}`}
      onMouseEnter={createShockwave}
      style={{ width: '100%', height: '100%' }}
    >
      {/* Animated inner content */}
      <motion.div
        className="relative w-full h-full"
        style={{
          x: isHovered ? vibrateX : followX,
          y: isHovered ? vibrateY : followY,
          width: '100%',
          height: '100%'
        }}
        whileHover={{
          scale: 1.02,
          transition: {
            scale: { duration: 0.3 }
          }
        }}
      >
        {children}
      </motion.div>

      {/* Shockwave effect overlay - contained within boundaries */}
      {triggerShockwave > 0 && (
        <>
          {/* First shockwave */}
          <motion.div
            key={triggerShockwave}
            className="absolute inset-0 pointer-events-none"
            style={{
              borderRadius: '50%',
              border: '2px solid rgba(122, 253, 214, 0.8)',
              zIndex: 100
            }}
            initial={{ 
              scale: 0,
              opacity: 1,
              x: '-50%',
              y: '-50%',
              left: '50%',
              top: '50%'
            }}
            animate={{ 
              scale: 2,
              opacity: 0
            }}
            transition={{ 
              duration: 0.8,
              ease: "easeOut"
            }}
          />
          
          {/* Second shockwave with delay */}
          <motion.div
            key={`${triggerShockwave}-2`}
            className="absolute inset-0 pointer-events-none"
            style={{
              borderRadius: '50%',
              border: '3px solid rgba(160, 149, 225, 0.6)',
              zIndex: 99
            }}
            initial={{ 
              scale: 0,
              opacity: 0.8,
              x: '-50%',
              y: '-50%',
              left: '50%',
              top: '50%'
            }}
            animate={{ 
              scale: 1.8,
              opacity: 0
            }}
            transition={{ 
              duration: 0.9,
              ease: "easeOut",
              delay: 0.1
            }}
          />

          {/* Third inner pulse */}
          <motion.div
            key={`${triggerShockwave}-3`}
            className="absolute inset-0 pointer-events-none"
            style={{
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(122, 253, 214, 0.3) 0%, transparent 70%)',
              zIndex: 98
            }}
            initial={{ 
              scale: 0,
              opacity: 1
            }}
            animate={{ 
              scale: 1.5,
              opacity: 0
            }}
            transition={{ 
              duration: 0.6,
              ease: "easeOut"
            }}
          />
        </>
      )}
    </motion.div>
  );
}