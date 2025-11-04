import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  HeadObjectCommand,
  CopyObjectCommand,
  ListObjectsV2Command,
} from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { createHash } from 'crypto';
import { nanoid } from 'nanoid';
import { logger } from './logger';
import * as localStorage from './storage-local';

// Storage Backend Detection
export const isS3Available = !!(
  process.env.AWS_ACCESS_KEY_ID &&
  process.env.AWS_SECRET_ACCESS_KEY &&
  process.env.AWS_S3_BUCKET
);

// Log storage backend on module initialization
if (isS3Available) {
  logger.info('Storage backend: AWS S3');
} else {
  logger.warn('AWS S3 not configured - using local filesystem storage');
}

// S3 Client Configuration
const s3Client = isS3Available
  ? new S3Client({
      region: process.env.AWS_REGION || 'us-east-1',
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
      },
    })
  : null;

const BUCKET_NAME = process.env.AWS_S3_BUCKET || 'kayanlive-assets';
const CDN_URL = process.env.AWS_CLOUDFRONT_URL; // Optional CloudFront URL

// File type detection
export const getFileType = (mimeType: string): string => {
  if (mimeType.startsWith('image/')) return 'IMAGE';
  if (mimeType.startsWith('video/')) return 'VIDEO';
  if (mimeType.startsWith('audio/')) return 'AUDIO';
  if (mimeType.includes('pdf')) return 'DOCUMENT';
  if (mimeType.includes('model') || mimeType.includes('3d')) return 'MODEL_3D';
  if (
    mimeType.includes('photoshop') ||
    mimeType.includes('illustrator') ||
    mimeType.includes('figma')
  )
    return 'DESIGN';
  return 'OTHER';
};

// Generate unique file key with date-based organization
export const generateFileKey = (
  originalFilename: string,
  prefix = 'assets'
): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const uniqueId = nanoid(10);
  const extension = originalFilename.split('.').pop()?.toLowerCase() || 'bin';
  const sanitizedName = originalFilename
    .replace(/[^a-zA-Z0-9.-]/g, '_')
    .substring(0, 50);

  return `${prefix}/${year}/${month}/${uniqueId}-${sanitizedName}`;
};

// Calculate file checksum (MD5)
export const calculateChecksum = (buffer: Buffer): string => {
  return createHash('md5').update(buffer).digest('hex');
};

// Upload file to S3
export interface UploadOptions {
  buffer: Buffer;
  filename: string;
  mimeType: string;
  prefix?: string;
  metadata?: Record<string, string>;
  tags?: Record<string, string>;
}

export interface UploadResult {
  fileKey: string;
  bucket: string;
  size: number;
  checksum: string;
  url: string;
}

export const uploadFile = async (
  options: UploadOptions
): Promise<UploadResult> => {
  const { buffer, filename, mimeType, prefix = 'assets', metadata, tags } = options;

  // If S3 is not available, use local storage
  if (!isS3Available || !s3Client) {
    logger.info('Using local filesystem storage for upload', { filename, prefix });
    return localStorage.uploadFileLocal(options);
  }

  const fileKey = generateFileKey(filename, prefix);
  const checksum = calculateChecksum(buffer);

  // Prepare tags string
  const tagString = tags
    ? Object.entries(tags)
        .map(([k, v]) => `${k}=${v}`)
        .join('&')
    : undefined;

  try {
    const upload = new Upload({
      client: s3Client,
      params: {
        Bucket: BUCKET_NAME,
        Key: fileKey,
        Body: buffer,
        ContentType: mimeType,
        Metadata: {
          ...metadata,
          checksum,
          originalFilename: filename,
        },
        Tagging: tagString,
      },
    });

    await upload.done();

    const url = CDN_URL
      ? `${CDN_URL}/${fileKey}`
      : `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION || 'us-east-1'}.amazonaws.com/${fileKey}`;

    logger.info('File uploaded to S3', { fileKey, size: buffer.length });

    return {
      fileKey,
      bucket: BUCKET_NAME,
      size: buffer.length,
      checksum,
      url,
    };
  } catch (error) {
    logger.error('S3 upload failed, falling back to local storage', {
      filename,
      error: error instanceof Error ? error.message : 'Unknown error',
    });

    // Fallback to local storage on S3 error
    return localStorage.uploadFileLocal(options);
  }
};

