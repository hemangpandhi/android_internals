#!/usr/bin/env node

// API Security for Android Internals Website
const crypto = require('crypto');

class APISecurity {
  constructor() {
    this.apiKeys = new Map();
    this.requestCounts = new Map();
    this.blockedIPs = new Set();
    this.suspiciousRequests = new Map();
  }

  // Generate API key
  generateAPIKey() {
    const key = crypto.randomBytes(32).toString('hex');
    const expires = Date.now() + (365 * 24 * 60 * 60 * 1000); // 1 year
    this.apiKeys.set(key, { expires, requests: 0 });
    return key;
  }

  // Validate API key
  validateAPIKey(key) {
    if (!key) return false;
    
    const keyData = this.apiKeys.get(key);
    if (!keyData) return false;
    
    if (Date.now() > keyData.expires) {
      this.apiKeys.delete(key);
      return false;
    }
    
    return true;
  }

  // Rate limiting for API endpoints
  rateLimitCheck(ip, endpoint, maxRequests = 100, windowMs = 15 * 60 * 1000) {
    const key = `${ip}-${endpoint}`;
    const now = Date.now();
    
    if (!this.requestCounts.has(key)) {
      this.requestCounts.set(key, { count: 1, resetTime: now + windowMs });
      return { allowed: true, remaining: maxRequests - 1 };
    }

    const data = this.requestCounts.get(key);
    
    if (now > data.resetTime) {
      data.count = 1;
      data.resetTime = now + windowMs;
      return { allowed: true, remaining: maxRequests - 1 };
    }

    if (data.count >= maxRequests) {
      this.recordSuspiciousRequest(ip, endpoint);
      return { allowed: false, remaining: 0 };
    }

    data.count++;
    return { allowed: true, remaining: maxRequests - data.count };
  }

  // Record suspicious request
  recordSuspiciousRequest(ip, endpoint) {
    const key = `${ip}-${endpoint}`;
    const count = this.suspiciousRequests.get(key) || 0;
    this.suspiciousRequests.set(key, count + 1);
    
    if (count >= 10) {
      this.blockIP(ip, 60 * 60 * 1000); // Block for 1 hour
    }
  }

  // Block IP address
  blockIP(ip, duration = 60 * 60 * 1000) {
    this.blockedIPs.add(ip);
    setTimeout(() => {
      this.blockedIPs.delete(ip);
    }, duration);
  }

  // Check if IP is blocked
  isIPBlocked(ip) {
    return this.blockedIPs.has(ip);
  }

  // Sanitize response data
  sanitizeResponse(data) {
    if (typeof data !== 'object' || data === null) {
      return data;
    }
    
    const sanitized = { ...data };
    
    // Remove sensitive fields
    delete sanitized.password;
    delete sanitized.token;
    delete sanitized.secret;
    delete sanitized.apiKey;
    delete sanitized.privateKey;
    delete sanitized.creditCard;
    delete sanitized.ssn;
    delete sanitized.socialSecurityNumber;
    
    // Recursively sanitize nested objects
    for (const key in sanitized) {
      if (typeof sanitized[key] === 'object' && sanitized[key] !== null) {
        sanitized[key] = this.sanitizeResponse(sanitized[key]);
      }
    }
    
    return sanitized;
  }

  // Validate request headers
  validateHeaders(headers) {
    const requiredHeaders = ['user-agent', 'accept'];
    const suspiciousHeaders = ['x-forwarded-for', 'x-real-ip', 'x-cluster-client-ip'];
    
    for (const header of requiredHeaders) {
      if (!headers[header]) {
        return { valid: false, error: `Missing required header: ${header}` };
      }
    }
    
    // Check for suspicious headers
    for (const header of suspiciousHeaders) {
      if (headers[header]) {
        return { valid: false, error: `Suspicious header detected: ${header}` };
      }
    }
    
    return { valid: true };
  }

  // Validate request body
  validateRequestBody(body, maxSize = 1024 * 1024) { // 1MB default
    if (!body) return { valid: true };
    
    const bodyString = JSON.stringify(body);
    
    if (bodyString.length > maxSize) {
      return { valid: false, error: 'Request body too large' };
    }
    
    // Check for suspicious patterns
    const suspiciousPatterns = [
      /<script/i,
      /javascript:/i,
      /vbscript:/i,
      /onload/i,
      /onerror/i,
      /eval\(/i,
      /expression\(/i,
      /union.*select/i,
      /drop.*table/i,
      /insert.*into/i,
      /update.*set/i,
      /delete.*from/i
    ];
    
    for (const pattern of suspiciousPatterns) {
      if (pattern.test(bodyString)) {
        return { valid: false, error: 'Request body contains suspicious content' };
      }
    }
    
    return { valid: true };
  }

  // Generate secure session token
  generateSessionToken() {
    return crypto.randomBytes(32).toString('hex');
  }

  // Validate session token
  validateSessionToken(token) {
    if (!token || typeof token !== 'string') return false;
    
    // Check token format (64 hex characters)
    return /^[a-f0-9]{64}$/.test(token);
  }

  // Generate CSRF token
  generateCSRFToken() {
    return crypto.randomBytes(16).toString('hex');
  }

  // Validate CSRF token
  validateCSRFToken(token, sessionToken) {
    if (!token || !sessionToken) return false;
    
    // CSRF token should be derived from session token
    const expectedToken = crypto
      .createHash('sha256')
      .update(sessionToken)
      .digest('hex')
      .substring(0, 32);
    
    return token === expectedToken;
  }

  // Log API request
  logAPIRequest(req, res, responseTime) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      method: req.method,
      url: req.url,
      ip: req.ip || req.connection.remoteAddress,
      userAgent: req.get('User-Agent'),
      statusCode: res.statusCode,
      responseTime,
      headers: this.sanitizeHeaders(req.headers)
    };
    
    console.log(`API Request: ${req.method} ${req.url} - ${res.statusCode} (${responseTime}ms)`);
    return logEntry;
  }

  // Sanitize headers for logging
  sanitizeHeaders(headers) {
    const sanitized = { ...headers };
    delete sanitized.authorization;
    delete sanitized.cookie;
    delete sanitized['x-api-key'];
    return sanitized;
  }

  // Get API statistics
  getAPIStats() {
    return {
      totalKeys: this.apiKeys.size,
      blockedIPs: Array.from(this.blockedIPs),
      suspiciousRequests: Object.fromEntries(this.suspiciousRequests),
      requestCounts: Object.fromEntries(this.requestCounts)
    };
  }

  // Cleanup expired data
  cleanup() {
    const now = Date.now();
    
    // Clean up expired API keys
    for (const [key, data] of this.apiKeys.entries()) {
      if (now > data.expires) {
        this.apiKeys.delete(key);
      }
    }
    
    // Clean up old request counts
    for (const [key, data] of this.requestCounts.entries()) {
      if (now > data.resetTime) {
        this.requestCounts.delete(key);
      }
    }
  }
}

// Export singleton instance
const apiSecurity = new APISecurity();

// Cleanup every 5 minutes
setInterval(() => apiSecurity.cleanup(), 5 * 60 * 1000);

module.exports = apiSecurity;
