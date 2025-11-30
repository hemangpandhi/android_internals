# GitHub OAuth Callback URL Setup

## Quick Answer

**For your preview URL:**
```
https://android-internals-eyvn6hj51-androidinternals-projects.vercel.app/api/auth-github?action=callback
```

**For production (recommended):**
```
https://android-internals.vercel.app/api/auth-github?action=callback
```

## Step-by-Step Setup

### 1. Go to GitHub OAuth App Settings

1. Visit: https://github.com/settings/developers
2. Click on your OAuth App (or create a new one)
3. Find the **"Authorization callback URL"** field

### 2. Set the Callback URL

**Option A: Use Production URL (Recommended)**
```
https://android-internals.vercel.app/api/auth-github?action=callback
```

**Option B: Use Preview URL (For Testing)**
```
https://android-internals-eyvn6hj51-androidinternals-projects.vercel.app/api/auth-github?action=callback
```

⚠️ **Important:** Preview URLs change with each deployment. Use production URL for stability.

### 3. Update Homepage URL (if needed)

Also set the **Homepage URL** to:
```
https://www.hemangpandhi.com
```

### 4. Save Changes

Click **"Update application"** to save.

## How to Find Your Production URL

1. Go to: https://vercel.com/androidinternals-projects/android-internals
2. Look at the top of the page - it shows your production URL
3. Or check the **Deployments** tab → Latest production deployment

## Testing the Callback URL

After setting up, test it:

```bash
# Test the callback endpoint
curl -I "https://android-internals.vercel.app/api/auth-github?action=callback"
```

You should get a response (even if it's an error about missing `code` parameter - that's expected).

## Multiple Callback URLs

GitHub OAuth Apps support **multiple callback URLs**. You can add both:

1. Production: `https://android-internals.vercel.app/api/auth-github?action=callback`
2. Preview: `https://android-internals-eyvn6hj51-androidinternals-projects.vercel.app/api/auth-github?action=callback`

To add multiple URLs:
- Separate them with commas or newlines in the callback URL field
- Or create separate OAuth Apps for production and preview

## Common Issues

### "redirect_uri_mismatch" Error

This means the callback URL in GitHub doesn't match what the code is sending.

**Fix:**
1. Check the exact URL in GitHub OAuth App settings
2. Make sure it matches exactly (including `https://`, no trailing slash)
3. The URL must be: `https://[your-url]/api/auth-github?action=callback`

### Preview URL Changed

If your preview URL changed after a new deployment:
1. Update the callback URL in GitHub OAuth App
2. Or use the production URL instead (recommended)

### Testing Locally

For local development, you can add:
```
http://localhost:8080/api/auth-github?action=callback
```

But this requires running the serverless function locally (not recommended).

## Current Configuration

Based on your `config.js`:
- **Production URL**: `https://android-internals.vercel.app`
- **Auth API**: `https://android-internals.vercel.app/api/auth-github`

So your callback URL should be:
```
https://android-internals.vercel.app/api/auth-github?action=callback
```

## Next Steps

After setting the callback URL:
1. ✅ Save the OAuth App settings
2. ✅ Test the login flow at: https://www.hemangpandhi.com/newsletter-admin.html
3. ✅ Verify you're redirected to GitHub
4. ✅ After authorizing, you should be redirected back to the admin panel

