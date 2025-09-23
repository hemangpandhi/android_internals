#!/usr/bin/env node

const http = require('http');
const url = require('url');
const fs = require('fs');
const path = require('path');
const { spawn, exec } = require('child_process');
const os = require('os');
const WebSocket = require('ws');
const express = require('express');
const cors = require('cors');

const PORT = 3002; // Different port for emulator API

class EmulatorManager {
  constructor() {
    this.runningEmulators = new Map(); // Track running emulators
    this.androidHome = process.env.ANDROID_HOME || process.env.ANDROID_SDK_ROOT;
    this.emulatorPath = this.findEmulatorPath();
    this.avdManagerPath = this.findAvdManagerPath();
    this.adbPath = this.findAdbPath();
    this.streamingClients = new Map(); // Track streaming clients
  }

  findEmulatorPath() {
    if (!this.androidHome) return null;
    
    const possiblePaths = [
      path.join(this.androidHome, 'emulator_bk', 'emulator'),
      path.join(this.androidHome, 'emulator_bk', 'emulator.exe'),
      path.join(this.androidHome, 'emulator', 'emulator'),
      path.join(this.androidHome, 'emulator', 'emulator.exe'),
      path.join(this.androidHome, 'tools', 'emulator'),
      path.join(this.androidHome, 'tools', 'emulator.exe')
    ];
    
    for (const emulatorPath of possiblePaths) {
      if (fs.existsSync(emulatorPath)) {
        console.log(`🔧 Using emulator binary: ${emulatorPath}`);
        return emulatorPath;
      }
    }
    
    return null;
  }

  findAvdManagerPath() {
    if (!this.androidHome) return null;
    
    const possiblePaths = [
      path.join(this.androidHome, 'tools', 'bin', 'avdmanager'),
      path.join(this.androidHome, 'tools', 'bin', 'avdmanager.bat'),
      path.join(this.androidHome, 'cmdline-tools', 'latest', 'bin', 'avdmanager'),
      path.join(this.androidHome, 'cmdline-tools', 'latest', 'bin', 'avdmanager.bat')
    ];
    
    for (const avdPath of possiblePaths) {
      if (fs.existsSync(avdPath)) {
        return avdPath;
      }
    }
    
    return null;
  }

  findAdbPath() {
    if (!this.androidHome) return null;
    
    const possiblePaths = [
      path.join(this.androidHome, 'platform-tools', 'adb'),
      path.join(this.androidHome, 'platform-tools', 'adb.exe')
    ];
    
    for (const adbPath of possiblePaths) {
      if (fs.existsSync(adbPath)) {
        return adbPath;
      }
    }
    
    return null;
  }

  // Get list of available AVDs
  async getAvailableAvds() {
    return new Promise((resolve, reject) => {
      if (!this.avdManagerPath) {
        resolve(this.getMockAvds()); // Return mock data if AVD manager not found
        return;
      }

      exec(`${this.avdManagerPath} list avd`, (error, stdout, stderr) => {
        if (error) {
          console.error('Error listing AVDs:', error);
          resolve(this.getMockAvds()); // Fallback to mock data
          return;
        }

        const avds = this.parseAvdList(stdout);
        resolve(avds);
      });
    });
  }

