#!/usr/bin/env node

/**
 * Mermaid Diagram Test Runner
 * Executes comprehensive tests for Mermaid diagram functionality
 */

const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

class MermaidTestRunner {
  constructor() {
    this.serverUrl = 'http://localhost:8080';
    this.testResults = [];
  }

  log(message) {
    console.log(`[${new Date().toISOString()}] ${message}`);
  }

  async checkServerRunning() {
    this.log('🔍 Checking if server is running...');
    
    return new Promise((resolve) => {
      const { spawn } = require('child_process');
      const curl = spawn('curl', ['-s', '-o', '/dev/null', '-w', '%{http_code}', this.serverUrl]);
      
      curl.on('close', (code) => {
        if (code === 0) {
          this.log('✅ Server is running');
          resolve(true);
        } else {
          this.log('❌ Server is not running');
          resolve(false);
        }
      });
    });
  }

  async startServer() {
    this.log('🚀 Starting development server...');
    
    return new Promise((resolve, reject) => {
      const { spawn } = require('child_process');
      const server = spawn('python3', ['-m', 'http.server', '8080'], {
        cwd: path.join(__dirname, 'build'),
        stdio: 'pipe'
      });
      
      server.stdout.on('data', (data) => {
        this.log(`Server: ${data.toString().trim()}`);
      });
      
      server.stderr.on('data', (data) => {
        this.log(`Server Error: ${data.toString().trim()}`);
      });
      
      // Wait a bit for server to start
      setTimeout(() => {
        this.log('✅ Server started');
        resolve(server);
      }, 2000);
    });
  }

  async runBrowserTests() {
    this.log('🧪 Running browser-based tests...');
    
    const testScript = `
      // Load the test page
      const page = await browser.newPage();
      await page.goto('${this.serverUrl}/articles/android-system-server-deep-dive.html');
      
      // Wait for Mermaid to render
      await page.waitForSelector('.mermaid-diagram', { timeout: 10000 });
      
      // Run tests
      const results = await page.evaluate(() => {
        const tester = new SimpleMermaidTester();
        return tester.runAllTests();
      });
      
      console.log('Test Results:', results);
    `;
    
    // This would require a browser automation tool like Puppeteer
    // For now, we'll create a simple HTML test page
    return this.createTestPage();
  }

