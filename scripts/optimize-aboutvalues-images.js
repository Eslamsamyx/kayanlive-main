const tinify = require('tinify');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Set API key
tinify.key = process.env.TINYPNG_API_KEY || 'V4fXVCFR2PkwMXbNGq2YDHLW3XXtHXkz';

// Create output directory
const outputDir = path.join(__dirname, '../public/optimized/aboutvalues');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Function to get file hash
function getFileHash(filePath) {
  const fileBuffer = fs.readFileSync(filePath);
  const hash = crypto.createHash('sha256').update(fileBuffer).digest('hex');
  return hash.substring(0, 40); // Take first 40 chars for shorter filenames
}

// Images to optimize
const images = [
  { input: 'public/assets/79b8becbbe666db19c2c2dfdebe436eebf271e2e.png', name: 'purpose' },
  { input: 'public/assets/fe74de8467bf5ef42975b489173519217b1b04d0.png', name: 'precision' },
  { input: 'public/assets/4bf06f33663f81bd327984084be746509f0caffd.png', name: 'innovation' },
  { input: 'public/assets/3bfce9db290033eb81342a31f55d19a490e552d3.png', name: 'collaboration' },
  { input: 'public/assets/c7e54c0605f6e122070c3da28c63679ca3742a85.png', name: 'placeholder' },
  { input: 'public/assets/1349ad630f81a3bb2a509dd8abfe0e4ef85fa329.png', name: 'logo-decoration' },
  { input: 'public/assets/7854b2fa3456db2dfe1f88a71484d2ef952fd4d6.png', name: 'bottom-pattern' }
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
  console.log('🚀 Starting AboutValues image optimization...\n');

  const results = {};

  for (const image of images) {
    const optimizedFile = await optimizeImage(image.input, image.name);
    if (optimizedFile) {
      results[image.name] = `/optimized/aboutvalues/${optimizedFile}`;
    }
  }

  console.log('\n📊 Optimization Complete!');
  console.log('========================================');
  console.log('\nOptimized paths for AboutValues component:');
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