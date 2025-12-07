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
    publicKey: 'ZV2P-4FW2xmtKUGWl',
    serviceId: 'service_dygzcoh',
    // Template for sending newsletters/articles to subscribers (Owner → Subscribers)
    newsletterTemplate: 'template_uwh1kil',
    // Template for contact form messages (User → Owner)
    contactTemplate: 'template_7bzhk1x',
    
    // Site Configuration
    siteDomain: 'https://www.hemangpandhi.com',
    newsletterFromEmail: 'noreply@hemangpandhi.com',
    newsletterFromName: 'Android Internals Newsletter',
    apiServer: 'https://your-api-server.com',
    
    // Vercel API Endpoints (for serverless functions)
    // Update these with your actual Vercel project URL
    // Find it at: https://vercel.com/androidinternals-projects/android-internals
    // Your Vercel URL should be: https://android-internals-8y1hk08hw-androidinternals-projects.vercel.app
    // Or the production URL: https://android-internals.vercel.app (check Vercel dashboard)
    authApiUrl: 'https://android-internals-8y1hk08hw-androidinternals-projects.vercel.app/api/auth-github',
    apiProxyUrl: 'https://android-internals-8y1hk08hw-androidinternals-projects.vercel.app/api/emailjs-contacts',
    subscribersApiUrl: 'https://android-internals-8y1hk08hw-androidinternals-projects.vercel.app/api/subscribers-db',
    
    // Feature Flags
    enableNewsletter: true,
    enableContactForm: true,
    enableAnalytics: false,
    
    // Development Settings
    debugMode: false,
    logLevel: 'error', // 'debug', 'info', 'warn', 'error'
    
    // Admin Panel Security
    // ⚠️ IMPORTANT: Change this password in production!
    // You can set it via URL parameter: ?pwd=your_password
    // Or set it in config.js (but remember it's in git - use URL parameter for security)
    adminPassword: 'AndroidInternals@2025'
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
