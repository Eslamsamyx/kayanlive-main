/**
 * Image Configuration for Location-Specific Optimization
 * Define exact dimensions needed for each image location in the app
 */

export interface ImageLocation {
  id: string;
  description: string;
  dimensions: {
    mobile: { width: number; height: number };
    tablet?: { width: number; height: number };
    desktop: { width: number; height: number };
  };
  quality?: number;
  priority?: boolean; // Above-the-fold images
  aspectRatio?: string; // e.g., "16:9", "4:3", "1:1"
}

export interface ImageMapping {
  sourcePath: string; // Original image path
  locations: string[]; // Array of location IDs where this image is used
}

// Define all image locations in your application with their exact requirements
export const IMAGE_LOCATIONS: Record<string, ImageLocation> = {
  // Hero/Banner Images
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
  },

  'service-detail': {
    id: 'service-detail',
    description: 'Service detail page images',
    dimensions: {
      mobile: { width: 420, height: 280 },
      tablet: { width: 768, height: 512 },
      desktop: { width: 1200, height: 800 },
    },
    quality: 90,
    aspectRatio: '3:2',
  },

  // Industry Section
  'industry-icon': {
    id: 'industry-icon',
    description: 'Industry category icons',
    dimensions: {
      mobile: { width: 64, height: 64 },
      desktop: { width: 128, height: 128 },
    },
    quality: 100, // Icons need high quality
    aspectRatio: '1:1',
  },

  'industry-showcase': {
    id: 'industry-showcase',
    description: 'Industry showcase images',
    dimensions: {
      mobile: { width: 380, height: 250 },
      desktop: { width: 600, height: 400 },
    },
    quality: 85,
    aspectRatio: '3:2',
  },

  // Client/Partner Logos
  'client-logo': {
    id: 'client-logo',
    description: 'Client and partner logos',
    dimensions: {
      mobile: { width: 120, height: 60 },
      desktop: { width: 200, height: 100 },
    },
    quality: 95, // Logos need high quality
    aspectRatio: '2:1',
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
  },

  'article-content': {
    id: 'article-content',
    description: 'Images within article content',
    dimensions: {
      mobile: { width: 380, height: 285 },
      desktop: { width: 800, height: 600 },
    },
    quality: 85,
    aspectRatio: '4:3',
  },

  // CTA Section
  'cta-background': {
    id: 'cta-background',
    description: 'Call to action background image',
    dimensions: {
      mobile: { width: 420, height: 300 },
      tablet: { width: 768, height: 400 },
      desktop: { width: 1920, height: 600 },
    },
    quality: 75, // Background can be lower quality
    aspectRatio: '16:5',
  },

  // Footer
  'footer-logo': {
    id: 'footer-logo',
    description: 'Footer logo',
    dimensions: {
      mobile: { width: 150, height: 50 },
      desktop: { width: 200, height: 67 },
    },
    quality: 95,
    aspectRatio: '3:1',
  },

  // Contact Page
  'contact-map': {
    id: 'contact-map',
    description: 'Contact page map placeholder',
    dimensions: {
      mobile: { width: 420, height: 300 },
      desktop: { width: 800, height: 450 },
    },
    quality: 80,
    aspectRatio: '16:9',
  },

  // Achievements/Stats
  'achievement-icon': {
    id: 'achievement-icon',
    description: 'Achievement/stat icons',
    dimensions: {
      mobile: { width: 48, height: 48 },
      desktop: { width: 80, height: 80 },
    },
    quality: 100,
    aspectRatio: '1:1',
  },

  // Gallery/Portfolio
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
  },

  // Social Media Preview
  'og-image': {
    id: 'og-image',
    description: 'Open Graph preview image',
    dimensions: {
      mobile: { width: 1200, height: 630 },
      desktop: { width: 1200, height: 630 },
    },
    quality: 85,
    aspectRatio: '1.91:1', // Facebook/LinkedIn optimal
  },

  'twitter-image': {
    id: 'twitter-image',
    description: 'Twitter card image',
    dimensions: {
      mobile: { width: 1200, height: 675 },
      desktop: { width: 1200, height: 675 },
    },
    quality: 85,
    aspectRatio: '16:9',
  },
};

