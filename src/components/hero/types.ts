export interface HeroSlideData {
  id: number;
  type: 'main' | 'about';
  backgroundImage: string;
  backgroundPosition?: string;
  backgroundSize?: string;
}

export interface SlideIndicatorProps {
  totalSlides: number;
  currentSlide: number;
  onSlideChange: (index: number) => void;
  variant: 'mobile' | 'desktop';
  position?: {
    bottom?: string;
    left?: string;
    right?: string;
    top?: string;
  };
  locale?: string;
}

export interface HeroSlideProps {
  slide: HeroSlideData;
  isActive: boolean;
  variant: 'mobile' | 'desktop';
  textMetrics: TextMetrics;
  locale: string;
  onSlideChange: (index: number) => void;
  totalSlides: number;
  currentSlide: number;
}

export interface StatisticsBoxesProps {
  variant: 'mobile' | 'desktop';
  position?: {
    bottom?: string;
    left?: string;
    right?: string;
  };
  locale?: string;
}

export interface TextMetrics {
  mobileHeight: number;
  desktopHeight: number;
  mobileTitleHeight: number;
  desktopTitleHeight: number;
  desktopDescHeight: number;
}

export interface HeroCarouselProps {
  slides: HeroSlideData[];
  autoPlayInterval?: number;
  pauseOnHover?: boolean;
  pauseOnTouch?: boolean;
  className?: string;
}