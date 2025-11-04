import sharp from 'sharp';
import ffmpeg from 'fluent-ffmpeg';
import { createWriteStream, createReadStream, unlinkSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';
import { nanoid } from 'nanoid';
import { uploadFile, type UploadResult } from './s3';

// Image processing configurations
const IMAGE_VARIANTS = {
  THUMBNAIL: { width: 200, height: 200, quality: 80 },
  PREVIEW: { width: 800, height: 800, quality: 85 },
  WEB_OPTIMIZED: { width: 1920, height: 1920, quality: 90 },
  MOBILE: { width: 640, height: 640, quality: 80 },
} as const;

// Video processing configurations
const VIDEO_VARIANTS = {
  THUMBNAIL: { width: 640, height: 360, time: '00:00:01' },
  PREVIEW: { width: 1280, height: 720, time: '00:00:01' },
} as const;

// Image metadata extraction
export interface ImageMetadata {
  width: number;
  height: number;
  format: string;
  colorSpace?: string;
  hasAlpha: boolean;
  orientation?: number;
  dpi?: number;
  // EXIF data
  camera?: string;
  lens?: string;
  iso?: number;
  aperture?: number;
  shutterSpeed?: string;
  gpsLat?: number;
  gpsLng?: number;
}

export const extractImageMetadata = async (
  buffer: Buffer
): Promise<ImageMetadata> => {
  try {
    const image = sharp(buffer);
    const metadata = await image.metadata();
    const exif = metadata.exif ? parseExif(metadata.exif) : {};

    return {
      width: metadata.width || 0,
      height: metadata.height || 0,
      format: metadata.format || 'unknown',
      colorSpace: metadata.space,
      hasAlpha: metadata.hasAlpha || false,
      orientation: metadata.orientation,
      dpi: metadata.density,
      ...exif,
    };
  } catch (error) {
    console.error('Image metadata extraction error:', error);
    throw new Error(`Failed to extract image metadata: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

// Parse EXIF data
function parseExif(exifBuffer: Buffer): Partial<ImageMetadata> {
  // This is a simplified version - in production, use a proper EXIF parser library
  const exif: Partial<ImageMetadata> = {};

  try {
    const exifData = JSON.parse(exifBuffer.toString());

    if (exifData.Make && exifData.Model) {
      exif.camera = `${exifData.Make} ${exifData.Model}`;
    }

    if (exifData.LensModel) {
      exif.lens = exifData.LensModel;
    }

    if (exifData.ISO) {
      exif.iso = parseInt(exifData.ISO);
    }

    if (exifData.FNumber) {
      exif.aperture = parseFloat(exifData.FNumber);
    }

    if (exifData.ExposureTime) {
      exif.shutterSpeed = exifData.ExposureTime;
    }

    if (exifData.GPSLatitude && exifData.GPSLongitude) {
      exif.gpsLat = parseFloat(exifData.GPSLatitude);
      exif.gpsLng = parseFloat(exifData.GPSLongitude);
    }
  } catch (error) {
    console.warn('EXIF parsing error:', error);
  }

  return exif;
}

// Generate image variants
export interface ImageVariantOptions {
  buffer: Buffer;
  originalFilename: string;
  variants?: Array<keyof typeof IMAGE_VARIANTS>;
}

export interface ImageVariant {
  type: keyof typeof IMAGE_VARIANTS;
  fileKey: string;
  width: number;
  height: number;
  fileSize: number;
  format: string;
  quality: number;
}

export const generateImageVariants = async (
  options: ImageVariantOptions
): Promise<ImageVariant[]> => {
  const { buffer, originalFilename, variants = Object.keys(IMAGE_VARIANTS) as Array<keyof typeof IMAGE_VARIANTS> } = options;

  const results: ImageVariant[] = [];

  for (const variantType of variants) {
    try {
      const config = IMAGE_VARIANTS[variantType];

      const processedBuffer = await sharp(buffer)
        .resize(config.width, config.height, {
          fit: 'inside',
          withoutEnlargement: true,
        })
        .jpeg({ quality: config.quality, progressive: true })
        .toBuffer();

      const metadata = await sharp(processedBuffer).metadata();

      const uploadResult = await uploadFile({
        buffer: processedBuffer,
        filename: originalFilename,
        mimeType: 'image/jpeg',
        prefix: `variants/${variantType.toLowerCase()}`,
      });

      results.push({
        type: variantType,
        fileKey: uploadResult.fileKey,
        width: metadata.width || 0,
        height: metadata.height || 0,
        fileSize: processedBuffer.length,
        format: 'jpeg',
        quality: config.quality,
      });
    } catch (error) {
      console.error(`Failed to generate ${variantType} variant:`, error);
    }
  }

  return results;
};

// Generate thumbnail from image
export const generateImageThumbnail = async (
  buffer: Buffer,
  originalFilename: string
): Promise<UploadResult> => {
  try {
    const thumbnailBuffer = await sharp(buffer)
      .resize(200, 200, {
        fit: 'cover',
        position: 'center',
      })
      .jpeg({ quality: 80, progressive: true })
      .toBuffer();

    return await uploadFile({
      buffer: thumbnailBuffer,
      filename: originalFilename,
      mimeType: 'image/jpeg',
      prefix: 'thumbnails',
    });
  } catch (error) {
    console.error('Thumbnail generation error:', error);
    throw new Error(`Failed to generate thumbnail: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

// Video metadata extraction
export interface VideoMetadata {
  width: number;
  height: number;
  duration: number; // seconds
  format: string;
  codec?: string;
  frameRate?: number;
  bitRate?: number;
  audioCodec?: string;
  audioBitRate?: number;
}

export const extractVideoMetadata = async (
  filePath: string
): Promise<VideoMetadata> => {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(filePath, (err, metadata) => {
      if (err) {
        reject(new Error(`Failed to extract video metadata: ${err.message}`));
        return;
      }

      const videoStream = metadata.streams.find(s => s.codec_type === 'video');
      const audioStream = metadata.streams.find(s => s.codec_type === 'audio');

      if (!videoStream) {
        reject(new Error('No video stream found'));
        return;
      }

      resolve({
        width: videoStream.width || 0,
        height: videoStream.height || 0,
        duration: metadata.format.duration || 0,
        format: metadata.format.format_name || 'unknown',
        codec: videoStream.codec_name,
        frameRate: videoStream.r_frame_rate ? eval(videoStream.r_frame_rate) : undefined,
        bitRate: metadata.format.bit_rate ? Number(metadata.format.bit_rate) : undefined,
        audioCodec: audioStream?.codec_name,
        audioBitRate: audioStream?.bit_rate ? Number(audioStream.bit_rate) : undefined,
      });
    });
  });
};

// Generate video thumbnail
export const generateVideoThumbnail = async (
  videoBuffer: Buffer,
  originalFilename: string
): Promise<UploadResult> => {
  const tempVideoPath = join(tmpdir(), `${nanoid()}.mp4`);
  const tempThumbnailPath = join(tmpdir(), `${nanoid()}.jpg`);

  try {
    // Write video buffer to temp file
    await new Promise<void>((resolve, reject) => {
      const stream = createWriteStream(tempVideoPath);
      stream.write(videoBuffer);
      stream.end(() => resolve());
      stream.on('error', reject);
    });

    // Extract thumbnail at 1 second
    await new Promise<void>((resolve, reject) => {
      ffmpeg(tempVideoPath)
        .screenshots({
          timestamps: ['00:00:01'],
          filename: tempThumbnailPath,
          size: '640x360',
        })
        .on('end', () => resolve())
        .on('error', (err) => reject(err));
    });

    // Read thumbnail and upload
    const thumbnailBuffer = await new Promise<Buffer>((resolve, reject) => {
      const chunks: Buffer[] = [];
      createReadStream(tempThumbnailPath)
        .on('data', (chunk) => chunks.push(chunk as Buffer))
        .on('end', () => resolve(Buffer.concat(chunks)))
        .on('error', reject);
    });

    const result = await uploadFile({
      buffer: thumbnailBuffer,
      filename: originalFilename,
      mimeType: 'image/jpeg',
      prefix: 'thumbnails/video',
    });

    return result;
  } catch (error) {
    console.error('Video thumbnail generation error:', error);
    throw new Error(`Failed to generate video thumbnail: ${error instanceof Error ? error.message : 'Unknown error'}`);
  } finally {
    // Cleanup temp files
    try {
      unlinkSync(tempVideoPath);
      unlinkSync(tempThumbnailPath);
    } catch (error) {
      // Ignore cleanup errors
    }
  }
};

// Generate video preview (short clip)
export interface VideoPreviewOptions {
  videoBuffer: Buffer;
  originalFilename: string;
  duration?: number; // seconds, default 5
  startTime?: string; // format: '00:00:01'
}

export const generateVideoPreview = async (
  options: VideoPreviewOptions
): Promise<UploadResult> => {
  const { videoBuffer, originalFilename, duration = 5, startTime = '00:00:00' } = options;

  const tempVideoPath = join(tmpdir(), `${nanoid()}.mp4`);
  const tempPreviewPath = join(tmpdir(), `${nanoid()}-preview.mp4`);

  try {
    // Write video buffer to temp file
    await new Promise<void>((resolve, reject) => {
      const stream = createWriteStream(tempVideoPath);
      stream.write(videoBuffer);
      stream.end(() => resolve());
      stream.on('error', reject);
    });

    // Generate preview clip
    await new Promise<void>((resolve, reject) => {
      ffmpeg(tempVideoPath)
        .setStartTime(startTime)
        .setDuration(duration)
        .output(tempPreviewPath)
        .videoCodec('libx264')
        .size('1280x720')
        .on('end', () => resolve())
        .on('error', (err) => reject(err))
        .run();
    });

    // Read preview and upload
    const previewBuffer = await new Promise<Buffer>((resolve, reject) => {
      const chunks: Buffer[] = [];
      createReadStream(tempPreviewPath)
        .on('data', (chunk) => chunks.push(chunk as Buffer))
        .on('end', () => resolve(Buffer.concat(chunks)))
        .on('error', reject);
    });

    const result = await uploadFile({
      buffer: previewBuffer,
      filename: originalFilename,
      mimeType: 'video/mp4',
      prefix: 'previews/video',
    });

    return result;
  } catch (error) {
    console.error('Video preview generation error:', error);
    throw new Error(`Failed to generate video preview: ${error instanceof Error ? error.message : 'Unknown error'}`);
  } finally {
    // Cleanup temp files
    try {
      unlinkSync(tempVideoPath);
      unlinkSync(tempPreviewPath);
    } catch (error) {
      // Ignore cleanup errors
    }
  }
};

// Optimize image for web
export interface OptimizeImageOptions {
  buffer: Buffer;
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  format?: 'jpeg' | 'png' | 'webp';
}

export const optimizeImage = async (
  options: OptimizeImageOptions
): Promise<Buffer> => {
  const {
    buffer,
    maxWidth = 1920,
    maxHeight = 1920,
    quality = 85,
    format = 'jpeg',
  } = options;

  try {
    let pipeline = sharp(buffer).resize(maxWidth, maxHeight, {
      fit: 'inside',
      withoutEnlargement: true,
    });

    switch (format) {
      case 'jpeg':
        pipeline = pipeline.jpeg({ quality, progressive: true });
        break;
      case 'png':
        pipeline = pipeline.png({ quality, compressionLevel: 9 });
        break;
      case 'webp':
        pipeline = pipeline.webp({ quality });
        break;
    }

    return await pipeline.toBuffer();
  } catch (error) {
    console.error('Image optimization error:', error);
    throw new Error(`Failed to optimize image: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

// Audio metadata extraction
export interface AudioMetadata {
  duration: number; // seconds
  format: string;
  codec?: string;
  bitRate?: number;
  sampleRate?: number;
  channels?: number;
}

export const extractAudioMetadata = async (
  filePath: string
): Promise<AudioMetadata> => {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(filePath, (err, metadata) => {
      if (err) {
        reject(new Error(`Failed to extract audio metadata: ${err.message}`));
        return;
      }

      const audioStream = metadata.streams.find(s => s.codec_type === 'audio');

      if (!audioStream) {
        reject(new Error('No audio stream found'));
        return;
      }

      resolve({
        duration: metadata.format.duration || 0,
        format: metadata.format.format_name || 'unknown',
        codec: audioStream.codec_name,
        bitRate: audioStream.bit_rate ? Number(audioStream.bit_rate) : undefined,
        sampleRate: audioStream.sample_rate ? Number(audioStream.sample_rate) : undefined,
        channels: audioStream.channels,
      });
    });
  });
};
