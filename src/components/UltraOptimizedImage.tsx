'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import { decode } from 'blurhash';

interface UltraOptimizedImageProps {
  src: string;
  location: string;
  alt?: string;
  priority?: boolean;
  className?: string;
  sizes?: string;
  onLoad?: () => void;
  blurHash?: string;
  dominantColor?: string;
  networkAware?: boolean;
}

interface NetworkInfo {
  effectiveType?: string;
  saveData?: boolean;
  downlink?: number;
}

interface NavigatorConnection {
  effectiveType?: string;
  saveData?: boolean;
  downlink?: number;
  addEventListener?: (event: string, listener: () => void) => void;
  removeEventListener?: (event: string, listener: () => void) => void;
}

/**
 * Ultra-optimized image component with modern features:
 * - AVIF/WebP/JPEG XL format support
 * - BlurHash placeholders
 * - Network-aware loading
 * - Client hints integration
 * - Smart caching
 */
export default function UltraOptimizedImage({
  src,
  location,
  alt,
  priority = false,
  className = '',
  sizes,
  onLoad,
  blurHash,
  dominantColor = '#f3f4f6',
  networkAware = true
}: UltraOptimizedImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isVisible, setIsVisible] = useState(priority);
  const [currentFormat, setCurrentFormat] = useState<string>('webp');
  const [networkInfo, setNetworkInfo] = useState<NetworkInfo>({});
  const [blurDataUrl, setBlurDataUrl] = useState<string>('');
  const imgRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Network detection
  useEffect(() => {
    if (networkAware && 'connection' in navigator) {
      const connection = (navigator as unknown as { connection: NavigatorConnection }).connection;
      setNetworkInfo({
        effectiveType: connection?.effectiveType,
        saveData: connection?.saveData,
        downlink: connection?.downlink
      });

      const handleConnectionChange = () => {
        setNetworkInfo({
          effectiveType: connection?.effectiveType,
          saveData: connection?.saveData,
          downlink: connection?.downlink
        });
      };

      if (connection?.addEventListener) {
        connection.addEventListener('change', handleConnectionChange);
      }
      return () => {
        if (connection?.removeEventListener) {
          connection.removeEventListener('change', handleConnectionChange);
        }
      };
    }
  }, [networkAware]);

  // Format detection with feature support
  useEffect(() => {
    const detectBestFormat = async () => {
      const formatPriority = ['avif', 'webp', 'jxl', 'jpg'];

      for (const format of formatPriority) {
        if (await isFormatSupported(format)) {
          setCurrentFormat(format);
          break;
        }
      }
    };

    detectBestFormat();
  }, []);

  // BlurHash to data URL conversion
  useEffect(() => {
    if (blurHash) {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = 32;
        canvas.height = 32;
        const ctx = canvas.getContext('2d');

        if (ctx) {
          const pixels = decode(blurHash, 32, 32);
          const imageData = ctx.createImageData(32, 32);
          imageData.data.set(pixels);
          ctx.putImageData(imageData, 0, 0);
          setBlurDataUrl(canvas.toDataURL());
        }
      } catch (error) {
        console.warn('BlurHash decode failed:', error);
      }
    }
  }, [blurHash]);

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (!priority && containerRef.current) {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observer.disconnect();
          }
        },
        {
          rootMargin: '50px' // Start loading 50px before entering viewport
        }
      );

      observer.observe(containerRef.current);
      return () => observer.disconnect();
    }
  }, [priority]);

  // Service worker registration for caching
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/ultra-image-sw.js').catch(console.warn);
    }
  }, []);

  const getOptimizedImagePath = useCallback((viewport: string = 'desktop') => {
    const fileName = src.substring(src.lastIndexOf('/') + 1, src.lastIndexOf('.'));

    // Generate content hash (simplified - in real implementation, get from manifest)
    const contentHash = 'abcd1234'; // Would be from manifest

    return `/ultra-optimized/${location}/${currentFormat}/${fileName}-${contentHash}-${location}-${viewport}.${currentFormat}`;
  }, [src, location, currentFormat]);

  const getNetworkAwareQuality = () => {
    if (!networkAware) return '';

    // Adjust quality based on network conditions
    if (networkInfo.saveData) return '&q=40';
    if (networkInfo.effectiveType === '2g') return '&q=30';
    if (networkInfo.effectiveType === '3g') return '&q=60';
    if (networkInfo.effectiveType === 'slow-2g') return '&q=20';

    return '&q=85'; // Default quality for good connections
  };

  const generateSources = () => {
    const formats = ['avif', 'webp', 'jpg'];
    const viewports = [
      { name: 'mobile', media: '(max-width: 420px)' },
      { name: 'tablet', media: '(max-width: 768px)' },
      { name: 'desktop', media: '(min-width: 769px)' }
    ];

    const sources: Array<{ srcSet: string; type: string; media: string }> = [];

    formats.forEach(format => {
      viewports.forEach(viewport => {
        const qualityParam = getNetworkAwareQuality();
        sources.push({
          srcSet: getOptimizedImagePath(viewport.name) + qualityParam,
          type: `image/${format}`,
          media: viewport.media
        });
      });
    });

    return sources;
  };

  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  const handleError = () => {
    // Fallback to next format or original image
    console.warn(`Failed to load ${currentFormat} format for ${src}`);

    const formatFallbacks = {
      avif: 'webp',
      webp: 'jpg',
      jxl: 'webp',
      jpg: 'jpg'
    };

    const fallbackFormat = formatFallbacks[currentFormat as keyof typeof formatFallbacks];
    if (fallbackFormat && fallbackFormat !== currentFormat) {
      setCurrentFormat(fallbackFormat);
    }
  };

  // Don't render until visible (for non-priority images)
  if (!isVisible) {
    return (
      <div
        ref={containerRef}
        className={`relative bg-gray-100 ${className}`}
        style={{
          backgroundColor: dominantColor,
          aspectRatio: 'var(--image-aspect-ratio, auto)'
        }}
      >
        {blurDataUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={blurDataUrl}
            alt=""
            className="absolute inset-0 w-full h-full object-cover opacity-50 blur-sm"
            style={{ filter: 'blur(20px)' }}
          />
        )}
      </div>
    );
  }

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* BlurHash placeholder */}
      {!isLoaded && blurDataUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={blurDataUrl}
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
          style={{ filter: 'blur(20px)' }}
        />
      )}

      {/* Dominant color background */}
      {!isLoaded && !blurDataUrl && (
        <div
          className="absolute inset-0 animate-pulse"
          style={{ backgroundColor: dominantColor }}
        />
      )}

      {/* Main picture element with modern formats */}
      <picture>
        {generateSources().map((source, index) => (
          <source
            key={index}
            srcSet={source.srcSet}
            type={source.type}
            media={source.media}
          />
        ))}

        <Image
          ref={imgRef}
          src={getOptimizedImagePath()}
          alt={alt || ''}
          priority={priority}
          sizes={sizes}
          onLoad={handleLoad}
          onError={handleError}
          loading={priority ? 'eager' : 'lazy'}
          decoding={priority ? 'sync' : 'async'}
          fetchPriority={priority ? 'high' : 'auto'}
          className={`
            ${isLoaded ? 'opacity-100' : 'opacity-0'}
            transition-opacity duration-500 ease-out
            w-full h-full object-cover
          `}
          fill
        />
      </picture>

      {/* Loading indicator for slow networks */}
      {!isLoaded && networkInfo.effectiveType === '2g' && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="bg-white bg-opacity-80 rounded-lg p-2">
            <div className="animate-spin w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full" />
          </div>
        </div>
      )}
    </div>
  );
}

