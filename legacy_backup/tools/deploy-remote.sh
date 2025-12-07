#!/bin/bash

# Remote Emulator Server Deployment Script
# This script helps deploy the emulator server to a remote server

set -e

echo "🚀 Remote Emulator Server Deployment Script"
echo "=========================================="

# Configuration
SERVER_HOST=${1:-"your-server.com"}
SERVER_USER=${2:-"root"}
SERVER_PORT=${3:-"22"}
DEPLOY_PATH=${4:-"/opt/remote-emulator"}

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

function print_step() {
    echo -e "${GREEN}[STEP]${NC} $1"
}

function print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

function print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if required tools are installed
print_step "Checking prerequisites..."

if ! command -v ssh &> /dev/null; then
    print_error "SSH client not found. Please install OpenSSH."
    exit 1
fi

if ! command -v rsync &> /dev/null; then
    print_error "rsync not found. Please install rsync."
    exit 1
fi

# Create deployment package
print_step "Creating deployment package..."

TEMP_DIR=$(mktemp -d)
DEPLOY_DIR="$TEMP_DIR/remote-emulator"

mkdir -p "$DEPLOY_DIR"

# Copy necessary files
cp tools/emulator-server-remote.js "$DEPLOY_DIR/"
cp tools/remote-config.env "$DEPLOY_DIR/.env.example"
cp tools/generate-ssl.sh "$DEPLOY_DIR/"
cp package.json "$DEPLOY_DIR/"

# Create production package.json
cat > "$DEPLOY_DIR/package.json" << 'EOF'
{
  "name": "remote-emulator-server",
  "version": "1.0.0",
  "description": "Remote Android Emulator Control Server",
  "main": "emulator-server-remote.js",
  "scripts": {
    "start": "node emulator-server-remote.js",
    "dev": "nodemon emulator-server-remote.js",
    "generate-ssl": "./generate-ssl.sh"
  },
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "ws": "^8.14.2"
  },
  "devDependencies": {
    "nodemon": "^3.0.1"
  },
  "engines": {
    "node": ">=16.0.0"
  }
}
EOF

# Create systemd service file
cat > "$DEPLOY_DIR/remote-emulator.service" << EOF
[Unit]
Description=Remote Android Emulator Server
After=network.target

[Service]
Type=simple
User=emulator
Group=emulator
WorkingDirectory=$DEPLOY_PATH
ExecStart=/usr/bin/node $DEPLOY_PATH/emulator-server-remote.js
Restart=always
RestartSec=10
Environment=NODE_ENV=production
Environment=ANDROID_HOME=/opt/android-sdk
Environment=ANDROID_SDK_ROOT=/opt/android-sdk

# Security settings
NoNewPrivileges=true
PrivateTmp=true
ProtectSystem=strict
ProtectHome=true
ReadWritePaths=$DEPLOY_PATH

[Install]
WantedBy=multi-user.target
EOF

# Create installation script
cat > "$DEPLOY_DIR/install.sh" << 'EOF'
#!/bin/bash

set -e

echo "🔧 Installing Remote Emulator Server..."

# Create emulator user
if ! id "emulator" &>/dev/null; then
    sudo useradd -r -s /bin/false -d /opt/remote-emulator emulator
    echo "✅ Created emulator user"
fi

# Install Node.js if not present
if ! command -v node &> /dev/null; then
    echo "📦 Installing Node.js..."
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    sudo apt-get install -y nodejs
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install --production

# Set up SSL certificates
if [ ! -f "ssl/cert.pem" ] || [ ! -f "ssl/key.pem" ]; then
    echo "🔐 Generating SSL certificates..."
    chmod +x generate-ssl.sh
    ./generate-ssl.sh
fi

# Set up environment
if [ ! -f ".env" ]; then
    echo "⚙️  Setting up environment configuration..."
    cp .env.example .env
    echo "📝 Please edit .env file with your configuration"
fi

# Set permissions
sudo chown -R emulator:emulator .
sudo chmod +x *.sh

# Install systemd service
if [ -f "remote-emulator.service" ]; then
    sudo cp remote-emulator.service /etc/systemd/system/
    sudo systemctl daemon-reload
    sudo systemctl enable remote-emulator
    echo "✅ Installed systemd service"
fi

echo "🎉 Installation completed!"
echo ""
echo "Next steps:"
echo "1. Edit .env file with your configuration"
echo "2. Start the service: sudo systemctl start remote-emulator"
echo "3. Check status: sudo systemctl status remote-emulator"
echo "4. View logs: sudo journalctl -u remote-emulator -f"
EOF

chmod +x "$DEPLOY_DIR/install.sh"

# Create firewall configuration
cat > "$DEPLOY_DIR/firewall-setup.sh" << 'EOF'
#!/bin/bash

echo "🔥 Setting up firewall rules for Remote Emulator Server..."

# Allow HTTP and HTTPS ports
sudo ufw allow 3002/tcp comment "Emulator HTTP API"
sudo ufw allow 3443/tcp comment "Emulator HTTPS API"

# Allow SSH (if not already allowed)
sudo ufw allow 22/tcp comment "SSH"

