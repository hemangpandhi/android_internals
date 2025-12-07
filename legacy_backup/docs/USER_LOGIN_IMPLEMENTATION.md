# User Login Implementation Guide

## Overview

The website now supports user login with both **GitHub OAuth** and **Google OAuth**. Users can sign in to:
- Save preferences (theme, bookmarks)
- Comment on articles (via Giscus)
- Track reading progress (future)
- Access exclusive content (future)

## Setup Required

### 1. Google OAuth Setup

1. **Go to Google Cloud Console:**
   - Visit: https://console.cloud.google.com/apis/credentials

2. **Create OAuth 2.0 Client ID:**
   - Click "Create Credentials" → "OAuth client ID"
   - Application type: "Web application"
   - Name: "Android Internals Website"
   - Authorized redirect URIs:
     ```
     https://android-internals.vercel.app/api/auth-google?action=callback
     ```
   - Click "Create"

3. **Copy Credentials:**
   - **Client ID**: Copy this
   - **Client Secret**: Copy this (keep it secret!)

4. **Add to Vercel Environment Variables:**
   - Go to: https://vercel.com/androidinternals-projects/android-internals/settings/environment-variables
   - Add:
     - `GOOGLE_CLIENT_ID` = (your Client ID)
     - `GOOGLE_CLIENT_SECRET` = (your Client Secret)
     - `SITE_URL` = `https://www.hemangpandhi.com`
   - Set for: Production, Preview, Development
   - Redeploy functions

### 2. Giscus Setup (for Comments)

1. **Go to Giscus:**
   - Visit: https://giscus.app

2. **Configure:**
   - Repository: `hemangpandhi/android_internals` (or create discussions repo)
   - Enable "Discussions" in your GitHub repo settings
   - Copy the configuration script

3. **Add to Articles:**
   - The Giscus script will be added to article pages
   - Comments are stored in GitHub Discussions

## Features Implemented

### ✅ Authentication
- GitHub OAuth (already working)
- Google OAuth (new)
- Session management (24 hours)
- Auto-login on return

### ✅ User Preferences
- Theme selection (Dark/Light/Auto)
- Saved in localStorage
- Persists across sessions

### ✅ Bookmarks
- Bookmark articles
- View bookmarks in user menu
- Saved in localStorage

### ✅ Comments (Giscus)
- GitHub Discussions-based comments
- Requires authentication
- Threaded discussions

## User Flow

1. **User clicks "Sign In"**
   - Modal shows GitHub and Google options
   - User chooses provider

2. **OAuth Flow:**
   - Redirects to provider (GitHub/Google)
   - User authorizes
   - Redirects back with token

3. **Session Created:**
   - Token stored in localStorage
   - User profile displayed
   - Preferences loaded

4. **User Features:**
   - Can change theme
   - Can bookmark articles
   - Can comment on articles
   - Preferences persist

## Files Added/Modified

### New Files:
- `api/auth-google.js` - Google OAuth serverless function
- `assets/js/user-auth.js` - User authentication class
- `docs/USER_LOGIN_IMPLEMENTATION.md` - This guide

### Modified Files:
- `index.html` - Added login UI and user menu
- `config.js` - Added Google OAuth URL
- `assets/css/styles.css` - Added user auth styles
- `assets/js/scripts.js` - Added user auth UI logic

## Next Steps

1. **Set up Google OAuth** (see above)
2. **Set up Giscus** (see above)
3. **Test login flow**
4. **Add bookmark buttons to articles**
5. **Add Giscus to article pages**

## Testing

1. **Test GitHub Login:**
   - Click "Sign In" → "Sign in with GitHub"
   - Should redirect and return logged in

2. **Test Google Login:**
   - Click "Sign In" → "Sign in with Google"
   - Should redirect and return logged in

3. **Test Preferences:**
   - Sign in → Click avatar → Preferences
   - Change theme → Should persist

4. **Test Bookmarks:**
   - Sign in → Bookmark an article
   - Check bookmarks in user menu

## Troubleshooting

### Google OAuth Not Working?
- Check Google OAuth app callback URL matches exactly
- Verify environment variables in Vercel
- Check Vercel function logs

### User Session Not Persisting?
- Check localStorage is enabled
- Check browser console for errors
- Verify token is being saved

### Comments Not Showing?
- Verify Giscus is configured
- Check GitHub Discussions are enabled
- Verify repository name matches

