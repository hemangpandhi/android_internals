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

