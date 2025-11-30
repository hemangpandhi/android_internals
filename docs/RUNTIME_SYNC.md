# Runtime Subscriber Sync - No Recompilation Needed

## Overview

The newsletter admin panel now supports **runtime loading** of subscribers directly from EmailJS, eliminating the need for recompilation when new subscribers are added.

## How It Works

1. **On Page Load**: Admin panel tries to fetch subscribers from EmailJS API (via proxy)
2. **Fallback**: If API is unavailable, loads from static `subscribers.json` file
3. **Caching**: Results are cached in browser localStorage for 5 minutes
4. **Live Sync**: "⚡ Live Sync" button forces immediate refresh from EmailJS

## Setup Options

### Option 1: Serverless Function (Recommended for Runtime Access)

Deploy a serverless function to proxy EmailJS API calls. This allows the admin panel to fetch subscribers at runtime without recompilation.

#### Step 1: Deploy Serverless Function

The function code is already provided in `api/emailjs-contacts.js`. Deploy it to:

- **Vercel**: Create `api/emailjs-contacts.js` and deploy
- **Netlify**: Create `netlify/functions/emailjs-contacts.js` and deploy
- **Cloudflare Workers**: Adapt the code for Cloudflare Workers

#### Step 2: Set Environment Variables

In your serverless platform, set:
- `EMAILJS_PRIVATE_KEY`: Your EmailJS private key
- `EMAILJS_USER_ID`: Your EmailJS public key (serves as User ID)

#### Step 3: Configure Admin Panel

1. Open `newsletter-admin.html`
2. Click "🔌 Sync from EmailJS API" button
3. Enter your serverless function URL (e.g., `https://your-function.vercel.app/api/emailjs-contacts`)
4. The URL is saved in localStorage and used automatically

### Option 2: GitHub Actions (Automatic Sync)

GitHub Actions automatically syncs every 6 hours. This still requires a commit, but it's fully automatic.

**Setup:**
1. Go to GitHub → Settings → Secrets → Actions
2. Add `EMAILJS_PRIVATE_KEY` and `EMAILJS_PUBLIC_KEY`
3. The workflow runs automatically every 6 hours

**Manual Trigger:**
- Go to GitHub → Actions → "Sync EmailJS Contacts" → "Run workflow"

### Option 3: CSV Import (Immediate Manual Sync)

For immediate sync without setup:

1. Export CSV from EmailJS Dashboard → Contacts
2. Go to newsletter admin panel
3. Click "🔄 Sync from EmailJS CSV"
4. Upload CSV file
5. Download updated `subscribers.json`
6. Commit and push (one-time manual step)

## Using Runtime Sync

### Automatic Loading

When you open the admin panel:
1. It first checks localStorage cache (if < 5 minutes old)
2. Then tries EmailJS API proxy (if configured)
3. Falls back to static JSON file

### Manual Refresh

- **🔄 Refresh**: Reloads from current source (respects cache)
- **⚡ Live Sync**: Forces immediate refresh from EmailJS API (bypasses cache)

### API Proxy Button

Click "🔌 Sync from EmailJS API" to:
- Configure API proxy URL (first time)
- Manually trigger sync from EmailJS
- See real-time subscriber count

## Benefits

✅ **No Recompilation**: New subscribers appear immediately  
✅ **Automatic**: Works in background every 6 hours (GitHub Actions)  
✅ **Manual Control**: Force refresh anytime with "⚡ Live Sync"  
✅ **Offline Support**: Caches results for offline viewing  
✅ **Fallback**: Always works even if API is unavailable  

## Troubleshooting

### "No API proxy URL configured"

**Solution**: Set up serverless function (Option 1) or use CSV import (Option 3)

### "API sync failed: 403"

**Solution**: Check that `EMAILJS_PRIVATE_KEY` and `EMAILJS_USER_ID` are correct in serverless function environment variables

### "No subscribers found"

**Solution**: 
1. Check EmailJS Dashboard → Contacts to verify subscribers exist
2. Ensure "Save Contacts" is enabled in EmailJS template
3. Try CSV import method as fallback

### Cache showing old data

**Solution**: Click "⚡ Live Sync" to force refresh from EmailJS API

## Technical Details

- **Cache Duration**: 5 minutes
- **API Endpoint**: EmailJS `/api/v1.0/contacts`
- **Storage**: Browser localStorage (persists across sessions)
- **Fallback**: Static `subscribers.json` file

## Next Steps

1. **For Runtime Access**: Set up serverless function (Option 1)
2. **For Automatic Sync**: Configure GitHub Actions (Option 2)
3. **For Manual Control**: Use CSV import (Option 3)

All three methods work together - the admin panel will use the best available source automatically!

