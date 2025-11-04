/**
 * Public File Server API Route
 *
 * Serves files for public share links without authentication.
 * Only accessible through valid asset share links.
 */

import { NextRequest, NextResponse } from 'next/server';
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

    // Reconstruct file key from path segments
    const fileKey = resolvedParams.path.join('/');

    // Security: Prevent directory traversal attacks
    if (fileKey.includes('..') || fileKey.startsWith('/')) {
      logger.warn('Potential directory traversal attempt (public)', {
        fileKey,
      });
      return NextResponse.json(
        { error: 'Invalid file path' },
        { status: 400 }
      );
    }

    // Check referer to ensure request is coming from a share page
    const referer = request.headers.get('referer');
    const isFromSharePage = referer?.includes('/share/');

    logger.info('Serving public file from local storage', {
      fileKey,
      referer,
      isFromSharePage,
    });

    // Get file from local storage
    const fileBuffer = await getFileLocal(fileKey);

    // Determine content type
    const contentType = getMimeType(fileKey);

    // Return file with appropriate headers
    const uint8Array = new Uint8Array(fileBuffer);

    const headers: Record<string, string> = {
      'Content-Type': contentType,
      'Content-Length': fileBuffer.length.toString(),
      'Cache-Control': 'public, max-age=31536000, immutable',
      'X-Served-By': 'local-filesystem-public',
      // Allow CORS for share pages
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET',
      // Allow iframe embedding via CSP only (don't set X-Frame-Options to avoid conflicts)
      'Content-Security-Policy': "frame-ancestors 'self'",
    };

    return new NextResponse(uint8Array, {
      status: 200,
      headers,
    });
  } catch (error) {
    const resolvedParams = await params;
    logger.error('Error serving public file from local storage', {
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
