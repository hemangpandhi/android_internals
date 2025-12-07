#!/usr/bin/env node

const http = require('http');
const https = require('https');
const url = require('url');
const fs = require('fs');
const path = require('path');
const { spawn, exec } = require('child_process');
const os = require('os');
const WebSocket = require('ws');
const WebSocketServer = require('ws').WebSocketServer;
const express = require('express');
const cors = require('cors');

// Configuration
const HTTP_PORT = process.env.HTTP_PORT || 3002;
const HTTPS_PORT = process.env.HTTPS_PORT || 3443;
const HOST = process.env.HOST || '0.0.0.0'; // Listen on all interfaces for remote access
const SSL_CERT_PATH = process.env.SSL_CERT_PATH || './ssl/cert.pem';
const SSL_KEY_PATH = process.env.SSL_KEY_PATH || './ssl/key.pem';

// Security settings
const ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS ? 
  process.env.ALLOWED_ORIGINS.split(',') : 
  ['https://hemangpandhi.com', 'https://www.hemangpandhi.com', 'http://localhost:3000'];

const API_KEY = process.env.EMULATOR_API_KEY || null; // Optional API key for additional security

class EmulatorManager {
  constructor() {
    this.runningEmulators = new Map();
    this.androidHome = process.env.ANDROID_HOME || process.env.ANDROID_SDK_ROOT;
    this.emulatorPath = this.findEmulatorPath();
    this.avdManagerPath = this.findAvdManagerPath();
    this.adbPath = this.findAdbPath();
    this.streamingClients = new Map();
    
    console.log(`🔧 Android SDK: ${this.androidHome}`);
    console.log(`📱 Emulator: ${this.emulatorPath}`);
    console.log(`⚙️  AVD Manager: ${this.avdManagerPath}`);
    console.log(`🔧 ADB: ${this.adbPath}`);
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
    // Check system PATH first
    return new Promise((resolve) => {
      exec('which adb', (error, stdout) => {
        if (!error && stdout.trim()) {
          resolve(stdout.trim());
          return;
        }
        
        // Fallback to SDK paths
        if (!this.androidHome) {
          resolve(null);
          return;
        }
        
        const possiblePaths = [
          path.join(this.androidHome, 'platform-tools', 'adb'),
          path.join(this.androidHome, 'platform-tools', 'adb.exe'),
          'adb' // Try system adb as last resort
        ];
        
        for (const adbPath of possiblePaths) {
          if (fs.existsSync(adbPath) || adbPath === 'adb') {
            resolve(adbPath);
            return;
          }
        }
        
        resolve(null);
      });
    });
  }

  async getAvailableEmulators() {
    if (!this.avdManagerPath) {
      throw new Error('AVD Manager not found');
    }

    return new Promise((resolve, reject) => {
      exec(`${this.avdManagerPath} list avd`, (error, stdout, stderr) => {
        if (error) {
          console.error('Error listing AVDs:', error);
          reject(error);
          return;
        }

        const lines = stdout.split('\n');
        const emulators = [];

        for (const line of lines) {
          const match = line.match(/Name:\s+(.+)/);
          if (match) {
            emulators.push({
              name: match[1].trim(),
              id: match[1].trim()
            });
          }
        }

        resolve(emulators);
      });
    });
  }

