# Admin Password Setup with GitHub Secrets

## Overview

The admin password is now injected from GitHub Secrets during the build process, ensuring it's never hardcoded in the repository.

## Setup Instructions

### Step 1: Add GitHub Secret

1. Go to your repository: `https://github.com/hemangpandhi/android_internals`
2. Navigate to: **Settings** → **Secrets and variables** → **Actions**
3. Click **"New repository secret"**
4. Name: `ADMIN_PASSWORD`
5. Value: Your secure admin password (e.g., `AndroidInternals@2025`)
6. Click **"Add secret"**

### Step 2: Verify Secret is Set

After adding the secret, the GitHub Actions workflow will:
- ✅ Automatically inject the password during build
- ✅ Replace `{{ADMIN_PASSWORD}}` placeholder in `newsletter-admin.html`
- ✅ Never expose the password in logs or code

### Step 3: Access Admin Panel

After deployment, access the admin panel:

**Option 1: Direct Password Entry**
1. Go to: `https://www.hemangpandhi.com/newsletter-admin.html`
2. Enter the password you set in GitHub Secrets
3. Click "Unlock Admin Panel"

**Option 2: URL Parameter (Alternative)**
```
https://www.hemangpandhi.com/newsletter-admin.html?pwd=your_password
```

## How It Works

1. **Build Time**: GitHub Actions reads `ADMIN_PASSWORD` secret
2. **Injection**: Replaces `'{{ADMIN_PASSWORD}}'` in `newsletter-admin.html`
3. **Deployment**: Built file with injected password is deployed
4. **Security**: Password never appears in repository or build logs

## Password Priority

The admin panel checks passwords in this order:
1. **URL Parameter** (`?pwd=...`) - Highest priority
2. **config.js** (`window.EMAILJS_CONFIG?.adminPassword`) - If available
3. **Injected Password** (`{{ADMIN_PASSWORD}}`) - From GitHub Secrets

## Security Best Practices

1. ✅ **Use Strong Password**: Minimum 16 characters, mix of letters, numbers, symbols
2. ✅ **Never Commit Password**: Password is only in GitHub Secrets
3. ✅ **Rotate Regularly**: Change password periodically
4. ✅ **Limit Access**: Only trusted team members should know the password
5. ✅ **Use URL Parameter**: For extra security, use `?pwd=...` instead

## Troubleshooting

### Password Not Working

1. **Check Secret is Set:**
   - Go to: Repository → Settings → Secrets → Actions
   - Verify `ADMIN_PASSWORD` exists

2. **Check Build Logs:**
   - Go to: Actions → Latest workflow run
   - Look for "Inject admin password" step
   - Should show: "✅ Admin password secret found"

3. **Verify Deployment:**
   - Wait for GitHub Pages deployment to complete
   - Clear browser cache
   - Try again

### Secret Not Found

If you see: `⚠️ WARNING: ADMIN_PASSWORD secret is not set!`

1. Add the secret as described in Step 1
2. Re-run the workflow or push a new commit
3. The password will be injected on next build

## Changing the Password

1. **Update GitHub Secret:**
   - Go to: Settings → Secrets → Actions
   - Find `ADMIN_PASSWORD`
   - Click **"Update"**
   - Enter new password
   - Save

2. **Trigger Rebuild:**
   - Push any commit, or
   - Manually trigger workflow in Actions tab

3. **Test New Password:**
   - Wait for deployment
   - Try logging in with new password

## Local Development

For local development, the password placeholder `{{ADMIN_PASSWORD}}` will remain. You can:

1. **Use URL Parameter:**
   ```
   http://localhost:8080/newsletter-admin.html?pwd=your_password
   ```

2. **Set in config.js:**
   ```javascript
   adminPassword: 'your_local_password'
   ```

3. **Manually Replace:**
   - Replace `'{{ADMIN_PASSWORD}}'` with your password in `newsletter-admin.html`

