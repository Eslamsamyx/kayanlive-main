// Sub-components for HighImpactExperience

import React from 'react';
import type {
  TextLineProps,
  ImageSectionProps,
  DecorativePatternProps,
  RTLConfig,
  HighImpactTextContent,
} from './HighImpactExperience.types';
import styles from './HighImpactExperience.module.css';

/**
 * Text line component with gradient support
 */
export const TextLine: React.FC<TextLineProps> = ({
  children,
  variant,
  size,
  rtlConfig,
  className = '',
}) => {
  const getGradientStyle = () => {
    if (variant !== 'gradient') return {};
    
    const gradientDirection = rtlConfig.isRTL 
      ? 'linear-gradient(90deg, #74cfaa 0%, #a095e1 100%)'
      : 'linear-gradient(270deg, #74cfaa 0%, #a095e1 100%)';
    
    return {
      background: gradientDirection,
      backgroundClip: 'text',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      color: 'transparent', // Fallback for non-webkit browsers
    };
  };

  const baseClasses = [
    styles.textLine,
    size === 'desktop' ? styles.desktopTextLine : '',
    variant === 'neutral' ? styles.textLineNeutral : '',
    className,
  ].filter(Boolean).join(' ');

  return (
    <div 
      className={baseClasses}
      style={getGradientStyle()}
      role="text"
      aria-label={typeof children === 'string' ? children : undefined}
    >
      {children}
    </div>
  );
};

/**
 * Text lines container component
 */
interface TextLinesProps {
  content: HighImpactTextContent;
  rtlConfig: RTLConfig;
  size: 'mobile' | 'desktop';
  className?: string;
}

export const TextLines: React.FC<TextLinesProps> = ({
  content,
  rtlConfig,
  size,
  className = '',
}) => {
  return (
    <div 
      className={`${styles.textLinesContainer} ${className}`}
      role="group"
      aria-label="High Impact Experience text"
    >
      <TextLine variant="neutral" size={size} rtlConfig={rtlConfig}>
        {content.high}
      </TextLine>
      
      <TextLine variant="gradient" size={size} rtlConfig={rtlConfig}>
        {content.impact}
      </TextLine>
      
      <TextLine variant="neutral" size={size} rtlConfig={rtlConfig}>
        {content.experience}
      </TextLine>
    </div>
  );
};

/**
 * Image section component
 */
export const ImageSection: React.FC<ImageSectionProps> = ({
  imageSrc,
  alt = '',
  rtlConfig,
  variant,
  className = '',
}) => {
  const sectionStyle = {
    backgroundImage: `url('${imageSrc}')`,
  };

  const baseClass = variant === 'mobile' ? styles.mobileImageSection : styles.desktopImageOverlay;

  return (
    <div
      className={`${baseClass} ${className}`}
      style={sectionStyle}
      role="img"
      aria-label={alt}
    >
      {variant === 'mobile' && (
        <div className={styles.mobileImageOverlay} aria-hidden="true" />
      )}
    </div>
  );
};

/**
 * Decorative pattern component
 */
export const DecorativePattern: React.FC<DecorativePatternProps> = ({
  imageSrc,
  rtlConfig,
  variant,
  className = '',
}) => {
  const patternStyle = {
    backgroundImage: `url('${imageSrc}')`,
  };

  const baseClass = variant === 'mobile' 
    ? styles.mobileDecorativePattern 
    : styles.desktopDecorativePattern;

  return (
    <div
      className={`${baseClass} ${className}`}
      style={patternStyle}
      aria-hidden="true"
    />
  );
};

/**
 * Mobile layout component
 */
interface MobileLayoutProps {
  textContent: HighImpactTextContent;
  rtlConfig: RTLConfig;
  imageAssets: {
    concertMobile: string;
    patternMobile: string;
  };
  className?: string;
}

export const MobileLayout: React.FC<MobileLayoutProps> = ({
  textContent,
  rtlConfig,
  imageAssets,
  className = '',
}) => {
  return (
    <section 
      className={`${styles.mobileLayout} ${className}`}
      aria-label="High Impact Experience - Mobile View"
    >
      <div className={`${styles.mobileCard} ${rtlConfig.isRTL ? styles.rtl : styles.ltr}`}>
        {/* Text Section */}
        <div className={styles.mobileTextSection}>
          <TextLines 
            content={textContent} 
            rtlConfig={rtlConfig} 
            size="mobile"
          />
        </div>

        {/* Image Section */}
        <ImageSection
          imageSrc={imageAssets.concertMobile}
          alt="Concert performance with vibrant lighting"
          rtlConfig={rtlConfig}
          variant="mobile"
        />

        {/* Blur Element */}
        <div className={styles.mobileBlurElement} aria-hidden="true" />

        {/* Decorative Pattern */}
        <DecorativePattern
          imageSrc={imageAssets.patternMobile}
          rtlConfig={rtlConfig}
          variant="mobile"
        />
      </div>
    </section>
  );
};

