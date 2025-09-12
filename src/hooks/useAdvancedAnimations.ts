'use client';

import { useEffect, useState, useRef, RefObject } from 'react';
import { useMotionValue, useSpring, useTransform } from 'framer-motion';

/**
 * Custom hook for tracking mouse position relative to an element
 */
export function useMouseTracking(ref: RefObject<HTMLElement>) {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = element.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      
      // Calculate relative position from center
      const relativeX = e.clientX - centerX;
      const relativeY = e.clientY - centerY;
      
      mouseX.set(relativeX);
      mouseY.set(relativeY);
    };

    const handleMouseEnter = () => setIsHovered(true);
    const handleMouseLeave = () => {
      setIsHovered(false);
      // Reset to center on leave
      mouseX.set(0);
      mouseY.set(0);
    };

    element.addEventListener('mousemove', handleMouseMove);
    element.addEventListener('mouseenter', handleMouseEnter);
    element.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      element.removeEventListener('mousemove', handleMouseMove);
      element.removeEventListener('mouseenter', handleMouseEnter);
      element.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [mouseX, mouseY, ref]);

  // Spring physics for smooth following
  const springConfig = { damping: 15, stiffness: 150 };
  const springX = useSpring(mouseX, springConfig);
  const springY = useSpring(mouseY, springConfig);

  // Transform for subtle following (max 20px movement)
  const followX = useTransform(springX, [-200, 0, 200], [-20, 0, 20]);
  const followY = useTransform(springY, [-200, 0, 200], [-20, 0, 20]);

  return {
    mouseX,
    mouseY,
    followX,
    followY,
    isHovered,
    springX,
    springY
  };
}

/**
 * Custom hook for vibration effect
 */
export function useVibration(isActive: boolean, intensity: number = 2) {
  const vibrateX = useMotionValue(0);
  const vibrateY = useMotionValue(0);
  const intervalRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (isActive) {
      // Create random vibration
      intervalRef.current = setInterval(() => {
        vibrateX.set((Math.random() - 0.5) * intensity);
        vibrateY.set((Math.random() - 0.5) * intensity);
      }, 50);
    } else {
      // Stop vibration
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      vibrateX.set(0);
      vibrateY.set(0);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isActive, intensity, vibrateX, vibrateY]);

  return { vibrateX, vibrateY };
}

/**
 * Custom hook for shockwave effect
 */
export function useShockwave() {
  const [triggerShockwave, setTriggerShockwave] = useState(0);

  const createShockwave = () => {
    setTriggerShockwave(prev => prev + 1);
  };

  return { triggerShockwave, createShockwave };
}