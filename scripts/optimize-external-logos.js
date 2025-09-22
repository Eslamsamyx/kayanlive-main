const tinify = require('tinify');
const fs = require('fs');
const path = require('path');

// Set API key
tinify.key = process.env.TINYPNG_API_KEY || 'V4fXVCFR2PkwMXbNGq2YDHLW3XXtHXkz';

// Directories
const inputDir = '/Users/eslamsamy/Downloads/kayanlive-logos';
const outputDir = '/Users/eslamsamy/Downloads/optimized';

// Create output directory
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Get all image files
const imageFiles = fs.readdirSync(inputDir).filter(file => {
  const ext = path.extname(file).toLowerCase();
  return ['.png', '.jpg', '.jpeg', '.webp'].includes(ext);
});

console.log(`\n🚀 Starting optimization of ${imageFiles.length} logo images...`);
console.log('================================================\n');

// Track results
const results = {
  success: [],
  skipped: [],
  failed: []
};

async function optimizeImage(inputFile) {
  const inputPath = path.join(inputDir, inputFile);
  const baseName = path.basename(inputFile, path.extname(inputFile));
  const outputFile = `${baseName}.webp`;
  const outputPath = path.join(outputDir, outputFile);

  try {
    // Check if already a WebP and small enough
    const stats = fs.statSync(inputPath);
    const sizeInKB = stats.size / 1024;

    // Check if output already exists
    if (fs.existsSync(outputPath)) {
      const outputStats = fs.statSync(outputPath);
      const outputSizeKB = outputStats.size / 1024;
      console.log(`✅ Already optimized: ${outputFile} (${outputSizeKB.toFixed(1)}KB)`);
      results.skipped.push(outputFile);
      return;
    }

    console.log(`🔄 Optimizing: ${inputFile} (${sizeInKB.toFixed(1)}KB)...`);

    // Optimize with TinyPNG
    const source = tinify.fromFile(inputPath);

    // Use moderate compression settings (not very aggressive)
    const optimized = source.result();

    // Convert to WebP with good quality
    const converted = source.convert({ type: 'image/webp' });

    // Save the optimized file
    await converted.toFile(outputPath);

    // Get the new size
    const newStats = fs.statSync(outputPath);
    const newSizeKB = newStats.size / 1024;
    const reduction = ((sizeInKB - newSizeKB) / sizeInKB * 100).toFixed(1);

    console.log(`✅ Created: ${outputFile} (${newSizeKB.toFixed(1)}KB, -${reduction}%)`);
    results.success.push({
      original: inputFile,
      optimized: outputFile,
      originalSize: sizeInKB,
      newSize: newSizeKB,
      reduction: reduction
    });

  } catch (error) {
    console.error(`❌ Failed to optimize ${inputFile}:`, error.message);
    results.failed.push({ file: inputFile, error: error.message });
  }
}

async function main() {
  // Process images one by one to avoid API limits
  for (const file of imageFiles) {
    await optimizeImage(file);
    // Small delay to avoid hitting API rate limits
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  // Print summary
  console.log('\n================================================');
  console.log('📊 OPTIMIZATION COMPLETE');
  console.log('================================================\n');

  console.log(`✅ Successfully optimized: ${results.success.length} files`);
  if (results.success.length > 0) {
    const totalOriginal = results.success.reduce((sum, r) => sum + r.originalSize, 0);
    const totalNew = results.success.reduce((sum, r) => sum + r.newSize, 0);
    const totalReduction = ((totalOriginal - totalNew) / totalOriginal * 100).toFixed(1);
    console.log(`   Total size reduction: ${totalOriginal.toFixed(1)}KB → ${totalNew.toFixed(1)}KB (-${totalReduction}%)`);
  }

  console.log(`⏭️  Skipped (already optimized): ${results.skipped.length} files`);
  console.log(`❌ Failed: ${results.failed.length} files`);

  if (results.failed.length > 0) {
    console.log('\nFailed files:');
    results.failed.forEach(f => console.log(`  - ${f.file}: ${f.error}`));
  }

  // Check API usage
  try {
    const compressionCount = await tinify.compressionCount;
    console.log(`\n📈 TinyPNG API usage: ${compressionCount}/500 compressions this month`);
  } catch (e) {
    // Ignore validation errors
  }

  console.log('\n✨ All optimized images saved to:', outputDir);
}

// Run the optimization
main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});