// Netlify version of GitHub OAuth Authentication
exports.handler = async (event, context) => {
  // Enable CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization'
  };

  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  const { GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET, ALLOWED_GITHUB_USERS } = process.env;

  if (!GITHUB_CLIENT_ID || !GITHUB_CLIENT_SECRET) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'GitHub OAuth not configured',
        message: 'Set GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET environment variables'
      })
    };
  }

  const queryParams = event.queryStringParameters || {};
  const body = event.body ? JSON.parse(event.body) : {};

  // Step 1: Initiate OAuth flow
  if (event.httpMethod === 'GET' && queryParams.action === 'login') {
    const origin = event.headers.origin || event.headers.referer || 'https://www.hemangpandhi.com';
    const redirectUri = `${origin}/.netlify/functions/auth-github?action=callback`;
    const scope = 'read:user';
    const state = queryParams.state || Math.random().toString(36).substring(7);
    
    const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${GITHUB_CLIENT_ID}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${scope}&state=${state}`;
    
    return {
      statusCode: 302,
      headers: {
        ...headers,
        Location: githubAuthUrl
      },
      body: ''
    };
  }

  // Step 2: Handle OAuth callback
  if (event.httpMethod === 'GET' && queryParams.action === 'callback') {
    const { code, state } = queryParams;

    if (!code) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Authorization code missing' })
      };
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
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: tokenData.error_description || 'OAuth error' })
        };
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
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'Failed to get user info' })
        };
      }

      // Check if user is allowed
      const allowedUsers = ALLOWED_GITHUB_USERS ? ALLOWED_GITHUB_USERS.split(',').map(u => u.trim()) : [];
      
      if (allowedUsers.length > 0 && !allowedUsers.includes(userData.login)) {
        return {
          statusCode: 403,
          headers,
          body: JSON.stringify({ 
            error: 'Access denied',
            message: `User ${userData.login} is not authorized`
          })
        };
      }

      // Create session token
      const sessionToken = Buffer.from(JSON.stringify({
        username: userData.login,
        name: userData.name || userData.login,
        avatar: userData.avatar_url,
        exp: Date.now() + (24 * 60 * 60 * 1000)
      })).toString('base64');

      const origin = event.headers.origin || 'https://www.hemangpandhi.com';
      const adminUrl = `${origin}/newsletter-admin.html?token=${sessionToken}`;
      
      return {
        statusCode: 302,
        headers: {
          ...headers,
          Location: adminUrl
        },
        body: ''
      };

    } catch (error) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'Authentication failed', details: error.message })
      };
    }
  }

  // Step 3: Verify session token
  if (event.httpMethod === 'POST' && queryParams.action === 'verify') {
    try {
      const { token } = body;

      if (!token) {
        return {
          statusCode: 401,
          headers,
          body: JSON.stringify({ authenticated: false, error: 'Token missing' })
        };
      }

      const decoded = JSON.parse(Buffer.from(token, 'base64').toString());
      
      if (decoded.exp && decoded.exp < Date.now()) {
        return {
          statusCode: 401,
          headers,
          body: JSON.stringify({ authenticated: false, error: 'Token expired' })
        };
      }

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ 
          authenticated: true, 
          user: {
            username: decoded.username,
            name: decoded.name,
            avatar: decoded.avatar
          }
        })
      };

    } catch (error) {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ authenticated: false, error: 'Invalid token' })
      };
    }
  }

  return {
    statusCode: 405,
    headers,
    body: JSON.stringify({ error: 'Method not allowed' })
  };
};

