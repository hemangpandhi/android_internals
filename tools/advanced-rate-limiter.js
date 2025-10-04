#!/usr/bin/env node

// Advanced Rate Limiting for Android Internals Website
// Implements different rate limits for different endpoints

class AdvancedRateLimiter {
  constructor() {
    this.requests = new Map();
    this.blockedIPs = new Set();
    this.suspiciousIPs = new Set();
  }

  // Clean up old entries
  cleanup() {
    const now = Date.now();
    for (const [key, data] of this.requests.entries()) {
      if (now > data.resetTime) {
        this.requests.delete(key);
      }
    }
  }

  // Check if IP is blocked
  isBlocked(ip) {
    return this.blockedIPs.has(ip);
  }

  // Check rate limit
  checkRateLimit(ip, endpoint, maxRequests, windowMs) {
    const key = `${ip}-${endpoint}`;
    const now = Date.now();
    
    if (!this.requests.has(key)) {
      this.requests.set(key, {
        count: 1,
        resetTime: now + windowMs
      });
      return { allowed: true, remaining: maxRequests - 1 };
    }

    const data = this.requests.get(key);
    
    if (now > data.resetTime) {
      data.count = 1;
      data.resetTime = now + windowMs;
      return { allowed: true, remaining: maxRequests - 1 };
    }

    if (data.count >= maxRequests) {
      // Mark as suspicious after multiple violations
      if (data.count >= maxRequests * 2) {
        this.suspiciousIPs.add(ip);
      }
      return { allowed: false, remaining: 0 };
    }

    data.count++;
    return { allowed: true, remaining: maxRequests - data.count };
  }

  // Newsletter subscription rate limit
  newsletterRateLimit(ip) {
    return this.checkRateLimit(ip, 'newsletter', 5, 60 * 60 * 1000); // 5 per hour
  }

  // Contact form rate limit
  contactRateLimit(ip) {
    return this.checkRateLimit(ip, 'contact', 3, 60 * 60 * 1000); // 3 per hour
  }

  // Admin login rate limit
  loginRateLimit(ip) {
    return this.checkRateLimit(ip, 'login', 5, 15 * 60 * 1000); // 5 per 15 minutes
  }

  // General API rate limit
  apiRateLimit(ip) {
    return this.checkRateLimit(ip, 'api', 100, 15 * 60 * 1000); // 100 per 15 minutes
  }

  // Block IP temporarily
  blockIP(ip, duration = 60 * 60 * 1000) { // 1 hour default
    this.blockedIPs.add(ip);
    setTimeout(() => {
      this.blockedIPs.delete(ip);
    }, duration);
  }

  // Record failed attempt
  recordFailedAttempt(ip) {
    const attempts = this.failedAttempts.get(ip) || 0;
    this.failedAttempts.set(ip, attempts + 1);
    
    if (attempts >= 10) {
      this.suspiciousIPs.add(ip);
      this.blockIP(ip, 60 * 60 * 1000); // Block for 1 hour
      console.warn(`🚨 IP ${ip} blocked due to excessive failed attempts`);
    }
  }

  // Get rate limit info
  getRateLimitInfo(ip, endpoint) {
    const key = `${ip}-${endpoint}`;
    const data = this.requests.get(key);
    if (!data) return null;
    
    return {
      count: data.count,
      resetTime: data.resetTime,
      isBlocked: this.isBlocked(ip),
      isSuspicious: this.suspiciousIPs.has(ip)
    };
  }
}

// Export singleton instance
module.exports = new AdvancedRateLimiter();
