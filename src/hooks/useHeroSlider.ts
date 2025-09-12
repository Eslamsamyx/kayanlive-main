'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useTranslations } from 'next-intl';

// Custom hook for measuring text dimensions and calculating adaptive heights
export function useAdaptiveTextHeight() {
  const [textMetrics, setTextMetrics] = useState({
    mobileHeight: 600,
    desktopHeight: 955,
    mobileTitleHeight: 0,
    desktopTitleHeight: 0,
    desktopDescHeight: 0
  });
  const measureRef = useRef<HTMLDivElement>(null);
  const t = useTranslations();

  const measureText = useCallback(() => {
    if (!measureRef.current) return;

    const tempContainer = document.createElement('div');
    tempContainer.style.position = 'absolute';
    tempContainer.style.visibility = 'hidden';
    tempContainer.style.top = '-9999px';
    document.body.appendChild(tempContainer);

    try {
      // Measure mobile title
      const mobileTitleEl = document.createElement('div');
      mobileTitleEl.innerHTML = t('hero.title');
      mobileTitleEl.style.fontFamily = "'FONTSPRING DEMO - Visby CF Demi Bold', sans-serif";
      mobileTitleEl.style.fontWeight = 'normal';
      mobileTitleEl.style.fontSize = '30px';
      mobileTitleEl.style.lineHeight = '32px';
      mobileTitleEl.style.width = '281px';
      mobileTitleEl.style.textAlign = 'center';
      mobileTitleEl.style.textTransform = 'capitalize';
      tempContainer.appendChild(mobileTitleEl);
      const mobileTitleHeight = mobileTitleEl.offsetHeight;

      // Measure desktop title
      const desktopTitleEl = document.createElement('div');
      desktopTitleEl.innerHTML = t('hero.title');
      desktopTitleEl.style.fontWeight = 'bold';
      desktopTitleEl.style.fontSize = '70px';
      desktopTitleEl.style.lineHeight = '1.3';
      desktopTitleEl.style.width = '875px';
      desktopTitleEl.style.textTransform = 'capitalize';
      tempContainer.appendChild(desktopTitleEl);
      const desktopTitleHeight = desktopTitleEl.offsetHeight;

      // Measure desktop description
      const desktopDescEl = document.createElement('div');
      desktopDescEl.innerHTML = t('hero.description');
      desktopDescEl.style.fontSize = '28px';
      desktopDescEl.style.lineHeight = '38px';
      desktopDescEl.style.fontWeight = '500';
      desktopDescEl.style.maxWidth = '627px';
      desktopDescEl.style.textAlign = 'center';
      desktopDescEl.style.textTransform = 'capitalize';
      desktopDescEl.style.padding = '0 32px';
      tempContainer.appendChild(desktopDescEl);
      const desktopDescHeight = desktopDescEl.offsetHeight;

      // Calculate adaptive heights
      const mobileBaseHeight = 600;
      const mobileTitleExpected = 84;
      const mobileHeightAdjustment = Math.max(0, mobileTitleHeight - mobileTitleExpected);
      const adaptiveMobileHeight = Math.max(600, Math.min(900, mobileBaseHeight + mobileHeightAdjustment * 2));

      const desktopBaseHeight = 955;
      const desktopTitleExpected = 273;
      const desktopDescExpected = 150;
      const desktopTitleAdjustment = Math.max(0, desktopTitleHeight - desktopTitleExpected);
      const desktopDescAdjustment = Math.max(0, desktopDescHeight - desktopDescExpected);
      const adaptiveDesktopHeight = Math.max(955, Math.min(1400, desktopBaseHeight + Math.max(desktopTitleAdjustment, desktopDescAdjustment) * 1.5));

      setTextMetrics({
        mobileHeight: adaptiveMobileHeight,
        desktopHeight: adaptiveDesktopHeight,
        mobileTitleHeight,
        desktopTitleHeight,
        desktopDescHeight
      });
    } catch (error) {
      console.warn('Text measurement failed:', error);
    } finally {
      document.body.removeChild(tempContainer);
    }
  }, [t]);

  useEffect(() => {
    const timer = setTimeout(measureText, 100);
    return () => clearTimeout(timer);
  }, [measureText]);

  return { textMetrics, measureRef };
}

// Custom hook for slider logic
export function useHeroSlider(totalSlides: number = 3) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (!isPaused) {
      const interval = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % totalSlides);
      }, 6000);
      return () => clearInterval(interval);
    }
  }, [isPaused, totalSlides]);

  const goToSlide = useCallback((index: number) => {
    setCurrentSlide(index);
    setIsPaused(true);
    setTimeout(() => setIsPaused(false), 10000);
  }, []);

  const pauseSlider = useCallback(() => setIsPaused(true), []);
  const resumeSlider = useCallback(() => setIsPaused(false), []);

  return {
    currentSlide,
    isPaused,
    goToSlide,
    pauseSlider,
    resumeSlider,
    setCurrentSlide,
    setIsPaused
  };
}