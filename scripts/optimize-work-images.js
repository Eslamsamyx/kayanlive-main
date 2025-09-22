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

// Images to optimize - From WorkPreview and WorkOutcomes
const images = [
  // WorkPreview images
  { input: 'public/assets/97b98a652c6210a2b4e884e84040708ab75a45fc.png', name: 'work-preview-1' },
  { input: 'public/assets/a4bd38b73259c4fd4f099d834871f17ed5486466.png', name: 'work-preview-2' },
  { input: 'public/assets/bdd0b482d2a4b06725b67356c9cb8f5f989799c7.png', name: 'work-preview-3' },
  { input: 'public/assets/6ebbb286c787b4009100c9f8cd397942ae83de56.png', name: 'work-pattern-1' },
  { input: 'public/assets/ef25fd14e49122ddd6cbc03c8a92caff93500eb7.png', name: 'work-pattern-2' },

  // WorkOutcomes images
  { input: 'public/assets/b74a7a7d29dd66a6cd62e4edfe0512fa5a3b97ad.png', name: 'work-outcomes-1' },
  { input: 'public/assets/776958ae56ed264aecd4c182054c75bc576a1d2f.png', name: 'work-outcomes-2' },
  { input: 'public/assets/5fe3ba66a055c9a5b01ea404941b7097da5ffdb0.png', name: 'work-mobile-1' },
  { input: 'public/assets/c57c28aa85c3935c2914aa9ff408c9f8c8f2fe68.png', name: 'work-mobile-2' }
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
  console.log('🚀 Starting Work page image optimization...\n');

  const results = {
    workPreview: {},
    workOutcomes: {}
  };

  for (const image of images) {
    const optimizedFile = await optimizeImage(image.input, image.name);
    if (optimizedFile) {
      const path = `/optimized/work/${optimizedFile}`;

      // Categorize results
      if (image.name.includes('preview') || image.name.includes('pattern')) {
        results.workPreview[image.name] = path;
      } else {
        results.workOutcomes[image.name] = path;
      }
    }
  }

  console.log('\n📊 Optimization Complete!');
  console.log('========================================');
  console.log('\nOptimized paths for WorkPreview component:');
  console.log(JSON.stringify(results.workPreview, null, 2));
  console.log('\nOptimized paths for WorkOutcomes component:');
  console.log(JSON.stringify(results.workOutcomes, null, 2));

  // Check compression count
  try {
    const compressionCount = await tinify.compressionCount;
    console.log(`\n📈 API usage: ${compressionCount}/500 compressions this month`);
  } catch (e) {
    // Ignore validation errors
  }
}

main().catch(console.error);