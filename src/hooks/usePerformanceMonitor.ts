'use client';

import { useEffect, useState, useRef, useCallback } from 'react';

interface PerformanceMetrics {
  // Core Web Vitals
  lcp?: number;
  fid?: number;
  cls?: number;
  fcp?: number;
  ttfb?: number;
  inp?: number;

  // Image-specific metrics
  imageLoadTime?: number;
  imagesLoaded: number;
  imagesFailed: number;
  totalImageSize: number;
  averageImageSize: number;

  // Network information
  connectionType?: string;
  downlink?: number;
  saveData?: boolean;

  // Cache performance
  cacheHits: number;
  cacheMisses: number;
  cacheEfficiency: number;
}

interface UsePerformanceMonitorOptions {
  trackImages?: boolean;
  trackCoreWebVitals?: boolean;
  trackNetwork?: boolean;
  trackCache?: boolean;
  reportInterval?: number;
}

interface NavigatorConnection {
  effectiveType?: string;
  saveData?: boolean;
  downlink?: number;
  addEventListener?: (event: string, listener: () => void) => void;
  removeEventListener?: (event: string, listener: () => void) => void;
}

interface LCPEntry extends PerformanceEntry {
  startTime: number;
}

interface FIDEntry extends PerformanceEntry {
  processingStart: number;
  startTime: number;
}

interface INPEntry extends PerformanceEntry {
  processingEnd: number;
  startTime: number;
}

interface CLSEntry extends PerformanceEntry {
  hadRecentInput?: boolean;
  value: number;
}

/**
 * Advanced performance monitoring hook for ultra-optimized images
 * Tracks Core Web Vitals, image performance, and cache efficiency
 */