  createTestPage() {
    this.log('📄 Creating test page...');
    
    const testPageContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Mermaid Diagram Tests</title>
    <script src="https://cdn.jsdelivr.net/npm/mermaid@10.6.1/dist/mermaid.min.js"></script>
    <script src="simple-mermaid-tests.js"></script>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .test-results { margin: 20px 0; padding: 20px; border: 1px solid #ddd; }
        .test-passed { color: green; }
        .test-failed { color: red; }
        .mermaid-diagram { margin: 20px 0; padding: 20px; background: #f8f9fa; border: 1px solid #ddd; }
    </style>
</head>
<body>
    <h1>Mermaid Diagram Test Suite</h1>
    <p>This page will automatically run tests for Mermaid diagram functionality.</p>
    
    <div id="test-results" class="test-results">
        <h2>Test Results</h2>
        <div id="results-content">Running tests...</div>
    </div>
    
    <h2>Test Mermaid Diagram</h2>
    <div class="mermaid-diagram" id="diagram-test">
        <div class="mermaid-zoom-controls">
            <button class="zoom-btn" onclick="zoomDiagram('test', 0.8)" title="Zoom Out">🔍-</button>
            <button class="zoom-btn zoom-reset" onclick="resetZoom('test')" title="Reset Zoom">⌂</button>
            <button class="zoom-btn" onclick="zoomDiagram('test', 1.2)" title="Zoom In">🔍+</button>
            <button class="zoom-btn fullscreen-btn" onclick="toggleFullscreen('test')" title="Fullscreen">⛶</button>
        </div>
        <div class="mermaid" id="test">graph TD
            A[Start] --> B[Process]
            B --> C[End]
        </div>
        <div class="zoom-indicator" id="zoom-test">100%</div>
    </div>
    
    <script>
        // Initialize Mermaid
        mermaid.initialize({
            startOnLoad: true,
            theme: 'default',
            securityLevel: 'loose',
            fontFamily: 'Arial, sans-serif'
        });
        
        // Zoom functionality
        window.zoomLevels = {};
        
        window.zoomDiagram = function(diagramId, factor) {
            const diagram = document.getElementById(diagramId);
            const diagramContainer = document.getElementById('diagram-' + diagramId);
            const zoomIndicator = document.getElementById('zoom-' + diagramId);
            
            if (!diagram || !diagramContainer) return;
            
            const currentZoom = window.zoomLevels[diagramId] || 1;
            const newZoom = Math.max(0.1, Math.min(5, currentZoom * factor));
            window.zoomLevels[diagramId] = newZoom;
            
            diagram.style.transform = \`scale(\${newZoom})\`;
            diagram.style.transformOrigin = 'center center';
            
            if (zoomIndicator) {
                zoomIndicator.textContent = Math.round(newZoom * 100) + '%';
            }
        };
        
        window.resetZoom = function(diagramId) {
            const diagram = document.getElementById(diagramId);
            const diagramContainer = document.getElementById('diagram-' + diagramId);
            const zoomIndicator = document.getElementById('zoom-' + diagramId);
            
            if (!diagram || !diagramContainer) return;
            
            window.zoomLevels[diagramId] = 1;
            diagram.style.transform = 'scale(1)';
            diagram.style.transformOrigin = 'center center';
            
            if (zoomIndicator) {
                zoomIndicator.textContent = '100%';
            }
        };
        
        // Fullscreen functionality
        window.toggleFullscreen = function(diagramId) {
            const diagramContainer = document.getElementById('diagram-' + diagramId);
            
            if (!diagramContainer) {
                console.error('Diagram container not found');
                return;
            }
            
            if (diagramContainer.classList.contains('fullscreen')) {
                // Exit fullscreen
                diagramContainer.classList.remove('fullscreen');
                document.body.classList.remove('fullscreen-mode');
                document.body.style.overflow = '';
                document.documentElement.style.overflow = '';
                
                const hiddenElements = document.querySelectorAll('.hidden-by-fullscreen');
                hiddenElements.forEach(element => {
                    element.style.display = '';
                    element.classList.remove('hidden-by-fullscreen');
                });
            } else {
                // Enter fullscreen
                diagramContainer.classList.add('fullscreen');
                document.body.classList.add('fullscreen-mode');
                document.body.style.overflow = 'hidden';
                document.documentElement.style.overflow = 'hidden';
                
                const contentToHide = ['header', 'nav', 'main', 'section', 'article', 'aside', 'footer'];
                contentToHide.forEach(selector => {
                    const elements = document.querySelectorAll(selector);
                    elements.forEach(element => {
                        if (!element.closest('.mermaid-diagram')) {
                            element.style.display = 'none';
                            element.classList.add('hidden-by-fullscreen');
                        }
                    });
                });
            }
        };
        
        // Run tests after page loads
        document.addEventListener('DOMContentLoaded', function() {
            setTimeout(() => {
                const tester = new SimpleMermaidTester();
                tester.runAllTests().then(() => {
                    const results = tester.generateReport();
                    document.getElementById('results-content').innerHTML = 
                        \`<p>Total Tests: \${results.total}</p>
                         <p>Passed: \${results.passed}</p>
                         <p>Failed: \${results.failed}</p>
                         <p>Success Rate: \${results.successRate}%</p>\`;
                });
            }, 3000);
        });
    </script>
</body>
</html>
    `;
    
    fs.writeFileSync(path.join(__dirname, 'build', 'mermaid-tests.html'), testPageContent);
    this.log('✅ Test page created at build/mermaid-tests.html');
    
    return true;
  }

  async runTests() {
    this.log('🚀 Starting Mermaid Diagram Test Suite...');
    
    try {
      // Check if server is running
      const serverRunning = await this.checkServerRunning();
      
      if (!serverRunning) {
        this.log('⚠️  Server not running. Please start the server first:');
        this.log('   cd build && python3 -m http.server 8080');
        return;
      }
      
      // Create test page
      await this.createTestPage();
      
      this.log('✅ Test suite setup complete!');
      this.log('📄 Test page available at: http://localhost:8080/mermaid-tests.html');
      this.log('📄 Article with diagrams: http://localhost:8080/articles/android-system-server-deep-dive.html');
      
      this.log('\n🎯 Manual Test Instructions:');
      this.log('1. Open http://localhost:8080/mermaid-tests.html in your browser');
      this.log('2. Check the browser console for test results');
      this.log('3. Test the following features manually:');
      this.log('   - Zoom in/out buttons (🔍+ / 🔍-)');
      this.log('   - Reset zoom button (⌂)');
      this.log('   - Fullscreen button (⛶)');
      this.log('   - Keyboard shortcuts (Ctrl+Plus, Ctrl+Minus, Ctrl+0, Ctrl+F)');
      this.log('   - Escape key to exit fullscreen');
      
    } catch (error) {
      this.log(`❌ Test suite failed: ${error.message}`);
    }
  }
}

// Run tests if this script is executed directly
if (require.main === module) {
  const runner = new MermaidTestRunner();
  runner.runTests().catch(console.error);
}

module.exports = MermaidTestRunner;
