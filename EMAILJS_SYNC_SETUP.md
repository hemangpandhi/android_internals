# EmailJS Subscriber Sync Setup Guide

## Overview
This guide explains how to automatically sync subscribers from EmailJS to your newsletter admin panel, eliminating the need for manual entry.

## Method 1: Enable EmailJS Contact Collection (Recommended)

### Important Note
**EmailJS Contacts are NOT manually created** - they are automatically collected when emails are sent through templates that have "Save Contacts" enabled. You cannot manually add contacts in the EmailJS dashboard.

### Step 1: Enable Contact Collection in EmailJS Templates

You need to enable contact collection in **BOTH** templates:

#### A. Contact Form Template (for newsletter subscriptions)
1. Go to your [EmailJS Dashboard](https://dashboard.emailjs.com/)
2. Navigate to **Email Templates** → Select your **Contact Template** (`template_7bzhk1x` - "Contact Us")
3. Click on the **Contacts** tab
4. **Enable the "Save Contacts" checkbox**
5. Configure the contact fields with these exact values:
   - **Contact Email** (required): `{{from_email}}` or `{{email}}`
     - This captures the subscriber's email address
   - **Contact Name**: `{{from_name}}` or `{{name}}`
     - This captures the subscriber's name (if provided)
   - **Contact Address**: Leave empty (not used for newsletter subscriptions)
   - **Contact Phone**: Leave empty (not used for newsletter subscriptions)
6. Click **"Save"** button (top right)

#### B. Newsletter Template (for sending newsletters)
1. Navigate to **Email Templates** → Select your **Newsletter Template** (`template_uwh1kil`)
2. Click on the **Contacts** tab
3. Enable **"Save Contacts"** option
4. Configure the contact fields:
   - **Contact Email**: Map to `{{to_email}}` or `{{email}}` (the recipient's email)
   - **Contact Name**: Map to `{{to_name}}` or `{{name}}` (optional)
5. Save the template

### Step 2: Test Contact Collection
1. Go to your website and subscribe to the newsletter with a test email
2. Check EmailJS Dashboard → **Email History** to confirm the email was sent
3. Go to **Contacts** section - the contact should appear automatically
4. If contacts don't appear, verify:
   - "Save Contacts" is enabled in the template
   - The email field mapping is correct
   - The email was actually sent (check Email History)

### Step 2: Sync Contacts to Admin Panel
1. Go to EmailJS Dashboard → **Contacts** section
2. Filter contacts by your template (if needed)
3. Click **"Export to CSV"** button
4. In your newsletter admin panel (`/newsletter-admin.html`):
   - Click **"🔄 Sync from EmailJS"** button
   - Upload the exported CSV file
   - Click **"📥 Import CSV"**
   - The updated `subscribers.json` will be downloaded automatically

## Method 2: Automatic Sync via Script (Recommended for Automation)

### Option A: Manual Sync Script

Use the sync script to automatically sync contacts from EmailJS CSV export:

```bash
# Sync from CSV file
node tools/sync-emailjs-contacts.js path/to/emailjs-contacts.csv

# Or use npm script
npm run sync:emailjs path/to/emailjs-contacts.csv
```

**Steps:**
1. Export contacts from EmailJS Dashboard → Contacts → Export to CSV
2. Save the CSV file (e.g., `emailjs-contacts.csv`)
3. Run the sync script with the CSV file path
4. Subscribers will be automatically synced to `subscribers.json`

### Option B: GitHub Actions Automated Sync

A GitHub Actions workflow is set up to automatically sync contacts daily:

1. **Setup GitHub Secrets:**
   - Go to your repository → Settings → Secrets and variables → Actions
   - Add these secrets:
     - `EMAILJS_PRIVATE_KEY` - Your EmailJS private key (optional, for future API use)
     - `EMAILJS_SERVICE_ID` - Your EmailJS service ID

2. **Manual CSV Method (Current):**
   - Export contacts from EmailJS Dashboard as CSV
   - Save as `emailjs-contacts.csv` in repository root
   - GitHub Actions will automatically sync daily

3. **Workflow Details:**
   - Runs daily at 2 AM UTC
   - Can be manually triggered from Actions tab
   - Automatically commits updated `subscribers.json`

### Option C: API Endpoint Sync

If you're running the API server locally:

```bash
# Start API server
npm run api

# Sync via API endpoint
curl -X POST http://localhost:3001/api/sync-emailjs \
  -H "Content-Type: application/json" \
  -d '{"csvPath": "path/to/emailjs-contacts.csv"}'
```

### Benefits of Automatic Sync:
- ✅ No manual CSV import needed
- ✅ Runs automatically on schedule
- ✅ Keeps subscribers.json always up-to-date
- ✅ Works with static site deployment

## Current Workflow

### When Someone Subscribes:
1. User fills out newsletter form on website
2. EmailJS sends notification email to owner
3. EmailJS automatically saves contact (if contact collection is enabled)
4. Owner exports CSV from EmailJS and imports to admin panel

### Benefits:
- ✅ No manual entry needed
- ✅ All subscribers automatically collected in EmailJS
- ✅ Easy to sync with admin panel via CSV import
- ✅ Works with static site (no backend required)

## Troubleshooting

### Subscribers not appearing in EmailJS Contacts:
- **Important**: Contacts are NOT manually created - they appear automatically when emails are sent
- Check that "Save Contacts" / "Collecting contacts" is enabled in template settings
- Verify the email field is correctly mapped in template (e.g., `{{from_email}}` or `{{to_email}}`)
- Ensure the template is actually being used (check Email History to see if emails were sent)
- Try subscribing with a test email and check if contact appears after email is sent
- Make sure you're looking at the correct template's contacts (filter by template in Contacts page)

### CSV Import Issues:
- Ensure CSV has an "email" column
- Check CSV format (comma-separated, quoted strings)
- Verify email addresses are valid

## Next Steps

1. Enable contact collection in your EmailJS template
2. Test by subscribing with a test email
3. Export CSV from EmailJS Contacts
4. Import CSV in newsletter admin panel
5. Repeat periodically to keep subscribers in sync

