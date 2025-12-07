/**
 * Comprehensive Test Suite for Mermaid Diagram Functionality
 * Tests all zoom, fullscreen, and interaction features
 */

class MermaidDiagramTester {
  constructor() {
    this.testResults = [];
    this.currentTest = null;
    this.diagramContainer = null;
    this.originalScrollX = 0;
    this.originalScrollY = 0;
  }

  // Test result logging
  logTest(testName, passed, message = '') {
    const result = {
      test: testName,
      passed: passed,
      message: message,
      timestamp: new Date().toISOString()
    };
    this.testResults.push(result);
    console.log(`${passed ? '✅' : '❌'} ${testName}: ${message}`);
  }

  // Helper function to find diagram container
  findDiagramContainer() {
    this.diagramContainer = document.querySelector('.mermaid-diagram');
    if (!this.diagramContainer) {
      this.logTest('Find Diagram Container', false, 'No Mermaid diagram found on page');
      return false;
    }
    this.logTest('Find Diagram Container', true, 'Diagram container found');
    return true;
  }

  // Test 1: Basic Fullscreen Entry
  testFullscreenEntry() {
    this.currentTest = 'Fullscreen Entry';
    console.log('\n🧪 Testing Fullscreen Entry...');
    
    if (!this.findDiagramContainer()) return false;
    
    const diagramId = this.diagramContainer.querySelector('.mermaid').id;
    
    // Store original scroll position
    this.originalScrollX = window.pageXOffset || document.documentElement.scrollLeft;
    this.originalScrollY = window.pageYOffset || document.documentElement.scrollTop;
    
    // Enter fullscreen
    window.toggleFullscreen(diagramId);
    
    // Check if fullscreen classes are applied
    const hasFullscreenClass = this.diagramContainer.classList.contains('fullscreen');
    const hasBodyFullscreenClass = document.body.classList.contains('fullscreen-mode');
    
    if (hasFullscreenClass && hasBodyFullscreenClass) {
      this.logTest('Fullscreen Entry', true, 'Fullscreen classes applied correctly');
      return true;
    } else {
      this.logTest('Fullscreen Entry', false, 'Fullscreen classes not applied');
      return false;
    }
  }

  // Test 2: Fullscreen Exit
  testFullscreenExit() {
    this.currentTest = 'Fullscreen Exit';
    console.log('\n🧪 Testing Fullscreen Exit...');
    
    if (!this.diagramContainer) return false;
    
    const diagramId = this.diagramContainer.querySelector('.mermaid').id;
    
    // Exit fullscreen
    window.toggleFullscreen(diagramId);
    
    // Check if fullscreen classes are removed
    const hasFullscreenClass = this.diagramContainer.classList.contains('fullscreen');
    const hasBodyFullscreenClass = document.body.classList.contains('fullscreen-mode');
    
    if (!hasFullscreenClass && !hasBodyFullscreenClass) {
      this.logTest('Fullscreen Exit', true, 'Fullscreen classes removed correctly');
      return true;
    } else {
      this.logTest('Fullscreen Exit', false, 'Fullscreen classes not removed');
      return false;
    }
  }

  // Test 3: Keyboard Shortcuts
  testKeyboardShortcuts() {
    this.currentTest = 'Keyboard Shortcuts';
    console.log('\n🧪 Testing Keyboard Shortcuts...');
    
    if (!this.diagramContainer) return false;
    
    const diagramId = this.diagramContainer.querySelector('.mermaid').id;
    let shortcutsWorked = true;
    
    // Test Ctrl+F for fullscreen
    const fullscreenEvent = new KeyboardEvent('keydown', {
      key: 'f',
      ctrlKey: true,
      bubbles: true
    });
    
    // Simulate hover on diagram
    this.diagramContainer.style.pointerEvents = 'auto';
    this.diagramContainer.dispatchEvent(new Event('mouseenter'));
    
    document.dispatchEvent(fullscreenEvent);
    
    // Check if fullscreen was triggered
    setTimeout(() => {
      const isFullscreen = this.diagramContainer.classList.contains('fullscreen');
      if (isFullscreen) {
        this.logTest('Keyboard Shortcuts', true, 'Ctrl+F fullscreen shortcut works');
      } else {
        this.logTest('Keyboard Shortcuts', false, 'Ctrl+F fullscreen shortcut failed');
        shortcutsWorked = false;
      }
    }, 100);
    
    return shortcutsWorked;
  }

