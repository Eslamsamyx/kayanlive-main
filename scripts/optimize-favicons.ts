#!/usr/bin/env tsx

import sharp from 'sharp';
import fs from 'fs/promises';
import path from 'path';
import tinify from 'tinify';

// Set TinyPNG API Key
tinify.key = process.env.TINYPNG_API_KEY || 'V4fXVCFR2PkwMXbNGq2YDHLW3XXtHXkz';

const FAVICON_SIZES = [
  { name: 'favicon-16x16', size: 16 },
  { name: 'favicon-32x32', size: 32 },
  { name: 'apple-touch-icon', size: 180 },
  { name: 'android-chrome-192x192', size: 192 },
  { name: 'android-chrome-512x512', size: 512 },
];

async function optimizeFavicons() {
  console.log('🎯 Optimizing favicons...\n');

  const publicDir = path.join(process.cwd(), 'public');
  const optimizedDir = path.join(publicDir, 'optimized', 'favicons');

  // Create output directory
  await fs.mkdir(optimizedDir, { recursive: true });

  let totalSaved = 0;

  for (const favicon of FAVICON_SIZES) {
    const inputFile = path.join(publicDir, `${favicon.name}.png`);
    const outputFile = path.join(optimizedDir, `${favicon.name}.webp`);

    try {
      // Check if input file exists
      await fs.access(inputFile);

      // Get original size
      const originalStats = await fs.stat(inputFile);
      const originalSize = originalStats.size;

      // Read and optimize with sharp
      const buffer = await sharp(inputFile)
        .resize(favicon.size, favicon.size, {
          fit: 'cover',
          position: 'center'
        })
        .webp({ quality: 95, lossless: false })
        .toBuffer();

      // Compress with TinyPNG
      const source = tinify.fromBuffer(buffer);
      const compressedBuffer = await source.toBuffer();

      // Save optimized file
      await fs.writeFile(outputFile, compressedBuffer);

      // Get optimized size
      const optimizedStats = await fs.stat(outputFile);
      const optimizedSize = optimizedStats.size;
      const saved = originalSize - optimizedSize;
      const reduction = ((saved / originalSize) * 100).toFixed(1);

      totalSaved += saved;

      console.log(`✅ ${favicon.name}: ${(originalSize / 1024).toFixed(1)}KB → ${(optimizedSize / 1024).toFixed(1)}KB (saved ${reduction}%)`);

    } catch (error: any) {
      if (error.code === 'ENOENT') {
        console.log(`⚠️  ${favicon.name}: File not found, skipping...`);
      } else {
        console.error(`❌ ${favicon.name}: ${error.message}`);
      }
    }
  }

  console.log(`\n✨ Total saved: ${(totalSaved / 1024).toFixed(1)}KB`);

  // Also optimize the main favicon.ico by creating a multi-resolution ICO
  console.log('\n📦 Creating optimized favicon.ico...');

  try {
    const icoSizes = [16, 32, 48];

    for (const size of icoSizes) {
      const outputFile = path.join(optimizedDir, `favicon-${size}x${size}.png`);

      await sharp(path.join(publicDir, 'favicon-32x32.png'))
        .resize(size, size)
        .png({ quality: 95, compressionLevel: 9 })
        .toFile(outputFile);
    }

    console.log('✅ Multi-resolution favicon components created');
    console.log('ℹ️  Note: Use an ICO converter to combine these into favicon.ico');
  } catch (error: any) {
    console.error(`❌ Error creating favicon components: ${error.message}`);
  }
}

optimizeFavicons().catch(console.error);