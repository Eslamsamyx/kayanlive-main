/**
 * Enhanced Image Configuration with 2024 Best Practices
 * Adds modern format support, client hints, and performance optimization
 */

export interface EnhancedImageLocation extends ImageLocation {
  // Core Web Vitals optimization
  lcpCandidate?: boolean; // If this image could be LCP
  clsPreventionStrategy?: 'aspect-ratio' | 'fixed-dimensions' | 'placeholder';

  // Modern format preferences
  preferredFormats?: ('avif' | 'webp' | 'jxl' | 'jpg')[];

  // Network optimization
  adaptiveQuality?: {
    slow2g: number;
    '2g': number;
    '3g': number;
    '4g': number;
  };

  // Client hints
  clientHints?: {
    dpr?: boolean; // Device pixel ratio
    width?: boolean; // Viewport width
    saveData?: boolean; // Data saver mode
  };

  // Placeholder strategy
  placeholderStrategy?: 'blurhash' | 'dominant-color' | 'lqip' | 'sqip';

  // Preloading strategy
  preloadStrategy?: 'eager' | 'intersection' | 'hover' | 'route-based';

  // Content-aware optimization
  contentType?: 'photo' | 'graphic' | 'text' | 'mixed';
  compressionStrategy?: 'size-first' | 'quality-first' | 'balanced';

  // Accessibility
  accessibility?: {
    describedBy?: string;
    longDesc?: string;
    role?: string;
  };
}

// Re-export base interfaces
export interface ImageLocation {
  id: string;
  description: string;
  dimensions: {
    mobile: { width: number; height: number };
    tablet?: { width: number; height: number };
    desktop: { width: number; height: number };
  };
  quality?: number;
  priority?: boolean;
  aspectRatio?: string;
}

export interface ImageMapping {
  sourcePath: string;
  locations: string[];
  metadata?: {
    photographer?: string;
    copyright?: string;
    keywords?: string[];
    alternativeText?: { [locale: string]: string };
  };
}

