# Troubleshoot: Sign In Button Not Visible

## Quick Checks

### 1. Wait for Deployment
GitHub Actions takes **2-3 minutes** to build and deploy. Check status:
- https://github.com/hemangpandhi/android_internals/actions
- Wait for the latest workflow to complete (green checkmark)

### 2. Hard Refresh Browser
Clear cache and reload:
- **Chrome/Edge:** `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)
- **Firefox:** `Ctrl+F5` (Windows) or `Cmd+Shift+R` (Mac)
- **Safari:** `Cmd+Option+R`

### 3. Check Browser Console
1. Open DevTools: `F12` or `Right-click → Inspect`
2. Go to **Console** tab
3. Look for errors (red text)
4. Check if `user-auth.js` loaded:
   - Look for: `✅ User auth initialized` or similar

### 4. Verify Files Are Deployed
Check if files exist on the live site:
- https://www.hemangpandhi.com/assets/js/user-auth.js
- Should return JavaScript code (not 404)

### 5. Check HTML Source
1. Right-click page → **View Page Source**
2. Search for: `user-auth-menu`
3. Should find: `<div class="user-auth-menu" id="userAuthMenu">`
4. Should find: `<button class="btn-login" id="btnLogin">Sign In</button>`

## Expected Location

The "Sign In" button should appear:
- **Desktop:** Top right of navigation bar, after "Reference Videos" link
- **Mobile:** Top right, before hamburger menu

## If Still Not Visible

### Check CSS
1. Open DevTools → **Elements** tab
2. Find `<div class="user-auth-menu">`
3. Check if it has:
   - `display: flex` (not `display: none`)
   - `visibility: visible` (not `hidden`)
   - `opacity: 1` (not `0`)

### Check JavaScript
1. Open DevTools → **Console** tab
2. Type: `document.getElementById('btnLogin')`
3. Should return: `<button class="btn-login" id="btnLogin">`
4. If returns `null`, JavaScript didn't load

### Manual Test
1. Open DevTools → **Console** tab
2. Type: `document.getElementById('userAuthMenu').style.display = 'block'`
3. Button should appear

## Common Issues

### Issue 1: JavaScript Not Loading
**Symptom:** Console shows error loading `user-auth.js`
**Fix:** Check file exists at `/assets/js/user-auth.js`

### Issue 2: CSS Not Applied
**Symptom:** Button exists but invisible
**Fix:** Hard refresh browser (Ctrl+Shift+R)

### Issue 3: Deployment Not Complete
**Symptom:** Files return 404
**Fix:** Wait for GitHub Actions to finish

### Issue 4: Cached Old Version
**Symptom:** Old HTML without button
**Fix:** Hard refresh or clear cache

## Verification Steps

After deployment completes:

1. **Visit:** https://www.hemangpandhi.com
2. **Hard refresh:** `Ctrl+Shift+R` or `Cmd+Shift+R`
3. **Look for:** "Sign In" button in top right
4. **Click it:** Should show login modal with GitHub and Google options

## Still Not Working?

1. **Check GitHub Actions:** Is deployment complete?
2. **Check browser console:** Any JavaScript errors?
3. **Check network tab:** Are files loading (200 OK)?
4. **Try incognito/private mode:** Rules out cache issues

## Expected Behavior

✅ **Button visible** in navigation bar  
✅ **Clicking button** shows login modal  
✅ **Modal shows** GitHub and Google options  
✅ **Clicking provider** redirects to OAuth  

If all these work, the implementation is correct!

