#!/bin/bash

# WhyKayanLive assets optimization script using TinyPNG API
API_KEY="V4fXVCFR2PkwMXbNGq2YDHLW3XXtHXkz"
ASSETS_DIR="/Users/eslamsamy/projects/KayanLive/kayanlive-main/public/assets"
OUTPUT_DIR="/Users/eslamsamy/projects/KayanLive/kayanlive-main/public/optimized/whykayan-assets"

echo "🎯 Starting WhyKayanLive assets optimization with TinyPNG..."

# Create output directory
mkdir -p "$OUTPUT_DIR"

# Assets to optimize (from WhyKayanLive component)
ASSETS=(
    "1349ad630f81a3bb2a509dd8abfe0e4ef85fa329.png"  # Decorative pattern
    "a01d943cb7ebcf5598b83131f56810cf97a4e883.png"   # KayanLive logo
)

for asset in "${ASSETS[@]}"; do
    if [ -f "$ASSETS_DIR/$asset" ]; then
        echo "🔄 Optimizing $asset..."

        # Get file name without extension
        filename=$(basename "$asset")
        name="${filename%.*}"

        # Optimize with TinyPNG
        response=$(curl -s -u "api:$API_KEY" \
            --data-binary @"$ASSETS_DIR/$asset" \
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

            echo "✅ $asset → $name.webp"

            # Show file size comparison
            original_size=$(wc -c < "$ASSETS_DIR/$asset")
            optimized_size=$(wc -c < "$OUTPUT_DIR/$name.webp")
            reduction=$(echo "scale=1; (($original_size - $optimized_size) * 100) / $original_size" | bc)
            echo "📊 Size: $original_size bytes → $optimized_size bytes (${reduction}% reduction)"
        else
            echo "❌ Failed to optimize $asset"
            echo "Response: $response"
        fi

        # Small delay to respect API limits
        sleep 1
    else
        echo "⚠️  File not found: $ASSETS_DIR/$asset"
    fi
done

echo "🎉 WhyKayanLive assets optimization complete!"
echo "📁 Optimized files saved to: $OUTPUT_DIR"