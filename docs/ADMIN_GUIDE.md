# Newsletter Admin Panel Guide

## Overview

The newsletter admin panel allows you to manage subscribers and send newsletters. It uses GitHub SSO for secure authentication.

## Access

**URL:** https://www.hemangpandhi.com/newsletter-admin.html

**Authentication:** Sign in with GitHub (only authorized users)

## Features

### 1. Subscriber Management

#### Import Subscribers from EmailJS

1. **Export from EmailJS:**
   - Go to: https://dashboard.emailjs.com/admin/integration
   - Click **"Contacts"** tab
   - Click **"Export"** or **"Download CSV"**
   - Save the CSV file

2. **Import in Admin Panel:**
   - Click **"📥 Import from EmailJS CSV"** button
   - Select the CSV file
   - Click **"📥 Import CSV"**
   - Subscribers are loaded immediately!

#### Add Subscriber Manually

1. Click **"➕ Add Subscriber"** button
2. Enter email and name
3. Click **"Add"**
4. Subscriber is added immediately

#### Manage Subscribers

- **Select All / Deselect All:** Select subscribers for bulk operations
- **Refresh:** Reload subscriber list from cache
- **Download JSON:** Download subscriber list as JSON file
- **Remove:** Click 🗑️ next to subscriber to remove

### 2. Send Newsletter

1. **Select Article:**
   - Choose an article from the newsletter queue
   - Or create a new newsletter

2. **Select Recipients:**
   - Select individual subscribers
   - Or select all

3. **Send:**
   - Click **"📧 Send Newsletter"** button
   - Newsletter is sent via EmailJS

## How It Works

### Subscriber Storage

- Subscribers are stored in **localStorage** (browser storage)
- Data persists across sessions
- Import CSV to update subscriber list

### Authentication

- Uses **GitHub SSO** (OAuth)
- Only authorized GitHub users can access
- Session lasts 24 hours

### Newsletter Sending

- Uses **EmailJS** to send emails
- Templates configured in EmailJS Dashboard
- Sends to selected subscribers

## Troubleshooting

### No Subscribers Showing

**Solution:** Import CSV from EmailJS
1. Export CSV from EmailJS Dashboard
2. Click "📥 Import from EmailJS CSV" in admin panel
3. Select and import the CSV file

### Can't Sign In

**Solution:** Check GitHub OAuth setup
1. Verify GitHub OAuth app is configured
2. Check callback URL matches Vercel function
3. Contact administrator if issues persist

### Newsletter Not Sending

**Solution:** Check EmailJS configuration
1. Verify EmailJS templates are configured
2. Check EmailJS service is active
3. Verify subscriber emails are valid

## Best Practices

1. **Regular Imports:** Import CSV weekly/monthly to keep subscriber list updated
2. **Backup:** Download JSON regularly to backup subscriber list
3. **Test First:** Send test newsletter to yourself before sending to all subscribers
4. **Keep EmailJS Updated:** Export fresh CSV from EmailJS before major sends

## Support

For issues or questions:
- Check EmailJS Dashboard for email delivery status
- Review browser console (F12) for errors
- Contact administrator for access issues

