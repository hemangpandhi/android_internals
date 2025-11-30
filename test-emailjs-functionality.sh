#!/bin/bash
echo "🔍 EmailJS Functionality Check"
echo "=============================="
echo ""

# Check config.js
echo "1. Checking config.js..."
if [ -f "config.js" ]; then
    PUBLIC_KEY=$(grep -oP "publicKey:\s*'[^']+'" config.js | grep -oP "'[^']+'" | tr -d "'" 2>/dev/null)
    SERVICE_ID=$(grep -oP "serviceId:\s*'[^']+'" config.js | grep -oP "'[^']+'" | tr -d "'" 2>/dev/null)
    CONTACT_TEMPLATE=$(grep -oP "contactTemplate:\s*'[^']+'" config.js | grep -oP "'[^']+'" | tr -d "'" 2>/dev/null)
    NEWSLETTER_TEMPLATE=$(grep -oP "newsletterTemplate:\s*'[^']+'" config.js | grep -oP "'[^']+'" | tr -d "'" 2>/dev/null)
    
    if [ -n "$PUBLIC_KEY" ] && [ "$PUBLIC_KEY" != "YOUR_EMAILJS_PUBLIC_KEY_HERE" ]; then
        echo "   ✅ Public Key: $PUBLIC_KEY"
    else
        echo "   ❌ Public Key: Not configured"
    fi
    
    if [ -n "$SERVICE_ID" ] && [ "$SERVICE_ID" != "YOUR_EMAILJS_SERVICE_ID_HERE" ]; then
        echo "   ✅ Service ID: $SERVICE_ID"
    else
        echo "   ❌ Service ID: Not configured"
    fi
    
    if [ -n "$CONTACT_TEMPLATE" ] && [ "$CONTACT_TEMPLATE" != "YOUR_CONTACT_TEMPLATE_ID_HERE" ]; then
        echo "   ✅ Contact Template: $CONTACT_TEMPLATE"
    else
        echo "   ❌ Contact Template: Not configured"
    fi
    
    if [ -n "$NEWSLETTER_TEMPLATE" ] && [ "$NEWSLETTER_TEMPLATE" != "YOUR_NEWSLETTER_TEMPLATE_ID_HERE" ]; then
        echo "   ✅ Newsletter Template: $NEWSLETTER_TEMPLATE"
    else
        echo "   ❌ Newsletter Template: Not configured"
    fi
else
    echo "   ❌ config.js not found"
fi

echo ""
echo "2. Checking EmailJS initialization..."
INIT_CHECK=$(grep -c "emailjs.init" config.js 2>/dev/null || echo "0")
if [ "$INIT_CHECK" -gt 0 ]; then
    echo "   ✅ EmailJS initialization code found"
else
    echo "   ⚠️  EmailJS initialization code not found"
fi

echo ""
echo "3. Checking form handlers..."
NEWSLETTER_FORM=$(grep -c "newsletterForm" assets/js/scripts.js 2>/dev/null || echo "0")
CONTACT_FORM=$(grep -c "contactForm" assets/js/scripts.js 2>/dev/null || echo "0")
if [ "$NEWSLETTER_FORM" -gt 0 ]; then
    echo "   ✅ Newsletter form handler found"
else
    echo "   ❌ Newsletter form handler not found"
fi
if [ "$CONTACT_FORM" -gt 0 ]; then
    echo "   ✅ Contact form handler found"
else
    echo "   ❌ Contact form handler not found"
fi

echo ""
echo "4. Checking template usage..."
CONTACT_TEMPLATE_USAGE=$(grep -c "contactTemplate" assets/js/scripts.js 2>/dev/null || echo "0")
NEWSLETTER_TEMPLATE_USAGE=$(grep -c "newsletterTemplate" assets/js/scripts.js 2>/dev/null || echo "0")
echo "   Contact template references: $CONTACT_TEMPLATE_USAGE"
echo "   Newsletter template references: $NEWSLETTER_TEMPLATE_USAGE"

echo ""
echo "✅ Functionality check complete!"
echo ""
echo "📋 Next steps:"
echo "   1. Test newsletter subscription form on website"
echo "   2. Test contact form on website"
echo "   3. Check EmailJS dashboard for email delivery"
echo "   4. Test newsletter admin panel"
