# Troubleshoot Vercel API "Not Found" Error

## Problem

Getting "Not Found" error when accessing:
```
https://your_vercel_project.vercel.app/api/auth-github?action=login
```

## Common Causes

### 1. Wrong Vercel URL

**Check:** Make sure you're using the correct Vercel project URL.

**How to find it:**
1. Go to: https://vercel.com/androidinternals-projects/android-internals
2. Look at the top of the page - shows your project URL
3. Or go to **Deployments** tab → Click latest deployment → See "Domains"

**Common URLs:**
- Production: `https://android-internals.vercel.app`
- Preview: `https://android-internals-8y1hk08hw-androidinternals-projects.vercel.app`

### 2. Functions Not Deployed

**Check:** Verify functions are actually deployed.

1. Go to: https://vercel.com/androidinternals-projects/android-internals/deployments
2. Click on latest deployment
3. Go to **"Functions"** tab
4. Should see: `api/auth-github.js`, `api/emailjs-contacts.js`, etc.

**If functions are missing:**
- Check build logs for errors
- Verify `api/` directory exists
- Check `vercel.json` configuration

### 3. Function Path Issue

**Check:** Vercel might need the function path without `.js` extension.

Try:
```
https://your_vercel_url/api/auth-github?action=login
```

Instead of:
```
https://your_vercel_url/api/auth-github.js?action=login
```

### 4. Build Configuration

**Check:** `vercel.json` might be misconfigured.

Current `vercel.json` should have:
```json
{
  "rewrites": [
    {
      "source": "/api/(.*)",
      "destination": "/api/$1"
    }
  ]
}
```

## Quick Fixes

### Fix 1: Verify Function Deployment

1. **Check Vercel Dashboard:**
   - Go to: https://vercel.com/androidinternals-projects/android-internals
   - Click **"Deployments"** tab
   - Click latest deployment
   - Check **"Functions"** tab
   - Should see your API functions listed

2. **Check Function Logs:**
   - In deployment, go to **"Functions"** tab
   - Click on a function
   - Check for errors in logs

### Fix 2: Test Function Directly

Try accessing the function directly:

```bash
# Test auth endpoint
curl https://your_vercel_url/api/auth-github?action=login

# Should redirect to GitHub or show OAuth page
```

### Fix 3: Check Function Files

Verify files exist:
```bash
ls -la api/*.js
```

Should see:
- `api/auth-github.js`
- `api/emailjs-contacts.js`
- `api/subscribers-db.js`
- `api/get-subscribers.js`

### Fix 4: Redeploy

If functions aren't showing:
1. Go to Vercel dashboard
2. Click **"Redeploy"** on latest deployment
3. Or push a new commit to trigger deployment

## Step-by-Step Debugging

### Step 1: Get Correct Vercel URL

1. Visit: https://vercel.com/androidinternals-projects/android-internals
2. Copy the exact URL shown (not a placeholder)
3. Should be something like: `android-internals.vercel.app`

### Step 2: Test Function Exists

```bash
# Replace with your actual Vercel URL
curl -I https://android-internals.vercel.app/api/auth-github?action=login
```

**Expected:**
- `302 Found` (redirects to GitHub)
- Or `200 OK` (shows OAuth page)

**If 404:**
- Function not deployed
- Wrong URL
- Path issue

### Step 3: Check Vercel Dashboard

1. Go to deployment
2. Check **"Functions"** tab
3. Look for `api/auth-github`
4. Click to see logs/errors

### Step 4: Verify vercel.json

Check `vercel.json` has correct rewrites:
```json
{
  "rewrites": [
    {
      "source": "/api/(.*)",
      "destination": "/api/$1"
    }
  ]
}
```

## Common Solutions

### Solution 1: Use Production URL

Instead of preview URL, use production:
```
https://android-internals.vercel.app/api/auth-github
```

### Solution 2: Wait for Deployment

If you just pushed:
- Wait 1-2 minutes for deployment
- Check Vercel dashboard for completion
- Try again

### Solution 3: Check Function Code

Verify `api/auth-github.js` exists and has:
```javascript
export default async function handler(req, res) {
  // ... function code
}
```

### Solution 4: Check Environment Variables

Functions might fail if env vars are missing:
- Go to Vercel → Settings → Environment Variables
- Verify all required vars are set

## Quick Test

Run this to test your setup:

```bash
# Replace YOUR_VERCEL_URL with actual URL
VERCEL_URL="https://android-internals.vercel.app"

# Test auth endpoint
echo "Testing auth endpoint..."
curl -I "$VERCEL_URL/api/auth-github?action=login"

# Test EmailJS endpoint
echo "Testing EmailJS endpoint..."
curl -I "$VERCEL_URL/api/emailjs-contacts"
```

## Still Not Working?

1. **Check Vercel Logs:**
   - Deployment → Functions → Click function → View logs

2. **Verify File Structure:**
   - `api/auth-github.js` exists
   - Has `export default async function handler`

3. **Check Build Output:**
   - Deployment → Build Logs
   - Look for errors

4. **Contact Vercel Support:**
   - https://vercel.com/support

## Next Steps

Once you find the correct URL:
1. Update `config.js` with correct Vercel URL
2. Rebuild and deploy
3. Test endpoints

