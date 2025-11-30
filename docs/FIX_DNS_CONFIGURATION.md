# Fix DNS Configuration for hemangpandhi.com

## Current Issue

Vercel shows "Invalid Configuration" because the DNS records at your domain registrar don't match what Vercel expects.

## Step-by-Step Fix

### Step 1: Check What Vercel Needs

In Vercel dashboard, you should see DNS records like:

**For www.hemangpandhi.com:**
- Type: `CNAME`
- Name: `www`
- Value: `cname.vercel-dns.com` (or similar)

**For hemangpandhi.com (root domain):**
- Type: `A`
- Name: `@` (or blank)
- Value: `76.76.21.21` (Vercel's IP address)

### Step 2: Log in to Your Domain Registrar

Go to where you registered `hemangpandhi.com`:
- GoDaddy
- Namecheap
- Google Domains
- Cloudflare
- etc.

### Step 3: Find DNS Management

Look for:
- "DNS Management"
- "DNS Settings"
- "Zone File"
- "DNS Records"
- "Manage DNS"

### Step 4: Add/Update DNS Records

#### For www.hemangpandhi.com (CNAME):

1. **Find existing CNAME record for `www`** (if any)
2. **Update or Add:**
   - **Type**: `CNAME`
   - **Name/Host**: `www`
   - **Value/Target**: `cname.vercel-dns.com` (use the exact value Vercel shows)
   - **TTL**: `3600` or `Auto`

#### For hemangpandhi.com (A Record):

1. **Find existing A record for root domain** (if any)
2. **Update or Add:**
   - **Type**: `A`
   - **Name/Host**: `@` or leave blank (depends on registrar)
   - **Value/Target**: `76.76.21.21` (use the exact IP Vercel shows)
   - **TTL**: `3600` or `Auto`

### Step 5: Remove Conflicting Records

**Important:** Remove any conflicting records:
- ❌ Remove old A records pointing to different IPs
- ❌ Remove old CNAME records pointing to different domains
- ❌ Remove any conflicting www records

### Step 6: Save Changes

Click "Save" or "Update" at your registrar.

### Step 7: Wait for DNS Propagation

- **Time**: 5 minutes to 48 hours
- **Usually**: 5-30 minutes
- **Check**: Vercel dashboard will update automatically

### Step 8: Verify in Vercel

1. Go back to Vercel dashboard
2. Check domain status
3. Should change from "Invalid Configuration" to "Valid Configuration" ✅

## Common Issues & Solutions

### Issue 1: "CNAME already exists"

**Solution:**
- Delete the old CNAME record
- Add the new one Vercel provides

### Issue 2: "A record conflict"

**Solution:**
- Remove old A records
- Add only the A record Vercel shows

### Issue 3: "DNS not propagating"

**Check DNS propagation:**
```bash
# Check CNAME
dig www.hemangpandhi.com CNAME

# Check A record
dig hemangpandhi.com A
```

Or use online tools:
- https://dnschecker.org
- https://www.whatsmydns.net

### Issue 4: "Wrong registrar interface"

Different registrars have different interfaces:

**GoDaddy:**
- DNS → Manage Zones → Edit Records

**Namecheap:**
- Domain List → Manage → Advanced DNS

**Cloudflare:**
- DNS → Records → Add/Edit

**Google Domains:**
- DNS → Custom records

### Issue 5: "TTL too high"

**Solution:**
- Set TTL to `3600` (1 hour) or `Auto`
- Lower TTL = faster propagation

## Verification Checklist

After adding DNS records:

- [ ] CNAME record for `www` points to Vercel
- [ ] A record for root domain points to Vercel IP
- [ ] No conflicting records exist
- [ ] Saved changes at registrar
- [ ] Waited 5-30 minutes
- [ ] Checked Vercel dashboard status
- [ ] Status shows "Valid Configuration"

## Quick Test Commands

```bash
# Check CNAME record
dig www.hemangpandhi.com CNAME +short

# Check A record
dig hemangpandhi.com A +short

# Check both
nslookup www.hemangpandhi.com
nslookup hemangpandhi.com
```

## Expected Results

**After correct configuration:**

```bash
$ dig www.hemangpandhi.com CNAME +short
cname.vercel-dns.com.

$ dig hemangpandhi.com A +short
76.76.21.21
```

## Still Not Working?

1. **Double-check values:**
   - Copy exact values from Vercel dashboard
   - No typos or extra spaces

2. **Check registrar:**
   - Some registrars have delays
   - Try refreshing DNS cache

3. **Contact support:**
   - Vercel support: https://vercel.com/support
   - Your registrar support

4. **Alternative: Use Vercel Nameservers**
   - If your registrar supports it
   - Vercel manages DNS automatically
   - Check Vercel dashboard for nameservers

## Next Steps

Once DNS is configured:
1. ✅ Vercel shows "Valid Configuration"
2. ✅ SSL certificate is automatically provisioned
3. ✅ Site accessible at https://www.hemangpandhi.com
4. ✅ Update environment variables with new domain

Your domain will be live once DNS propagates! 🚀

