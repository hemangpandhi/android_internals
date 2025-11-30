# EmailJS API Setup Guide

## Understanding EmailJS Credentials

EmailJS uses different credentials for different purposes:

### 1. **Public Key** (for client-side EmailJS)
- Used in `config.js` for client-side email sending
- Found in: EmailJS Dashboard → Account → General → **Public Key**
- Example: `LMsUX_rrpIYPFa76a`
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
   - Value: Your **User ID** (usually same as Public Key)
   - Location: EmailJS Dashboard → Account → General → **User ID**
   - **Important**: Use the User ID, not the Public Key if they're different
   - Example: `LMsUX_rrpIYPFa76a`

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

2. **Check User ID:**
   ```bash
   # In EmailJS Dashboard → Account → General
   # Copy the User ID (not Public Key if different)
   ```

3. **Test API Call:**
   ```bash
   curl -H "Authorization: Bearer YOUR_PRIVATE_KEY" \
        "https://api.emailjs.com/api/v1.0/contacts?user_id=YOUR_USER_ID"
   ```

## Troubleshooting

### Error: "403 - The private key is wrong"

**Possible causes:**
1. Private Key is incorrect → Check EmailJS Dashboard → API Keys
2. User ID is incorrect → Check EmailJS Dashboard → General → User ID
3. Private Key and User ID don't match → Ensure both from same account

**Solution:**
1. Verify Private Key in EmailJS Dashboard → Account → API Keys
2. Verify User ID in EmailJS Dashboard → Account → General
3. Update GitHub Secrets with correct values
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
| Public Key | Account → General → Public Key | (config.js) | Client-side EmailJS |
| Private Key | Account → API Keys → Private Key | `EMAILJS_PRIVATE_KEY` | API Authentication |
| User ID | Account → General → User ID | `EMAILJS_PUBLIC_KEY` | API user_id parameter |
| Service ID | Email Services → Service ID | `EMAILJS_SERVICE_ID` | Service filtering |

**Note**: The workflow uses `EMAILJS_PUBLIC_KEY` secret to store the User ID (confusing name, but it's used for compatibility with existing code).

