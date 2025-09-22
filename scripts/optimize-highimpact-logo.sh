#!/bin/bash

# HighImpactExperience logo optimization script using TinyPNG API
API_KEY="V4fXVCFR2PkwMXbNGq2YDHLW3XXtHXkz"
ASSETS_DIR="/Users/eslamsamy/projects/KayanLive/kayanlive-main/public/assets"
OUTPUT_DIR="/Users/eslamsamy/projects/KayanLive/kayanlive-main/public/optimized/highimpact-logo"

echo "🎯 Starting HighImpactExperience logo optimization with TinyPNG..."

# Create output directory
mkdir -p "$OUTPUT_DIR"

# Logo to optimize
LOGO_FILE="823c27de600ccd2f92af3e073c8e10df3a192e5c.png"

if [ -f "$ASSETS_DIR/$LOGO_FILE" ]; then
    echo "🔄 Optimizing $LOGO_FILE..."

    # Get file name without extension
    filename=$(basename "$LOGO_FILE")
    name="${filename%.*}"

    # Optimize with TinyPNG
    response=$(curl -s -u "api:$API_KEY" \
        --data-binary @"$ASSETS_DIR/$LOGO_FILE" \
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

        echo "✅ $LOGO_FILE → $name.webp"

        # Show file size comparison
        original_size=$(wc -c < "$ASSETS_DIR/$LOGO_FILE")
        optimized_size=$(wc -c < "$OUTPUT_DIR/$name.webp")
        reduction=$(echo "scale=1; (($original_size - $optimized_size) * 100) / $original_size" | bc)
        echo "📊 Size: $original_size bytes → $optimized_size bytes (${reduction}% reduction)"
    else
        echo "❌ Failed to optimize $LOGO_FILE"
        echo "Response: $response"
    fi

    # Small delay to respect API limits
    sleep 1
else
    echo "⚠️  File not found: $ASSETS_DIR/$LOGO_FILE"
fi

echo "🎉 HighImpactExperience logo optimization complete!"
echo "📁 Optimized file saved to: $OUTPUT_DIR"