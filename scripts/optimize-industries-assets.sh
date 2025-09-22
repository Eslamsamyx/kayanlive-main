#!/bin/bash

# Industries component assets optimization script using TinyPNG API
API_KEY="V4fXVCFR2PkwMXbNGq2YDHLW3XXtHXkz"
ASSETS_DIR="/Users/eslamsamy/projects/KayanLive/kayanlive-main/public/assets"
OUTPUT_DIR="/Users/eslamsamy/projects/KayanLive/kayanlive-main/public/optimized/industries-assets"

echo "🎯 Starting Industries component assets optimization with TinyPNG..."

# Create output directory
mkdir -p "$OUTPUT_DIR"

# Assets to optimize (from Industries component)
ASSETS=(
    "cb192ab808312901ac705768d1f69f35ae3c9f61.png"  # Government
    "79b8becbbe666db19c2c2dfdebe436eebf271e2e.png"   # Multinational/Enterprise
    "97b98a652c6210a2b4e884e84040708ab75a45fc.png"   # Real Estate
    "123269087423c903b101b9352bd92acdab49d86a.png"  # Event Planners/Agencies
    "ef25fd14e49122ddd6cbc03c8a92caff93500eb7.png"   # CTA Background Pattern
    "6cdd4333a240b46dead9df86c5a83772e81b76fc.png"   # Gallery Thumbnail Pattern
)

for asset in "${ASSETS[@]}"; do
    if [ -f "$ASSETS_DIR/$asset" ]; then
        echo "🔄 Optimizing $asset..."

        # Get file name without extension
        filename=$(basename "$asset")
        name="${filename%.*}"

        # Optimize with TinyPNG (non-aggressive settings by default)
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

echo "🎉 Industries component assets optimization complete!"
echo "📁 Optimized files saved to: $OUTPUT_DIR"