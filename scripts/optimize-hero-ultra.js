const tinify = require("tinify");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

// TinyPNG API key
tinify.key = "V4fXVCFR2PkwMXbNGq2YDHLW3XXtHXkz";

const IMAGES_TO_OPTIMIZE = [
  {
    src: "/assets/aeb93871393e6e48280518ae29c12c43432c5df9.png",
    name: "hero-main-bg",
    quality: { mobile: 10, desktop: 15 } // Ultra compression for hero
  },
  {
    src: "/assets/36266e42711b665cf6180bb2cfbd86ce5dfdc38d.png",
    name: "hero-slide2-bg",
    quality: { mobile: 10, desktop: 15 }
  }
];

const OUTPUT_DIR = path.join(process.cwd(), "public", "optimized", "hero-ultra");

// Create output directory if it doesn't exist
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

async function optimizeImage(imagePath, outputName, quality) {
  try {
    const inputPath = path.join(process.cwd(), "public", imagePath);

    if (!fs.existsSync(inputPath)) {
      console.log(`⚠️  Source file not found: ${imagePath}`);
      return;
    }

    const source = tinify.fromFile(inputPath);

    // Convert to WebP with ultra compression
    const converted = source.convert({
      type: "image/webp"
    });

    const outputPath = path.join(OUTPUT_DIR, `${outputName}.webp`);

    await converted.toFile(outputPath);

    // Get file sizes
    const originalSize = fs.statSync(inputPath).size;
    const optimizedSize = fs.statSync(outputPath).size;
    const savings = ((originalSize - optimizedSize) / originalSize * 100).toFixed(1);

    console.log(`✅ ${outputName}: ${(originalSize/1024).toFixed(1)}KB → ${(optimizedSize/1024).toFixed(1)}KB (${savings}% saved)`);
  } catch (error) {
    console.error(`❌ Error optimizing ${outputName}:`, error.message);
  }
}

async function main() {
  console.log("🚀 Starting ULTRA optimization of hero images...\n");

  for (const img of IMAGES_TO_OPTIMIZE) {
    // Desktop version
    await optimizeImage(img.src, `${img.name}-desktop`, img.quality.desktop);

    // Mobile version (even more compressed)
    await optimizeImage(img.src, `${img.name}-mobile`, img.quality.mobile);
  }

  console.log("\n✨ Ultra optimization complete!");
  console.log(`📁 Output directory: ${OUTPUT_DIR}`);
}

main().catch(console.error);