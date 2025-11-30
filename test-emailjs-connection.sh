#!/bin/bash
# Interactive script to test EmailJS API connection

echo "🔌 EmailJS API Connection Test"
echo "================================"
echo ""

# Get public key from config.js (macOS compatible)
PUBLIC_KEY=$(grep "publicKey:" config.js | sed -E "s/.*publicKey:[[:space:]]*'([^']+)'.*/\1/" | head -1 2>/dev/null || echo "")

if [ -n "$PUBLIC_KEY" ]; then
    echo "✅ Found Public Key in config.js: ${PUBLIC_KEY:0:8}..."
    echo ""
else
    echo "⚠️  Could not read public key from config.js"
    read -p "Enter your EmailJS Public Key: " PUBLIC_KEY
fi

# Get private key
if [ -z "$EMAILJS_PRIVATE_KEY" ]; then
    echo ""
    echo "📋 To get your Private Key:"
    echo "   1. Go to: https://dashboard.emailjs.com/admin/integration"
    echo "   2. Find 'Private Key' or 'Access Token'"
    echo "   3. Copy the entire key"
    echo ""
    read -sp "Enter your EmailJS Private Key: " PRIVATE_KEY
    echo ""
    export EMAILJS_PRIVATE_KEY="$PRIVATE_KEY"
else
    echo "✅ Using EMAILJS_PRIVATE_KEY from environment"
fi

# Set User ID (same as Public Key)
export EMAILJS_USER_ID="$PUBLIC_KEY"

echo ""
echo "🧪 Testing connection..."
echo "   Public Key (User ID): ${PUBLIC_KEY:0:8}..."
echo "   Private Key: ${EMAILJS_PRIVATE_KEY:0:10}..."
echo ""

# Run the test
node test-emailjs-api.js

EXIT_CODE=$?

if [ $EXIT_CODE -eq 0 ]; then
    echo ""
    echo "✅ Connection successful!"
    echo ""
    echo "💡 To use these credentials in other scripts:"
    echo "   export EMAILJS_PRIVATE_KEY=\"$EMAILJS_PRIVATE_KEY\""
    echo "   export EMAILJS_USER_ID=\"$PUBLIC_KEY\""
else
    echo ""
    echo "❌ Connection failed!"
    echo ""
    echo "🔍 Troubleshooting:"
    echo "   1. Verify Private Key at: https://dashboard.emailjs.com/admin/integration"
    echo "   2. Make sure Public Key matches: ${PUBLIC_KEY:0:8}..."
    echo "   3. Check that both keys are from the same EmailJS account"
    echo ""
    echo "📖 For more help, see: docs/EMAILJS_API_SETUP.md"
fi

exit $EXIT_CODE

