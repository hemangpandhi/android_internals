#!/bin/bash

echo "🔐 Admin Panel Security Setup"
echo "=============================="
echo ""

# Check if .env already exists
if [ -f ".env" ]; then
    echo "⚠️  .env file already exists!"
    read -p "Do you want to overwrite it? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Setup cancelled."
        exit 1
    fi
fi

# Copy example file
if [ -f "env.example" ]; then
    cp env.example .env
    echo "✅ Created .env file from env.example"
else
    echo "❌ env.example not found!"
    exit 1
fi

echo ""
echo "🔧 Please set your secure admin credentials:"
echo ""

# Get admin username
read -p "Enter admin username (default: admin): " admin_username
admin_username=${admin_username:-admin}

# Get admin password
read -s -p "Enter admin password (required): " admin_password
echo ""

if [ -z "$admin_password" ]; then
    echo "❌ Password cannot be empty!"
    exit 1
fi

# Update .env file
sed -i.bak "s/ADMIN_USERNAME=.*/ADMIN_USERNAME=$admin_username/" .env
sed -i.bak "s/ADMIN_PASSWORD=.*/ADMIN_PASSWORD=$admin_password/" .env

# Remove backup file
rm .env.bak

echo ""
echo "✅ Admin credentials configured successfully!"
echo ""
echo "📋 Next steps:"
echo "1. Start the admin server: node tools/admin-server.js"
echo "2. Access admin panel: http://localhost:3001/login"
echo "3. Login with your new credentials"
echo ""
echo "🔒 Security notes:"
echo "- .env file is in .gitignore and will NOT be committed"
echo "- Change credentials regularly"
echo "- Use different credentials for production"
echo ""
echo "📖 For more info, see: docs/deployment/ADMIN_SECURITY.md"

