# How to Manually Trigger EmailJS Sync Workflow

## Quick Steps (2 minutes)

### Step 1: Go to GitHub Actions
1. Navigate to: **https://github.com/hemangpandhi/android_internals/actions**
2. You should see the "Actions" tab (already selected)

### Step 2: Find the Sync Workflow
1. In the **left sidebar**, look for **"All workflows"** section
2. Find and click on: **`.github/workflows/sync-emailjs.yml`**
   - This is the "Sync EmailJS Contacts" workflow

### Step 3: Trigger the Workflow
1. You'll see a list of previous workflow runs
2. Look for a **"Run workflow"** button on the **right side** (near the top)
3. Click **"Run workflow"** dropdown button
4. Select the branch: **`master`** (should be default)
5. Click the green **"Run workflow"** button

### Step 4: Monitor Progress
1. The workflow will start running immediately
2. Click on the new workflow run to see progress
3. Watch the steps:
   - ✅ Checkout repository
   - ✅ Setup Node.js
   - ✅ Install dependencies
   - ✅ Try EmailJS API Sync (Automatic)
   - ✅ Fallback: Sync from CSV (if API failed)
   - ✅ Commit and push changes

### Step 5: Verify Results
1. Wait 2-3 minutes for completion
2. Check: **https://www.hemangpandhi.com/data/subscribers.json**
3. You should see all subscribers from EmailJS!

## What the Workflow Does

1. **Tries EmailJS API first** (if credentials are set in GitHub Secrets)
   - Fetches contacts directly from EmailJS API
   - Updates `subscribers.json` automatically

2. **Falls back to CSV method** (if API not available)
   - Looks for `emailjs-contacts.csv` in repository
   - Syncs from CSV file if found

3. **Commits and deploys automatically**
   - Updates `data/subscribers.json`
   - Updates `build/data/subscribers.json`
   - Commits with message: "Auto-sync: Update subscribers from EmailJS contacts [skip ci]"
   - Pushes to repository
   - GitHub Pages auto-deploys

## Troubleshooting

### Workflow Not Showing "Run workflow" Button?
- Make sure you're on the workflow's page (click `.github/workflows/sync-emailjs.yml` in sidebar)
- Check that you have write access to the repository
- The workflow must have `workflow_dispatch:` enabled (it does!)

### Workflow Fails?
- Check the workflow logs for error messages
- Common issues:
  - **API credentials not set**: Set `EMAILJS_PRIVATE_KEY` and `EMAILJS_PUBLIC_KEY` in GitHub Secrets
  - **No CSV file**: Add `emailjs-contacts.csv` to repository root
  - **Node.js errors**: Check the "Install dependencies" step

### How to Set Up API Credentials (Optional - for automatic sync)
1. Go to: **https://github.com/hemangpandhi/android_internals/settings/secrets/actions**
2. Click **"New repository secret"**
3. Add:
   - **Name**: `EMAILJS_PRIVATE_KEY`
   - **Value**: Your EmailJS Private Key (from EmailJS Dashboard → Account → API Keys)
4. Add another secret:
   - **Name**: `EMAILJS_PUBLIC_KEY`
   - **Value**: Your EmailJS Public Key (User ID)
5. Save both secrets
6. Now the workflow will automatically sync from EmailJS API every 6 hours!

## Alternative: CSV Method (If API Not Set Up)

If you don't have API credentials set up:

1. **Export CSV from EmailJS:**
   - Go to EmailJS Dashboard → Contacts
   - Click "Export to CSV"
   - Download the file

2. **Add to Repository:**
   - Save as `emailjs-contacts.csv` in repository root
   - Commit and push:
     ```bash
     git add emailjs-contacts.csv
     git commit -m "Add EmailJS contacts CSV"
     git push
     ```

3. **Trigger Workflow:**
   - Follow steps above to manually trigger
   - Or wait for automatic sync (every 6 hours)

## Expected Results

After successful sync:
- ✅ `data/subscribers.json` updated with all EmailJS contacts
- ✅ `build/data/subscribers.json` updated
- ✅ Changes committed and pushed automatically
- ✅ Website shows all subscribers at: `https://www.hemangpandhi.com/newsletter-admin.html`

