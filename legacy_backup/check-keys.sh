#!/bin/bash
echo "🔍 EmailJS Key Checker"
echo "====================="
echo ""

# Read public key from config.js
PUBLIC_KEY=$(grep -oP "publicKey:\s*'[^']+'" config.js | grep -oP "'[^']+'" | tr -d "'" 2>/dev/null)

if [ -z "$PUBLIC_KEY" ]; then
    echo "❌ Could not read public key from config.js"
    exit 1
fi

echo "✅ Public Key (from config.js):"
echo "   $PUBLIC_KEY"
echo "   Length: ${#PUBLIC_KEY} characters"
echo ""

# Check private key
if [ -z "$EMAILJS_PRIVATE_KEY" ]; then
    echo "❌ EMAILJS_PRIVATE_KEY is not set"
    echo ""
    echo "Set it with:"
    echo "  export EMAILJS_PRIVATE_KEY='your_private_key'"
    exit 1
fi

echo "✅ Private Key (from environment):"
echo "   First 10: ${EMAILJS_PRIVATE_KEY:0:10}..."
echo "   Last 4: ...${EMAILJS_PRIVATE_KEY: -4}"
echo "   Length: ${#EMAILJS_PRIVATE_KEY} characters"
echo ""

# Check for common issues
echo "🔍 Checking for common issues:"
echo ""

# Check for spaces
if [[ "$EMAILJS_PRIVATE_KEY" =~ [[:space:]] ]]; then
    echo "   ⚠️  WARNING: Private key contains spaces!"
    echo "      Remove any spaces from the key"
else
    echo "   ✅ No spaces in private key"
fi

# Check for quotes
if [[ "$EMAILJS_PRIVATE_KEY" =~ ^[\'\"] ]] || [[ "$EMAILJS_PRIVATE_KEY" =~ [\'\"]$ ]]; then
    echo "   ⚠️  WARNING: Private key may have quotes!"
    echo "      Make sure quotes are only around the value, not in it"
else
    echo "   ✅ No quote issues detected"
fi

# Check key format
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
echo "📋 Next Steps:"
echo "   1. Verify both keys in EmailJS Dashboard:"
echo "      https://dashboard.emailjs.com/admin/integration"
echo "   2. Make sure Public Key matches: $PUBLIC_KEY"
echo "   3. Make sure Private Key matches what you set"
echo "   4. Both keys must be from the SAME account and key pair"
echo ""
echo "🧪 To test API connection:"
echo "   export EMAILJS_USER_ID=\"$PUBLIC_KEY\""
echo "   node test-emailjs-api.js"