  async launchEmulator(avdId, options = {}) {
    if (!this.emulatorPath) {
      throw new Error('Emulator binary not found');
    }

    if (this.runningEmulators.has(avdId)) {
      throw new Error(`Emulator ${avdId} is already running`);
    }

    const defaultOptions = {
      noWindow: false,
      noAudio: false,
      noBootAnim: false,
      netdelay: 'none',
      netspeed: 'full',
      noSnapshot: true
    };

    const launchOptions = { ...defaultOptions, ...options };
    
    const args = [
      '-avd', avdId,
      '-netdelay', launchOptions.netdelay,
      '-netspeed', launchOptions.netspeed
    ];

    if (launchOptions.noWindow) args.push('-no-window');
    if (launchOptions.noAudio) args.push('-no-audio');
    if (launchOptions.noBootAnim) args.push('-no-boot-anim');
    if (launchOptions.noSnapshot) args.push('-no-snapshot');

    console.log(`🚀 Launching emulator: ${avdId}`);
    console.log(`📱 Command: ${this.emulatorPath} ${args.join(' ')}`);

    return new Promise((resolve, reject) => {
      const emulatorProcess = spawn(this.emulatorPath, args, {
        detached: true,
        stdio: 'ignore'
      });

      emulatorProcess.unref();

      // Wait a bit for emulator to start
      setTimeout(async () => {
        try {
          const runningEmulators = await this.getRunningEmulators();
          if (runningEmulators.includes(avdId)) {
            this.runningEmulators.set(avdId, {
              process: emulatorProcess,
              pid: emulatorProcess.pid,
              startTime: new Date()
            });
            resolve({ success: true, message: `Emulator ${avdId} launched successfully` });
          } else {
            reject(new Error(`Emulator ${avdId} failed to start`));
          }
        } catch (error) {
          reject(error);
        }
      }, 5000);
    });
  }

  async stopEmulator(avdId) {
    if (!this.adbPath) {
      throw new Error('ADB not found');
    }

    const runningEmulators = await this.getRunningEmulators();
    if (!runningEmulators.includes(avdId)) {
      throw new Error(`Emulator ${avdId} is not running`);
    }

    return new Promise((resolve, reject) => {
      exec(`${this.adbPath} -s emulator-5554 emu kill`, (error, stdout, stderr) => {
        if (error) {
          console.error('Error stopping emulator:', error);
          reject(error);
          return;
        }

        this.runningEmulators.delete(avdId);
        this.streamingClients.delete(avdId);
        resolve({ success: true, message: `Emulator ${avdId} stopped successfully` });
      });
    });
  }

  async getRunningEmulators() {
    if (!this.adbPath) {
      return [];
    }

    return new Promise((resolve) => {
      exec(`${this.adbPath} devices`, (error, stdout) => {
        if (error) {
          console.error('Error getting devices:', error);
          resolve([]);
          return;
        }

        const lines = stdout.split('\n');
        const devices = [];

        for (const line of lines) {
          if (line.includes('emulator') && line.includes('device')) {
            const match = line.match(/(emulator-\d+)/);
            if (match) {
              devices.push('Pixel_XL_API_33'); // For now, assume this is our emulator
            }
          }
        }

        resolve(devices);
      });
    });
  }

  async takeScreenshot() {
    if (!this.adbPath) {
      throw new Error('ADB not found');
    }

    return new Promise((resolve, reject) => {
      const screencapProcess = spawn(this.adbPath, ['shell', 'screencap', '-p'], {
        timeout: 2000
      });

      let screenshotData = Buffer.alloc(0);

      screencapProcess.stdout.on('data', (data) => {
        screenshotData = Buffer.concat([screenshotData, data]);
      });

      screencapProcess.on('close', (code) => {
        if (code === 0 && screenshotData.length > 1000) {
          resolve(screenshotData);
        } else {
          reject(new Error(`Screenshot failed with code ${code}`));
        }
      });

      screencapProcess.on('error', (error) => {
        reject(error);
      });
    });
  }

  async sendTouchInput(x, y) {
    if (!this.adbPath) {
      throw new Error('ADB not found');
    }

    return new Promise((resolve, reject) => {
      exec(`${this.adbPath} shell input tap ${x} ${y}`, (error, stdout, stderr) => {
        if (error) {
          reject(error);
          return;
        }
        resolve({ success: true });
      });
    });
  }

