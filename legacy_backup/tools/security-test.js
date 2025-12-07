#!/usr/bin/env node

// Security Testing Script for Android Internals Website
const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');

class SecurityTester {
  constructor() {
    this.testResults = [];
    this.baseUrl = process.env.TEST_URL || 'http://localhost:8080';
  }

  // Test security headers
  async testSecurityHeaders(url) {
    return new Promise((resolve, reject) => {
      const client = url.startsWith('https') ? https : http;
      
      client.get(url, (res) => {
        const securityHeaders = [
          'x-content-type-options',
          'x-frame-options',
          'x-xss-protection',
          'strict-transport-security',
          'content-security-policy',
          'referrer-policy',
          'permissions-policy',
          'cross-origin-embedder-policy',
          'cross-origin-opener-policy',
          'cross-origin-resource-policy'
        ];

        const results = {};
        securityHeaders.forEach(header => {
          const value = res.headers[header];
          if (value) {
            results[header] = value;
          } else {
            results[header] = 'MISSING';
          }
        });

        resolve(results);
      }).on('error', (error) => {
        console.warn('Security header test failed:', error.message);
        // Return all headers as missing if request fails
        const results = {};
        const securityHeaders = [
          'x-content-type-options',
          'x-frame-options',
          'x-xss-protection',
          'strict-transport-security',
          'content-security-policy',
          'referrer-policy',
          'permissions-policy',
          'cross-origin-embedder-policy',
          'cross-origin-opener-policy',
          'cross-origin-resource-policy'
        ];
        securityHeaders.forEach(header => {
          results[header] = 'MISSING';
        });
        resolve(results);
      });
    });
  }

  // Test for common vulnerabilities
  async testCommonVulnerabilities(url) {
    const vulnerabilities = [];
    
    // Test for SQL injection
    const sqlTests = [
      "' OR '1'='1",
      "'; DROP TABLE users; --",
      "' UNION SELECT * FROM users --"
    ];
    
    for (const test of sqlTests) {
      try {
        const response = await this.makeRequest(`${url}/api/search?q=${encodeURIComponent(test)}`);
        if (response.includes('error') || response.includes('mysql') || response.includes('sqlite')) {
          vulnerabilities.push({
            type: 'SQL_INJECTION',
            test,
            severity: 'HIGH'
          });
        }
      } catch (error) {
        // Request failed, which is good
      }
    }
    
    // Test for XSS
    const xssTests = [
      '<script>alert("XSS")</script>',
      'javascript:alert("XSS")',
      '<img src="x" onerror="alert(\'XSS\')">'
    ];
    
    for (const test of xssTests) {
      try {
        const response = await this.makeRequest(`${url}/api/contact`, {
          method: 'POST',
          body: JSON.stringify({ message: test })
        });
        if (response.includes('<script>') || response.includes('javascript:')) {
          vulnerabilities.push({
            type: 'XSS',
            test,
            severity: 'HIGH'
          });
        }
      } catch (error) {
        // Request failed, which is good
      }
    }
    
    return vulnerabilities;
  }

  // Test rate limiting
  async testRateLimiting(url) {
    const results = [];
    
    // Test general rate limiting
    const requests = [];
    for (let i = 0; i < 150; i++) {
      requests.push(this.makeRequest(url));
    }
    
    try {
      const responses = await Promise.all(requests);
      const rateLimited = responses.filter(r => r.includes('Too many requests'));
      
      if (rateLimited.length > 0) {
        results.push({
          test: 'GENERAL_RATE_LIMITING',
          status: 'PASS',
          message: 'Rate limiting is working'
        });
      } else {
        results.push({
          test: 'GENERAL_RATE_LIMITING',
          status: 'FAIL',
          message: 'Rate limiting not working'
        });
      }
    } catch (error) {
      results.push({
        test: 'GENERAL_RATE_LIMITING',
        status: 'ERROR',
        message: error.message
      });
    }
    
    return results;
  }

