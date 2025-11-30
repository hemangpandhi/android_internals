#!/bin/bash
# Script to verify EmailJS key configuration

echo "🔍 EmailJS Key Verification"
echo "============================"
echo ""

# Read public key from config.js
PUBLIC_KEY=$(grep -oP "publicKey:\s*'[^']+'" config.js | grep -oP "'[^']+'" | tr -d "'" || echo "")

if [ -z "$PUBLIC_KEY" ]; then
    echo "❌ Could not read public key from config.js"
    exit 1
fi

echo "✅ Public Key (from config.js):"
echo "   $PUBLIC_KEY"
echo ""

# Check if private key is set
if [ -z "$EMAILJS_PRIVATE_KEY" ]; then
    echo "⚠️  EMAILJS_PRIVATE_KEY is not set"
    echo ""
    echo "To test, run:"
    echo "  export EMAILJS_PRIVATE_KEY='your_private_key'"
    echo "  ./verify-emailjs-keys.sh"
    exit 1
fi

echo "✅ Private Key (from environment):"
echo "   ${EMAILJS_PRIVATE_KEY:0:10}...${EMAILJS_PRIVATE_KEY: -4}"
echo ""

# Check key format
echo "🔍 Key Format Check:"
if [[ "$PUBLIC_KEY" =~ ^[A-Za-z0-9_-]+$ ]]; then
    echo "   ✅ Public key format looks valid"
else
    echo "   ⚠️  Public key format may be invalid"
fi

if [[ "$EMAILJS_PRIVATE_KEY" =~ ^[A-Za-z0-9_-]+$ ]]; then
    echo "   ✅ Private key format looks valid"
else
    echo "   ⚠️  Private key format may be invalid"
fi

echo ""
echo "📋 Important Checks:"
echo "   1. Both keys must be from the SAME EmailJS account"
echo "   2. Both keys must be the NEWLY GENERATED ones (if you regenerated)"
echo "   3. Private key should NOT have any spaces or quotes"
echo "   4. Public key in config.js should match your EmailJS dashboard"
echo ""

# Test API connection
echo "🧪 Testing API connection..."
export EMAILJS_USER_ID="$PUBLIC_KEY"
node test-emailjs-api.js

EXIT_CODE=$?

if [ $EXIT_CODE -ne 0 ]; then
    echo ""
    echo "❌ API test failed!"
    echo ""
    echo "💡 Troubleshooting steps:"
    echo "   1. Go to https://dashboard.emailjs.com/admin/integration"
    echo "   2. Verify your Private Key matches what you set"
    echo "   3. Verify your Public Key matches config.js: $PUBLIC_KEY"
    echo "   4. Make sure both keys are from the same account"
    echo "   5. If you regenerated keys, make sure you're using the NEW ones"
    echo ""
    echo "📝 To get fresh keys:"
    echo "   1. Go to EmailJS Dashboard → Account → API Keys"
    echo "   2. Click 'Regenerate' if needed"
    echo "   3. Copy the NEW Private Key"
    echo "   4. Copy the NEW Public Key"
    echo "   5. Update config.js with new Public Key"
    echo "   6. Set EMAILJS_PRIVATE_KEY with new Private Key"
fi

exit $EXIT_CODE

