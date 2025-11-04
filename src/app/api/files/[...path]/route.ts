/**
 * Local Filesystem File Server API Route
 *
 * Serves files stored in local filesystem when S3 is not available.
 * Provides authentication, content-type detection, and proper caching headers.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getFileLocal } from '@/lib/storage-local';
import { logger } from '@/lib/logger';

// MIME type mapping for common file extensions
const MIME_TYPES: Record<string, string> = {
  // Images
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  gif: 'image/gif',
  webp: 'image/webp',
  svg: 'image/svg+xml',
  ico: 'image/x-icon',

  // Videos
  mp4: 'video/mp4',
  webm: 'video/webm',
  mov: 'video/quicktime',
  avi: 'video/x-msvideo',

  // Audio
  mp3: 'audio/mpeg',
  wav: 'audio/wav',
  ogg: 'audio/ogg',
  m4a: 'audio/mp4',

  // Documents
  pdf: 'application/pdf',
  doc: 'application/msword',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  xls: 'application/vnd.ms-excel',
  xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  ppt: 'application/vnd.ms-powerpoint',
  pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',

  // Text
  txt: 'text/plain',
  html: 'text/html',
  css: 'text/css',
  js: 'application/javascript',
  json: 'application/json',
  xml: 'application/xml',

  // Archives
  zip: 'application/zip',
  rar: 'application/x-rar-compressed',
  '7z': 'application/x-7z-compressed',

  // Default
  bin: 'application/octet-stream',
};

function getMimeType(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase() || 'bin';
  return MIME_TYPES[ext] || 'application/octet-stream';
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const resolvedParams = await params;

    // Get session for authentication
    const session = await getServerSession(authOptions);

    // Require authentication for file access
    if (!session?.user) {
      const forwardedFor = request.headers.get('x-forwarded-for');
      const ip = forwardedFor ? forwardedFor.split(',')[0] : 'unknown';

      logger.warn('Unauthorized file access attempt', {
        path: resolvedParams.path.join('/'),
        ip,
      });
      return NextResponse.json(
        { error: 'Unauthorized - authentication required' },
        { status: 401 }
      );
    }

    // Reconstruct file key from path segments
    const fileKey = resolvedParams.path.join('/');

    // Security: Prevent directory traversal attacks
    if (fileKey.includes('..') || fileKey.startsWith('/')) {
      logger.warn('Potential directory traversal attempt', {
        fileKey,
        userId: session.user.id,
      });
      return NextResponse.json(
        { error: 'Invalid file path' },
        { status: 400 }
      );
    }

    logger.info('Serving file from local storage', {
      fileKey,
      userId: session.user.id,
    });

    // Get file from local storage
    const fileBuffer = await getFileLocal(fileKey);

    // Determine content type
    const contentType = getMimeType(fileKey);

    // Return file with appropriate headers
    // Convert Buffer to Uint8Array for NextResponse compatibility
    const uint8Array = new Uint8Array(fileBuffer);

    return new NextResponse(uint8Array, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Length': fileBuffer.length.toString(),
        'Cache-Control': 'public, max-age=31536000, immutable', // Cache for 1 year
        'X-Served-By': 'local-filesystem',
        // Allow iframe embedding from same origin (for PDF preview)
        'X-Frame-Options': 'SAMEORIGIN',
        'Content-Security-Policy': "frame-ancestors 'self'",
      },
    });
  } catch (error) {
    const resolvedParams = await params;
    logger.error('Error serving file from local storage', {
      path: resolvedParams.path.join('/'),
      error: error instanceof Error ? error.message : 'Unknown error',
    });

    if (error instanceof Error && error.message.includes('not found')) {
      return NextResponse.json(
        { error: 'File not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
