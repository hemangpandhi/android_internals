#!/bin/bash
# Deployment script for EmailJS serverless function

set -e

echo "🚀 Deploying EmailJS Serverless Function to Vercel"
echo ""

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI not found. Installing..."
    npm install -g vercel
fi

# Check if logged in
if ! vercel whoami &> /dev/null; then
    echo "🔐 Please login to Vercel..."
    vercel login
fi

# Extract public key from config.js
PUBLIC_KEY=$(grep -oP "publicKey:\s*'[^']+'" config.js | grep -oP "'[^']+'" | tr -d "'" || echo "")
if [ -n "$PUBLIC_KEY" ]; then
    echo "📋 Current EmailJS Configuration:"
    echo "   Public Key (User ID): $PUBLIC_KEY"
    echo ""
else
    echo "⚠️  Could not read public key from config.js"
    echo "   Please set EMAILJS_USER_ID manually"
    echo ""
fi

# Prompt for private key if not set
if [ -z "$EMAILJS_PRIVATE_KEY" ]; then
    echo "⚠️  EMAILJS_PRIVATE_KEY not set in environment"
    echo ""
    echo "Please provide your EmailJS Private Key:"
    echo "  1. Go to https://dashboard.emailjs.com/admin/integration"
    echo "  2. Copy your Private Key"
    echo ""
    read -sp "Enter EMAILJS_PRIVATE_KEY: " EMAILJS_PRIVATE_KEY
    echo ""
    export EMAILJS_PRIVATE_KEY
fi

# Set User ID from public key (read from config.js or use provided)
if [ -z "$EMAILJS_USER_ID" ]; then
    if [ -n "$PUBLIC_KEY" ]; then
        export EMAILJS_USER_ID="$PUBLIC_KEY"
    else
        echo "❌ EMAILJS_USER_ID not set and could not read from config.js"
        echo "   Please set: export EMAILJS_USER_ID='your_public_key'"
        exit 1
    fi
fi

echo "🧪 Testing EmailJS API connection..."
node test-emailjs-api.js

if [ $? -ne 0 ]; then
    echo ""
    echo "❌ API test failed. Please check your credentials."
    exit 1
fi

echo ""
echo "✅ API test passed!"
echo ""
echo "📦 Deploying to Vercel..."
echo ""

# Deploy
vercel --prod

echo ""
echo "🔧 Setting environment variables in Vercel..."
vercel env add EMAILJS_PRIVATE_KEY production <<< "$EMAILJS_PRIVATE_KEY" || echo "⚠️  EMAILJS_PRIVATE_KEY may already be set"
vercel env add EMAILJS_USER_ID production <<< "$EMAILJS_USER_ID" || echo "⚠️  EMAILJS_USER_ID may already be set"

echo ""
echo "🔄 Redeploying with environment variables..."
vercel --prod

echo ""
echo "✅ Deployment complete!"
echo ""
echo "📋 Next steps:"
echo "   1. Copy your function URL from above"
echo "   2. Go to https://www.hemangpandhi.com/newsletter-admin.html"
echo "   3. Click '🔌 Sync from EmailJS API'"
echo "   4. Paste your function URL"
echo "   5. Click '⚡ Live Sync' to test"
echo ""