export function usePerformanceMonitor(options: UsePerformanceMonitorOptions = {}) {
  const {
    trackImages = true,
    trackCoreWebVitals = true,
    trackNetwork = true,
    trackCache = true,
    reportInterval = 30000 // 30 seconds
  } = options;

  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    imagesLoaded: 0,
    imagesFailed: 0,
    totalImageSize: 0,
    averageImageSize: 0,
    cacheHits: 0,
    cacheMisses: 0,
    cacheEfficiency: 0
  });

  const reportIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize performance monitoring
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const cleanup: (() => void)[] = [];

    // Core Web Vitals monitoring
    if (trackCoreWebVitals) {
      cleanup.push(initCoreWebVitalsTracking());
    }

    // Image performance monitoring
    if (trackImages) {
      cleanup.push(initImageTracking());
    }

    // Network monitoring
    if (trackNetwork) {
      cleanup.push(initNetworkTracking());
    }

    // Cache monitoring
    if (trackCache) {
      cleanup.push(initCacheTracking());
    }

    // Periodic reporting
    if (reportInterval > 0) {
      reportIntervalRef.current = setInterval(() => {
        reportMetrics();
      }, reportInterval);
    }

    return () => {
      cleanup.forEach(fn => fn());
      if (reportIntervalRef.current) {
        clearInterval(reportIntervalRef.current);
      }
    };
  }, [trackImages, trackCoreWebVitals, trackNetwork, trackCache, reportInterval, initCoreWebVitalsTracking, initImageTracking, initNetworkTracking, initCacheTracking, reportMetrics]);

  // Initialize Core Web Vitals tracking
  const initCoreWebVitalsTracking = useCallback(() => {
    try {
      // LCP (Largest Contentful Paint)
      const lcpObserver = new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        const lastEntry = entries[entries.length - 1] as LCPEntry;
        setMetrics(prev => ({ ...prev, lcp: lastEntry.startTime }));
      });
      lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });

      // FID (First Input Delay) - deprecated, replaced by INP
      const fidObserver = new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        const firstEntry = entries[0] as FIDEntry;
        setMetrics(prev => ({ ...prev, fid: firstEntry.processingStart - firstEntry.startTime }));
      });
      fidObserver.observe({ type: 'first-input', buffered: true });

      // INP (Interaction to Next Paint)
      if ('PerformanceEventTiming' in window) {
        const inpObserver = new PerformanceObserver((entryList) => {
          const entries = entryList.getEntries();
          const maxINP = Math.max(...entries.map((entry) => {
            const inpEntry = entry as INPEntry;
            return inpEntry.processingEnd - inpEntry.startTime;
          }));
          setMetrics(prev => ({ ...prev, inp: maxINP }));
        });
        inpObserver.observe({ type: 'event', buffered: true });
      }

      // CLS (Cumulative Layout Shift)
      let clsValue = 0;
      const clsObserver = new PerformanceObserver((entryList) => {
        for (const entry of entryList.getEntries()) {
          const clsEntry = entry as CLSEntry;
          if (!clsEntry.hadRecentInput) {
            clsValue += clsEntry.value;
          }
        }
        setMetrics(prev => ({ ...prev, cls: clsValue }));
      });
      clsObserver.observe({ type: 'layout-shift', buffered: true });

      // FCP (First Contentful Paint)
      const fcpObserver = new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        const fcpEntry = entries.find(entry => entry.name === 'first-contentful-paint');
        if (fcpEntry) {
          setMetrics(prev => ({ ...prev, fcp: fcpEntry.startTime }));
        }
      });
      fcpObserver.observe({ type: 'paint', buffered: true });

      // TTFB (Time to First Byte)
      const navigationEntries = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[];
      if (navigationEntries.length > 0) {
        const navEntry = navigationEntries[0];
        setMetrics(prev => ({ ...prev, ttfb: navEntry.responseStart - navEntry.requestStart }));
      }

      return () => {
        lcpObserver.disconnect();
        fidObserver.disconnect();
        clsObserver.disconnect();
        fcpObserver.disconnect();
      };
    } catch (error) {
      console.warn('Core Web Vitals tracking failed:', error);
      return () => {};
    }
  }, []);

  // Initialize image performance tracking
  const initImageTracking = useCallback(() => {

    // Resource timing observer for images
    const resourceObserver = new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();

      entries.forEach(entry => {
        const resourceEntry = entry as PerformanceResourceTiming;
        if (resourceEntry.initiatorType === 'img' || entry.name.includes('/api/ultra-image')) {
          const loadTime = resourceEntry.responseEnd - resourceEntry.startTime;
          const size = resourceEntry.transferSize || 0;

          setMetrics(prev => {
            const newImagesLoaded = prev.imagesLoaded + 1;
            const newTotalSize = prev.totalImageSize + size;
            return {
              ...prev,
              imagesLoaded: newImagesLoaded,
              totalImageSize: newTotalSize,
              averageImageSize: newTotalSize / newImagesLoaded,
              imageLoadTime: loadTime
            };
          });
        }
      });
    });

    resourceObserver.observe({ type: 'resource', buffered: true });

    // Image load error tracking
    const handleImageError = (_event: Event) => {
      setMetrics(prev => ({ ...prev, imagesFailed: prev.imagesFailed + 1 }));
    };

    // Add global image error listener
    document.addEventListener('error', handleImageError, true);

    return () => {
      resourceObserver.disconnect();
      document.removeEventListener('error', handleImageError, true);
    };
  }, []);

  // Initialize network monitoring
  const initNetworkTracking = useCallback(() => {
    if ('connection' in navigator) {
      const connection = (navigator as unknown as { connection: NavigatorConnection }).connection;

      const updateNetworkInfo = () => {
        setMetrics(prev => ({
          ...prev,
          connectionType: connection.effectiveType,
          downlink: connection.downlink,
          saveData: connection.saveData
        }));
      };

      updateNetworkInfo();
      if (connection.addEventListener) {
        connection.addEventListener('change', updateNetworkInfo);
      }

      return () => {
        if (connection.removeEventListener) {
          connection.removeEventListener('change', updateNetworkInfo);
        }
      };
    }

    return () => {};
  }, []);

  // Initialize cache tracking
  const initCacheTracking = useCallback(() => {
    // Monitor service worker messages for cache stats
    if ('serviceWorker' in navigator) {
      const handleMessage = (event: MessageEvent) => {
        if (event.data?.type === 'CACHE_STATS') {
          const stats = event.data.data;
          setMetrics(prev => ({
            ...prev,
            cacheHits: stats.hits || 0,
            cacheMisses: stats.misses || 0,
            cacheEfficiency: stats.efficiency || 0
          }));
        }
      };

      navigator.serviceWorker.addEventListener('message', handleMessage);

      // Request initial cache stats
      if (navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({ type: 'GET_CACHE_STATS' });
      }

      return () => {
        navigator.serviceWorker.removeEventListener('message', handleMessage);
      };
    }

    return () => {};
  }, []);

  // Report metrics to analytics or monitoring service
  const reportMetrics = useCallback(() => {
    if (typeof window === 'undefined') return;

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.table({
        'LCP (ms)': metrics.lcp?.toFixed(2),
        'FID (ms)': metrics.fid?.toFixed(2),
        'CLS': metrics.cls?.toFixed(4),
        'FCP (ms)': metrics.fcp?.toFixed(2),
        'TTFB (ms)': metrics.ttfb?.toFixed(2),
        'INP (ms)': metrics.inp?.toFixed(2),
        'Images Loaded': metrics.imagesLoaded,
        'Images Failed': metrics.imagesFailed,
        'Avg Image Size (KB)': (metrics.averageImageSize / 1024).toFixed(2),
        'Cache Efficiency (%)': metrics.cacheEfficiency.toFixed(2),
        'Connection': metrics.connectionType,
        'Save Data': metrics.saveData ? 'ON' : 'OFF'
      });
    }

    // Send to analytics (implement your analytics service here)
    // Example: analytics.track('image_performance', metrics);
  }, [metrics]);

  // Get performance score based on Core Web Vitals
  const getPerformanceScore = useCallback((): number => {
    let score = 100;

    // LCP scoring (good: <2.5s, needs improvement: 2.5-4s, poor: >4s)
    if (metrics.lcp) {
      if (metrics.lcp > 4000) score -= 30;
      else if (metrics.lcp > 2500) score -= 15;
    }

    // FID scoring (good: <100ms, needs improvement: 100-300ms, poor: >300ms)
    if (metrics.fid) {
      if (metrics.fid > 300) score -= 25;
      else if (metrics.fid > 100) score -= 10;
    }

    // CLS scoring (good: <0.1, needs improvement: 0.1-0.25, poor: >0.25)
    if (metrics.cls) {
      if (metrics.cls > 0.25) score -= 25;
      else if (metrics.cls > 0.1) score -= 10;
    }

    // INP scoring (good: <200ms, needs improvement: 200-500ms, poor: >500ms)
    if (metrics.inp) {
      if (metrics.inp > 500) score -= 20;
      else if (metrics.inp > 200) score -= 10;
    }

    return Math.max(0, score);
  }, [metrics]);

  // Get image performance insights
  const getImageInsights = useCallback(() => {
    const insights: string[] = [];

    if (metrics.imagesFailed > 0) {
      insights.push(`${metrics.imagesFailed} images failed to load`);
    }

    if (metrics.averageImageSize > 500 * 1024) { // > 500KB
      insights.push('Average image size is large - consider further optimization');
    }

    if (metrics.cacheEfficiency < 80) {
      insights.push('Cache efficiency is low - images may not be caching properly');
    }

    if (metrics.connectionType === '2g' || metrics.connectionType === 'slow-2g') {
      insights.push('Slow network detected - adaptive quality is crucial');
    }

    if (metrics.saveData) {
      insights.push('Data saver mode detected - serving compressed images');
    }

    return insights;
  }, [metrics]);

  return {
    metrics,
    performanceScore: getPerformanceScore(),
    imageInsights: getImageInsights(),
    reportMetrics
  };
}

