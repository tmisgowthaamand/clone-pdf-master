#!/bin/bash
# Extreme Performance Deployment Script
# Optimized for Vercel and Render

echo "🚀 Starting Extreme Performance Build..."

# Clean previous builds
echo "🧹 Cleaning previous builds..."
rm -rf dist
rm -rf node_modules/.vite

# Install dependencies with optimizations
echo "📦 Installing dependencies..."
npm ci --prefer-offline --no-audit --no-fund

# Build with maximum optimizations
echo "⚡ Building with extreme optimizations..."
NODE_ENV=production npm run build

# Verify build
if [ -d "dist" ]; then
    echo "✅ Build successful!"
    echo "📊 Build size:"
    du -sh dist
    echo "📁 Files:"
    find dist -type f | wc -l
else
    echo "❌ Build failed!"
    exit 1
fi

echo "🎉 Deployment ready!"
echo "📍 Deploy to Vercel: vercel --prod"
echo "📍 Deploy to Render: git push origin main"
