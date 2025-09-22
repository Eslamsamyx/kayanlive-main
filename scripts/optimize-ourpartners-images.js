const tinify = require('tinify');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Set API key
tinify.key = process.env.TINYPNG_API_KEY || 'V4fXVCFR2PkwMXbNGq2YDHLW3XXtHXkz';

// Create output directory
const outputDir = path.join(__dirname, '../public/optimized/our-partners');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Function to get file hash
function getFileHash(filePath) {
  const fileBuffer = fs.readFileSync(filePath);
  const hash = crypto.createHash('sha256').update(fileBuffer).digest('hex');
  return hash.substring(0, 40); // Take first 40 chars for shorter filenames
}

// Images to optimize from OurPartners
const images = [
  { input: 'public/assets/174d9ed83a90c0514d54b7cbb68f8656ca74592c.png', name: 'partners-government' },
  { input: 'public/assets/0bb8e976afa37efb2547ff983a789a24c46bc909.png', name: 'partners-tourism' },
  { input: 'public/assets/0599bc8efb3df6cbf4d2b5cc07e1932dc0d2a400.png', name: 'partners-marketing' },
  { input: 'public/assets/d079f823333ca8bce293bcab9a39cb1aea4b5439.png', name: 'partners-enterprise' },
  { input: 'public/assets/ef25fd14e49122ddd6cbc03c8a92caff93500eb7.png', name: 'partners-pattern-1' },
  { input: 'public/assets/6cdd4333a240b46dead9df86c5a83772e81b76fc.png', name: 'partners-pattern-2' }
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
  console.log('🚀 Starting OurPartners image optimization...\n');
  
  const results = {};
  
  for (const image of images) {
    const optimizedFile = await optimizeImage(image.input, image.name);
    if (optimizedFile) {
      const path = `/optimized/our-partners/${optimizedFile}`;
      results[image.name] = path;
    }
  }
  
  console.log('\n📊 Optimization Complete!');
  console.log('========================================');
  console.log('\nOptimized paths for OurPartners component:');
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
