const tinify = require("tinify");
const fs = require("fs");
const path = require("path");

// TinyPNG API key
tinify.key = "V4fXVCFR2PkwMXbNGq2YDHLW3XXtHXkz";

const IMAGES_TO_OPTIMIZE = [
  {
    src: "/optimized/hero-main/01f5d49d03c8455dc99b2ad32446b6657b1949e0-hero-main-mobile.webp",
    name: "hero-main-ultra-mobile"
  }
];

const OUTPUT_DIR = path.join(process.cwd(), "public", "optimized", "ultra-mobile");

// Create output directory if it doesn't exist
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

async function optimizeImage(imagePath, outputName) {
  try {
    const inputPath = path.join(process.cwd(), "public", imagePath);

    if (!fs.existsSync(inputPath)) {
      console.log(`⚠️  Source file not found: ${imagePath}`);
      return;
    }

    const source = tinify.fromFile(inputPath);

    // Ultra compress and resize for mobile
    const resized = source.resize({
      method: "fit",
      width: 400,
      height: 300
    });

    const converted = resized.convert({
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
  console.log("🚀 Starting ULTRA mobile optimization...\n");

  for (const img of IMAGES_TO_OPTIMIZE) {
    await optimizeImage(img.src, img.name);
  }

  console.log("\n✨ Ultra mobile optimization complete!");
}

main().catch(console.error);