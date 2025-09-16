'use client';

import React, { Suspense } from 'react';
import type { HighImpactExperienceProps } from './HighImpactExperience.types';
import { 
  useHighImpactExperience, 
  useImagePreloader, 
  useAccessibility 
} from './HighImpactExperience.hooks';
import { 
  MobileLayout, 
  DesktopLayout, 
  LoadingSkeleton, 
  ErrorFallback 
} from './HighImpactExperience.components';
import styles from './HighImpactExperience.module.css';

/**
 * Error boundary wrapper component
 */
class ComponentErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback: React.ComponentType<{ error?: Error }> },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: React.ReactNode; fallback: React.ComponentType<{ error?: Error }> }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('HighImpactExperience Error:', error, errorInfo);
    
    // Report to error tracking service in production
    if (process.env.NODE_ENV === 'production') {
      // Example: reportError(error, errorInfo);
    }
  }

  render() {
    if (this.state.hasError) {
      const FallbackComponent = this.props.fallback;
      return <FallbackComponent error={this.state.error} />;
    }

    return this.props.children;
  }
}

/**
 * Performance optimized component wrapper
 */
const PerformanceOptimizedWrapper = React.memo<{
  children: React.ReactNode;
  prefersReducedMotion: boolean;
  className?: string;
}>(({ children, prefersReducedMotion, className = '' }) => {
  return (
    <div 
      className={`${styles.experienceContainer} ${styles.container} ${className}`}
      data-performance-optimized="true"
      data-reduced-motion={prefersReducedMotion}
      role="banner"
      aria-label="High Impact Experience Section"
    >
      {children}
    </div>
  );
});

PerformanceOptimizedWrapper.displayName = 'PerformanceOptimizedWrapper';

/**
 * Main content component
 */
const HighImpactContent: React.FC<HighImpactExperienceProps> = ({ 
  className = '', 
  testId 
}) => {
  const { rtl, textContent, imageAssets } = useHighImpactExperience();
  const { prefersReducedMotion } = useAccessibility();
  
  // Preload images for better performance
  useImagePreloader([
    imageAssets.background,
    imageAssets.concertMobile,
    imageAssets.concertDesktop,
    imageAssets.patternMobile,
    imageAssets.patternDesktop,
  ]);

  // Set document direction for better RTL support
  React.useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('dir', rtl.direction);
    }
  }, [rtl.direction]);

  return (
    <PerformanceOptimizedWrapper 
      prefersReducedMotion={prefersReducedMotion}
      className={`${rtl.getLayoutClass()} ${className}`}
    >
      <div data-testid={testId}>
        {/* Mobile/Tablet Layout */}
        <MobileLayout
          textContent={textContent}
          rtlConfig={rtl}
          imageAssets={{
            concertMobile: imageAssets.concertMobile,
            patternMobile: imageAssets.patternMobile,
          }}
          className={styles.hideOnDesktop}
        />

        {/* Desktop Layout */}
        <DesktopLayout
          textContent={textContent}
          rtlConfig={rtl}
          imageAssets={{
            background: imageAssets.background,
            concertDesktop: imageAssets.concertDesktop,
            patternDesktop: imageAssets.patternDesktop,
          }}
          className={styles.showOnDesktop}
        />
      </div>
    </PerformanceOptimizedWrapper>
  );
};

/**
 * Main HighImpactExperience component with all modern features
 */
const HighImpactExperienceV2: React.FC<HighImpactExperienceProps> = (props) => {
  const { fallbackToLegacy = false, ...restProps } = props;

  // Optional fallback to legacy component
  if (fallbackToLegacy) {
    const HighImpactExperienceLegacy = React.lazy(() => 
      import('./HighImpactExperienceLegacy')
    );
    
    return (
      <Suspense fallback={<LoadingSkeleton />}>
        <HighImpactExperienceLegacy />
      </Suspense>
    );
  }

  return (
    <ComponentErrorBoundary fallback={ErrorFallback}>
      <Suspense fallback={<LoadingSkeleton />}>
        <HighImpactContent {...restProps} />
      </Suspense>
    </ComponentErrorBoundary>
  );
};

// Display name for debugging
HighImpactExperienceV2.displayName = 'HighImpactExperienceV2';

export default HighImpactExperienceV2;

// Named exports for individual components (useful for testing)
export {
  MobileLayout,
  DesktopLayout,
  LoadingSkeleton,
  ErrorFallback,
  ComponentErrorBoundary,
  PerformanceOptimizedWrapper,
};

// Export types for external usage
export type { HighImpactExperienceProps } from './HighImpactExperience.types';