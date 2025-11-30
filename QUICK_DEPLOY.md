# Quick Deploy Guide - EmailJS Serverless Function

## Prerequisites

You need:
- ✅ EmailJS Private Key (from https://dashboard.emailjs.com/admin/integration)
- ✅ EmailJS Public Key (check `config.js` for your current public key)

## Step 1: Test API Connection Locally

First, let's verify your EmailJS credentials work:

```bash
# Set your credentials (replace with your actual private key)
export EMAILJS_PRIVATE_KEY="your_private_key_here"
export EMAILJS_USER_ID="your_public_key_here"

# Test the connection
node test-emailjs-api.js
```

**Expected output:**
```
✅ Success! Found X contact(s)
📋 Contacts:
   1. Name <email@example.com>
```

If you see this, your credentials are correct! ✅

## Step 2: Deploy to Vercel

### Option A: Automated Script (Easiest)

```bash
./deploy-serverless.sh
```

The script will:
1. Test your API connection
2. Deploy to Vercel
3. Set environment variables
4. Give you the function URL

### Option B: Manual Deployment

1. **Login to Vercel:**
   ```bash
   vercel login
   ```

2. **Deploy:**
   ```bash
   vercel --prod
   ```

3. **Set Environment Variables:**
   ```bash
   vercel env add EMAILJS_PRIVATE_KEY production
   # Paste your private key when prompted
   
   vercel env add EMAILJS_USER_ID production
   # Enter your EmailJS public key (check config.js)
   ```

4. **Redeploy:**
   ```bash
   vercel --prod
   ```

5. **Get your function URL:**
   - Vercel will show: `https://your-project.vercel.app/api/emailjs-contacts`
   - Copy this URL

## Step 3: Test Deployed Function

```bash
curl https://your-project.vercel.app/api/emailjs-contacts
```

**Expected response:**
```json
{
  "subscribers": [
    {
      "email": "user@example.com",
      "name": "User Name",
      "subscribedAt": "2025-11-30T08:31:30.000Z",
      "updatedAt": "2025-11-30T08:31:30.000Z",
      "active": true
    }
  ]
}
```

## Step 4: Configure Admin Panel

1. Go to: https://www.hemangpandhi.com/newsletter-admin.html
2. Click: **"🔌 Sync from EmailJS API"**
3. Paste your Vercel function URL
4. Click: **"⚡ Live Sync"** to test

## Troubleshooting

### "403 - The private key is wrong"
- Double-check your private key in EmailJS Dashboard
- Make sure there are no extra spaces or quotes

### "404 - Contacts API endpoint not found"
- EmailJS may not support this endpoint
- Use CSV export method instead (already works)

### Function works but admin panel shows error
- Check browser console (F12)
- Verify CORS headers are set correctly
- Make sure function URL is correct

## Need Help?

Run the test script first:
```bash
EMAILJS_PRIVATE_KEY="your_key" EMAILJS_USER_ID="your_public_key" node test-emailjs-api.js
```

This will show you exactly what's working and what's not!

