#!/usr/bin/env node

import fs from 'fs/promises';
import path from 'path';
import sharp from 'sharp';
import tinify from 'tinify';
import { glob } from 'glob';
import imagemin from 'imagemin';
import imageminWebp from 'imagemin-webp';

// Configuration
const IMAGE_SIZES = {
  thumbnail: { width: 150, height: 150 },
  small: { width: 320, height: 240 },
  medium: { width: 768, height: 576 },
  large: { width: 1200, height: 900 },
  hero: { width: 1920, height: 1080 },
  mobile: { width: 420, height: 280 },
};

const TINYPNG_API_KEY = process.env.TINYPNG_API_KEY || '';

interface ImageOptimizationOptions {
  inputDir: string;
  outputDir: string;
  useTinyPNG?: boolean;
  generateSizes?: boolean;
  convertToWebP?: boolean;
  quality?: number;
  forceReprocess?: boolean;
}

class ImageOptimizer {
  private processedImages: Set<string> = new Set();
  private processedHashes: Set<string> = new Set();
  private cacheFile = '.image-optimization-cache.json';
  private stats = {
    processed: 0,
    skipped: 0,
    errors: 0,
    totalSaved: 0,
  };

  constructor() {
    if (TINYPNG_API_KEY) {
      tinify.key = TINYPNG_API_KEY;
    }
    this.loadCache();
  }

  private async loadCache() {
    try {
      const cacheData = await fs.readFile(this.cacheFile, 'utf-8');
      const cache = JSON.parse(cacheData);
      this.processedHashes = new Set(cache.processedHashes || []);
      console.log(`📚 Loaded cache with ${this.processedHashes.size} processed images`);
    } catch (error) {
      // Cache doesn't exist yet, that's fine
      console.log('📝 Starting fresh optimization (no cache found)');
    }
  }

  private async saveCache() {
    const cache = {
      processedHashes: Array.from(this.processedHashes),
      lastRun: new Date().toISOString(),
      stats: this.stats
    };
    await fs.writeFile(this.cacheFile, JSON.stringify(cache, null, 2));
    console.log('💾 Cache saved');
  }

  private async getImageHash(imagePath: string): Promise<string> {
    const imageBuffer = await fs.readFile(imagePath);
    const crypto = require('crypto');
    const stats = await fs.stat(imagePath);
    // Create hash from file content, size, and modification time
    const hash = crypto
      .createHash('md5')
      .update(imageBuffer)
      .update(`${stats.size}-${stats.mtime.getTime()}`)
      .digest('hex');
    return hash;
  }

  async optimizeImages(options: ImageOptimizationOptions) {
    const {
      inputDir,
      outputDir,
      useTinyPNG = true,
      generateSizes = true,
      convertToWebP = true,
      quality = 85,
      forceReprocess = false,
    } = options;

    console.log('🚀 Starting image optimization...');
    console.log(`📁 Input directory: ${inputDir}`);
    console.log(`📁 Output directory: ${outputDir}`);

    // Find all images
    const imagePatterns = ['**/*.{jpg,jpeg,png,gif}'];
    const imagePaths = await glob(imagePatterns, {
      cwd: inputDir,
      absolute: false,
    });

    console.log(`📷 Found ${imagePaths.length} images to process`);

    // Create output directory if it doesn't exist
    await fs.mkdir(outputDir, { recursive: true });

    // Process each image
    for (const imagePath of imagePaths) {
      await this.processImage(
        path.join(inputDir, imagePath),
        outputDir,
        {
          useTinyPNG,
          generateSizes,
          convertToWebP,
          quality,
        },
        forceReprocess
      );
    }

    // Save cache after processing all images
    await this.saveCache();
    this.printStats();
  }

