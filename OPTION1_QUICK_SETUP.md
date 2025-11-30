# Option 1 Quick Setup - GitHub Pages + Vercel APIs

## ✅ What You're Doing

- **GitHub Pages**: Hosts your static site at `hemangpandhi.com` (no changes)
- **Vercel**: Hosts serverless functions only (APIs)
- **No DNS changes needed!**

## 🚀 Quick Setup (5 minutes)

### Step 1: Get Your Vercel URL

1. Go to: https://vercel.com/androidinternals-projects/android-internals
2. Find your deployment URL (looks like: `android-internals.vercel.app`)
3. Copy it

### Step 2: Update config.js Locally

Edit `config.js` and add:

```javascript
window.EMAILJS_CONFIG = {
  // ... existing config ...
  
  // Vercel API Endpoints
  authApiUrl: 'https://android-internals.vercel.app/api/auth-github',
  apiProxyUrl: 'https://android-internals.vercel.app/api/emailjs-contacts',
  subscribersApiUrl: 'https://android-internals.vercel.app/api/subscribers-db',
};
```

**Replace `android-internals.vercel.app` with your actual Vercel URL!**

### Step 3: Set Environment Variables in Vercel

1. Go to: https://vercel.com/androidinternals-projects/android-internals/settings/environment-variables

2. Add these (click "Add" for each):
   ```
   GITHUB_CLIENT_ID=your_github_client_id
   GITHUB_CLIENT_SECRET=your_github_client_secret
   ALLOWED_GITHUB_USERS=hemangpandhi
   EMAILJS_PRIVATE_KEY=your_private_key
   EMAILJS_USER_ID=ZV2P-4FW2xmtKUGWl
   ```

3. Set for: **Production**, **Preview**, **Development**

4. Click **"Save"**

### Step 4: Update GitHub OAuth App

1. Go to: https://github.com/settings/developers
2. Click your OAuth App
3. Update **Authorization callback URL** to:
   ```
   https://android-internals.vercel.app/api/auth-github?action=callback
   ```
   (Replace with your actual Vercel URL)
4. Click **"Update application"**

### Step 5: Rebuild and Deploy

```bash
npm run build
git add .
git commit -m "Configure Vercel API URLs for hybrid setup"
git push origin master
```

GitHub Actions will deploy to GitHub Pages automatically.

## ✅ Test It

1. **Visit Admin Panel:**
   ```
   https://www.hemangpandhi.com/newsletter-admin.html
   ```

2. **Click "Sign in with GitHub"**
   - Should redirect to GitHub
   - After authorization, redirects back to your site

3. **Test EmailJS Sync:**
   - Click "⚡ Live Sync" in admin panel
   - Should fetch subscribers from EmailJS via Vercel

## 📋 Checklist

- [ ] Got Vercel project URL
- [ ] Updated `config.js` with Vercel URLs
- [ ] Set environment variables in Vercel dashboard
- [ ] Updated GitHub OAuth callback URL
- [ ] Rebuilt and deployed to GitHub Pages
- [ ] Tested admin panel login
- [ ] Tested EmailJS API sync

## 🎯 How It Works

```
Your Site (GitHub Pages)
    ↓
hemangpandhi.com/newsletter-admin.html
    ↓
Calls Vercel APIs:
    - /api/auth-github (GitHub SSO)
    - /api/emailjs-contacts (Subscriber sync)
    ↓
Vercel Functions
    ↓
Returns data to your site
```

## ⚠️ Important Notes

1. **CORS is configured**: Vercel functions allow requests from any origin
2. **No DNS changes**: `hemangpandhi.com` still points to GitHub Pages
3. **Two deployments**: 
   - GitHub Pages: Static site (automatic via GitHub Actions)
   - Vercel: Serverless functions (automatic on git push)

## 🐛 Troubleshooting

**"API not found"**
- Check Vercel URL is correct in `config.js`
- Verify functions are deployed in Vercel dashboard

**"CORS error"**
- Vercel functions already have CORS headers
- Check browser console for specific error

**"GitHub OAuth not working"**
- Verify callback URL in GitHub OAuth app matches Vercel URL
- Check environment variables are set in Vercel

## 📚 More Details

See `docs/OPTION1_HYBRID_SETUP.md` for complete documentation.

Done! Your hybrid setup is ready. 🚀

