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
        // Check for token in URL (from OAuth callback)
        const urlParams = new URLSearchParams(window.location.search);
        const token = urlParams.get('token');
        const provider = urlParams.get('provider') || 'github';
        const error = urlParams.get('error');

        if (error) {
            console.error('OAuth error:', error);
            alert(`Login failed: ${error}`);
            // Clean URL
            window.history.replaceState({}, document.title, window.location.pathname);
            this.onUserChange(); // Update UI to show logged out state
            return;
        }

        if (token) {
            this.handleAuthCallback(token, provider);
            // Clean URL
            window.history.replaceState({}, document.title, window.location.pathname);
        } else {
            // Check for existing session
            this.loadUserSession();
            // Update UI even if no session
            this.onUserChange();
        }
    }

    async handleAuthCallback(token, provider) {
        try {
            const apiUrl = provider === 'google' ? this.googleAuthApiUrl : this.authApiUrl;
            const response = await fetch(`${apiUrl}?action=verify`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token })
            });

            const data = await response.json();
            if (data.authenticated && data.user) {
                this.currentUser = {
                    ...data.user,
                    provider: provider,
                    token: token,
                    // Normalize avatar/picture field
                    avatar: data.user.avatar || data.user.picture,
                    picture: data.user.picture || data.user.avatar
                };
                this.saveUserSession();
                this.onUserChange();
                console.log('Authentication successful:', this.currentUser);
                return true;
            } else {
                console.error('Authentication failed:', data.error || 'Unknown error');
                alert('Authentication failed. Please try again.');
            }
        } catch (error) {
            console.error('Auth verification failed:', error);
            alert('Network error during authentication. Please try again.');
        }
        this.onUserChange(); // Update UI even on failure
        return false;
    }

    loadUserSession() {
        const stored = localStorage.getItem('user_session');
        if (stored) {
            try {
                const session = JSON.parse(stored);
                // Check if session is still valid (24 hours)
                if (session.exp && session.exp > Date.now()) {
                    this.currentUser = session.user;
                    return true;
                } else {
                    // Session expired
                    localStorage.removeItem('user_session');
                    this.currentUser = null;
                }
            } catch (e) {
                console.error('Failed to load user session:', e);
                this.currentUser = null;
            }
        } else {
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
        }
    }

    loginWithGitHub() {
        const redirectTo = encodeURIComponent(window.location.href);
        window.location.href = `${this.authApiUrl}?action=login&redirect_to=${redirectTo}`;
    }

    loginWithGoogle() {
        const redirectTo = encodeURIComponent(window.location.href);
        window.location.href = `${this.googleAuthApiUrl}?action=login&redirect_to=${redirectTo}`;
    }

    logout() {
        this.currentUser = null;
        localStorage.removeItem('user_session');
        localStorage.removeItem('user_preferences');
        this.onUserChange();
        // Reload to clear any user-specific state
        window.location.reload();
    }

    isAuthenticated() {
        return this.currentUser !== null;
    }

    getUser() {
        return this.currentUser;
    }

    onUserChange() {
        // Dispatch custom event for other components to listen
        window.dispatchEvent(new CustomEvent('userAuthChange', {
            detail: { user: this.currentUser, authenticated: this.isAuthenticated() }
        }));
    }

    // User Preferences Management
    getPreferences() {
        const prefs = localStorage.getItem('user_preferences');
        return prefs ? JSON.parse(prefs) : {
            theme: 'dark', // default
            bookmarks: []
        };
    }

    savePreferences(preferences) {
        localStorage.setItem('user_preferences', JSON.stringify(preferences));
        window.dispatchEvent(new CustomEvent('preferencesChange', { detail: preferences }));
    }

    updateTheme(theme) {
        const prefs = this.getPreferences();
        prefs.theme = theme;
        this.savePreferences(prefs);
        document.documentElement.setAttribute('data-theme', theme);
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

// Initialize global instance when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.userAuth = new UserAuth();
        // Dispatch event that user-auth is ready
        window.dispatchEvent(new CustomEvent('userAuthReady'));
    });
} else {
    window.userAuth = new UserAuth();
    // Dispatch event that user-auth is ready
    window.dispatchEvent(new CustomEvent('userAuthReady'));
}