  // Test 4: Escape Key Exit
  testEscapeKeyExit() {
    this.currentTest = 'Escape Key Exit';
    console.log('\n🧪 Testing Escape Key Exit...');
    
    if (!this.diagramContainer) return false;
    
    const diagramId = this.diagramContainer.querySelector('.mermaid').id;
    
    // Ensure we're in fullscreen
    if (!this.diagramContainer.classList.contains('fullscreen')) {
      window.toggleFullscreen(diagramId);
    }
    
    // Simulate escape key
    const escapeEvent = new KeyboardEvent('keydown', {
      key: 'Escape',
      bubbles: true
    });
    
    document.dispatchEvent(escapeEvent);
    
    // Check if fullscreen was exited
    setTimeout(() => {
      const isFullscreen = this.diagramContainer.classList.contains('fullscreen');
      if (!isFullscreen) {
        this.logTest('Escape Key Exit', true, 'Escape key exits fullscreen');
      } else {
        this.logTest('Escape Key Exit', false, 'Escape key does not exit fullscreen');
      }
    }, 100);
    
    return true;
  }

  // Test 5: Multiple Fullscreen Toggles
  testMultipleFullscreenToggles() {
    this.currentTest = 'Multiple Fullscreen Toggles';
    console.log('\n🧪 Testing Multiple Fullscreen Toggles...');
    
    if (!this.diagramContainer) return false;
    
    const diagramId = this.diagramContainer.querySelector('.mermaid').id;
    let togglesWorked = true;
    
    // Test multiple toggles
    for (let i = 0; i < 3; i++) {
      window.toggleFullscreen(diagramId);
      const isFullscreen = this.diagramContainer.classList.contains('fullscreen');
      
      if (i % 2 === 0 && !isFullscreen) {
        this.logTest('Multiple Fullscreen Toggles', false, `Toggle ${i + 1} failed - should be fullscreen`);
        togglesWorked = false;
        break;
      } else if (i % 2 === 1 && isFullscreen) {
        this.logTest('Multiple Fullscreen Toggles', false, `Toggle ${i + 1} failed - should not be fullscreen`);
        togglesWorked = false;
        break;
      }
    }
    
    if (togglesWorked) {
      this.logTest('Multiple Fullscreen Toggles', true, 'Multiple toggles work correctly');
    }
    
    return togglesWorked;
  }

  // Test 6: Scroll Position Preservation
  testScrollPositionPreservation() {
    this.currentTest = 'Scroll Position Preservation';
    console.log('\n🧪 Testing Scroll Position Preservation...');
    
    if (!this.diagramContainer) return false;
    
    const diagramId = this.diagramContainer.querySelector('.mermaid').id;
    
    // Scroll to a specific position
    window.scrollTo(0, 500);
    
    // Enter fullscreen
    window.toggleFullscreen(diagramId);
    
    // Exit fullscreen
    window.toggleFullscreen(diagramId);
    
    // Check if scroll position was restored
    setTimeout(() => {
      const currentScrollY = window.pageYOffset || document.documentElement.scrollTop;
      const scrollPreserved = Math.abs(currentScrollY - 500) < 50; // Allow some tolerance
      
      if (scrollPreserved) {
        this.logTest('Scroll Position Preservation', true, 'Scroll position preserved correctly');
      } else {
        this.logTest('Scroll Position Preservation', false, 'Scroll position not preserved');
      }
    }, 100);
    
    return true;
  }

  // Test 7: Zoom Functionality
  testZoomFunctionality() {
    this.currentTest = 'Zoom Functionality';
    console.log('\n🧪 Testing Zoom Functionality...');
    
    if (!this.diagramContainer) return false;
    
    const diagramId = this.diagramContainer.querySelector('.mermaid').id;
    const mermaidElement = document.getElementById(diagramId);
    
    // Test zoom in
    window.zoomDiagram(diagramId, 1.2);
    const zoomInTransform = mermaidElement.style.transform;
    
    // Test zoom out
    window.zoomDiagram(diagramId, 0.8);
    const zoomOutTransform = mermaidElement.style.transform;
    
    // Test reset zoom
    window.resetZoom(diagramId);
    const resetTransform = mermaidElement.style.transform;
    
    if (zoomInTransform.includes('scale') && zoomOutTransform.includes('scale') && resetTransform.includes('scale(1)')) {
      this.logTest('Zoom Functionality', true, 'Zoom in, out, and reset work correctly');
      return true;
    } else {
      this.logTest('Zoom Functionality', false, 'Zoom functionality failed');
      return false;
    }
  }

