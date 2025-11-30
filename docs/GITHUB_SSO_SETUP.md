# GitHub SSO Setup for Admin Panel

## Overview

This guide will help you set up GitHub OAuth (SSO) authentication for the newsletter admin panel, replacing the client-side password check with secure server-side authentication.

## Why GitHub SSO?

✅ **More Secure**: No passwords in code or client-side JavaScript  
✅ **No Password Management**: Users authenticate with their GitHub account  
✅ **Access Control**: Only authorized GitHub users can access  
✅ **Audit Trail**: Know exactly who accessed the admin panel  
✅ **Industry Standard**: OAuth 2.0 is the standard for authentication  

## Prerequisites

- GitHub account
- Repository access
- Vercel or Netlify account (for serverless functions)

## Step 1: Create GitHub OAuth App

1. **Go to GitHub Settings:**
   - Visit: https://github.com/settings/developers
   - Click **"OAuth Apps"** → **"New OAuth App"**

2. **Fill in the form:**
   - **Application name**: `Android Internals Admin Panel`
   - **Homepage URL**: `https://www.hemangpandhi.com`
   - **Authorization callback URL**: 
     - For Vercel: `https://your-project.vercel.app/api/auth-github?action=callback`
     - For Netlify: `https://your-site.netlify.app/.netlify/functions/auth-github?action=callback`
   - Click **"Register application"**

3. **Copy Credentials:**
   - **Client ID**: Copy this (public)
   - **Client Secret**: Click "Generate a new client secret" and copy it (keep it secret!)

## Step 2: Deploy Serverless Function

### Option A: Vercel (Recommended)

1. **Install Vercel CLI:**
   ```bash
   npm install -g vercel
   ```

2. **Login:**
   ```bash
   vercel login
   ```

3. **Deploy:**
   ```bash
   cd /Users/hemang/website/android_internals
   vercel --prod
   ```

4. **Set Environment Variables:**
   ```bash
   vercel env add GITHUB_CLIENT_ID production
   # Paste your Client ID when prompted
   
   vercel env add GITHUB_CLIENT_SECRET production
   # Paste your Client Secret when prompted
   
   vercel env add ALLOWED_GITHUB_USERS production
   # Enter: hemangpandhi (or comma-separated list of allowed GitHub usernames)
   ```

5. **Redeploy:**
   ```bash
   vercel --prod
   ```

6. **Get Function URL:**
   - Vercel will show: `https://your-project.vercel.app/api/auth-github`
   - Copy this URL

### Option B: Netlify

1. **Install Netlify CLI:**
   ```bash
   npm install -g netlify-cli
   ```

2. **Login:**
   ```bash
   netlify login
   ```

3. **Deploy:**
   ```bash
   cd /Users/hemang/website/android_internals
   netlify deploy --prod
   ```

4. **Set Environment Variables:**
   - Go to: Netlify Dashboard → Site Settings → Environment Variables
   - Add:
     - `GITHUB_CLIENT_ID`: Your Client ID
     - `GITHUB_CLIENT_SECRET`: Your Client Secret
     - `ALLOWED_GITHUB_USERS`: `hemangpandhi` (or comma-separated list)

5. **Redeploy:**
   ```bash
   netlify deploy --prod
   ```

## Step 3: Update Admin Panel

The admin panel will be updated to:
1. Check for GitHub token on load
2. Redirect to GitHub OAuth if not authenticated
3. Verify token with serverless function
4. Show admin panel if authenticated

## Step 4: Configure Allowed Users

Set `ALLOWED_GITHUB_USERS` environment variable to a comma-separated list of GitHub usernames:

```
hemangpandhi,another-user,third-user
```

Only these users will be able to access the admin panel.

## Step 5: Test Authentication

1. **Visit Admin Panel:**
   ```
   https://www.hemangpandhi.com/newsletter-admin.html
   ```

2. **You'll be redirected to GitHub:**
   - GitHub will ask you to authorize the app
   - Click **"Authorize"**

3. **You'll be redirected back:**
   - With a session token
   - Admin panel will load automatically

## How It Works

```
User visits admin panel
    ↓
No token found → Redirect to GitHub OAuth
    ↓
User authorizes on GitHub
    ↓
GitHub redirects with code
    ↓
Serverless function exchanges code for token
    ↓
Serverless function gets user info from GitHub
    ↓
Check if user is in ALLOWED_GITHUB_USERS
    ↓
Create session token
    ↓
Redirect to admin panel with token
    ↓
Admin panel verifies token with serverless function
    ↓
Show admin panel if authenticated
```

## Security Features

1. **Server-Side Verification**: All authentication happens on the server
2. **No Passwords**: No passwords stored or transmitted
3. **Access Control**: Only authorized GitHub users can access
4. **Session Tokens**: Time-limited tokens (24 hours)
5. **HTTPS Only**: All communication is encrypted

## Troubleshooting

### "OAuth not configured"
- Check that `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET` are set
- Verify environment variables in Vercel/Netlify dashboard

### "Access denied"
- Check that your GitHub username is in `ALLOWED_GITHUB_USERS`
- Verify the username matches exactly (case-sensitive)

### "Invalid redirect URI"
- Check that the callback URL in GitHub OAuth app matches your deployment
- Must match exactly (including protocol, domain, path)

### Function not found
- Verify the function is deployed
- Check the function URL is correct
- Check Vercel/Netlify logs for errors

## Next Steps

After setup:
1. ✅ Remove old password-based authentication
2. ✅ Update admin panel to use GitHub SSO
3. ✅ Test authentication flow
4. ✅ Deploy to production

## Benefits

- 🔒 **More Secure**: No passwords in code
- 👥 **User Management**: Easy to add/remove users
- 📊 **Audit Trail**: Know who accessed what
- 🚀 **Scalable**: Works for multiple users
- ✅ **Industry Standard**: OAuth 2.0

