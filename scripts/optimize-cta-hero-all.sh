#!/bin/bash

# CallToActionHero complete optimization script using TinyPNG API
API_KEY="V4fXVCFR2PkwMXbNGq2YDHLW3XXtHXkz"
ASSETS_DIR="/Users/eslamsamy/projects/KayanLive/kayanlive-main/public/assets"
OUTPUT_DIR="/Users/eslamsamy/projects/KayanLive/kayanlive-main/public/optimized/cta-hero-complete"

echo "🎯 Starting CallToActionHero complete image optimization with TinyPNG..."

# Create output directory
mkdir -p "$OUTPUT_DIR"

# Images to optimize
IMAGES=(
    "29064c5a0d86395e45b642fe4e6daf670490f723.png"  # Main background
    "ef25fd14e49122ddd6cbc03c8a92caff93500eb7.png"   # Pattern 1
    "6cdd4333a240b46dead9df86c5a83772e81b76fc.png"   # Pattern 2
)

for image in "${IMAGES[@]}"; do
    if [ -f "$ASSETS_DIR/$image" ]; then
        echo "🔄 Optimizing $image..."

        # Get file name without extension
        filename=$(basename "$image")
        name="${filename%.*}"

        # Optimize with TinyPNG (non-aggressive settings by default)
        response=$(curl -s -u "api:$API_KEY" \
            --data-binary @"$ASSETS_DIR/$image" \
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

            echo "✅ $image → $name.webp"

            # Show file size comparison
            original_size=$(wc -c < "$ASSETS_DIR/$image")
            optimized_size=$(wc -c < "$OUTPUT_DIR/$name.webp")
            reduction=$(echo "scale=1; (($original_size - $optimized_size) * 100) / $original_size" | bc)
            echo "📊 Size: $original_size bytes → $optimized_size bytes (${reduction}% reduction)"
        else
            echo "❌ Failed to optimize $image"
            echo "Response: $response"
        fi

        # Small delay to respect API limits
        sleep 1
    else
        echo "⚠️  File not found: $ASSETS_DIR/$image"
    fi
done

echo "🎉 CallToActionHero complete optimization done!"
echo "📁 Optimized files saved to: $OUTPUT_DIR"