# Complete Vercel Deployment Guide

## Overview

This guide will help you deploy your entire application to Vercel, including static site, serverless functions, and database integration.

## Prerequisites

- GitHub repository
- Vercel account (free)
- Supabase account (free, optional for database)

## Step 1: Connect Repository to Vercel

1. **Go to Vercel:**
   - Visit: https://vercel.com
   - Sign up/login with GitHub

2. **Import Project:**
   - Click **"Add New Project"**
   - Select your repository: `hemangpandhi/android_internals`
   - Click **"Import"**

3. **Configure Build:**
   - **Framework Preset**: Other
   - **Build Command**: `npm run build`
   - **Output Directory**: `build`
   - **Install Command**: `npm install`

4. **Deploy:**
   - Click **"Deploy"**
   - Wait for deployment to complete

## Step 2: Configure Environment Variables

1. **Go to Project Settings:**
   - Click on your project
   - Go to **Settings** → **Environment Variables**

2. **Add Variables:**

   **GitHub OAuth:**
   ```
   GITHUB_CLIENT_ID=your_github_client_id
   GITHUB_CLIENT_SECRET=your_github_client_secret
   ALLOWED_GITHUB_USERS=hemangpandhi
   ```

   **EmailJS:**
   ```
   EMAILJS_PRIVATE_KEY=your_private_key
   EMAILJS_USER_ID=your_public_key
   ```

   **Database (Supabase - Optional):**
   ```
   DB_TYPE=supabase
   DATABASE_URL=https://your-project.supabase.co
   SUPABASE_ANON_KEY=your_anon_key
   ```

   **Auth API:**
   ```
   AUTH_API_URL=https://your-project.vercel.app/api/auth-github
   ```

3. **Set for All Environments:**
   - Select **Production**, **Preview**, **Development**
   - Click **"Save"**

## Step 3: Update vercel.json

Ensure `vercel.json` is configured correctly:

```json
{
  "functions": {
    "api/*.js": {
      "runtime": "nodejs18.x"
    }
  },
  "rewrites": [
    {
      "source": "/api/(.*)",
      "destination": "/api/$1"
    }
  ],
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        {
          "key": "Access-Control-Allow-Origin",
          "value": "*"
        }
      ]
    }
  ]
}
```

## Step 4: Test Deployment

1. **Visit Your Site:**
   ```
   https://your-project.vercel.app
   ```

2. **Test API Endpoints:**
   ```
   https://your-project.vercel.app/api/auth-github?action=login
   https://your-project.vercel.app/api/emailjs-contacts
   ```

3. **Test Admin Panel:**
   ```
   https://your-project.vercel.app/newsletter-admin.html
   ```

## Step 5: Custom Domain (Optional)

1. **Go to Project Settings:**
   - **Settings** → **Domains**

2. **Add Domain:**
   - Enter: `www.hemangpandhi.com`
   - Follow DNS configuration instructions

3. **Update DNS:**
   - Add CNAME record pointing to Vercel
   - Wait for DNS propagation

## Step 6: Database Setup (Supabase)

### Create Supabase Project

1. **Go to Supabase:**
   - Visit: https://supabase.com
   - Create free account
   - Create new project

2. **Get Credentials:**
   - Go to **Settings** → **API**
   - Copy:
     - Project URL (DATABASE_URL)
     - Anon/Public Key (SUPABASE_ANON_KEY)

3. **Create Subscribers Table:**
   - Go to **SQL Editor**
   - Run:
   ```sql
   CREATE TABLE subscribers (
     id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
     email VARCHAR(255) UNIQUE NOT NULL,
     name VARCHAR(255),
     subscribed_at TIMESTAMP DEFAULT NOW(),
     updated_at TIMESTAMP DEFAULT NOW(),
     active BOOLEAN DEFAULT TRUE,
     source VARCHAR(50) DEFAULT 'website'
   );

   CREATE INDEX idx_subscribers_email ON subscribers(email);
   CREATE INDEX idx_subscribers_active ON subscribers(active);
   ```

4. **Set Row Level Security:**
   - Go to **Authentication** → **Policies**
   - Create policy for API access

5. **Update Vercel Environment Variables:**
   - Add `DATABASE_URL` and `SUPABASE_ANON_KEY`
   - Redeploy

## Step 7: Update Admin Panel Configuration

Update `config.js` or `newsletter-admin.html`:

```javascript
window.EMAILJS_CONFIG = {
  // ... existing config ...
  authApiUrl: 'https://your-project.vercel.app/api/auth-github',
  subscribersApiUrl: 'https://your-project.vercel.app/api/subscribers-db',
  emailjsApiUrl: 'https://your-project.vercel.app/api/emailjs-contacts'
};
```

## Step 8: Automatic Deployments

Vercel automatically deploys on:
- Push to `master` branch → Production
- Push to other branches → Preview
- Pull requests → Preview

## Monitoring & Logs

1. **View Logs:**
   - Go to **Deployments** → Click deployment → **Functions** tab
   - See real-time logs

2. **View Analytics:**
   - Go to **Analytics** tab
   - See function invocations, errors, etc.

## Troubleshooting

### Functions Not Working

1. **Check Logs:**
   - Go to deployment → Functions tab
   - Look for errors

2. **Check Environment Variables:**
   - Verify all variables are set
   - Check for typos

3. **Check Function Code:**
   - Ensure exports are correct
   - Check for syntax errors

### CORS Errors

- Add CORS headers in function
- Check `vercel.json` headers configuration

### Database Connection Issues

- Verify `DATABASE_URL` is correct
- Check Supabase project is active
- Verify API keys are correct

## Cost

**Free Tier Includes:**
- 100GB bandwidth/month
- 100 serverless function invocations/day
- Unlimited deployments
- Custom domains

**Upgrade to Pro ($20/month) for:**
- More bandwidth
- More function invocations
- Team features
- Priority support

## Next Steps

1. ✅ Deploy to Vercel
2. ✅ Set environment variables
3. ✅ Test all endpoints
4. ✅ Set up custom domain
5. ✅ Configure database (optional)
6. ✅ Update admin panel URLs
7. ✅ Test GitHub SSO
8. ✅ Monitor logs

Your application is now running on a proper server environment! 🚀

