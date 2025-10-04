# 🛡️ PRODUCTION SECURITY HARDENING - PHASE 3

## 1. Advanced Monitoring & Logging

### Create `tools/security-monitor.js`:
```javascript
const fs = require('fs');
const path = require('path');

class SecurityMonitor {
  constructor() {
    this.logFile = path.join(__dirname, '..', 'logs', 'security.log');
    this.suspiciousIPs = new Set();
    this.failedAttempts = new Map();
  }

  logSecurityEvent(event, req) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      event,
      ip: req.ip || req.connection.remoteAddress,
      userAgent: req.get('User-Agent'),
      url: req.url,
      method: req.method
    };

    // Write to log file
    fs.appendFileSync(this.logFile, JSON.stringify(logEntry) + '\n');

    // Check for suspicious patterns
    this.checkSuspiciousActivity(logEntry);
  }

  checkSuspiciousActivity(logEntry) {
    const suspiciousPatterns = [
      /sqlmap/i,
      /nikto/i,
      /nmap/i,
      /wget/i,
      /curl/i,
      /python-requests/i,
      /bot/i,
      /crawler/i
    ];

    const userAgent = logEntry.userAgent || '';
    const isSuspicious = suspiciousPatterns.some(pattern => 
      pattern.test(userAgent) || pattern.test(logEntry.url)
    );

    if (isSuspicious) {
      this.suspiciousIPs.add(logEntry.ip);
      console.warn(`🚨 Suspicious activity detected from ${logEntry.ip}`);
    }
  }

  isIPBlocked(ip) {
    return this.suspiciousIPs.has(ip);
  }

  recordFailedAttempt(ip) {
    const attempts = this.failedAttempts.get(ip) || 0;
    this.failedAttempts.set(ip, attempts + 1);
    
    if (attempts >= 10) {
      this.suspiciousIPs.add(ip);
      console.warn(`🚨 IP ${ip} blocked due to excessive failed attempts`);
    }
  }
}

module.exports = new SecurityMonitor();
```

## 2. Database Security (if using database)

### Create `tools/database-security.js`:
```javascript
const crypto = require('crypto');

class DatabaseSecurity {
  static hashPassword(password) {
    const salt = crypto.randomBytes(32).toString('hex');
    const hash = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
    return { salt, hash };
  }

  static verifyPassword(password, salt, hash) {
    const testHash = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
    return testHash === hash;
  }

  static generateSecureToken() {
    return crypto.randomBytes(32).toString('hex');
  }

  static sanitizeQuery(query) {
    // Remove potentially dangerous SQL patterns
    return query
      .replace(/--/g, '') // Remove SQL comments
      .replace(/;/g, '') // Remove semicolons
      .replace(/union/gi, '') // Remove UNION
      .replace(/select/gi, '') // Remove SELECT
      .replace(/insert/gi, '') // Remove INSERT
      .replace(/update/gi, '') // Remove UPDATE
      .replace(/delete/gi, '') // Remove DELETE
      .replace(/drop/gi, '') // Remove DROP
      .trim();
  }
}

module.exports = DatabaseSecurity;
```

## 3. API Security Enhancement

### Create `tools/api-security.js`:
```javascript
const crypto = require('crypto');

class APISecurity {
  constructor() {
    this.apiKeys = new Map();
    this.requestCounts = new Map();
  }

  generateAPIKey() {
    return crypto.randomBytes(32).toString('hex');
  }

  validateAPIKey(key) {
    return this.apiKeys.has(key);
  }

  rateLimitCheck(ip, endpoint) {
    const key = `${ip}-${endpoint}`;
    const now = Date.now();
    const windowMs = 60 * 1000; // 1 minute
    const maxRequests = 100;

    if (!this.requestCounts.has(key)) {
      this.requestCounts.set(key, { count: 1, resetTime: now + windowMs });
      return true;
    }

    const data = this.requestCounts.get(key);
    
    if (now > data.resetTime) {
      data.count = 1;
      data.resetTime = now + windowMs;
      return true;
    }

    if (data.count >= maxRequests) {
      return false;
    }

    data.count++;
    return true;
  }

  sanitizeResponse(data) {
    // Remove sensitive information from responses
    const sanitized = { ...data };
    delete sanitized.password;
    delete sanitized.token;
    delete sanitized.secret;
    return sanitized;
  }
}

module.exports = new APISecurity();
```

