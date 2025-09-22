'use client';

import { useState, useEffect } from 'react';
import { IMAGE_LOCATIONS } from '@/lib/image-locations';

interface ViewportDimensions {
  width: number;
  height: number;
  quality: number;
}

interface LocationConfig {
  mobile?: ViewportDimensions;
  tablet?: ViewportDimensions;
  desktop: ViewportDimensions;
}

interface LocationAwareImageProps {
  src: string; // Original image path
  location: keyof typeof IMAGE_LOCATIONS; // Location ID from config
  alt?: string;
  className?: string;
  priority?: boolean;
  onLoad?: () => void;
  fallback?: string; // Fallback image if optimized version doesn't exist
}

/**
 * Smart image component that automatically uses the correct optimized image
 * based on the location and viewport
 */
export default function LocationAwareImage({
  src,
  location,
  alt = '',
  className = '',
  onLoad,
  fallback,
}: LocationAwareImageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [currentViewport, setCurrentViewport] = useState<'mobile' | 'tablet' | 'desktop'>('desktop');

  // Get location configuration
  const locationConfig = IMAGE_LOCATIONS[location];

  // Determine viewport based on window width
  useEffect(() => {
    if (!locationConfig) return;

    if (typeof window === 'undefined') return;
    const determineViewport = () => {
      const width = window.innerWidth;
      if (width <= 420) {
        setCurrentViewport('mobile');
      } else if (width <= 768 && 'tablet' in locationConfig) {
        setCurrentViewport('tablet');
      } else {
        setCurrentViewport('desktop');
      }
    };

    determineViewport();
    window.addEventListener('resize', determineViewport);
    return () => window.removeEventListener('resize', determineViewport);
  }, [locationConfig]);

  // Early return after hooks
  if (!locationConfig) {
    console.error(`Location "${location}" not found in IMAGE_LOCATIONS`);
    return null;
  }

  // Generate optimized image paths
  const fileName = src.substring(src.lastIndexOf('/') + 1, src.lastIndexOf('.'));
  const getOptimizedPath = (viewport: string) =>
    `/optimized/${location}/${fileName}-${location}-${viewport}.webp`;

  // Get dimensions for current viewport
  const dimensions = (locationConfig as LocationConfig)[currentViewport] || (locationConfig as LocationConfig).desktop;


  const handleLoad = () => {
    setIsLoading(false);
    onLoad?.();
  };

  const handleError = () => {
    setHasError(true);
    setIsLoading(false);

    // Try fallback image if provided
    if (fallback && !hasError) {
      console.warn(`Failed to load optimized image for location "${location}", trying fallback`);
    }
  };

  // Use picture element for art-directed responsive images
  return (
    <picture className={className}>
      {/* Mobile source */}
      {'mobile' in locationConfig && (
        <source
          media="(max-width: 420px)"
          srcSet={getOptimizedPath('mobile')}
          type="image/webp"
          width={(locationConfig as LocationConfig).mobile!.width}
          height={(locationConfig as LocationConfig).mobile!.height}
        />
      )}

      {/* Tablet source */}
      {'tablet' in locationConfig && (
        <source
          media="(max-width: 768px)"
          srcSet={getOptimizedPath('tablet')}
          type="image/webp"
          width={(locationConfig as LocationConfig).tablet!.width}
          height={(locationConfig as LocationConfig).tablet!.height}
        />
      )}

      {/* Desktop source */}
      <source
        media={`(min-width: ${'tablet' in locationConfig ? 769 : 421}px)`}
        srcSet={getOptimizedPath('desktop')}
        type="image/webp"
        width={(locationConfig as LocationConfig).desktop.width}
        height={(locationConfig as LocationConfig).desktop.height}
      />

      {/* Fallback img element */}
      <img
        src={hasError && fallback ? fallback : getOptimizedPath(currentViewport)}
        alt={alt}
        width={dimensions.width}
        height={dimensions.height}
        onLoad={handleLoad}
        onError={handleError}
        className={`
          ${isLoading ? 'opacity-0' : 'opacity-100'}
          transition-opacity duration-300
        `}
        style={{
          aspectRatio: `${dimensions.width}/${dimensions.height}`
        }}
      />
    </picture>
  );
}

/**
 * Hook to preload images for specific locations
 */
export function usePreloadImages(locations: Array<keyof typeof IMAGE_LOCATIONS>) {
  useEffect(() => {
    locations.forEach(location => {
      const config = IMAGE_LOCATIONS[location];
      if (config) {
        // Preload desktop version by default for all configured locations
        const link = document.createElement('link');
        link.rel = 'preload';
        link.as = 'image';
        link.type = 'image/webp';
        link.href = `/optimized/${location}/*-${location}-desktop.webp`;
        document.head.appendChild(link);
      }
    });
  }, [locations]);
}

/**
 * Component to generate responsive picture element from config
 */
export function ResponsiveLocationImage({
  src,
  location,
  alt,
  className = '',
  loading = 'lazy',
}: {
  src: string;
  location: keyof typeof IMAGE_LOCATIONS;
  alt?: string;
  className?: string;
  loading?: 'lazy' | 'eager';
}) {
  const locationConfig = IMAGE_LOCATIONS[location];

  if (!locationConfig) {
    console.error(`Location "${location}" not found in IMAGE_LOCATIONS`);
    return null;
  }

  const fileName = src.substring(src.lastIndexOf('/') + 1, src.lastIndexOf('.'));

  return (
    <picture className={className}>
      {/* Generate source for each viewport */}
      {Object.entries(locationConfig).map(([viewport, dims]) => {
        const mediaQuery =
          viewport === 'mobile' ? '(max-width: 420px)' :
          viewport === 'tablet' ? '(max-width: 768px)' :
          '(min-width: 769px)';

        return (
          <source
            key={viewport}
            media={mediaQuery}
            srcSet={`/optimized/${location}/${fileName}-${location}-${viewport}.webp`}
            type="image/webp"
            width={dims.width}
            height={dims.height}
          />
        );
      })}

      {/* Fallback img */}
      <img
        src={`/optimized/${location}/${fileName}-${location}-desktop.webp`}
        alt={alt || ''}
        width={(locationConfig as LocationConfig).desktop.width}
        height={(locationConfig as LocationConfig).desktop.height}
        loading={loading}
        className="w-full h-auto"
        style={{ aspectRatio: `${locationConfig.desktop.width}/${locationConfig.desktop.height}` }}
      />
    </picture>
  );
}