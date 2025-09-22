#!/bin/bash

# Achievements component image optimization script using TinyPNG API
API_KEY="V4fXVCFR2PkwMXbNGq2YDHLW3XXtHXkz"
ASSETS_DIR="/Users/eslamsamy/projects/KayanLive/kayanlive-main/public/assets"
OUTPUT_DIR="/Users/eslamsamy/projects/KayanLive/kayanlive-main/public/optimized/achievements"

echo "🎯 Starting Achievements component image optimization with TinyPNG..."

# Create output directory
mkdir -p "$OUTPUT_DIR"

# Image to optimize
ACHIEVEMENT_PATTERN="638442c54db92ce49b3ad8194a062a52ba973004.png"

if [ -f "$ASSETS_DIR/$ACHIEVEMENT_PATTERN" ]; then
    echo "🔄 Optimizing $ACHIEVEMENT_PATTERN..."

    # Get file name without extension
    filename=$(basename "$ACHIEVEMENT_PATTERN")
    name="${filename%.*}"

    # Optimize with TinyPNG (non-aggressive settings by default)
    response=$(curl -s -u "api:$API_KEY" \
        --data-binary @"$ASSETS_DIR/$ACHIEVEMENT_PATTERN" \
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

        echo "✅ $ACHIEVEMENT_PATTERN → $name.webp"

        # Show file size comparison
        original_size=$(wc -c < "$ASSETS_DIR/$ACHIEVEMENT_PATTERN")
        optimized_size=$(wc -c < "$OUTPUT_DIR/$name.webp")
        reduction=$(echo "scale=1; (($original_size - $optimized_size) * 100) / $original_size" | bc)
        echo "📊 Size: $original_size bytes → $optimized_size bytes (${reduction}% reduction)"
    else
        echo "❌ Failed to optimize $ACHIEVEMENT_PATTERN"
        echo "Response: $response"
    fi
else
    echo "⚠️  File not found: $ASSETS_DIR/$ACHIEVEMENT_PATTERN"
fi

echo "🎉 Achievements component image optimization complete!"
echo "📁 Optimized file saved to: $OUTPUT_DIR"