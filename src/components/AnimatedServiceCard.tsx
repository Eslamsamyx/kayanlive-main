'use client';

import React, { useRef } from 'react';
import { motion, useScroll, useTransform, useInView } from 'framer-motion';

interface AnimatedServiceCardProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}

export default function AnimatedServiceCard({ 
  children, 
  className = '',
  delay = 0 
}: AnimatedServiceCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(cardRef, { once: false, amount: 0.3 });
  
  // Scroll-based scale animation
  const { scrollYProgress } = useScroll({
    target: cardRef,
    offset: ["start end", "center center"]
  });
  
  // Transform scroll progress to scale - dramatic entrance from center
  const scale = useTransform(scrollYProgress, [0, 0.4, 0.5], [0, 0.9, 1]);
  const opacity = useTransform(scrollYProgress, [0, 0.3, 0.5], [0, 0.5, 1]);

  return (
    <motion.div
      ref={cardRef}
      className={`relative ${className}`}
      style={{
        scale,
        opacity
      }}
      initial={{ scale: 0, opacity: 0 }}
      animate={isInView ? { 
        scale: 1, 
        opacity: 1,
        transition: {
          scale: {
            type: "spring",
            stiffness: 300,
            damping: 25,
            delay,
            mass: 1.2
          },
          opacity: {
            duration: 0.3,
            delay
          }
        }
      } : { scale: 0, opacity: 0 }}
    >
      {/* Card content - container stays static */}
      {children}
    </motion.div>
  );
}