## 4. Content Security Policy (CSP) Enhancement

### Create `tools/csp-generator.js`:
```javascript
class CSPGenerator {
  static generateCSP() {
    const directives = {
      'default-src': ["'self'"],
      'script-src': [
        "'self'",
        "'unsafe-inline'", // Only if absolutely necessary
        "https://cdn.jsdelivr.net",
        "https://api.emailjs.com"
      ],
      'style-src': [
        "'self'",
        "'unsafe-inline'", // Only if absolutely necessary
        "https://fonts.googleapis.com"
      ],
      'img-src': [
        "'self'",
        "data:",
        "https:",
        "blob:"
      ],
      'font-src': [
        "'self'",
        "https://fonts.gstatic.com"
      ],
      'connect-src': [
        "'self'",
        "https://api.emailjs.com",
        "https://cdn.jsdelivr.net"
      ],
      'frame-ancestors': ["'none'"],
      'base-uri': ["'self'"],
      'form-action': ["'self'"],
      'object-src': ["'none'"],
      'media-src': ["'self'"],
      'worker-src': ["'self'", "blob:"],
      'manifest-src': ["'self'"]
    };

    return Object.entries(directives)
      .map(([directive, sources]) => `${directive} ${sources.join(' ')}`)
      .join('; ');
  }
}

module.exports = CSPGenerator;
```

## 5. Production Deployment Security

### Create `tools/production-security.js`:
```javascript
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

class ProductionSecurity {
  static setupHelmet(app) {
    app.use(helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          imgSrc: ["'self'", "data:", "https:"],
          connectSrc: ["'self'", "https://api.emailjs.com"],
          frameAncestors: ["'none'"],
          baseUri: ["'self'"],
          formAction: ["'self'"],
          objectSrc: ["'none'"]
        }
      },
      hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true
      },
      noSniff: true,
      xssFilter: true,
      referrerPolicy: { policy: "strict-origin-when-cross-origin" }
    }));
  }

  static setupRateLimiting(app) {
    const limiter = rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100, // limit each IP to 100 requests per windowMs
      message: 'Too many requests from this IP, please try again later.',
      standardHeaders: true,
      legacyHeaders: false,
    });

    app.use(limiter);
  }

  static setupSecurityHeaders(app) {
    app.use((req, res, next) => {
      res.setHeader('X-Content-Type-Options', 'nosniff');
      res.setHeader('X-Frame-Options', 'DENY');
      res.setHeader('X-XSS-Protection', '1; mode=block');
      res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
      res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
      res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
      next();
    });
  }
}

module.exports = ProductionSecurity;
```

## 6. Security Testing Script

### Create `tools/security-test.js`:
```javascript
const https = require('https');
const http = require('http');

class SecurityTester {
  static async testSecurityHeaders(url) {
    return new Promise((resolve, reject) => {
      const client = url.startsWith('https') ? https : http;
      
      client.get(url, (res) => {
        const securityHeaders = [
          'x-content-type-options',
          'x-frame-options',
          'x-xss-protection',
          'strict-transport-security',
          'content-security-policy'
        ];

        const results = {};
        securityHeaders.forEach(header => {
          results[header] = res.headers[header] || 'MISSING';
        });

        resolve(results);
      }).on('error', reject);
    });
  }

  static async runSecurityTests(baseUrl) {
    console.log('🔍 Running security tests...');
    
    const results = await this.testSecurityHeaders(baseUrl);
    
    console.log('\n📊 Security Header Test Results:');
    Object.entries(results).forEach(([header, value]) => {
      const status = value === 'MISSING' ? '❌' : '✅';
      console.log(`${status} ${header}: ${value}`);
    });

    return results;
  }
}

module.exports = SecurityTester;
```
