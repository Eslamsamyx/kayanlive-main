/**
 * Image Performance Monitoring Hook
 * Tracks Core Web Vitals and image-specific metrics
 */

import { useEffect, useState } from 'react';

interface ImageMetrics {
  loadTime: number;
  renderTime: number;
  decodingTime: number;
  size: number;
  format: string;
  networkSpeed: string;
  cacheHit: boolean;
  viewportMatch: boolean;
}

interface CoreWebVitals {
  lcp: number | null;
  fcp: number | null;
  cls: number | null;
  ttfb: number | null;
  inp: number | null;
}

interface LCPEntry extends PerformanceEntry {
  renderTime?: number;
  loadTime?: number;
}

interface CLSEntry extends PerformanceEntry {
  hadRecentInput?: boolean;
  value: number;
}

interface PaintEntry extends PerformanceEntry {
  name: string;
  startTime: number;
}

interface INPEntry extends PerformanceEntry {
  duration: number;
}

interface NavigatorConnection {
  effectiveType?: string;
}

export function useImagePerformance(imageUrl?: string) {
  const [metrics, setMetrics] = useState<ImageMetrics | null>(null);
  const [vitals, setVitals] = useState<CoreWebVitals>({
    lcp: null,
    fcp: null,
    cls: null,
    ttfb: null,
    inp: null,
  });

  useEffect(() => {
    if (!('PerformanceObserver' in window)) return;

    // Observe Largest Contentful Paint
    const lcpObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1] as LCPEntry;
      setVitals(prev => ({ ...prev, lcp: lastEntry.renderTime || lastEntry.loadTime || null }));
    });

    // Observe First Contentful Paint
    const fcpObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry: PaintEntry) => {
        if (entry.name === 'first-contentful-paint') {
          setVitals(prev => ({ ...prev, fcp: entry.startTime }));
        }
      });
    });

    // Observe Cumulative Layout Shift
    const clsObserver = new PerformanceObserver((list) => {
      let clsScore = 0;
      list.getEntries().forEach((entry) => {
        const clsEntry = entry as CLSEntry;
        if (!clsEntry.hadRecentInput) {
          clsScore += clsEntry.value;
        }
      });
      setVitals(prev => ({ ...prev, cls: clsScore }));
    });

    // Observe Interaction to Next Paint
    const inpObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry: INPEntry) => {
        setVitals(prev => ({ ...prev, inp: entry.duration }));
      });
    });

    try {
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
      fcpObserver.observe({ entryTypes: ['paint'] });
      clsObserver.observe({ entryTypes: ['layout-shift'] });
      inpObserver.observe({ entryTypes: ['event'] });
    } catch (e) {
      console.error('Failed to observe performance metrics:', e);
    }

    return () => {
      lcpObserver.disconnect();
      fcpObserver.disconnect();
      clsObserver.disconnect();
      inpObserver.disconnect();
    };
  }, []);

  // Track specific image performance
  useEffect(() => {
    if (!imageUrl) return;

    const startTime = performance.now();

    const img = new Image();
    img.onload = () => {
      const loadTime = performance.now() - startTime;

      // Get resource timing data
      const resourceTimings = performance.getEntriesByName(imageUrl);
      const timing = resourceTimings[resourceTimings.length - 1] as PerformanceResourceTiming;

      setMetrics({
        loadTime,
        renderTime: timing?.responseEnd - timing?.startTime || 0,
        decodingTime: timing?.decodedBodySize || 0,
        size: timing?.encodedBodySize || 0,
        format: detectImageFormat(imageUrl),
        networkSpeed: getNetworkSpeed(),
        cacheHit: timing?.transferSize === 0,
        viewportMatch: checkViewportMatch(img.width),
      });
    };

    img.src = imageUrl;
  }, [imageUrl]);

  return { metrics, vitals };
}

// Detect image format from URL
function detectImageFormat(url: string): string {
  const extension = url.split('.').pop()?.toLowerCase();
  return extension || 'unknown';
}

// Get current network speed
function getNetworkSpeed(): string {
  if ('connection' in navigator) {
    return ((navigator as unknown as { connection: NavigatorConnection }).connection?.effectiveType) || 'unknown';
  }
  return 'unknown';
}

// Check if image size matches viewport
function checkViewportMatch(imageWidth: number): boolean {
  const viewportWidth = window.innerWidth * window.devicePixelRatio;
  const tolerance = 0.2; // 20% tolerance
  return Math.abs(imageWidth - viewportWidth) / viewportWidth < tolerance;
}

/**
 * Hook to report performance metrics to analytics
 */
export function usePerformanceReporter() {
  const [isReporting, setIsReporting] = useState(false);

  const reportMetrics = async (metrics: ImageMetrics | CoreWebVitals) => {
    setIsReporting(true);

    try {
      // Report to your analytics endpoint
      await fetch('/api/metrics/images', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...metrics,
          timestamp: Date.now(),
          userAgent: navigator.userAgent,
          url: window.location.href,
        }),
      });
    } catch (error) {
      console.error('Failed to report metrics:', error);
    } finally {
      setIsReporting(false);
    }
  };

  return { reportMetrics, isReporting };
}

/**
 * Get real-time performance score
 */
export function getPerformanceScore(vitals: CoreWebVitals): number {
  let score = 100;

  // LCP scoring (should be < 2.5s for good)
  if (vitals.lcp) {
    if (vitals.lcp > 4000) score -= 30;
    else if (vitals.lcp > 2500) score -= 15;
  }

  // FCP scoring (should be < 1.8s for good)
  if (vitals.fcp) {
    if (vitals.fcp > 3000) score -= 20;
    else if (vitals.fcp > 1800) score -= 10;
  }

  // CLS scoring (should be < 0.1 for good)
  if (vitals.cls) {
    if (vitals.cls > 0.25) score -= 25;
    else if (vitals.cls > 0.1) score -= 12;
  }

  // INP scoring (should be < 200ms for good)
  if (vitals.inp) {
    if (vitals.inp > 500) score -= 25;
    else if (vitals.inp > 200) score -= 12;
  }

  return Math.max(0, score);
}