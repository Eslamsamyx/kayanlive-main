#!/usr/bin/env node

import fs from 'fs/promises';
import path from 'path';
import sharp from 'sharp';
import tinify from 'tinify';
import { IMAGE_LOCATIONS, IMAGE_MAPPINGS, getImageLocations } from './image-config';

const TINYPNG_API_KEY = process.env.TINYPNG_API_KEY || '';

interface OptimizationResult {
  source: string;
  location: string;
  viewport: string;
  outputPath: string;
  originalSize: number;
  optimizedSize: number;
  saved: number;
  savedPercent: number;
}

class SmartImageOptimizer {
  private results: OptimizationResult[] = [];
  private processedCount = 0;
  private skippedCount = 0;
  private totalSaved = 0;
  private outputManifest: Record<string, any> = {};

  constructor() {
    if (TINYPNG_API_KEY) {
      tinify.key = TINYPNG_API_KEY;
      this.validateTinyPNGKey();
    }
  }

  private async validateTinyPNGKey() {
    try {
      await tinify.validate();
      const compressionsThisMonth = tinify.compressionCount || 0;
      console.log(`✅ TinyPNG API key valid. ${500 - compressionsThisMonth} compressions remaining this month.`);
    } catch (error) {
      console.warn('⚠️  TinyPNG API key validation failed:', error);
    }
  }

  async optimizeAllImages(outputDir: string = 'public/optimized') {
    console.log('🎯 Smart Image Optimization Starting...');
    console.log('📊 Analyzing image requirements...\n');

    // Create output directory
    await fs.mkdir(outputDir, { recursive: true });

    // Process each mapped image
    for (const mapping of IMAGE_MAPPINGS) {
      await this.optimizeImageForLocations(mapping, outputDir);
    }

    // Generate manifest file
    await this.saveManifest(outputDir);

    // Print results
    this.printResults();
  }

  private async optimizeImageForLocations(
    mapping: { sourcePath: string; locations: string[] },
    outputDir: string
  ) {
    const { sourcePath, locations } = mapping;

    // Check if source file exists
    try {
      await fs.access(sourcePath);
    } catch {
      console.log(`❌ Source file not found: ${sourcePath}`);
      this.skippedCount++;
      return;
    }

    console.log(`\n📸 Processing: ${path.basename(sourcePath)}`);
    console.log(`   Locations: ${locations.join(', ')}`);

    const originalStats = await fs.stat(sourcePath);
    const originalSize = originalStats.size;
    const imageBuffer = await fs.readFile(sourcePath);

    // Process for each location
    for (const locationId of locations) {
      const location = IMAGE_LOCATIONS[locationId];
      if (!location) {
        console.warn(`   ⚠️  Location ${locationId} not found in config`);
        continue;
      }

      console.log(`   📍 Location: ${location.description}`);

      // Generate for each viewport
      for (const [viewport, dimensions] of Object.entries(location.dimensions)) {
        await this.optimizeForViewport(
          sourcePath,
          imageBuffer,
          locationId,
          viewport,
          dimensions,
          location.quality || 85,
          outputDir,
          originalSize
        );
      }
    }
  }

