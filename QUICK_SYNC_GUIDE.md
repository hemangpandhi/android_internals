# Quick Guide: See New Subscriber Immediately

## When a New Subscriber Subscribes

### Step 1: Check EmailJS Dashboard (Source of Truth)
1. Go to [EmailJS Dashboard](https://dashboard.emailjs.com/)
2. Navigate to **Contacts** section
3. You should see the new subscriber there
4. **This is your single source of truth!**

### Step 2: Sync to Your Website (Choose One Method)

#### Method A: Quick Sync via Admin Panel (Recommended - Immediate)
1. Go to your website: `https://www.hemangpandhi.com/newsletter-admin.html`
2. Click **"🔄 Sync from EmailJS"** button
3. Export CSV from EmailJS Dashboard → Contacts → Export to CSV
4. Upload the CSV file in the admin panel
5. Click **"📥 Import CSV"**
6. The subscriber will appear immediately!

#### Method B: Update CSV File in Repository (For Auto-Sync)
1. Export CSV from EmailJS Dashboard → Contacts
2. Save as `emailjs-contacts.csv` in repository root
3. Commit and push:
   ```bash
   git add emailjs-contacts.csv
   git commit -m "Update EmailJS contacts"
   git push
   ```
4. GitHub Actions will sync automatically (or wait for next 6-hour sync)

#### Method C: Wait for Auto-Sync
- GitHub Actions syncs every 6 hours automatically
- New subscribers will appear after next sync

## Troubleshooting

### Subscriber not in EmailJS Contacts?
- Check if "Save Contacts" is enabled in your EmailJS template
- Go to EmailJS Dashboard → Templates → Contact Template → Contacts tab
- Make sure "Save Contacts" checkbox is enabled
- Verify the email was actually sent (check Email History)

### Subscriber in EmailJS but not showing on website?
- Export CSV from EmailJS and import via admin panel
- Or update `emailjs-contacts.csv` in repository and push
- Check browser console for errors
- Try refreshing the admin panel

## Quick Checklist

- [ ] Check EmailJS Dashboard → Contacts (should see new subscriber)
- [ ] Verify "Save Contacts" is enabled in template
- [ ] Export CSV from EmailJS
- [ ] Import CSV via admin panel OR update emailjs-contacts.csv in repo
- [ ] Refresh admin panel to see new subscriber

