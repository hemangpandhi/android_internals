# Deploy Serverless Function for Runtime Subscriber Sync

## Quick Start

### Option 1: Vercel (Recommended - Easiest)

1. **Install Vercel CLI** (if not already installed):
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**:
   ```bash
   vercel login
   ```

3. **Deploy the function**:
   ```bash
   vercel
   ```
   - Follow the prompts
   - Select your project or create a new one
   - Vercel will automatically detect the `api/` directory

4. **Set Environment Variables**:
   ```bash
   vercel env add EMAILJS_PRIVATE_KEY
   vercel env add EMAILJS_USER_ID
   ```
   - Enter your EmailJS private key for `EMAILJS_PRIVATE_KEY`
   - Enter your EmailJS public key for `EMAILJS_USER_ID`

5. **Redeploy** (to apply environment variables):
   ```bash
   vercel --prod
   ```

6. **Get your function URL**:
   - After deployment, Vercel will show you the URL
   - It will be something like: `https://your-project.vercel.app/api/emailjs-contacts`
   - Copy this URL

7. **Test the function**:
   ```bash
   curl https://your-project.vercel.app/api/emailjs-contacts
   ```

8. **Configure in Admin Panel**:
   - Go to https://www.hemangpandhi.com/newsletter-admin.html
   - Click "🔌 Sync from EmailJS API"
   - Paste your Vercel function URL
   - Click "⚡ Live Sync" to test

### Option 2: Netlify

1. **Install Netlify CLI**:
   ```bash
   npm install -g netlify-cli
   ```

2. **Login to Netlify**:
   ```bash
   netlify login
   ```

3. **Deploy**:
   ```bash
   netlify deploy --prod
   ```

4. **Set Environment Variables**:
   - Go to Netlify Dashboard → Site Settings → Environment Variables
   - Add `EMAILJS_PRIVATE_KEY`
   - Add `EMAILJS_USER_ID`

5. **Redeploy**:
   ```bash
   netlify deploy --prod
   ```

6. **Get your function URL**:
   - Your function will be at: `https://your-site.netlify.app/.netlify/functions/emailjs-contacts`

### Option 3: Test Locally First

Before deploying, test the function locally:

1. **Set environment variables**:
   ```bash
   export EMAILJS_PRIVATE_KEY="your_private_key"
   export EMAILJS_USER_ID="your_public_key"
   ```

2. **Test the API connection**:
   ```bash
   node test-emailjs-api.js
   ```

3. **If test passes**, proceed with deployment

## Testing

### Test API Connection

```bash
node test-emailjs-api.js
```

This will:
- ✅ Verify your EmailJS credentials
- ✅ Test the API endpoint
- ✅ Show you the contacts/subscribers found
- ✅ Display the transformed subscriber format

### Test Deployed Function

```bash
curl https://your-function-url/api/emailjs-contacts
```

Expected response:
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

## Troubleshooting

### "EmailJS credentials not configured"
- Make sure environment variables are set in your serverless platform
- For Vercel: `vercel env ls` to list variables
- Redeploy after setting variables

### "403 - The private key is wrong"
- Double-check your `EMAILJS_PRIVATE_KEY` in EmailJS Dashboard
- Make sure `EMAILJS_USER_ID` matches your EmailJS public key
- No spaces or quotes in the values

### "404 - Contacts API endpoint not found"
- EmailJS may not support this endpoint
- Use CSV export method instead (already implemented)

### Function works but admin panel doesn't connect
- Check CORS headers in function response
- Verify the function URL is correct
- Check browser console for errors

## Next Steps

After deployment:
1. ✅ Test the function URL
2. ✅ Configure in admin panel
3. ✅ Click "⚡ Live Sync" to test
4. ✅ New subscribers will appear immediately!

