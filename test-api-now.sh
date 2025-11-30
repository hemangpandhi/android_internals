#!/bin/bash
echo "🧪 Testing EmailJS API Connection"
echo ""
echo "You need your EmailJS Private Key from:"
echo "   https://dashboard.emailjs.com/admin/integration"
echo ""
read -sp "Enter your EMAILJS_PRIVATE_KEY: " PRIVATE_KEY
echo ""
export EMAILJS_PRIVATE_KEY="$PRIVATE_KEY"
# Extract public key from config.js if not set
if [ -z "$EMAILJS_USER_ID" ]; then
    EMAILJS_USER_ID=$(grep -oP "publicKey:\s*'[^']+'" config.js | grep -oP "'[^']+'" | tr -d "'" || echo "")
    if [ -z "$EMAILJS_USER_ID" ]; then
        echo "❌ Could not read EMAILJS_USER_ID from config.js"
        echo "   Please set: export EMAILJS_USER_ID='your_public_key'"
        exit 1
    fi
fi
export EMAILJS_USER_ID
echo ""
node test-emailjs-api.js
