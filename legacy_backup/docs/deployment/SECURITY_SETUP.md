# Security Setup Guide - EmailJS Configuration

## 🔒 Security Best Practices

This guide ensures your EmailJS credentials are kept secure and not exposed in your code repository.

## 📋 Required GitHub Secrets

You need to set up the following secrets in your GitHub repository:

### 1. Go to GitHub Repository Settings
- Navigate to your repository: `https://github.com/hemangpandhi/android_internals`
- Click on **Settings** tab
- Click on **Secrets and variables** → **Actions**

### 2. Add the Following Secrets

| Secret Name | Value | Description |
|-------------|-------|-------------|
| `EMAILJS_PUBLIC_KEY` | `YOUR_PUBLIC_KEY_HERE` | Your EmailJS public key |
| `EMAILJS_SERVICE_ID` | `service_dygzcoh` | Your EmailJS service ID |
| `EMAILJS_NEWSLETTER_TEMPLATE` | `template_uwh1kil` | Newsletter template ID |
| `EMAILJS_CONTACT_TEMPLATE` | `template_7bzhk1x` | Contact form template ID |
| `SITE_DOMAIN` | `https://www.hemangpandhi.com` | Your website domain |
| `NEWSLETTER_FROM_EMAIL` | `noreply@hemangpandhi.com` | Newsletter sender email |

### 3. How to Add Secrets

1. Click **New repository secret**
2. Enter the **Name** (e.g., `EMAILJS_PUBLIC_KEY`)
3. Enter the **Value** (your EmailJS public key from dashboard)
4. Click **Add secret**

## 🔧 How It Works

### Development Environment
- Uses `config.example.js` as template
- You can create a local `config.js` with your actual values
- Local `config.js` is ignored by Git (in `.gitignore`)

### Production Environment (GitHub Actions)
1. GitHub Actions copies `config.example.js` to `config.js`
2. Replaces placeholder values with GitHub Secrets
3. Builds website with secure configuration
4. Deploys to GitHub Pages

## 🛡️ Security Features

### ✅ What's Protected
- EmailJS public key
- Service IDs
- Template IDs
- Domain configuration
- Email addresses

### ✅ What's Safe to Commit
- `config.example.js` (template with placeholders)
- Build scripts
- HTML/CSS/JS files
- Documentation

### ✅ What's Ignored by Git
- `config.js` (contains actual credentials)
- `.env` files
- `data/` directory (subscriber data)
- Local development files

## 🚀 Deployment Process

1. **Push to master branch**
2. **GitHub Actions triggers**
3. **Secrets are injected** into config
4. **Website builds** with secure config
5. **Deploys to GitHub Pages**

## 🔍 Verification

After deployment, check that:
- ✅ Newsletter form works on live site
- ✅ Contact form works on live site
- ✅ No API keys visible in browser source
- ✅ Console shows "EmailJS initialized"

## 🚨 Important Notes

- **Never commit** `config.js` with real credentials
- **Always use** GitHub Secrets for production
- **Keep secrets** secure and don't share them
- **Rotate keys** periodically for security

## 📞 Support

If you encounter issues:
1. Check GitHub Actions logs for errors
2. Verify all secrets are set correctly
3. Test locally with `config.js` first
4. Check browser console for EmailJS errors
