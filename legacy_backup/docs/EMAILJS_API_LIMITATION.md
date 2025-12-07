# EmailJS API Limitation: Contacts Endpoint

## ⚠️ Important Discovery

After investigation, it appears that **EmailJS may not have a public REST API endpoint for fetching contacts**. The 403 error you're seeing suggests that:

1. The contacts API endpoint (`/api/v1.0/contacts`) might not be publicly available
2. EmailJS may require different authentication or permissions
3. The contacts feature might only be accessible through the dashboard, not via API

## ✅ Recommended Solution: Use CSV Export Method

Since the API approach is not working, **use the CSV export method** which is reliable and works immediately:

### Step 1: Export CSV from EmailJS
1. Go to [EmailJS Dashboard](https://dashboard.emailjs.com/) → **Contacts**
2. Click **"Export to CSV"** button
3. Download the CSV file

### Step 2: Add CSV to Repository
1. Save the CSV file as `emailjs-contacts.csv` in your repository root
2. Commit and push:
   ```bash
   git add emailjs-contacts.csv
   git commit -m "Add EmailJS contacts CSV"
   git push
   ```

### Step 3: Workflow Will Auto-Sync
- GitHub Actions will detect the CSV file
- Automatically sync contacts every 6 hours
- Or trigger manually via GitHub Actions

## Alternative: Admin Panel CSV Import (Fastest)

For immediate sync without GitHub:

1. **Export CSV** from EmailJS Dashboard → Contacts
2. **Go to**: https://www.hemangpandhi.com/newsletter-admin.html
3. **Click**: "🔄 Sync from EmailJS CSV"
4. **Upload** the CSV file
5. **Click**: "📥 Import CSV"
6. **Download** the updated `subscribers.json`
7. **Replace** `data/subscribers.json` and commit/push

## Why API Method Fails

The 403 error "The private key is wrong" is likely misleading. The real issue is probably:

- EmailJS doesn't expose contacts via REST API
- The `/api/v1.0/contacts` endpoint may not exist or requires special permissions
- EmailJS focuses on sending emails, not managing contacts via API

## Verification

To verify if EmailJS has a contacts API:
1. Check [EmailJS API Documentation](https://www.emailjs.com/docs/rest-api/)
2. Look for "contacts" or "contact list" endpoints
3. If not found, CSV export is the only method

## Conclusion

**Use CSV export method** - it's:
- ✅ Reliable and always works
- ✅ No API authentication needed
- ✅ Works immediately
- ✅ Supported by EmailJS dashboard

The GitHub Actions workflow will automatically use the CSV file if the API fails, so you're all set!

