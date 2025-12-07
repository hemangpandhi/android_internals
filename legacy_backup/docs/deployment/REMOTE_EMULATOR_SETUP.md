# Remote Android Emulator Control Setup

This guide explains how to set up remote Android emulator control for your website `hemangpandhi.com`.

## Overview

The remote emulator control system allows you to:
- Run Android emulators on your server PC
- Control them remotely from your website
- Stream emulator screens in real-time
- Send touch inputs and gestures
- Monitor performance metrics

## Architecture

```
Website (hemangpandhi.com) 
    ↓ HTTPS/WSS
Remote Server (your-server.com)
    ↓ Android SDK
Android Emulator
```

## Prerequisites

### Server Requirements
- Ubuntu/Debian server with root access
- Node.js 16+ installed
- Android SDK installed and configured
- At least 8GB RAM (recommended 16GB+)
- Fast CPU with virtualization support
- Stable internet connection

### Domain Setup
- Domain `hemangpandhi.com` pointing to your server IP
- SSL certificate (Let's Encrypt recommended)

## Deployment Options

### Option 1: Automated Deployment (Recommended)

1. **Run the deployment script:**
   ```bash
   ./tools/deploy-remote.sh your-server.com root 22
   ```

2. **Follow the post-deployment steps shown in the script output**

### Option 2: Manual Deployment

1. **Prepare the server:**
   ```bash
   # Install Node.js
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   
   # Install Android SDK
   wget https://dl.google.com/android/repository/commandlinetools-linux-9477386_latest.zip
   unzip commandlinetools-linux-9477386_latest.zip
   sudo mkdir -p /opt/android-sdk/cmdline-tools
   sudo mv cmdline-tools /opt/android-sdk/cmdline-tools/latest
   
   # Set environment variables
   echo 'export ANDROID_HOME=/opt/android-sdk' >> ~/.bashrc
   echo 'export PATH=$PATH:$ANDROID_HOME/cmdline-tools/latest/bin:$ANDROID_HOME/platform-tools' >> ~/.bashrc
   source ~/.bashrc
   ```

2. **Install Android SDK components:**
   ```bash
   sdkmanager "platform-tools" "platforms;android-33" "system-images;android-33;google_apis;x86_64"
   ```

3. **Create AVD:**
   ```bash
   avdmanager create avd -n "Pixel_XL_API_33" -k "system-images;android-33;google_apis;x86_64"
   ```

4. **Deploy the emulator server:**
   ```bash
   # Copy files to server
   scp -r tools/emulator-server-remote.js user@server:/opt/remote-emulator/
   scp tools/remote-config.env user@server:/opt/remote-emulator/.env
   
   # Install dependencies
   ssh user@server "cd /opt/remote-emulator && npm install"
   ```

## Configuration

### Environment Variables

Create a `.env` file on your server:

```bash
# Server Configuration
HTTP_PORT=3002
HTTPS_PORT=3443
HOST=0.0.0.0

# SSL Configuration
SSL_CERT_PATH=/opt/remote-emulator/ssl/cert.pem
SSL_KEY_PATH=/opt/remote-emulator/ssl/key.pem

# Security Configuration
ALLOWED_ORIGINS=https://hemangpandhi.com,https://www.hemangpandhi.com
EMULATOR_API_KEY=your-secure-api-key-here

# Android SDK Configuration
ANDROID_HOME=/opt/android-sdk
ANDROID_SDK_ROOT=/opt/android-sdk
```

### SSL Certificates

#### Option 1: Let's Encrypt (Recommended for Production)
```bash
# Install certbot
sudo apt install certbot

# Generate certificate
sudo certbot certonly --standalone -d hemangpandhi.com -d www.hemangpandhi.com

# Update paths in .env
SSL_CERT_PATH=/etc/letsencrypt/live/hemangpandhi.com/fullchain.pem
SSL_KEY_PATH=/etc/letsencrypt/live/hemangpandhi.com/privkey.pem
```

#### Option 2: Self-Signed (Development)
```bash
cd /opt/remote-emulator
./generate-ssl.sh
```

## Security Configuration

### Firewall Setup
```bash
# Allow required ports
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw allow 3002/tcp  # Emulator HTTP API (optional)
sudo ufw allow 3443/tcp  # Emulator HTTPS API (optional)

# Enable firewall
sudo ufw enable
```

### Nginx Reverse Proxy (Recommended)

1. **Install Nginx:**
   ```bash
   sudo apt install nginx
   ```

2. **Create configuration:**
   ```bash
   sudo cp /opt/remote-emulator/nginx-emulator.conf /etc/nginx/sites-available/
   sudo ln -s /etc/nginx/sites-available/nginx-emulator.conf /etc/nginx/sites-enabled/
   ```

3. **Test and restart:**
   ```bash
   sudo nginx -t
   sudo systemctl restart nginx
   ```

### API Key Security (Optional)
Set a strong API key in your `.env` file:
```bash
EMULATOR_API_KEY=$(openssl rand -hex 32)
```

## Running the Service

### Using Systemd (Recommended)
```bash
# Start service
sudo systemctl start remote-emulator

# Enable auto-start
sudo systemctl enable remote-emulator

# Check status
sudo systemctl status remote-emulator

# View logs
sudo journalctl -u remote-emulator -f
```

### Manual Start
```bash
cd /opt/remote-emulator
node emulator-server-remote.js
```

## Frontend Integration

### Update Your Website

1. **Replace the local emulator control page** with `emulator-control-remote.html`

2. **Update connection settings** in the HTML:
   ```javascript
   // The frontend will automatically detect HTTPS/WSS for port 3443
   const host = 'hemangpandhi.com';
   const port = '3443'; // Use HTTPS port
   ```

3. **Add to your website navigation:**
   ```html
   <a href="/emulator-control-remote.html">Remote Emulator Control</a>
   ```

### CORS Configuration

The server is configured to allow requests from:
- `https://hemangpandhi.com`
- `https://www.hemangpandhi.com`

Add additional origins in the `ALLOWED_ORIGINS` environment variable if needed.

## Testing the Setup

### 1. Health Check
```bash
curl https://hemangpandhi.com:3443/health
```

### 2. List Emulators
```bash
curl https://hemangpandhi.com:3443/api/emulators
```

### 3. WebSocket Test
Use the browser developer console:
```javascript
const ws = new WebSocket('wss://hemangpandhi.com:3443');
ws.onopen = () => console.log('Connected');
ws.onmessage = (event) => console.log('Message:', event.data);
```

## Performance Optimization

### Server Optimization
```bash
# Increase file descriptor limits
echo "* soft nofile 65536" >> /etc/security/limits.conf
echo "* hard nofile 65536" >> /etc/security/limits.conf

# Optimize kernel parameters
echo "net.core.rmem_max = 16777216" >> /etc/sysctl.conf
echo "net.core.wmem_max = 16777216" >> /etc/sysctl.conf
sysctl -p
```

### Emulator Performance
- Use hardware acceleration: `-gpu host`
- Allocate sufficient RAM: `-memory 4096`
- Use SSD storage for better I/O performance
- Enable KVM for x86_64 emulators

### Network Optimization
- Use wired connection for server
- Ensure low latency between website and server
- Consider CDN for static assets

## Monitoring and Maintenance

### Log Monitoring
```bash
# Real-time logs
sudo journalctl -u remote-emulator -f

# Log rotation
sudo nano /etc/logrotate.d/remote-emulator
```

### Performance Monitoring
```bash
# Check emulator processes
ps aux | grep emulator

# Monitor network connections
ss -tulpn | grep :3002
ss -tulpn | grep :3443

# Check memory usage
free -h
```

### Backup Strategy
```bash
# Backup AVDs
tar -czf avd-backup.tar.gz ~/.android/avd/

# Backup configuration
tar -czf config-backup.tar.gz /opt/remote-emulator/.env /opt/remote-emulator/ssl/
```

## Troubleshooting

### Common Issues

#### 1. Emulator Won't Start
```bash
# Check Android SDK installation
ls -la $ANDROID_HOME

# Verify AVD exists
avdmanager list avd

# Check emulator binary
ls -la $ANDROID_HOME/emulator/emulator
```

#### 2. WebSocket Connection Failed
- Check firewall rules
- Verify SSL certificates
- Check nginx configuration
- Review browser console for errors

#### 3. Performance Issues
- Monitor server resources (CPU, RAM, disk I/O)
- Check network latency
- Optimize emulator settings
- Consider server upgrade

#### 4. Permission Issues
```bash
# Fix ownership
sudo chown -R emulator:emulator /opt/remote-emulator

# Fix permissions
sudo chmod +x /opt/remote-emulator/emulator-server-remote.js
```

### Debug Mode
```bash
# Run with debug logging
DEBUG=* node emulator-server-remote.js

# Check system resources
htop
iotop
```

## Security Considerations

1. **API Key**: Use strong, random API keys
2. **HTTPS Only**: Always use HTTPS in production
3. **Firewall**: Restrict access to necessary ports only
4. **Updates**: Keep server and dependencies updated
5. **Monitoring**: Monitor logs for suspicious activity
6. **Backup**: Regular backups of configuration and data

## Scaling Considerations

For high-traffic scenarios:
1. **Load Balancing**: Use multiple server instances
2. **Database**: Store emulator state in database
3. **Queue System**: Implement job queue for emulator management
4. **Caching**: Cache frequently accessed data
5. **CDN**: Use CDN for static assets

## Support

For issues and questions:
1. Check the logs: `sudo journalctl -u remote-emulator -f`
2. Verify configuration: `cat /opt/remote-emulator/.env`
3. Test connectivity: `curl https://hemangpandhi.com:3443/health`
4. Check system resources: `htop`, `free -h`, `df -h`

---

**Note**: This setup provides a production-ready remote emulator control system. Make sure to follow security best practices and monitor the system regularly.
