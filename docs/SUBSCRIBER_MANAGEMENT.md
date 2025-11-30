# Subscriber Management - Single Source of Truth

## Overview

**EmailJS is the single source of truth** for all subscribers. The `subscribers.json` file is automatically synced from EmailJS contacts, so you never need to manually update it or recompile.

## How It Works

### 1. **Subscriber Subscribes via Website**
   - User fills out newsletter form on website
   - EmailJS sends notification email to owner
   - **EmailJS automatically saves contact** (if "Save Contacts" is enabled in template)
   - No manual action needed!

### 2. **Automatic Sync (Every 6 Hours)**
   - GitHub Actions workflow runs every 6 hours
   - Exports contacts from EmailJS Dashboard as CSV
   - Syncs to `subscribers.json` automatically
   - Commits and deploys updated file
   - **No recompilation needed!**

### 3. **Manual Sync (On-Demand)**
   - Export CSV from EmailJS Dashboard → Contacts
   - Import via newsletter admin panel
   - Or trigger GitHub Actions workflow manually

## Setup Instructions

### Step 1: Enable EmailJS Contact Collection

1. Go to EmailJS Dashboard → Email Templates
2. Select your **Contact Template** (`template_7bzhk1x`)
3. Go to **Contacts** tab
4. Enable **"Save Contacts"** checkbox
5. Map fields:
   - **Contact Email**: `{{from_email}}`
   - **Contact Name**: `{{from_name}}`
6. Save template

### Step 2: Set Up Automatic Sync

1. **Export CSV from EmailJS:**
   - Go to EmailJS Dashboard → Contacts
   - Click **"Export to CSV"**
   - Save as `emailjs-contacts.csv` in repository root
   - Commit and push the file

2. **GitHub Actions will automatically:**
   - Sync every 6 hours
   - Update `subscribers.json`
   - Deploy changes
   - **No recompilation needed!**

### Step 3: Verify Sync

- Check GitHub Actions → "Sync EmailJS Contacts" workflow
- View commit history for auto-sync commits
- Check newsletter admin panel for updated subscribers

## Workflow

```
New Subscriber
    ↓
Website Form Submission
    ↓
EmailJS Sends Email + Saves Contact (automatic)
    ↓
EmailJS Dashboard → Contacts (source of truth)
    ↓
Export CSV (manual or automated)
    ↓
GitHub Actions Sync (every 6 hours)
    ↓
Update subscribers.json (automatic)
    ↓
Deploy to Production (automatic)
```

## Benefits

✅ **Single Source of Truth**: EmailJS Contacts  
✅ **No Recompilation**: Automatic sync via GitHub Actions  
✅ **No Manual Updates**: Subscribers added automatically  
✅ **Always Up-to-Date**: Synced every 6 hours  
✅ **Works with Static Site**: No backend required  

## Manual Sync Methods

### Option 1: Admin Panel CSV Import
1. Export CSV from EmailJS Dashboard
2. Go to newsletter admin panel
3. Click "Sync from EmailJS"
4. Upload CSV file
5. Download updated `subscribers.json`

### Option 2: GitHub Actions Manual Trigger
1. Go to GitHub Actions tab
2. Select "Sync EmailJS Contacts" workflow
3. Click "Run workflow"
4. Wait for sync to complete

### Option 3: Command Line
```bash
# Export CSV from EmailJS and save as emailjs-contacts.csv
# Then run:
npm run sync:emailjs emailjs-contacts.csv
```

## Future Improvements

- **EmailJS Webhook**: Automatically sync when contact is created (requires backend)
- **EmailJS API Integration**: Direct API access (requires private key + backend)
- **Real-time Sync**: Serverless function to sync on-demand

## Troubleshooting

### Subscribers not appearing:
1. Check EmailJS Dashboard → Contacts (source of truth)
2. Verify "Save Contacts" is enabled in template
3. Check if contact was actually saved in EmailJS
4. Export CSV and verify it contains the subscriber
5. Check GitHub Actions sync workflow logs

### Sync not working:
1. Verify `emailjs-contacts.csv` exists in repository root
2. Check GitHub Actions workflow logs
3. Verify file format is correct CSV
4. Check if workflow is running (every 6 hours)

### File not updating:
1. Check GitHub Actions deployment status
2. Verify file is being committed by workflow
3. Check browser cache (hard refresh)
4. Verify file path in admin panel

