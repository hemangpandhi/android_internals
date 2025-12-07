# Configure Custom Domain on Vercel

## Overview

Your site is currently accessible at `android-internals.vercel.app`, but you want to use your custom domain `hemangpandhi.com`.

## Step-by-Step Setup

### Step 1: Add Domain in Vercel Dashboard

1. **Go to Project Settings:**
   - Visit: https://vercel.com/androidinternals-projects/android-internals/settings/domains
   - Or: Project → **Settings** → **Domains**

2. **Add Domain:**
   - Click **"Add Domain"**
   - Enter: `www.hemangpandhi.com`
   - Click **"Add"**

3. **Add Root Domain (Optional but Recommended):**
   - Click **"Add Domain"** again
   - Enter: `hemangpandhi.com` (without www)
   - Click **"Add"**

### Step 2: Configure DNS Records

Vercel will show you the DNS records you need to add. You have two options:

#### Option A: CNAME Record (Recommended for www)

1. **For www.hemangpandhi.com:**
   - Type: `CNAME`
   - Name: `www`
   - Value: `cname.vercel-dns.com` (or the value Vercel shows)
   - TTL: Auto or 3600

2. **For hemangpandhi.com (root domain):**
   - Type: `A`
   - Name: `@` (or leave blank)
   - Value: `76.76.21.21` (Vercel's IP - check Vercel dashboard for current IP)
   - TTL: Auto or 3600

#### Option B: Use Vercel Nameservers (Easier)

If your domain registrar supports it:
1. Get nameservers from Vercel dashboard
2. Update nameservers at your domain registrar
3. Vercel manages all DNS automatically

### Step 3: Update DNS at Your Domain Registrar

1. **Log in to your domain registrar** (where you bought hemangpandhi.com)
2. **Go to DNS Management:**
   - Find "DNS Settings" or "DNS Management"
   - Look for "DNS Records" or "Zone File"

3. **Add the DNS records** Vercel provided:
   - Add CNAME for `www`
   - Add A record for root domain (if needed)

4. **Save changes**

### Step 4: Wait for DNS Propagation

- DNS changes can take 5 minutes to 48 hours
- Usually takes 5-30 minutes
- Check status in Vercel dashboard (shows "Valid Configuration" when ready)

### Step 5: SSL Certificate (Automatic)

- Vercel automatically provisions SSL certificates
- HTTPS will work automatically once DNS is configured
- No additional setup needed

## Verify Configuration

### Check in Vercel Dashboard:

1. Go to: **Settings** → **Domains**
2. You should see:
   - `www.hemangpandhi.com` - Status: "Valid Configuration" ✅
   - `hemangpandhi.com` - Status: "Valid Configuration" ✅

### Test Your Site:

1. Visit: `https://www.hemangpandhi.com`
2. Visit: `https://hemangpandhi.com`
3. Both should redirect to your Vercel deployment

## Troubleshooting

### "Invalid Configuration"

- Check DNS records are correct
- Wait a few minutes for DNS propagation
- Verify records at your registrar match Vercel's requirements

### "DNS Not Propagated"

- Use DNS checker: https://dnschecker.org
- Check if records are visible globally
- Wait up to 48 hours (usually much faster)

### "SSL Certificate Pending"

- Wait 5-10 minutes after DNS is configured
- Vercel automatically provisions SSL
- Check again in a few minutes

### Domain Not Working

1. **Check DNS records:**
   ```bash
   dig www.hemangpandhi.com
   dig hemangpandhi.com
   ```

2. **Verify in Vercel:**
   - Settings → Domains
   - Check for error messages

3. **Clear browser cache:**
   - Hard refresh (Ctrl+Shift+R or Cmd+Shift+R)

## Quick Setup Checklist

- [ ] Add `www.hemangpandhi.com` in Vercel dashboard
- [ ] Add `hemangpandhi.com` in Vercel dashboard (optional)
- [ ] Add CNAME record for `www` at domain registrar
- [ ] Add A record for root domain at domain registrar (if needed)
- [ ] Wait for DNS propagation (5-30 minutes)
- [ ] Verify domain shows "Valid Configuration" in Vercel
- [ ] Test `https://www.hemangpandhi.com`
- [ ] Test `https://hemangpandhi.com`

## After Setup

Once configured:
- ✅ Your site will be accessible at `https://www.hemangpandhi.com`
- ✅ Root domain will redirect to www (or vice versa)
- ✅ SSL certificate is automatic
- ✅ All API endpoints work on custom domain
- ✅ Admin panel accessible at `https://www.hemangpandhi.com/newsletter-admin.html`

## Update Admin Panel Configuration

After domain is configured, update `config.js` or environment variables:

```javascript
siteDomain: 'https://www.hemangpandhi.com'
```

And update `AUTH_API_URL`:
```
AUTH_API_URL=https://www.hemangpandhi.com/api/auth-github
```

Your custom domain is now configured! 🎉

