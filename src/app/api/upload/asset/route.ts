import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// File type validation
const ALLOWED_MIME_TYPES = {
  IMAGE: [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'image/svg+xml',
  ],
  VIDEO: [
    'video/mp4',
    'video/webm',
    'video/quicktime',
    'video/x-msvideo',
  ],
  DOCUMENT: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'text/plain',
    'text/csv',
  ],
  AUDIO: [
    'audio/mpeg',
    'audio/wav',
    'audio/ogg',
    'audio/mp4',
    'audio/webm',
  ],
  MODEL_3D: [
    'model/gltf-binary',
    'model/gltf+json',
    'application/octet-stream', // For .glb, .obj, .fbx
  ],
  OTHER: [],
};

// Max file size: 50MB
const MAX_FILE_SIZE = 50 * 1024 * 1024;

function getAssetTypeFromMimeType(mimeType: string, fileName?: string): string {
  // Check file extension for 3D models as fallback
  if (fileName) {
    const lowerFileName = fileName.toLowerCase();
    if (lowerFileName.endsWith('.glb') || lowerFileName.endsWith('.gltf') || lowerFileName.endsWith('.obj') || lowerFileName.endsWith('.fbx')) {
      return 'MODEL_3D';
    }
  }

  for (const [type, mimeTypes] of Object.entries(ALLOWED_MIME_TYPES)) {
    if ((mimeTypes as string[]).includes(mimeType)) {
      return type;
    }
  }
  return 'OTHER';
}

function isAllowedMimeType(mimeType: string, fileName?: string): boolean {
  // Check file extension for 3D models as fallback
  const is3DModel = !!fileName && (
    fileName.toLowerCase().endsWith('.glb') ||
    fileName.toLowerCase().endsWith('.gltf') ||
    fileName.toLowerCase().endsWith('.obj') ||
    fileName.toLowerCase().endsWith('.fbx')
  );

  console.log('🔍 Server validation:', {
    mimeType,
    fileName,
    is3DModel,
  });

  const allAllowed = Object.values(ALLOWED_MIME_TYPES).flat();
  const isAllowed = allAllowed.includes(mimeType) ||
         mimeType.startsWith('image/') ||
         mimeType.startsWith('video/') ||
         mimeType.startsWith('audio/') ||
         mimeType.startsWith('model/') ||
         (is3DModel && mimeType === 'application/octet-stream') ||
         (is3DModel && !mimeType); // Some browsers don't set MIME type

  console.log('✅ Server validation result:', isAllowed);
  return isAllowed;
}

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Parse form data
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    console.log('📤 Upload request received');

    if (!file) {
      console.error('❌ No file in request');
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    console.log('📁 File received:', {
      name: file.name,
      size: file.size,
      type: file.type,
    });

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      const error = `File size exceeds maximum allowed size of ${MAX_FILE_SIZE / 1024 / 1024}MB`;
      console.error('❌ File too large:', error);
      return NextResponse.json(
        { error },
        { status: 400 }
      );
    }

    // Validate MIME type
    const mimeType = file.type;
    if (!isAllowedMimeType(mimeType, file.name)) {
      const error = `File type ${mimeType || 'unknown'} is not allowed for ${file.name}`;
      console.error('❌ Invalid file type:', error);
      return NextResponse.json(
        { error },
        { status: 400 }
      );
    }

    // Determine asset type
    const assetType = getAssetTypeFromMimeType(mimeType, file.name);
    console.log('📊 Asset type determined:', assetType);

    // Generate unique filename
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 15);
    const fileExt = file.name.split('.').pop() || 'bin';
    const fileName = `${timestamp}-${randomStr}.${fileExt}`;
    console.log('📝 Generated filename:', fileName);

    // Create directory structure
    const uploadDir = join(process.cwd(), 'public', 'uploads', 'assets', assetType.toLowerCase());
    console.log('📂 Creating directory:', uploadDir);
    await mkdir(uploadDir, { recursive: true });

    // Convert file to buffer and save
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const filePath = join(uploadDir, fileName);
    console.log('💾 Writing file to:', filePath);
    await writeFile(filePath, buffer);
    console.log('✅ File written successfully');

    // Return file metadata
    const publicPath = `/uploads/assets/${assetType.toLowerCase()}/${fileName}`;
    const fileKey = `uploads/assets/${assetType.toLowerCase()}/${fileName}`; // Without leading slash for storage key

    return NextResponse.json({
      success: true,
      fileName,
      originalName: file.name,
      filePath: publicPath,
      fileKey,
      fileSize: file.size,
      mimeType,
      assetType,
    });

  } catch (error) {
    console.error('File upload error:', error);
    return NextResponse.json(
      { error: 'Failed to upload file' },
      { status: 500 }
    );
  }
}

// GET endpoint to check upload status
export async function GET() {
  return NextResponse.json({
    maxFileSize: MAX_FILE_SIZE,
    allowedTypes: ALLOWED_MIME_TYPES,
  });
}
