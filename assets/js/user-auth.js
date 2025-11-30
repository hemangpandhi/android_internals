// User Authentication and Profile Management
// Supports GitHub and Google OAuth

class UserAuth {
    constructor() {
        this.currentUser = null;
        this.authApiUrl = window.EMAILJS_CONFIG?.authApiUrl || 'https://android-internals.vercel.app/api/auth-github';
        this.googleAuthApiUrl = window.EMAILJS_CONFIG?.googleAuthApiUrl || 'https://android-internals.vercel.app/api/auth-google';
        this.init();
    }

    init() {
        try {
            // Check for OAuth error in URL
            const urlParams = new URLSearchParams(window.location.search);
            const error = urlParams.get('error');

            if (error) {
                console.error('OAuth error:', error);
                alert(`Login failed: ${error}`);
                // Clean URL
                window.history.replaceState({}, document.title, window.location.pathname);
                this.onUserChange(); // Update UI to show logged out state
                return;
            }

            // Check for OAuth callback (cookies are set by server, no token in URL)
            // If we just came from OAuth, cookies should be set
            const isOAuthCallback = urlParams.has('code') || (document.referrer && (document.referrer.includes('github.com') || document.referrer.includes('google.com')));
            
            if (isOAuthCallback) {
                // Clean URL immediately (cookies are already set)
                window.history.replaceState({}, document.title, window.location.pathname);
            }

            // Check for existing session (cookies or localStorage fallback)
            console.log('🔐 [AUTH] Checking for existing session...');
            this.checkSession().catch(error => {
                console.error('🔐 [AUTH] Error in checkSession:', error);
                // Don't let this break the UI
                this.currentUser = null;
                this.onUserChange();
            });
        } catch (error) {
            console.error('🔐 [AUTH] Error in init:', error);
            // Don't let initialization errors break the UI
            this.currentUser = null;
            this.onUserChange();
        }
    }

    async checkSession() {
        // Try to verify session using cookies (httpOnly cookies sent automatically)
        try {
            const apiUrl = this.authApiUrl; // Use GitHub API for verification (works for both)
            if (!apiUrl) {
                console.warn('🔐 [AUTH] No auth API URL, using localStorage fallback');
                this.loadUserSession();
                this.onUserChange();
                return;
            }

            const response = await fetch(`${apiUrl}?action=verify`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include', // Include cookies
                body: JSON.stringify({}) // Empty body, token comes from cookie
            });

            if (response.ok) {
                const data = await response.json();
                if (data.authenticated && data.user) {
                    console.log('🔐 [AUTH] ✅ Session verified via cookies');
                    this.currentUser = {
                        ...data.user,
                        avatar: data.user.avatar || data.user.picture,
                        picture: data.user.picture || data.user.avatar
                    };
                    this.saveUserSession(); // Save to localStorage as backup
                    this.onUserChange();
                    return;
                }
            }
        } catch (error) {
            console.log('🔐 [AUTH] Cookie verification failed, trying localStorage fallback:', error.message || error);
            // Don't let errors break the UI - continue with fallback
        }

