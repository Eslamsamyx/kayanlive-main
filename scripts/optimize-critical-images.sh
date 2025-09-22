#!/bin/bash

# CRITICAL IMAGE OPTIMIZATION SCRIPT FOR 100% LIGHTHOUSE PERFORMANCE
# This script ultra-compresses hero images to achieve <2.5s LCP

echo "🚀 CRITICAL: Ultra-optimizing hero images for 100% Lighthouse performance..."

# Create optimized directory structure
mkdir -p public/optimized/hero-ultra

# Hero images - ULTRA compression for maximum LCP performance
echo "⚡ Optimizing hero background images (quality 15-20)..."

# Desktop hero image - Ultra compression
if [ -f "public/optimized/hero/aeb93871393e6e48280518ae29c12c43432c5df9-hero-main-bg.webp" ]; then
    echo "  📱 Desktop hero: quality 15, 1600px max width"
    magick "public/optimized/hero/aeb93871393e6e48280518ae29c12c43432c5df9-hero-main-bg.webp" \
        -resize "1600x900>" \
        -quality 15 \
        -strip \
        -auto-orient \
        -interlace plane \
        "public/optimized/hero-ultra/hero-desktop-ultra.webp"
fi

# Mobile hero image - Ultra compression
if [ -f "public/optimized/hero/aeb93871393e6e48280518ae29c12c43432c5df9-hero-main-bg.webp" ]; then
    echo "  📱 Mobile hero: quality 15, 768px max width"
    magick "public/optimized/hero/aeb93871393e6e48280518ae29c12c43432c5df9-hero-main-bg.webp" \
        -resize "768x432>" \
        -quality 15 \
        -strip \
        -auto-orient \
        -interlace plane \
        "public/optimized/hero-ultra/hero-mobile-ultra.webp"
fi

# Secondary slide image - Ultra compression
if [ -f "public/optimized/hero/36266e42711b665cf6180bb2cfbd86ce5dfdc38d-hero-slide2-bg.webp" ]; then
    echo "  🎯 Slide 2 background: quality 20, 1200px max width"
    magick "public/optimized/hero/36266e42711b665cf6180bb2cfbd86ce5dfdc38d-hero-slide2-bg.webp" \
        -resize "1200x675>" \
        -quality 20 \
        -strip \
        -auto-orient \
        -interlace plane \
        "public/optimized/hero-ultra/hero-slide2-ultra.webp"
fi

# Logo images - Optimized for decorative use
echo "⚡ Optimizing decorative logo images..."

if [ -f "public/optimized/hero/f5bae82d42d75ffee835aede03ab3d50beabcc07-hero-k-mobile.webp" ]; then
    echo "  🎨 K logo: quality 50, 280px max width"
    magick "public/optimized/hero/f5bae82d42d75ffee835aede03ab3d50beabcc07-hero-k-mobile.webp" \
        -resize "280x446>" \
        -quality 50 \
        -strip \
        -auto-orient \
        "public/optimized/hero-ultra/k-logo-ultra.webp"
fi

if [ -f "public/optimized/hero/c3bd19974a833dd7b9c652f43779f65bc16ed61e-hero-logo-watermark.webp" ]; then
    echo "  🎨 Watermark logo: quality 40, 800px max width"
    magick "public/optimized/hero/c3bd19974a833dd7b9c652f43779f65bc16ed61e-hero-logo-watermark.webp" \
        -resize "800x267>" \
        -quality 40 \
        -strip \
        -auto-orient \
        "public/optimized/hero-ultra/watermark-logo-ultra.webp"
fi

echo "📊 File size comparison:"
echo "Before optimization:"
ls -lh public/optimized/hero/*.webp 2>/dev/null | awk '{print "  " $9 ": " $5}'

echo "After ultra-optimization:"
ls -lh public/optimized/hero-ultra/*.webp 2>/dev/null | awk '{print "  " $9 ": " $5}'

echo "✅ CRITICAL OPTIMIZATION COMPLETE!"
echo "🎯 Hero images optimized for <2.5s LCP target"
echo "🚀 Use these ultra-compressed images in Hero component for 100% Lighthouse score"