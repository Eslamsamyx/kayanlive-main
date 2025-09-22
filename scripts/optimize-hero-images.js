const tinify = require('tinify');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Set API key
tinify.key = process.env.TINYPNG_API_KEY || 'V4fXVCFR2PkwMXbNGq2YDHLW3XXtHXkz';

// Create output directory
const outputDir = path.join(__dirname, '../public/optimized/hero');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Function to get file hash
function getFileHash(filePath) {
  const fileBuffer = fs.readFileSync(filePath);
  const hash = crypto.createHash('sha256').update(fileBuffer).digest('hex');
  return hash.substring(0, 40); // Take first 40 chars for shorter filenames
}

// Images to optimize from Hero component
const images = [
  { input: 'public/assets/01f5d49d03c8455dc99b2ad32446b6657b1949e0.png', name: 'hero-main-bg' },
  { input: 'public/assets/b0d9ec6faacc00d7ed8b82f3f45ecaa371425181.png', name: 'hero-slide2-bg' },
  { input: 'public/assets/823c27de600ccd2f92af3e073c8e10df3a192e5c.png', name: 'hero-logo-watermark' },
  { input: 'public/assets/873e726ea40f8085d26088ffc29bf8dfb68b10ee.png', name: 'hero-k-mobile' }
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
  console.log('🚀 Starting Hero component image optimization...\n');
  
  const results = {};
  
  for (const image of images) {
    const optimizedFile = await optimizeImage(image.input, image.name);
    if (optimizedFile) {
      const path = `/optimized/hero/${optimizedFile}`;
      results[image.name] = path;
    }
  }
  
  console.log('\n📊 Optimization Complete!');
  console.log('========================================');
  console.log('\nOptimized paths for Hero component:');
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