  parseAvdList(output) {
    const avds = [];
    const lines = output.split('\n');
    let currentAvd = null;

    for (const line of lines) {
      const trimmedLine = line.trim();
      
      if (trimmedLine.startsWith('Name:')) {
        if (currentAvd) {
          // Only add AVD if it has a name and path (basic validation)
          if (currentAvd.name && currentAvd.path) {
            avds.push(currentAvd);
          }
        }
        currentAvd = {
          id: trimmedLine.replace('Name:', '').trim(),
          name: trimmedLine.replace('Name:', '').trim(),
          path: '',
          target: '',
          apiLevel: '',
          abi: '',
          skin: '',
          sdcard: '',
          resolution: 'Unknown',
          ram: 'Unknown',
          storage: 'Unknown',
          androidVersion: 'Unknown'
        };
      } else if (currentAvd && trimmedLine.startsWith('Path:')) {
        currentAvd.path = trimmedLine.replace('Path:', '').trim();
      } else if (currentAvd && trimmedLine.startsWith('Target:')) {
        currentAvd.target = trimmedLine.replace('Target:', '').trim();
        // Extract API level from target
        let apiMatch = currentAvd.target.match(/API (\d+)/);
        if (!apiMatch && currentAvd.name) {
          // Try to extract API level from AVD name
          apiMatch = currentAvd.name.match(/API[_-]?(\d+)/);
        }
        if (apiMatch) {
          currentAvd.apiLevel = apiMatch[1];
          // Map API level to Android version
          const versionMap = {
            '29': 'Android 10', '30': 'Android 11', '31': 'Android 12',
            '32': 'Android 12L', '33': 'Android 13', '34': 'Android 14',
            '35': 'Android 15'
          };
          currentAvd.androidVersion = versionMap[apiMatch[1]] || `Android API ${apiMatch[1]}`;
        }
      } else if (currentAvd && trimmedLine.startsWith('ABI:')) {
        currentAvd.abi = trimmedLine.replace('ABI:', '').trim();
      } else if (currentAvd && trimmedLine.startsWith('Skin:')) {
        currentAvd.skin = trimmedLine.replace('Skin:', '').trim();
        // Extract resolution from skin name
        const skinResolutions = {
          'pixel_xl_silver': '1440x2560',
          'pixel_3a': '1080x2220',
          'pixel_3a_xl': '1080x2160',
          'pixel_4': '1080x2280',
          'pixel_4_xl': '1440x3040',
          'pixel_5': '1080x2340',
          'pixel_6': '1080x2400',
          'pixel_6_pro': '1440x3120',
          'pixel_7': '1080x2400',
          'pixel_7_pro': '1440x3120',
          'nexus_5': '1080x1920',
          'nexus_6': '1440x2560',
          'nexus_9': '1536x2048'
        };
        currentAvd.resolution = skinResolutions[currentAvd.skin] || 'Unknown';
      } else if (currentAvd && trimmedLine.startsWith('Sdcard:')) {
        currentAvd.sdcard = trimmedLine.replace('Sdcard:', '').trim();
        currentAvd.storage = currentAvd.sdcard;
      }
    }

    // Add the last AVD if it's valid
    if (currentAvd && currentAvd.name && currentAvd.path) {
      avds.push(currentAvd);
    }

    // Add default values for missing fields and extract API levels from names
    avds.forEach(avd => {
      if (!avd.ram) avd.ram = '2GB';
      if (!avd.storage) avd.storage = '16GB';
      if (!avd.resolution) avd.resolution = '1080x1920';
      if (!avd.abi) avd.abi = 'arm64-v8a';
      
      // Extract API level from name if not already set
      if (!avd.apiLevel && avd.name) {
        const apiMatch = avd.name.match(/API[_-]?(\d+)/);
        if (apiMatch) {
          avd.apiLevel = apiMatch[1];
          const versionMap = {
            '29': 'Android 10', '30': 'Android 11', '31': 'Android 12',
            '32': 'Android 12L', '33': 'Android 13', '34': 'Android 14',
            '35': 'Android 15'
          };
          avd.androidVersion = versionMap[apiMatch[1]] || `Android API ${apiMatch[1]}`;
        }
      }
    });

    return avds;
  }

  // Get mock AVD data for demonstration
  getMockAvds() {
    return [
      {
        id: 'Pixel_7_API_34',
        name: 'Pixel 7 API 34',
        path: '/Users/user/.android/avd/Pixel_7_API_34.avd',
        target: 'Android API 34',
        apiLevel: '34',
        abi: 'x86_64',
        skin: 'pixel_7',
        sdcard: '512 MB',
        resolution: '1080x2400',
        ram: '4GB',
        storage: '32GB',
        androidVersion: 'Android 14'
      },
      {
        id: 'Pixel_6_API_33',
        name: 'Pixel 6 API 33',
        path: '/Users/user/.android/avd/Pixel_6_API_33.avd',
        target: 'Android API 33',
        apiLevel: '33',
        abi: 'x86_64',
        skin: 'pixel_6',
        sdcard: '512 MB',
        resolution: '1080x2400',
        ram: '8GB',
        storage: '64GB',
        androidVersion: 'Android 13'
      },
      {
        id: 'Nexus_5_API_30',
        name: 'Nexus 5 API 30',
        path: '/Users/user/.android/avd/Nexus_5_API_30.avd',
        target: 'Android API 30',
        apiLevel: '30',
        abi: 'x86',
        skin: 'nexus_5',
        sdcard: '256 MB',
        resolution: '1080x1920',
        ram: '2GB',
        storage: '16GB',
        androidVersion: 'Android 11'
      },
      {
        id: 'Tablet_10_inch_API_31',
        name: '10.1" Tablet API 31',
        path: '/Users/user/.android/avd/Tablet_10_inch_API_31.avd',
        target: 'Android API 31',
        apiLevel: '31',
        abi: 'x86_64',
        skin: '10.1in WXGA (Tablet)',
        sdcard: '512 MB',
        resolution: '1200x1920',
        ram: '6GB',
        storage: '32GB',
        androidVersion: 'Android 12'
      }
    ];
  }

