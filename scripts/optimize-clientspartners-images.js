const tinify = require('tinify');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Set API key
tinify.key = process.env.TINYPNG_API_KEY || 'V4fXVCFR2PkwMXbNGq2YDHLW3XXtHXkz';

// Create output directory
const outputDir = path.join(__dirname, '../public/optimized/clients-partners');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Function to get file hash
function getFileHash(filePath) {
  const fileBuffer = fs.readFileSync(filePath);
  const hash = crypto.createHash('sha256').update(fileBuffer).digest('hex');
  return hash.substring(0, 40); // Take first 40 chars for shorter filenames
}

// Images to optimize from ClientsPartnersHero
const images = [
  { input: 'public/assets/1349ad630f81a3bb2a509dd8abfe0e4ef85fa329.png', name: 'clients-outline' },
  { input: 'public/assets/6f6ce5ee6422e315524d4c876dbb7b8a3e609a69.png', name: 'clients-trust-icon' }
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
  console.log('🚀 Starting ClientsPartnersHero image optimization...\n');
  
  const results = {};
  
  for (const image of images) {
    const optimizedFile = await optimizeImage(image.input, image.name);
    if (optimizedFile) {
      const path = `/optimized/clients-partners/${optimizedFile}`;
      results[image.name] = path;
    }
  }
  
  console.log('\n📊 Optimization Complete!');
  console.log('========================================');
  console.log('\nOptimized paths for ClientsPartnersHero component:');
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
