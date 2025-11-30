// GitHub OAuth Authentication Serverless Function
// Handles GitHub SSO login for admin panel

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET, ALLOWED_GITHUB_USERS } = process.env;

  if (!GITHUB_CLIENT_ID || !GITHUB_CLIENT_SECRET) {
    return res.status(500).json({ 
      error: 'GitHub OAuth not configured',
      message: 'Set GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET environment variables'
    });
  }

  // Step 1: Initiate OAuth flow (redirect to GitHub)
  if (req.method === 'GET' && req.query.action === 'login') {
    // Use production Vercel URL for callback (must match GitHub OAuth app callback URL)
    // Always use production URL to avoid preview URL mismatches
    // Can be overridden with GITHUB_CALLBACK_URL environment variable
    const vercelUrl = process.env.GITHUB_CALLBACK_URL 
      ? process.env.GITHUB_CALLBACK_URL.replace('/api/auth-github?action=callback', '')
      : 'https://android-internals.vercel.app';
    const redirectUri = `${vercelUrl}/api/auth-github?action=callback`;
    const scope = 'read:user';
    const state = req.query.state || Math.random().toString(36).substring(7);
    
    const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${GITHUB_CLIENT_ID}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${scope}&state=${state}`;
    
    return res.redirect(githubAuthUrl);
  }

  // Step 2: Handle OAuth callback
  if (req.method === 'GET' && req.query.action === 'callback') {
    const { code, state } = req.query;

    if (!code) {
      return res.status(400).json({ error: 'Authorization code missing' });
    }

    try {
      // Exchange code for access token
      const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          client_id: GITHUB_CLIENT_ID,
          client_secret: GITHUB_CLIENT_SECRET,
          code: code
        })
      });

      const tokenData = await tokenResponse.json();

      if (tokenData.error) {
        return res.status(400).json({ error: tokenData.error_description || 'OAuth error' });
      }

      const accessToken = tokenData.access_token;

      // Get user info from GitHub
      const userResponse = await fetch('https://api.github.com/user', {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Accept': 'application/vnd.github.v3+json'
        }
      });

      const userData = await userResponse.json();

      if (!userData.login) {
        return res.status(400).json({ error: 'Failed to get user info' });
      }

      // Check if this is for admin panel (check state or referer)
      const isAdmin = req.query.admin === 'true' || req.headers.referer?.includes('newsletter-admin');
      const allowedUsers = ALLOWED_GITHUB_USERS ? ALLOWED_GITHUB_USERS.split(',').map(u => u.trim()) : [];
      
      // For admin panel, check allowed users
      if (isAdmin && allowedUsers.length > 0 && !allowedUsers.includes(userData.login)) {
        return res.status(403).json({ 
          error: 'Access denied',
          message: `User ${userData.login} is not authorized to access the admin panel`
        });
      }

      // Create session token (simple JWT-like token)
      const sessionToken = Buffer.from(JSON.stringify({
        provider: 'github',
        username: userData.login,
        name: userData.name || userData.login,
        avatar: userData.avatar_url,
        email: userData.email || `${userData.login}@users.noreply.github.com`,
        id: userData.id,
        exp: Date.now() + (24 * 60 * 60 * 1000) // 24 hours
      })).toString('base64');

      // Redirect based on context
      const siteUrl = process.env.SITE_URL || 'https://www.hemangpandhi.com';
      
      if (isAdmin) {
        // Admin panel redirect
        const adminUrl = `${siteUrl}/newsletter-admin.html?token=${sessionToken}`;
        return res.redirect(adminUrl);
      } else {
        // Regular user redirect to homepage
        const returnUrl = `${siteUrl}?token=${sessionToken}&provider=github`;
        return res.redirect(returnUrl);
      }

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
          provider: decoded.provider || 'github',
          username: decoded.username,
          name: decoded.name,
          avatar: decoded.avatar,
          email: decoded.email,
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

