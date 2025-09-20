import imageManifest from '@/../../public/optimized/image-manifest.json';

interface ImageManifest {
  [key: string]: {
    [location: string]: {
      mobile?: {
        path: string;
        width: number;
        height: number;
        size: number;
        quality: number;
      };
      tablet?: {
        path: string;
        width: number;
        height: number;
        size: number;
        quality: number;
      };
      desktop: {
        path: string;
        width: number;
        height: number;
        size: number;
        quality: number;
      };
    };
  };
}

/**
 * Simple helper to get optimized image path
 * Attempts to find an optimized version, falls back to original
 */
export function getOptimizedImage(
  originalPath: string,
  location: string = 'service-card',
  viewport: 'mobile' | 'tablet' | 'desktop' = 'desktop'
): string {
  try {
    // Extract hash from path if it's a direct hash path
    const hashMatch = originalPath.match(/([a-f0-9]{40})\.(png|jpg|jpeg)/);
    if (!hashMatch) {
      // Not an image we can optimize, return original
      return originalPath;
    }

    const hash = hashMatch[1];
    const manifestKey = `public/assets/${hash}.png`;

    // Check if we have an optimized version
    const imageData = (imageManifest as ImageManifest)[manifestKey];
    if (!imageData || !imageData[location]) {
      // No optimized version, return original
      return originalPath;
    }

    // Get the appropriate viewport version
    const viewportData = imageData[location];
    const selectedData =
      (viewport === 'mobile' && viewportData.mobile) ||
      (viewport === 'tablet' && viewportData.tablet) ||
      viewportData.desktop;

    if (!selectedData) {
      return originalPath;
    }

    // Return the optimized path without 'public/' prefix
    return '/' + selectedData.path.replace('public/', '');
  } catch (error) {
    console.error('Error getting optimized image:', error);
    return originalPath;
  }
}

/**
 * Batch process multiple image paths
 */
export function getOptimizedImages(
  images: Record<string, string>,
  location: string = 'service-card'
): Record<string, string> {
  const optimized: Record<string, string> = {};

  for (const [key, path] of Object.entries(images)) {
    optimized[key] = getOptimizedImage(path, location);
  }

  return optimized;
}