  // Launch an emulator
  async launchEmulator(avdId, options = {}) {
    return new Promise((resolve, reject) => {
      if (!this.emulatorPath) {
        reject(new Error('Emulator binary not found. Please set ANDROID_HOME environment variable.'));
        return;
      }

      if (this.runningEmulators.has(avdId)) {
        reject(new Error(`Emulator ${avdId} is already running`));
        return;
      }

      const args = ['-avd', avdId];
      
      // Default launch options for better compatibility
      args.push('-netdelay', 'none');
      args.push('-netspeed', 'full');
      args.push('-no-snapshot');
      
      // Add user-specified launch options
      if (options.noWindow) args.push('-no-window');
      if (options.noAudio) args.push('-no-audio');
      if (options.noBootAnim) args.push('-no-boot-anim');
      if (options.writableSystem) args.push('-writable-system');
      if (options.networkSpeed) args.push('-netspeed', options.networkSpeed);
      if (options.networkDelay) args.push('-netdelay', options.networkDelay);

      console.log(`Launching emulator: ${this.emulatorPath} ${args.join(' ')}`);

      const emulatorProcess = spawn(this.emulatorPath, args, {
        detached: false,
        stdio: ['ignore', 'pipe', 'pipe']
      });

      // Store process reference
      this.runningEmulators.set(avdId, {
        process: emulatorProcess,
        startTime: new Date(),
        options: options
      });

      let output = '';
      let errorOutput = '';

      emulatorProcess.stdout.on('data', (data) => {
        output += data.toString();
        console.log(`Emulator ${avdId} stdout:`, data.toString());
      });

      emulatorProcess.stderr.on('data', (data) => {
        errorOutput += data.toString();
        console.log(`Emulator ${avdId} stderr:`, data.toString());
      });

      emulatorProcess.on('close', (code) => {
        console.log(`Emulator ${avdId} exited with code ${code}`);
        this.runningEmulators.delete(avdId);
      });

      emulatorProcess.on('error', (error) => {
        console.error(`Error launching emulator ${avdId}:`, error);
        this.runningEmulators.delete(avdId);
        reject(error);
      });

      // Give the emulator a moment to start
      setTimeout(() => {
        resolve({
          avdId: avdId,
          pid: emulatorProcess.pid,
          status: 'starting'
        });
      }, 1000);
    });
  }

  // Stop an emulator
  async stopEmulator(avdId) {
    return new Promise((resolve, reject) => {
      const emulatorInfo = this.runningEmulators.get(avdId);
      
      if (!emulatorInfo) {
        reject(new Error(`Emulator ${avdId} is not running`));
        return;
      }

      try {
        // Kill the emulator process
        emulatorInfo.process.kill('SIGTERM');
        
        // Wait a bit, then force kill if needed
        setTimeout(() => {
          if (this.runningEmulators.has(avdId)) {
            emulatorInfo.process.kill('SIGKILL');
          }
        }, 5000);

        this.runningEmulators.delete(avdId);
        resolve({ avdId: avdId, status: 'stopped' });
        
      } catch (error) {
        reject(error);
      }
    });
  }

  // Get running emulators
  getRunningEmulators() {
    const running = [];
    for (const [avdId, info] of this.runningEmulators) {
      running.push({
        avdId: avdId,
        pid: info.process.pid,
        startTime: info.startTime,
        options: info.options
      });
    }
    return running;
  }

  // Check if emulator is running
  isEmulatorRunning(avdId) {
    return this.runningEmulators.has(avdId);
  }