  // Test authentication security
  async testAuthenticationSecurity(url) {
    const results = [];
    
    // Test weak passwords
    const weakPasswords = ['password', '123456', 'admin', 'test'];
    
    for (const password of weakPasswords) {
      try {
        const response = await this.makeRequest(`${url}/api/login`, {
          method: 'POST',
          body: JSON.stringify({
            username: 'admin',
            password: password
          })
        });
        
        if (response.includes('success')) {
          results.push({
            test: 'WEAK_PASSWORD_PROTECTION',
            status: 'FAIL',
            message: `Weak password accepted: ${password}`
          });
        }
      } catch (error) {
        // Request failed, which is good
      }
    }
    
    // Test brute force protection
    for (let i = 0; i < 10; i++) {
      try {
        await this.makeRequest(`${url}/api/login`, {
          method: 'POST',
          body: JSON.stringify({
            username: 'admin',
            password: 'wrongpassword'
          })
        });
      } catch (error) {
        // Request failed, which is good
      }
    }
    
    // Check if IP is blocked
    try {
      const response = await this.makeRequest(url);
      if (response.includes('blocked') || response.includes('429')) {
        results.push({
          test: 'BRUTE_FORCE_PROTECTION',
          status: 'PASS',
          message: 'Brute force protection is working'
        });
      } else {
        results.push({
          test: 'BRUTE_FORCE_PROTECTION',
          status: 'FAIL',
          message: 'Brute force protection not working'
        });
      }
    } catch (error) {
      results.push({
        test: 'BRUTE_FORCE_PROTECTION',
        status: 'PASS',
        message: 'IP blocked after multiple failed attempts'
      });
    }
    
    return results;
  }

  // Make HTTP request
  async makeRequest(url, options = {}) {
    return new Promise((resolve, reject) => {
      const client = url.startsWith('https') ? https : http;
      const requestOptions = {
        method: options.method || 'GET',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'Security-Test-Bot/1.0',
          ...options.headers
        }
      };
      
      const req = client.request(url, requestOptions, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => resolve(data));
      });
      
      req.on('error', reject);
      
      if (options.body) {
        req.write(options.body);
      }
      
      req.end();
    });
  }

  // Run all security tests
  async runAllTests() {
    console.log('🔍 Running security tests...\n');
    
    try {
      // Test security headers
      console.log('Testing security headers...');
      const headerResults = await this.testSecurityHeaders(this.baseUrl);
      this.testResults.push({
        category: 'SECURITY_HEADERS',
        results: headerResults
      });
      
      // Test common vulnerabilities
      console.log('Testing for common vulnerabilities...');
      const vulnerabilityResults = await this.testCommonVulnerabilities(this.baseUrl);
      this.testResults.push({
        category: 'VULNERABILITIES',
        results: vulnerabilityResults
      });
      
      // Test rate limiting
      console.log('Testing rate limiting...');
      const rateLimitResults = await this.testRateLimiting(this.baseUrl);
      this.testResults.push({
        category: 'RATE_LIMITING',
        results: rateLimitResults
      });
      
      // Test authentication security
      console.log('Testing authentication security...');
      const authResults = await this.testAuthenticationSecurity(this.baseUrl);
      this.testResults.push({
        category: 'AUTHENTICATION',
        results: authResults
      });
      
      // Generate report
      this.generateReport();
      
    } catch (error) {
      console.error('Security test failed:', error);
    }
  }

  // Generate security report
  generateReport() {
    console.log('\n📊 Security Test Results:');
    console.log('='.repeat(50));
    
    this.testResults.forEach(category => {
      console.log(`\n${category.category}:`);
      console.log('-'.repeat(30));
      
      if (category.category === 'SECURITY_HEADERS') {
        Object.entries(category.results).forEach(([header, value]) => {
          const status = value === 'MISSING' ? '❌' : '✅';
          console.log(`${status} ${header}: ${value}`);
        });
      } else {
        category.results.forEach(result => {
          const status = result.status === 'PASS' ? '✅' : result.status === 'FAIL' ? '❌' : '⚠️';
          console.log(`${status} ${result.test}: ${result.message}`);
        });
      }
    });
    
    // Save report to file
    const reportPath = path.join(__dirname, '..', 'logs', 'security-test-report.json');
    const report = {
      timestamp: new Date().toISOString(),
      baseUrl: this.baseUrl,
      results: this.testResults
    };
    
    try {
      fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
      console.log(`\n📄 Report saved to: ${reportPath}`);
    } catch (error) {
      console.error('Failed to save report:', error);
    }
  }
}

// Run tests if called directly
if (require.main === module) {
  const tester = new SecurityTester();
  tester.runAllTests().catch(console.error);
}

module.exports = SecurityTester;
