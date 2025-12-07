#!/usr/bin/env node

// Simple Security Test for Python Server
const http = require('http');

class PythonSecurityTest {
  constructor() {
    this.baseUrl = 'http://localhost:8080';
  }

  // Test if security headers are present
  async testSecurityHeaders() {
    return new Promise((resolve) => {
      http.get(this.baseUrl, (res) => {
        const headers = res.headers;
        const results = {
          'x-content-type-options': headers['x-content-type-options'] || 'MISSING',
          'x-frame-options': headers['x-frame-options'] || 'MISSING',
          'x-xss-protection': headers['x-xss-protection'] || 'MISSING',
          'strict-transport-security': headers['strict-transport-security'] || 'MISSING',
          'content-security-policy': headers['content-security-policy'] || 'MISSING',
          'referrer-policy': headers['referrer-policy'] || 'MISSING',
          'permissions-policy': headers['permissions-policy'] || 'MISSING',
          'cross-origin-embedder-policy': headers['cross-origin-embedder-policy'] || 'MISSING',
          'cross-origin-opener-policy': headers['cross-origin-opener-policy'] || 'MISSING',
          'cross-origin-resource-policy': headers['cross-origin-resource-policy'] || 'MISSING'
        };
        
        console.log('🔍 Security Headers Test Results:');
        console.log('================================');
        
        let passed = 0;
        let total = 0;
        
        Object.entries(results).forEach(([header, value]) => {
          total++;
          const status = value === 'MISSING' ? '❌' : '✅';
          console.log(`${status} ${header}: ${value}`);
          if (value !== 'MISSING') passed++;
        });
        
        console.log(`\n📊 Results: ${passed}/${total} headers present`);
        console.log(`Security Score: ${Math.round((passed/total) * 100)}%`);
        
        resolve({ passed, total, results });
      }).on('error', (error) => {
        console.error('❌ Failed to connect to server:', error.message);
        console.log('💡 Make sure the Python server is running on port 8080');
        resolve({ passed: 0, total: 10, results: {} });
      });
    });
  }

  // Test server response
  async testServerResponse() {
    return new Promise((resolve) => {
      http.get(this.baseUrl, (res) => {
        console.log(`\n🌐 Server Response Test:`);
        console.log(`Status Code: ${res.statusCode}`);
        console.log(`Content Type: ${res.headers['content-type']}`);
        console.log(`Server: ${res.headers['server'] || 'Unknown'}`);
        
        resolve({
          statusCode: res.statusCode,
          contentType: res.headers['content-type'],
          server: res.headers['server']
        });
      }).on('error', (error) => {
        console.error('❌ Server not responding:', error.message);
        resolve({ statusCode: 0, contentType: null, server: null });
      });
    });
  }

  // Run all tests
  async runTests() {
    console.log('🚀 Starting Python Server Security Tests...\n');
    
    const headerResults = await this.testSecurityHeaders();
    const serverResults = await this.testServerResponse();
    
    console.log('\n📋 Summary:');
    console.log('============');
    
    if (headerResults.passed === headerResults.total) {
      console.log('✅ All security headers are present!');
    } else {
      console.log(`⚠️  ${headerResults.total - headerResults.passed} security headers are missing`);
      console.log('💡 The Python server needs to be updated with security headers');
    }
    
    if (serverResults.statusCode === 200) {
      console.log('✅ Server is responding correctly');
    } else {
      console.log('❌ Server is not responding correctly');
    }
  }
}

// Run tests if called directly
if (require.main === module) {
  const tester = new PythonSecurityTest();
  tester.runTests().catch(console.error);
}

module.exports = PythonSecurityTest;
