'use client';

import { memo } from 'react';
import { SlideIndicatorProps } from './types';

const SlideIndicator = memo<SlideIndicatorProps>(({
  totalSlides,
  currentSlide,
  onSlideChange,
  variant,
  position = {},
  locale = 'en'
}) => {
  const isMobile = variant === 'mobile';

  const containerStyle = {
    ...position,
    ...(isMobile && {
      left: '50%',
      bottom: '40px',
      transform: 'translateX(-50%)'
    }),
    ...(!isMobile && {
      [locale === 'ar' ? 'left' : 'right']: '76px',
      top: '424px'
    })
  };

  const indicatorSize = isMobile ? '20.661px' : '35.355px';
  const innerSize = isMobile ? '14.613px' : '25px';
  const activeSize = isMobile ? '8.629px' : '15.79px';
  const gap = isMobile ? '20.66px' : '35.355px';
  const rotation = isMobile ? '224.999deg' : '315deg';
  const borderWidth = isMobile ? '1.3px' : '2px';

  return (
    <div
      className="absolute flex items-center justify-center"
      style={containerStyle}
      role="tablist"
      aria-label="Slide navigation"
    >
      <div
        className={`flex ${isMobile ? '' : 'flex-col'}`}
        style={{ gap }}
      >
        {Array.from({ length: totalSlides }, (_, index) => (
          <button
            key={index}
            onClick={() => onSlideChange(index)}
            className="relative flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50 rounded-sm transition-all duration-200 hover:scale-110"
            style={{ width: indicatorSize, height: indicatorSize }}
            aria-label={`Go to slide ${index + 1}`}
            role="tab"
            aria-selected={currentSlide === index}
            aria-controls={`slide-${index}`}
          >
            <div className="flex-none" style={{ transform: `rotate(${rotation})` }}>
              <div
                className="relative backdrop-blur-[7.5px] backdrop-filter transition-all duration-300"
                style={{
                  width: innerSize,
                  height: innerSize,
                  backgroundColor: currentSlide === index
                    ? 'transparent'
                    : 'rgba(255,255,255,0.01)',
                  border: `${borderWidth} solid #ffffff`
                }}
              >
                {currentSlide === index && (
                  <div
                    className="absolute bg-white transition-all duration-300"
                    style={{
                      width: activeSize,
                      height: activeSize,
                      top: isMobile ? 'calc(50% - 0.244px)' : 'calc(50% + 0.23px)',
                      left: isMobile ? 'calc(50% + 0.076px)' : 'calc(50% + 0.117px)',
                      transform: 'translate(-50%, -50%)'
                    }}
                  />
                )}
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
});

SlideIndicator.displayName = 'SlideIndicator';

export default SlideIndicator;