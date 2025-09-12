// TypeScript interfaces for HighImpactExperience component

export interface HighImpactTextContent {
  high: string;
  impact: string;
  experience: string;
}

export interface RTLConfig {
  isRTL: boolean;
  locale: string;
  direction: 'ltr' | 'rtl';
}

export interface GradientConfig {
  primary: string;
  secondary: string;
}

export interface ImageAssets {
  background: string;
  concertMobile: string;
  concertDesktop: string;
  patternMobile: string;
  patternDesktop: string;
}

export interface ResponsiveBreakpoints {
  mobile: number;
  tablet: number;
  desktop: number;
}

export interface ComponentTheme {
  colors: {
    background: string;
    text: string;
    gradients: {
      primary: GradientConfig;
      secondary: GradientConfig;
    };
  };
  typography: {
    fontFamily: string;
    fontSize: {
      mobile: string;
      desktop: string;
    };
    lineHeight: {
      mobile: string;
      desktop: string;
    };
    letterSpacing: string;
  };
  spacing: {
    container: string;
    textLines: string;
  };
}

export interface HighImpactExperienceProps {
  className?: string;
  theme?: Partial<ComponentTheme>;
  fallbackToLegacy?: boolean;
  testId?: string;
}

export interface TextLineProps {
  children: React.ReactNode;
  variant: 'neutral' | 'gradient';
  size: 'mobile' | 'desktop';
  rtlConfig: RTLConfig;
  className?: string;
}

export interface ImageSectionProps {
  imageSrc: string;
  alt?: string;
  rtlConfig: RTLConfig;
  variant: 'mobile' | 'desktop';
  className?: string;
}

export interface DecorativePatternProps {
  imageSrc: string;
  rtlConfig: RTLConfig;
  variant: 'mobile' | 'desktop';
  className?: string;
}

// Hook return types
export interface UseRTLReturn extends RTLConfig {
  getGradientClass: (type: 'primary' | 'secondary') => string;
  getLayoutClass: () => string;
}

export interface UseResponsiveReturn {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  breakpoints: ResponsiveBreakpoints;
}

export interface UseHighImpactExperienceReturn {
  rtl: UseRTLReturn;
  responsive: UseResponsiveReturn;
  textContent: HighImpactTextContent;
  imageAssets: ImageAssets;
  theme: ComponentTheme;
}