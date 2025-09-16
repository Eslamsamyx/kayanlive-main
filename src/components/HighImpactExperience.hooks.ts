// Custom hooks for HighImpactExperience component

import { useLocale, useTranslations } from 'next-intl';
import { useMemo, useEffect, useState } from 'react';
import type {
  UseRTLReturn,
  UseResponsiveReturn,
  UseHighImpactExperienceReturn,
  HighImpactTextContent,
  ImageAssets,
  ComponentTheme,
  ResponsiveBreakpoints,
} from './HighImpactExperience.types';

/**
 * Hook for RTL/LTR logic and gradient direction management
 */
export const useRTL = (): UseRTLReturn => {
  const locale = useLocale();
  
  const rtlConfig = useMemo(() => {
    const isRTL = locale === 'ar';
    return {
      isRTL,
      locale,
      direction: (isRTL ? 'rtl' : 'ltr') as 'ltr' | 'rtl',
    };
  }, [locale]);

  const getGradientClass = useMemo(() => {
    return (type: 'primary' | 'secondary') => {
      const { isRTL } = rtlConfig;
      if (type === 'primary') {
        return isRTL ? 'gradientPrimaryRtl' : 'gradientPrimary';
      }
      return isRTL ? 'gradientSecondaryRtl' : 'gradientSecondary';
    };
  }, [rtlConfig]);

  const getLayoutClass = useMemo(() => {
    return () => rtlConfig.isRTL ? 'rtl' : 'ltr';
  }, [rtlConfig]);

  return {
    ...rtlConfig,
    getGradientClass,
    getLayoutClass,
  };
};

/**
 * Hook for responsive breakpoint management
 */
export const useResponsive = (): UseResponsiveReturn => {
  const [windowWidth, setWindowWidth] = useState(0);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    
    // Set initial width
    handleResize();
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const breakpoints: ResponsiveBreakpoints = useMemo(() => ({
    mobile: 768,
    tablet: 1024,
    desktop: 1280,
  }), []);

  const responsive = useMemo(() => {
    const { mobile, tablet } = breakpoints;
    return {
      isMobile: windowWidth < mobile,
      isTablet: windowWidth >= mobile && windowWidth < tablet,
      isDesktop: windowWidth >= tablet,
      breakpoints,
    };
  }, [windowWidth, breakpoints]);

  return responsive;
};

/**
 * Hook for managing translated text content
 */
export const useTextContent = (): HighImpactTextContent => {
  const t = useTranslations();
  
  return useMemo(() => ({
    high: t('highImpact.high'),
    impact: t('highImpact.impact'),
    experience: t('highImpact.experience'),
  }), [t]);
};

/**
 * Hook for managing image assets
 */
export const useImageAssets = (): ImageAssets => {
  return useMemo(() => ({
    background: "/assets/29064c5a0d86395e45b642fe4e6daf670490f723.png",
    concertMobile: "/assets/3f0c70e340a28d47867891894e77a32ca1a022f1.png",
    concertDesktop: "/assets/3f0c70e340a28d47867891894e77a32ca1a022f1.png",
    patternMobile: "/assets/6ebbb286c787b4009100c9f8cd397942ae83de56.png",
    patternDesktop: "/assets/6ebbb286c787b4009100c9f8cd397942ae83de56.png",
  }), []);
};

/**
 * Hook for managing component theme
 */
export const useComponentTheme = (): ComponentTheme => {
  return useMemo(() => ({
    colors: {
      background: '#2c2c2b',
      text: '#ffffff',
      gradients: {
        primary: {
          primary: 'linear-gradient(90deg, #a095e1 0%, #74cfaa 100%)',
          secondary: 'linear-gradient(270deg, #a095e1 0%, #74cfaa 100%)',
        },
        secondary: {
          primary: 'linear-gradient(90deg, #74cfaa 0%, #a095e1 100%)',
          secondary: 'linear-gradient(270deg, #74cfaa 0%, #a095e1 100%)',
        },
      },
    },
    typography: {
      fontFamily: '"Poppins", sans-serif',
      fontSize: {
        mobile: 'clamp(50px, 12vw, 85px)',
        desktop: 'clamp(80px, 12vw, 170px)',
      },
      lineHeight: {
        mobile: 'clamp(70px, 16vw, 110px)',
        desktop: '1.3em',
      },
      letterSpacing: 'clamp(-2.4px, -0.3vw, -3px)',
    },
    spacing: {
      container: 'clamp(40px, 8vh, 60px)',
      textLines: '0.75rem',
    },
  }), []);
};

/**
 * Main hook that combines all functionality
 */
export const useHighImpactExperience = (): UseHighImpactExperienceReturn => {
  const rtl = useRTL();
  const responsive = useResponsive();
  const textContent = useTextContent();
  const imageAssets = useImageAssets();
  const theme = useComponentTheme();

  return {
    rtl,
    responsive,
    textContent,
    imageAssets,
    theme,
  };
};

/**
 * Hook for performance optimization - preloads images
 */
export const useImagePreloader = (images: string[]) => {
  useEffect(() => {
    const preloadImages = images.map((src) => {
      const img = new Image();
      img.src = src;
      return img;
    });

    return () => {
      preloadImages.forEach((img) => {
        img.src = '';
      });
    };
  }, [images]);
};

/**
 * Hook for accessibility improvements
 */
export const useAccessibility = () => {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return { prefersReducedMotion };
};