# Enable firewall if not already enabled
if ! sudo ufw status | grep -q "Status: active"; then
    echo "⚠️  Enabling UFW firewall..."
    sudo ufw --force enable
fi

echo "✅ Firewall rules configured"
sudo ufw status
EOF

chmod +x "$DEPLOY_DIR/firewall-setup.sh"

# Create nginx configuration
cat > "$DEPLOY_DIR/nginx-emulator.conf" << 'EOF'
# Nginx configuration for Remote Emulator Server
# Place this file in /etc/nginx/sites-available/ and create a symlink in sites-enabled

upstream emulator_backend {
    server 127.0.0.1:3002;
}

upstream emulator_secure_backend {
    server 127.0.0.1:3443;
}

# HTTP server - redirect to HTTPS
server {
    listen 80;
    server_name hemangpandhi.com www.hemangpandhi.com;
    
    # Redirect all HTTP requests to HTTPS
    return 301 https://$server_name$request_uri;
}

# HTTPS server
server {
    listen 443 ssl http2;
    server_name hemangpandhi.com www.hemangpandhi.com;
    
    # SSL configuration
    ssl_certificate /opt/remote-emulator/ssl/cert.pem;
    ssl_certificate_key /opt/remote-emulator/ssl/key.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;
    
    # Security headers
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    
    # Proxy to emulator server
    location /api/ {
        proxy_pass http://emulator_secure_backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 86400;
    }
    
    # WebSocket proxy
    location / {
        proxy_pass http://emulator_secure_backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 86400;
    }
}
EOF

print_step "Deployment package created in $DEPLOY_DIR"

# Deploy to remote server
if [ "$SERVER_HOST" != "your-server.com" ]; then
    print_step "Deploying to $SERVER_USER@$SERVER_HOST:$SERVER_PORT..."
    
    # Create remote directory
    ssh -p "$SERVER_PORT" "$SERVER_USER@$SERVER_HOST" "sudo mkdir -p $DEPLOY_PATH && sudo chown $SERVER_USER:$SERVER_USER $DEPLOY_PATH"
    
    # Sync files
    rsync -avz --progress -e "ssh -p $SERVER_PORT" "$DEPLOY_DIR/" "$SERVER_USER@$SERVER_HOST:$DEPLOY_PATH/"
    
    print_step "Running installation on remote server..."
    ssh -p "$SERVER_PORT" "$SERVER_USER@$SERVER_HOST" "cd $DEPLOY_PATH && chmod +x install.sh && ./install.sh"
    
    print_step "Setting up firewall..."
    ssh -p "$SERVER_PORT" "$SERVER_USER@$SERVER_HOST" "cd $DEPLOY_PATH && chmod +x firewall-setup.sh && ./firewall-setup.sh"
    
    echo ""
    echo -e "${GREEN}🎉 Deployment completed successfully!${NC}"
    echo ""
    echo "Next steps on your server:"
    echo "1. Edit configuration: ssh -p $SERVER_PORT $SERVER_USER@$SERVER_HOST 'sudo nano $DEPLOY_PATH/.env'"
    echo "2. Start the service: ssh -p $SERVER_PORT $SERVER_USER@$SERVER_HOST 'sudo systemctl start remote-emulator'"
    echo "3. Check status: ssh -p $SERVER_PORT $SERVER_USER@$SERVER_HOST 'sudo systemctl status remote-emulator'"
    echo "4. View logs: ssh -p $SERVER_PORT $SERVER_USER@$SERVER_HOST 'sudo journalctl -u remote-emulator -f'"
    echo ""
    echo "For HTTPS setup:"
    echo "1. Get SSL certificates from Let's Encrypt: sudo certbot certonly --standalone -d hemangpandhi.com"
    echo "2. Update nginx configuration: sudo cp $DEPLOY_PATH/nginx-emulator.conf /etc/nginx/sites-available/"
    echo "3. Enable site: sudo ln -s /etc/nginx/sites-available/nginx-emulator.conf /etc/nginx/sites-enabled/"
    echo "4. Restart nginx: sudo systemctl restart nginx"
    
else
    print_warning "Server host not specified. Deployment package ready in: $DEPLOY_DIR"
    echo ""
    echo "To deploy manually:"
    echo "1. Copy the contents of $DEPLOY_DIR to your server"
    echo "2. Run ./install.sh on the server"
    echo "3. Configure your environment in .env file"
    echo "4. Start the service"
fi

# Cleanup
rm -rf "$TEMP_DIR"

echo ""
echo "📋 Deployment Summary:"
echo "====================="
echo "✅ Remote emulator server created"
echo "✅ SSL certificate generation script included"
echo "✅ Systemd service configuration included"
echo "✅ Firewall rules configuration included"
echo "✅ Nginx reverse proxy configuration included"
echo "✅ Installation and setup scripts included"
echo ""
echo "🔧 Server Requirements:"
echo "- Ubuntu/Debian server with root access"
echo "- Node.js 16+ installed"
echo "- Android SDK installed and configured"
echo "- Ports 3002 (HTTP) and 3443 (HTTPS) available"
echo "- Domain name pointing to server IP (for HTTPS)"
