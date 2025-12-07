#!/bin/bash

# Android Emulator Setup Script
# This script helps set up the Android SDK and emulator environment

echo "🚀 Android Emulator Setup Script"
echo "================================"
echo ""

# Check if Android SDK is already configured
if [ -n "$ANDROID_HOME" ]; then
    echo "✅ ANDROID_HOME is set to: $ANDROID_HOME"
else
    echo "❌ ANDROID_HOME is not set"
    echo ""
    echo "Please set ANDROID_HOME environment variable to your Android SDK path."
    echo ""
    echo "Common locations:"
    echo "  macOS: ~/Library/Android/sdk"
    echo "  Linux: ~/Android/Sdk"
    echo "  Windows: %LOCALAPPDATA%\\Android\\Sdk"
    echo ""
    echo "To set it permanently, add to your ~/.bashrc or ~/.zshrc:"
    echo "  export ANDROID_HOME=~/Library/Android/sdk"
    echo "  export PATH=\$PATH:\$ANDROID_HOME/emulator"
    echo "  export PATH=\$PATH:\$ANDROID_HOME/tools"
    echo "  export PATH=\$PATH:\$ANDROID_HOME/tools/bin"
    echo "  export PATH=\$PATH:\$ANDROID_HOME/platform-tools"
    echo ""
fi

# Check for emulator binary
if command -v emulator &> /dev/null; then
    echo "✅ Emulator binary found"
    emulator -version
else
    echo "❌ Emulator binary not found in PATH"
    echo ""
    if [ -n "$ANDROID_HOME" ]; then
        EMULATOR_PATH="$ANDROID_HOME/emulator/emulator"
        if [ -f "$EMULATOR_PATH" ]; then
            echo "✅ Emulator found at: $EMULATOR_PATH"
            echo "Add to PATH: export PATH=\$PATH:\$ANDROID_HOME/emulator"
        else
            echo "❌ Emulator not found at expected location: $EMULATOR_PATH"
        fi
    fi
fi

echo ""

# Check for AVD Manager
if command -v avdmanager &> /dev/null; then
    echo "✅ AVD Manager found"
    echo ""
    echo "Available AVDs:"
    avdmanager list avd
else
    echo "❌ AVD Manager not found in PATH"
    echo ""
    if [ -n "$ANDROID_HOME" ]; then
        AVD_PATH="$ANDROID_HOME/tools/bin/avdmanager"
        if [ -f "$AVD_PATH" ]; then
            echo "✅ AVD Manager found at: $AVD_PATH"
            echo "Add to PATH: export PATH=\$PATH:\$ANDROID_HOME/tools/bin"
        else
            echo "❌ AVD Manager not found at expected location: $AVD_PATH"
        fi
    fi
fi

echo ""

# Check for ADB
if command -v adb &> /dev/null; then
    echo "✅ ADB found"
    adb version
else
    echo "❌ ADB not found in PATH"
    echo ""
    if [ -n "$ANDROID_HOME" ]; then
        ADB_PATH="$ANDROID_HOME/platform-tools/adb"
        if [ -f "$ADB_PATH" ]; then
            echo "✅ ADB found at: $ADB_PATH"
            echo "Add to PATH: export PATH=\$PATH:\$ANDROID_HOME/platform-tools"
        else
            echo "❌ ADB not found at expected location: $ADB_PATH"
        fi
    fi
fi

echo ""

# Installation instructions
echo "📋 Setup Instructions:"
echo "====================="
echo ""
echo "1. Install Android Studio:"
echo "   https://developer.android.com/studio"
echo ""
echo "2. Install Android SDK:"
echo "   - Open Android Studio"
echo "   - Go to Tools > SDK Manager"
echo "   - Install Android SDK Platform-Tools"
echo "   - Install Android Emulator"
echo ""
echo "3. Create AVD (Android Virtual Device):"
echo "   - Open Android Studio"
echo "   - Go to Tools > AVD Manager"
echo "   - Click 'Create Virtual Device'"
echo "   - Choose device and system image"
echo ""
echo "4. Set environment variables:"
echo "   export ANDROID_HOME=~/Library/Android/sdk"
echo "   export PATH=\$PATH:\$ANDROID_HOME/emulator"
echo "   export PATH=\$PATH:\$ANDROID_HOME/tools"
echo "   export PATH=\$PATH:\$ANDROID_HOME/tools/bin"
echo "   export PATH=\$PATH:\$ANDROID_HOME/platform-tools"
echo ""
echo "5. Start the emulator server:"
echo "   node tools/emulator-server.js"
echo ""
echo "6. Open the emulator control interface:"
echo "   http://localhost:3000/emulator-control.html"
echo ""

# Check if we can run the emulator server
echo "🧪 Testing Emulator Server:"
echo "==========================="

if command -v node &> /dev/null; then
    echo "✅ Node.js found"
    
    if [ -f "tools/emulator-server.js" ]; then
        echo "✅ Emulator server script found"
        echo ""
        echo "To start the emulator server:"
        echo "  node tools/emulator-server.js"
        echo ""
        echo "The server will run on port 3002 and provide the following endpoints:"
        echo "  GET  /api/emulators - List available AVDs"
        echo "  POST /api/emulators/{avdId}/launch - Launch emulator"
        echo "  POST /api/emulators/{avdId}/stop - Stop emulator"
        echo "  GET  /api/emulators/running - Get running emulators"
    else
        echo "❌ Emulator server script not found"
    fi
else
    echo "❌ Node.js not found"
    echo "Please install Node.js: https://nodejs.org/"
fi

echo ""
echo "🎉 Setup complete! Follow the instructions above to configure your environment."
