#!/bin/bash
# Test Vercel API endpoints

echo "🧪 Testing Vercel API Endpoints"
echo "================================"
echo ""

# Get URL from config.js
VERCEL_URL=$(grep "authApiUrl:" config.js | sed -E "s/.*authApiUrl:\s*'https?:\/\/([^']+)'.*/\1/" | head -1)

if [ -z "$VERCEL_URL" ]; then
    echo "❌ Could not find Vercel URL in config.js"
    echo ""
    echo "Please check:"
    echo "1. Go to: https://vercel.com/androidinternals-projects/android-internals"
    echo "2. Find your project URL"
    echo "3. Update config.js with correct URL"
    exit 1
fi

echo "📋 Using Vercel URL: $VERCEL_URL"
echo ""

# Test auth endpoint
echo "1️⃣ Testing /api/auth-github?action=login"
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "https://$VERCEL_URL/api/auth-github?action=login")
if [ "$HTTP_CODE" = "302" ] || [ "$HTTP_CODE" = "200" ]; then
    echo "   ✅ Endpoint exists (HTTP $HTTP_CODE)"
else
    echo "   ❌ Endpoint not found (HTTP $HTTP_CODE)"
fi
echo ""

# Test EmailJS endpoint
echo "2️⃣ Testing /api/emailjs-contacts"
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "https://$VERCEL_URL/api/emailjs-contacts")
if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "401" ] || [ "$HTTP_CODE" = "500" ]; then
    echo "   ✅ Endpoint exists (HTTP $HTTP_CODE)"
else
    echo "   ❌ Endpoint not found (HTTP $HTTP_CODE)"
fi
echo ""

# Test subscribers endpoint
echo "3️⃣ Testing /api/subscribers-db"
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "https://$VERCEL_URL/api/subscribers-db")
if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "401" ] || [ "$HTTP_CODE" = "500" ]; then
    echo "   ✅ Endpoint exists (HTTP $HTTP_CODE)"
else
    echo "   ❌ Endpoint not found (HTTP $HTTP_CODE)"
fi
echo ""

echo "📋 Summary:"
echo "   If all endpoints show 404, functions might not be deployed"
echo "   Check: https://vercel.com/androidinternals-projects/android-internals/deployments"
echo "   → Latest deployment → Functions tab"
