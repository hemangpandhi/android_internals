# Fix 403 Error: "The private key is wrong"

## Step-by-Step Solution

### Step 1: Get Your Private Key

1. Go to: **https://dashboard.emailjs.com/admin/integration**
2. Look for **"Private Key"** or **"Access Token"**
3. **Copy the ENTIRE key** (it's usually a long string, 40+ characters)
4. **Important**: 
   - No spaces before or after
   - No quotes around it
   - Copy the complete key

### Step 2: Verify Your Public Key

Your Public Key is: `ZV2P-4FW2xmtKUGWl` (from config.js)

Verify this matches what you see in:
- EmailJS Dashboard → Account → General → Public Key

### Step 3: Set Environment Variables Correctly

**Option A: In the same terminal session**

```bash
# Set the private key (replace with YOUR actual key)
export EMAILJS_PRIVATE_KEY="paste_your_private_key_here"

# Set the user ID (your public key)
export EMAILJS_USER_ID="ZV2P-4FW2xmtKUGWl"

# Verify they're set
echo "Private key length: ${#EMAILJS_PRIVATE_KEY}"
echo "User ID: $EMAILJS_USER_ID"
```

**Option B: One-line test (no export needed)**

```bash
EMAILJS_PRIVATE_KEY="your_key_here" EMAILJS_USER_ID="ZV2P-4FW2xmtKUGWl" node test-emailjs-api.js
```

### Step 4: Run Enhanced Debug Script

```bash
EMAILJS_PRIVATE_KEY="your_key" EMAILJS_USER_ID="ZV2P-4FW2xmtKUGWl" node debug-emailjs-api.js
```

This will test multiple API endpoints and show detailed error messages.

## Common Mistakes

### ❌ Mistake 1: Extra Spaces
```bash
# WRONG
export EMAILJS_PRIVATE_KEY=" your_key_here "
# RIGHT
export EMAILJS_PRIVATE_KEY="your_key_here"
```

### ❌ Mistake 2: Quotes in the Key
```bash
# WRONG - if the key itself has quotes
export EMAILJS_PRIVATE_KEY="'your_key'"
# RIGHT
export EMAILJS_PRIVATE_KEY="your_key"
```

### ❌ Mistake 3: Using Public Key as Private Key
```bash
# WRONG - these are DIFFERENT keys!
export EMAILJS_PRIVATE_KEY="ZV2P-4FW2xmtKUGWl"  # This is your PUBLIC key
# RIGHT - use the PRIVATE key from EmailJS Dashboard
```

### ❌ Mistake 4: Keys from Different Accounts
- Private Key and Public Key must be from the **SAME EmailJS account**
- If you have multiple accounts, make sure both keys are from the same one

## Alternative: EmailJS May Not Support Contacts API

If you continue getting 403 errors even with correct credentials, **EmailJS may not support the Contacts API endpoint** for your account type.

### Solution: Use CSV Export Instead

1. Go to EmailJS Dashboard → Contacts
2. Export contacts as CSV
3. Use the CSV import feature in the admin panel

This is already implemented and works without API access!

## Quick Test Command

Replace `YOUR_PRIVATE_KEY` with your actual private key:

```bash
EMAILJS_PRIVATE_KEY="YOUR_PRIVATE_KEY" EMAILJS_USER_ID="ZV2P-4FW2xmtKUGWl" node debug-emailjs-api.js
```

## Still Not Working?

1. **Regenerate your Private Key:**
   - EmailJS Dashboard → Account → API Keys
   - Generate a new Private Key
   - Try again with the new key

2. **Check EmailJS Account Type:**
   - Some free accounts may not have API access
   - Check your EmailJS plan/limits

3. **Contact EmailJS Support:**
   - They can verify if your account has API access enabled
   - They can check if the endpoint is available for your account

