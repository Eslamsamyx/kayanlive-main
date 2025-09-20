import { NextRequest, NextResponse } from 'next/server';
import sharp from 'sharp';
import { readFile } from 'fs/promises';
import { join } from 'path';

interface ImageParams {
  url: string;
  w: string;
  q: string;
  f: string;
  dpr?: string;
  'save-data'?: string;
}

/**
 * Ultra-optimized image API route with client hints and network awareness
 * Implements 2024 best practices for adaptive image serving
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const params: ImageParams = {
      url: searchParams.get('url') || '',
      w: searchParams.get('w') || '800',
      q: searchParams.get('q') || '85',
      f: searchParams.get('f') || 'webp',
      dpr: searchParams.get('dpr') || undefined,
      'save-data': searchParams.get('save-data') || undefined,
    };

    // Validate parameters
    if (!params.url) {
      return new NextResponse('Missing URL parameter', { status: 400 });
    }

    const width = parseInt(params.w);
    const quality = parseInt(params.q);
    const format = params.f;
    const dpr = params.dpr ? parseFloat(params.dpr) : 1;

    if (width < 1 || width > 3840) {
      return new NextResponse('Invalid width parameter', { status: 400 });
    }

    if (quality < 1 || quality > 100) {
      return new NextResponse('Invalid quality parameter', { status: 400 });
    }

    // Extract client hints from headers
    const clientHints = extractClientHints(request);

    // Adjust parameters based on client hints and network conditions
    const adaptiveWidth = Math.round(width * dpr);
    const adaptiveQuality = getAdaptiveQuality(quality, clientHints, params['save-data']);

    // Load the source image
    const imagePath = join(process.cwd(), 'public', params.url);
    let imageBuffer: Buffer;

    try {
      imageBuffer = await readFile(imagePath);
    } catch {
      return new NextResponse('Image not found', { status: 404 });
    }

    // Process image with Sharp
    const processedImage = sharp(imageBuffer)
      .resize(adaptiveWidth, undefined, {
        fit: 'inside',
        withoutEnlargement: true,
        kernel: sharp.kernel.lanczos3, // High-quality resampling
      });

    // Apply format-specific optimizations
    let outputBuffer: Buffer;
    let contentType: string;

    switch (format) {
      case 'avif':
        outputBuffer = await processedImage
          .avif({
            quality: adaptiveQuality,
            effort: 9, // Maximum compression effort
            chromaSubsampling: '4:2:0'
          })
          .toBuffer();
        contentType = 'image/avif';
        break;

      case 'webp':
        outputBuffer = await processedImage
          .webp({
            quality: adaptiveQuality,
            effort: 6,
            smartSubsample: true
          })
          .toBuffer();
        contentType = 'image/webp';
        break;

      case 'jxl':
        // JPEG XL support (when available)
        // For now, fallback to WebP
        outputBuffer = await processedImage
          .webp({
            quality: adaptiveQuality,
            effort: 6,
          })
          .toBuffer();
        contentType = 'image/webp';
        break;

      case 'jpg':
      case 'jpeg':
      default:
        outputBuffer = await processedImage
          .jpeg({
            quality: adaptiveQuality,
            progressive: true,
            mozjpeg: true,
            trellisQuantisation: true,
            overshootDeringing: true,
            optimiseScans: true,
          })
          .toBuffer();
        contentType = 'image/jpeg';
        break;
    }

    // Set response headers for optimal caching and performance
    const headers = new Headers({
      'Content-Type': contentType,
      'Cache-Control': 'public, max-age=31536000, immutable', // 1 year cache
      'Vary': 'Accept, DPR, Viewport-Width, Width, Save-Data',
      'Content-Length': outputBuffer.length.toString(),
    });

    // Add security headers
    headers.set('X-Content-Type-Options', 'nosniff');
    headers.set('Content-Security-Policy', "default-src 'none'");

    // Add performance hints
    if (clientHints.saveData) {
      headers.set('Save-Data', 'on');
    }

    return new NextResponse(outputBuffer as unknown as BodyInit, {
      status: 200,
      headers,
    });

  } catch (error) {
    console.error('Ultra image processing error:', error);
    return new NextResponse('Internal server error', { status: 500 });
  }
}

/**
 * Extract client hints from request headers
 */
function extractClientHints(request: NextRequest) {
  return {
    dpr: parseFloat(request.headers.get('DPR') || '1'),
    width: parseInt(request.headers.get('Width') || request.headers.get('Viewport-Width') || '1920'),
    saveData: request.headers.get('Save-Data') === 'on',
    effectiveType: request.headers.get('Sec-CH-UA-Mobile') === '?1' ? 'mobile' : 'desktop',
  };
}

/**
 * Calculate adaptive quality based on client hints and network conditions
 */
function getAdaptiveQuality(
  baseQuality: number,
  clientHints: ReturnType<typeof extractClientHints>,
  saveDataParam?: string
): number {
  let quality = baseQuality;

  // Data saver mode
  if (clientHints.saveData || saveDataParam === '1') {
    quality = Math.min(quality, 40);
  }

  // Mobile optimization
  if (clientHints.effectiveType === 'mobile') {
    quality = Math.min(quality, 75);
  }

  // High DPR displays can use slightly lower quality
  if (clientHints.dpr > 2) {
    quality = Math.max(30, quality - 10);
  }

  // Small viewport optimization
  if (clientHints.width < 768) {
    quality = Math.min(quality, 80);
  }

  return Math.max(10, Math.min(100, Math.round(quality)));
}

/**
 * Handle HEAD requests for cache validation
 */
export async function HEAD(request: NextRequest) {
  const response = await GET(request);

  // Return headers only
  return new NextResponse(null, {
    status: response.status,
    headers: response.headers,
  });
}

/**
 * Handle OPTIONS requests for CORS
 */
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Allow': 'GET, HEAD, OPTIONS',
      'Cache-Control': 'public, max-age=86400', // 1 day
    },
  });
}