// Upload multiple files in parallel
export const uploadFiles = async (
  files: UploadOptions[]
): Promise<UploadResult[]> => {
  return Promise.all(files.map(uploadFile));
};

// Get file from S3
export const getFile = async (fileKey: string): Promise<Buffer> => {
  // If S3 is not available, use local storage
  if (!isS3Available || !s3Client) {
    logger.debug('Using local filesystem storage for file retrieval', { fileKey });
    return localStorage.getFileLocal(fileKey);
  }

  try {
    const command = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: fileKey,
    });

    const response = await s3Client.send(command);

    if (!response.Body) {
      throw new Error('No file body returned');
    }

    // Convert stream to buffer
    const chunks: Uint8Array[] = [];
    // @ts-expect-error - AWS SDK types are complex
    for await (const chunk of response.Body) {
      chunks.push(chunk);
    }

    return Buffer.concat(chunks);
  } catch (error) {
    logger.error('S3 retrieval failed, falling back to local storage', {
      fileKey,
      error: error instanceof Error ? error.message : 'Unknown error',
    });

    // Fallback to local storage on S3 error
    return localStorage.getFileLocal(fileKey);
  }
};

// Get presigned URL for temporary access
export interface PresignedUrlOptions {
  fileKey: string;
  expiresIn?: number; // seconds, default 1 hour
  download?: boolean; // Force download instead of inline
  filename?: string; // Custom download filename
  publicAccess?: boolean; // Allow unauthenticated access (for share links)
}

export const getPresignedUrl = async (
  options: PresignedUrlOptions
): Promise<string> => {
  const {
    fileKey,
    expiresIn = 3600,
    download = false,
    filename,
    publicAccess = false,
  } = options;

  // If S3 is not available, use local storage URL
  if (!isS3Available || !s3Client) {
    logger.debug('Using local filesystem storage for URL generation', { fileKey });
    return localStorage.getSignedUrlLocal(fileKey, expiresIn, publicAccess);
  }

  try {
    const command = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: fileKey,
      ResponseContentDisposition: download
        ? `attachment${filename ? `; filename="${filename}"` : ''}`
        : undefined,
    });

    return await getSignedUrl(s3Client, command, { expiresIn });
  } catch (error) {
    logger.error('S3 presigned URL generation failed, falling back to local storage', {
      fileKey,
      error: error instanceof Error ? error.message : 'Unknown error',
    });

    // Fallback to local storage URL on S3 error
    return localStorage.getSignedUrlLocal(fileKey, expiresIn, publicAccess);
  }
};