/**
 * Hook for monitoring specific image loading performance
 */
export function useImageLoadMonitor(_imageUrl: string) {
  const [loadTime, setLoadTime] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const startTimeRef = useRef<number | null>(null);

  const startMonitoring = useCallback(() => {
    setIsLoading(true);
    setHasError(false);
    startTimeRef.current = performance.now();
  }, []);

  const stopMonitoring = useCallback((success: boolean = true) => {
    if (startTimeRef.current) {
      const endTime = performance.now();
      setLoadTime(endTime - startTimeRef.current);
    }
    setIsLoading(false);
    setHasError(!success);
  }, []);

  return {
    loadTime,
    isLoading,
    hasError,
    startMonitoring,
    stopMonitoring
  };
}

/**
 * Hook for Core Web Vitals optimization recommendations
 */
export function useWebVitalsOptimization() {
  const { metrics, performanceScore } = usePerformanceMonitor();

  const getOptimizationRecommendations = useCallback(() => {
    const recommendations: string[] = [];

    if (metrics.lcp && metrics.lcp > 2500) {
      recommendations.push('Optimize LCP: Preload critical images, use fetchpriority="high"');
    }

    if (metrics.cls && metrics.cls > 0.1) {
      recommendations.push('Reduce CLS: Set explicit image dimensions, use aspect-ratio CSS');
    }

    if (metrics.fcp && metrics.fcp > 1800) {
      recommendations.push('Improve FCP: Inline critical CSS, preload key resources');
    }

    if (metrics.inp && metrics.inp > 200) {
      recommendations.push('Optimize INP: Reduce JavaScript execution time, debounce interactions');
    }

    if (metrics.ttfb && metrics.ttfb > 800) {
      recommendations.push('Improve TTFB: Optimize server response time, use CDN');
    }

    return recommendations;
  }, [metrics]);

  return {
    performanceScore,
    recommendations: getOptimizationRecommendations(),
    isGood: performanceScore >= 90,
    needsImprovement: performanceScore >= 70 && performanceScore < 90,
    isPoor: performanceScore < 70
  };
}

export default usePerformanceMonitor;