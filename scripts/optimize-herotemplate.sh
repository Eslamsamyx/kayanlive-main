#!/bin/bash

# HeroTemplate image optimization script using TinyPNG API
API_KEY="V4fXVCFR2PkwMXbNGq2YDHLW3XXtHXkz"
ASSETS_DIR="/Users/eslamsamy/projects/KayanLive/kayanlive-main/public/assets"
OUTPUT_DIR="/Users/eslamsamy/projects/KayanLive/kayanlive-main/public/optimized/herotemplate"

echo "🎯 Starting HeroTemplate image optimization with TinyPNG..."

# Create output directory
mkdir -p "$OUTPUT_DIR"

# Image to optimize
HERO_IMAGE="1349ad630f81a3bb2a509dd8abfe0e4ef85fa329.png"

if [ -f "$ASSETS_DIR/$HERO_IMAGE" ]; then
    echo "🔄 Optimizing $HERO_IMAGE..."

    # Get file name without extension
    filename=$(basename "$HERO_IMAGE")
    name="${filename%.*}"

    # Optimize with TinyPNG (non-aggressive settings by default)
    response=$(curl -s -u "api:$API_KEY" \
        --data-binary @"$ASSETS_DIR/$HERO_IMAGE" \
        -X POST https://api.tinify.com/shrink)

    # Extract URL from response
    url=$(echo "$response" | grep -o '"url":"[^"]*' | cut -d'"' -f4)

    if [ ! -z "$url" ]; then
        # Convert to WebP
        curl -s -u "api:$API_KEY" \
            -H "Content-Type: application/json" \
            -d '{"convert":{"type":"image/webp"}}' \
            -X POST "$url" \
            -o "$OUTPUT_DIR/$name.webp"

        echo "✅ $HERO_IMAGE → $name.webp"

        # Show file size comparison
        original_size=$(wc -c < "$ASSETS_DIR/$HERO_IMAGE")
        optimized_size=$(wc -c < "$OUTPUT_DIR/$name.webp")
        reduction=$(echo "scale=1; (($original_size - $optimized_size) * 100) / $original_size" | bc)
        echo "📊 Size: $original_size bytes → $optimized_size bytes (${reduction}% reduction)"
    else
        echo "❌ Failed to optimize $HERO_IMAGE"
        echo "Response: $response"
    fi
else
    echo "⚠️  File not found: $ASSETS_DIR/$HERO_IMAGE"
fi

echo "🎉 HeroTemplate image optimization complete!"
echo "📁 Optimized file saved to: $OUTPUT_DIR"