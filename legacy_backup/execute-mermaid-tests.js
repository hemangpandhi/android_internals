/**
 * Test Execution Script for Mermaid Diagram Functionality
 * This script will run all tests and provide detailed results
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

class MermaidTestExecutor {
  constructor() {
    this.browser = null;
    this.page = null;
    this.testResults = [];
    this.serverUrl = 'http://localhost:8080';
  }

  async setup() {
    console.log('🚀 Setting up test environment...');
    
    // Launch browser
    this.browser = await puppeteer.launch({
      headless: false, // Set to true for headless mode
      devtools: false,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    this.page = await this.browser.newPage();
    
    // Set viewport
    await this.page.setViewport({ width: 1280, height: 720 });
    
    console.log('✅ Browser setup complete');
  }

  async navigateToArticle() {
    console.log('📄 Navigating to article with Mermaid diagrams...');
    
    const articleUrl = `${this.serverUrl}/articles/android-system-server-deep-dive.html`;
    await this.page.goto(articleUrl, { waitUntil: 'networkidle2' });
    
    // Wait for Mermaid diagrams to render
    await this.page.waitForSelector('.mermaid-diagram', { timeout: 10000 });
    
    console.log('✅ Article loaded with Mermaid diagrams');
  }

  async testFullscreenEntry() {
    console.log('🧪 Testing Fullscreen Entry...');
    
    try {
      // Find the first Mermaid diagram
      const diagramContainer = await this.page.$('.mermaid-diagram');
      if (!diagramContainer) {
        throw new Error('No Mermaid diagram found');
      }

      // Get diagram ID
      const diagramId = await this.page.evaluate(() => {
        const container = document.querySelector('.mermaid-diagram');
        return container ? container.querySelector('.mermaid').id : null;
      });

      if (!diagramId) {
        throw new Error('Could not find diagram ID');
      }

      // Enter fullscreen
      await this.page.evaluate((id) => {
        window.toggleFullscreen(id);
      }, diagramId);

      // Wait a bit for fullscreen to activate
      await this.page.waitForTimeout(500);

      // Check if fullscreen classes are applied
      const isFullscreen = await this.page.evaluate(() => {
        const container = document.querySelector('.mermaid-diagram');
        return container && container.classList.contains('fullscreen');
      });

      const hasBodyClass = await this.page.evaluate(() => {
        return document.body.classList.contains('fullscreen-mode');
      });

      if (isFullscreen && hasBodyClass) {
        console.log('✅ Fullscreen entry test passed');
        return { test: 'Fullscreen Entry', passed: true, message: 'Fullscreen classes applied correctly' };
      } else {
        console.log('❌ Fullscreen entry test failed');
        return { test: 'Fullscreen Entry', passed: false, message: 'Fullscreen classes not applied' };
      }
    } catch (error) {
      console.log(`❌ Fullscreen entry test failed: ${error.message}`);
      return { test: 'Fullscreen Entry', passed: false, message: error.message };
    }
  }

  async testFullscreenExit() {
    console.log('🧪 Testing Fullscreen Exit...');
    
    try {
      // Get diagram ID
      const diagramId = await this.page.evaluate(() => {
        const container = document.querySelector('.mermaid-diagram');
        return container ? container.querySelector('.mermaid').id : null;
      });

      // Exit fullscreen
      await this.page.evaluate((id) => {
        window.toggleFullscreen(id);
      }, diagramId);

      // Wait a bit for fullscreen to deactivate
      await this.page.waitForTimeout(500);

      // Check if fullscreen classes are removed
      const isFullscreen = await this.page.evaluate(() => {
        const container = document.querySelector('.mermaid-diagram');
        return container && container.classList.contains('fullscreen');
      });

      const hasBodyClass = await this.page.evaluate(() => {
        return document.body.classList.contains('fullscreen-mode');
      });

      if (!isFullscreen && !hasBodyClass) {
        console.log('✅ Fullscreen exit test passed');
        return { test: 'Fullscreen Exit', passed: true, message: 'Fullscreen classes removed correctly' };
      } else {
        console.log('❌ Fullscreen exit test failed');
        return { test: 'Fullscreen Exit', passed: false, message: 'Fullscreen classes not removed' };
      }
    } catch (error) {
      console.log(`❌ Fullscreen exit test failed: ${error.message}`);
      return { test: 'Fullscreen Exit', passed: false, message: error.message };
    }
  }

  async testKeyboardShortcuts() {
    console.log('🧪 Testing Keyboard Shortcuts...');
    
    try {
      // Hover over diagram to make it active
      await this.page.hover('.mermaid-diagram');
      
      // Test Ctrl+F for fullscreen
      await this.page.keyboard.down('Control');
      await this.page.keyboard.press('KeyF');
      await this.page.keyboard.up('Control');
      
      // Wait for fullscreen to activate
      await this.page.waitForTimeout(500);
      
      // Check if fullscreen was triggered
      const isFullscreen = await this.page.evaluate(() => {
        const container = document.querySelector('.mermaid-diagram');
        return container && container.classList.contains('fullscreen');
      });

      if (isFullscreen) {
        console.log('✅ Keyboard shortcuts test passed');
        return { test: 'Keyboard Shortcuts', passed: true, message: 'Ctrl+F fullscreen shortcut works' };
      } else {
        console.log('❌ Keyboard shortcuts test failed');
        return { test: 'Keyboard Shortcuts', passed: false, message: 'Ctrl+F fullscreen shortcut failed' };
      }
    } catch (error) {
      console.log(`❌ Keyboard shortcuts test failed: ${error.message}`);
      return { test: 'Keyboard Shortcuts', passed: false, message: error.message };
    }
  }

  async testEscapeKeyExit() {
    console.log('🧪 Testing Escape Key Exit...');
    
    try {
      // Ensure we're in fullscreen
      const diagramId = await this.page.evaluate(() => {
        const container = document.querySelector('.mermaid-diagram');
        return container ? container.querySelector('.mermaid').id : null;
      });

      if (!diagramId) {
        throw new Error('Could not find diagram ID');
      }

      // Enter fullscreen if not already
      await this.page.evaluate((id) => {
        const container = document.querySelector('.mermaid-diagram');
        if (!container.classList.contains('fullscreen')) {
          window.toggleFullscreen(id);
        }
      }, diagramId);

      await this.page.waitForTimeout(500);

      // Press escape key
      await this.page.keyboard.press('Escape');
      await this.page.waitForTimeout(500);

      // Check if fullscreen was exited
      const isFullscreen = await this.page.evaluate(() => {
        const container = document.querySelector('.mermaid-diagram');
        return container && container.classList.contains('fullscreen');
      });

      if (!isFullscreen) {
        console.log('✅ Escape key exit test passed');
        return { test: 'Escape Key Exit', passed: true, message: 'Escape key exits fullscreen' };
      } else {
        console.log('❌ Escape key exit test failed');
        return { test: 'Escape Key Exit', passed: false, message: 'Escape key does not exit fullscreen' };
      }
    } catch (error) {
      console.log(`❌ Escape key exit test failed: ${error.message}`);
      return { test: 'Escape Key Exit', passed: false, message: error.message };
    }
  }

  async testZoomFunctionality() {
    console.log('🧪 Testing Zoom Functionality...');
    
    try {
      const diagramId = await this.page.evaluate(() => {
        const container = document.querySelector('.mermaid-diagram');
        return container ? container.querySelector('.mermaid').id : null;
      });

      if (!diagramId) {
        throw new Error('Could not find diagram ID');
      }

      // Test zoom in
      await this.page.evaluate((id) => {
        window.zoomDiagram(id, 1.2);
      }, diagramId);

      await this.page.waitForTimeout(300);

      // Test zoom out
      await this.page.evaluate((id) => {
        window.zoomDiagram(id, 0.8);
      }, diagramId);

      await this.page.waitForTimeout(300);

      // Test reset zoom
      await this.page.evaluate((id) => {
        window.resetZoom(id);
      }, diagramId);

      await this.page.waitForTimeout(300);

      // Check if zoom functions are working
      const hasZoomTransform = await this.page.evaluate(() => {
        const mermaidElement = document.querySelector('.mermaid');
        return mermaidElement && mermaidElement.style.transform.includes('scale');
      });

      if (hasZoomTransform) {
        console.log('✅ Zoom functionality test passed');
        return { test: 'Zoom Functionality', passed: true, message: 'Zoom functions work correctly' };
      } else {
        console.log('❌ Zoom functionality test failed');
        return { test: 'Zoom Functionality', passed: false, message: 'Zoom functions failed' };
      }
    } catch (error) {
      console.log(`❌ Zoom functionality test failed: ${error.message}`);
      return { test: 'Zoom Functionality', passed: false, message: error.message };
    }
  }

  async testContentHidingInFullscreen() {
    console.log('🧪 Testing Content Hiding in Fullscreen...');
    
    try {
      const diagramId = await this.page.evaluate(() => {
        const container = document.querySelector('.mermaid-diagram');
        return container ? container.querySelector('.mermaid').id : null;
      });

      // Enter fullscreen
      await this.page.evaluate((id) => {
        window.toggleFullscreen(id);
      }, diagramId);

      await this.page.waitForTimeout(500);

      // Check if content is hidden
      const hiddenElementsCount = await this.page.evaluate(() => {
        return document.querySelectorAll('.hidden-by-fullscreen').length;
      });

      // Exit fullscreen
      await this.page.evaluate((id) => {
        window.toggleFullscreen(id);
      }, diagramId);

      if (hiddenElementsCount > 0) {
        console.log('✅ Content hiding test passed');
        return { test: 'Content Hiding in Fullscreen', passed: true, message: `Content is properly hidden (${hiddenElementsCount} elements)` };
      } else {
        console.log('❌ Content hiding test failed');
        return { test: 'Content Hiding in Fullscreen', passed: false, message: 'Content is not hidden in fullscreen' };
      }
    } catch (error) {
      console.log(`❌ Content hiding test failed: ${error.message}`);
      return { test: 'Content Hiding in Fullscreen', passed: false, message: error.message };
    }
  }

  async runAllTests() {
    console.log('🚀 Starting Comprehensive Mermaid Diagram Test Suite...\n');
    
    try {
      await this.setup();
      await this.navigateToArticle();
      
      const tests = [
        () => this.testFullscreenEntry(),
        () => this.testFullscreenExit(),
        () => this.testKeyboardShortcuts(),
        () => this.testEscapeKeyExit(),
        () => this.testZoomFunctionality(),
        () => this.testContentHidingInFullscreen()
      ];
      
      for (const test of tests) {
        try {
          const result = await test();
          this.testResults.push(result);
          await this.page.waitForTimeout(1000); // Wait between tests
        } catch (error) {
          console.error(`❌ Test failed with error: ${error.message}`);
          this.testResults.push({
            test: 'Unknown Test',
            passed: false,
            message: error.message
          });
        }
      }
      
      this.generateReport();
      
    } catch (error) {
      console.error(`❌ Test suite failed: ${error.message}`);
    } finally {
      if (this.browser) {
        await this.browser.close();
      }
    }
  }

  generateReport() {
    console.log('\n📊 Test Report Summary:');
    console.log('='.repeat(50));
    
    const passedTests = this.testResults.filter(result => result.passed);
    const failedTests = this.testResults.filter(result => !result.passed);
    
    console.log(`✅ Passed: ${passedTests.length}`);
    console.log(`❌ Failed: ${failedTests.length}`);
    console.log(`📈 Success Rate: ${Math.round((passedTests.length / this.testResults.length) * 100)}%`);
    
    if (failedTests.length > 0) {
      console.log('\n❌ Failed Tests:');
      failedTests.forEach(test => {
        console.log(`  - ${test.test}: ${test.message}`);
      });
    }
    
    console.log('\n🎯 Detailed Test Results:');
    this.testResults.forEach(result => {
      console.log(`${result.passed ? '✅' : '❌'} ${result.test}: ${result.message}`);
    });
    
    // Save results to file
    const reportData = {
      timestamp: new Date().toISOString(),
      total: this.testResults.length,
      passed: passedTests.length,
      failed: failedTests.length,
      successRate: Math.round((passedTests.length / this.testResults.length) * 100),
      results: this.testResults
    };
    
    fs.writeFileSync('mermaid-test-results.json', JSON.stringify(reportData, null, 2));
    console.log('\n💾 Test results saved to mermaid-test-results.json');
    
    return reportData;
  }
}

// Run tests if this script is executed directly
if (require.main === module) {
  const executor = new MermaidTestExecutor();
  executor.runAllTests().catch(console.error);
}

module.exports = MermaidTestExecutor;
