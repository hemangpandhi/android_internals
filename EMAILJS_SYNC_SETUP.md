# EmailJS Subscriber Sync Setup Guide

## Overview
This guide explains how to automatically sync subscribers from EmailJS to your newsletter admin panel, eliminating the need for manual entry.

## Method 1: Enable EmailJS Contact Collection (Recommended)

### Step 1: Enable Contact Collection in EmailJS
1. Go to your [EmailJS Dashboard](https://dashboard.emailjs.com/)
2. Navigate to **Email Templates** → Select your contact form template
3. Click on the **Contacts** tab
4. Enable **"Save Contacts"** option
5. Configure the contact fields:
   - **Contact Email**: Map to `{{email}}` or `{{from_email}}`
   - **Contact Name**: Map to `{{name}}` or `{{from_name}}` (optional)
6. Save the template

### Step 2: Sync Contacts to Admin Panel
1. Go to EmailJS Dashboard → **Contacts** section
2. Filter contacts by your template (if needed)
3. Click **"Export to CSV"** button
4. In your newsletter admin panel (`/newsletter-admin.html`):
   - Click **"🔄 Sync from EmailJS"** button
   - Upload the exported CSV file
   - Click **"📥 Import CSV"**
   - The updated `subscribers.json` will be downloaded automatically

## Method 2: Automatic Sync via API (Advanced)

For automatic real-time sync, you can set up a serverless function or backend API that:
1. Uses EmailJS REST API to fetch contacts
2. Updates `subscribers.json` automatically
3. Can be triggered periodically or via webhook

**Note**: This requires EmailJS Private Key and a backend/serverless function.

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
- Check that "Save Contacts" is enabled in template settings
- Verify the email field is correctly mapped in template
- Ensure the template is being used (check EmailJS logs)

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

