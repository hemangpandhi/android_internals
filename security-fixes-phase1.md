# 🚨 CRITICAL SECURITY FIXES - PHASE 1

## 1. Add Content Security Policy (CSP)

### Update `index.html` and `docs/index.html`:
```html
<!-- Add this to <head> section -->
<meta http-equiv="Content-Security-Policy" content="
  default-src 'self';
  script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net;
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: https:;
  connect-src 'self' https://api.emailjs.com;
  frame-ancestors 'none';
  base-uri 'self';
  form-action 'self';
">
```

## 2. Add HSTS Headers

### Update `tools/simple_server.py`:
```python
def end_headers(self):
    # Add HSTS header
    self.send_header('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload')
    
    # Existing headers...
    self.send_header('X-Content-Type-Options', 'nosniff')
    self.send_header('X-Frame-Options', 'DENY')
    self.send_header('X-XSS-Protection', '1; mode=block')
    super().end_headers()
```

## 3. Add Subresource Integrity (SRI)

### Update EmailJS script tag:
```html
<script 
  src="https://cdn.jsdelivr.net/npm/@emailjs/browser@4/dist/email.min.js"
  integrity="sha384-[GET_ACTUAL_HASH]"
  crossorigin="anonymous">
</script>
```

## 4. Implement Rate Limiting

### Create `tools/rate-limiter.js`:
```javascript
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});

module.exports = limiter;
```

### Update `tools/admin-server.js`:
```javascript
const rateLimit = require('./rate-limiter');

// Add rate limiting to login endpoint
app.post('/api/login', rateLimit, (req, res) => {
  // existing login logic
});
```
