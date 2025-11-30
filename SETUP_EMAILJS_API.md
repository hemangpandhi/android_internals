# Setup EmailJS API - Step by Step Guide

## Overview

This guide will help you deploy a serverless function that allows the admin panel to fetch subscribers directly from EmailJS API, eliminating the need for public JSON files.

## Prerequisites

- ✅ EmailJS account with Private Key and Public Key
- ✅ Node.js installed (for testing)
- ✅ Vercel account (free) - https://vercel.com

## Step 1: Test Your EmailJS API Connection

First, verify your credentials work:

```bash
# Set your credentials
export EMAILJS_PRIVATE_KEY="your_private_key_here"
export EMAILJS_USER_ID="ZV2P-4FW2xmtKUGWl"  # Your public key

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

### 2.1 Install Vercel CLI

```bash
npm install -g vercel
```

### 2.2 Login to Vercel

```bash
vercel login
```

Follow the prompts to authenticate.

### 2.3 Deploy the Function

From your project directory:

```bash
cd /Users/hemang/website/android_internals
vercel
```

**Follow the prompts:**
- Set up and deploy? **Yes**
- Which scope? **Your account**
- Link to existing project? **No** (first time)
- Project name? **android-internals-api** (or any name)
- Directory? **./** (current directory)
- Override settings? **No**

Vercel will automatically detect the `api/` directory and deploy the function.

### 2.4 Set Environment Variables

After deployment, set your EmailJS credentials:

```bash
# Set private key
vercel env add EMAILJS_PRIVATE_KEY production
# Paste your EmailJS private key when prompted

# Set user ID (your public key)
vercel env add EMAILJS_USER_ID production
# Enter: ZV2P-4FW2xmtKUGWl
```

### 2.5 Redeploy

Environment variables require a redeploy:

```bash
vercel --prod
```

### 2.6 Get Your Function URL

After deployment, Vercel will show you URLs like:
```
✅ Production: https://your-project.vercel.app/api/emailjs-contacts
```

**Copy this URL** - you'll need it in the next step.

## Step 3: Configure Admin Panel

### 3.1 Access Admin Panel with Password

Visit: `https://www.hemangpandhi.com/newsletter-admin.html?pwd=your_password`

### 3.2 Configure EmailJS API

1. Click **"🔌 Sync from EmailJS API"** button
2. When prompted, enter your Vercel function URL:
   ```
   https://your-project.vercel.app/api/emailjs-contacts
   ```
3. Click OK

The URL is saved in your browser's localStorage.

### 3.3 Test the Connection

1. Click **"⚡ Live Sync"** button
2. You should see subscribers load from EmailJS
3. Check the console (F12) for confirmation

## Step 4: Verify It Works

1. **Check subscribers load:**
   - Admin panel should show all EmailJS contacts
   - No public JSON file needed

2. **Test sending newsletter:**
   - Select subscribers
   - Send test newsletter
   - Verify emails are sent

## Troubleshooting

### "403 - The private key is wrong"
- Double-check `EMAILJS_PRIVATE_KEY` in Vercel
- Make sure `EMAILJS_USER_ID` matches your public key
- Redeploy after setting variables

### "Function not found"
- Check the function URL is correct
- Verify deployment succeeded in Vercel dashboard
- Check Vercel logs for errors

### "No subscribers found"
- Check EmailJS Dashboard → Contacts
- Verify "Save Contacts" is enabled in templates
- Try CSV import as fallback

## Alternative: Quick Test Script

If you want to test before deploying:

```bash
# Set credentials
export EMAILJS_PRIVATE_KEY="your_key"
export EMAILJS_USER_ID="ZV2P-4FW2xmtKUGWl"

# Run the automated deployment script
./deploy-serverless.sh
```

This script will:
1. Test your API connection
2. Deploy to Vercel
3. Set environment variables
4. Give you the function URL

## Next Steps

After setup:
- ✅ Subscribers load automatically from EmailJS
- ✅ No public JSON files
- ✅ Real-time sync
- ✅ Secure access

## Security Notes

- ✅ Function requires EmailJS credentials (not public)
- ✅ Admin panel requires password
- ✅ Subscribers never exposed publicly
- ✅ All access is authenticated