// Map specific image files to their locations in the app
export const IMAGE_MAPPINGS: ImageMapping[] = [
  // Hero Images - Using actual files from public/assets
  {
    sourcePath: 'public/assets/01f5d49d03c8455dc99b2ad32446b6657b1949e0.png',
    locations: ['hero-main', 'og-image'],
  },
  {
    sourcePath: 'public/assets/1402feda00b479d56347dca419118793a7b45676.png',
    locations: ['hero-slide'],
  },
  {
    sourcePath: 'public/assets/29064c5a0d86395e45b642fe4e6daf670490f723.png',
    locations: ['hero-slide'],
  },

  // Service/Feature Images
  {
    sourcePath: 'public/assets/0599bc8efb3df6cbf4d2b5cc07e1932dc0d2a400.png',
    locations: ['service-card', 'service-detail'],
  },
  {
    sourcePath: 'public/assets/0a0c21416d9d9b2c97aedc8aa51e7c6619486a15.png',
    locations: ['service-card'],
  },

  // About/Team Images
  {
    sourcePath: 'public/assets/174d9ed83a90c0514d54b7cbb68f8656ca74592c.png',
    locations: ['about-hero'],
  },
  {
    sourcePath: 'public/assets/123269087423c903b101b9352bd92acdab49d86a.png',
    locations: ['about-team'],
  },

  // Article/Content Images
  {
    sourcePath: 'public/assets/0bb8e976afa37efb2547ff983a789a24c46bc909.png',
    locations: ['article-thumbnail', 'article-featured'],
  },
  {
    sourcePath: 'public/assets/273cea28658e9744d1cd2fbc64a5ba1ac7deeff8.png',
    locations: ['article-content'],
  },

  // Gallery Images
  {
    sourcePath: 'public/assets/5fe3ba66a055c9a5b01ea404941b7097da5ffdb0.png',
    locations: ['gallery-thumbnail'],
  },
  {
    sourcePath: 'public/assets/6cdd4333a240b46dead9df86c5a83772e81b76fc.png',
    locations: ['gallery-thumbnail'],
  },

  // Additional commonly used images
  {
    sourcePath: 'public/assets/823c27de600ccd2f92af3e073c8e10df3a192e5c.png',
    locations: ['footer-logo', 'client-logo'],
  },
  {
    sourcePath: 'public/assets/1349ad630f81a3bb2a509dd8abfe0e4ef85fa329.png',
    locations: ['about-hero', 'industry-showcase'],
  },
  {
    sourcePath: 'public/assets/ef25fd14e49122ddd6cbc03c8a92caff93500eb7.png',
    locations: ['cta-background'],
  },
  {
    sourcePath: 'public/assets/79b8becbbe666db19c2c2dfdebe436eebf271e2e.png',
    locations: ['industry-showcase'],
  },
  {
    sourcePath: 'public/assets/cb192ab808312901ac705768d1f69f35ae3c9f61.png',
    locations: ['industry-showcase'],
  },
  {
    sourcePath: 'public/assets/a01d943cb7ebcf5598b83131f56810cf97a4e883.png',
    locations: ['client-logo'],
  },
  {
    sourcePath: 'public/assets/e05fec393f295d237ade9dff2ad26793496382ba.png',
    locations: ['service-card'],
  },
  {
    sourcePath: 'public/assets/8980a40c08a52f165b1c17b24158f20160d003cc.png',
    locations: ['service-card'],
  },
  {
    sourcePath: 'public/assets/44d602b7f7ce040ad9592bf1e21de743a7ce86d1.png',
    locations: ['service-card'],
  },
  {
    sourcePath: 'public/assets/a255a0faf04e8dcc9b85bbbb16bca93169de897f.png',
    locations: ['service-card'],
  },
  {
    sourcePath: 'public/assets/d4096bba6c0158e37ce51f8a24f9565b007aaa92.png',
    locations: ['service-card'],
  },
  {
    sourcePath: 'public/assets/409f7073bcfac7c1d7eea78ab2e23cc10f6a16fb.png',
    locations: ['service-card'],
  },
  {
    sourcePath: 'public/assets/cf27cb2a37e9e3bfd30c1ada4fe4988496b10bbb.png',
    locations: ['service-card'],
  },
  {
    sourcePath: 'public/assets/776958ae56ed264aecd4c182054c75bc576a1d2f.png',
    locations: ['gallery-thumbnail'],
  },
  {
    sourcePath: 'public/assets/c57c28aa85c3935c2914aa9ff408c9f8c8f2fe68.png',
    locations: ['gallery-thumbnail'],
  },
  {
    sourcePath: 'public/assets/b74a7a7d29dd66a6cd62e4edfe0512fa5a3b97ad.png',
    locations: ['gallery-thumbnail'],
  },
  {
    sourcePath: 'public/assets/d079f823333ca8bce293bcab9a39cb1aea4b5439.png',
    locations: ['gallery-thumbnail'],
  },
  {
    sourcePath: 'public/assets/b0d9ec6faacc00d7ed8b82f3f45ecaa371425181.png',
    locations: ['hero-slide'],
  },
  {
    sourcePath: 'public/assets/873e726ea40f8085d26088ffc29bf8dfb68b10ee.png',
    locations: ['client-logo'],
  },

  // Additional images from AboutValues.tsx
  {
    sourcePath: 'public/assets/fe74de8467bf5ef42975b489173519217b1b04d0.png',
    locations: ['about-hero', 'service-card'],
  },
  {
    sourcePath: 'public/assets/4bf06f33663f81bd327984084be746509f0caffd.png',
    locations: ['about-hero', 'service-card'],
  },
  {
    sourcePath: 'public/assets/3bfce9db290033eb81342a31f55d19a490e552d3.png',
    locations: ['about-hero', 'service-card'],
  },
  {
    sourcePath: 'public/assets/c7e54c0605f6e122070c3da28c63679ca3742a85.png',
    locations: ['about-hero', 'service-card'],
  },
  {
    sourcePath: 'public/assets/7854b2fa3456db2dfe1f88a71484d2ef952fd4d6.png',
    locations: ['about-hero', 'service-card'],
  },

  // Additional images from HighImpactExperience.hooks.ts
  {
    sourcePath: 'public/assets/3f0c70e340a28d47867891894e77a32ca1a022f1.png',
    locations: ['hero-slide', 'gallery-thumbnail'],
  },
  {
    sourcePath: 'public/assets/6ebbb286c787b4009100c9f8cd397942ae83de56.png',
    locations: ['hero-slide', 'gallery-thumbnail'],
  },

  // Additional images from Achievements.tsx
  {
    sourcePath: 'public/assets/638442c54db92ce49b3ad8194a062a52ba973004.png',
    locations: ['achievement-icon', 'industry-icon'],
  },

  // Additional images from WorkPreview.tsx
  {
    sourcePath: 'public/assets/5482ea96fa4b448d8ca09a0a3ec25b2abda42297.png',
    locations: ['gallery-thumbnail', 'service-card'],
  },
  {
    sourcePath: 'public/assets/d0bf46ddca5a9b03461723c0c034ab2dc5fc309e.png',
    locations: ['gallery-thumbnail', 'service-card'],
  },

  // Additional image from other components
  {
    sourcePath: 'public/assets/2e5da0ba94a7081a8e8355ba87266411fee96738.png',
    locations: ['service-card', 'gallery-thumbnail'],
  },

  // Missing images found in pages and components
  {
    sourcePath: 'public/assets/6f6ce5ee6422e315524d4c876dbb7b8a3e609a69.png',
    locations: ['cta-background', 'about-hero'],
  },
  {
    sourcePath: 'public/assets/97b98a652c6210a2b4e884e84040708ab75a45fc.png',
    locations: ['gallery-thumbnail', 'service-card'],
  },
  {
    sourcePath: 'public/assets/a4bd38b73259c4fd4f099d834871f17ed5486466.png',
    locations: ['gallery-thumbnail', 'service-card'],
  },
  {
    sourcePath: 'public/assets/bdd0b482d2a4b06725b67356c9cb8f5f989799c7.png',
    locations: ['gallery-thumbnail', 'service-card'],
  },

  // Add more mappings as files are identified...
];

