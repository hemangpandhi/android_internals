// Configuration file for Android Internals website
// This file contains site-wide configuration settings

const CONFIG = {
    // Site information
    siteName: "Android Internals",
    siteDescription: "Uncovering the Hidden Depths of Android",
    siteUrl: "https://www.hemangpandhi.com",
    
    // Performance settings
    enableServiceWorker: true,
    enablePWA: true,
    
    // Analytics (when ready)
    analytics: {
        enabled: false,
        trackingId: null
    },
    
    // Newsletter settings
    newsletter: {
        enabled: true,
        apiEndpoint: "/api/newsletter"
    },
    
    // Feature flags
    features: {
        emulatorControl: false, // Disabled for initial rollout
        discussions: true,
        books: true,
        articles: true
    }
};

// EmailJS Configuration
// IMPORTANT: Replace these placeholder values with your actual EmailJS credentials
// Get your credentials from: https://dashboard.emailjs.com/admin
window.EMAILJS_CONFIG = {
    // EmailJS Configuration
    publicKey: 'LMsUX_rrpIYPFa76a',
    serviceId: 'service_dygzcoh',
    newsletterTemplate: 'template_uwh1kil', // Template for owner notification
    newsletterConfirmationTemplate: 'template_uwh1kil', // Template for subscriber confirmation (update this with actual template ID)
    contactTemplate: 'template_7bzhk1x',
    
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

// Initialize EmailJS if publicKey is provided
if (typeof window !== 'undefined' && window.EMAILJS_CONFIG && window.EMAILJS_CONFIG.publicKey && window.EMAILJS_CONFIG.publicKey !== 'YOUR_EMAILJS_PUBLIC_KEY_HERE') {
    if (typeof emailjs !== 'undefined') {
        emailjs.init(window.EMAILJS_CONFIG.publicKey);
    }
}

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONFIG;
} else if (typeof window !== 'undefined') {
    window.CONFIG = CONFIG;
}
