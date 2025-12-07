# Deployment Guide for Android Internals Website

## 🔒 Security Checklist Before Publishing

### ✅ Required Actions

1. **Remove Sensitive Files**
   ```bash
   # These files should NOT be in your repository
   rm .env
   rm config.js
   rm -rf data/
   rm -rf build/
   rm -rf node_modules/
   rm package-lock.json
   ```

2. **Verify .gitignore**
   - Ensure `.env`, `config.js`, `data/`, `build/`, `node_modules/` are listed
   - Check that no sensitive files are tracked

3. **Set Up GitHub Secrets**
   - Go to your repository → Settings → Secrets and variables → Actions
   - Add the following secrets:
     - `EMAILJS_PUBLIC_KEY`
     - `EMAILJS_SERVICE_ID`
     - `EMAILJS_NEWSLETTER_TEMPLATE`
     - `EMAILJS_CONTACT_TEMPLATE`
     - `SITE_DOMAIN`
     - `NEWSLETTER_FROM_EMAIL`

## 🚀 Publishing to GitHub Pages

### Step 1: Prepare Repository

```bash
# Clean up sensitive files
rm .env config.js
rm -rf data/ build/ node_modules/
rm package-lock.json

# Add and commit files
git add .
git commit -m "Prepare for GitHub Pages deployment"
git push origin main
```

### Step 2: Configure GitHub Pages

1. Go to your repository → Settings → Pages
2. Source: Deploy from a branch
3. Branch: `gh-pages` (will be created by GitHub Actions)
4. Folder: `/ (root)`
5. Click Save

### Step 3: Set Up GitHub Secrets

1. Go to Settings → Secrets and variables → Actions
2. Add these secrets with your actual values:

```
EMAILJS_PUBLIC_KEY=your_public_key_here
EMAILJS_SERVICE_ID=your_service_id_here
EMAILJS_NEWSLETTER_TEMPLATE=your_newsletter_template_id
EMAILJS_CONTACT_TEMPLATE=your_contact_template_id
SITE_DOMAIN=https://your-username.github.io
NEWSLETTER_FROM_EMAIL=noreply@hemangpandhi.com
```

### Step 4: Deploy

1. Push to main branch
2. GitHub Actions will automatically:
   - Install dependencies
   - Create config.js from template
   - Build the website
   - Deploy to GitHub Pages

## 🔧 Local Development Setup

### For Contributors

```bash
# Clone repository
git clone https://github.com/your-username/android-internals.git
cd android-internals

# Install dependencies
npm install

# Copy configuration template
cp config.example.js config.js

# Edit config.js with your values
# (Use test/dummy values for development)

# Build and serve locally
npm run build
npm run serve
```

## 🛡️ Security Best Practices

### ✅ What's Safe to Push

- Source code (HTML, CSS, JS)
- Markdown articles
- Build scripts
- Templates
- Documentation
- Configuration templates (`.example` files)

### ❌ What's NOT Safe to Push

- API keys and secrets
- Real email addresses
- Personal configuration
- Build artifacts
- Dependencies (`node_modules`)
- Log files
- Temporary files

### 🔍 Security Verification

```bash
# Check what files will be pushed
git status

# Check for sensitive files
git diff --cached | grep -i "key\|secret\|password\|token"

# Verify .gitignore is working
git check-ignore .env config.js data/
```

## 📋 Post-Deployment Checklist

- [ ] Website loads correctly
- [ ] Contact form works
- [ ] Newsletter subscription works
- [ ] No sensitive data in page source
- [ ] HTTPS is enabled
- [ ] Custom domain configured (if applicable)
- [ ] Analytics tracking (if enabled)
- [ ] SEO meta tags are correct

## 🆘 Troubleshooting

### Common Issues

1. **Build Fails**
   - Check GitHub Actions logs
   - Verify all secrets are set
   - Ensure `package.json` is committed

2. **Forms Don't Work**
   - Verify EmailJS configuration
   - Check browser console for errors
   - Ensure secrets are correctly set

3. **Styling Issues**
   - Clear browser cache
   - Check if CSS files are being served
   - Verify file paths in HTML

### Support

If you encounter issues:
1. Check GitHub Actions logs
2. Review browser console for errors
3. Verify all configuration is correct
4. Test locally before pushing

## 🔄 Updating the Website

1. Make changes to your local repository
2. Test locally: `npm run build && npm run serve`
3. Commit and push to main branch
4. GitHub Actions will automatically deploy updates

---

**Remember**: Never commit sensitive information like API keys, passwords, or personal data to your repository!
