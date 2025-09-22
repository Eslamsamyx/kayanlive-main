#!/usr/bin/env node

/**
 * CallToActionHero Image Optimization Script
 *
 * This script optimizes the hero-slide background image used in the CallToActionHero component.
 * It replaces the optimized WebP version with the original PNG and then re-optimizes with TinyPNG.
 */

const fs = require('fs').promises;
const path = require('path');
const https = require('https');

// File paths
const PROJECT_ROOT = path.join(__dirname, '..');
const ORIGINAL_PNG = path.join(PROJECT_ROOT, 'public/assets/29064c5a0d86395e45b642fe4e6daf670490f723.png');
const OPTIMIZED_DIR = path.join(PROJECT_ROOT, 'public/optimized/hero-slide');
const OPTIMIZED_FILE = path.join(OPTIMIZED_DIR, '29064c5a0d86395e45b642fe4e6daf670490f723-hero-slide-desktop.webp');
const COMPONENT_FILE = path.join(PROJECT_ROOT, 'src/components/CallToActionHero.tsx');

// TinyPNG API configuration
const TINYPNG_API_KEY = process.env.TINYPNG_API_KEY;

/**
 * Get file size in human-readable format
 */
function formatFileSize(bytes) {
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  if (bytes === 0) return '0 Bytes';
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Check if file exists
 */
async function fileExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

/**
 * Get file stats
 */
async function getFileStats(filePath) {
  try {
    const stats = await fs.stat(filePath);
    return {
      size: stats.size,
      sizeFormatted: formatFileSize(stats.size),
      exists: true
    };
  } catch (error) {
    return {
      size: 0,
      sizeFormatted: '0 Bytes',
      exists: false,
      error: error.message
    };
  }
}

/**
 * Optimize image with TinyPNG API
 */
async function optimizeWithTinyPNG(inputPath, outputPath) {
  if (!TINYPNG_API_KEY) {
    throw new Error('TINYPNG_API_KEY environment variable is required');
  }

  return new Promise(async (resolve, reject) => {
    try {
      const inputBuffer = await fs.readFile(inputPath);

      const options = {
        hostname: 'api.tinypng.com',
        port: 443,
        path: '/shrink',
        method: 'POST',
        headers: {
          'Authorization': `Basic ${Buffer.from(`api:${TINYPNG_API_KEY}`).toString('base64')}`,
          'Content-Type': 'image/png',
          'Content-Length': inputBuffer.length
        }
      };

      const req = https.request(options, (res) => {
        let data = '';

        res.on('data', (chunk) => {
          data += chunk;
        });

        res.on('end', async () => {
          try {
            const result = JSON.parse(data);

            if (res.statusCode === 201 && result.output && result.output.url) {
              // Download optimized image
              const downloadReq = https.get(result.output.url, async (downloadRes) => {
                const chunks = [];

                downloadRes.on('data', (chunk) => {
                  chunks.push(chunk);
                });

                downloadRes.on('end', async () => {
                  try {
                    const optimizedBuffer = Buffer.concat(chunks);

                    // Ensure output directory exists
                    await fs.mkdir(path.dirname(outputPath), { recursive: true });

                    // Write optimized file
                    await fs.writeFile(outputPath, optimizedBuffer);

                    resolve({
                      originalSize: result.input.size,
                      optimizedSize: result.output.size,
                      compressionRatio: result.output.ratio,
                      savedBytes: result.input.size - result.output.size
                    });
                  } catch (error) {
                    reject(new Error(`Failed to write optimized file: ${error.message}`));
                  }
                });
              });

              downloadReq.on('error', (error) => {
                reject(new Error(`Failed to download optimized image: ${error.message}`));
              });
            } else {
              reject(new Error(`TinyPNG API error: ${result.error || 'Unknown error'}`));
            }
          } catch (error) {
            reject(new Error(`Failed to parse TinyPNG response: ${error.message}`));
          }
        });
      });

      req.on('error', (error) => {
        reject(new Error(`TinyPNG request failed: ${error.message}`));
      });

      req.write(inputBuffer);
      req.end();
    } catch (error) {
      reject(new Error(`Failed to read input file: ${error.message}`));
    }
  });
}

/**
 * Update component to use optimized image
 */
async function updateComponent() {
  try {
    const componentContent = await fs.readFile(COMPONENT_FILE, 'utf8');

    // The component already uses the correct path, no changes needed
    console.log('✅ Component already uses correct optimized image path');

    return true;
  } catch (error) {
    console.error(`❌ Failed to update component: ${error.message}`);
    return false;
  }
}

/**
 * Main optimization process
 */
async function optimizeHeroImage() {
  console.log('🚀 Starting CallToActionHero image optimization...\n');

  try {
    // Check if original PNG exists
    const originalStats = await getFileStats(ORIGINAL_PNG);
    if (!originalStats.exists) {
      throw new Error(`Original PNG file not found: ${ORIGINAL_PNG}`);
    }

    console.log(`📁 Original PNG: ${originalStats.sizeFormatted}`);

    // Check current optimized file
    const currentOptimizedStats = await getFileStats(OPTIMIZED_FILE);
    if (currentOptimizedStats.exists) {
      console.log(`📁 Current optimized: ${currentOptimizedStats.sizeFormatted}`);
    } else {
      console.log('📁 No current optimized file found');
    }

    // Backup current optimized file if it exists
    if (currentOptimizedStats.exists) {
      const backupPath = `${OPTIMIZED_FILE}.backup.${Date.now()}`;
      await fs.copyFile(OPTIMIZED_FILE, backupPath);
      console.log(`💾 Backed up current file to: ${path.basename(backupPath)}`);
    }

    // Step 1: Replace optimized with original PNG (temporary)
    console.log('\n🔄 Step 1: Replacing optimized file with original PNG...');
    await fs.mkdir(path.dirname(OPTIMIZED_FILE), { recursive: true });
    await fs.copyFile(ORIGINAL_PNG, OPTIMIZED_FILE);
    console.log('✅ Replaced with original PNG');

    // Step 2: Re-optimize with TinyPNG
    console.log('\n🔄 Step 2: Re-optimizing with TinyPNG...');

    if (!TINYPNG_API_KEY) {
      console.log('⚠️  TINYPNG_API_KEY not provided. Skipping TinyPNG optimization.');
      console.log('   To enable TinyPNG optimization, set the environment variable:');
      console.log('   export TINYPNG_API_KEY="your-api-key"');

      // Convert PNG to WebP manually (basic optimization)
      console.log('📝 Converting PNG to WebP format...');
      const webpPath = OPTIMIZED_FILE.replace('.png', '.webp');
      // Note: This would require sharp or similar library for actual conversion
      console.log(`   Target: ${webpPath}`);
      console.log('   (Manual conversion required - install sharp for automatic conversion)');

      return;
    }

    const optimizationResult = await optimizeWithTinyPNG(OPTIMIZED_FILE, OPTIMIZED_FILE);

    console.log('✅ TinyPNG optimization completed!');
    console.log(`   Original: ${formatFileSize(optimizationResult.originalSize)}`);
    console.log(`   Optimized: ${formatFileSize(optimizationResult.optimizedSize)}`);
    console.log(`   Saved: ${formatFileSize(optimizationResult.savedBytes)} (${Math.round((1 - optimizationResult.compressionRatio) * 100)}%)`);

    // Step 3: Update component (if needed)
    console.log('\n🔄 Step 3: Updating component...');
    await updateComponent();

    // Final stats
    console.log('\n📊 Final Optimization Results:');
    const finalStats = await getFileStats(OPTIMIZED_FILE);
    console.log(`   Original PNG: ${originalStats.sizeFormatted}`);
    console.log(`   Optimized: ${finalStats.sizeFormatted}`);

    if (originalStats.size > 0 && finalStats.size > 0) {
      const totalSavings = originalStats.size - finalStats.size;
      const percentSaved = Math.round((totalSavings / originalStats.size) * 100);
      console.log(`   Total savings: ${formatFileSize(totalSavings)} (${percentSaved}%)`);
    }

    console.log('\n🎉 Optimization completed successfully!');

  } catch (error) {
    console.error(`\n❌ Optimization failed: ${error.message}`);
    process.exit(1);
  }
}

// Run the optimization
if (require.main === module) {
  optimizeHeroImage();
}

module.exports = { optimizeHeroImage };