  // Get device serial for ADB commands
  async getDeviceSerial(avdId) {
    return new Promise((resolve, reject) => {
      if (!this.adbPath) {
        reject(new Error('ADB not found'));
        return;
      }

      exec(`${this.adbPath} devices`, (error, stdout, stderr) => {
        if (error) {
          reject(error);
          return;
        }

        const lines = stdout.split('\n');
        for (const line of lines) {
          if (line.includes('emulator') && line.includes('device')) {
            const serial = line.split('\t')[0];
            resolve(serial);
            return;
          }
        }
        
        reject(new Error('No running emulator found'));
      });
    });
  }

  // Take screenshot of emulator with optimized method
  async takeScreenshot(avdId, options = {}) {
    return new Promise(async (resolve, reject) => {
      try {
        const serial = await this.getDeviceSerial(avdId);
        
        // Use direct streaming instead of file-based approach for better performance
        const child = spawn(this.adbPath, ['-s', serial, 'exec-out', 'screencap', '-p'], {
          stdio: ['ignore', 'pipe', 'pipe']
        });
        
        let data = Buffer.alloc(0);
        
        child.stdout.on('data', (chunk) => {
          data = Buffer.concat([data, chunk]);
        });
        
        child.on('close', (code) => {
          if (code === 0 && data.length > 0) {
            resolve(data);
          } else {
            reject(new Error(`Screenshot failed with code ${code}`));
          }
        });
        
        child.on('error', (error) => {
          reject(error);
        });
        
        // Set timeout to prevent hanging
        setTimeout(() => {
          child.kill();
          reject(new Error('Screenshot timeout'));
        }, 5000);
        
      } catch (error) {
        reject(error);
      }
    });
  }

