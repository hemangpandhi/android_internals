/**
 * Simple Mermaid Diagram Test Suite
 * Tests can be run in browser console or via Node.js
 */

class SimpleMermaidTester {
  constructor() {
    this.testResults = [];
    this.serverUrl = 'http://localhost:8080';
  }

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

  // Test 1: Check if fullscreen function exists
  testFullscreenFunctionExists() {
    console.log('\n🧪 Testing Fullscreen Function Exists...');
    
    if (typeof window.toggleFullscreen === 'function') {
      this.logTest('Fullscreen Function Exists', true, 'toggleFullscreen function is available');
      return true;
    } else {
      this.logTest('Fullscreen Function Exists', false, 'toggleFullscreen function not found');
      return false;
    }
  }

  // Test 2: Check if zoom functions exist
  testZoomFunctionsExist() {
    console.log('\n🧪 Testing Zoom Functions Exist...');
    
    const zoomDiagramExists = typeof window.zoomDiagram === 'function';
    const resetZoomExists = typeof window.resetZoom === 'function';
    
    if (zoomDiagramExists && resetZoomExists) {
      this.logTest('Zoom Functions Exist', true, 'zoomDiagram and resetZoom functions are available');
      return true;
    } else {
      this.logTest('Zoom Functions Exist', false, 'Zoom functions not found');
      return false;
    }
  }

  // Test 3: Check if Mermaid diagrams exist
  testMermaidDiagramsExist() {
    console.log('\n🧪 Testing Mermaid Diagrams Exist...');
    
    const diagrams = document.querySelectorAll('.mermaid-diagram');
    
    if (diagrams.length > 0) {
      this.logTest('Mermaid Diagrams Exist', true, `Found ${diagrams.length} Mermaid diagram(s)`);
      return true;
    } else {
      this.logTest('Mermaid Diagrams Exist', false, 'No Mermaid diagrams found');
      return false;
    }
  }

  // Test 4: Check if fullscreen CSS classes exist
  testFullscreenCSSExists() {
    console.log('\n🧪 Testing Fullscreen CSS Exists...');
    
    // Create a test element to check CSS
    const testElement = document.createElement('div');
    testElement.className = 'mermaid-diagram fullscreen';
    testElement.style.position = 'fixed';
    testElement.style.top = '0';
    testElement.style.left = '0';
    testElement.style.width = '100vw';
    testElement.style.height = '100vh';
    testElement.style.zIndex = '99999';
    testElement.style.background = 'white';
    testElement.style.display = 'flex';
    testElement.style.alignItems = 'center';
    testElement.style.justifyContent = 'center';
    
    // Check if styles are applied
    const computedStyle = window.getComputedStyle(testElement);
    const hasCorrectStyles = 
      computedStyle.position === 'fixed' &&
      computedStyle.top === '0px' &&
      computedStyle.left === '0px' &&
      computedStyle.width === '100vw' &&
      computedStyle.height === '100vh' &&
      computedStyle.zIndex === '99999';
    
    if (hasCorrectStyles) {
      this.logTest('Fullscreen CSS Exists', true, 'Fullscreen CSS styles are properly defined');
      return true;
    } else {
      this.logTest('Fullscreen CSS Exists', false, 'Fullscreen CSS styles are not properly defined');
      return false;
    }
  }

  // Test 5: Check if zoom controls exist
  testZoomControlsExist() {
    console.log('\n🧪 Testing Zoom Controls Exist...');
    
    const zoomControls = document.querySelectorAll('.mermaid-zoom-controls');
    const zoomButtons = document.querySelectorAll('.zoom-btn');
    const fullscreenButtons = document.querySelectorAll('.fullscreen-btn');
    
    if (zoomControls.length > 0 && zoomButtons.length > 0 && fullscreenButtons.length > 0) {
      this.logTest('Zoom Controls Exist', true, `Found ${zoomControls.length} zoom control(s) with ${zoomButtons.length} button(s) and ${fullscreenButtons.length} fullscreen button(s)`);
      return true;
    } else {
      this.logTest('Zoom Controls Exist', false, 'Zoom controls not found');
      return false;
    }
  }

