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

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONFIG;
} else if (typeof window !== 'undefined') {
    window.CONFIG = CONFIG;
}