  async startScreenshotStream(avdId, config = {}) {
    const defaultConfig = {
      targetFps: 20,
      maxWidth: 1080,
      maxHeight: 1920,
      quality: 0.8,
      compression: true
    };

    const streamConfig = { ...defaultConfig, ...config };
    
    if (this.streamingClients.has(avdId)) {
      this.stopScreenshotStream(avdId);
    }

    const clients = new Set();
    this.streamingClients.set(avdId, clients);

    const frameInterval = 1000 / streamConfig.targetFps;
    let lastFrameTime = 0;
    let consecutiveErrors = 0;
    const maxErrors = 5;

    const streamFrame = async () => {
      if (!this.streamingClients.has(avdId)) {
        return;
      }

      const now = Date.now();
      if (now - lastFrameTime < frameInterval) {
        setTimeout(streamFrame, frameInterval - (now - lastFrameTime));
        return;
      }

      try {
        const screenshotData = await this.takeScreenshot();
        
        // Compress if needed
        let finalData = screenshotData;
        if (streamConfig.compression && screenshotData.length > 200000) {
          // For now, just send raw data - you could add image compression here
          finalData = screenshotData;
        }

        // Send to all connected clients
        const message = JSON.stringify({
          type: 'screenshot',
          data: finalData.toString('base64'),
          timestamp: now
        });

        clients.forEach(client => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(message);
          }
        });

        consecutiveErrors = 0;
        lastFrameTime = now;
        
      } catch (error) {
        console.error('Screenshot stream error:', error);
        consecutiveErrors++;
        
        if (consecutiveErrors >= maxErrors) {
          console.error('Too many consecutive errors, stopping stream');
          this.stopScreenshotStream(avdId);
          return;
        }
        
        // Exponential backoff
        const backoffTime = Math.min(1000 * Math.pow(2, consecutiveErrors), 10000);
        setTimeout(streamFrame, backoffTime);
        return;
      }

      setTimeout(streamFrame, frameInterval);
    };

    streamFrame();
    return { success: true, message: 'Stream started' };
  }

  stopScreenshotStream(avdId) {
    if (this.streamingClients.has(avdId)) {
      this.streamingClients.delete(avdId);
      return { success: true, message: 'Stream stopped' };
    }
    return { success: false, message: 'No active stream found' };
  }

  addStreamingClient(avdId, ws) {
    if (!this.streamingClients.has(avdId)) {
      this.streamingClients.set(avdId, new Set());
    }
    this.streamingClients.get(avdId).add(ws);
  }

  removeStreamingClient(avdId, ws) {
    if (this.streamingClients.has(avdId)) {
      this.streamingClients.get(avdId).delete(ws);
    }
  }
}

class RemoteEmulatorServer {
  constructor() {
    this.emulatorManager = new EmulatorManager();
    this.app = express();
    this.setupMiddleware();
    this.setupRoutes();
  }

  setupMiddleware() {
    // CORS configuration for remote access
    this.app.use(cors({
      origin: (origin, callback) => {
        // Allow requests with no origin (mobile apps, curl, etc.)
        if (!origin) return callback(null, true);
        
        if (ALLOWED_ORIGINS.includes(origin)) {
          return callback(null, true);
        }
        
        console.warn(`🚫 Blocked request from origin: ${origin}`);
        callback(new Error('Not allowed by CORS'));
      },
      credentials: true
    }));

    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    // Security headers
    this.app.use((req, res, next) => {
      res.setHeader('X-Content-Type-Options', 'nosniff');
      res.setHeader('X-Frame-Options', 'DENY');
      res.setHeader('X-XSS-Protection', '1; mode=block');
      next();
    });

    // Optional API key authentication
    if (API_KEY) {
      this.app.use('/api', (req, res, next) => {
        const providedKey = req.headers['x-api-key'];
        if (providedKey === API_KEY) {
          next();
        } else {
          res.status(401).json({ error: 'Invalid API key' });
        }
      });
    }
  }