  private async processImage(
    inputPath: string,
    outputDir: string,
    options: {
      useTinyPNG: boolean;
      generateSizes: boolean;
      convertToWebP: boolean;
      quality: number;
    },
    forceReprocess: boolean = false
  ) {
    const fileName = path.basename(inputPath, path.extname(inputPath));
    const relativeDir = path.dirname(path.relative(process.cwd(), inputPath));

    try {
      // Create subdirectory in output
      const outputSubDir = path.join(outputDir, relativeDir);

      // Check if output files already exist (unless force reprocess)
      if (!forceReprocess) {
        const mainOutputFile = path.join(outputSubDir, `${fileName}.webp`);
        const thumbnailFile = path.join(outputSubDir, `${fileName}-thumbnail.webp`);

        try {
          // Check if at least the main output file exists
          await fs.access(mainOutputFile);
          console.log(`\n✅ Already optimized: ${path.basename(inputPath)}`);
          this.stats.skipped++;
          return;
        } catch {
          // File doesn't exist, proceed with optimization
        }
      }

      // Check if this image has already been processed (by hash)
      const imageHash = await this.getImageHash(inputPath);

      if (!forceReprocess && this.processedHashes.has(imageHash)) {
        console.log(`\n⏭️  Skipping: ${path.basename(inputPath)} (already processed - same content)`);
        this.stats.skipped++;
        return;
      }

      // Also check if this exact file path was already processed in this session
      if (!forceReprocess && this.processedImages.has(inputPath)) {
        console.log(`\n⏭️  Skipping: ${path.basename(inputPath)} (duplicate in current session)`);
        this.stats.skipped++;
        return;
      }

      console.log(`\n🔄 Processing: ${path.basename(inputPath)}`);

      // Get original file size
      const originalStats = await fs.stat(inputPath);
      const originalSize = originalStats.size;

      // Read image
      const imageBuffer = await fs.readFile(inputPath);
      const image = sharp(imageBuffer);
      const metadata = await image.metadata();

      // Ensure subdirectory exists
      await fs.mkdir(outputSubDir, { recursive: true });

      // STEP 1: Generate different sizes FIRST (resize)
      if (options.generateSizes) {
        await this.generateResponsiveSizes(
          imageBuffer,
          fileName,
          outputSubDir,
          metadata,
          options,
          !!(options.useTinyPNG && TINYPNG_API_KEY)
        );
      }

      // STEP 2: Convert to WebP (after resizing)
      if (options.convertToWebP) {
        await this.convertToWebP(
          imageBuffer,
          fileName,
          outputSubDir,
          options.quality,
          !!(options.useTinyPNG && TINYPNG_API_KEY)
        );
      }

      // STEP 3: Create an optimized version of the original size
      if (options.useTinyPNG && TINYPNG_API_KEY && !options.generateSizes) {
        // Only compress original if we're not generating sizes
        await this.compressWithTinyPNG(
          inputPath,
          path.join(outputSubDir, `${fileName}-optimized.png`)
        );
      }

      // Calculate savings
      const optimizedPath = path.join(outputSubDir, `${fileName}.webp`);
      try {
        const optimizedStats = await fs.stat(optimizedPath);
        const saved = originalSize - optimizedStats.size;
        const savedPercent = ((saved / originalSize) * 100).toFixed(2);
        console.log(`  ✅ Saved: ${this.formatBytes(saved)} (${savedPercent}%)`);
        this.stats.totalSaved += saved;
      } catch (e) {
        // Optimized file might not exist
      }

      this.stats.processed++;

      // Mark this image as processed
      this.processedImages.add(inputPath);
      this.processedHashes.add(imageHash);

    } catch (error) {
      console.error(`  ❌ Error processing ${inputPath}:`, error);
      this.stats.errors++;
    }
  }

  private async generateResponsiveSizes(
    imageBuffer: Buffer,
    fileName: string,
    outputDir: string,
    metadata: sharp.Metadata,
    options: { quality: number },
    useTinyPNG: boolean = false
  ) {
    const originalWidth = metadata.width || 1920;
    const originalHeight = metadata.height || 1080;
    const aspectRatio = originalWidth / originalHeight;

    for (const [sizeName, dimensions] of Object.entries(IMAGE_SIZES)) {
      // Skip if original is smaller than target size
      if (originalWidth < dimensions.width) {
        continue;
      }

      // Calculate height maintaining aspect ratio
      const targetHeight = Math.round(dimensions.width / aspectRatio);

      // First resize and save as temporary PNG/JPEG
      const tempPath = path.join(outputDir, `${fileName}-${sizeName}-temp.png`);
      const finalPath = path.join(outputDir, `${fileName}-${sizeName}.webp`);

      // Step 1: Resize image
      await sharp(imageBuffer)
        .resize(dimensions.width, targetHeight, {
          fit: 'cover',
          position: 'center',
        })
        .png({ quality: 100 })
        .toFile(tempPath);

      console.log(`  📐 Resized ${sizeName}: ${dimensions.width}x${targetHeight}`);

      // Step 2: Compress with TinyPNG if enabled
      if (useTinyPNG) {
        try {
          const compressedPath = path.join(outputDir, `${fileName}-${sizeName}-compressed.png`);
          await this.compressWithTinyPNG(tempPath, compressedPath);

          // Step 3: Convert compressed version to WebP
          await sharp(await fs.readFile(compressedPath))
            .webp({ quality: options.quality })
            .toFile(finalPath);

          // Clean up temporary files
          await fs.unlink(tempPath).catch(() => {});
          await fs.unlink(compressedPath).catch(() => {});

          console.log(`  ✅ Optimized and converted to WebP`);
        } catch (error) {
          console.log(`  ⚠️  TinyPNG failed, using regular compression`);
          // Fallback: Convert directly to WebP without TinyPNG
          await sharp(await fs.readFile(tempPath))
            .webp({ quality: options.quality })
            .toFile(finalPath);
          await fs.unlink(tempPath).catch(() => {});
        }
      } else {
        // No TinyPNG: Convert directly to WebP
        await sharp(await fs.readFile(tempPath))
          .webp({ quality: options.quality })
          .toFile(finalPath);
        await fs.unlink(tempPath).catch(() => {});
      }
    }
  }

