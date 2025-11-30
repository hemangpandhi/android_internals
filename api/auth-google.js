// Google OAuth Authentication Serverless Function
// Handles Google SSO login for website users
// Uses signed JWT tokens and httpOnly cookies for security

import { createAccessToken, createRefreshToken, verifyToken } from './jwt-utils.js';

// Parse cookies from request
function parseCookies(cookieHeader) {
  const cookies = {};
  if (cookieHeader) {
    cookieHeader.split(';').forEach(cookie => {
      const parts = cookie.trim().split('=');
      if (parts.length === 2) {
        cookies[parts[0]] = decodeURIComponent(parts[1]);
      }
    });
  }
  return cookies;
}

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Parse cookies from request headers
  const cookies = parseCookies(req.headers.cookie);
  req.cookies = cookies;

  const { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, SITE_URL, JWT_SECRET } = process.env;

  if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
    return res.status(500).json({ 
      error: 'Google OAuth not configured',
      message: 'Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET environment variables'
    });
  }

  if (!JWT_SECRET) {
    return res.status(500).json({ 
      error: 'JWT secret not configured',
      message: 'Set JWT_SECRET environment variable'
    });
  }

  const siteUrl = SITE_URL || 'https://www.hemangpandhi.com';

  // Step 1: Initiate OAuth flow (redirect to Google)
  if (req.method === 'GET' && req.query.action === 'login') {
    // Use production Vercel URL for callback (must match Google OAuth app callback URL)
    const vercelUrl = 'https://android-internals.vercel.app';
    const redirectUri = `${vercelUrl}/api/auth-google?action=callback`;
    const scope = 'openid email profile';
    const redirectTo = req.query.redirect_to || siteUrl;
    const state = req.query.state || Math.random().toString(36).substring(7);
    // Store redirect_to in state
    const stateWithRedirect = `${state}|${encodeURIComponent(redirectTo)}`;
    
    const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${GOOGLE_CLIENT_ID}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${encodeURIComponent(scope)}&state=${stateWithRedirect}&access_type=offline&prompt=consent`;
    
    return res.redirect(googleAuthUrl);
  }

  // Step 2: Handle OAuth callback
  if (req.method === 'GET' && req.query.action === 'callback') {
    const { code, state } = req.query;

    if (!code) {
      return res.status(400).json({ error: 'Authorization code missing' });
    }

    // Extract redirect_to from state
    let redirectTo = siteUrl;
    if (state && state.includes('|')) {
      const parts = state.split('|');
      redirectTo = decodeURIComponent(parts[1]);
    }

    try {
      // Exchange code for access token
      const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
          client_id: GOOGLE_CLIENT_ID,
          client_secret: GOOGLE_CLIENT_SECRET,
          code: code,
          grant_type: 'authorization_code',
          redirect_uri: `https://android-internals.vercel.app/api/auth-google?action=callback`
        })
      });

      const tokenData = await tokenResponse.json();

      if (tokenData.error) {
        return res.status(400).json({ error: tokenData.error_description || 'OAuth error' });
      }

      const accessToken = tokenData.access_token;

      // Get user info from Google
      const userResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Accept': 'application/json'
        }
      });

      const userData = await userResponse.json();

      if (!userData.email) {
        return res.status(400).json({ error: 'Failed to get user info' });
      }

      // Create user data object
      const userInfo = {
        provider: 'google',
        email: userData.email,
        name: userData.name || userData.email.split('@')[0],
        picture: userData.picture,
        avatar: userData.picture,
        id: userData.id.toString()
      };

      // Create signed JWT tokens
      const accessToken = createAccessToken(userInfo, JWT_SECRET);
      const refreshToken = createRefreshToken(userInfo, JWT_SECRET);

      // Set httpOnly cookies (secure, httpOnly, sameSite)
      const cookieOptions = {
        httpOnly: true,
        secure: true, // HTTPS only
        sameSite: 'lax',
        maxAge: 15 * 60 * 1000, // 15 minutes for access token
        path: '/'
      };

      const refreshCookieOptions = {
        httpOnly: true,
        secure: true,
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days for refresh token
        path: '/'
      };

      // Set cookies
      res.setHeader('Set-Cookie', [
        `auth_token=${accessToken}; ${Object.entries(cookieOptions).map(([k, v]) => `${k}=${v}`).join('; ')}`,
        `refresh_token=${refreshToken}; ${Object.entries(refreshCookieOptions).map(([k, v]) => `${k}=${v}`).join('; ')}`
      ]);

      // Clean redirect URL (no tokens in URL)
      try {
        const url = new URL(redirectTo);
        url.searchParams.delete('token');
        url.searchParams.delete('provider');
        redirectTo = url.toString();
      } catch (e) {
        redirectTo = redirectTo.split('?')[0].split('#')[0];
      }

      // Redirect to original page (cookies are set, no token in URL)
      return res.redirect(redirectTo);

    } catch (error) {
      console.error('OAuth error:', error);
      return res.status(500).json({ error: 'Authentication failed', details: error.message });
    }
  }

  // Step 3: Verify session token (from cookie or body)
  if (req.method === 'POST' && req.query.action === 'verify') {
    try {
      // Try to get token from cookie first, then from body (for backward compatibility)
      let token = req.cookies?.auth_token || req.body?.token;

      if (!token) {
        return res.status(401).json({ authenticated: false, error: 'Token missing' });
      }

      const decoded = verifyToken(token, JWT_SECRET);
      
      if (!decoded || decoded.type !== 'access') {
        return res.status(401).json({ authenticated: false, error: 'Invalid or expired token' });
      }

      return res.status(200).json({ 
        authenticated: true, 
        user: {
          provider: decoded.provider || 'google',
          email: decoded.email,
          name: decoded.name,
          avatar: decoded.picture || decoded.avatar,
          picture: decoded.picture || decoded.avatar,
          id: decoded.id
        }
      });

    } catch (error) {
      return res.status(401).json({ authenticated: false, error: 'Invalid token' });
    }
  }

  // Step 4: Refresh access token
  if (req.method === 'POST' && req.query.action === 'refresh') {
    try {
      const refreshToken = req.cookies?.refresh_token || req.body?.refresh_token;

      if (!refreshToken) {
        return res.status(401).json({ authenticated: false, error: 'Refresh token missing' });
      }

      const decoded = verifyToken(refreshToken, JWT_SECRET);
      
      if (!decoded || decoded.type !== 'refresh') {
        return res.status(401).json({ authenticated: false, error: 'Invalid or expired refresh token' });
      }

      // Get full user info (we only stored id and provider in refresh token)
      const userInfo = {
        provider: decoded.provider,
        id: decoded.id.toString()
      };

      const newAccessToken = createAccessToken(userInfo, JWT_SECRET);

      // Set new access token cookie
      const cookieOptions = {
        httpOnly: true,
        secure: true,
        sameSite: 'lax',
        maxAge: 15 * 60 * 1000,
        path: '/'
      };

      res.setHeader('Set-Cookie', [
        `auth_token=${newAccessToken}; ${Object.entries(cookieOptions).map(([k, v]) => `${k}=${v}`).join('; ')}`
      ]);

      return res.status(200).json({ 
        authenticated: true,
        message: 'Token refreshed'
      });

    } catch (error) {
      return res.status(401).json({ authenticated: false, error: 'Invalid refresh token' });
    }
  }

  // Step 5: Logout (clear cookies)
  if (req.method === 'POST' && req.query.action === 'logout') {
    // Clear cookies by setting them to expire
    res.setHeader('Set-Cookie', [
      'auth_token=; httpOnly=true; secure=true; sameSite=lax; maxAge=0; path=/',
      'refresh_token=; httpOnly=true; secure=true; sameSite=lax; maxAge=0; path=/'
    ]);
    return res.status(200).json({ success: true, message: 'Logged out' });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

