# Fix: Vercel API "Not Found" Error

## Problem

Getting "Not Found" error for:
```
https://your_vercel_project.vercel.app/api/auth-github?action=login
```

The URL `your_vercel_project.vercel.app` is a **placeholder** - you need to use your actual Vercel URL!

## Quick Fix

### Step 1: Find Your Actual Vercel URL

1. **Go to Vercel Dashboard:**
   - Visit: https://vercel.com/androidinternals-projects/android-internals

2. **Check Project Overview:**
   - Look at the top of the page
   - You'll see your project URL (e.g., `android-internals.vercel.app`)

3. **Or Check Deployments:**
   - Click **"Deployments"** tab
   - Click on latest deployment
   - Check **"Domains"** section
   - Copy the URL shown

### Step 2: Verify Functions Are Deployed

1. **In the same deployment page:**
   - Click **"Functions"** tab
   - Should see:
     - `api/auth-github.js`
     - `api/emailjs-contacts.js`
     - `api/subscribers-db.js`

2. **If functions are NOT listed:**
   - Functions might not be deployed
   - Check build logs for errors
   - See "Fix Functions Not Deploying" below

### Step 3: Test the Actual URL

Once you have your real Vercel URL, test it:

```bash
# Replace with your actual URL
curl -I https://android-internals.vercel.app/api/auth-github?action=login
```

**Expected:**
- `302 Found` (redirects to GitHub)
- Or `200 OK`

**If 404:**
- Functions not deployed (see below)
- Wrong URL
- Path issue

### Step 4: Update config.js

Update your `config.js` with the **actual** Vercel URL:

```javascript
authApiUrl: 'https://YOUR_ACTUAL_VERCEL_URL/api/auth-github',
apiProxyUrl: 'https://YOUR_ACTUAL_VERCEL_URL/api/emailjs-contacts',
subscribersApiUrl: 'https://YOUR_ACTUAL_VERCEL_URL/api/subscribers-db',
```

## Fix: Functions Not Deploying

If functions aren't showing in Vercel dashboard:

### Issue: outputDirectory Configuration

With `outputDirectory: "build"` in `vercel.json`, Vercel might not detect `api/` directory.

**Solution:** Vercel should still detect `api/` at root level, but let's verify:

1. **Check if api/ is in repository:**
   ```bash
   git ls-files api/
   ```

2. **Verify api/ files are committed:**
   ```bash
   git status api/
   ```

3. **If not committed:**
   ```bash
   git add api/
   git commit -m "Add API functions for Vercel"
   git push origin master
   ```

### Issue: Functions Need to Be at Root

Vercel detects functions in `api/` directory at the **root** of your project, not in `build/`.

**Verify:**
- `api/auth-github.js` exists at project root ✅
- `api/emailjs-contacts.js` exists at project root ✅
- Files are committed to git ✅

### Issue: Build Configuration

The `outputDirectory: "build"` only affects static files, not serverless functions.

**Functions should deploy automatically** if:
- ✅ `api/` directory exists at root
- ✅ Files are in git
- ✅ `vercel.json` doesn't exclude them

## Step-by-Step Debugging

### 1. Check Vercel Dashboard

Go to: https://vercel.com/androidinternals-projects/android-internals/deployments

**Check:**
- [ ] Latest deployment completed successfully
- [ ] "Functions" tab shows your API functions
- [ ] No errors in build logs

### 2. Verify Files Are Committed

```bash
git ls-files api/
```

Should show:
```
api/auth-github.js
api/emailjs-contacts.js
api/subscribers-db.js
api/get-subscribers.js
```

### 3. Check Build Logs

In Vercel dashboard:
- Go to deployment
- Click "Build Logs"
- Look for errors about functions

### 4. Test Directly

Once you have the correct URL:

```bash
# Test auth (should redirect)
curl -I https://YOUR_VERCEL_URL/api/auth-github?action=login

# Test EmailJS (might need auth)
curl -I https://YOUR_VERCEL_URL/api/emailjs-contacts
```

## Common Issues

### "Functions tab is empty"

**Causes:**
- Functions not in git
- Build failed
- `api/` directory not detected

**Fix:**
1. Verify `api/*.js` files are committed
2. Check build logs for errors
3. Redeploy

### "Wrong URL format"

**Your config.js shows:**
```javascript
authApiUrl: 'https://android-internals-8y1hk08hw-androidinternals-projects.vercel.app/api/auth-github'
```

This is a **preview URL** (changes with each deployment).

**Better: Use production URL:**
```javascript
authApiUrl: 'https://android-internals.vercel.app/api/auth-github'
```

### "404 Not Found"

**If you're using the correct URL but still getting 404:**

1. **Check Functions tab** - are functions listed?
2. **Check function logs** - any errors?
3. **Wait a few minutes** - deployment might still be processing
4. **Redeploy** - trigger a new deployment

## Quick Checklist

- [ ] Found actual Vercel URL (not placeholder)
- [ ] Functions listed in Vercel dashboard
- [ ] Updated config.js with correct URL
- [ ] Tested URL with curl
- [ ] Functions are committed to git
- [ ] Build completed successfully

## Next Steps

1. **Get your actual Vercel URL** from dashboard
2. **Check Functions tab** - verify functions are deployed
3. **Update config.js** with correct URL
4. **Rebuild and deploy**
5. **Test the endpoints**

Once you have the correct URL and functions are deployed, everything should work! 🚀

