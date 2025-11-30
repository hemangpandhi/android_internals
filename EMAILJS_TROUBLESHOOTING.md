# EmailJS Troubleshooting Guide

## Issue: Form Stuck on "Subscribing"

If the newsletter/contact form is stuck on "Subscribing" or "Sending...", it means EmailJS is not properly configured.

## Possible Causes:

### 1. **GitHub Secrets Not Set** ⚠️ (Most Likely)
The GitHub Actions workflow needs these secrets to create `config.js`:
- `EMAILJS_PUBLIC_KEY`
- `EMAILJS_SERVICE_ID`
- `EMAILJS_NEWSLETTER_TEMPLATE`
- `EMAILJS_CONTACT_TEMPLATE`
- `SITE_DOMAIN`
- `NEWSLETTER_FROM_EMAIL`

**Check:** Go to https://github.com/hemangpandhi/android_internals/settings/secrets/actions

### 2. **Config.js Has Placeholder Values**
If secrets are missing, `config.js` will have placeholder values like `YOUR_EMAILJS_PUBLIC_KEY_HERE` which won't work.

**Check:** Visit https://www.hemangpandhi.com/config.js (should show actual values, not placeholders)

### 3. **Config.js Not Loading**
The config.js file might not be accessible or loading correctly.

**Check:** Open browser console (F12) and look for:
- `EmailJS config missing or invalid`
- `EmailJS library not loaded`
- `window.EMAILJS_CONFIG` is undefined

## Quick Diagnostic Steps:

1. **Check Browser Console:**
   - Open https://www.hemangpandhi.com
   - Press F12 → Console tab
   - Look for EmailJS errors

2. **Check Config File:**
   - Visit: https://www.hemangpandhi.com/config.js
   - Should see actual EmailJS credentials (not placeholders)

3. **Check GitHub Secrets:**
   - Go to: https://github.com/hemangpandhi/android_internals/settings/secrets/actions
   - Verify all 6 secrets are set

4. **Test with Verification Page:**
   - Visit: https://www.hemangpandhi.com/verify-emailjs.html
   - Should show green checkmarks if configured correctly

## Solution:

### Step 1: Set GitHub Secrets
1. Go to: https://github.com/hemangpandhi/android_internals/settings/secrets/actions
2. Click "New repository secret"
3. Add each secret:

| Secret Name | Your Value |
|------------|------------|
| `EMAILJS_PUBLIC_KEY` | Your EmailJS public key from dashboard |
| `EMAILJS_SERVICE_ID` | Your EmailJS service ID |
| `EMAILJS_NEWSLETTER_TEMPLATE` | Your newsletter template ID |
| `EMAILJS_CONTACT_TEMPLATE` | Your contact template ID |
| `SITE_DOMAIN` | `https://www.hemangpandhi.com` |
| `NEWSLETTER_FROM_EMAIL` | `noreply@hemangpandhi.com` |

### Step 2: Trigger New Deployment
After setting secrets, you need to trigger a new deployment:
- Make a small change and push, OR
- Go to Actions tab → Re-run the latest workflow

### Step 3: Verify
1. Wait 2-5 minutes for deployment
2. Visit: https://www.hemangpandhi.com/verify-emailjs.html
3. Should show all green checkmarks
4. Test the newsletter form

## Debug Commands (Browser Console):

Open browser console on https://www.hemangpandhi.com and run:

```javascript
// Check if EmailJS is loaded
console.log('EmailJS:', typeof emailjs !== 'undefined' ? 'Loaded' : 'NOT LOADED');

// Check config
console.log('Config:', window.EMAILJS_CONFIG);

// Test EmailJS
if (typeof window.testEmailJS === 'function') {
  window.testEmailJS();
}
```

## Expected Console Output (When Working):

```
EmailJS: Loaded
Config: {publicKey: "LMsUX_rrpIYPFa76a", serviceId: "service_dygzcoh", ...}
EmailJS initialized with key: LMsUX_rrpIYPFa76a
```

## If Still Not Working:

1. Check GitHub Actions logs for errors
2. Verify EmailJS dashboard has correct template IDs
3. Check browser network tab for failed requests
4. Verify CORS settings in EmailJS dashboard

