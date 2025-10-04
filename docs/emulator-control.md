# Android Emulator Control System

## Overview

The Android Emulator Control system provides a web-based interface for managing and launching Android Virtual Devices (AVDs) directly from your browser. This system allows you to:

- List all available AVDs
- Launch emulators with custom configurations
- Stop running emulators
- Monitor emulator status and performance
- Configure emulator settings

## Features

### 🚀 Core Functionality
- **AVD Management**: List and manage all available Android Virtual Devices
- **Launch Control**: Start emulators with configurable options
- **Status Monitoring**: Real-time monitoring of emulator status
- **Web Interface**: Modern, responsive web UI for emulator control
- **API Integration**: RESTful API for programmatic access

### 📱 Emulator Operations
- **Launch**: Start emulators with custom launch parameters
- **Stop**: Gracefully shut down running emulators
- **Configure**: Modify emulator settings and hardware profiles
- **Monitor**: Track performance metrics and resource usage

### 🔧 Configuration Options
- **Hardware Acceleration**: Enable/disable hardware acceleration
- **Network Simulation**: Configure network speed and latency
- **Audio/Video**: Control audio and video settings
- **Boot Options**: Configure boot animation and system options

## Prerequisites

### Required Software
1. **Android SDK**: Must be installed and configured
2. **Android Emulator**: Emulator package from SDK Manager
3. **AVD Manager**: For creating and managing virtual devices
4. **Node.js**: For running the emulator API server

### Environment Setup
```bash
# Set Android SDK path
export ANDROID_HOME=~/Library/Android/sdk  # macOS
export ANDROID_HOME=~/Android/Sdk          # Linux
export ANDROID_HOME=%LOCALAPPDATA%\Android\Sdk  # Windows

# Add to PATH
export PATH=$PATH:$ANDROID_HOME/emulator
export PATH=$PATH:$ANDROID_HOME/tools
export PATH=$PATH:$ANDROID_HOME/tools/bin
export PATH=$PATH:$ANDROID_HOME/platform-tools
```

## Installation

### 1. Install Android SDK
```bash
# Using Android Studio (Recommended)
# Download from: https://developer.android.com/studio

# Or using command line tools
# Download from: https://developer.android.com/studio/command-line
```

### 2. Install Required Packages
```bash
# Install Android SDK Platform-Tools
sdkmanager "platform-tools"

# Install Android Emulator
sdkmanager "emulator"

# Install AVD Manager
sdkmanager "cmdline-tools;latest"
```

### 3. Create AVDs
```bash
# List available system images
sdkmanager --list | grep system-images

# Install system image
sdkmanager "system-images;android-34;google_apis;x86_64"

# Create AVD
avdmanager create avd -n "Pixel_7_API_34" -k "system-images;android-34;google_apis;x86_64"
```

### 4. Start Emulator Server
```bash
# Navigate to project directory
cd android_internals

# Start the emulator API server
node tools/emulator-server.js

# The server will run on port 3002
```

### 5. Access Web Interface
```bash
# Start the main web server
python3 -m http.server 3000

# Open in browser
open http://localhost:3000/emulator-control.html
```

## API Reference

### Endpoints

#### List Available Emulators
```http
GET /api/emulators
```

**Response:**
```json
[
  {
    "id": "Pixel_7_API_34",
    "name": "Pixel 7 API 34",
    "apiLevel": "34",
    "resolution": "1080x2400",
    "ram": "4GB",
    "storage": "32GB",
    "androidVersion": "Android 14"
  }
]
```

#### Launch Emulator
```http
POST /api/emulators/{avdId}/launch
Content-Type: application/json

{
  "noWindow": false,
  "noAudio": false,
  "noBootAnim": false,
  "writableSystem": false,
  "networkSpeed": "full",
  "networkDelay": "none"
}
```

**Response:**
```json
{
  "avdId": "Pixel_7_API_34",
  "pid": 12345,
  "status": "starting"
}
```

#### Stop Emulator
```http
POST /api/emulators/{avdId}/stop
```

**Response:**
```json
{
  "avdId": "Pixel_7_API_34",
  "status": "stopped"
}
```

#### Get Running Emulators
```http
GET /api/emulators/running
```

