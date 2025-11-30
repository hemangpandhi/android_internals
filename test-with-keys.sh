#!/bin/bash
# Quick test script - prompts for private key

echo "🔐 EmailJS API Test"
echo "=================="
echo ""
echo "Your Public Key (User ID): ZV2P-4FW2xmtKUGWl"
echo ""
echo "📋 To get your Private Key:"
echo "   1. Go to: https://dashboard.emailjs.com/admin/integration"
echo "   2. Find 'Private Key' or 'Access Token'"
echo "   3. Copy the ENTIRE key"
echo ""
read -sp "Paste your Private Key here: " PRIVATE_KEY
echo ""
echo ""

# Test with the keys
EMAILJS_PRIVATE_KEY="$PRIVATE_KEY" EMAILJS_USER_ID="ZV2P-4FW2xmtKUGWl" node test-emailjs-api.js
