import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getFile } from '@/lib/s3';
import { prisma } from '@/lib/prisma';
import { readFile } from 'fs/promises';
import { join } from 'path';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const resolvedParams = await params;

    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Join the path segments to reconstruct the full fileKey
    const fileKey = resolvedParams.path.join('/');

    if (!fileKey) {
      return NextResponse.json(
        { error: 'File key is required' },
        { status: 400 }
      );
    }

    // Check if preview mode is requested
    const { searchParams } = new URL(request.url);
    const isPreview = searchParams.get('preview') === 'true';

    // First, try to find in ClientUpload (S3 storage)
    const upload = await prisma.clientUpload.findFirst({
      where: {
        fileKey: fileKey,
      },
      include: {
        project: {
          include: {
            company: {
              include: {
                users: {
                  where: {
                    userId: session.user.id,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (upload) {
      // Verify user has access to the company
      if (
        session.user.role !== 'ADMIN' &&
        upload.project.company.users.length === 0
      ) {
        return NextResponse.json(
          { error: 'Access denied' },
          { status: 403 }
        );
      }

      // Get file from S3 storage
      const fileBuffer = await getFile(fileKey);

      // Determine if file type is previewable
      const mimeType = upload.mimeType.toLowerCase();
      const isPreviewable =
        mimeType.startsWith('image/') ||
        mimeType.startsWith('video/') ||
        mimeType === 'application/pdf' ||
        mimeType === 'model/gltf+json' ||
        mimeType === 'model/gltf-binary';

      // Set appropriate headers
      const headers = new Headers();
      headers.set('Content-Type', upload.mimeType);
      headers.set('Content-Length', String(fileBuffer.length));

      // Use inline disposition for preview mode with previewable types
      if (isPreview && isPreviewable) {
        headers.set(
          'Content-Disposition',
          `inline; filename="${encodeURIComponent(upload.fileName)}"`
        );
      } else {
        headers.set(
          'Content-Disposition',
          `attachment; filename="${encodeURIComponent(upload.fileName)}"`
        );
      }

      headers.set('Cache-Control', 'public, max-age=31536000, immutable');

      return new NextResponse(new Uint8Array(fileBuffer), {
        status: 200,
        headers,
      });
    }

    // If not found in ClientUpload, try Asset (local storage)
    const asset = await prisma.asset.findFirst({
      where: {
        fileKey: fileKey,
      },
    });

    if (!asset) {
      console.log('❌ Asset not found with fileKey:', fileKey);
      return NextResponse.json(
        { error: 'File not found' },
        { status: 404 }
      );
    }

    console.log('✅ Found asset:', {
      id: asset.id,
      name: asset.name,
      fileKey: asset.fileKey,
      filePath: asset.filePath,
      mimeType: asset.mimeType,
    });

    // For assets, check if user is admin or has access
    if (session.user.role !== 'ADMIN') {
      // Check if asset is linked to user's company
      const assetProjects = await prisma.projectAsset.findMany({
        where: {
          assetId: asset.id,
        },
        include: {
          project: {
            include: {
              company: {
                include: {
                  users: {
                    where: {
                      userId: session.user.id,
                    },
                  },
                },
              },
            },
          },
        },
      });

      const hasAccess = assetProjects.some((ap) => ap.project.company.users.length > 0);

      if (!hasAccess) {
        return NextResponse.json(
          { error: 'Access denied' },
          { status: 403 }
        );
      }
    }

    // Construct the correct file path
    // If asset has filePath (e.g., /uploads/assets/...), use it directly
    // Otherwise, construct from fileKey by prepending /uploads/
    let filePath: string;

    if (asset.filePath) {
      // filePath starts with /uploads/, so we prepend public directory
      // Remove leading slash if present
      const relativePath = asset.filePath.startsWith('/')
        ? asset.filePath.substring(1)
        : asset.filePath;
      filePath = join(process.cwd(), 'public', relativePath);
    } else {
      // Fallback: construct from fileKey
      filePath = join(process.cwd(), 'public', 'uploads', fileKey);
    }

    console.log('📂 Reading asset from:', filePath);

    // Read file from local storage
    const fileBuffer = await readFile(filePath);

    // Determine if file type is previewable
    const mimeType = asset.mimeType.toLowerCase();
    const isPreviewable =
      mimeType.startsWith('image/') ||
      mimeType.startsWith('video/') ||
      mimeType.startsWith('audio/') ||
      mimeType === 'application/pdf' ||
      mimeType === 'model/gltf+json' ||
      mimeType === 'model/gltf-binary' ||
      mimeType === 'application/octet-stream'; // For .glb files

    // Set appropriate headers
    const headers = new Headers();
    headers.set('Content-Type', asset.mimeType);
    headers.set('Content-Length', String(fileBuffer.length));

    // Use inline disposition for preview mode with previewable types
    if (isPreview && isPreviewable) {
      headers.set(
        'Content-Disposition',
        `inline; filename="${encodeURIComponent(asset.fileName)}"`
      );
    } else {
      headers.set(
        'Content-Disposition',
        `attachment; filename="${encodeURIComponent(asset.fileName)}"`
      );
    }

    headers.set('Cache-Control', 'public, max-age=31536000, immutable');

    return new NextResponse(new Uint8Array(fileBuffer), {
      status: 200,
      headers,
    });
  } catch (error) {
    console.error('File download error:', error);

    // Provide more specific error messages
    if (error && typeof error === 'object' && 'code' in error) {
      if (error.code === 'ENOENT') {
        console.error('❌ File not found at path. Database may have incorrect file path.');
        return NextResponse.json(
          { error: 'File not found in storage', details: error instanceof Error ? error.message : String(error) },
          { status: 404 }
        );
      }
    }

    return NextResponse.json(
      {
        error: 'Failed to download file',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
