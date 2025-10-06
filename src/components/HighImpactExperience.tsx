'use client';

/**
 * HighImpactExperience Component
 * 
 * Modern, responsive, RTL-ready component following React best practices.
 * Features:
 * - Component composition and separation of concerns
 * - TypeScript interfaces for type safety
 * - Custom hooks for logic separation
 * - CSS modules for maintainable styling
 * - Performance optimizations with image preloading
 * - Error boundaries and loading states
 * - Accessibility improvements
 * - Comprehensive RTL support
 * - Legacy fallback option
 * 
 * @example
 * // Default usage with new architecture
 * <HighImpactExperience />
 * 
 * @example  
 * // With legacy fallback
 * <HighImpactExperience fallbackToLegacy={true} />
 * 
 * @example
 * // With custom styling
 * <HighImpactExperience className="custom-styles" testId="high-impact-section" />
 */

import React from 'react';
import HighImpactExperienceLegacy from './HighImpactExperienceLegacy';
import type { HighImpactExperienceProps } from './HighImpactExperience.types';

/**
 * Main HighImpactExperience component
 * Temporarily using legacy component directly to test positioning fix
 */
const HighImpactExperience: React.FC<HighImpactExperienceProps> = () => {
  console.log('🎯 Main HighImpactExperience component rendering');
  return <HighImpactExperienceLegacy />;
};

// Display name for debugging
HighImpactExperience.displayName = 'HighImpactExperience';

export default HighImpactExperience;

// Export the legacy component for direct access
export { default as HighImpactExperienceLegacy } from './HighImpactExperienceLegacy';

// Export hooks for advanced usage
export {
  useRTL,
  useResponsive,
  useTextContent,
  useImageAssets,
  useComponentTheme,
  useHighImpactExperience,
  useImagePreloader,
  useAccessibility,
} from './HighImpactExperience.hooks';

// Export types for TypeScript users
export type {
  HighImpactExperienceProps,
  HighImpactTextContent,
  RTLConfig,
  ImageAssets,
  ComponentTheme,
  TextLineProps,
  ImageSectionProps,
  DecorativePatternProps,
} from './HighImpactExperience.types';