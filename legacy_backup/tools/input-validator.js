#!/usr/bin/env node

// Enhanced Input Validation for Android Internals Website
const validator = require('validator');

class InputValidator {
  // Validate email with comprehensive checks
  static validateEmail(email) {
    if (!email || typeof email !== 'string') {
      return { valid: false, error: 'Email is required' };
    }
    
    // Trim whitespace
    email = email.trim();
    
    if (email.length === 0) {
      return { valid: false, error: 'Email is required' };
    }
    
    if (email.length > 254) {
      return { valid: false, error: 'Email too long (max 254 characters)' };
    }
    
    if (!validator.isEmail(email)) {
      return { valid: false, error: 'Invalid email format' };
    }
    
    // Check for suspicious patterns
    const suspiciousPatterns = [
      /<script/i,
      /javascript:/i,
      /on\w+\s*=/i,
      /data:/i,
      /vbscript:/i,
      /expression\s*\(/i
    ];
    
    for (const pattern of suspiciousPatterns) {
      if (pattern.test(email)) {
        return { valid: false, error: 'Email contains invalid content' };
      }
    }
    
    // Check for common test domains
    const testDomains = ['example.com', 'test.com', 'sample.com', 'demo.com', 'localhost'];
    const domain = email.split('@')[1]?.toLowerCase();
    if (testDomains.includes(domain)) {
      return { valid: false, error: 'Please use a real email address, not a test domain' };
    }
    
    return { valid: true, sanitized: email };
  }

  // Validate name with comprehensive checks
  static validateName(name) {
    if (!name || typeof name !== 'string') {
      return { valid: false, error: 'Name is required' };
    }
    
    // Trim whitespace
    name = name.trim();
    
    if (name.length === 0) {
      return { valid: false, error: 'Name is required' };
    }
    
    if (name.length > 100) {
      return { valid: false, error: 'Name too long (max 100 characters)' };
    }
    
    if (name.length < 2) {
      return { valid: false, error: 'Name too short (min 2 characters)' };
    }
    
    // Only allow letters, spaces, hyphens, apostrophes, and periods
    if (!/^[a-zA-Z\s\-'\.]+$/.test(name)) {
      return { valid: false, error: 'Name contains invalid characters' };
    }
    
    // Check for suspicious patterns
    const suspiciousPatterns = [
      /<script/i,
      /javascript:/i,
      /on\w+\s*=/i,
      /data:/i,
      /vbscript:/i,
      /expression\s*\(/i
    ];
    
    for (const pattern of suspiciousPatterns) {
      if (pattern.test(name)) {
        return { valid: false, error: 'Name contains invalid content' };
      }
    }
    
    return { valid: true, sanitized: name };
  }

  // Validate message/content
  static validateMessage(message) {
    if (!message || typeof message !== 'string') {
      return { valid: false, error: 'Message is required' };
    }
    
    // Trim whitespace
    message = message.trim();
    
    if (message.length === 0) {
      return { valid: false, error: 'Message is required' };
    }
    
    if (message.length > 2000) {
      return { valid: false, error: 'Message too long (max 2000 characters)' };
    }
    
    if (message.length < 10) {
      return { valid: false, error: 'Message too short (min 10 characters)' };
    }
    
    // Check for suspicious patterns
    const suspiciousPatterns = [
      /<script/i,
      /javascript:/i,
      /on\w+\s*=/i,
      /data:/i,
      /vbscript:/i,
      /expression\s*\(/i,
      /<iframe/i,
      /<object/i,
      /<embed/i
    ];
    
    for (const pattern of suspiciousPatterns) {
      if (pattern.test(message)) {
        return { valid: false, error: 'Message contains invalid content' };
      }
    }
    
    return { valid: true, sanitized: this.sanitizeInput(message) };
  }

  // Sanitize input to prevent XSS
  static sanitizeInput(input) {
    if (typeof input !== 'string') return '';
    
    return input
      .replace(/[<>]/g, '') // Remove angle brackets
      .replace(/javascript:/gi, '') // Remove javascript: protocol
      .replace(/on\w+\s*=/gi, '') // Remove event handlers
      .replace(/data:/gi, '') // Remove data: protocol
      .replace(/vbscript:/gi, '') // Remove vbscript: protocol
      .replace(/expression\s*\(/gi, '') // Remove CSS expressions
      .trim()
      .substring(0, 2000); // Limit length
  }

  // Validate URL
  static validateUrl(url) {
    if (!url || typeof url !== 'string') {
      return { valid: false, error: 'URL is required' };
    }
    
    url = url.trim();
    
    if (url.length === 0) {
      return { valid: false, error: 'URL is required' };
    }
    
    if (!validator.isURL(url, { 
      protocols: ['http', 'https'],
      require_protocol: true,
      require_valid_protocol: true
    })) {
      return { valid: false, error: 'Invalid URL format' };
    }
    
    // Check for suspicious protocols
    const suspiciousProtocols = ['javascript:', 'data:', 'vbscript:', 'file:'];
    const lowerUrl = url.toLowerCase();
    for (const protocol of suspiciousProtocols) {
      if (lowerUrl.startsWith(protocol)) {
        return { valid: false, error: 'URL contains invalid protocol' };
      }
    }
    
    return { valid: true, sanitized: url };
  }

  // Validate phone number
  static validatePhone(phone) {
    if (!phone || typeof phone !== 'string') {
      return { valid: false, error: 'Phone number is required' };
    }
    
    phone = phone.trim();
    
    if (phone.length === 0) {
      return { valid: false, error: 'Phone number is required' };
    }
    
    // Remove all non-digit characters for validation
    const digitsOnly = phone.replace(/\D/g, '');
    
    if (digitsOnly.length < 10) {
      return { valid: false, error: 'Phone number too short' };
    }
    
    if (digitsOnly.length > 15) {
      return { valid: false, error: 'Phone number too long' };
    }
    
    return { valid: true, sanitized: phone };
  }

  // Validate username
  static validateUsername(username) {
    if (!username || typeof username !== 'string') {
      return { valid: false, error: 'Username is required' };
    }
    
    username = username.trim();
    
    if (username.length === 0) {
      return { valid: false, error: 'Username is required' };
    }
    
    if (username.length < 3) {
      return { valid: false, error: 'Username too short (min 3 characters)' };
    }
    
    if (username.length > 30) {
      return { valid: false, error: 'Username too long (max 30 characters)' };
    }
    
    // Only allow alphanumeric characters, underscores, and hyphens
    if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
      return { valid: false, error: 'Username contains invalid characters' };
    }
    
    return { valid: true, sanitized: username };
  }

  // Validate password
  static validatePassword(password) {
    if (!password || typeof password !== 'string') {
      return { valid: false, error: 'Password is required' };
    }
    
    if (password.length < 8) {
      return { valid: false, error: 'Password too short (min 8 characters)' };
    }
    
    if (password.length > 128) {
      return { valid: false, error: 'Password too long (max 128 characters)' };
    }
    
    // Check for at least one uppercase, lowercase, and number
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    
    if (!hasUpperCase || !hasLowerCase || !hasNumbers) {
      return { valid: false, error: 'Password must contain at least one uppercase letter, one lowercase letter, and one number' };
    }
    
    return { valid: true };
  }
}

module.exports = InputValidator;
