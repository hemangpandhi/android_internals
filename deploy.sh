#!/bin/bash

echo "🚀 Deploying website to GitHub Pages..."

# Build the website
echo "📦 Building website..."
npm run build

# Copy built files to docs folder
echo "📁 Copying files to docs folder..."
rm -rf docs/*
cp -r build/* docs/
cp CNAME docs/

# Commit and push changes
echo "💾 Committing changes..."
git add .
git commit -m "Deploy website with latest changes"
git push origin master

echo "✅ Deployment complete!"
echo "🌐 Your website will be available at: https://www.hemangpandhi.com"
echo "⏱️  It may take a few minutes for changes to appear."
