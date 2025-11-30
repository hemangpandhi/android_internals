# Debug Authentication Flow

## Steps to Debug

1. **Open Browser Console (F12)**
2. **Clear Console** - Click the clear button
3. **Reload Page** - Press F5 or Cmd+R
4. **Look for these logs:**

### Expected Logs (in order):

1. `Token found, processing authentication...`
2. `Handling auth callback for provider: google` (or `github`)
3. `Verifying token with: [API URL]`
4. `Auth verification response: [response object]`
5. `User authenticated: [user object]`
6. `Session saved: [session object]`
7. `onUserChange: Dispatching userAuthChange event`
8. `updateUserUI: User is authenticated: [user object]`
9. `Manual UI update: User is authenticated`

### What to Check:

1. **Is token being found?**
   - Look for: `Token found, processing authentication...`
   - If missing: Token not in URL or not being detected

2. **Is API call succeeding?**
   - Look for: `Auth verification response:`
   - Check if `authenticated: true` and `user` object exists
   - If error: Check network tab for failed request

3. **Is user data correct?**
   - Check the `user` object in logs
   - Should have: `name`, `email`, `avatar` or `picture`
   - Avatar URL should be a valid image URL

4. **Is UI updating?**
   - Look for: `updateUserUI: User is authenticated`
   - Look for: `Manual UI update: User is authenticated`
   - Check if DOM elements exist

## Common Issues:

### Issue 1: Token not found
**Symptom:** No "Token found" log
**Fix:** Check URL has `?token=...&provider=...`

### Issue 2: API call failing
**Symptom:** Error in console or network tab
**Fix:** Check Vercel function is deployed and working

### Issue 3: User data missing avatar
**Symptom:** User object has no `avatar` or `picture` field
**Fix:** Check API response structure

### Issue 4: UI not updating
**Symptom:** Logs show authenticated but UI doesn't change
**Fix:** Check DOM elements exist, check CSS display properties

## Manual Test:

Open browser console and run:

```javascript
// Check if userAuth exists
console.log('userAuth:', window.userAuth);

// Check if authenticated
console.log('Authenticated:', window.userAuth?.isAuthenticated());

// Check user data
console.log('User:', window.userAuth?.getUser());

// Check session
console.log('Session:', localStorage.getItem('user_session'));

// Manually trigger UI update
if (window.userAuth) {
  window.userAuth.onUserChange();
}

// Check DOM elements
console.log('Logged out menu:', document.getElementById('userMenuLoggedOut'));
console.log('Logged in menu:', document.getElementById('userMenuLoggedIn'));
console.log('Avatar img:', document.getElementById('userAvatarImg'));
console.log('Avatar initial:', document.getElementById('userAvatarInitial'));
```

## Network Tab Check:

1. Open Network tab in DevTools
2. Filter by "verify" or "auth"
3. Look for request to `/api/auth-google?action=verify` or `/api/auth-github?action=verify`
4. Check:
   - Status code (should be 200)
   - Response body (should have `authenticated: true` and `user` object)
   - Request payload (should have `token`)

