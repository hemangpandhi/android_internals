# 🔐 Admin Panel Security Guide

## Overview
The admin panel is now protected with authentication to prevent unauthorized access.

## 🔒 Security Features

### Authentication
- **Username/Password**: Required to access admin panel
- **Session Management**: 24-hour session with secure cookies
- **Protected Routes**: All admin API endpoints require authentication
- **Automatic Logout**: Sessions expire after 24 hours

### Access Control
- **Login Required**: All admin functions require authentication
- **Session Validation**: Server validates session on every request
- **Secure Cookies**: HttpOnly cookies prevent XSS attacks
- **CSRF Protection**: Session-based authentication prevents CSRF

## 🚀 Security for Public Repositories

**⚠️ CRITICAL**: This is a public repository! Never commit real credentials.

### Default Credentials (Development Only)
```
Username: admin
Password: android_internals_2025
```

**⚠️ These are development defaults and should NEVER be used in production!**

## 🔧 Production Security Setup

### 1. Set Environment Variables (REQUIRED)
Create a `.env` file in the project root:

```bash
# Copy the example file
cp env.example .env

# Edit .env with your secure credentials
nano .env
```

Set your credentials in `.env`:
```bash
ADMIN_USERNAME=your_secure_username
ADMIN_PASSWORD=your_very_strong_password_here
NODE_ENV=production
```

**⚠️ The .env file is already in .gitignore and will NOT be committed to the repository.**

### 2. Environment Variables (Recommended)
Create `.env` file:
```bash
ADMIN_USERNAME=your_secure_username
ADMIN_PASSWORD=your_very_strong_password
NODE_ENV=production
```

### 3. HTTPS Setup
- Use HTTPS in production
- Set `secure: true` for cookies
- Configure SSL certificates

### 4. Rate Limiting
Consider adding rate limiting to prevent brute force attacks.

## 📍 Access URLs

### Development
- **Login**: `http://localhost:3001/login`
- **Admin Panel**: `http://localhost:3001/admin` (after login)

### Production
- **Login**: `https://your-domain.com/login`
- **Admin Panel**: `https://your-domain.com/admin` (after login)

## 🛡️ Security Best Practices

### Public Repository Security
1. **Never commit credentials**: Use environment variables only
2. **Use .env files**: Keep secrets in .env (already in .gitignore)
3. **Environment-specific configs**: Different credentials for dev/prod
4. **Regular credential rotation**: Change passwords periodically
5. **Monitor repository access**: Watch for suspicious activity

### General Security
1. **Strong Passwords**: Use complex passwords with special characters
2. **Regular Updates**: Keep dependencies updated
3. **HTTPS Only**: Always use HTTPS in production
4. **Session Management**: Monitor active sessions
5. **Access Logs**: Monitor login attempts
6. **Backup Security**: Secure backup files

## 🚨 Security Checklist

- [ ] Change default credentials
- [ ] Enable HTTPS
- [ ] Set up environment variables
- [ ] Configure firewall rules
- [ ] Monitor access logs
- [ ] Regular security audits
- [ ] Backup authentication data

## 🔍 Monitoring

### Check Active Sessions
```bash
# View server logs for authentication events
tail -f logs/admin-server.log
```

### Test Authentication
```bash
# Test login endpoint
curl -X POST http://localhost:3001/api/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"test"}'
```

## 🆘 Troubleshooting

### Common Issues
1. **Session Expired**: Re-login required
2. **Invalid Credentials**: Check username/password
3. **Network Errors**: Check server connectivity
4. **Cookie Issues**: Clear browser cookies

### Reset Admin Access
If locked out, restart the server and use default credentials.

---

**⚠️ IMPORTANT**: This admin panel has access to subscriber data and can send emails. Keep credentials secure and monitor access regularly.
