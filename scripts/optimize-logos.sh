#!/bin/bash

# Logo optimization script using TinyPNG API
API_KEY="V4fXVCFR2PkwMXbNGq2YDHLW3XXtHXkz"
LOGOS_DIR="/Users/eslamsamy/projects/KayanLive/kayanlive-main/public/logos"
OUTPUT_DIR="/Users/eslamsamy/projects/KayanLive/kayanlive-main/public/optimized/logos-tinypng"

echo "🎯 Starting logo optimization with TinyPNG..."

# Optimize key logos (the ones showing warnings)
PRIORITY_LOGOS=(
    "tatweer.png"
    "elm-ksa.png"
    "tawal-ksa.png"
    "go-telecom-ksa.png"
    "dhcc.png"
    "thiqah-ksa.png"
    "modon-ksa-1.png"
    "mave-marketing.png"
    "tdra.png"
    "adnoc.png"
    "solutions-by-stc.png"
    "dct-abu-dhabi.jpeg"
    "mohap.jpeg"
    "hisense.jpeg"
    "hopscotch.jpeg"
    "smt.jpeg"
    "haboob-ksa.jpeg"
)

for logo in "${PRIORITY_LOGOS[@]}"; do
    if [ -f "$LOGOS_DIR/$logo" ]; then
        echo "🔄 Optimizing $logo..."

        # Get file extension
        filename=$(basename "$logo")
        name="${filename%.*}"

        # Optimize with TinyPNG
        response=$(curl -s -u "api:$API_KEY" \
            --data-binary @"$LOGOS_DIR/$logo" \
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

            echo "✅ $logo → $name.webp"
        else
            echo "❌ Failed to optimize $logo"
        fi

        # Small delay to respect API limits
        sleep 1
    fi
done

echo "🎉 Logo optimization complete!"