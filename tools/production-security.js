#!/usr/bin/env node

// Production Security for Android Internals Website
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

class ProductionSecurity {
  constructor() {
    this.securityConfig = this.getSecurityConfig();
  }

  getSecurityConfig() {
    return {
      csp: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net", "https://api.emailjs.com"],
          styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
          imgSrc: ["'self'", "data:", "https:", "blob:"],
          fontSrc: ["'self'", "https://fonts.gstatic.com"],
          connectSrc: ["'self'", "https://api.emailjs.com", "https://cdn.jsdelivr.net"],
          frameAncestors: ["'none'"],
          baseUri: ["'self'"],
          formAction: ["'self'"],
          objectSrc: ["'none'"],
          mediaSrc: ["'self'"],
          workerSrc: ["'self'", "blob:"],
          manifestSrc: ["'self'"]
        }
      },
      hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true
      },
      rateLimits: {
        general: {
          windowMs: 15 * 60 * 1000, // 15 minutes
          max: 100, // 100 requests per window
          message: 'Too many requests from this IP, please try again later.'
        },
        login: {
          windowMs: 15 * 60 * 1000, // 15 minutes
          max: 5, // 5 login attempts per window
          message: 'Too many login attempts, please try again later.'
        },
        newsletter: {
          windowMs: 60 * 60 * 1000, // 1 hour
          max: 5, // 5 newsletter subscriptions per hour
          message: 'Too many newsletter subscriptions, please try again later.'
        },
        contact: {
          windowMs: 60 * 60 * 1000, // 1 hour
          max: 3, // 3 contact form submissions per hour
          message: 'Too many contact form submissions, please try again later.'
        }
      }
    };
  }

  // Setup Helmet security middleware
  setupHelmet(app) {
    app.use(helmet({
      contentSecurityPolicy: this.securityConfig.csp,
      hsts: this.securityConfig.hsts,
      noSniff: true,
      xssFilter: true,
      referrerPolicy: { policy: "strict-origin-when-cross-origin" },
      frameguard: { action: 'deny' },
      hidePoweredBy: true,
      ieNoOpen: true,
      noCache: false // Allow caching for performance
    }));
  }

  // Setup rate limiting
  setupRateLimiting(app) {
    // General rate limiting
    const generalLimiter = rateLimit({
      ...this.securityConfig.rateLimits.general,
      standardHeaders: true,
      legacyHeaders: false,
      handler: (req, res) => {
        res.status(429).json({
          error: this.securityConfig.rateLimits.general.message,
          retryAfter: Math.ceil(this.securityConfig.rateLimits.general.windowMs / 1000)
        });
      }
    });

    // Login rate limiting
    const loginLimiter = rateLimit({
      ...this.securityConfig.rateLimits.login,
      standardHeaders: true,
      legacyHeaders: false,
      handler: (req, res) => {
        res.status(429).json({
          error: this.securityConfig.rateLimits.login.message,
          retryAfter: Math.ceil(this.securityConfig.rateLimits.login.windowMs / 1000)
        });
      }
    });

    // Newsletter rate limiting
    const newsletterLimiter = rateLimit({
      ...this.securityConfig.rateLimits.newsletter,
      standardHeaders: true,
      legacyHeaders: false,
      handler: (req, res) => {
        res.status(429).json({
          error: this.securityConfig.rateLimits.newsletter.message,
          retryAfter: Math.ceil(this.securityConfig.rateLimits.newsletter.windowMs / 1000)
        });
      }
    });

    // Contact form rate limiting
    const contactLimiter = rateLimit({
      ...this.securityConfig.rateLimits.contact,
      standardHeaders: true,
      legacyHeaders: false,
      handler: (req, res) => {
        res.status(429).json({
          error: this.securityConfig.rateLimits.contact.message,
          retryAfter: Math.ceil(this.securityConfig.rateLimits.contact.windowMs / 1000)
        });
      }
    });

    // Apply rate limiters
    app.use(generalLimiter);
    app.use('/api/login', loginLimiter);
    app.use('/api/subscribe', newsletterLimiter);
    app.use('/api/contact', contactLimiter);
  }

  // Setup security headers
  setupSecurityHeaders(app) {
    app.use((req, res, next) => {
      // Security headers
      res.setHeader('X-Content-Type-Options', 'nosniff');
      res.setHeader('X-Frame-Options', 'DENY');
      res.setHeader('X-XSS-Protection', '1; mode=block');
      res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
      res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
      res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
      res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');
      res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
      res.setHeader('Cross-Origin-Resource-Policy', 'same-origin');
      
      // Cache headers
      if (req.path.match(/\.(css|js|png|jpg|jpeg|gif|ico|svg)$/)) {
        res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
      } else if (req.path.match(/\.(html|htm)$/)) {
        res.setHeader('Cache-Control', 'public, max-age=3600');
      } else {
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        res.setHeader('Pragma', 'no-cache');
        res.setHeader('Expires', '0');
      }
      
      next();
    });
  }

  // Setup CORS
  setupCORS(app) {
    const allowedOrigins = [
      'https://www.hemangpandhi.com',
      'https://hemangpandhi.com',
      'http://localhost:3000',
      'http://localhost:8080'
    ];

    app.use((req, res, next) => {
      const origin = req.headers.origin;
      
      if (allowedOrigins.includes(origin)) {
        res.setHeader('Access-Control-Allow-Origin', origin);
      }
      
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
      res.setHeader('Access-Control-Allow-Credentials', 'true');
      res.setHeader('Access-Control-Max-Age', '86400'); // 24 hours
      
      if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
      }
      
      next();
    });
  }

  // Setup request logging
  setupRequestLogging(app) {
    app.use((req, res, next) => {
      const start = Date.now();
      
      res.on('finish', () => {
        const duration = Date.now() - start;
        const logEntry = {
          timestamp: new Date().toISOString(),
          method: req.method,
          url: req.url,
          ip: req.ip || req.connection.remoteAddress,
          userAgent: req.get('User-Agent'),
          statusCode: res.statusCode,
          duration,
          contentLength: res.get('Content-Length') || 0
        };
        
        console.log(`Request: ${req.method} ${req.url} - ${res.statusCode} (${duration}ms)`);
      });
      
      next();
    });
  }

  // Setup error handling
  setupErrorHandling(app) {
    app.use((err, req, res, next) => {
      console.error('Error:', err);
      
      // Don't leak error details in production
      const isDevelopment = process.env.NODE_ENV === 'development';
      
      res.status(err.status || 500).json({
        error: isDevelopment ? err.message : 'Internal Server Error',
        ...(isDevelopment && { stack: err.stack })
      });
    });
  }

  // Setup all security measures
  setupAllSecurity(app) {
    this.setupHelmet(app);
    this.setupRateLimiting(app);
    this.setupSecurityHeaders(app);
    this.setupCORS(app);
    this.setupRequestLogging(app);
    this.setupErrorHandling(app);
  }

  // Generate security report
  generateSecurityReport() {
    return {
      timestamp: new Date().toISOString(),
      securityConfig: this.securityConfig,
      recommendations: [
        'Enable HTTPS in production',
        'Use strong passwords for admin accounts',
        'Regular security audits',
        'Monitor logs for suspicious activity',
        'Keep dependencies updated',
        'Use environment variables for secrets',
        'Implement proper backup strategies',
        'Monitor performance metrics'
      ]
    };
  }
}

module.exports = ProductionSecurity;
