#!/usr/bin/env node

// Security Monitoring for Android Internals Website
const fs = require('fs');
const path = require('path');

class SecurityMonitor {
  constructor() {
    this.logFile = path.join(__dirname, '..', 'logs', 'security.log');
    this.suspiciousIPs = new Set();
    this.failedAttempts = new Map();
    this.attackPatterns = new Map();
    
    // Ensure logs directory exists
    this.ensureLogsDirectory();
    
    // Cleanup interval
    this.cleanupInterval = setInterval(() => this.cleanup(), 5 * 60 * 1000); // Every 5 minutes
  }

  ensureLogsDirectory() {
    const logsDir = path.dirname(this.logFile);
    if (!fs.existsSync(logsDir)) {
      fs.mkdirSync(logsDir, { recursive: true });
    }
  }

  logSecurityEvent(event, req, details = {}) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      event,
      ip: req.ip || req.connection.remoteAddress,
      userAgent: req.get('User-Agent') || 'Unknown',
      url: req.url,
      method: req.method,
      headers: this.sanitizeHeaders(req.headers),
      details
    };

    // Write to log file
    try {
      fs.appendFileSync(this.logFile, JSON.stringify(logEntry) + '\n');
    } catch (error) {
      console.error('Failed to write security log:', error);
    }

    // Check for suspicious patterns
    this.checkSuspiciousActivity(logEntry);
  }

  sanitizeHeaders(headers) {
    const sanitized = { ...headers };
    // Remove sensitive headers
    delete sanitized.authorization;
    delete sanitized.cookie;
    delete sanitized['x-api-key'];
    return sanitized;
  }

  checkSuspiciousActivity(logEntry) {
    const suspiciousPatterns = [
      { pattern: /sqlmap/i, type: 'SQL_INJECTION_TOOL' },
      { pattern: /nikto/i, type: 'VULNERABILITY_SCANNER' },
      { pattern: /nmap/i, type: 'PORT_SCANNER' },
      { pattern: /wget/i, type: 'AUTOMATED_TOOL' },
      { pattern: /curl/i, type: 'AUTOMATED_TOOL' },
      { pattern: /python-requests/i, type: 'AUTOMATED_TOOL' },
      { pattern: /bot/i, type: 'BOT' },
      { pattern: /crawler/i, type: 'CRAWLER' },
      { pattern: /scanner/i, type: 'SCANNER' },
      { pattern: /hack/i, type: 'SUSPICIOUS_KEYWORD' },
      { pattern: /exploit/i, type: 'SUSPICIOUS_KEYWORD' },
      { pattern: /admin/i, type: 'ADMIN_ACCESS_ATTEMPT' },
      { pattern: /login/i, type: 'LOGIN_ATTEMPT' },
      { pattern: /\.\.\//, type: 'PATH_TRAVERSAL' },
      { pattern: /<script/i, type: 'XSS_ATTEMPT' },
      { pattern: /javascript:/i, type: 'XSS_ATTEMPT' },
      { pattern: /union.*select/i, type: 'SQL_INJECTION' },
      { pattern: /drop.*table/i, type: 'SQL_INJECTION' },
      { pattern: /insert.*into/i, type: 'SQL_INJECTION' }
    ];

    const userAgent = logEntry.userAgent || '';
    const url = logEntry.url || '';
    const combined = `${userAgent} ${url}`.toLowerCase();

    for (const { pattern, type } of suspiciousPatterns) {
      if (pattern.test(combined)) {
        this.recordAttackPattern(logEntry.ip, type);
        this.suspiciousIPs.add(logEntry.ip);
        console.warn(`🚨 Security Alert: ${type} detected from ${logEntry.ip}`);
        this.logSecurityEvent('SUSPICIOUS_ACTIVITY', req, { type, pattern: pattern.toString() });
      }
    }
  }

  recordAttackPattern(ip, type) {
    const key = `${ip}-${type}`;
    const count = this.attackPatterns.get(key) || 0;
    this.attackPatterns.set(key, count + 1);
    
    if (count >= 5) {
      this.blockIP(ip, 60 * 60 * 1000); // Block for 1 hour
    }
  }

  recordFailedAttempt(ip) {
    const attempts = this.failedAttempts.get(ip) || 0;
    this.failedAttempts.set(ip, attempts + 1);
    
    if (attempts >= 10) {
      this.suspiciousIPs.add(ip);
      this.blockIP(ip, 60 * 60 * 1000); // Block for 1 hour
      console.warn(`🚨 IP ${ip} blocked due to excessive failed attempts`);
    }
  }

  blockIP(ip, duration = 60 * 60 * 1000) {
    this.suspiciousIPs.add(ip);
    setTimeout(() => {
      this.suspiciousIPs.delete(ip);
      console.log(`🔓 IP ${ip} unblocked`);
    }, duration);
  }

  isIPBlocked(ip) {
    return this.suspiciousIPs.has(ip);
  }

  isIPSuspicious(ip) {
    return this.suspiciousIPs.has(ip);
  }

  getSecurityStats() {
    return {
      suspiciousIPs: Array.from(this.suspiciousIPs),
      failedAttempts: Object.fromEntries(this.failedAttempts),
      attackPatterns: Object.fromEntries(this.attackPatterns)
    };
  }

  cleanup() {
    const now = Date.now();
    
    // Clean up old failed attempts (older than 1 hour)
    for (const [ip, timestamp] of this.failedAttempts.entries()) {
      if (now - timestamp > 60 * 60 * 1000) {
        this.failedAttempts.delete(ip);
      }
    }
    
    // Clean up old attack patterns (older than 24 hours)
    for (const [key, timestamp] of this.attackPatterns.entries()) {
      if (now - timestamp > 24 * 60 * 60 * 1000) {
        this.attackPatterns.delete(key);
      }
    }
  }

  // Generate security report
  generateSecurityReport() {
    const stats = this.getSecurityStats();
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        suspiciousIPs: stats.suspiciousIPs.length,
        failedAttempts: Object.keys(stats.failedAttempts).length,
        attackPatterns: Object.keys(stats.attackPatterns).length
      },
      details: stats
    };
    
    return report;
  }

  // Cleanup on process exit
  destroy() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
  }
}

// Export singleton instance
const securityMonitor = new SecurityMonitor();

// Cleanup on process exit
process.on('exit', () => securityMonitor.destroy());
process.on('SIGINT', () => {
  securityMonitor.destroy();
  process.exit();
});
process.on('SIGTERM', () => {
  securityMonitor.destroy();
  process.exit();
});

module.exports = securityMonitor;
