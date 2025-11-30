# Import EmailJS Contacts CSV Guide

## Quick Import Steps

You have the CSV file at: `~/Downloads/contacts.csv`

### Option 1: Import via Admin Panel (Recommended)

1. **Open the Newsletter Admin Panel:**
   - Go to: https://www.hemangpandhi.com/newsletter-admin.html
   - Or locally: http://localhost:8080/newsletter-admin.html

2. **Click "🔄 Sync from EmailJS CSV" button**

3. **Upload the CSV file:**
   - Click the file input
   - Navigate to your Downloads folder
   - Select `contacts.csv`
   - Click "📥 Import CSV"

4. **Review the results:**
   - The admin panel will show:
     - How many new subscribers were imported
     - How many existing subscribers were updated
     - How many were removed (not in EmailJS)
     - Total active subscribers

5. **Download the updated file:**
   - The updated `subscribers.json` will automatically download
   - Commit and push it to update the live site

### Option 2: Command Line Import (Alternative)

If you prefer command line:

```bash
# Copy CSV to project directory
cp ~/Downloads/contacts.csv emailjs-contacts.csv

# Run the sync script
node tools/sync-emailjs-contacts.js emailjs-contacts.csv

# The script will update data/subscribers.json automatically
```

## What Happens During Import

1. **Parses CSV** - Reads email and name columns
2. **Validates emails** - Checks email format
3. **Adds new subscribers** - Subscribers not in current list
4. **Updates existing** - Updates name/date for existing subscribers
5. **Marks inactive** - Subscribers in current list but NOT in CSV are marked inactive
6. **Downloads updated JSON** - Creates updated `subscribers.json` file

## After Import

1. **Commit the updated subscribers.json:**
   ```bash
   git add data/subscribers.json
   git commit -m "Sync subscribers from EmailJS CSV"
   git push origin master
   ```

2. **Verify on live site:**
   - Check https://www.hemangpandhi.com/newsletter-admin.html
   - Should show all active subscribers from EmailJS

## Troubleshooting

### "CSV file appears to be empty"
- Check that the CSV has at least a header row and one data row
- Verify the file isn't corrupted

### "CSV file must contain an email column"
- The CSV must have a column with "email" in the name
- Common column names: `Email`, `contact_email`, `E-mail`

### "Skipped: X invalid"
- Some rows may have invalid email formats
- Check browser console (F12) for details on which emails were skipped

