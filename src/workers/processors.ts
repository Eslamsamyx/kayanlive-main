import type { Job } from 'bull';
import { PrismaClient, VariantType, NotificationType } from '@prisma/client';
import {
  type AssetProcessingJob,
  type ThumbnailJob,
  type VariantJob,
  type EmailJob,
  type NotificationJob,
  type AnalyticsJob,
  type CleanupJob,
} from '@/lib/queue';
import { sendTemplateEmail, sendEmail } from '@/lib/email';
import { getFile, uploadFile, deleteFile, type UploadResult } from '@/lib/s3';
import { logger } from '@/lib/logger';
import sharp from 'sharp';
import ffmpeg from 'fluent-ffmpeg';
import ffmpegStatic from 'ffmpeg-static';
import { promisify } from 'util';
import { writeFile, unlink, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import os from 'os';

// Configure ffmpeg to use the static binary
if (ffmpegStatic) {
  ffmpeg.setFfmpegPath(ffmpegStatic);
}

const prisma = new PrismaClient();

// =============================================================================
// ASSET PROCESSING PROCESSOR
// =============================================================================

export const processAssetProcessing = async (
  job: Job<AssetProcessingJob>
): Promise<void> => {
  const { assetId, fileKey, fileType, mimeType } = job.data;

  logger.logAssetProcessing(assetId, 'processing', 'started', { fileType, mimeType });

  try {
    // Update processing status
    await prisma.asset.update({
      where: { id: assetId },
      data: { processingStatus: 'PROCESSING' },
    });

    // Process based on file type
    switch (fileType) {
      case 'IMAGE':
        await processImage(assetId, fileKey, mimeType);
        break;
      case 'VIDEO':
        await processVideo(assetId, fileKey, mimeType);
        break;
      case 'AUDIO':
        await processAudio(assetId, fileKey, mimeType);
        break;
      case 'DOCUMENT':
        await processDocument(assetId, fileKey, mimeType);
        break;
      default:
        logger.info(`No specific processing for ${fileType}`, { assetId, fileType });
    }

    // Update status to completed
    await prisma.asset.update({
      where: { id: assetId },
      data: {
        processingStatus: 'COMPLETED',
      },
    });

    logger.logAssetProcessing(assetId, 'processing', 'completed', { fileType });
  } catch (error) {
    logger.logAssetProcessing(assetId, 'processing', 'failed', {
      fileType,
      error: error instanceof Error ? error.message : 'Unknown error'
    });

    await prisma.asset.update({
      where: { id: assetId },
      data: { processingStatus: 'FAILED' },
    });

    throw error;
  }
};

// Process image file
const processImage = async (
  assetId: string,
  fileKey: string,
  mimeType: string
): Promise<void> => {
  const fileBuffer = await getFile(fileKey);
  const image = sharp(fileBuffer);
  const metadata = await image.metadata();

  // Update asset with image metadata
  await prisma.asset.update({
    where: { id: assetId },
    data: {
      width: metadata.width,
      height: metadata.height,
    },
  });
};

// Process video file
const processVideo = async (
  assetId: string,
  fileKey: string,
  mimeType: string
): Promise<void> => {
  const tmpDir = path.join(os.tmpdir(), 'video-processing');
  if (!existsSync(tmpDir)) {
    await mkdir(tmpDir, { recursive: true });
  }

  const tmpFilePath = path.join(tmpDir, `${assetId}-${Date.now()}.mp4`);

  try {
    // Download file from S3 to temp location
    const fileBuffer = await getFile(fileKey);
    await writeFile(tmpFilePath, fileBuffer);

    // Extract video metadata using ffprobe
    const metadata = await new Promise<{
      duration: number;
      width: number;
      height: number;
      codec: string;
      bitrate: number;
    }>((resolve, reject) => {
      ffmpeg.ffprobe(tmpFilePath, (err, metadata) => {
        if (err) {
          reject(err);
          return;
        }

        const videoStream = metadata.streams.find(
          (stream) => stream.codec_type === 'video'
        );

        if (!videoStream) {
          reject(new Error('No video stream found'));
          return;
        }

        resolve({
          duration: Math.round(metadata.format.duration || 0),
          width: videoStream.width || 0,
          height: videoStream.height || 0,
          codec: videoStream.codec_name || 'unknown',
          bitrate: Math.round((metadata.format.bit_rate || 0) / 1000), // Convert to kbps
        });
      });
    });

    // Update asset with video metadata
    await prisma.asset.update({
      where: { id: assetId },
      data: {
        width: metadata.width,
        height: metadata.height,
        duration: metadata.duration,
        metadata: {
          codec: metadata.codec,
          bitrate: metadata.bitrate,
        },
      },
    });

    logger.logAssetProcessing(assetId, 'video-metadata-extraction', 'completed', {
      width: metadata.width,
      height: metadata.height,
      duration: metadata.duration,
      codec: metadata.codec,
      bitrate: metadata.bitrate,
    });
  } finally {
    // Clean up temp file
    try {
      await unlink(tmpFilePath);
    } catch (err) {
      logger.warn('Failed to delete temp file', { tmpFilePath, error: err instanceof Error ? err.message : 'Unknown error' });
    }
  }
};

// Process audio file
const processAudio = async (
  assetId: string,
  fileKey: string,
  mimeType: string
): Promise<void> => {
  const tmpDir = path.join(os.tmpdir(), 'audio-processing');
  if (!existsSync(tmpDir)) {
    await mkdir(tmpDir, { recursive: true });
  }

  const tmpFilePath = path.join(tmpDir, `${assetId}-${Date.now()}.mp3`);

  try {
    // Download file from S3 to temp location
    const fileBuffer = await getFile(fileKey);
    await writeFile(tmpFilePath, fileBuffer);

    // Extract audio metadata using ffprobe
    const metadata = await new Promise<{
      duration: number;
      bitrate: number;
      channels: number;
      sampleRate: number;
      codec: string;
    }>((resolve, reject) => {
      ffmpeg.ffprobe(tmpFilePath, (err, metadata) => {
        if (err) {
          reject(err);
          return;
        }

        const audioStream = metadata.streams.find(
          (stream) => stream.codec_type === 'audio'
        );

        if (!audioStream) {
          reject(new Error('No audio stream found'));
          return;
        }

        resolve({
          duration: Math.round(metadata.format.duration || 0),
          bitrate: Math.round((metadata.format.bit_rate || 0) / 1000), // Convert to kbps
          channels: audioStream.channels || 0,
          sampleRate: audioStream.sample_rate ? parseInt(audioStream.sample_rate.toString()) : 0,
          codec: audioStream.codec_name || 'unknown',
        });
      });
    });

    // Update asset with audio metadata
    await prisma.asset.update({
      where: { id: assetId },
      data: {
        duration: metadata.duration,
        metadata: {
          codec: metadata.codec,
          bitrate: metadata.bitrate,
          channels: metadata.channels,
          sampleRate: metadata.sampleRate,
        },
      },
    });

    logger.logAssetProcessing(assetId, 'audio-metadata-extraction', 'completed', {
      duration: metadata.duration,
      bitrate: metadata.bitrate,
      channels: metadata.channels,
      sampleRate: metadata.sampleRate,
      codec: metadata.codec,
    });
  } finally {
    // Clean up temp file
    try {
      await unlink(tmpFilePath);
    } catch (err) {
      logger.warn('Failed to delete temp file', { tmpFilePath, error: err instanceof Error ? err.message : 'Unknown error' });
    }
  }
};

// Process document file
const processDocument = async (
  assetId: string,
  fileKey: string,
  mimeType: string
): Promise<void> => {
  try {
    // Get file buffer for size calculation
    const fileBuffer = await getFile(fileKey);

    // Store basic document metadata
    // Note: For advanced PDF processing (page count, text extraction),
    // consider adding pdf-parse library: npm install pdf-parse
    const metadata: Record<string, any> = {
      mimeType,
      processedAt: new Date().toISOString(),
    };

    // Update asset with document metadata
    await prisma.asset.update({
      where: { id: assetId },
      data: {
        metadata: metadata,
      },
    });

    logger.logAssetProcessing(assetId, 'document-processing', 'completed', {
      mimeType,
      size: fileBuffer.length,
    });
  } catch (error) {
    logger.logAssetProcessing(assetId, 'document-processing', 'failed', {
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    throw error;
  }
};

// =============================================================================
// THUMBNAIL GENERATION PROCESSOR
// =============================================================================

export const processThumbnailGeneration = async (
  job: Job<ThumbnailJob>
): Promise<void> => {
  const { assetId, fileKey, fileType } = job.data;

  logger.logAssetProcessing(assetId, 'thumbnail-generation', 'started', { fileType });

  try {
    if (fileType === 'IMAGE') {
      await generateImageThumbnail(assetId, fileKey);
    } else if (fileType === 'VIDEO') {
      await generateVideoThumbnail(assetId, fileKey);
    }

    logger.logAssetProcessing(assetId, 'thumbnail-generation', 'completed', { fileType });
  } catch (error) {
    logger.logAssetProcessing(assetId, 'thumbnail-generation', 'failed', {
      fileType,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    throw error;
  }
};

// Generate image thumbnail
const generateImageThumbnail = async (
  assetId: string,
  fileKey: string
): Promise<void> => {
  const fileBuffer = await getFile(fileKey);

  const thumbnailBuffer = await sharp(fileBuffer)
    .resize(200, 200, {
      fit: 'inside',
      withoutEnlargement: true,
    })
    .jpeg({ quality: 80 })
    .toBuffer();

  const thumbnailFilename = fileKey.replace(/\.[^.]+$/, '-thumb.jpg');

  const uploadResult = await uploadFile({
    buffer: thumbnailBuffer,
    filename: thumbnailFilename,
    mimeType: 'image/jpeg',
    prefix: 'thumbnails',
  });

  await prisma.asset.update({
    where: { id: assetId },
    data: {
      thumbnailKey: uploadResult.fileKey || thumbnailFilename,
      thumbnailPath: uploadResult.url,
    },
  });
};

// Generate video thumbnail
const generateVideoThumbnail = async (
  assetId: string,
  fileKey: string
): Promise<void> => {
  const tmpDir = path.join(os.tmpdir(), 'video-thumbnails');
  if (!existsSync(tmpDir)) {
    await mkdir(tmpDir, { recursive: true });
  }

  const tmpVideoPath = path.join(tmpDir, `${assetId}-${Date.now()}.mp4`);
  const tmpThumbPath = path.join(tmpDir, `${assetId}-thumb.jpg`);

  try {
    // Download video from S3
    const fileBuffer = await getFile(fileKey);
    await writeFile(tmpVideoPath, fileBuffer);

    // Generate thumbnail at 2 seconds (or 10% of duration, whichever is smaller)
    await new Promise<void>((resolve, reject) => {
      ffmpeg(tmpVideoPath)
        .screenshots({
          timestamps: ['2'],
          filename: path.basename(tmpThumbPath),
          folder: path.dirname(tmpThumbPath),
          size: '320x240',
        })
        .on('end', () => resolve())
        .on('error', (err) => reject(err));
    });

    // Read the generated thumbnail
    const thumbnailBuffer = await import('fs/promises').then((fs) =>
      fs.readFile(tmpThumbPath)
    );

    // Optimize thumbnail with sharp
    const optimizedThumb = await sharp(thumbnailBuffer)
      .resize(200, 200, {
        fit: 'inside',
        withoutEnlargement: true,
      })
      .jpeg({ quality: 80 })
      .toBuffer();

    // Upload to S3
    const thumbnailFilename = fileKey.replace(/\.[^.]+$/, '-thumb.jpg');
    const uploadResult = await uploadFile({
      buffer: optimizedThumb,
      filename: thumbnailFilename,
      mimeType: 'image/jpeg',
      prefix: 'thumbnails',
    });

    // Update asset with thumbnail info
    await prisma.asset.update({
      where: { id: assetId },
      data: {
        thumbnailKey: uploadResult.fileKey || thumbnailFilename,
        thumbnailPath: uploadResult.url,
      },
    });

    logger.debug(`Video thumbnail generated for ${assetId}`);
  } finally {
    // Clean up temp files
    try {
      await unlink(tmpVideoPath);
    } catch (err) {
      logger.warn('Failed to delete temp video file', { error: err instanceof Error ? err.message : 'Unknown error' });
    }
    try {
      await unlink(tmpThumbPath);
    } catch (err) {
      // Thumb file may not exist if ffmpeg failed
    }
  }
};

// =============================================================================
// VARIANT GENERATION PROCESSOR
// =============================================================================

export const processVariantGeneration = async (
  job: Job<VariantJob>
): Promise<void> => {
  const { assetId, fileKey, fileType, variants } = job.data;

  logger.logAssetProcessing(assetId, 'variant-generation', 'started', {
    fileType,
    variants: variants.join(', ')
  });

  try {
    if (fileType === 'IMAGE') {
      await generateImageVariants(assetId, fileKey, variants);
    } else if (fileType === 'VIDEO') {
      await generateVideoVariants(assetId, fileKey, variants);
    }

    logger.logAssetProcessing(assetId, 'variant-generation', 'completed', { fileType, variants });
  } catch (error) {
    logger.logAssetProcessing(assetId, 'variant-generation', 'failed', {
      fileType,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    throw error;
  }
};

// Generate image variants
const generateImageVariants = async (
  assetId: string,
  fileKey: string,
  variants: string[]
): Promise<void> => {
  const fileBuffer = await getFile(fileKey);

  const variantSizes: Record<string, { width: number; height: number; quality: number }> = {
    THUMBNAIL: { width: 200, height: 200, quality: 80 },
    PREVIEW: { width: 800, height: 600, quality: 85 },
    WEB_OPTIMIZED: { width: 1920, height: 1080, quality: 85 },
    MOBILE: { width: 640, height: 480, quality: 80 },
  };

  for (const variantType of variants) {
    const config = variantSizes[variantType];
    if (!config) continue;

    const variantBuffer = await sharp(fileBuffer)
      .resize(config.width, config.height, {
        fit: 'inside',
        withoutEnlargement: true,
      })
      .jpeg({ quality: config.quality })
      .toBuffer();

    const variantFilename = fileKey.replace(
      /\.[^.]+$/,
      `-${variantType.toLowerCase()}.jpg`
    );

    const uploadResult = await uploadFile({
      buffer: variantBuffer,
      filename: variantFilename,
      mimeType: 'image/jpeg',
      prefix: 'variants',
    });

    await prisma.assetVariant.create({
      data: {
        assetId,
        variantType: variantType as VariantType,
        fileKey: uploadResult.fileKey,
        url: uploadResult.url,
        fileSize: BigInt(uploadResult.size),
        width: config.width,
        height: config.height,
        format: 'jpeg',
        quality: config.quality,
        status: 'COMPLETED',
      },
    });
  }
};

// Generate video variants
const generateVideoVariants = async (
  assetId: string,
  fileKey: string,
  variants: string[]
): Promise<void> => {
  const tmpDir = path.join(os.tmpdir(), 'video-variants');
  if (!existsSync(tmpDir)) {
    await mkdir(tmpDir, { recursive: true });
  }

  const tmpInputPath = path.join(tmpDir, `${assetId}-input-${Date.now()}.mp4`);

  try {
    // Download source video from S3
    const fileBuffer = await getFile(fileKey);
    await writeFile(tmpInputPath, fileBuffer);

    // Define video variant configurations
    const variantConfigs: Record<
      string,
      { width: number; height: number; bitrate: string }
    > = {
      MOBILE: { width: 640, height: 480, bitrate: '500k' },
      PREVIEW: { width: 1280, height: 720, bitrate: '1500k' },
      WEB_OPTIMIZED: { width: 1920, height: 1080, bitrate: '3000k' },
    };

    for (const variantType of variants) {
      const config = variantConfigs[variantType];
      if (!config) continue;

      const tmpOutputPath = path.join(
        tmpDir,
        `${assetId}-${variantType.toLowerCase()}.mp4`
      );

      try {
        // Transcode video to variant resolution
        await new Promise<void>((resolve, reject) => {
          ffmpeg(tmpInputPath)
            .output(tmpOutputPath)
            .videoCodec('libx264')
            .audioCodec('aac')
            .size(`${config.width}x${config.height}`)
            .videoBitrate(config.bitrate)
            .audioBitrate('128k')
            .format('mp4')
            .outputOptions([
              '-preset fast',
              '-movflags +faststart', // Enable streaming
              '-pix_fmt yuv420p', // Compatibility
            ])
            .on('end', () => resolve())
            .on('error', (err) => reject(err))
            .run();
        });

        // Read the generated variant
        const variantBuffer = await import('fs/promises').then((fs) =>
          fs.readFile(tmpOutputPath)
        );

        // Upload variant to S3
        const variantFilename = fileKey.replace(
          /\.[^.]+$/,
          `-${variantType.toLowerCase()}.mp4`
        );

        const uploadResult = await uploadFile({
          buffer: variantBuffer,
          filename: variantFilename,
          mimeType: 'video/mp4',
          prefix: 'variants',
        });

        // Create variant record in database
        await prisma.assetVariant.create({
          data: {
            assetId,
            variantType: variantType as 'THUMBNAIL' | 'PREVIEW' | 'WEB_OPTIMIZED' | 'MOBILE',
            fileKey: uploadResult.fileKey || variantFilename,
            url: uploadResult.url,
            fileSize: BigInt(variantBuffer.length),
            width: config.width,
            height: config.height,
            format: 'mp4',
            status: 'COMPLETED',
          },
        });

        logger.debug(`Video variant ${variantType} generated for ${assetId}`);

        // Clean up variant temp file
        await unlink(tmpOutputPath);
      } catch (error) {
        logger.error(`Failed to generate ${variantType} variant`, { assetId, variantType, error: error instanceof Error ? error.message : 'Unknown error' });

        // Mark variant as failed in database
        await prisma.assetVariant.create({
          data: {
            assetId,
            variantType: variantType as 'THUMBNAIL' | 'PREVIEW' | 'WEB_OPTIMIZED' | 'MOBILE',
            fileKey: '',
            fileSize: BigInt(0),
            format: 'mp4',
            status: 'FAILED',
            error: error instanceof Error ? error.message : 'Unknown error',
          },
        });
      }
    }
  } finally {
    // Clean up source temp file
    try {
      await unlink(tmpInputPath);
    } catch (err) {
      logger.warn('Failed to delete temp input file', { error: err instanceof Error ? err.message : 'Unknown error' });
    }
  }
};

// =============================================================================
// EMAIL PROCESSOR
// =============================================================================

export const processEmail = async (job: Job<EmailJob>): Promise<void> => {
  const { to, subject, template, data, attachments } = job.data;

  logger.info('Sending email', { to, template: template || 'custom' });

  try {
    if (template) {
      await sendTemplateEmail({
        to,
        template,
        data,
        attachments,
      });
    } else {
      await sendEmail({
        to,
        subject,
        html: data.html,
        text: data.text,
        attachments,
      });
    }

    logger.info('Email sent successfully', { to });
  } catch (error) {
    logger.error('Failed to send email', { to }, error instanceof Error ? error : undefined);
    throw error;
  }
};

// =============================================================================
// NOTIFICATION PROCESSOR
// =============================================================================

export const processNotification = async (
  job: Job<NotificationJob>
): Promise<void> => {
  const { userId, type, title, message, data, projectId, taskId, milestoneId, meetingId } = job.data;

  logger.info('Creating notification', { userId, type, title });

  try {
    await prisma.notification.create({
      data: {
        userId,
        type: type as NotificationType,
        title,
        message,
        data: data ? JSON.parse(JSON.stringify(data)) : undefined,
        projectId,
        taskId,
        milestoneId,
        meetingId,
        read: false,
      },
    });

    logger.info('Notification created', { userId, type });
  } catch (error) {
    logger.error('Failed to create notification', { userId, type }, error instanceof Error ? error : undefined);
    throw error;
  }
};

// =============================================================================
// ANALYTICS PROCESSOR
// =============================================================================

export const processAnalytics = async (
  job: Job<AnalyticsJob>
): Promise<void> => {
  const { type, assetId, userId, data, timestamp } = job.data;

  logger.debug('Recording analytics event', { type, assetId, userId });

  try {
    switch (type) {
      case 'ASSET_VIEW':
        await recordAssetView(assetId!, userId, timestamp);
        break;
      case 'ASSET_DOWNLOAD':
        await recordAssetDownload(assetId!, userId, timestamp);
        break;
      case 'ASSET_SHARE':
        await recordAssetShare(assetId!, userId, data, timestamp);
        break;
      case 'SEARCH':
        await recordSearch(userId, data, timestamp);
        break;
      case 'ACTIVITY':
        await recordActivity(data, timestamp);
        break;
    }

    logger.debug('Analytics event recorded', { type });
  } catch (error) {
    logger.warn('Failed to record analytics event', { type, error: error instanceof Error ? error : undefined });
    // Don't throw - analytics failures shouldn't block the main flow
  }
};

const recordAssetView = async (
  assetId: string,
  userId: string | undefined,
  timestamp: Date
): Promise<void> => {
  // Record individual activity
  if (userId) {
    await prisma.assetActivity.create({
      data: {
        type: 'ASSET_VIEWED',
        description: 'Asset viewed',
        userId,
        assetId,
        createdAt: timestamp,
      },
    });
  }

  // Update daily analytics
  const date = new Date(timestamp);
  date.setHours(0, 0, 0, 0);

  await prisma.assetAnalytics.upsert({
    where: {
      assetId_date: {
        assetId,
        date,
      },
    },
    create: {
      assetId,
      date,
      views: 1,
      downloads: 0,
    },
    update: {
      views: {
        increment: 1,
      },
    },
  });
};

const recordAssetDownload = async (
  assetId: string,
  userId: string | undefined,
  timestamp: Date
): Promise<void> => {
  // Record individual activity
  if (userId) {
    await prisma.assetActivity.create({
      data: {
        type: 'ASSET_DOWNLOADED',
        description: 'Asset downloaded',
        userId,
        assetId,
        createdAt: timestamp,
      },
    });
  }

  // Update daily analytics
  const date = new Date(timestamp);
  date.setHours(0, 0, 0, 0);

  await prisma.assetAnalytics.upsert({
    where: {
      assetId_date: {
        assetId,
        date,
      },
    },
    create: {
      assetId,
      date,
      views: 0,
      downloads: 1,
    },
    update: {
      downloads: {
        increment: 1,
      },
    },
  });
};

const recordAssetShare = async (
  assetId: string,
  userId: string | undefined,
  data: Record<string, any>,
  timestamp: Date
): Promise<void> => {
  // Record individual activity
  if (userId) {
    await prisma.assetActivity.create({
      data: {
        type: 'ASSET_SHARED',
        description: 'Asset shared',
        userId,
        assetId,
        metadata: data ? JSON.parse(JSON.stringify(data)) : undefined,
        createdAt: timestamp,
      },
    });
  }
};

const recordSearch = async (
  userId: string | undefined,
  data: Record<string, any>,
  timestamp: Date
): Promise<void> => {
  if (userId) {
    await prisma.searchHistory.create({
      data: {
        userId,
        query: data.query as string,
        filters: data.filters ? JSON.parse(JSON.stringify(data.filters)) : undefined,
        resultCount: data.resultCount as number,
        createdAt: timestamp,
      },
    });
  }
};

const recordActivity = async (
  data: Record<string, any>,
  timestamp: Date
): Promise<void> => {
  // Generic activity logging
  logger.debug('Activity recorded', { data });
};

// =============================================================================
// CLEANUP PROCESSOR
// =============================================================================

export const processCleanup = async (
  job: Job<CleanupJob>
): Promise<void> => {
  const { type, data } = job.data;

  logger.info('Running cleanup job', { type });

  try {
    switch (type) {
      case 'EXPIRED_LINKS':
        await cleanupExpiredLinks();
        break;
      case 'OLD_VARIANTS':
        await cleanupOldVariants();
        break;
      case 'TEMP_FILES':
        await cleanupTempFiles();
        break;
      case 'OLD_ANALYTICS':
        await cleanupOldAnalytics();
        break;
    }

    logger.info('Cleanup job completed', { type });
  } catch (error) {
    logger.error('Cleanup job failed', { type }, error instanceof Error ? error : undefined);
    throw error;
  }
};

const cleanupExpiredLinks = async (): Promise<void> => {
  const now = new Date();

  // Deactivate expired share links
  const result = await prisma.assetShareLink.updateMany({
    where: {
      isActive: true,
      expiresAt: {
        lte: now,
      },
    },
    data: {
      isActive: false,
    },
  });

  logger.info('Deactivated expired share links', { count: result.count });
};

const cleanupOldVariants = async (): Promise<void> => {
  // Find variants for archived assets and remove them
  const deletedAssets = await prisma.asset.findMany({
    where: {
      isArchived: true,
    },
    select: {
      id: true,
      variants: {
        select: {
          fileKey: true,
        },
      },
    },
  });

  for (const asset of deletedAssets) {
    for (const variant of asset.variants) {
      try {
        await deleteFile(variant.fileKey);
      } catch (error) {
        logger.warn('Failed to delete variant', { fileKey: variant.fileKey, error: error instanceof Error ? error.message : 'Unknown error' });
      }
    }
  }

  logger.info('Cleaned up variants for deleted assets', { count: deletedAssets.length });
};

const cleanupTempFiles = async (): Promise<void> => {
  // Clean up temporary upload files older than 24 hours
  const cutoffDate = new Date();
  cutoffDate.setHours(cutoffDate.getHours() - 24);

  const result = await prisma.asset.deleteMany({
    where: {
      uploadStatus: 'PENDING',
      createdAt: {
        lte: cutoffDate,
      },
    },
  });

  logger.info('Cleaned up temporary files', { count: result.count });
};

const cleanupOldAnalytics = async (): Promise<void> => {
  // Delete analytics older than 1 year
  const cutoffDate = new Date();
  cutoffDate.setFullYear(cutoffDate.getFullYear() - 1);

  const result = await prisma.assetAnalytics.deleteMany({
    where: {
      date: {
        lte: cutoffDate,
      },
    },
  });

  logger.info('Deleted old analytics records', { count: result.count });
};

// =============================================================================
// ERROR HANDLING
// =============================================================================

export const handleJobError = (job: Job, error: Error): void => {
  logger.error('Job failed', {
    jobId: job.id,
    queue: job.queue.name,
    jobData: job.data,
    attempt: job.attemptsMade + 1,
  }, error);

  // Note: Enhanced error logging with database persistence could be added here
};

export const handleJobStalled = (job: Job): void => {
  logger.warn('Job stalled', {
    jobId: job.id,
    queue: job.queue.name,
    jobData: job.data,
  });
};

// Graceful shutdown handler
export const gracefulShutdown = async (): Promise<void> => {
  logger.info('Shutting down worker...');
  await prisma.$disconnect();
  logger.info('Worker shutdown complete');
};
