# Immediate Sync Guide - See New Subscribers Right Away

## Problem
You see only 1 subscriber in `subscribers.json`, but EmailJS has 2 subscribers. The automatic sync runs every 6 hours, so new subscribers won't appear immediately.

## Solution: Manual Sync (Takes 2 Minutes)

### Option A: CSV Import via Admin Panel (Fastest - Recommended)

1. **Export from EmailJS:**
   - Go to [EmailJS Dashboard](https://dashboard.emailjs.com/) → **Contacts**
   - Click **"Export to CSV"** button
   - Save the file (usually named `contacts.csv`)

2. **Import via Admin Panel:**
   - Go to: `https://www.hemangpandhi.com/newsletter-admin.html`
   - Click **"🔄 Sync from EmailJS CSV"** button
   - Click **"Choose File"** and select the CSV you downloaded
   - Click **"📥 Import CSV"** button
   - The page will automatically download updated `subscribers.json`

3. **Upload to Repository:**
   - Replace `/data/subscribers.json` with the downloaded file
   - Or commit and push the file to trigger auto-deployment

### Option B: Trigger GitHub Actions Manually

1. **Go to GitHub:**
   - Navigate to: `https://github.com/hemangpandhi/android_internals/actions`
   - Find workflow: **"Sync EmailJS Contacts"**
   - Click **"Run workflow"** button (top right)
   - Click **"Run workflow"** again to confirm

2. **Wait for Completion:**
   - The workflow will:
     - Fetch contacts from EmailJS API (if credentials are set)
     - Or use CSV file if available
     - Update `subscribers.json`
     - Auto-commit and deploy

3. **Check Results:**
   - After ~2-3 minutes, refresh: `https://www.hemangpandhi.com/data/subscribers.json`
   - You should see both subscribers!

### Option C: Update CSV in Repository

1. **Export CSV from EmailJS** (same as Option A, step 1)

2. **Add to Repository:**
   ```bash
   # Save CSV as emailjs-contacts.csv in repository root
   git add emailjs-contacts.csv
   git commit -m "Update EmailJS contacts CSV"
   git push
   ```

3. **Auto-Sync:**
   - GitHub Actions will detect the CSV file
   - Automatically sync on next push
   - Or trigger manually via GitHub Actions

## Verify Sync Worked

After syncing, check:
- `https://www.hemangpandhi.com/data/subscribers.json` - Should show 2 subscribers
- `https://www.hemangpandhi.com/newsletter-admin.html` - Should display both subscribers

## Why This Happens

- **EmailJS** saves contacts automatically when "Save Contacts" is enabled
- **GitHub Actions** syncs every 6 hours automatically
- **New subscribers** won't appear until sync runs
- **Manual sync** lets you see them immediately!

## Prevent This in Future

1. **Set up EmailJS API credentials** in GitHub Secrets:
   - `EMAILJS_PRIVATE_KEY` (from EmailJS Dashboard → Account → API Keys)
   - `EMAILJS_PUBLIC_KEY` (your public key)
   - This enables automatic API sync every 6 hours

2. **Or** keep `emailjs-contacts.csv` updated in repository for automatic CSV sync

