'use client';

import Image from 'next/image';
import { useState, useEffect } from 'react';

interface OptimizedImageProps {
  src: string;
  alt: string;
  priority?: boolean;
  sizes?: string;
  className?: string;
  fill?: boolean;
  width?: number;
  height?: number;
  objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down';
  quality?: number;
  placeholder?: 'blur' | 'empty';
  blurDataURL?: string;
  loading?: 'lazy' | 'eager';
  onLoad?: () => void;
  responsive?: boolean;
}


// Generate sizes attribute based on breakpoints
const generateSizes = () => {
  return `
    (max-width: 320px) 320px,
    (max-width: 420px) 420px,
    (max-width: 768px) 768px,
    (max-width: 1024px) 1024px,
    (max-width: 1200px) 1200px,
    1920px
  `.trim();
};

// Placeholder shimmer effect
const shimmer = (w: number, h: number) => `
<svg width="${w}" height="${h}" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
  <defs>
    <linearGradient id="g">
      <stop stop-color="#f6f7f8" offset="20%" />
      <stop stop-color="#edeef1" offset="50%" />
      <stop stop-color="#f6f7f8" offset="70%" />
    </linearGradient>
  </defs>
  <rect width="${w}" height="${h}" fill="#f6f7f8" />
  <rect id="r" width="${w}" height="${h}" fill="url(#g)" />
  <animate xlink:href="#r" attributeName="x" from="-${w}" to="${w}" dur="1s" repeatCount="indefinite"  />
</svg>`;

const toBase64 = (str: string) =>
  typeof window === 'undefined'
    ? Buffer.from(str).toString('base64')
    : window.btoa(str);

export default function OptimizedImage({
  src,
  alt,
  priority = false,
  sizes,
  className = '',
  fill = false,
  width,
  height,
  objectFit = 'cover',
  quality = 90,
  placeholder = 'blur',
  blurDataURL,
  loading = 'lazy',
  onLoad,
  responsive = true,
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [imageSrc, setImageSrc] = useState(src);
  const [hasError, setHasError] = useState(false);

  // Check if WebP is supported
  useEffect(() => {
    const checkWebPSupport = async () => {
      const webP = new window.Image();
      webP.onload = webP.onerror = () => {
        const isSupported = webP.height === 2;
        if (isSupported && !src.includes('.webp')) {
          const webPSrc = src.replace(/\.(jpg|jpeg|png)$/i, '.webp');
          // Check if WebP version exists
          fetch(webPSrc, { method: 'HEAD' })
            .then((res) => {
              if (res.ok) {
                setImageSrc(webPSrc);
              }
            })
            .catch(() => {
              // Keep original src if WebP doesn't exist
            });
        }
      };
      webP.src =
        'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA';
    };

    checkWebPSupport();
  }, [src]);

  // Handle image load
  const handleLoad = () => {
    setIsLoading(false);
    onLoad?.();
  };

  // Handle image error
  const handleError = () => {
    setHasError(true);
    setIsLoading(false);
    // Fallback to original src if WebP fails
    if (imageSrc !== src) {
      setImageSrc(src);
      setHasError(false);
    }
  };

  // Generate blur placeholder
  const defaultBlurDataURL = `data:image/svg+xml;base64,${toBase64(
    shimmer(width || 700, height || 475)
  )}`;

  // Calculate sizes for responsive images
  const imageSizes = sizes || (responsive ? generateSizes() : undefined);

  // Determine image props based on whether it should fill container
  const imageProps = fill
    ? { fill: true }
    : {
        width: width || 1920,
        height: height || 1080,
      };

  return (
    <div className={`relative ${className}`}>
      {isLoading && !hasError && (
        <div className="absolute inset-0 bg-gray-100 animate-pulse rounded-lg" />
      )}

      {hasError ? (
        <div className="flex items-center justify-center w-full h-full bg-gray-100 rounded-lg">
          <span className="text-gray-400">Failed to load image</span>
        </div>
      ) : (
        <Image
          {...imageProps}
          src={imageSrc}
          alt={alt}
          priority={priority}
          sizes={imageSizes}
          quality={quality}
          placeholder={placeholder}
          blurDataURL={blurDataURL || defaultBlurDataURL}
          loading={loading}
          onLoad={handleLoad}
          onError={handleError}
          className={`
            ${isLoading ? 'opacity-0' : 'opacity-100'}
            transition-opacity duration-300
            ${fill ? 'object-' + objectFit : ''}
          `}
        />
      )}
    </div>
  );
}

// Picture component for art-directed responsive images
export function ResponsivePicture({
  sources,
  alt,
  className = '',
  loading = 'lazy',
}: {
  sources: {
    media: string;
    srcSet: string;
    type?: string;
  }[];
  alt: string;
  className?: string;
  loading?: 'lazy' | 'eager';
}) {
  return (
    <picture className={className}>
      {sources.map((source, index) => (
        <source
          key={index}
          media={source.media}
          srcSet={source.srcSet}
          type={source.type || 'image/webp'}
        />
      ))}
      <img
        src={sources[sources.length - 1].srcSet.split(' ')[0]}
        alt={alt}
        loading={loading}
        className="w-full h-auto"
      />
    </picture>
  );
}