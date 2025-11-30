# Fix: GitHub OAuth Redirect URI Mismatch

## Problem
The redirect URI was being constructed from `req.headers.origin` (GitHub Pages URL), but GitHub OAuth app callback URL is set to Vercel URL.

**Error:** "The redirect_uri is not associated with this application"

## Solution
Updated `api/auth-github.js` to use the Vercel URL for the redirect URI instead of the GitHub Pages origin.

## What Changed
- **Before:** `redirectUri = ${req.headers.origin}/api/auth-github?action=callback`
- **After:** `redirectUri = ${vercelUrl}/api/auth-github?action=callback`

## GitHub OAuth App Configuration

Make sure your GitHub OAuth App callback URL is set to:

```
https://android-internals.vercel.app/api/auth-github?action=callback
```

### Steps to Update:
1. Go to: https://github.com/settings/developers
2. Click on your OAuth App
3. Update **Authorization callback URL** to:
   ```
   https://android-internals.vercel.app/api/auth-github?action=callback
   ```
4. Click **"Update application"**

## Deploy the Fix

After updating the code, deploy to Vercel:

```bash
vercel --prod
```

Or push to GitHub (if auto-deploy is enabled):
```bash
git add api/auth-github.js
git commit -m "fix: Use Vercel URL for GitHub OAuth redirect URI"
git push origin master
```

## Test

1. Visit: https://www.hemangpandhi.com/newsletter-admin.html
2. Click "Sign in with GitHub"
3. Should redirect to GitHub (no error)
4. After authorizing, should redirect back successfully

