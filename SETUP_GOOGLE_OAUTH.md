# Google OAuth Setup Guide

## Quick Setup (5 minutes)

### Step 1: Create Google OAuth App

1. **Go to Google Cloud Console:**
   - Visit: https://console.cloud.google.com/apis/credentials
   - Select your project (or create new)

2. **Create OAuth 2.0 Client ID:**
   - Click **"Create Credentials"** → **"OAuth client ID"**
   - If prompted, configure OAuth consent screen first:
     - User Type: **External**
     - App name: `Android Internals`
     - User support email: Your email
     - Developer contact: Your email
     - Click **"Save and Continue"** through scopes (use defaults)
     - Add test users if needed
     - Click **"Save and Continue"**

3. **Create OAuth Client:**
   - Application type: **Web application**
   - Name: `Android Internals Website`
   - **Authorized redirect URIs:**
     ```
     https://android-internals.vercel.app/api/auth-google?action=callback
     ```
   - Click **"Create"**

4. **Copy Credentials:**
   - **Client ID**: Copy this (you'll need it)
   - **Client Secret**: Copy this (keep it secret!)

### Step 2: Add to Vercel Environment Variables

1. **Go to Vercel:**
   - Visit: https://vercel.com/androidinternals-projects/android-internals/settings/environment-variables

2. **Add Variables:**
   - Click **"Add New"**
   - **Key:** `GOOGLE_CLIENT_ID`
   - **Value:** (paste your Client ID)
   - **Environment:** Production, Preview, Development
   - Click **"Save"**

   - Click **"Add New"** again
   - **Key:** `GOOGLE_CLIENT_SECRET`
   - **Value:** (paste your Client Secret)
   - **Environment:** Production, Preview, Development
   - Click **"Save"**

   - Click **"Add New"** again
   - **Key:** `SITE_URL`
   - **Value:** `https://www.hemangpandhi.com`
   - **Environment:** Production, Preview, Development
   - Click **"Save"**

### Step 3: Redeploy

1. **Redeploy Functions:**
   - Go to: https://vercel.com/androidinternals-projects/android-internals/deployments
   - Click **"..."** on latest deployment
   - Click **"Redeploy"**
   - Wait for deployment (~30 seconds)

### Step 4: Test

1. **Visit your website:**
   - Go to: https://www.hemangpandhi.com
   - Click **"Sign In"** button
   - Click **"Sign in with Google"**
   - Should redirect to Google
   - After authorizing, should return logged in

## Troubleshooting

### "redirect_uri_mismatch" Error
- Check callback URL in Google OAuth app matches exactly:
  ```
  https://android-internals.vercel.app/api/auth-google?action=callback
  ```
- Must match exactly (including https://, no trailing slash)

### "Invalid client" Error
- Check `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` in Vercel
- Verify they match Google Cloud Console
- Redeploy after adding variables

### Not Redirecting Back
- Check `SITE_URL` environment variable is set
- Verify Vercel function is deployed
- Check Vercel function logs for errors

## Verification

After setup, test:
```bash
curl https://android-internals.vercel.app/api/auth-google?action=login
```

Should redirect to Google OAuth page.

## Next Steps

1. ✅ Set up Google OAuth (this guide)
2. ✅ Test login flow
3. ✅ Add bookmark buttons to articles
4. ✅ Set up Giscus for comments