  // Test 8: Zoom with Fullscreen
  testZoomWithFullscreen() {
    this.currentTest = 'Zoom with Fullscreen';
    console.log('\n🧪 Testing Zoom with Fullscreen...');
    
    if (!this.diagramContainer) return false;
    
    const diagramId = this.diagramContainer.querySelector('.mermaid').id;
    
    // Enter fullscreen
    window.toggleFullscreen(diagramId);
    
    // Test zoom in fullscreen
    window.zoomDiagram(diagramId, 1.5);
    const mermaidElement = document.getElementById(diagramId);
    const hasZoomTransform = mermaidElement.style.transform.includes('scale');
    
    // Exit fullscreen
    window.toggleFullscreen(diagramId);
    
    if (hasZoomTransform) {
      this.logTest('Zoom with Fullscreen', true, 'Zoom works correctly in fullscreen mode');
      return true;
    } else {
      this.logTest('Zoom with Fullscreen', false, 'Zoom does not work in fullscreen mode');
      return false;
    }
  }

  // Test 9: Content Hiding in Fullscreen
  testContentHidingInFullscreen() {
    this.currentTest = 'Content Hiding in Fullscreen';
    console.log('\n🧪 Testing Content Hiding in Fullscreen...');
    
    if (!this.diagramContainer) return false;
    
    const diagramId = this.diagramContainer.querySelector('.mermaid').id;
    
    // Enter fullscreen
    window.toggleFullscreen(diagramId);
    
    // Check if other content is hidden
    const hiddenElements = document.querySelectorAll('.hidden-by-fullscreen');
    const hasHiddenContent = hiddenElements.length > 0;
    
    // Exit fullscreen
    window.toggleFullscreen(diagramId);
    
    if (hasHiddenContent) {
      this.logTest('Content Hiding in Fullscreen', true, 'Content is properly hidden in fullscreen');
      return true;
    } else {
      this.logTest('Content Hiding in Fullscreen', false, 'Content is not hidden in fullscreen');
      return false;
    }
  }

  // Test 10: Diagram Visibility in Fullscreen
  testDiagramVisibilityInFullscreen() {
    this.currentTest = 'Diagram Visibility in Fullscreen';
    console.log('\n🧪 Testing Diagram Visibility in Fullscreen...');
    
    if (!this.diagramContainer) return false;
    
    const diagramId = this.diagramContainer.querySelector('.mermaid').id;
    
    // Enter fullscreen
    window.toggleFullscreen(diagramId);
    
    // Check if diagram is visible
    const mermaidElement = this.diagramContainer.querySelector('.mermaid');
    const isVisible = mermaidElement && 
                     mermaidElement.style.display !== 'none' && 
                     mermaidElement.style.visibility !== 'hidden' &&
                     mermaidElement.style.opacity !== '0';
    
    // Exit fullscreen
    window.toggleFullscreen(diagramId);
    
    if (isVisible) {
      this.logTest('Diagram Visibility in Fullscreen', true, 'Diagram is visible in fullscreen mode');
      return true;
    } else {
      this.logTest('Diagram Visibility in Fullscreen', false, 'Diagram is not visible in fullscreen mode');
      return false;
    }
  }

  // Run all tests
  async runAllTests() {
    console.log('🚀 Starting Comprehensive Mermaid Diagram Test Suite...\n');
    
    const tests = [
      () => this.testFullscreenEntry(),
      () => this.testFullscreenExit(),
      () => this.testKeyboardShortcuts(),
      () => this.testEscapeKeyExit(),
      () => this.testMultipleFullscreenToggles(),
      () => this.testScrollPositionPreservation(),
      () => this.testZoomFunctionality(),
      () => this.testZoomWithFullscreen(),
      () => this.testContentHidingInFullscreen(),
      () => this.testDiagramVisibilityInFullscreen()
    ];
    
    for (const test of tests) {
      try {
        await test();
        // Small delay between tests
        await new Promise(resolve => setTimeout(resolve, 200));
      } catch (error) {
        console.error(`❌ Test failed with error: ${error.message}`);
      }
    }
    
    this.generateReport();
  }

  // Generate test report
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
    
    console.log('\n🎯 Test Results:');
    this.testResults.forEach(result => {
      console.log(`${result.passed ? '✅' : '❌'} ${result.test}`);
    });
    
    return {
      total: this.testResults.length,
      passed: passedTests.length,
      failed: failedTests.length,
      successRate: Math.round((passedTests.length / this.testResults.length) * 100),
      results: this.testResults
    };
  }
}

// Auto-run tests when page loads
document.addEventListener('DOMContentLoaded', function() {
  console.log('🔧 Mermaid Diagram Tester loaded. Starting tests...');
  
  // Wait for Mermaid diagrams to be rendered
  setTimeout(() => {
    const tester = new MermaidDiagramTester();
    tester.runAllTests();
  }, 2000); // Wait 2 seconds for Mermaid to render
});

// Export for manual testing
window.MermaidDiagramTester = MermaidDiagramTester;