// Function to get optimal dimensions for a specific image and location
export function getOptimalDimensions(
  imagePath: string,
  locationId: string,
  viewport: 'mobile' | 'tablet' | 'desktop' = 'desktop'
) {
  const location = IMAGE_LOCATIONS[locationId];
  if (!location) {
    console.warn(`Location ${locationId} not found in configuration`);
    return null;
  }

  const dimensions = location.dimensions[viewport] || location.dimensions.desktop;
  return {
    ...dimensions,
    quality: location.quality || 85,
    priority: location.priority || false,
  };
}

// Get all locations where an image is used
export function getImageLocations(imagePath: string): ImageLocation[] {
  const mapping = IMAGE_MAPPINGS.find(m => m.sourcePath === imagePath);
  if (!mapping) return [];

  return mapping.locations
    .map(locationId => IMAGE_LOCATIONS[locationId])
    .filter(Boolean);
}

// Analyze which images need optimization
export function analyzeOptimizationNeeds() {
  const report: {
    totalImages: number;
    totalLocations: number;
    missingMappings: string[];
    unusedLocations: string[];
    optimizationTasks: Array<{
      image: string;
      locations: string[];
      totalVariants: number;
    }>;
  } = {
    totalImages: IMAGE_MAPPINGS.length,
    totalLocations: Object.keys(IMAGE_LOCATIONS).length,
    missingMappings: [],
    unusedLocations: [],
    optimizationTasks: [],
  };

  // Find unused locations
  const usedLocations = new Set<string>();
  IMAGE_MAPPINGS.forEach(mapping => {
    mapping.locations.forEach(loc => usedLocations.add(loc));
  });

  Object.keys(IMAGE_LOCATIONS).forEach(locationId => {
    if (!usedLocations.has(locationId)) {
      report.unusedLocations.push(locationId);
    }
  });

  // Calculate optimization tasks
  IMAGE_MAPPINGS.forEach(mapping => {
    let totalVariants = 0;
    mapping.locations.forEach(locationId => {
      const location = IMAGE_LOCATIONS[locationId];
      if (location) {
        totalVariants += Object.keys(location.dimensions).length;
      }
    });

    report.optimizationTasks.push({
      image: mapping.sourcePath,
      locations: mapping.locations,
      totalVariants,
    });
  });

  return report;
}

export default {
  IMAGE_LOCATIONS,
  IMAGE_MAPPINGS,
  getOptimalDimensions,
  getImageLocations,
  analyzeOptimizationNeeds,
};