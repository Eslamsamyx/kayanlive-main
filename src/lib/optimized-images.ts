import imageManifest from '@/../../public/optimized/image-manifest.json';

export interface OptimizedImage {
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
}

// Map original image paths to their hash-based filenames
// This maps both friendly names and direct hash paths
const imageHashMap: Record<string, string> = {
  // Friendly mappings
  '/assets/hero-main.png': '01f5d49d03c8455dc99b2ad32446b6657b1949e0',
  '/assets/hero-slide-1.png': '1402feda00b479d56347dca419118793a7b45676',
  '/assets/hero-slide-2.png': '29064c5a0d86395e45b642fe4e6daf670490f723',
  '/assets/service-1.png': '0599bc8efb3df6cbf4d2b5cc07e1932dc0d2a400',
  '/assets/service-2.png': '0a0c21416d9d9b2c97aedc8aa51e7c6619486a15',
  '/assets/about-hero.png': '174d9ed83a90c0514d54b7cbb68f8656ca74592c',
  '/assets/team-member.png': '123269087423c903b101b9352bd92acdab49d86a',
  '/assets/article-1.png': '0bb8e976afa37efb2547ff983a789a24c46bc909',
  '/assets/article-content.png': '273cea28658e9744d1cd2fbc64a5ba1ac7deeff8',
  '/assets/gallery-1.png': '5fe3ba66a055c9a5b01ea404941b7097da5ffdb0',
  '/assets/gallery-2.png': '6cdd4333a240b46dead9df86c5a83772e81b76fc',
  // Direct hash paths (identity mapping)
  '/assets/01f5d49d03c8455dc99b2ad32446b6657b1949e0.png': '01f5d49d03c8455dc99b2ad32446b6657b1949e0',
  '/assets/1402feda00b479d56347dca419118793a7b45676.png': '1402feda00b479d56347dca419118793a7b45676',
  '/assets/29064c5a0d86395e45b642fe4e6daf670490f723.png': '29064c5a0d86395e45b642fe4e6daf670490f723',
  '/assets/0599bc8efb3df6cbf4d2b5cc07e1932dc0d2a400.png': '0599bc8efb3df6cbf4d2b5cc07e1932dc0d2a400',
  '/assets/0a0c21416d9d9b2c97aedc8aa51e7c6619486a15.png': '0a0c21416d9d9b2c97aedc8aa51e7c6619486a15',
  '/assets/174d9ed83a90c0514d54b7cbb68f8656ca74592c.png': '174d9ed83a90c0514d54b7cbb68f8656ca74592c',
  '/assets/123269087423c903b101b9352bd92acdab49d86a.png': '123269087423c903b101b9352bd92acdab49d86a',
  '/assets/0bb8e976afa37efb2547ff983a789a24c46bc909.png': '0bb8e976afa37efb2547ff983a789a24c46bc909',
  '/assets/273cea28658e9744d1cd2fbc64a5ba1ac7deeff8.png': '273cea28658e9744d1cd2fbc64a5ba1ac7deeff8',
  '/assets/5fe3ba66a055c9a5b01ea404941b7097da5ffdb0.png': '5fe3ba66a055c9a5b01ea404941b7097da5ffdb0',
  '/assets/6cdd4333a240b46dead9df86c5a83772e81b76fc.png': '6cdd4333a240b46dead9df86c5a83772e81b76fc',
};

/**
 * Get optimized image paths for a specific location
 * @param originalPath - Original image path (e.g., '/assets/hero-main.png')
 * @param location - Image location ID (e.g., 'hero-main', 'hero-slide')
 * @returns Optimized image paths for different viewports
 */
