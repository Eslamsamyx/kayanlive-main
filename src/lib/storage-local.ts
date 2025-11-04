/**
 * Local Filesystem Storage Implementation
 *
 * Fallback storage backend when S3 is not available.
 * Stores files in the local filesystem and serves them via API routes.
 */

import { writeFile, readFile, unlink, mkdir, access } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import { createHash } from 'crypto';
import { nanoid } from 'nanoid';

// Storage directory - in public for Next.js static serving
const STORAGE_ROOT = path.join(process.cwd(), 'public', 'uploads');

// Ensure storage directory exists
async function ensureStorageDir(): Promise<void> {
  if (!existsSync(STORAGE_ROOT)) {
    await mkdir(STORAGE_ROOT, { recursive: true });
  }
}

// Generate unique file key with date-based organization (same as S3)
export const generateFileKeyLocal = (
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
export const calculateChecksumLocal = (buffer: Buffer): string => {
  return createHash('md5').update(buffer).digest('hex');
};

// Get absolute file path from file key
const getAbsolutePath = (fileKey: string): string => {
  return path.join(STORAGE_ROOT, fileKey);
};

// Upload file to local filesystem
export interface UploadOptionsLocal {
  buffer: Buffer;
  filename: string;
  mimeType: string;
  prefix?: string;
  metadata?: Record<string, string>;
  tags?: Record<string, string>;
}

export interface UploadResultLocal {
  fileKey: string;
  bucket: string;
  size: number;
  checksum: string;
  url: string;
}

export const uploadFileLocal = async (
  options: UploadOptionsLocal
): Promise<UploadResultLocal> => {
  const { buffer, filename, mimeType, prefix = 'assets' } = options;

  // Ensure storage directory exists
  await ensureStorageDir();

  const fileKey = generateFileKeyLocal(filename, prefix);
  const absolutePath = getAbsolutePath(fileKey);
  const checksum = calculateChecksumLocal(buffer);

  // Create directory structure if needed
  const dir = path.dirname(absolutePath);
  if (!existsSync(dir)) {
    await mkdir(dir, { recursive: true });
  }

  // Write file to filesystem
  await writeFile(absolutePath, buffer);

  // Generate URL for accessing the file
  const url = `/api/files/${fileKey}`;

  return {
    fileKey,
    bucket: 'local-filesystem',
    size: buffer.length,
    checksum,
    url,
  };
};

// Get file from local filesystem
export const getFileLocal = async (fileKey: string): Promise<Buffer> => {
  const absolutePath = getAbsolutePath(fileKey);

  try {
    await access(absolutePath);
  } catch (error) {
    throw new Error(`File not found: ${fileKey}`);
  }

  return await readFile(absolutePath);
};

// Delete file from local filesystem
export const deleteFileLocal = async (fileKey: string): Promise<void> => {
  const absolutePath = getAbsolutePath(fileKey);

  try {
    await unlink(absolutePath);
  } catch (error) {
    // Ignore errors if file doesn't exist
    if ((error as any).code !== 'ENOENT') {
      throw error;
    }
  }
};

// Get signed URL (for local files, just return the API route)
export const getSignedUrlLocal = async (
  fileKey: string,
  expiresIn: number = 3600,
  publicAccess: boolean = false
): Promise<string> => {
  // For public share links, use the public files endpoint
  if (publicAccess) {
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    return `${baseUrl}/api/files/public/${fileKey}`;
  }

  // For authenticated access, use the protected files endpoint
  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
  return `${baseUrl}/api/files/${fileKey}`;
};

// List files in a directory (local equivalent of S3 list)
export const listFilesLocal = async (prefix: string): Promise<string[]> => {
  const dirPath = path.join(STORAGE_ROOT, prefix);

  if (!existsSync(dirPath)) {
    return [];
  }

  // Simple implementation - can be enhanced with recursive listing
  const { readdir } = await import('fs/promises');
  const files = await readdir(dirPath, { withFileTypes: true });

  return files
    .filter((file) => file.isFile())
    .map((file) => path.join(prefix, file.name));
};

// Check if a file exists
export const fileExistsLocal = async (fileKey: string): Promise<boolean> => {
  const absolutePath = getAbsolutePath(fileKey);
  try {
    await access(absolutePath);
    return true;
  } catch {
    return false;
  }
};

// Get storage info
export const getStorageInfo = () => {
  return {
    type: 'local-filesystem',
    root: STORAGE_ROOT,
    available: true,
  };
};
