#!/bin/bash
# Quick setup script for EmailJS API integration

set -e

echo "🚀 EmailJS API Setup - Quick Start"
echo "===================================="
echo ""

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "📦 Installing Vercel CLI..."
    npm install -g vercel
fi

# Check if logged in
if ! vercel whoami &> /dev/null; then
    echo "🔐 Please login to Vercel..."
    vercel login
fi

echo ""
echo "📋 Step 1: Test EmailJS API Connection"
echo ""

# Get credentials
if [ -z "$EMAILJS_PRIVATE_KEY" ]; then
    echo "Enter your EmailJS Private Key:"
    echo "   Get it from: https://dashboard.emailjs.com/admin/integration"
    read -sp "EMAILJS_PRIVATE_KEY: " EMAILJS_PRIVATE_KEY
    echo ""
    export EMAILJS_PRIVATE_KEY
fi

# Get public key from config.js
PUBLIC_KEY=$(grep -oP "publicKey:\s*'[^']+'" config.js | grep -oP "'[^']+'" | tr -d "'" 2>/dev/null || echo "")
if [ -z "$PUBLIC_KEY" ]; then
    echo "⚠️  Could not read public key from config.js"
    read -p "Enter your EmailJS Public Key (User ID): " PUBLIC_KEY
fi

export EMAILJS_USER_ID="$PUBLIC_KEY"

echo ""
echo "🧪 Testing API connection..."
node test-emailjs-api.js

if [ $? -ne 0 ]; then
    echo ""
    echo "❌ API test failed. Please check your credentials."
    exit 1
fi

echo ""
echo "✅ API test passed!"
echo ""
echo "📦 Step 2: Deploying to Vercel..."
echo ""

# Deploy
vercel --prod

echo ""
echo "🔧 Step 3: Setting Environment Variables..."
echo ""

# Set environment variables
echo "Setting EMAILJS_PRIVATE_KEY..."
echo "$EMAILJS_PRIVATE_KEY" | vercel env add EMAILJS_PRIVATE_KEY production 2>&1 | grep -v "password" || echo "⚠️  May already be set"

echo ""
echo "Setting EMAILJS_USER_ID..."
echo "$EMAILJS_USER_ID" | vercel env add EMAILJS_USER_ID production 2>&1 | grep -v "password" || echo "⚠️  May already be set"

echo ""
echo "🔄 Step 4: Redeploying with environment variables..."
vercel --prod

echo ""
echo "✅ Deployment complete!"
echo ""
echo "📋 Next Steps:"
echo ""
echo "1. Copy your function URL from above (looks like:"
echo "   https://your-project.vercel.app/api/emailjs-contacts)"
echo ""
echo "2. Go to: https://www.hemangpandhi.com/newsletter-admin.html?pwd=your_password"
echo ""
echo "3. Click '🔌 Sync from EmailJS API'"
echo ""
echo "4. Paste your function URL"
echo ""
echo "5. Click '⚡ Live Sync' to test"
echo ""
echo "✅ Done! Subscribers will now load from EmailJS API securely."

