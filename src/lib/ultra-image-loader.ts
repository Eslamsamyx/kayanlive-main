/**
 * Ultra-optimized image loader with client hints and network awareness
 * Implements 2024 best practices for adaptive image serving
 */

interface LoaderParams {
  src: string;
  width: number;
  quality?: number;
}

interface ClientHints {
  dpr?: number;
  width?: number;
  saveData?: boolean;
  effectiveType?: string;
}

interface NavigatorConnection {
  saveData?: boolean;
  effectiveType?: string;
}

/**
 * Custom image loader that leverages client hints and network conditions
 * for optimal image serving
 */
export default function ultraImageLoader({ src, width, quality = 85 }: LoaderParams): string {
  // Extract client hints from the environment or headers
  const hints = getClientHints();

  // Determine optimal format based on browser support and network
  const format = getOptimalFormat(hints);

  // Calculate network-aware quality
  const adaptiveQuality = getNetworkAwareQuality(quality, hints);

  // Build the optimized image URL
  const params = new URLSearchParams({
    url: src,
    w: width.toString(),
    q: adaptiveQuality.toString(),
    f: format,
    ...(hints.dpr && { dpr: hints.dpr.toString() }),
    ...(hints.saveData && { 'save-data': '1' }),
  });

  // Return the ultra-optimized URL
  return `/api/ultra-image?${params.toString()}`;
}

/**
 * Extract client hints from various sources
 */
function getClientHints(): ClientHints {
  const hints: ClientHints = {};

  // Server-side: extract from headers (if available)
  if (typeof window === 'undefined') {
    // This would be populated by middleware
    return hints;
  }

  // Client-side: extract from browser APIs
  if (typeof window !== 'undefined') {
    // Device pixel ratio
    hints.dpr = window.devicePixelRatio || 1;

    // Viewport width
    hints.width = window.innerWidth;

    // Network information
    if ('connection' in navigator) {
      const connection = (navigator as unknown as { connection: NavigatorConnection }).connection;
      hints.saveData = connection?.saveData || false;
      hints.effectiveType = connection?.effectiveType;
    }
  }

  return hints;
}

/**
 * Determine optimal image format based on browser support and network conditions
 */
function getOptimalFormat(hints: ClientHints): string {
  // On slow networks or data saver mode, prefer smaller formats
  if (hints.saveData || hints.effectiveType === '2g' || hints.effectiveType === 'slow-2g') {
    return 'webp'; // Good compression, wide support
  }

  // Feature detection for modern formats
  if (typeof window !== 'undefined') {
    // Check for AVIF support
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (ctx) {
      canvas.width = 1;
      canvas.height = 1;
      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, 1, 1);

      // Try to convert to AVIF
      try {
        const avifData = canvas.toDataURL('image/avif');
        if (avifData.startsWith('data:image/avif')) {
          return 'avif';
        }
      } catch {
        // AVIF not supported
      }

      // Try WebP
      try {
        const webpData = canvas.toDataURL('image/webp');
        if (webpData.startsWith('data:image/webp')) {
          return 'webp';
        }
      } catch {
        // WebP not supported
      }
    }
  }

  // Fallback to JPEG
  return 'jpg';
}

/**
 * Calculate network-aware quality settings
 */
function getNetworkAwareQuality(baseQuality: number, hints: ClientHints): number {
  let quality = baseQuality;

  // Adjust for data saver mode
  if (hints.saveData) {
    quality = Math.min(quality, 50);
  }

  // Adjust for network speed
  switch (hints.effectiveType) {
    case 'slow-2g':
      quality = Math.min(quality, 30);
      break;
    case '2g':
      quality = Math.min(quality, 40);
      break;
    case '3g':
      quality = Math.min(quality, 70);
      break;
    case '4g':
      // Use original quality
      break;
    default:
      // Unknown network, be conservative
      quality = Math.min(quality, 80);
  }

  // Ensure quality is within valid range
  return Math.max(10, Math.min(100, quality));
}

/**
 * Generate srcset for responsive images with client hints
 */
export function generateUltraSrcSet(
  src: string,
  sizes: number[],
  quality?: number
): string {
  const hints = getClientHints();
  const format = getOptimalFormat(hints);

  return sizes
    .map(size => {
      const adaptiveQuality = getNetworkAwareQuality(quality || 85, hints);
      const params = new URLSearchParams({
        url: src,
        w: size.toString(),
        q: adaptiveQuality.toString(),
        f: format,
        ...(hints.dpr && { dpr: hints.dpr.toString() }),
        ...(hints.saveData && { 'save-data': '1' }),
      });

      return `/api/ultra-image?${params.toString()} ${size}w`;
    })
    .join(', ');
}

/**
 * Generate sizes attribute based on client hints and breakpoints
 */
export function generateUltraSizes(breakpoints?: { [key: string]: string }): string {
  const defaultBreakpoints = {
    mobile: '(max-width: 420px) 100vw',
    tablet: '(max-width: 768px) 50vw',
    desktop: '33vw'
  };

  const finalBreakpoints = { ...defaultBreakpoints, ...breakpoints };

  return Object.values(finalBreakpoints).join(', ');
}

/**
 * Preload critical images with optimal format and quality
 */
export function preloadUltraImage(
  src: string,
  width: number,
  quality?: number,
  priority: 'high' | 'low' = 'high'
): void {
  if (typeof window === 'undefined') return;

  const link = document.createElement('link');
  link.rel = 'preload';
  link.as = 'image';
  link.href = ultraImageLoader({ src, width, quality });
  link.setAttribute('fetchpriority', priority);

  // Add client hint headers if supported
  const hints = getClientHints();
  if (hints.dpr) {
    link.setAttribute('imagesrcset', ultraImageLoader({ src, width: width * hints.dpr, quality }));
  }

  document.head.appendChild(link);
}

/**
 * Ultra image loader for background images with CSS optimization
 */
export function ultraBackgroundImage(
  src: string,
  width: number,
  quality?: number
): string {
  const url = ultraImageLoader({ src, width, quality });
  return `url('${url}')`;
}

/**
 * Generate image-set for CSS with multiple formats
 */
export function generateImageSet(
  src: string,
  width: number,
  quality?: number
): string {
  const hints = getClientHints();
  const formats = ['avif', 'webp', 'jpg'];

  const imageSet = formats
    .map(format => {
      const params = new URLSearchParams({
        url: src,
        w: width.toString(),
        q: getNetworkAwareQuality(quality || 85, hints).toString(),
        f: format,
      });

      return `url('/api/ultra-image?${params.toString()}') type('image/${format}')`;
    })
    .join(', ');

  return `image-set(${imageSet})`;
}