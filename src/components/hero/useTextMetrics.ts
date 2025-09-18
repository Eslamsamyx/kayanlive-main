'use client';

import { useState, useCallback, useLayoutEffect, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { TextMetrics } from './types';

// Constants for responsive calculations
const MOBILE_CONFIG = {
  BASE_HEIGHT: 600,
  MIN_HEIGHT: 600,
  MAX_HEIGHT: 900,
  TITLE_EXPECTED_HEIGHT: 84,
  ADJUSTMENT_MULTIPLIER: 2
} as const;

const DESKTOP_CONFIG = {
  BASE_HEIGHT: 955,
  MIN_HEIGHT: 800,
  MAX_HEIGHT: 1400,
  TITLE_EXPECTED_HEIGHT: 273,
  DESC_EXPECTED_HEIGHT: 150,
  ADJUSTMENT_MULTIPLIER: 1.5
} as const;

// Memoized text measurement utility
const createMeasurementElement = (styles: Partial<CSSStyleDeclaration>): HTMLDivElement => {
  const element = document.createElement('div');
  Object.assign(element.style, {
    position: 'absolute',
    visibility: 'hidden',
    top: '-9999px',
    ...styles
  });
  return element;
};

export function useTextMetrics() {
  const [textMetrics, setTextMetrics] = useState<TextMetrics>({
    mobileHeight: MOBILE_CONFIG.BASE_HEIGHT,
    desktopHeight: DESKTOP_CONFIG.BASE_HEIGHT,
    mobileTitleHeight: 0,
    desktopTitleHeight: 0,
    desktopDescHeight: 0
  });

  const t = useTranslations();

  // Memoize text content to avoid unnecessary recalculations
  const textContent = useMemo(() => ({
    title: t('hero.title'),
    description: t('hero.description')
  }), [t]);

  const measureText = useCallback(() => {
    // SSR compatibility check
    if (typeof window === 'undefined') return;

    // Skip if text content is empty
    if (!textContent.title || !textContent.description) return;

    const tempContainer = document.createElement('div');
    tempContainer.style.cssText = 'position:absolute;visibility:hidden;top:-9999px';
    document.body.appendChild(tempContainer);

    try {
      // Mobile title measurement
      const mobileTitleEl = createMeasurementElement({
        fontFamily: "'FONTSPRING DEMO - Visby CF Demi Bold', sans-serif",
        fontWeight: 'normal',
        fontSize: '22px',
        lineHeight: '24px',
        width: '281px',
        textAlign: 'center',
        textTransform: 'capitalize',
        wordWrap: 'break-word'
      });
      mobileTitleEl.textContent = textContent.title;
      tempContainer.appendChild(mobileTitleEl);
      const mobileTitleHeight = mobileTitleEl.offsetHeight;

      // Desktop title measurement
      const desktopTitleEl = createMeasurementElement({
        fontWeight: 'bold',
        fontSize: '50px',
        lineHeight: '1.3',
        width: '875px',
        textTransform: 'capitalize',
        wordWrap: 'break-word'
      });
      desktopTitleEl.textContent = textContent.title;
      tempContainer.appendChild(desktopTitleEl);
      const desktopTitleHeight = desktopTitleEl.offsetHeight;

      // Desktop description measurement
      const desktopDescEl = createMeasurementElement({
        fontSize: '28px',
        lineHeight: '38px',
        fontWeight: '500',
        maxWidth: '627px',
        textAlign: 'center',
        textTransform: 'capitalize',
        padding: '0 32px',
        wordWrap: 'break-word'
      });
      desktopDescEl.textContent = textContent.description;
      tempContainer.appendChild(desktopDescEl);
      const desktopDescHeight = desktopDescEl.offsetHeight;

      // Calculate adaptive heights with proper constraints
      const mobileHeightAdjustment = Math.max(
        0,
        mobileTitleHeight - MOBILE_CONFIG.TITLE_EXPECTED_HEIGHT
      );
      const adaptiveMobileHeight = Math.max(
        MOBILE_CONFIG.MIN_HEIGHT,
        Math.min(
          MOBILE_CONFIG.MAX_HEIGHT,
          MOBILE_CONFIG.BASE_HEIGHT + mobileHeightAdjustment * MOBILE_CONFIG.ADJUSTMENT_MULTIPLIER
        )
      );

      const desktopTitleAdjustment = Math.max(
        0,
        desktopTitleHeight - DESKTOP_CONFIG.TITLE_EXPECTED_HEIGHT
      );
      const desktopDescAdjustment = Math.max(
        0,
        desktopDescHeight - DESKTOP_CONFIG.DESC_EXPECTED_HEIGHT
      );
      const adaptiveDesktopHeight = Math.max(
        DESKTOP_CONFIG.MIN_HEIGHT,
        Math.min(
          DESKTOP_CONFIG.MAX_HEIGHT,
          DESKTOP_CONFIG.BASE_HEIGHT +
            Math.max(desktopTitleAdjustment, desktopDescAdjustment) *
            DESKTOP_CONFIG.ADJUSTMENT_MULTIPLIER
        )
      );

      setTextMetrics({
        mobileHeight: adaptiveMobileHeight,
        desktopHeight: adaptiveDesktopHeight,
        mobileTitleHeight,
        desktopTitleHeight,
        desktopDescHeight
      });
    } catch (error) {
      console.warn('Text measurement failed:', error);
      // Fallback to base heights on error
      setTextMetrics(prev => ({
        ...prev,
        mobileHeight: MOBILE_CONFIG.BASE_HEIGHT,
        desktopHeight: DESKTOP_CONFIG.BASE_HEIGHT
      }));
    } finally {
      document.body.removeChild(tempContainer);
    }
  }, [textContent]);

  useLayoutEffect(() => {
    // SSR compatibility check
    if (typeof window === 'undefined') return;

    // Debounce text measurement to avoid excessive calculations
    const timer = setTimeout(measureText, 100);
    return () => clearTimeout(timer);
  }, [measureText]);

  // Return memoized metrics to prevent unnecessary re-renders
  return useMemo(() => textMetrics, [textMetrics]);
}