// Get presigned upload URL (for direct browser uploads)
export const getPresignedUploadUrl = async (
  fileKey: string,
  mimeType: string,
  expiresIn = 300 // 5 minutes
): Promise<string> => {
  // Local storage doesn't support presigned upload URLs
  if (!isS3Available || !s3Client) {
    throw new Error('Presigned upload URLs are only supported with S3 storage');
  }

  try {
    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: fileKey,
      ContentType: mimeType,
    });

    return await getSignedUrl(s3Client, command, { expiresIn });
  } catch (error) {
    logger.error('S3 presigned upload URL generation failed', {
      fileKey,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    throw new Error(`Failed to generate presigned upload URL: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

// Delete file from S3
export const deleteFile = async (fileKey: string): Promise<void> => {
  // If S3 is not available, use local storage
  if (!isS3Available || !s3Client) {
    logger.debug('Using local filesystem storage for file deletion', { fileKey });
    return localStorage.deleteFileLocal(fileKey);
  }

  try {
    const command = new DeleteObjectCommand({
      Bucket: BUCKET_NAME,
      Key: fileKey,
    });

    await s3Client.send(command);
    logger.info('File deleted from S3', { fileKey });
  } catch (error) {
    logger.error('S3 deletion failed, falling back to local storage', {
      fileKey,
      error: error instanceof Error ? error.message : 'Unknown error',
    });

    // Fallback to local storage on S3 error
    return localStorage.deleteFileLocal(fileKey);
  }
};

// Delete multiple files
export const deleteFiles = async (fileKeys: string[]): Promise<void> => {
  await Promise.all(fileKeys.map(deleteFile));
};

// Copy file within S3
export const copyFile = async (
  sourceKey: string,
  destinationKey: string
): Promise<void> => {
  // Local storage doesn't support direct copy operations
  if (!isS3Available || !s3Client) {
    throw new Error('File copy is only supported with S3 storage');
  }

  try {
    const command = new CopyObjectCommand({
      Bucket: BUCKET_NAME,
      CopySource: `${BUCKET_NAME}/${sourceKey}`,
      Key: destinationKey,
    });

    await s3Client.send(command);
  } catch (error) {
    logger.error('S3 copy failed', {
      sourceKey,
      destinationKey,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    throw new Error(`Failed to copy file: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

// Check if file exists
export const fileExists = async (fileKey: string): Promise<boolean> => {
  // If S3 is not available, use local storage
  if (!isS3Available || !s3Client) {
    return localStorage.fileExistsLocal(fileKey);
  }

  try {
    const command = new HeadObjectCommand({
      Bucket: BUCKET_NAME,
      Key: fileKey,
    });

    await s3Client.send(command);
    return true;
  } catch (error) {
    // Try local storage as fallback
    return localStorage.fileExistsLocal(fileKey);
  }
};

// Get file metadata
export interface FileMetadata {
  size: number;
  contentType: string;
  lastModified: Date;
  metadata: Record<string, string>;
}

export const getFileMetadata = async (
  fileKey: string
): Promise<FileMetadata> => {
  // Local storage doesn't provide detailed metadata
  if (!isS3Available || !s3Client) {
    throw new Error('File metadata is only available with S3 storage');
  }

  try {
    const command = new HeadObjectCommand({
      Bucket: BUCKET_NAME,
      Key: fileKey,
    });

    const response = await s3Client.send(command);

    return {
      size: response.ContentLength || 0,
      contentType: response.ContentType || 'application/octet-stream',
      lastModified: response.LastModified || new Date(),
      metadata: response.Metadata || {},
    };
  } catch (error) {
    logger.error('S3 metadata retrieval failed', {
      fileKey,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    throw new Error(`Failed to get file metadata: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

// List files in a prefix
export interface ListFilesOptions {
  prefix?: string;
  maxKeys?: number;
  continuationToken?: string;
}

export interface ListFilesResult {
  files: Array<{
    key: string;
    size: number;
    lastModified: Date;
  }>;
  nextToken?: string;
  isTruncated: boolean;
}

export const listFiles = async (
  options: ListFilesOptions = {}
): Promise<ListFilesResult> => {
  const { prefix, maxKeys = 1000, continuationToken } = options;

  // If S3 is not available, use local storage
  if (!isS3Available || !s3Client) {
    const files = prefix ? await localStorage.listFilesLocal(prefix) : [];
    return {
      files: files.slice(0, maxKeys).map((key) => ({
        key,
        size: 0, // Local storage doesn't track size in list
        lastModified: new Date(),
      })),
      nextToken: undefined,
      isTruncated: false,
    };
  }

  try {
    const command = new ListObjectsV2Command({
      Bucket: BUCKET_NAME,
      Prefix: prefix,
      MaxKeys: maxKeys,
      ContinuationToken: continuationToken,
    });

    const response = await s3Client.send(command);

    return {
      files: (response.Contents || []).map((item) => ({
        key: item.Key || '',
        size: item.Size || 0,
        lastModified: item.LastModified || new Date(),
      })),
      nextToken: response.NextContinuationToken,
      isTruncated: response.IsTruncated || false,
    };
  } catch (error) {
    logger.error('S3 list files failed', {
      prefix,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    throw new Error(`Failed to list files: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

// Get public URL for a file (if bucket/CloudFront is public)
export const getPublicUrl = (fileKey: string): string => {
  if (CDN_URL) {
    return `${CDN_URL}/${fileKey}`;
  }
  return `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION || 'us-east-1'}.amazonaws.com/${fileKey}`;
};

// Batch upload with progress tracking
export interface BatchUploadProgress {
  total: number;
  completed: number;
  failed: number;
  results: Array<UploadResult | Error>;
}

export const batchUpload = async (
  files: UploadOptions[],
  onProgress?: (progress: BatchUploadProgress) => void
): Promise<BatchUploadProgress> => {
  const progress: BatchUploadProgress = {
    total: files.length,
    completed: 0,
    failed: 0,
    results: [],
  };

  for (const file of files) {
    try {
      const result = await uploadFile(file);
      progress.results.push(result);
      progress.completed++;
    } catch (error) {
      progress.results.push(error as Error);
      progress.failed++;
    }

    onProgress?.(progress);
  }

  return progress;
};
