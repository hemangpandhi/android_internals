# EmailJS API Setup Guide

## Understanding EmailJS Credentials

EmailJS uses different credentials for different purposes:

### 1. **Public Key** (for client-side EmailJS)
- Used in `config.js` for client-side email sending
- Found in: EmailJS Dashboard → Account → General → **Public Key**
- Example: `YOUR_PUBLIC_KEY_HERE`
- Used for: `emailjs.init(publicKey)` in browser

### 2. **Private Key** (for API access)
- Used for server-side API calls
- Found in: EmailJS Dashboard → Account → **API Keys** → **Private Key**
- Also called "Access Token"
- Used for: `Authorization: Bearer {private_key}` header

### 3. **User ID** (for API calls)
- Used as `user_id` parameter in API requests
- **Important**: This is typically the **same as your Public Key**
- But verify in: EmailJS Dashboard → Account → General → **User ID**
- Used for: `/api/v1.0/contacts?user_id={user_id}`

## Common 403 Error: "The private key is wrong"

This error can occur for several reasons:

### Issue 1: Wrong Private Key
- **Check**: EmailJS Dashboard → Account → API Keys → Private Key
- **Solution**: Copy the exact Private Key (Access Token) to GitHub Secrets

### Issue 2: Wrong User ID
- **Check**: EmailJS Dashboard → Account → General → User ID
- **Solution**: Use the User ID (not Public Key) in `EMAILJS_PUBLIC_KEY` secret
- **Note**: In most cases, User ID = Public Key, but verify this

### Issue 3: Private Key and User ID Mismatch
- The Private Key must belong to the same account as the User ID
- **Solution**: Ensure both are from the same EmailJS account

## GitHub Secrets Configuration

Set these secrets in: `https://github.com/hemangpandhi/android_internals/settings/secrets/actions`

### Required Secrets:

1. **`EMAILJS_PRIVATE_KEY`**
   - Value: Your Private Key (Access Token)
   - Location: EmailJS Dashboard → Account → API Keys → Private Key
   - Example: `abc123def456...` (long string)

2. **`EMAILJS_PUBLIC_KEY`** (used as User ID)
   - Value: Your **Public Key** (this IS the User ID - they're the same)
   - Location: EmailJS Dashboard → Account → General → **Public Key**
   - **Important**: In EmailJS, User ID = Public Key (same value)
   - Example: `YOUR_PUBLIC_KEY_HERE`

3. **`EMAILJS_SERVICE_ID`** (optional, for filtering)
   - Value: Your Service ID
   - Location: EmailJS Dashboard → Email Services → Your Service → Service ID
   - Example: `service_dygzcoh`

## How to Find Your User ID

1. Go to [EmailJS Dashboard](https://dashboard.emailjs.com/)
2. Click **Account** (top right)
3. Go to **General** tab
4. Look for **User ID** field
5. Copy this value (it's usually the same as Public Key, but verify)

## Verification Steps

1. **Check Private Key:**
   ```bash
   # In EmailJS Dashboard → Account → API Keys
   # Copy the Private Key (Access Token)
   ```

2. **Check Public Key (User ID):**
   ```bash
   # In EmailJS Dashboard → Account → General
   # Copy the Public Key (this IS your User ID - they're the same)
   ```

3. **Test API Call:**
   ```bash
   # Use Public Key as user_id (they are the same)
   curl -H "Authorization: Bearer YOUR_PRIVATE_KEY" \
        "https://api.emailjs.com/api/v1.0/contacts?user_id=YOUR_PUBLIC_KEY"
   ```

## Troubleshooting

### Error: "403 - The private key is wrong"

**Possible causes:**
1. Private Key is incorrect → Check EmailJS Dashboard → Account → API Keys → Private Key
2. Public Key (User ID) is incorrect → Check EmailJS Dashboard → Account → General → Public Key
3. Private Key and Public Key don't match → Ensure both from same account

**Solution:**
1. Verify Private Key in EmailJS Dashboard → Account → API Keys → Private Key (Access Token)
2. Verify Public Key in EmailJS Dashboard → Account → General → Public Key (this is your User ID)
3. Update GitHub Secrets:
   - `EMAILJS_PRIVATE_KEY` = Private Key from API Keys
   - `EMAILJS_PUBLIC_KEY` = Public Key from General (this is used as User ID)
4. Re-run the workflow

### Error: "404 - Contacts API endpoint not found"

**Possible causes:**
1. EmailJS API doesn't support contacts endpoint
2. API endpoint changed

**Solution:**
- Use CSV export method instead
- Export from EmailJS Dashboard → Contacts → Export to CSV
- Add `emailjs-contacts.csv` to repository

## Alternative: Use CSV Method

If API authentication continues to fail:

1. **Export CSV from EmailJS:**
   - Go to EmailJS Dashboard → Contacts
   - Click "Export to CSV"
   - Download the file

2. **Add to Repository:**
   - Save as `emailjs-contacts.csv` in repository root
   - Commit and push

3. **Workflow will use CSV:**
   - GitHub Actions will automatically detect CSV file
   - Sync will work without API credentials

## Quick Reference

| Credential | Location in EmailJS | GitHub Secret Name | Used For |
|------------|-------------------|-------------------|----------|
| Public Key | Account → General → Public Key | `EMAILJS_PUBLIC_KEY` | Client-side EmailJS + API user_id |
| Private Key | Account → API Keys → Private Key | `EMAILJS_PRIVATE_KEY` | API Authentication |
| Service ID | Email Services → Service ID | `EMAILJS_SERVICE_ID` | Service filtering |

**Important Note**: 
- In EmailJS, **User ID = Public Key** (they are the same value)
- There is no separate "User ID" field
- Use your **Public Key** value for both client-side EmailJS and API `user_id` parameter
- The workflow uses `EMAILJS_PUBLIC_KEY` secret for both purposes

