#!/bin/bash

# SSL Certificate Generation Script for Remote Emulator Server
# This creates a self-signed certificate for development/testing
# For production, use certificates from a trusted CA like Let's Encrypt

echo "🔐 Generating SSL certificates for remote emulator server..."

# Create ssl directory if it doesn't exist
mkdir -p ssl

# Generate private key
echo "📝 Generating private key..."
openssl genrsa -out ssl/key.pem 2048

# Generate certificate signing request
echo "📝 Generating certificate signing request..."
openssl req -new -key ssl/key.pem -out ssl/cert.csr -subj "/C=US/ST=State/L=City/O=Organization/CN=hemangpandhi.com"

# Generate self-signed certificate (valid for 365 days)
echo "📝 Generating self-signed certificate..."
openssl x509 -req -days 365 -in ssl/cert.csr -signkey ssl/key.pem -out ssl/cert.pem

# Clean up CSR file
rm ssl/cert.csr

# Set proper permissions
chmod 600 ssl/key.pem
chmod 644 ssl/cert.pem

echo "✅ SSL certificates generated successfully!"
echo "📁 Certificate files:"
echo "   Private Key: ssl/key.pem"
echo "   Certificate: ssl/cert.pem"
echo ""
echo "⚠️  Note: This is a self-signed certificate for development."
echo "   For production, use certificates from a trusted CA like Let's Encrypt."
echo ""
echo "🔧 To use Let's Encrypt for production:"
echo "   1. Install certbot: sudo apt install certbot"
echo "   2. Generate certificate: sudo certbot certonly --standalone -d hemangpandhi.com"
echo "   3. Update SSL_CERT_PATH and SSL_KEY_PATH in your .env file"
