#!/bin/bash

# Clean for GitHub Publishing Script
# This script removes sensitive files and build artifacts before pushing to GitHub

echo "🧹 Cleaning repository for GitHub publishing..."

# Remove sensitive files
echo "📁 Removing sensitive files..."
rm -f .env
rm -f config.js
rm -rf data/
rm -rf build/
rm -rf node_modules/
rm -f package-lock.json

# Remove any debug or temporary files
echo "🗑️ Removing debug and temporary files..."
find . -name "*.tmp" -delete
find . -name "*.temp" -delete
find . -name "*.log" -delete
find . -name "*.debug" -delete
rm -rf temp/ tmp/ debug/

# Remove IDE and OS files
echo "💻 Removing IDE and OS files..."
rm -rf .vscode/ .idea/
find . -name ".DS_Store" -delete
find . -name "Thumbs.db" -delete

# Create clean data directory structure
echo "📂 Creating clean data structure..."
mkdir -p data
echo '[]' > data/subscribers.json
echo '[]' > data/newsletter-queue.json

# Verify .gitignore is working
echo "🔍 Verifying .gitignore..."
if git check-ignore .env config.js data/subscribers.json data/newsletter-queue.json build/ node_modules/ > /dev/null 2>&1; then
    echo "✅ .gitignore is working correctly"
else
    echo "⚠️  Warning: Some sensitive files may not be ignored"
fi

# Check what will be committed
echo "📋 Files that will be committed:"
git status --porcelain

echo ""
echo "✅ Repository cleaned for GitHub publishing!"
echo ""
echo "📝 Next steps:"
echo "1. Review the files above"
echo "2. Add and commit: git add . && git commit -m 'Clean for GitHub Pages'"
echo "3. Push to GitHub: git push origin main"
echo "4. Set up GitHub Secrets (see DEPLOYMENT.md)"
echo "5. Configure GitHub Pages in repository settings"
echo ""
echo "🔒 Security reminder: Never commit .env, config.js, or data files!"