  private async optimizeForViewport(
    sourcePath: string,
    imageBuffer: Buffer,
    locationId: string,
    viewport: string,
    dimensions: { width: number; height: number },
    quality: number,
    outputDir: string,
    originalSize: number
  ) {
    const fileName = path.basename(sourcePath, path.extname(sourcePath));
    const outputFileName = `${fileName}-${locationId}-${viewport}.webp`;
    const outputPath = path.join(outputDir, locationId, outputFileName);

    // Check if already exists
    try {
      const existingStats = await fs.stat(outputPath);
      console.log(`      ✅ ${viewport}: Already exists (${this.formatBytes(existingStats.size)})`);
      this.skippedCount++;
      return;
    } catch {
      // File doesn't exist, proceed with optimization
    }

    // Create location subdirectory
    await fs.mkdir(path.dirname(outputPath), { recursive: true });

    try {
      // Step 1: Resize to exact dimensions
      const tempPath = outputPath.replace('.webp', '-temp.png');

      await sharp(imageBuffer)
        .resize(dimensions.width, dimensions.height, {
          fit: 'cover',
          position: 'center',
          withoutEnlargement: true, // Don't upscale if image is smaller
        })
        .png({ quality: 100 })
        .toFile(tempPath);

      // Step 2: Compress with TinyPNG if available
      let finalBuffer: Buffer;

      if (TINYPNG_API_KEY) {
        try {
          const compressedPath = tempPath.replace('-temp.png', '-compressed.png');
          const source = tinify.fromFile(tempPath);

          // TinyPNG can also resize, but we've already done that
          await source.toFile(compressedPath);

          finalBuffer = await fs.readFile(compressedPath);

          // Clean up compressed file
          await fs.unlink(compressedPath).catch(() => {});

          console.log(`      🗜️  ${viewport}: TinyPNG compressed`);
        } catch (error) {
          console.log(`      ⚠️  ${viewport}: TinyPNG failed, using sharp only`);
          finalBuffer = await fs.readFile(tempPath);
        }
      } else {
        finalBuffer = await fs.readFile(tempPath);
      }

      // Step 3: Convert to WebP
      await sharp(finalBuffer)
        .webp({ quality })
        .toFile(outputPath);

      // Clean up temp file
      await fs.unlink(tempPath).catch(() => {});

      // Get final size and calculate savings
      const finalStats = await fs.stat(outputPath);
      const saved = originalSize - finalStats.size;
      const savedPercent = ((saved / originalSize) * 100).toFixed(1);

      console.log(`      ✨ ${viewport}: ${dimensions.width}×${dimensions.height} → ${this.formatBytes(finalStats.size)} (saved ${savedPercent}%)`);

      // Store result
      this.results.push({
        source: sourcePath,
        location: locationId,
        viewport,
        outputPath,
        originalSize,
        optimizedSize: finalStats.size,
        saved,
        savedPercent: parseFloat(savedPercent),
      });

      // Add to manifest
      if (!this.outputManifest[sourcePath]) {
        this.outputManifest[sourcePath] = {};
      }
      if (!this.outputManifest[sourcePath][locationId]) {
        this.outputManifest[sourcePath][locationId] = {};
      }
      this.outputManifest[sourcePath][locationId][viewport] = {
        path: outputPath,
        width: dimensions.width,
        height: dimensions.height,
        size: finalStats.size,
        quality,
      };

      this.processedCount++;
      this.totalSaved += saved;

    } catch (error) {
      console.error(`      ❌ ${viewport}: Optimization failed:`, error);
    }
  }

  private async saveManifest(outputDir: string) {
    const manifestPath = path.join(outputDir, 'image-manifest.json');
    await fs.writeFile(
      manifestPath,
      JSON.stringify(this.outputManifest, null, 2)
    );
    console.log(`\n📄 Manifest saved to ${manifestPath}`);
  }

  private formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  }

  private printResults() {
    console.log('\n' + '='.repeat(60));
    console.log('📊 OPTIMIZATION COMPLETE');
    console.log('='.repeat(60));

    // Summary stats
    console.log(`\n✅ Processed: ${this.processedCount} image variants`);
    console.log(`⏭️  Skipped: ${this.skippedCount} (already optimized)`);
    console.log(`💾 Total saved: ${this.formatBytes(this.totalSaved)}`);

    // Average savings
    if (this.results.length > 0) {
      const avgSavings = this.results.reduce((sum, r) => sum + r.savedPercent, 0) / this.results.length;
      console.log(`📈 Average reduction: ${avgSavings.toFixed(1)}%`);
    }

    // Top savings
    if (this.results.length > 0) {
      console.log('\n🏆 Top Optimizations:');
      const topResults = [...this.results]
        .sort((a, b) => b.saved - a.saved)
        .slice(0, 5);

      topResults.forEach((result, index) => {
        console.log(
          `${index + 1}. ${path.basename(result.source)} → ${result.location}/${result.viewport}: ` +
          `Saved ${this.formatBytes(result.saved)} (${result.savedPercent}%)`
        );
      });
    }

    // Location coverage
    console.log('\n📍 Location Coverage:');
    const locationCoverage = new Map<string, number>();
    this.results.forEach(r => {
      locationCoverage.set(r.location, (locationCoverage.get(r.location) || 0) + 1);
    });

    locationCoverage.forEach((count, location) => {
      const loc = IMAGE_LOCATIONS[location];
      console.log(`   ${location}: ${count} variants generated (${loc?.description})`);
    });
  }
}

