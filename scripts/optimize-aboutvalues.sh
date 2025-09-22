#!/bin/bash

# TinyPNG API Key
API_KEY="V4fXVCFR2PkwMXbNGq2YDHLW3XXtHXkz"

# Create output directory
mkdir -p public/optimized/aboutvalues

# Function to optimize and convert to WebP
optimize_image() {
    local input_file=$1
    local output_name=$2
    local hash=$(echo -n "$input_file" | shasum -a 256 | cut -d' ' -f1)
    local output_file="public/optimized/aboutvalues/${hash}-${output_name}.webp"

    echo "Optimizing $input_file -> $output_file"

    # Use TinyPNG API to optimize and convert to WebP
    curl -s --user api:$API_KEY \
         --data-binary @"$input_file" \
         -H "Content-Type: image/png" \
         https://api.tinify.com/convert \
         --dump-header /tmp/headers.txt \
         --output /tmp/temp_optimized.png

    # Get the WebP URL from TinyPNG
    curl -s --user api:$API_KEY \
         --header "Content-Type: application/json" \
         --data '{"convert":{"type":"image/webp"}}' \
         $(grep -i location /tmp/headers.txt | cut -d' ' -f2 | tr -d '\r') \
         --output "$output_file"

    echo "Created: $output_file"
}

# Optimize AboutValues images
echo "Starting AboutValues image optimization..."

# Value card images
optimize_image "public/assets/79b8becbbe666db19c2c2dfdebe436eebf271e2e.png" "purpose"
optimize_image "public/assets/fe74de8467bf5ef42975b489173519217b1b04d0.png" "precision"
optimize_image "public/assets/4bf06f33663f81bd327984084be746509f0caffd.png" "innovation"
optimize_image "public/assets/3bfce9db290033eb81342a31f55d19a490e552d3.png" "collaboration"
optimize_image "public/assets/c7e54c0605f6e122070c3da28c63679ca3742a85.png" "placeholder"

# Decorative SVG logo
optimize_image "public/assets/1349ad630f81a3bb2a509dd8abfe0e4ef85fa329.png" "logo-decoration"

# Bottom pattern
optimize_image "public/assets/7854b2fa3456db2dfe1f88a71484d2ef952fd4d6.png" "bottom-pattern"

echo "AboutValues image optimization complete!"
echo "Optimized images saved to: public/optimized/aboutvalues/"