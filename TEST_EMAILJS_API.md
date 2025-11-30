# Test EmailJS API Connection

## Quick Test (Interactive)

Run the interactive test script:

```bash
./test-emailjs-connection.sh
```

This will:
1. ✅ Read your Public Key from `config.js`
2. 🔐 Prompt you for your Private Key (securely)
3. 🧪 Test the API connection
4. ✅ Show you the results

## Manual Test

### Step 1: Get Your Private Key

1. Go to: **https://dashboard.emailjs.com/admin/integration**
2. Find **"Private Key"** or **"Access Token"**
3. Copy the entire key (it's a long string)

### Step 2: Set Environment Variables

```bash
# Set your private key (replace with your actual key)
export EMAILJS_PRIVATE_KEY="your_private_key_here"

# Your public key is already in config.js: ZV2P-4FW2xmtKUGWl
export EMAILJS_USER_ID="ZV2P-4FW2xmtKUGWl"
```

### Step 3: Run the Test

```bash
node test-emailjs-api.js
```

## Expected Output

### ✅ Success:
```
🔌 Testing EmailJS API connection...
   User ID: ZV2P-4FW...

📡 Response Status: 200

✅ Success! Found 2 contact(s)

📋 Contacts:
   1. Newsletter Subscriber <hemang.pandhi@gmail.com>
   2. Newsletter Subscriber <prajaktamirajkar2613@gmail.com>
```

### ❌ Error (403):
```
📡 Response Status: 403

❌ Authentication failed!
   Check that EMAILJS_PRIVATE_KEY is correct
   Check that EMAILJS_USER_ID matches your EmailJS public key

Response: The private key is wrong
```

## Troubleshooting 403 Error

### Issue 1: Wrong Private Key
- **Check**: Go to EmailJS Dashboard → Account → API Keys → Private Key
- **Solution**: Copy the exact Private Key (no extra spaces or quotes)
- **Note**: The Private Key is different from the Public Key

### Issue 2: Keys Don't Match
- **Check**: Both keys must be from the same EmailJS account
- **Solution**: Verify you're using the correct account's keys

### Issue 3: Private Key Format
- **Check**: The Private Key should be a long string (usually 40+ characters)
- **Solution**: Make sure you copied the entire key, not just part of it

## Where to Find Your Keys

### Public Key (User ID):
- Location: `config.js` → `publicKey: 'ZV2P-4FW2xmtKUGWl'`
- Or: EmailJS Dashboard → Account → General → Public Key

### Private Key:
- Location: EmailJS Dashboard → Account → **API Keys** → **Private Key**
- **Important**: This is different from the Public Key!
- Also called "Access Token" in some EmailJS versions

## Next Steps

Once the test passes:
1. ✅ Use these credentials for Vercel deployment
2. ✅ Set them as environment variables in Vercel
3. ✅ Configure the admin panel to use the API

See: `SETUP_EMAILJS_API.md` for deployment instructions.