**Response:**
```json
["Pixel_7_API_34", "Pixel_6_API_33"]
```

## Usage Examples

### Basic Usage
```javascript
// List available emulators
fetch('/api/emulators')
  .then(response => response.json())
  .then(emulators => console.log(emulators));

// Launch an emulator
fetch('/api/emulators/Pixel_7_API_34/launch', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    noWindow: false,
    networkSpeed: 'full'
  })
})
.then(response => response.json())
.then(result => console.log(result));

// Stop an emulator
fetch('/api/emulators/Pixel_7_API_34/stop', {
  method: 'POST'
})
.then(response => response.json())
.then(result => console.log(result));
```

### Advanced Configuration
```javascript
// Launch with custom options
const launchOptions = {
  noWindow: false,        // Show emulator window
  noAudio: false,         // Enable audio
  noBootAnim: true,       // Skip boot animation
  writableSystem: false,  // Read-only system
  networkSpeed: 'edge',   // Slow network simulation
  networkDelay: 'gprs'    // Network latency simulation
};

fetch('/api/emulators/Pixel_7_API_34/launch', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(launchOptions)
});
```

## Troubleshooting

### Common Issues

#### Emulator Binary Not Found
```
Error: Emulator binary not found. Please set ANDROID_HOME environment variable.
```

**Solution:**
1. Set `ANDROID_HOME` environment variable
2. Add emulator to PATH: `export PATH=$PATH:$ANDROID_HOME/emulator`
3. Verify emulator binary exists: `ls $ANDROID_HOME/emulator/emulator`

#### AVD Manager Not Found
```
Error: AVD Manager not found
```

**Solution:**
1. Install command line tools: `sdkmanager "cmdline-tools;latest"`
2. Add to PATH: `export PATH=$PATH:$ANDROID_HOME/tools/bin`
3. Verify AVD Manager: `avdmanager list avd`

#### No AVDs Found
```
Error: No AVDs found
```

**Solution:**
1. Create AVD using Android Studio AVD Manager
2. Or create via command line:
   ```bash
   avdmanager create avd -n "MyAVD" -k "system-images;android-34;google_apis;x86_64"
   ```

#### Permission Issues
```
Error: Permission denied
```

**Solution:**
1. Ensure user has permission to access Android SDK directory
2. Check file permissions: `chmod +x $ANDROID_HOME/emulator/emulator`
3. Run with appropriate permissions if needed

### Performance Optimization

#### Hardware Acceleration
- Enable hardware acceleration for better performance
- Use Intel HAXM on Intel processors
- Use Hypervisor Framework on Apple Silicon

#### Memory Management
- Allocate sufficient RAM to emulators
- Close unnecessary applications
- Use snapshots for faster boot times

#### Network Configuration
- Use host networking for better performance
- Configure network speed simulation appropriately
- Monitor network usage

## Security Considerations

### Access Control
- The emulator API server runs on localhost by default
- Consider implementing authentication for production use
- Restrict access to trusted networks only

### Resource Limits
- Monitor system resources when running multiple emulators
- Implement resource limits to prevent system overload
- Clean up stopped emulators properly

### Data Protection
- Emulator data is stored in user directories
- Ensure proper file permissions
- Consider data encryption for sensitive testing

## Development

### Adding New Features
1. Modify `tools/emulator-server.js` for backend changes
2. Update `emulator-control.html` for frontend changes
3. Test with different AVD configurations
4. Update documentation

### Testing
```bash
# Test API endpoints
curl http://localhost:3002/api/emulators
curl -X POST http://localhost:3002/api/emulators/Pixel_7_API_34/launch
curl -X POST http://localhost:3002/api/emulators/Pixel_7_API_34/stop
curl http://localhost:3002/api/emulators/running
```

### Debugging
- Check server logs for errors
- Verify environment variables
- Test emulator commands manually
- Use browser developer tools for frontend issues

## Contributing

1. Fork the repository
2. Create a feature branch
3. Implement changes with tests
4. Submit a pull request
5. Update documentation

## License

This project is part of the Android Internals website and follows the same license terms.

## Support

For issues and questions:
1. Check the troubleshooting section
2. Review the API documentation
3. Test with the setup script
4. Create an issue on the repository
