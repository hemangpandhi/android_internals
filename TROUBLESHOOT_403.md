# Troubleshooting 403 "The private key is wrong" Error

## Common Causes

1. **Keys don't match** - Private key and Public key must be from the same key pair
2. **Using old keys** - After regenerating, you must use BOTH new keys
3. **Wrong account** - Keys from different EmailJS accounts won't work
4. **Whitespace/typos** - Extra spaces or characters in the private key

## Quick Fix Steps

### Step 1: Verify Your Keys

1. Go to: https://dashboard.emailjs.com/admin/integration
2. Check your **Private Key** (should be visible)
3. Check your **Public Key** (Account → General → Public Key)

### Step 2: Verify config.js

Your `config.js` should have:
```javascript
publicKey: 'YOUR_PUBLIC_KEY_HERE',  // Should match EmailJS Dashboard
```

### Step 3: Set Environment Variable Correctly

```bash
# Make sure there are NO spaces or quotes around the key
export EMAILJS_PRIVATE_KEY="your_actual_private_key_here"

# Verify it's set correctly
echo $EMAILJS_PRIVATE_KEY
```

**Important**: 
- No leading/trailing spaces
- No quotes in the actual key value
- Copy the ENTIRE key (they're usually long)

### Step 4: Test Again

```bash
# Use the verification script
./verify-emailjs-keys.sh

# Or test directly
export EMAILJS_USER_ID="your_public_key_here"
node test-emailjs-api.js
```

## Detailed Troubleshooting

### Check 1: Key Pair Match

**Problem**: Private key and Public key are from different key pairs

**Solution**: 
- Both keys must be generated together
- If you regenerated one, you must regenerate both
- They must be from the same EmailJS account

### Check 2: Key Format

**Problem**: Key has extra characters or is truncated

**Solution**:
```bash
# Check private key length (should be long, usually 30+ characters)
echo ${#EMAILJS_PRIVATE_KEY}

# Check for hidden characters
echo "$EMAILJS_PRIVATE_KEY" | cat -A
```

### Check 3: Environment Variable

**Problem**: Variable not set or has wrong value

**Solution**:
```bash
# Clear and reset
unset EMAILJS_PRIVATE_KEY
export EMAILJS_PRIVATE_KEY="your_new_private_key"

# Verify
echo "Key length: ${#EMAILJS_PRIVATE_KEY}"
echo "First 10 chars: ${EMAILJS_PRIVATE_KEY:0:10}"
echo "Last 4 chars: ${EMAILJS_PRIVATE_KEY: -4}"
```

### Check 4: Regenerated Keys

If you just regenerated keys:

1. ✅ Update `config.js` with NEW public key (already done)
2. ✅ Set `EMAILJS_PRIVATE_KEY` with NEW private key
3. ✅ Make sure you're using the NEW keys, not old ones

## Still Getting 403?

1. **Double-check EmailJS Dashboard**:
   - Go to https://dashboard.emailjs.com/admin/integration
   - Verify the Private Key shown matches what you're using
   - Verify Public Key in Account → General matches config.js

2. **Try regenerating again**:
   - Regenerate both keys in EmailJS
   - Update config.js with new public key
   - Set new private key in environment

3. **Check API endpoint**:
   - The contacts API might not be available for your account
   - Try the CSV export method instead (already implemented)

## Alternative: Use CSV Method

If API continues to fail, use the CSV export method:

1. Go to EmailJS Dashboard → Contacts
2. Export to CSV
3. Use the admin panel CSV import (already works)

