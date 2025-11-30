# Quick GitHub SSO Setup Guide

## 🚀 Fast Setup (5 minutes)

### Step 1: Create GitHub OAuth App (2 min)

1. Go to: https://github.com/settings/developers
2. Click **"OAuth Apps"** → **"New OAuth App"**
3. Fill in:
   - **Name**: `Android Internals Admin`
   - **Homepage**: `https://www.hemangpandhi.com`
   - **Callback URL**: `https://your-project.vercel.app/api/auth-github?action=callback`
   - Click **"Register"**
4. **Copy Client ID** (you'll need it)
5. **Generate Client Secret** → Copy it (keep it secret!)

### Step 2: Deploy to Vercel (2 min)

```bash
# Install Vercel CLI (if not installed)
npm install -g vercel

# Login
vercel login

# Deploy
cd /Users/hemang/website/android_internals
vercel --prod
```

### Step 3: Set Environment Variables (1 min)

```bash
# Set GitHub OAuth credentials
vercel env add GITHUB_CLIENT_ID production
# Paste your Client ID

vercel env add GITHUB_CLIENT_SECRET production
# Paste your Client Secret

vercel env add ALLOWED_GITHUB_USERS production
# Enter: hemangpandhi (or comma-separated: hemangpandhi,user2,user3)
```

### Step 4: Redeploy

```bash
vercel --prod
```

### Step 5: Update Admin Panel

1. Get your function URL from Vercel (e.g., `https://your-project.vercel.app/api/auth-github`)
2. Update `newsletter-admin.html`:
   - Find: `const AUTH_API_URL = ...`
   - Replace with your Vercel function URL
3. Or set in `config.js`:
   ```javascript
   authApiUrl: 'https://your-project.vercel.app/api/auth-github'
   ```

### Step 6: Update GitHub OAuth App Callback URL

1. Go back to GitHub OAuth App settings
2. Update **Callback URL** to match your Vercel function URL:
   ```
   https://your-project.vercel.app/api/auth-github?action=callback
   ```

## ✅ Done!

Now when you visit `https://www.hemangpandhi.com/newsletter-admin.html`:
1. You'll see "Sign in with GitHub" button
2. Click it → Redirects to GitHub
3. Authorize → Redirects back with token
4. Admin panel loads automatically

## 🔒 Security Features

- ✅ No passwords in code
- ✅ Server-side authentication
- ✅ Only authorized GitHub users can access
- ✅ Session tokens (24 hour expiry)
- ✅ HTTPS only

## 🐛 Troubleshooting

**"OAuth not configured"**
- Check environment variables in Vercel dashboard
- Verify `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET` are set

**"Access denied"**
- Check your GitHub username is in `ALLOWED_GITHUB_USERS`
- Username is case-sensitive

**"Invalid redirect URI"**
- Make sure callback URL in GitHub OAuth app matches exactly
- Must include `?action=callback`

## 📚 Full Documentation

See `docs/GITHUB_SSO_SETUP.md` for detailed instructions.