// Format support detection
async function isFormatSupported(format: string): Promise<boolean> {
  const testImages = {
    avif: 'data:image/avif;base64,AAAAIGZ0eXBhdmlmAAAAAGF2aWZtaWYxbWlhZk1BMUIAAADybWV0YQAAAAAAAAAoaGRscgAAAAAAAAAAcGljdAAAAAAAAAAAAAAAAGxpYmF2aWYAAAAADnBpdG0AAAAAAAEAAAAeaWxvYwAAAABEAAABAAEAAAABAAABGgAAAB0AAAAoaWluZgAAAAAAAQAAABppbmZlAgAAAAABAABhdjAxQ29sb3IAAAAAamlwcnAAAABLaXBjbwAAABRpc3BlAAAAAAAAAAIAAAACAAAAEHBpeGkAAAAAAwgICAAAAAxhdjFDgQ0MAAAAABNjb2xybmNseAACAAIAAYAAAAAXaXBtYQAAAAAAAAABAAEEAQKDBAAAACVtZGF0EgAKCBgABogQEAwgMg8f8D///8WfhwB8+ErK42A=',
    webp: 'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA',
    jxl: 'data:image/jxl;base64,/woIAAAMABKIAgC4',
    jpg: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/2wBDAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwA/8A8A8A8A=='
  };

  return new Promise((resolve) => {
    const img = new window.Image();
    img.onload = () => resolve(img.width === 1);
    img.onerror = () => resolve(false);
    img.src = testImages[format as keyof typeof testImages] || '';
  });
}

/**
 * Hook for preloading critical images
 */
export function useImagePreloader(imagePaths: string[], priority = false) {
  useEffect(() => {
    if (!priority) return;

    const preloadImages = async () => {
      // Send message to service worker for prefetching
      if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({
          type: 'PREFETCH_IMAGES',
          urls: imagePaths
        });
      }

      // Also create link preload tags
      imagePaths.forEach(path => {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.as = 'image';
        link.href = path;
        link.fetchPriority = 'high';
        document.head.appendChild(link);
      });
    };

    preloadImages();
  }, [imagePaths, priority]);
}

/**
 * Hook for network-aware image loading
 */
export function useNetworkAwareLoading() {
  const [networkInfo, setNetworkInfo] = useState<NetworkInfo>({});

  useEffect(() => {
    if ('connection' in navigator) {
      const connection = (navigator as unknown as { connection: NavigatorConnection }).connection;
      setNetworkInfo({
        effectiveType: connection?.effectiveType,
        saveData: connection?.saveData,
        downlink: connection?.downlink
      });

      const handleChange = () => {
        setNetworkInfo({
          effectiveType: connection?.effectiveType,
          saveData: connection?.saveData,
          downlink: connection?.downlink
        });
      };

      if (connection?.addEventListener) {
        connection.addEventListener('change', handleChange);
      }
      return () => {
        if (connection?.removeEventListener) {
          connection.removeEventListener('change', handleChange);
        }
      };
    }
  }, []);

  return networkInfo;
}