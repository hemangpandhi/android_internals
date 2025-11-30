# How to Find Your Vercel Project URLs

## Quick Method

### Step 1: Go to Vercel Dashboard

Visit: https://vercel.com/androidinternals-projects/android-internals

### Step 2: Check Deployment URL

You'll see your deployment URL in one of these places:

1. **Top of the page**: Shows your project URL
2. **Deployments tab**: Click on latest deployment → See "Domains" section
3. **Settings → Domains**: Shows all configured domains

### Step 3: Use the Production URL

Vercel gives you two types of URLs:

**Production URL** (Recommended):
- Format: `https://android-internals.vercel.app`
- This is the main URL for your project
- Use this for all API endpoints

**Preview URL** (For testing):
- Format: `https://android-internals-8y1hk08hw-androidinternals-projects.vercel.app`
- This is a specific deployment URL
- Changes with each deployment

## Which URL to Use?

### For Production (Recommended):

Use the **production URL**:
```
https://android-internals.vercel.app
```

This URL:
- ✅ Stays the same across deployments
- ✅ Always points to latest production deployment
- ✅ More stable

### For Testing:

Use the **preview URL**:
```
https://android-internals-8y1hk08hw-androidinternals-projects.vercel.app
```

This URL:
- ⚠️ Changes with each deployment
- ⚠️ Points to specific deployment
- ✅ Good for testing specific versions

## Complete API URLs

Once you have your base URL, all three endpoints use the same base:

**If using production URL:**
```javascript
authApiUrl: 'https://android-internals.vercel.app/api/auth-github',
apiProxyUrl: 'https://android-internals.vercel.app/api/emailjs-contacts',
subscribersApiUrl: 'https://android-internals.vercel.app/api/subscribers-db',
```

**If using preview URL:**
```javascript
authApiUrl: 'https://android-internals-8y1hk08hw-androidinternals-projects.vercel.app/api/auth-github',
apiProxyUrl: 'https://android-internals-8y1hk08hw-androidinternals-projects.vercel.app/api/emailjs-contacts',
subscribersApiUrl: 'https://android-internals-8y1hk08hw-androidinternals-projects.vercel.app/api/subscribers-db',
```

## How to Verify URLs Work

### Test auth-github:
```bash
curl https://YOUR_VERCEL_URL/api/auth-github?action=login
```
Should redirect to GitHub (or show OAuth page)

### Test emailjs-contacts:
```bash
curl https://YOUR_VERCEL_URL/api/emailjs-contacts
```
Should return JSON (may require auth)

### Test subscribers-db:
```bash
curl https://YOUR_VERCEL_URL/api/subscribers-db
```
Should return JSON or error (requires auth)

## Where to Check in Vercel Dashboard

1. **Project Overview:**
   - https://vercel.com/androidinternals-projects/android-internals
   - Shows project URL at top

2. **Deployments:**
   - Click "Deployments" tab
   - Click on latest deployment
   - See "Domains" section

3. **Settings → Domains:**
   - Shows all configured domains
   - Production domain listed first

## Quick Check Command

You can also check via CLI:
```bash
vercel ls
```

Or inspect project:
```bash
vercel inspect
```

## Recommendation

**Use the production URL** (`android-internals.vercel.app`) because:
- ✅ Stable across deployments
- ✅ Always points to latest
- ✅ Simpler to manage

Your current URL (`android-internals-8y1hk08hw-androidinternals-projects.vercel.app`) is a preview URL and will change with each deployment.

