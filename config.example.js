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
  logLevel: 'error' // 'debug', 'info', 'warn', 'error'
};

// Initialize EmailJS
(function() {
  emailjs.init(window.EMAILJS_CONFIG.publicKey);
})();