  setupRoutes() {
    // Health check
    this.app.get('/health', (req, res) => {
      res.json({ 
        status: 'healthy', 
        timestamp: new Date().toISOString(),
        server: 'remote-emulator-server'
      });
    });

    // List available emulators
    this.app.get('/api/emulators', async (req, res) => {
      try {
        const emulators = await this.emulatorManager.getAvailableEmulators();
        res.json(emulators);
      } catch (error) {
        console.error('Error getting emulators:', error);
        res.status(500).json({ error: error.message });
      }
    });

    // Launch emulator
    this.app.post('/api/emulators/:avdId/launch', async (req, res) => {
      try {
        const { avdId } = req.params;
        const options = req.body;
        const result = await this.emulatorManager.launchEmulator(avdId, options);
        res.json(result);
      } catch (error) {
        console.error('Error launching emulator:', error);
        res.status(500).json({ error: error.message });
      }
    });

    // Stop emulator
    this.app.post('/api/emulators/:avdId/stop', async (req, res) => {
      try {
        const { avdId } = req.params;
        const result = await this.emulatorManager.stopEmulator(avdId);
        res.json(result);
      } catch (error) {
        console.error('Error stopping emulator:', error);
        res.status(500).json({ error: error.message });
      }
    });

    // Get running emulators
    this.app.get('/api/emulators/running', async (req, res) => {
      try {
        const emulators = await this.emulatorManager.getRunningEmulators();
        res.json(emulators);
      } catch (error) {
        console.error('Error getting running emulators:', error);
        res.status(500).json({ error: error.message });
      }
    });

    // Take screenshot
    this.app.get('/api/emulators/:avdId/screenshot', async (req, res) => {
      try {
        const screenshot = await this.emulatorManager.takeScreenshot();
        res.setHeader('Content-Type', 'image/png');
        res.send(screenshot);
      } catch (error) {
        console.error('Error taking screenshot:', error);
        res.status(500).json({ error: error.message });
      }
    });

    // Send touch input
    this.app.post('/api/emulators/:avdId/touch', async (req, res) => {
      try {
        const { x, y } = req.body;
        const result = await this.emulatorManager.sendTouchInput(x, y);
        res.json(result);
      } catch (error) {
        console.error('Error sending touch input:', error);
        res.status(500).json({ error: error.message });
      }
    });

    // Start streaming
    this.app.post('/api/emulators/:avdId/stream/start', async (req, res) => {
      try {
        const { avdId } = req.params;
        const config = req.body;
        const result = await this.emulatorManager.startScreenshotStream(avdId, config);
        res.json(result);
      } catch (error) {
        console.error('Error starting stream:', error);
        res.status(500).json({ error: error.message });
      }
    });

    // Stop streaming
    this.app.post('/api/emulators/:avdId/stream/stop', async (req, res) => {
      try {
        const { avdId } = req.params;
        const result = await this.emulatorManager.stopScreenshotStream(avdId);
        res.json(result);
      } catch (error) {
        console.error('Error stopping stream:', error);
        res.status(500).json({ error: error.message });
      }
    });
  }

  setupWebSocket(server) {
    const wss = new WebSocketServer({ 
      server,
      verifyClient: (info) => {
        const origin = info.origin;
        if (!origin || ALLOWED_ORIGINS.includes(origin)) {
          return true;
        }
        console.warn(`🚫 Blocked WebSocket connection from origin: ${origin}`);
        return false;
      }
    });

    wss.on('connection', (ws, req) => {
      console.log('🔌 New WebSocket connection');
      
      ws.on('message', async (message) => {
        try {
          const data = JSON.parse(message);
          await this.handleWebSocketMessage(ws, data);
        } catch (error) {
          console.error('WebSocket message error:', error);
          ws.send(JSON.stringify({ type: 'error', message: error.message }));
        }
      });

      ws.on('close', () => {
        console.log('🔌 WebSocket connection closed');
        // Remove from all streaming clients
        this.emulatorManager.streamingClients.forEach((clients, avdId) => {
          this.emulatorManager.removeStreamingClient(avdId, ws);
        });
      });
    });

    return wss;
  }