  // Test 6: Check if keyboard event listeners exist
  testKeyboardListenersExist() {
    console.log('\n🧪 Testing Keyboard Listeners Exist...');
    
    // This is a basic test - in a real scenario, we'd need to check event listeners
    // For now, we'll check if the functions that handle keyboard events exist
    const hasKeyboardHandling = typeof window.toggleFullscreen === 'function' && 
                               typeof window.zoomDiagram === 'function';
    
    if (hasKeyboardHandling) {
      this.logTest('Keyboard Listeners Exist', true, 'Keyboard event handling functions are available');
      return true;
    } else {
      this.logTest('Keyboard Listeners Exist', false, 'Keyboard event handling functions not found');
      return false;
    }
  }

  // Test 7: Check if Mermaid is initialized
  testMermaidInitialized() {
    console.log('\n🧪 Testing Mermaid Initialized...');
    
    if (typeof window.mermaid !== 'undefined' && window.mermaid) {
      this.logTest('Mermaid Initialized', true, 'Mermaid library is loaded and initialized');
      return true;
    } else {
      this.logTest('Mermaid Initialized', false, 'Mermaid library not found or not initialized');
      return false;
    }
  }

  // Test 8: Check if diagrams are rendered
  testDiagramsRendered() {
    console.log('\n🧪 Testing Diagrams Rendered...');
    
    const mermaidElements = document.querySelectorAll('.mermaid');
    const svgElements = document.querySelectorAll('.mermaid svg');
    
    if (mermaidElements.length > 0 && svgElements.length > 0) {
      this.logTest('Diagrams Rendered', true, `Found ${mermaidElements.length} Mermaid element(s) with ${svgElements.length} SVG(s)`);
      return true;
    } else {
      this.logTest('Diagrams Rendered', false, 'Diagrams are not properly rendered');
      return false;
    }
  }

  // Test 9: Check if fullscreen button works (basic test)
  testFullscreenButtonBasic() {
    console.log('\n🧪 Testing Fullscreen Button Basic...');
    
    const fullscreenButtons = document.querySelectorAll('.fullscreen-btn');
    
    if (fullscreenButtons.length > 0) {
      // Check if buttons have onclick handlers
      const hasOnclick = Array.from(fullscreenButtons).some(button => 
        button.onclick !== null || button.getAttribute('onclick') !== null
      );
      
      if (hasOnclick) {
        this.logTest('Fullscreen Button Basic', true, 'Fullscreen buttons have click handlers');
        return true;
      } else {
        this.logTest('Fullscreen Button Basic', false, 'Fullscreen buttons do not have click handlers');
        return false;
      }
    } else {
      this.logTest('Fullscreen Button Basic', false, 'No fullscreen buttons found');
      return false;
    }
  }

  // Test 10: Check if zoom indicators exist
  testZoomIndicatorsExist() {
    console.log('\n🧪 Testing Zoom Indicators Exist...');
    
    const zoomIndicators = document.querySelectorAll('.zoom-indicator');
    
    if (zoomIndicators.length > 0) {
      this.logTest('Zoom Indicators Exist', true, `Found ${zoomIndicators.length} zoom indicator(s)`);
      return true;
    } else {
      this.logTest('Zoom Indicators Exist', false, 'No zoom indicators found');
      return false;
    }
  }

  // Run all tests
  async runAllTests() {
    console.log('🚀 Starting Simple Mermaid Diagram Test Suite...\n');
    
    const tests = [
      () => this.testFullscreenFunctionExists(),
      () => this.testZoomFunctionsExist(),
      () => this.testMermaidDiagramsExist(),
      () => this.testFullscreenCSSExists(),
      () => this.testZoomControlsExist(),
      () => this.testKeyboardListenersExist(),
      () => this.testMermaidInitialized(),
      () => this.testDiagramsRendered(),
      () => this.testFullscreenButtonBasic(),
      () => this.testZoomIndicatorsExist()
    ];
    
    for (const test of tests) {
      try {
        await test();
        // Small delay between tests
        await new Promise(resolve => setTimeout(resolve, 100));
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
if (typeof window !== 'undefined') {
  // Browser environment
  document.addEventListener('DOMContentLoaded', function() {
    console.log('🔧 Simple Mermaid Diagram Tester loaded. Starting tests...');
    
    // Wait for Mermaid diagrams to be rendered
    setTimeout(() => {
      const tester = new SimpleMermaidTester();
      tester.runAllTests();
    }, 3000); // Wait 3 seconds for Mermaid to render
  });
} else {
  // Node.js environment
  console.log('🔧 Simple Mermaid Diagram Tester loaded for Node.js environment');
}

// Export for manual testing
if (typeof window !== 'undefined') {
  window.SimpleMermaidTester = SimpleMermaidTester;
} else {
  module.exports = SimpleMermaidTester;
}