  private async convertToWebP(
    imageBuffer: Buffer,
    fileName: string,
    outputDir: string,
    quality: number,
    useTinyPNG: boolean = false
  ) {
    const outputPath = path.join(outputDir, `${fileName}.webp`);

    if (useTinyPNG) {
      // First save as PNG, compress with TinyPNG, then convert to WebP
      const tempPath = path.join(outputDir, `${fileName}-temp.png`);
      const compressedPath = path.join(outputDir, `${fileName}-compressed.png`);

      try {
        // Save as PNG first
        await sharp(imageBuffer)
          .png({ quality: 100 })
          .toFile(tempPath);

        // Compress with TinyPNG
        await this.compressWithTinyPNG(tempPath, compressedPath);

        // Convert compressed version to WebP
        await sharp(await fs.readFile(compressedPath))
          .webp({ quality })
          .toFile(outputPath);

        // Clean up temporary files
        await fs.unlink(tempPath).catch(() => {});
        await fs.unlink(compressedPath).catch(() => {});

        console.log(`  🎨 Optimized with TinyPNG and converted to WebP: ${fileName}.webp`);
      } catch (error) {
        console.log(`  ⚠️  TinyPNG failed, using regular WebP conversion`);
        // Fallback to direct WebP conversion
        await sharp(imageBuffer)
          .webp({ quality })
          .toFile(outputPath);
      }
    } else {
      // Direct WebP conversion without TinyPNG
      await sharp(imageBuffer)
        .webp({ quality })
        .toFile(outputPath);

      console.log(`  🎨 Converted to WebP: ${fileName}.webp`);
    }
  }

  private async compressWithTinyPNG(inputPath: string, outputPath: string) {
    if (!TINYPNG_API_KEY) {
      console.log('  ⚠️  TinyPNG API key not set, skipping compression');
      return;
    }

    try {
      const source = tinify.fromFile(inputPath);
      await source.toFile(outputPath);
      console.log(`  🗜️  Compressed with TinyPNG: ${path.basename(outputPath)}`);
    } catch (error) {
      console.error(`  ❌ TinyPNG compression failed:`, error);
    }
  }

  private formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  }

  private printStats() {
    console.log('\n📊 Optimization Complete!');
    console.log('=' .repeat(40));
    console.log(`✅ Processed: ${this.stats.processed} images`);
    console.log(`⏭️  Skipped: ${this.stats.skipped} images`);
    console.log(`❌ Errors: ${this.stats.errors}`);
    console.log(`💾 Total saved: ${this.formatBytes(this.stats.totalSaved)}`);
  }
}

// CLI interface
async function main() {
  const args = process.argv.slice(2);

  if (args.includes('--help')) {
    console.log(`
Image Optimization Script

Usage: tsx scripts/optimize-images.ts [options]

Options:
  --input <dir>     Input directory (default: public/assets)
  --output <dir>    Output directory (default: public/optimized)
  --no-tinypng      Skip TinyPNG compression
  --no-sizes        Don't generate responsive sizes
  --no-webp         Don't convert to WebP
  --quality <num>   WebP quality (default: 85)
  --clear-cache     Clear the optimization cache
  --force           Force reprocess all images (ignore cache)
  --help           Show this help message

Environment Variables:
  TINYPNG_API_KEY   Your TinyPNG API key for compression

Cache:
  The script tracks processed images to avoid reprocessing.
  Use --clear-cache to force reprocess all images.
    `);
    process.exit(0);
  }

  // Clear cache if requested
  if (args.includes('--clear-cache')) {
    try {
      await fs.unlink('.image-optimization-cache.json');
      console.log('🗑️  Cache cleared');
    } catch (error) {
      console.log('📝 No cache to clear');
    }
  }

  const getArg = (flag: string, defaultValue: string) => {
    const index = args.indexOf(flag);
    return index !== -1 && args[index + 1] ? args[index + 1] : defaultValue;
  };

  const optimizer = new ImageOptimizer();

  await optimizer.optimizeImages({
    inputDir: getArg('--input', 'public/assets'),
    outputDir: getArg('--output', 'public/optimized'),
    useTinyPNG: !args.includes('--no-tinypng'),
    generateSizes: !args.includes('--no-sizes'),
    convertToWebP: !args.includes('--no-webp'),
    quality: parseInt(getArg('--quality', '85')),
    forceReprocess: args.includes('--force'),
  });
}

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}

export { ImageOptimizer, IMAGE_SIZES };