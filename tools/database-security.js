#!/usr/bin/env node

// Database Security for Android Internals Website
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

class DatabaseSecurity {
  constructor() {
    this.encryptionKey = this.getOrCreateEncryptionKey();
  }

  getOrCreateEncryptionKey() {
    const keyFile = path.join(__dirname, '..', 'data', '.encryption.key');
    
    if (fs.existsSync(keyFile)) {
      return fs.readFileSync(keyFile);
    }
    
    // Generate new key
    const key = crypto.randomBytes(32);
    fs.writeFileSync(keyFile, key);
    fs.chmodSync(keyFile, 0o600); // Read/write for owner only
    return key;
  }

  // Hash password with salt
  static hashPassword(password) {
    const salt = crypto.randomBytes(32).toString('hex');
    const hash = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
    return { salt, hash };
  }

  // Verify password
  static verifyPassword(password, salt, hash) {
    const testHash = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
    return testHash === hash;
  }

  // Generate secure token
  static generateSecureToken() {
    return crypto.randomBytes(32).toString('hex');
  }

  // Encrypt sensitive data
  encryptData(data) {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipher('aes-256-cbc', this.encryptionKey);
    let encrypted = cipher.update(JSON.stringify(data), 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return {
      iv: iv.toString('hex'),
      data: encrypted
    };
  }

  // Decrypt sensitive data
  decryptData(encryptedData) {
    const decipher = crypto.createDecipher('aes-256-cbc', this.encryptionKey);
    let decrypted = decipher.update(encryptedData.data, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return JSON.parse(decrypted);
  }

  // Sanitize query to prevent SQL injection
  static sanitizeQuery(query) {
    if (typeof query !== 'string') return '';
    
    return query
      .replace(/--/g, '') // Remove SQL comments
      .replace(/;/g, '') // Remove semicolons
      .replace(/union/gi, '') // Remove UNION
      .replace(/select/gi, '') // Remove SELECT
      .replace(/insert/gi, '') // Remove INSERT
      .replace(/update/gi, '') // Remove UPDATE
      .replace(/delete/gi, '') // Remove DELETE
      .replace(/drop/gi, '') // Remove DROP
      .replace(/create/gi, '') // Remove CREATE
      .replace(/alter/gi, '') // Remove ALTER
      .replace(/exec/gi, '') // Remove EXEC
      .replace(/execute/gi, '') // Remove EXECUTE
      .replace(/sp_/gi, '') // Remove stored procedures
      .replace(/xp_/gi, '') // Remove extended procedures
      .trim();
  }

  // Validate database connection string
  static validateConnectionString(connectionString) {
    if (!connectionString || typeof connectionString !== 'string') {
      return { valid: false, error: 'Connection string is required' };
    }
    
    // Check for suspicious patterns
    const suspiciousPatterns = [
      /javascript:/i,
      /data:/i,
      /file:/i,
      /<script/i,
      /union/i,
      /select/i,
      /insert/i,
      /update/i,
      /delete/i,
      /drop/i
    ];
    
    for (const pattern of suspiciousPatterns) {
      if (pattern.test(connectionString)) {
        return { valid: false, error: 'Connection string contains invalid content' };
      }
    }
    
    return { valid: true };
  }

  // Generate secure filename
  static generateSecureFilename(originalName) {
    const timestamp = Date.now();
    const random = crypto.randomBytes(8).toString('hex');
    const extension = path.extname(originalName);
    return `${timestamp}_${random}${extension}`;
  }

  // Validate file upload
  static validateFileUpload(file) {
    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'application/pdf',
      'text/plain',
      'application/json'
    ];
    
    const maxSize = 10 * 1024 * 1024; // 10MB
    
    if (!file) {
      return { valid: false, error: 'File is required' };
    }
    
    if (!allowedTypes.includes(file.mimetype)) {
      return { valid: false, error: 'File type not allowed' };
    }
    
    if (file.size > maxSize) {
      return { valid: false, error: 'File too large (max 10MB)' };
    }
    
    // Check for suspicious content
    if (file.buffer) {
      const content = file.buffer.toString('utf8');
      const suspiciousPatterns = [
        /<script/i,
        /javascript:/i,
        /vbscript:/i,
        /onload/i,
        /onerror/i,
        /eval\(/i,
        /expression\(/i
      ];
      
      for (const pattern of suspiciousPatterns) {
        if (pattern.test(content)) {
          return { valid: false, error: 'File contains suspicious content' };
        }
      }
    }
    
    return { valid: true };
  }

  // Create secure backup
  createSecureBackup(data, backupPath) {
    const encryptedData = this.encryptData(data);
    const backup = {
      timestamp: new Date().toISOString(),
      version: '1.0',
      data: encryptedData
    };
    
    fs.writeFileSync(backupPath, JSON.stringify(backup, null, 2));
    fs.chmodSync(backupPath, 0o600); // Read/write for owner only
  }

  // Restore from secure backup
  restoreFromBackup(backupPath) {
    if (!fs.existsSync(backupPath)) {
      throw new Error('Backup file not found');
    }
    
    const backup = JSON.parse(fs.readFileSync(backupPath, 'utf8'));
    return this.decryptData(backup.data);
  }

  // Generate audit log entry
  static generateAuditLog(action, user, details = {}) {
    return {
      timestamp: new Date().toISOString(),
      action,
      user,
      details,
      sessionId: crypto.randomBytes(16).toString('hex')
    };
  }

  // Validate data integrity
  static validateDataIntegrity(data, checksum) {
    const calculatedChecksum = crypto
      .createHash('sha256')
      .update(JSON.stringify(data))
      .digest('hex');
    
    return calculatedChecksum === checksum;
  }

  // Generate data checksum
  static generateDataChecksum(data) {
    return crypto
      .createHash('sha256')
      .update(JSON.stringify(data))
      .digest('hex');
  }
}

module.exports = DatabaseSecurity;
