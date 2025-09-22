const tinify = require('tinify');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Set API key
tinify.key = process.env.TINYPNG_API_KEY || 'V4fXVCFR2PkwMXbNGq2YDHLW3XXtHXkz';

// Create output directory
const outputDir = path.join(__dirname, '../public/optimized/services');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Function to get file hash
function getFileHash(filePath) {
  const fileBuffer = fs.readFileSync(filePath);
  const hash = crypto.createHash('sha256').update(fileBuffer).digest('hex');
  return hash.substring(0, 40); // Take first 40 chars for shorter filenames
}

// Images to optimize - From ServicesGrid and ExperienceCenters
const images = [
  // ServicesGrid images
  { input: 'public/assets/e05fec393f295d237ade9dff2ad26793496382ba.png', name: '2d3d-content' },
  { input: 'public/assets/8980a40c08a52f165b1c17b24158f20160d003cc.png', name: 'video-editing' },
  { input: 'public/assets/273cea28658e9744d1cd2fbc64a5ba1ac7deeff8.png', name: 'conferences' },
  { input: 'public/assets/44d602b7f7ce040ad9592bf1e21de743a7ce86d1.png', name: 'hologram' },
  { input: 'public/assets/a255a0faf04e8dcc9b85bbbb16bca93169de897f.png', name: 'interactive' },
  { input: 'public/assets/123269087423c903b101b9352bd92acdab49d86a.png', name: 'corporate-events' },
  { input: 'public/assets/d4096bba6c0158e37ce51f8a24f9565b007aaa92.png', name: 'immersive-av' },
  { input: 'public/assets/409f7073bcfac7c1d7eea78ab2e23cc10f6a16fb.png', name: 'tech-driven' },
  { input: 'public/assets/cf27cb2a37e9e3bfd30c1ada4fe4988496b10bbb.png', name: 'live-events' },

  // ExperienceCenters images
  { input: 'public/assets/6cdd4333a240b46dead9df86c5a83772e81b76fc.png', name: 'pattern-0453' },
  { input: 'public/assets/bdd0b482d2a4b06725b67356c9cb8f5f989799c7.png', name: 'kansi-1' }
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
  console.log('🚀 Starting Services page image optimization...\n');

  const results = {
    servicesGrid: {},
    experienceCenters: {}
  };

  for (const image of images) {
    const optimizedFile = await optimizeImage(image.input, image.name);
    if (optimizedFile) {
      const path = `/optimized/services/${optimizedFile}`;

      // Categorize results
      if (image.name.includes('pattern') || image.name.includes('kansi')) {
        results.experienceCenters[image.name] = path;
      } else {
        results.servicesGrid[image.name] = path;
      }
    }
  }

  console.log('\n📊 Optimization Complete!');
  console.log('========================================');
  console.log('\nOptimized paths for ServicesGrid component:');
  console.log(JSON.stringify(results.servicesGrid, null, 2));
  console.log('\nOptimized paths for ExperienceCenters component:');
  console.log(JSON.stringify(results.experienceCenters, null, 2));

  // Check compression count
  try {
    const compressionCount = await tinify.compressionCount;
    console.log(`\n📈 API usage: ${compressionCount}/500 compressions this month`);
  } catch (e) {
    // Ignore validation errors
  }
}

main().catch(console.error);