// Component generator to use optimized images
class ComponentGenerator {
  static generateImageComponent(imagePath: string, locationId: string): string {
    const location = IMAGE_LOCATIONS[locationId];
    if (!location) return '';

    const fileName = path.basename(imagePath, path.extname(imagePath));

    return `
import OptimizedImage from '@/components/OptimizedImage';

export function ${this.toPascalCase(locationId)}Image() {
  return (
    <picture>
      <source
        media="(max-width: 420px)"
        srcSet="/optimized/${locationId}/${fileName}-${locationId}-mobile.webp"
        type="image/webp"
      />
      ${location.dimensions.tablet ? `
      <source
        media="(max-width: 768px)"
        srcSet="/optimized/${locationId}/${fileName}-${locationId}-tablet.webp"
        type="image/webp"
      />` : ''}
      <source
        media="(min-width: ${location.dimensions.tablet ? '769px' : '421px'})"
        srcSet="/optimized/${locationId}/${fileName}-${locationId}-desktop.webp"
        type="image/webp"
      />
      <img
        src="/optimized/${locationId}/${fileName}-${locationId}-desktop.webp"
        alt="${location.description}"
        width="${location.dimensions.desktop.width}"
        height="${location.dimensions.desktop.height}"
        loading="${location.priority ? 'eager' : 'lazy'}"
      />
    </picture>
  );
}
`;
  }

  private static toPascalCase(str: string): string {
    return str
      .split(/[-_]/)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join('');
  }
}

// Analyze current image usage
async function analyzeCurrentUsage() {
  console.log('🔍 Analyzing Current Image Configuration\n');

  const totalLocations = Object.keys(IMAGE_LOCATIONS).length;
  const totalMappings = IMAGE_MAPPINGS.length;
  let totalVariantsNeeded = 0;

  IMAGE_MAPPINGS.forEach(mapping => {
    mapping.locations.forEach(locationId => {
      const location = IMAGE_LOCATIONS[locationId];
      if (location) {
        totalVariantsNeeded += Object.keys(location.dimensions).length;
      }
    });
  });

  console.log(`📍 Defined Locations: ${totalLocations}`);
  console.log(`🖼️  Mapped Images: ${totalMappings}`);
  console.log(`🔢 Total Variants Needed: ${totalVariantsNeeded}`);
  console.log(`💾 Estimated Output: ~${totalVariantsNeeded * 150}KB (assuming 150KB avg per variant)`);

  // Find unmapped locations
  const usedLocations = new Set<string>();
  IMAGE_MAPPINGS.forEach(m => m.locations.forEach(l => usedLocations.add(l)));

  const unusedLocations = Object.keys(IMAGE_LOCATIONS).filter(l => !usedLocations.has(l));
  if (unusedLocations.length > 0) {
    console.log(`\n⚠️  Unused Locations (${unusedLocations.length}):`);
    unusedLocations.forEach(loc => {
      console.log(`   - ${loc}: ${IMAGE_LOCATIONS[loc].description}`);
    });
  }
}

// CLI
async function main() {
  const args = process.argv.slice(2);

  if (args.includes('--help')) {
    console.log(`
Smart Image Optimization Script

Usage: tsx scripts/optimize-images-smart.ts [options]

Options:
  --analyze     Analyze current configuration without optimizing
  --output      Output directory (default: public/optimized)
  --component   Generate component code for an image
  --help        Show this help

Examples:
  tsx scripts/optimize-images-smart.ts
  tsx scripts/optimize-images-smart.ts --analyze
  tsx scripts/optimize-images-smart.ts --output public/images
`);
    process.exit(0);
  }

  if (args.includes('--analyze')) {
    await analyzeCurrentUsage();
    return;
  }

  const outputIndex = args.indexOf('--output');
  const outputDir = outputIndex !== -1 ? args[outputIndex + 1] : 'public/optimized';

  const optimizer = new SmartImageOptimizer();
  await optimizer.optimizeAllImages(outputDir);
}

if (require.main === module) {
  main().catch(console.error);
}

export { SmartImageOptimizer, ComponentGenerator };