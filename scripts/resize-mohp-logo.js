const tinify = require('tinify');
const fs = require('fs');
const path = require('path');

// Set API key
tinify.key = process.env.TINYPNG_API_KEY || 'V4fXVCFR2PkwMXbNGq2YDHLW3XXtHXkz';

const inputFile = '/Users/eslamsamy/Downloads/optimized/MOHP-logo-optimized.webp';
const outputFile = '/Users/eslamsamy/Downloads/optimized/MOHP-logo-resized.webp';

async function resizeImage() {
  try {
    console.log('📏 Resizing MOHP logo to smaller dimensions...\n');

    // Get original file size
    const originalStats = fs.statSync(inputFile);
    const originalSizeKB = (originalStats.size / 1024).toFixed(1);
    console.log(`Original file: ${originalSizeKB}KB`);

    // Load and resize the image
    const source = tinify.fromFile(inputFile);

    // Resize to max width of 400px and height of 150px (less than half of typical logo sizes)
    // This will maintain aspect ratio and fit within these dimensions
    const resized = source.resize({
      method: "fit",
      width: 400,
      height: 150
    });

    // Convert to WebP if not already
    const converted = resized.convert({ type: 'image/webp' });

    // Save the resized file
    await converted.toFile(outputFile);

    // Get new file size
    const newStats = fs.statSync(outputFile);
    const newSizeKB = (newStats.size / 1024).toFixed(1);

    const reduction = ((originalStats.size - newStats.size) / originalStats.size * 100).toFixed(1);

    console.log(`✅ Resized file: ${newSizeKB}KB (-${reduction}%)`);
    console.log(`📁 Saved to: ${outputFile}`);

    // Check API usage
    try {
      const compressionCount = await tinify.compressionCount;
      console.log(`\n📈 TinyPNG API usage: ${compressionCount}/500 compressions this month`);
    } catch (e) {
      // Ignore validation errors
    }

  } catch (error) {
    console.error('❌ Error resizing image:', error.message);
  }
}

// Run the resize
resizeImage();