  async handleWebSocketMessage(ws, data) {
    switch (data.type) {
      case 'join_stream':
        if (data.avdId) {
          this.emulatorManager.addStreamingClient(data.avdId, ws);
          ws.send(JSON.stringify({ type: 'joined_stream', avdId: data.avdId }));
        }
        break;

      case 'touch_input':
        if (data.x !== undefined && data.y !== undefined) {
          await this.emulatorManager.sendTouchInput(data.x, data.y);
        }
        break;

      default:
        ws.send(JSON.stringify({ type: 'error', message: 'Unknown message type' }));
    }
  }

  async start() {
    try {
      // Start HTTP server
      this.httpServer = http.createServer(this.app);
      this.setupWebSocket(this.httpServer);
      
      this.httpServer.listen(HTTP_PORT, HOST, () => {
        console.log(`🚀 Remote Emulator API Server running on ${HOST}:${HTTP_PORT}`);
        console.log(`📱 Available endpoints:`);
        console.log(`   GET  /health - Health check`);
        console.log(`   GET  /api/emulators - List available AVDs`);
        console.log(`   POST /api/emulators/{avdId}/launch - Launch emulator`);
        console.log(`   POST /api/emulators/{avdId}/stop - Stop emulator`);
        console.log(`   GET  /api/emulators/running - Get running emulators`);
        console.log(`   GET  /api/emulators/{avdId}/screenshot - Take screenshot`);
        console.log(`   POST /api/emulators/{avdId}/touch - Send touch input`);
        console.log(`   POST /api/emulators/{avdId}/stream/start - Start streaming`);
        console.log(`   POST /api/emulators/{avdId}/stream/stop - Stop streaming`);
        console.log(`🔌 WebSocket: ws://${HOST}:${HTTP_PORT} - Real-time streaming`);
        console.log(`🌐 Allowed origins: ${ALLOWED_ORIGINS.join(', ')}`);
        if (API_KEY) {
          console.log(`🔑 API Key authentication enabled`);
        }
      });

      // Start HTTPS server if SSL certificates are available
      if (fs.existsSync(SSL_CERT_PATH) && fs.existsSync(SSL_KEY_PATH)) {
        const httpsOptions = {
          cert: fs.readFileSync(SSL_CERT_PATH),
          key: fs.readFileSync(SSL_KEY_PATH)
        };

        this.httpsServer = https.createServer(httpsOptions, this.app);
        this.setupWebSocket(this.httpsServer);
        
        this.httpsServer.listen(HTTPS_PORT, HOST, () => {
          console.log(`🔒 HTTPS Emulator API Server running on ${HOST}:${HTTPS_PORT}`);
          console.log(`🔌 Secure WebSocket: wss://${HOST}:${HTTPS_PORT} - Real-time streaming`);
        });
      } else {
        console.log(`⚠️  SSL certificates not found. HTTPS not enabled.`);
        console.log(`   Place certificates at: ${SSL_CERT_PATH} and ${SSL_KEY_PATH}`);
      }

    } catch (error) {
      console.error('Failed to start server:', error);
      process.exit(1);
    }
  }

  async stop() {
    console.log('🛑 Shutting down Remote Emulator API Server...');
    
    if (this.httpServer) {
      this.httpServer.close();
    }
    
    if (this.httpsServer) {
      this.httpsServer.close();
    }
    
    // Stop all running emulators
    for (const [avdId, emulator] of this.emulatorManager.runningEmulators) {
      try {
        await this.emulatorManager.stopEmulator(avdId);
      } catch (error) {
        console.error(`Error stopping emulator ${avdId}:`, error);
      }
    }
  }
}

// Handle graceful shutdown
process.on('SIGINT', async () => {
  if (global.server) {
    await global.server.stop();
  }
  process.exit(0);
});

process.on('SIGTERM', async () => {
  if (global.server) {
    await global.server.stop();
  }
  process.exit(0);
});

// Start server
if (require.main === module) {
  global.server = new RemoteEmulatorServer();
  global.server.start().catch(console.error);
}

module.exports = RemoteEmulatorServer;