// Enhanced location definitions with modern optimization features
export const ENHANCED_IMAGE_LOCATIONS: Record<string, EnhancedImageLocation> = {
  // Hero/Banner Images - LCP candidates
  'hero-main': {
    id: 'hero-main',
    description: 'Main hero banner on homepage',
    dimensions: {
      mobile: { width: 420, height: 280 },
      tablet: { width: 768, height: 432 },
      desktop: { width: 1920, height: 1080 },
    },
    quality: 90,
    priority: true,
    aspectRatio: '16:9',

    // Enhanced features
    lcpCandidate: true,
    clsPreventionStrategy: 'aspect-ratio',
    preferredFormats: ['avif', 'webp', 'jpg'],
    adaptiveQuality: {
      slow2g: 30,
      '2g': 40,
      '3g': 70,
      '4g': 90
    },
    clientHints: {
      dpr: true,
      width: true,
      saveData: true
    },
    placeholderStrategy: 'blurhash',
    preloadStrategy: 'eager',
    contentType: 'photo',
    compressionStrategy: 'balanced'
  },

  'hero-slide': {
    id: 'hero-slide',
    description: 'Hero slider images',
    dimensions: {
      mobile: { width: 420, height: 320 },
      tablet: { width: 768, height: 512 },
      desktop: { width: 1440, height: 960 },
    },
    quality: 85,
    priority: true,
    aspectRatio: '3:2',

    lcpCandidate: true,
    preferredFormats: ['avif', 'webp', 'jpg'],
    placeholderStrategy: 'blurhash',
    preloadStrategy: 'intersection',
    contentType: 'photo',
    compressionStrategy: 'size-first'
  },

  // About Section Images
  'about-hero': {
    id: 'about-hero',
    description: 'About page hero image',
    dimensions: {
      mobile: { width: 420, height: 420 },
      desktop: { width: 1200, height: 600 },
    },
    quality: 85,
    aspectRatio: '2:1',

    lcpCandidate: true,
    preferredFormats: ['avif', 'webp', 'jpg'],
    placeholderStrategy: 'dominant-color',
    contentType: 'photo'
  },

  'about-team': {
    id: 'about-team',
    description: 'Team member photos',
    dimensions: {
      mobile: { width: 150, height: 150 },
      desktop: { width: 300, height: 300 },
    },
    quality: 90,
    aspectRatio: '1:1',

    preferredFormats: ['avif', 'webp', 'jpg'],
    placeholderStrategy: 'blurhash',
    preloadStrategy: 'intersection',
    contentType: 'photo',
    compressionStrategy: 'quality-first', // Faces need good quality
    accessibility: {
      role: 'img'
    }
  },

  // Service Images
  'service-card': {
    id: 'service-card',
    description: 'Service card thumbnails',
    dimensions: {
      mobile: { width: 320, height: 200 },
      desktop: { width: 400, height: 250 },
    },
    quality: 85,
    aspectRatio: '8:5',

    preferredFormats: ['avif', 'webp', 'jpg'],
    placeholderStrategy: 'dominant-color',
    preloadStrategy: 'intersection',
    contentType: 'mixed'
  },

  // Industry Section - Graphics and icons
  'industry-icon': {
    id: 'industry-icon',
    description: 'Industry category icons',
    dimensions: {
      mobile: { width: 64, height: 64 },
      desktop: { width: 128, height: 128 },
    },
    quality: 100,
    aspectRatio: '1:1',

    preferredFormats: ['avif', 'webp', 'jpg'], // SVG would be better for icons
    placeholderStrategy: 'dominant-color',
    contentType: 'graphic',
    compressionStrategy: 'quality-first',
    adaptiveQuality: {
      slow2g: 90, // Icons need to be clear even on slow connections
      '2g': 95,
      '3g': 100,
      '4g': 100
    }
  },

  // Client/Partner Logos - Brand critical
  'client-logo': {
    id: 'client-logo',
    description: 'Client and partner logos',
    dimensions: {
      mobile: { width: 120, height: 60 },
      desktop: { width: 200, height: 100 },
    },
    quality: 95,
    aspectRatio: '2:1',

    preferredFormats: ['avif', 'webp', 'jpg'],
    placeholderStrategy: 'dominant-color',
    contentType: 'graphic',
    compressionStrategy: 'quality-first', // Brand quality is critical
    adaptiveQuality: {
      slow2g: 85,
      '2g': 90,
      '3g': 95,
      '4g': 95
    }
  },

  // Article/Blog Images
  'article-thumbnail': {
    id: 'article-thumbnail',
    description: 'Article list thumbnails',
    dimensions: {
      mobile: { width: 320, height: 180 },
      desktop: { width: 400, height: 225 },
    },
    quality: 80,
    aspectRatio: '16:9',

    preferredFormats: ['avif', 'webp', 'jpg'],
    placeholderStrategy: 'blurhash',
    preloadStrategy: 'intersection',
    contentType: 'mixed',
    compressionStrategy: 'size-first'
  },

  'article-featured': {
    id: 'article-featured',
    description: 'Featured article image',
    dimensions: {
      mobile: { width: 420, height: 236 },
      tablet: { width: 768, height: 432 },
      desktop: { width: 1200, height: 675 },
    },
    quality: 85,
    priority: true,
    aspectRatio: '16:9',

    lcpCandidate: true,
    preferredFormats: ['avif', 'webp', 'jpg'],
    placeholderStrategy: 'blurhash',
    preloadStrategy: 'eager',
    contentType: 'photo'
  },

  // Performance-critical background images
  'cta-background': {
    id: 'cta-background',
    description: 'Call to action background image',
    dimensions: {
      mobile: { width: 420, height: 300 },
      tablet: { width: 768, height: 400 },
      desktop: { width: 1920, height: 600 },
    },
    quality: 75, // Backgrounds can be lower quality
    aspectRatio: '16:5',

    preferredFormats: ['avif', 'webp', 'jpg'],
    placeholderStrategy: 'dominant-color',
    preloadStrategy: 'intersection',
    contentType: 'photo',
    compressionStrategy: 'size-first',
    adaptiveQuality: {
      slow2g: 25,
      '2g': 35,
      '3g': 60,
      '4g': 75
    }
  },

  // Social Media Preview - Critical for sharing
  'og-image': {
    id: 'og-image',
    description: 'Open Graph preview image',
    dimensions: {
      mobile: { width: 1200, height: 630 },
      desktop: { width: 1200, height: 630 },
    },
    quality: 85,
    aspectRatio: '1.91:1',

    preferredFormats: ['jpg'], // Better compatibility for social media
    placeholderStrategy: 'dominant-color',
    contentType: 'mixed',
    compressionStrategy: 'balanced'
  },

  // Gallery images - User experience focused
  'gallery-thumbnail': {
    id: 'gallery-thumbnail',
    description: 'Gallery grid thumbnails',
    dimensions: {
      mobile: { width: 320, height: 320 },
      tablet: { width: 350, height: 350 },
      desktop: { width: 400, height: 400 },
    },
    quality: 85,
    aspectRatio: '1:1',

    preferredFormats: ['avif', 'webp', 'jpg'],
    placeholderStrategy: 'blurhash',
    preloadStrategy: 'intersection',
    contentType: 'photo',
    compressionStrategy: 'balanced'
  },

  'gallery-lightbox': {
    id: 'gallery-lightbox',
    description: 'Gallery lightbox full images',
    dimensions: {
      mobile: { width: 420, height: 560 },
      desktop: { width: 1600, height: 1200 },
    },
    quality: 90,
    aspectRatio: '4:3',

    preferredFormats: ['avif', 'webp', 'jpg'],
    placeholderStrategy: 'blurhash',
    preloadStrategy: 'hover',
    contentType: 'photo',
    compressionStrategy: 'quality-first'
  }
};

