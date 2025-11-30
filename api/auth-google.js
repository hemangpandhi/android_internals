// Google OAuth Authentication Serverless Function
// Handles Google SSO login for website users

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, SITE_URL } = process.env;

  if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
    return res.status(500).json({ 
      error: 'Google OAuth not configured',
      message: 'Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET environment variables'
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

      // Create session token (simple JWT-like token)
      const sessionToken = Buffer.from(JSON.stringify({
        provider: 'google',
        email: userData.email,
        name: userData.name || userData.email.split('@')[0],
        picture: userData.picture,
        id: userData.id,
        exp: Date.now() + (24 * 60 * 60 * 1000) // 24 hours
      })).toString('base64');

      // Redirect to original page with token
      const returnUrl = `${redirectTo}${redirectTo.includes('?') ? '&' : '?'}token=${sessionToken}&provider=google`;
      
      return res.redirect(returnUrl);

    } catch (error) {
      console.error('OAuth error:', error);
      return res.status(500).json({ error: 'Authentication failed', details: error.message });
    }
  }

  // Step 3: Verify session token
  if (req.method === 'POST' && req.query.action === 'verify') {
    try {
      const { token } = req.body;

      if (!token) {
        return res.status(401).json({ authenticated: false, error: 'Token missing' });
      }

      const decoded = JSON.parse(Buffer.from(token, 'base64').toString());
      
      if (decoded.exp && decoded.exp < Date.now()) {
        return res.status(401).json({ authenticated: false, error: 'Token expired' });
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

  // Step 4: Logout
  if (req.method === 'POST' && req.query.action === 'logout') {
    return res.status(200).json({ success: true, message: 'Logged out' });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

