#!/usr/bin/env node

// CSRF Protection for Android Internals Website
const crypto = require('crypto');

class CSRFProtection {
  constructor() {
    this.tokens = new Map();
    this.cleanupInterval = setInterval(() => this.cleanup(), 5 * 60 * 1000); // Clean up every 5 minutes
  }

  // Generate a new CSRF token
  generateToken() {
    const token = crypto.randomBytes(32).toString('hex');
    const expires = Date.now() + (60 * 60 * 1000); // 1 hour
    this.tokens.set(token, { expires });
    return token;
  }

  // Validate CSRF token
  validateToken(token) {
    if (!token) return false;
    
    const tokenData = this.tokens.get(token);
    if (!tokenData) return false;
    
    if (Date.now() > tokenData.expires) {
      this.tokens.delete(token);
      return false;
    }
    
    return true;
  }

  // Clean up expired tokens
  cleanup() {
    const now = Date.now();
    for (const [token, data] of this.tokens.entries()) {
      if (now > data.expires) {
        this.tokens.delete(token);
      }
    }
  }

  // Invalidate token after use (optional)
  invalidateToken(token) {
    this.tokens.delete(token);
  }

  // Get token info
  getTokenInfo(token) {
    const tokenData = this.tokens.get(token);
    if (!tokenData) return null;
    
    return {
      expires: tokenData.expires,
      isValid: Date.now() <= tokenData.expires
    };
  }

  // Cleanup on process exit
  destroy() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
  }
}

// Export singleton instance
const csrfProtection = new CSRFProtection();

// Cleanup on process exit
process.on('exit', () => csrfProtection.destroy());
process.on('SIGINT', () => {
  csrfProtection.destroy();
  process.exit();
});
process.on('SIGTERM', () => {
  csrfProtection.destroy();
  process.exit();
});

module.exports = csrfProtection;
