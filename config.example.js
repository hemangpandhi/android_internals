// Configuration Template for Android Internals Website
// Copy this file to config.js and fill in your actual values

window.EMAILJS_CONFIG = {
  // EmailJS Configuration
  publicKey: 'YOUR_EMAILJS_PUBLIC_KEY_HERE',
  serviceId: 'YOUR_EMAILJS_SERVICE_ID_HERE',
  // Template for sending newsletters/articles to subscribers (Owner → Subscribers)
  newsletterTemplate: 'YOUR_NEWSLETTER_TEMPLATE_ID_HERE',
  // Template for contact form messages (User → Owner)
  contactTemplate: 'YOUR_CONTACT_TEMPLATE_ID_HERE',
  
  // Site Configuration
  siteDomain: 'https://www.hemangpandhi.com',
  newsletterFromEmail: 'noreply@hemangpandhi.com',
  newsletterFromName: 'Android Internals Newsletter',
  apiServer: 'https://your-api-server.com',
  
  // Vercel API Endpoints (for Option 1: Hybrid Setup)
  // Update these with your actual Vercel project URL
  // Find it at: https://vercel.com/androidinternals-projects/android-internals
  // Example: 'https://android-internals.vercel.app/api/auth-github'
  authApiUrl: 'https://YOUR_VERCEL_PROJECT.vercel.app/api/auth-github',
  apiProxyUrl: 'https://YOUR_VERCEL_PROJECT.vercel.app/api/emailjs-contacts',
  subscribersApiUrl: 'https://YOUR_VERCEL_PROJECT.vercel.app/api/subscribers-db',
  
  // Feature Flags
  enableNewsletter: true,
  enableContactForm: true,
  enableAnalytics: false,
  
  // Emulator Streaming Configuration
  emulatorStreaming: {
    targetFps: 60,
    maxWidth: 1080,
    maxHeight: 1920,
    quality: 0.8,
    compression: true
  },
  
  // Development Settings
  debugMode: false,
  logLevel: 'error', // 'debug', 'info', 'warn', 'error'
  
  // Admin Panel Security
  // ⚠️ IMPORTANT: Set a strong password for the admin panel
  // For production, use URL parameter: ?pwd=your_secure_password
  // This prevents the password from being in the code
  adminPassword: 'YOUR_SECURE_ADMIN_PASSWORD_HERE'
};

// Initialize EmailJS
(function() {
  emailjs.init(window.EMAILJS_CONFIG.publicKey);
})();