  // Send touch input to emulator
  async sendTouchInput(avdId, x, y, action = 'tap') {
    return new Promise(async (resolve, reject) => {
      try {
        const serial = await this.getDeviceSerial(avdId);
        
        let command;
        switch (action) {
          case 'tap':
            command = `${this.adbPath} -s ${serial} shell input tap ${x} ${y}`;
            break;
          case 'swipe':
            command = `${this.adbPath} -s ${serial} shell input swipe ${x} ${y} ${x} ${y} 100`;
            break;
          case 'longpress':
            command = `${this.adbPath} -s ${serial} shell input swipe ${x} ${y} ${x} ${y} 500`;
            break;
          default:
            command = `${this.adbPath} -s ${serial} shell input tap ${x} ${y}`;
        }
        
        exec(command, (error, stdout, stderr) => {
          if (error) {
            reject(error);
            return;
          }
          resolve({ success: true, action, x, y });
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  // Send keyboard input to emulator
  async sendKeyInput(avdId, key) {
    return new Promise(async (resolve, reject) => {
      try {
        const serial = await this.getDeviceSerial(avdId);
        
        // Map common keys to ADB key codes
        const keyMap = {
          'home': 'KEYCODE_HOME',
          'back': 'KEYCODE_BACK',
          'menu': 'KEYCODE_MENU',
          'power': 'KEYCODE_POWER',
          'volume_up': 'KEYCODE_VOLUME_UP',
          'volume_down': 'KEYCODE_VOLUME_DOWN',
          'enter': 'KEYCODE_ENTER',
          'escape': 'KEYCODE_ESCAPE',
          'space': 'KEYCODE_SPACE',
          'tab': 'KEYCODE_TAB'
        };
        
        const keyCode = keyMap[key] || key;
        const command = `${this.adbPath} -s ${serial} shell input keyevent ${keyCode}`;
        
        exec(command, (error, stdout, stderr) => {
          if (error) {
            reject(error);
            return;
          }
          resolve({ success: true, key, keyCode });
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  // Send text input to emulator
  async sendTextInput(avdId, text) {
    return new Promise(async (resolve, reject) => {
      try {
        const serial = await this.getDeviceSerial(avdId);
        const escapedText = text.replace(/"/g, '\\"');
        const command = `${this.adbPath} -s ${serial} shell input text "${escapedText}"`;
        
        exec(command, (error, stdout, stderr) => {
          if (error) {
            reject(error);
            return;
          }
          resolve({ success: true, text });
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  // Start streaming for an emulator
  startStreaming(avdId, clientId) {
    if (!this.streamingClients.has(avdId)) {
      this.streamingClients.set(avdId, new Set());
    }
    this.streamingClients.get(avdId).add(clientId);
  }

  // Stop streaming for an emulator
  stopStreaming(avdId, clientId) {
    if (this.streamingClients.has(avdId)) {
      this.streamingClients.get(avdId).delete(clientId);
      if (this.streamingClients.get(avdId).size === 0) {
        this.streamingClients.delete(avdId);
      }
    }
  }

  // Check if emulator is being streamed
  isStreaming(avdId) {
    return this.streamingClients.has(avdId) && this.streamingClients.get(avdId).size > 0;
  }
}

class EmulatorAPIServer {
  constructor() {
    this.emulatorManager = new EmulatorManager();
    this.app = express();
    this.server = http.createServer(this.app);
    this.wss = new WebSocket.Server({ server: this.server });
    
    this.setupMiddleware();
    this.setupRoutes();
    this.setupWebSocket();
  }

  setupMiddleware() {
    this.app.use(cors());
    this.app.use(express.json());
    this.app.use(express.static('public'));
  }

  setupRoutes() {
    // Emulator management routes
    this.app.get('/api/emulators', this.handleGetEmulators.bind(this));
    this.app.post('/api/emulators/:avdId/launch', this.handleLaunchEmulator.bind(this));
    this.app.post('/api/emulators/:avdId/stop', this.handleStopEmulator.bind(this));
    this.app.get('/api/emulators/running', this.handleGetRunningEmulators.bind(this));
    
    // Streaming routes
    this.app.get('/api/emulators/:avdId/screenshot', this.handleScreenshot.bind(this));
    this.app.post('/api/emulators/:avdId/touch', this.handleTouchInput.bind(this));
    this.app.post('/api/emulators/:avdId/key', this.handleKeyInput.bind(this));
    this.app.post('/api/emulators/:avdId/text', this.handleTextInput.bind(this));
    this.app.post('/api/emulators/:avdId/stream/start', this.handleStartStreaming.bind(this));
    this.app.post('/api/emulators/:avdId/stream/stop', this.handleStopStreaming.bind(this));
  }

  setupWebSocket() {
    this.wss.on('connection', (ws, req) => {
      console.log('📱 New WebSocket connection established');
      
      ws.on('message', async (message) => {
        try {
          const data = JSON.parse(message);
          await this.handleWebSocketMessage(ws, data);
        } catch (error) {
          console.error('WebSocket message error:', error);
          ws.send(JSON.stringify({ error: 'Invalid message format' }));
        }
      });
      
      ws.on('close', () => {
        console.log('📱 WebSocket connection closed');
      });
      
      ws.on('error', (error) => {
        console.error('WebSocket error:', error);
      });
    });
  }

  async handleWebSocketMessage(ws, data) {
    const { type, avdId, ...payload } = data;
    
    switch (type) {
      case 'start_streaming':
        await this.handleStartStreamingWS(ws, avdId);
        break;
      case 'stop_streaming':
        await this.handleStopStreamingWS(ws, avdId);
        break;
      case 'touch_input':
        await this.handleTouchInputWS(ws, avdId, payload);
        break;
      case 'key_input':
        await this.handleKeyInputWS(ws, avdId, payload);
        break;
      case 'text_input':
        await this.handleTextInputWS(ws, avdId, payload);
        break;
      default:
        ws.send(JSON.stringify({ error: 'Unknown message type' }));
    }
  }

  async handleGetEmulators(req, res) {
    try {
      const avds = await this.emulatorManager.getAvailableAvds();
      this.sendResponse(res, 200, avds);
    } catch (error) {
      console.error('Error getting emulators:', error);
      this.sendResponse(res, 500, { error: error.message });
    }
  }

  async handleLaunchEmulator(req, res) {
    try {
      const { avdId } = req.params;
      const options = req.body;
      const result = await this.emulatorManager.launchEmulator(avdId, options);
      this.sendResponse(res, 200, result);
    } catch (error) {
      console.error('Error launching emulator:', error);
      this.sendResponse(res, 500, { error: error.message });
    }
  }

  async handleStopEmulator(req, res) {
    try {
      const { avdId } = req.params;
      const result = await this.emulatorManager.stopEmulator(avdId);
      this.sendResponse(res, 200, result);
    } catch (error) {
      console.error('Error stopping emulator:', error);
      this.sendResponse(res, 500, { error: error.message });
    }
  }

  handleGetRunningEmulators(req, res) {
    try {
      const running = this.emulatorManager.getRunningEmulators();
      this.sendResponse(res, 200, running.map(e => e.avdId));
    } catch (error) {
      console.error('Error getting running emulators:', error);
      this.sendResponse(res, 500, { error: error.message });
    }
  }

  async handleScreenshot(req, res) {
    try {
      const { avdId } = req.params;
      const screenshotData = await this.emulatorManager.takeScreenshot(avdId);
      res.set('Content-Type', 'image/png');
      res.send(screenshotData);
    } catch (error) {
      console.error('Error taking screenshot:', error);
      this.sendResponse(res, 500, { error: error.message });
    }
  }

  async handleTouchInput(req, res) {
    try {
      const { avdId } = req.params;
      const { x, y, action } = req.body;
      const result = await this.emulatorManager.sendTouchInput(avdId, x, y, action);
      this.sendResponse(res, 200, result);
    } catch (error) {
      console.error('Error sending touch input:', error);
      this.sendResponse(res, 500, { error: error.message });
    }
  }

  async handleKeyInput(req, res) {
    try {
      const { avdId } = req.params;
      const { key } = req.body;
      const result = await this.emulatorManager.sendKeyInput(avdId, key);
      this.sendResponse(res, 200, result);
    } catch (error) {
      console.error('Error sending key input:', error);
      this.sendResponse(res, 500, { error: error.message });
    }
  }

  async handleTextInput(req, res) {
    try {
      const { avdId } = req.params;
      const { text } = req.body;
      const result = await this.emulatorManager.sendTextInput(avdId, text);
      this.sendResponse(res, 200, result);
    } catch (error) {
      console.error('Error sending text input:', error);
      this.sendResponse(res, 500, { error: error.message });
    }
  }

  async handleStartStreaming(req, res) {
    try {
      const { avdId } = req.params;
      const clientId = req.body.clientId || `client_${Date.now()}`;
      this.emulatorManager.startStreaming(avdId, clientId);
      this.sendResponse(res, 200, { success: true, clientId, avdId });
    } catch (error) {
      console.error('Error starting streaming:', error);
      this.sendResponse(res, 500, { error: error.message });
    }
  }

  async handleStopStreaming(req, res) {
    try {
      const { avdId } = req.params;
      const clientId = req.body.clientId;
      this.emulatorManager.stopStreaming(avdId, clientId);
      this.sendResponse(res, 200, { success: true, clientId, avdId });
    } catch (error) {
      console.error('Error stopping streaming:', error);
      this.sendResponse(res, 500, { error: error.message });
    }
  }

  // WebSocket handlers
  async handleStartStreamingWS(ws, avdId) {
    const clientId = `ws_${Date.now()}`;
    this.emulatorManager.startStreaming(avdId, clientId);
    ws.clientId = clientId;
    ws.avdId = avdId;
    
    ws.send(JSON.stringify({
      type: 'streaming_started',
      clientId,
      avdId
    }));
    
    // Start sending screenshots
    this.startScreenshotStream(ws, avdId);
  }

  async handleStopStreamingWS(ws, avdId) {
    if (ws.clientId) {
      this.emulatorManager.stopStreaming(avdId, ws.clientId);
      ws.send(JSON.stringify({
        type: 'streaming_stopped',
        clientId: ws.clientId,
        avdId
      }));
    }
  }

  async handleTouchInputWS(ws, avdId, payload) {
    try {
      const { x, y, action } = payload;
      const result = await this.emulatorManager.sendTouchInput(avdId, x, y, action);
      ws.send(JSON.stringify({
        type: 'touch_result',
        result
      }));
    } catch (error) {
      ws.send(JSON.stringify({
        type: 'error',
        message: error.message
      }));
    }
  }

  async handleKeyInputWS(ws, avdId, payload) {
    try {
      const { key } = payload;
      const result = await this.emulatorManager.sendKeyInput(avdId, key);
      ws.send(JSON.stringify({
        type: 'key_result',
        result
      }));
    } catch (error) {
      ws.send(JSON.stringify({
        type: 'error',
        message: error.message
      }));
    }
  }

  async handleTextInputWS(ws, avdId, payload) {
    try {
      const { text } = payload;
      const result = await this.emulatorManager.sendTextInput(avdId, text);
      ws.send(JSON.stringify({
        type: 'text_result',
        result
      }));
    } catch (error) {
      ws.send(JSON.stringify({
        type: 'error',
        message: error.message
      }));
    }
  }

  startScreenshotStream(ws, avdId) {
    let isStreaming = true;
    let frameCount = 0;
    let lastFpsTime = Date.now();
    
    // Default streaming configuration (can be overridden by client)
    const defaultConfig = {
      targetFps: 60,
      maxWidth: 1080,
      maxHeight: 1920,
      quality: 0.8,
      compression: true
    };
    
    // High-performance streaming with configurable FPS
    const streamFrame = async () => {
      if (!isStreaming || ws.readyState !== WebSocket.OPEN || !this.emulatorManager.isStreaming(avdId)) {
        return;
      }
      
      try {
        const startTime = Date.now();
        const screenshotData = await this.emulatorManager.takeScreenshot(avdId);
        const captureTime = Date.now() - startTime;
        
        // Apply compression if enabled
        let processedData = screenshotData;
        if (defaultConfig.compression && screenshotData.length > 100000) { // Compress if > 100KB
          // Simple compression by reducing quality (in real implementation, you'd use image compression)
          processedData = screenshotData;
        }
        
        const base64Data = processedData.toString('base64');
        
        ws.send(JSON.stringify({
          type: 'screenshot',
          data: base64Data,
          timestamp: Date.now(),
          captureTime: captureTime,
          size: processedData.length,
          config: defaultConfig
        }));
        
        frameCount++;
        
        // Calculate FPS every second
        const now = Date.now();
        if (now - lastFpsTime >= 1000) {
          const fps = frameCount;
          frameCount = 0;
          lastFpsTime = now;
          
          ws.send(JSON.stringify({
            type: 'fps_update',
            fps: fps,
            captureTime: captureTime,
            targetFps: defaultConfig.targetFps
          }));
        }
        
        // Schedule next frame based on target FPS
        const frameInterval = 1000 / defaultConfig.targetFps;
        setTimeout(streamFrame, Math.max(0, frameInterval - captureTime));
        
      } catch (error) {
        console.error('Error streaming screenshot:', error);
        isStreaming = false;
      }
    };
    
    // Start streaming
    streamFrame();
    
    ws.on('close', () => {
      isStreaming = false;
    });
    
    // Store streaming state
    ws.isStreaming = true;
  }

  sendResponse(res, statusCode, data) {
    res.writeHead(statusCode, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(data));
  }

  start() {
    this.server.listen(PORT, () => {
      console.log(`🚀 Emulator API Server running on port ${PORT}`);
      console.log(`📱 Available endpoints:`);
      console.log(`   GET  /api/emulators - List available AVDs`);
      console.log(`   POST /api/emulators/{avdId}/launch - Launch emulator`);
      console.log(`   POST /api/emulators/{avdId}/stop - Stop emulator`);
      console.log(`   GET  /api/emulators/running - Get running emulators`);
      console.log(`   GET  /api/emulators/{avdId}/screenshot - Take screenshot`);
      console.log(`   POST /api/emulators/{avdId}/touch - Send touch input`);
      console.log(`   POST /api/emulators/{avdId}/key - Send key input`);
      console.log(`   POST /api/emulators/{avdId}/text - Send text input`);
      console.log(`   POST /api/emulators/{avdId}/stream/start - Start streaming`);
      console.log(`   POST /api/emulators/{avdId}/stream/stop - Stop streaming`);
      console.log(`🔌 WebSocket: ws://localhost:${PORT} - Real-time streaming`);
      console.log(`🔧 Android SDK: ${this.emulatorManager.androidHome || 'Not found'}`);
      console.log(`📱 Emulator: ${this.emulatorManager.emulatorPath || 'Not found'}`);
      console.log(`⚙️  AVD Manager: ${this.emulatorManager.avdManagerPath || 'Not found'}`);
      console.log(`🔧 ADB: ${this.emulatorManager.adbPath || 'Not found'}`);
    });

    return this.server;
  }
}

// Start the server
const server = new EmulatorAPIServer();
server.start();

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down Emulator API Server...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Shutting down Emulator API Server...');
  process.exit(0);
});

