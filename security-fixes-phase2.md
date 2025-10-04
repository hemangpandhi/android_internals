# 🔒 ENHANCED SECURITY FIXES - PHASE 2

## 1. Implement Advanced Rate Limiting

### Create `tools/advanced-rate-limiter.js`:
```javascript
const rateLimit = require('express-rate-limit');

// Newsletter subscription rate limiting
const newsletterLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // 5 subscriptions per hour per IP
  message: 'Too many newsletter subscriptions. Please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Admin login rate limiting
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 login attempts per 15 minutes
  message: 'Too many login attempts. Please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Contact form rate limiting
const contactLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // 3 contact form submissions per hour
  message: 'Too many contact form submissions. Please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = {
  newsletterLimiter,
  loginLimiter,
  contactLimiter
};
```

## 2. Add CSRF Protection

### Create `tools/csrf-protection.js`:
```javascript
const crypto = require('crypto');

class CSRFProtection {
  constructor() {
    this.tokens = new Map();
  }

  generateToken() {
    const token = crypto.randomBytes(32).toString('hex');
    const expires = Date.now() + (60 * 60 * 1000); // 1 hour
    this.tokens.set(token, { expires });
    return token;
  }

  validateToken(token) {
    const tokenData = this.tokens.get(token);
    if (!tokenData) return false;
    
    if (Date.now() > tokenData.expires) {
      this.tokens.delete(token);
      return false;
    }
    
    return true;
  }

  cleanup() {
    const now = Date.now();
    for (const [token, data] of this.tokens.entries()) {
      if (now > data.expires) {
        this.tokens.delete(token);
      }
    }
  }
}

module.exports = new CSRFProtection();
```

## 3. Enhanced Input Validation

### Create `tools/input-validator.js`:
```javascript
const validator = require('validator');

class InputValidator {
  static validateEmail(email) {
    if (!email || typeof email !== 'string') {
      return { valid: false, error: 'Email is required' };
    }
    
    if (!validator.isEmail(email)) {
      return { valid: false, error: 'Invalid email format' };
    }
    
    if (email.length > 254) {
      return { valid: false, error: 'Email too long' };
    }
    
    // Check for suspicious patterns
    const suspiciousPatterns = [
      /<script/i,
      /javascript:/i,
      /on\w+\s*=/i,
      /data:/i
    ];
    
    for (const pattern of suspiciousPatterns) {
      if (pattern.test(email)) {
        return { valid: false, error: 'Invalid email content' };
      }
    }
    
    return { valid: true };
  }

  static validateName(name) {
    if (!name || typeof name !== 'string') {
      return { valid: false, error: 'Name is required' };
    }
    
    if (name.length > 100) {
      return { valid: false, error: 'Name too long' };
    }
    
    // Only allow letters, spaces, hyphens, and apostrophes
    if (!/^[a-zA-Z\s\-']+$/.test(name)) {
      return { valid: false, error: 'Name contains invalid characters' };
    }
    
    return { valid: true };
  }

  static sanitizeInput(input) {
    if (typeof input !== 'string') return '';
    
    return input
      .replace(/[<>]/g, '') // Remove angle brackets
      .replace(/javascript:/gi, '') // Remove javascript: protocol
      .replace(/on\w+\s*=/gi, '') // Remove event handlers
      .trim()
      .substring(0, 1000); // Limit length
  }
}

module.exports = InputValidator;
```

## 4. Security Headers Enhancement

### Update `tools/simple_server.py` with comprehensive headers:
```python
def end_headers(self):
    # Security headers
    self.send_header('X-Content-Type-Options', 'nosniff')
    self.send_header('X-Frame-Options', 'DENY')
    self.send_header('X-XSS-Protection', '1; mode=block')
    self.send_header('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload')
    self.send_header('Referrer-Policy', 'strict-origin-when-cross-origin')
    self.send_header('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')
    self.send_header('Cross-Origin-Embedder-Policy', 'require-corp')
    self.send_header('Cross-Origin-Opener-Policy', 'same-origin')
    self.send_header('Cross-Origin-Resource-Policy', 'same-origin')
    
    # Cache headers
    if self.path.endswith(('.css', '.js', '.png', '.jpg', '.jpeg', '.svg', '.ico')):
        self.send_header('Cache-Control', 'public, max-age=31536000, immutable')
    elif self.path.endswith(('.html', '.htm')):
        self.send_header('Cache-Control', 'public, max-age=3600')
    else:
        self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
        self.send_header('Pragma', 'no-cache')
        self.send_header('Expires', '0')
    
    super().end_headers()
```

## 5. Admin Panel Security Enhancement

### Update `tools/admin-server.js`:
```javascript
const { loginLimiter } = require('./advanced-rate-limiter');
const CSRFProtection = require('./csrf-protection');
const InputValidator = require('./input-validator');

// Add CSRF token endpoint
app.get('/api/csrf-token', (req, res) => {
  const token = CSRFProtection.generateToken();
  res.json({ csrfToken: token });
});

// Enhanced login with rate limiting and CSRF
app.post('/api/login', loginLimiter, (req, res) => {
  const { username, password, csrfToken } = req.body;
  
  // Validate CSRF token
  if (!CSRFProtection.validateToken(csrfToken)) {
    return res.status(403).json({ error: 'Invalid CSRF token' });
  }
  
  // Validate input
  const usernameValidation = InputValidator.validateName(username);
  if (!usernameValidation.valid) {
    return res.status(400).json({ error: usernameValidation.error });
  }
  
  // Rest of login logic...
});
```
