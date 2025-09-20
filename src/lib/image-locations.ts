// Image location configurations for responsive optimization
export const IMAGE_LOCATIONS = {
  // Hero section images
  'hero-main': {
    mobile: { width: 420, height: 280, quality: 85 },
    tablet: { width: 768, height: 512, quality: 85 },
    desktop: { width: 1920, height: 1080, quality: 85 }
  },
  'hero-slide': {
    mobile: { width: 375, height: 667, quality: 80 },
    tablet: { width: 768, height: 1024, quality: 85 },
    desktop: { width: 1920, height: 1080, quality: 85 }
  },

  // Service related images
  'service-card': {
    mobile: { width: 320, height: 200, quality: 85 },
    desktop: { width: 400, height: 250, quality: 85 }
  },
  'service-hero': {
    mobile: { width: 375, height: 400, quality: 85 },
    desktop: { width: 800, height: 600, quality: 90 }
  },

  // About section
  'about-hero': {
    mobile: { width: 420, height: 420, quality: 85 },
    desktop: { width: 1200, height: 600, quality: 85 }
  },
  'team-member': {
    mobile: { width: 200, height: 200, quality: 85 },
    desktop: { width: 400, height: 400, quality: 90 }
  },

  // Gallery
  'gallery-thumbnail': {
    mobile: { width: 320, height: 320, quality: 85 },
    tablet: { width: 350, height: 350, quality: 85 },
    desktop: { width: 400, height: 400, quality: 85 }
  },
  'gallery-full': {
    mobile: { width: 375, height: 500, quality: 85 },
    tablet: { width: 768, height: 600, quality: 90 },
    desktop: { width: 1200, height: 800, quality: 90 }
  },

  // CTA sections
  'cta-background': {
    mobile: { width: 420, height: 300, quality: 75 },
    tablet: { width: 768, height: 400, quality: 75 },
    desktop: { width: 1920, height: 600, quality: 75 }
  },

  // Article/Blog
  'article-thumbnail': {
    mobile: { width: 320, height: 180, quality: 85 },
    desktop: { width: 400, height: 225, quality: 85 }
  },
  'article-hero': {
    mobile: { width: 375, height: 250, quality: 85 },
    tablet: { width: 768, height: 400, quality: 85 },
    desktop: { width: 1200, height: 600, quality: 90 }
  },
  'article-content': {
    mobile: { width: 375, height: 250, quality: 85 },
    desktop: { width: 800, height: 450, quality: 90 }
  },

  // Logos and icons
  'client-logo': {
    mobile: { width: 150, height: 80, quality: 90 },
    desktop: { width: 200, height: 100, quality: 90 }
  },
  'footer-logo': {
    mobile: { width: 150, height: 60, quality: 90 },
    desktop: { width: 200, height: 80, quality: 90 }
  },
  'partner-logo': {
    mobile: { width: 160, height: 80, quality: 90 },
    desktop: { width: 240, height: 120, quality: 90 }
  },

  // Patterns and decorative
  'pattern': {
    mobile: { width: 300, height: 300, quality: 70 },
    desktop: { width: 600, height: 600, quality: 70 }
  },

  // Event/showcase images
  'event-banner': {
    mobile: { width: 375, height: 200, quality: 85 },
    tablet: { width: 768, height: 300, quality: 85 },
    desktop: { width: 1920, height: 600, quality: 85 }
  },
  'showcase-item': {
    mobile: { width: 350, height: 250, quality: 85 },
    desktop: { width: 600, height: 400, quality: 90 }
  },

  // Industry specific
  'industry-showcase': {
    mobile: { width: 375, height: 300, quality: 85 },
    desktop: { width: 800, height: 500, quality: 90 }
  },

  // Achievement icons
  'achievement-icon': {
    mobile: { width: 200, height: 200, quality: 85 },
    desktop: { width: 400, height: 400, quality: 85 }
  },

  // OpenGraph/Meta
  'og-image': {
    mobile: { width: 1200, height: 630, quality: 90 },
    tablet: { width: 1200, height: 630, quality: 90 },
    desktop: { width: 1200, height: 630, quality: 90 }
  }
} as const;

export type ImageLocation = keyof typeof IMAGE_LOCATIONS;
export type ViewportSize = 'mobile' | 'tablet' | 'desktop';