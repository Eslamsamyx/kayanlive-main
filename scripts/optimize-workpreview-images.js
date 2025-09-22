const tinify = require('tinify');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Set API key
tinify.key = process.env.TINYPNG_API_KEY || 'V4fXVCFR2PkwMXbNGq2YDHLW3XXtHXkz';

// Create output directory
const outputDir = path.join(__dirname, '../public/optimized/work');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Function to get file hash
function getFileHash(filePath) {
  const fileBuffer = fs.readFileSync(filePath);
  const hash = crypto.createHash('sha256').update(fileBuffer).digest('hex');
  return hash.substring(0, 40); // Take first 40 chars for shorter filenames
}

// Images to optimize from WorkPreview
const images = [
  { input: 'public/assets/1402feda00b479d56347dca419118793a7b45676.png', name: 'work-preview-1' },
  { input: 'public/assets/5482ea96fa4b448d8ca09a0a3ec25b2abda42297.png', name: 'work-preview-2' },
  { input: 'public/assets/d0bf46ddca5a9b03461723c0c034ab2dc5fc309e.png', name: 'work-preview-3' },
  { input: 'public/assets/6ebbb286c787b4009100c9f8cd397942ae83de56.png', name: 'work-pattern-1' },
  { input: 'public/assets/ef25fd14e49122ddd6cbc03c8a92caff93500eb7.png', name: 'work-pattern-2' }
];

async function optimizeImage(inputPath, name) {
  try {
    const fullInputPath = path.join(__dirname, '..', inputPath);

    if (!fs.existsSync(fullInputPath)) {
      console.log(`⚠️ File not found: ${fullInputPath}`);
      return null;
    }

    const hash = getFileHash(fullInputPath);
    const outputFileName = `${hash}-${name}.webp`;
    const outputPath = path.join(outputDir, outputFileName);

    // Check if already optimized
    if (fs.existsSync(outputPath)) {
      console.log(`✅ Already optimized: ${outputFileName}`);
      return outputFileName;
    }

    console.log(`🔄 Optimizing ${name}...`);

    // Optimize with TinyPNG and convert to WebP
    const source = tinify.fromFile(fullInputPath);
    const converted = source.convert({ type: 'image/webp' });
    await converted.toFile(outputPath);

    console.log(`✅ Created: ${outputFileName}`);
    return outputFileName;
  } catch (error) {
    console.error(`❌ Error optimizing ${name}:`, error.message);
    return null;
  }
}

async function main() {
  console.log('🚀 Starting WorkPreview image optimization...\n');

  const results = {};

  for (const image of images) {
    const optimizedFile = await optimizeImage(image.input, image.name);
    if (optimizedFile) {
      const path = `/optimized/work/${optimizedFile}`;
      results[image.name] = path;
    }
  }

  console.log('\n📊 Optimization Complete!');
  console.log('========================================');
  console.log('\nOptimized paths for WorkPreview component:');
  console.log(JSON.stringify(results, null, 2));

  // Check compression count
  try {
    const compressionCount = await tinify.compressionCount;
    console.log(`\n📈 API usage: ${compressionCount}/500 compressions this month`);
  } catch (e) {
    // Ignore validation errors
  }
}

main().catch(console.error);