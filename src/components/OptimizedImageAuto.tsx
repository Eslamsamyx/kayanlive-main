'use client';

import Image, { ImageProps } from 'next/image';
import { useState, useEffect } from 'react';
import { getOptimizedImageUrl, getOptimizedSrcSet, getOptimizedSizes } from '@/lib/optimized-images';

interface OptimizedImageAutoProps extends Omit<ImageProps, 'src'> {
  src: string;
  location: string;
  fallback?: string;
}

/**
 * Automatically uses optimized images from the manifest
 * Falls back to original if no optimized version exists
 */
export default function OptimizedImageAuto({
  src,
  location,
  fallback,
  alt,
  className,
  ...props
}: OptimizedImageAutoProps) {
  const [viewport, setViewport] = useState<'mobile' | 'tablet' | 'desktop'>('desktop');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    const handleResize = () => {
      const width = window.innerWidth;
      if (width < 768) setViewport('mobile');
      else if (width < 1024) setViewport('tablet');
      else setViewport('desktop');
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Get optimized image URL
  const imageSrc = getOptimizedImageUrl(src, location, viewport);
  const srcSet = mounted ? getOptimizedSrcSet(src, location) : undefined;
  const sizes = getOptimizedSizes(location);

  // Use fallback if optimized version doesn't exist
  const finalSrc = imageSrc || fallback || src;

  // For Next.js Image component, we need to handle WebP format
  const imageProps: ImageProps = {
    ...props,
    src: finalSrc,
    alt,
    className,
  };

  // Only add srcSet and sizes if we have optimized versions
  if (srcSet && srcSet !== src) {
    return (
      <picture>
        <source
          type="image/webp"
          srcSet={srcSet}
          sizes={sizes}
        />
        <Image {...imageProps} alt={alt} />
      </picture>
    );
  }

  return <Image {...imageProps} alt={alt} />;
}