/**
 * Desktop layout component
 */
interface DesktopLayoutProps {
  textContent: HighImpactTextContent;
  rtlConfig: RTLConfig;
  imageAssets: {
    background: string;
    concertDesktop: string;
    patternDesktop: string;
  };
  className?: string;
}

export const DesktopLayout: React.FC<DesktopLayoutProps> = ({
  textContent,
  rtlConfig,
  imageAssets,
  className = '',
}) => {
  const cardStyle = {
    backgroundImage: `url('${imageAssets.background}')`,
    transform: rtlConfig.isRTL ? 'scaleX(-1)' : 'none',
  };

  const shadowStyle = {
    boxShadow: rtlConfig.isRTL 
      ? 'inset 100px 0px 200px 0px #231f20' 
      : 'inset -100px 0px 200px 0px #231f20',
  };

  return (
    <section 
      className={`${styles.desktopLayout} ${className}`}
      aria-label="High Impact Experience - Desktop View"
    >
      <div 
        className={`${styles.desktopCard} ${rtlConfig.isRTL ? styles.rtl : styles.ltr}`}
        style={cardStyle}
      >
        {/* Concert Image Overlay */}
        <ImageSection
          imageSrc={imageAssets.concertDesktop}
          alt="Concert performance with vibrant lighting"
          rtlConfig={rtlConfig}
          variant="desktop"
        />

        {/* Blur Overlay */}
        <div className={styles.desktopBlurOverlay} aria-hidden="true" />

        {/* Text Section */}
        <div 
          className={styles.desktopTextSection}
          style={{ transform: rtlConfig.isRTL ? 'scaleX(-1)' : 'none' }}
        >
          <div className={`${styles.desktopTextContent} ${rtlConfig.isRTL ? styles.rtl : styles.ltr}`}>
            <TextLines 
              content={textContent} 
              rtlConfig={rtlConfig} 
              size="desktop"
            />
          </div>
        </div>

        {/* Decorative Pattern */}
        <DecorativePattern
          imageSrc={imageAssets.patternDesktop}
          rtlConfig={rtlConfig}
          variant="desktop"
        />

        {/* Inner Shadow */}
        <div 
          className={styles.desktopInnerShadow}
          style={shadowStyle}
          aria-hidden="true"
        />
      </div>
    </section>
  );
};

/**
 * Loading skeleton component
 */
export const LoadingSkeleton: React.FC<{ className?: string }> = ({ 
  className = '' 
}) => {
  return (
    <div 
      className={`${styles.experienceContainer} ${className}`}
      role="status"
      aria-label="Loading high impact experience content"
    >
      <div className={styles.mobileLayout}>
        <div className={`${styles.mobileCard} animate-pulse`}>
          <div className="bg-gray-300 h-20 w-3/4 mx-auto mt-8 rounded"></div>
          <div className="bg-gray-400 h-16 w-1/2 mx-auto mt-4 rounded"></div>
          <div className="bg-gray-300 h-20 w-2/3 mx-auto mt-4 rounded"></div>
        </div>
      </div>
    </div>
  );
};

/**
 * Error boundary fallback component
 */
export const ErrorFallback: React.FC<{ 
  error?: Error;
  className?: string;
}> = ({ 
  error,
  className = '' 
}) => {
  return (
    <div 
      className={`${styles.experienceContainer} ${className}`}
      role="alert"
      aria-label="Error loading high impact experience content"
    >
      <div className={styles.mobileLayout}>
        <div className={`${styles.mobileCard} flex items-center justify-center`}>
          <div className="text-center text-white p-8">
            <h2 className="text-2xl font-semibold mb-4">Something went wrong</h2>
            <p className="text-gray-300 mb-4">
              Unable to load the High Impact Experience content.
            </p>
            {error && (
              <details className="text-sm text-gray-400">
                <summary className="cursor-pointer">Error details</summary>
                <pre className="mt-2 text-left overflow-auto">
                  {error.message}
                </pre>
              </details>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};