#!/bin/bash

echo "🔧 Fixing favicon links in HTML files..."

# Fix favicon links in all HTML files (except templates which are handled separately)
find . -name "*.html" -not -path "./templates/*" -exec sed -i '' 's|href="android_logo.PNG"|href="assets/images/android_logo.PNG"|g' {} \;

echo "✅ Favicon links fixed!"