export function getOptimizedImage(
  originalPath: string,
  location: string
): OptimizedImage | null {
  // Get the hash from the original path
  const hash = imageHashMap[originalPath];
  if (!hash) {
    console.warn(`No optimized version found for: ${originalPath}`);
    return null;
  }

  // Construct the full key used in the manifest
  const manifestKey = `public/assets/${hash}.png`;

  // Get the optimized versions from the manifest
  const imageData = (imageManifest as Record<string, Record<string, OptimizedImage>>)[manifestKey];
  if (!imageData || !imageData[location]) {
    console.warn(`No optimized version found for location: ${location}`);
    return null;
  }

  return imageData[location];
}

/**
 * Get the best optimized image URL for current viewport
 * @param originalPath - Original image path
 * @param location - Image location ID
 * @param viewport - Specific viewport to use (optional, defaults to auto-detect)
 * @returns Optimized image URL
 */
export function getOptimizedImageUrl(
  originalPath: string,
  location: string,
  viewport?: 'mobile' | 'tablet' | 'desktop'
): string {
  const optimized = getOptimizedImage(originalPath, location);

  if (!optimized) {
    // Fallback to original if no optimized version exists
    return originalPath;
  }

  // Determine viewport if not specified
  let targetViewport = viewport;
  if (!targetViewport) {
    if (typeof window !== 'undefined') {
      const width = window.innerWidth;
      if (width < 768) targetViewport = 'mobile';
      else if (width < 1024) targetViewport = 'tablet';
      else targetViewport = 'desktop';
    } else {
      targetViewport = 'desktop'; // SSR default
    }
  }

  // Get the appropriate image data
  const imageData =
    (targetViewport === 'mobile' && optimized.mobile) ||
    (targetViewport === 'tablet' && optimized.tablet) ||
    optimized.desktop;

  // Return the path without the 'public' prefix for Next.js
  return '/' + imageData.path.replace('public/', '');
}

/**
 * Get srcSet for responsive images
 * @param originalPath - Original image path
 * @param location - Image location ID
 * @returns srcSet string for responsive images
 */
export function getOptimizedSrcSet(
  originalPath: string,
  location: string
): string {
  const optimized = getOptimizedImage(originalPath, location);

  if (!optimized) {
    return originalPath;
  }

  const srcSet: string[] = [];

  if (optimized.mobile) {
    const mobilePath = '/' + optimized.mobile.path.replace('public/', '');
    srcSet.push(`${mobilePath} ${optimized.mobile.width}w`);
  }

  if (optimized.tablet) {
    const tabletPath = '/' + optimized.tablet.path.replace('public/', '');
    srcSet.push(`${tabletPath} ${optimized.tablet.width}w`);
  }

  if (optimized.desktop) {
    const desktopPath = '/' + optimized.desktop.path.replace('public/', '');
    srcSet.push(`${desktopPath} ${optimized.desktop.width}w`);
  }

  return srcSet.join(', ');
}

/**
 * Get sizes attribute for responsive images
 * @param location - Image location ID
 * @returns sizes string for responsive images
 */
export function getOptimizedSizes(location: string): string {
  // Define sizes based on common location patterns
  const sizesMap: Record<string, string> = {
    'hero-main': '(max-width: 640px) 100vw, (max-width: 768px) 100vw, 100vw',
    'hero-slide': '(max-width: 640px) 100vw, (max-width: 768px) 100vw, 100vw',
    'service-card': '(max-width: 640px) 90vw, (max-width: 768px) 45vw, 400px',
    'service-detail': '(max-width: 640px) 100vw, (max-width: 768px) 100vw, 1200px',
    'about-hero': '(max-width: 640px) 100vw, 50vw',
    'about-team': '(max-width: 640px) 150px, 300px',
    'article-thumbnail': '(max-width: 640px) 90vw, 400px',
    'article-featured': '(max-width: 640px) 100vw, (max-width: 768px) 100vw, 1200px',
    'article-content': '(max-width: 640px) 90vw, 800px',
    'gallery-thumbnail': '(max-width: 640px) 45vw, (max-width: 768px) 30vw, 400px',
    'og-image': '1200px',
  };

  return sizesMap[location] || '100vw';
}