        // Fallback to localStorage (for backward compatibility during transition)
        try {
            this.loadUserSession();
            this.onUserChange();
        } catch (error) {
            console.error('🔐 [AUTH] Error loading session from localStorage:', error);
            // Even if this fails, don't break the UI
            this.currentUser = null;
        }
    }

    async refreshToken() {
        // Refresh access token using refresh token cookie
        try {
            const apiUrl = this.authApiUrl;
            const response = await fetch(`${apiUrl}?action=refresh`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include', // Include cookies
                body: JSON.stringify({})
            });

            if (response.ok) {
                const data = await response.json();
                if (data.authenticated) {
                    console.log('🔐 [AUTH] ✅ Token refreshed');
                    // Re-verify to get user data
                    await this.checkSession();
                    return true;
                }
            }
            return false;
        } catch (error) {
            console.error('🔐 [AUTH] ❌ Token refresh failed:', error);
            return false;
        }
    }

    loadUserSession() {
        const stored = localStorage.getItem('user_session');
        if (stored) {
            try {
                const session = JSON.parse(stored);
                console.log('Loading session:', session);
                // Check if session is still valid (24 hours)
                if (session.exp && session.exp > Date.now()) {
                    this.currentUser = session.user;
                    console.log('Session loaded, user:', this.currentUser);
                    this.onUserChange();
                    return true;
                } else {
                    // Session expired
                    console.log('Session expired, removing');
                    localStorage.removeItem('user_session');
                    this.currentUser = null;
                }
            } catch (e) {
                console.error('Failed to load user session:', e);
                this.currentUser = null;
            }
        } else {
            console.log('No stored session found');
            this.currentUser = null;
        }
        return this.currentUser !== null;
    }

    saveUserSession() {
        if (this.currentUser) {
            const session = {
                user: this.currentUser,
                exp: Date.now() + (24 * 60 * 60 * 1000) // 24 hours
            };
            localStorage.setItem('user_session', JSON.stringify(session));
            console.log('Session saved:', session);
        } else {
            console.log('No user to save in session');
        }
    }

    loginWithGitHub() {
        const redirectTo = encodeURIComponent(window.location.href);
        const authApiUrl = this.authApiUrl || window.EMAILJS_CONFIG?.authApiUrl || 'https://android-internals.vercel.app/api/auth-github';
        console.log('Redirecting to GitHub OAuth:', authApiUrl);
        window.location.href = `${authApiUrl}?action=login&redirect_to=${redirectTo}`;
    }

    loginWithGoogle() {
        const redirectTo = encodeURIComponent(window.location.href);
        const googleAuthApiUrl = this.googleAuthApiUrl || window.EMAILJS_CONFIG?.googleAuthApiUrl || 'https://android-internals.vercel.app/api/auth-google';
        console.log('Redirecting to Google OAuth:', googleAuthApiUrl);
        window.location.href = `${googleAuthApiUrl}?action=login&redirect_to=${redirectTo}`;
    }

    async logout() {
        if (!confirm('Are you sure you want to sign out?')) {
            return; // User cancelled
        }
        
        console.log('🔐 [AUTH] Logging out...');
        
        // Call logout endpoint to clear cookies
        try {
            const apiUrl = this.authApiUrl;
            const response = await fetch(`${apiUrl}?action=logout`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include' // Include cookies
            });
            
            if (!response.ok) {
                console.warn('🔐 [AUTH] Logout API returned non-OK status:', response.status);
            } else {
                console.log('🔐 [AUTH] ✅ Logout API call successful');
            }
        } catch (error) {
            console.error('🔐 [AUTH] ❌ Logout API call failed:', error);
            // Continue with logout even if API call fails
        }
        
        // Clear local storage
        this.currentUser = null;
        localStorage.removeItem('user_session');
        // Keep preferences (user might want them after re-login)
        // localStorage.removeItem('user_preferences');
        
        // Update UI immediately
        this.onUserChange();
        
        // Small delay to ensure UI updates, then reload
        setTimeout(() => {
            window.location.href = window.location.pathname;
        }, 100);
    }

    isAuthenticated() {
        return this.currentUser !== null;
    }

    getUser() {
        return this.currentUser;
    }

    onUserChange() {
        // Dispatch custom event for other components to listen
        console.log('🔄 [UI] onUserChange called');
        console.log('🔄 [UI] Authenticated:', this.isAuthenticated());
        console.log('🔄 [UI] Current user:', this.currentUser);
        console.log('🔄 [UI] User avatar:', this.currentUser?.avatar);
        console.log('🔄 [UI] User picture:', this.currentUser?.picture);
        
        window.dispatchEvent(new CustomEvent('userAuthChange', {
            detail: { user: this.currentUser, authenticated: this.isAuthenticated() }
        }));
        
        // Also try to manually trigger UI update if scripts.js is ready
        if (typeof window !== 'undefined') {
            // Force a re-check after a short delay
            setTimeout(() => {
                console.log('🔄 [UI] Manual UI update attempt (300ms delay)');
                const userMenuLoggedOut = document.getElementById('userMenuLoggedOut');
                const userMenuLoggedIn = document.getElementById('userMenuLoggedIn');
                const userAvatarImg = document.getElementById('userAvatarImg');
                const userAvatarInitial = document.getElementById('userAvatarInitial');
                const userName = document.getElementById('userName');
                const userEmail = document.getElementById('userEmail');
                
                console.log('🔄 [UI] DOM elements found:');
                console.log('  - userMenuLoggedOut:', !!userMenuLoggedOut);
                console.log('  - userMenuLoggedIn:', !!userMenuLoggedIn);
                console.log('  - userAvatarImg:', !!userAvatarImg);
                console.log('  - userAvatarInitial:', !!userAvatarInitial);
                console.log('  - userName:', !!userName);
                console.log('  - userEmail:', !!userEmail);
                
                if (window.userAuth && userMenuLoggedIn) {
                    const user = this.currentUser;
                    
                    if (this.isAuthenticated() && user) {
                        console.log('🔄 [UI] ✅ User is authenticated, updating UI');
                        console.log('🔄 [UI] User data:', user);
                        
                        if (userMenuLoggedOut) {
                            userMenuLoggedOut.style.display = 'none';
                            console.log('🔄 [UI] Hidden logged-out menu');
                        }
                        if (userMenuLoggedIn) {
                            userMenuLoggedIn.style.display = 'block';
                            console.log('🔄 [UI] Showing logged-in menu');
                        }
                        
                        const avatarUrl = user.picture || user.avatar;
                        console.log('🔄 [UI] Avatar URL:', avatarUrl);
                        
                        if (avatarUrl) {
                            if (userAvatarImg) {
                                console.log('🔄 [UI] Setting avatar image src to:', avatarUrl);
                                userAvatarImg.src = avatarUrl;
                                userAvatarImg.style.display = 'block';
                                userAvatarImg.onerror = function() {
                                    console.error('🔄 [UI] ❌ Avatar image failed to load:', avatarUrl);
                                };
                                userAvatarImg.onload = function() {
                                    console.log('🔄 [UI] ✅ Avatar image loaded successfully');
                                };
                            }
                            if (userAvatarInitial) {
                                userAvatarInitial.style.display = 'none';
                                console.log('🔄 [UI] Hidden avatar initial');
                            }
                        } else {
                            console.log('🔄 [UI] No avatar URL, showing initial');
                            if (userAvatarImg) userAvatarImg.style.display = 'none';
                            if (userAvatarInitial) {
                                userAvatarInitial.style.display = 'block';
                                const initial = (user.name || user.email || 'U').charAt(0).toUpperCase();
                                userAvatarInitial.textContent = initial;
                                console.log('🔄 [UI] Set avatar initial to:', initial);
                            }
                        }
                        
                        if (userName) {
                            userName.textContent = user.name || user.email || 'User';
                            console.log('🔄 [UI] Set user name to:', userName.textContent);
                        }
                        if (userEmail) {
                            userEmail.textContent = user.email || '';
                            console.log('🔄 [UI] Set user email to:', userEmail.textContent);
                        }
                    } else {
                        console.log('🔄 [UI] ❌ User is not authenticated');
                        if (userMenuLoggedOut) userMenuLoggedOut.style.display = 'block';
                        if (userMenuLoggedIn) userMenuLoggedIn.style.display = 'none';
                    }
                } else {
                    console.log('🔄 [UI] ⚠️ DOM elements not ready yet');
                }
            }, 300);
        }
    }

    // User Preferences Management
    getPreferences() {
        const prefs = localStorage.getItem('user_preferences');
        const defaultPrefs = {
            theme: 'dark', // default
            bookmarks: []
        };
        if (prefs) {
            try {
                const parsed = JSON.parse(prefs);
                // Ensure theme is valid
                if (!['dark', 'light', 'auto'].includes(parsed.theme)) {
                    parsed.theme = 'dark';
                }
                return { ...defaultPrefs, ...parsed };
            } catch (e) {
                console.error('Error parsing preferences:', e);
                return defaultPrefs;
            }
        }
        return defaultPrefs;
    }

    savePreferences(preferences) {
        localStorage.setItem('user_preferences', JSON.stringify(preferences));
        window.dispatchEvent(new CustomEvent('preferencesChange', { detail: preferences }));
    }

    updateTheme(theme) {
        console.log('🎨 [THEME] Updating theme to:', theme);
        const prefs = this.getPreferences();
        prefs.theme = theme;
        this.savePreferences(prefs);
        
        // Apply theme immediately
        if (theme === 'auto') {
            const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
            const actualTheme = prefersDark ? 'dark' : 'light';
            console.log('🎨 [THEME] Auto theme detected:', actualTheme);
            document.documentElement.setAttribute('data-theme', actualTheme);
        } else {
            console.log('🎨 [THEME] Setting theme to:', theme);
            document.documentElement.setAttribute('data-theme', theme);
        }
        
        // Dispatch event for other components
        window.dispatchEvent(new CustomEvent('themeChange', { 
            detail: { theme: theme, appliedTheme: theme === 'auto' ? (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light') : theme }
        }));
    }

    addBookmark(articleId, articleTitle, articleUrl) {
        const prefs = this.getPreferences();
        if (!prefs.bookmarks) prefs.bookmarks = [];
        
        // Check if already bookmarked
        if (prefs.bookmarks.find(b => b.id === articleId)) {
            return false; // Already bookmarked
        }

        prefs.bookmarks.push({
            id: articleId,
            title: articleTitle,
            url: articleUrl,
            date: new Date().toISOString()
        });
        this.savePreferences(prefs);
        return true;
    }

    removeBookmark(articleId) {
        const prefs = this.getPreferences();
        if (!prefs.bookmarks) return false;
        
        const index = prefs.bookmarks.findIndex(b => b.id === articleId);
        if (index > -1) {
            prefs.bookmarks.splice(index, 1);
            this.savePreferences(prefs);
            return true;
        }
        return false;
    }

    isBookmarked(articleId) {
        const prefs = this.getPreferences();
        return prefs.bookmarks ? prefs.bookmarks.some(b => b.id === articleId) : false;
    }

    getBookmarks() {
        const prefs = this.getPreferences();
        return prefs.bookmarks || [];
    }
}

// Global fallback functions for login buttons (work even if userAuth isn't ready)
window.loginWithGitHub = function() {
    if (window.userAuth && window.userAuth.loginWithGitHub) {
        window.userAuth.loginWithGitHub();
    } else {
        const redirectTo = encodeURIComponent(window.location.href);
        const authApiUrl = window.EMAILJS_CONFIG?.authApiUrl || 'https://android-internals.vercel.app/api/auth-github';
        console.log('Using fallback GitHub login:', authApiUrl);
        window.location.href = `${authApiUrl}?action=login&redirect_to=${redirectTo}`;
    }
};

window.loginWithGoogle = function() {
    if (window.userAuth && window.userAuth.loginWithGoogle) {
        window.userAuth.loginWithGoogle();
    } else {
        const redirectTo = encodeURIComponent(window.location.href);
        const googleAuthApiUrl = window.EMAILJS_CONFIG?.googleAuthApiUrl || 'https://android-internals.vercel.app/api/auth-google';
        console.log('Using fallback Google login:', googleAuthApiUrl);
        window.location.href = `${googleAuthApiUrl}?action=login&redirect_to=${redirectTo}`;
    }
};

// Initialize global instance immediately (don't wait for DOMContentLoaded)
// This ensures token processing happens as soon as possible
(function() {
    window.userAuth = new UserAuth();
    // Dispatch event that user-auth is ready
    window.dispatchEvent(new CustomEvent('userAuthReady'));
    
    // Also trigger UI update after a short delay to ensure DOM is ready
    setTimeout(() => {
        if (window.userAuth && window.userAuth.isAuthenticated()) {
            window.userAuth.onUserChange();
        }
    }, 200);
})();

