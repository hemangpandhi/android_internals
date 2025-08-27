// Configuration Template for Android Internals Website
// Copy this file to config.js and fill in your actual values

window.EMAILJS_CONFIG = {
  // EmailJS Configuration
  publicKey: 'YOUR_EMAILJS_PUBLIC_KEY_HERE',
  serviceId: 'YOUR_EMAILJS_SERVICE_ID_HERE',
  newsletterTemplate: 'YOUR_NEWSLETTER_TEMPLATE_ID_HERE',
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
  
  // Development Settings
  debugMode: false,
  logLevel: 'error' // 'debug', 'info', 'warn', 'error'
};

// Initialize EmailJS
(function() {
  emailjs.init(window.EMAILJS_CONFIG.publicKey);
})();
