# Option 1: Hybrid Setup - GitHub Pages + Vercel APIs

## Overview

This setup keeps your static site on GitHub Pages (`hemangpandhi.com`) and uses Vercel only for serverless functions (APIs).

## Architecture

```
┌─────────────────────┐
│   GitHub Pages      │  ← Static site (hemangpandhi.com)
│  hemangpandhi.com  │     - HTML, CSS, JS
│                     │     - No DNS changes needed
└──────────┬──────────┘
           │
           │ API calls (fetch)
           │
┌──────────▼──────────┐
│      Vercel         │  ← Serverless functions only
│  android-internals  │     - /api/auth-github
│     .vercel.app     │     - /api/emailjs-contacts
│                     │     - /api/subscribers-db
└─────────────────────┘
```

## Setup Steps

### Step 1: Get Your Vercel Project URL

1. Go to: https://vercel.com/androidinternals-projects/android-internals
2. Find your deployment URL (e.g., `android-internals.vercel.app`)
3. Copy this URL

### Step 2: Update config.js

Update `config.js` with your Vercel URLs:

```javascript
window.EMAILJS_CONFIG = {
  // ... existing config ...
  
  // Vercel API Endpoints
  authApiUrl: 'https://android-internals.vercel.app/api/auth-github',
  apiProxyUrl: 'https://android-internals.vercel.app/api/emailjs-contacts',
  subscribersApiUrl: 'https://android-internals.vercel.app/api/subscribers-db',
};
```

### Step 3: Set Environment Variables in Vercel

Even though you're not using the custom domain, you still need to set environment variables:

1. Go to: https://vercel.com/androidinternals-projects/android-internals/settings/environment-variables

2. Add:
   ```
   GITHUB_CLIENT_ID=your_github_client_id
   GITHUB_CLIENT_SECRET=your_github_client_secret
   ALLOWED_GITHUB_USERS=hemangpandhi
   EMAILJS_PRIVATE_KEY=your_private_key
   EMAILJS_USER_ID=ZV2P-4FW2xmtKUGWl
   ```

3. Set for: Production, Preview, Development

### Step 4: Update GitHub OAuth App Callback URL

1. Go to: https://github.com/settings/developers
2. Edit your OAuth App
3. Update **Callback URL** to:
   ```
   https://android-internals.vercel.app/api/auth-github?action=callback
   ```
4. Save

### Step 5: Test the Setup

1. **Test Admin Panel:**
   - Visit: `https://www.hemangpandhi.com/newsletter-admin.html`
   - Click "Sign in with GitHub"
   - Should redirect to GitHub, then back to Vercel, then back to your site

2. **Test EmailJS API:**
   - In admin panel, click "⚡ Live Sync"
   - Should fetch subscribers from EmailJS via Vercel proxy

## How It Works

### GitHub SSO Flow:

1. User visits: `https://www.hemangpandhi.com/newsletter-admin.html`
2. Clicks "Sign in with GitHub"
3. Redirects to: `https://android-internals.vercel.app/api/auth-github?action=login`
4. Vercel redirects to GitHub OAuth
5. User authorizes on GitHub
6. GitHub redirects to: `https://android-internals.vercel.app/api/auth-github?action=callback`
7. Vercel creates session token
8. Redirects back to: `https://www.hemangpandhi.com/newsletter-admin.html?token=...`
9. Admin panel verifies token with Vercel API
10. Shows admin interface

### EmailJS API Flow:

1. Admin panel calls: `https://android-internals.vercel.app/api/emailjs-contacts`
2. Vercel function proxies request to EmailJS API
3. Returns subscribers to admin panel
4. Admin panel displays subscribers

## CORS Configuration

Vercel functions already have CORS headers configured:
- `Access-Control-Allow-Origin: *`
- Allows requests from `hemangpandhi.com`

## Benefits

✅ **No DNS Changes**: Keep `hemangpandhi.com` pointing to GitHub Pages  
✅ **Serverless Functions**: Use Vercel for APIs only  
✅ **Free**: Both services are free  
✅ **Easy Rollback**: Can switch to full Vercel later  

## Limitations

⚠️ **Cross-Domain**: API calls go to different domain (Vercel)  
⚠️ **CORS**: Must ensure CORS is properly configured  
⚠️ **Two Services**: Need to manage both GitHub Pages and Vercel  

## Troubleshooting

### "CORS Error"

- Check Vercel functions have CORS headers
- Verify `Access-Control-Allow-Origin: *` is set

### "API Not Found"

- Check Vercel project URL is correct
- Verify functions are deployed
- Check Vercel deployment logs

### "GitHub OAuth Not Working"

- Verify callback URL in GitHub OAuth app matches Vercel URL
- Check environment variables are set in Vercel
- Verify `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET` are correct

## Next Steps

1. ✅ Update `config.js` with Vercel URLs
2. ✅ Set environment variables in Vercel
3. ✅ Update GitHub OAuth callback URL
4. ✅ Test admin panel
5. ✅ Test API endpoints

Your hybrid setup is ready! 🚀

