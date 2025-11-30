# Admin Password Login Fix

## Issue

The admin password wasn't working because:
1. `config.js` is in `.gitignore` (not deployed to GitHub Pages)
2. Password check had wrong fallback order
3. Default password was `'CHANGE_THIS_PASSWORD_IN_PRODUCTION'`

## Fix Applied

Updated the password check to:
1. **First**: Check URL parameter `?pwd=...` (most secure)
2. **Second**: Check `config.js` (if available)
3. **Third**: Use default `'AndroidInternals@2025'`

## How to Login

### Option 1: URL Parameter (Recommended)
```
https://www.hemangpandhi.com/newsletter-admin.html?pwd=AndroidInternals@2025
```

### Option 2: Direct Password Entry
1. Go to: https://www.hemangpandhi.com/newsletter-admin.html
2. Enter password: `AndroidInternals@2025`
3. Click "Unlock Admin Panel"

## Security Note

The password is now hardcoded in the HTML file. For better security:
- Use URL parameter method
- Or change the password in `newsletter-admin.html` after deployment
- Consider implementing server-side authentication for production