// Enhanced image mappings with metadata
export const ENHANCED_IMAGE_MAPPINGS: (ImageMapping & {
  performance?: {
    criticality: 'critical' | 'important' | 'low';
    loadingPriority: number; // 1-10, 1 being highest
  };
})[] = [
  {
    sourcePath: 'public/assets/hero-main.png',
    locations: ['hero-main', 'og-image'],
    performance: {
      criticality: 'critical',
      loadingPriority: 1
    },
    metadata: {
      keywords: ['hero', 'main', 'banner'],
      alternativeText: {
        en: 'KayanLive main hero image',
        ar: 'الصورة الرئيسية لكيان لايف',
        fr: 'Image héro principale de KayanLive'
      }
    }
  },
  // Add more enhanced mappings...
];

// Utility functions for enhanced optimization
export function getOptimalFormat(
  location: EnhancedImageLocation,
  supportedFormats: string[]
): string {
  const preferred = location.preferredFormats || ['avif', 'webp', 'jpg'];

  for (const format of preferred) {
    if (supportedFormats.includes(format)) {
      return format;
    }
  }

  return 'jpg'; // Ultimate fallback
}

export function getNetworkAwareQuality(
  location: EnhancedImageLocation,
  networkType: string
): number {
  if (!location.adaptiveQuality) {
    return location.quality || 85;
  }

  const qualityMap = location.adaptiveQuality;

  switch (networkType) {
    case 'slow-2g':
      return qualityMap.slow2g;
    case '2g':
      return qualityMap['2g'];
    case '3g':
      return qualityMap['3g'];
    case '4g':
      return qualityMap['4g'];
    default:
      return location.quality || 85;
  }
}

export function shouldPreload(location: EnhancedImageLocation): boolean {
  return location.preloadStrategy === 'eager' ||
         location.lcpCandidate === true ||
         location.priority === true;
}

export function getPlaceholderStrategy(location: EnhancedImageLocation): string {
  return location.placeholderStrategy || 'dominant-color';
}

// Performance analysis for enhanced configuration
export function analyzeEnhancedOptimizationNeeds() {
  const locations = Object.values(ENHANCED_IMAGE_LOCATIONS);

  const analysis = {
    totalLocations: locations.length,
    lcpCandidates: locations.filter(l => l.lcpCandidate).length,
    blurhashEnabled: locations.filter(l => l.placeholderStrategy === 'blurhash').length,
    clientHintsEnabled: locations.filter(l => l.clientHints).length,
    networkAwareLocations: locations.filter(l => l.adaptiveQuality).length,
    formatPreferences: {
      avif: locations.filter(l => l.preferredFormats?.includes('avif')).length,
      webp: locations.filter(l => l.preferredFormats?.includes('webp')).length,
      jxl: locations.filter(l => l.preferredFormats?.includes('jxl')).length
    },
    compressionStrategies: {
      'size-first': locations.filter(l => l.compressionStrategy === 'size-first').length,
      'quality-first': locations.filter(l => l.compressionStrategy === 'quality-first').length,
      'balanced': locations.filter(l => l.compressionStrategy === 'balanced').length
    }
  };

  return analysis;
}

export default {
  ENHANCED_IMAGE_LOCATIONS,
  ENHANCED_IMAGE_MAPPINGS,
  getOptimalFormat,
  getNetworkAwareQuality,
  shouldPreload,
  getPlaceholderStrategy,
  analyzeEnhancedOptimizationNeeds
};