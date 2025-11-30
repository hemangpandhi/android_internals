// Serverless function for subscriber database operations
// Works with Supabase, MongoDB Atlas, or any database

import https from 'https';

// Database configuration
const DB_TYPE = process.env.DB_TYPE || 'supabase'; // 'supabase', 'mongodb', 'postgres'
const DB_URL = process.env.DATABASE_URL;
const DB_API_KEY = process.env.SUPABASE_ANON_KEY; // For Supabase

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Authentication check (use GitHub SSO token or API key)
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const token = authHeader.substring(7);
  // Verify token with auth service
  const isAuthenticated = await verifyToken(token);
  if (!isAuthenticated) {
    return res.status(401).json({ error: 'Invalid token' });
  }

  try {
    switch (req.method) {
      case 'GET':
        return await getSubscribers(req, res);
      case 'POST':
        return await addSubscriber(req, res);
      case 'PUT':
        return await updateSubscriber(req, res);
      case 'DELETE':
        return await deleteSubscriber(req, res);
      default:
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Database error:', error);
    return res.status(500).json({ error: 'Database operation failed', details: error.message });
  }
}

async function verifyToken(token) {
  // Verify with auth service
  try {
    const authUrl = process.env.AUTH_API_URL || 'https://your-project.vercel.app/api/auth-github';
    const response = await fetch(`${authUrl}?action=verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token })
    });
    const data = await response.json();
    return data.authenticated === true;
  } catch (error) {
    return false;
  }
}

async function getSubscribers(req, res) {
  const { active } = req.query;
  
  if (DB_TYPE === 'supabase') {
    const url = `${DB_URL}/rest/v1/subscribers?select=*${active !== undefined ? `&active=eq.${active}` : ''}`;
    const response = await fetch(url, {
      headers: {
        'apikey': DB_API_KEY,
        'Authorization': `Bearer ${DB_API_KEY}`
      }
    });
    const subscribers = await response.json();
    return res.status(200).json({ subscribers });
  }
  
  // MongoDB or other database implementations
  return res.status(501).json({ error: 'Database type not implemented' });
}

async function addSubscriber(req, res) {
  const { email, name } = req.body;
  
  if (!email || !email.includes('@')) {
    return res.status(400).json({ error: 'Invalid email' });
  }
  
  if (DB_TYPE === 'supabase') {
    const url = `${DB_URL}/rest/v1/subscribers`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'apikey': DB_API_KEY,
        'Authorization': `Bearer ${DB_API_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify({
        email,
        name: name || email.split('@')[0],
        active: true,
        subscribed_at: new Date().toISOString()
      })
    });
    
    if (response.status === 201) {
      const subscriber = await response.json();
      return res.status(201).json({ subscriber: subscriber[0] });
    } else if (response.status === 409) {
      return res.status(409).json({ error: 'Subscriber already exists' });
    } else {
      const error = await response.text();
      return res.status(response.status).json({ error });
    }
  }
  
  return res.status(501).json({ error: 'Database type not implemented' });
}

async function updateSubscriber(req, res) {
  const { email } = req.query;
  const updates = req.body;
  
  if (DB_TYPE === 'supabase') {
    const url = `${DB_URL}/rest/v1/subscribers?email=eq.${encodeURIComponent(email)}`;
    const response = await fetch(url, {
      method: 'PATCH',
      headers: {
        'apikey': DB_API_KEY,
        'Authorization': `Bearer ${DB_API_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify({
        ...updates,
        updated_at: new Date().toISOString()
      })
    });
    
    if (response.ok) {
      const subscriber = await response.json();
      return res.status(200).json({ subscriber: subscriber[0] });
    } else {
      return res.status(response.status).json({ error: 'Update failed' });
    }
  }
  
  return res.status(501).json({ error: 'Database type not implemented' });
}

async function deleteSubscriber(req, res) {
  const { email } = req.query;
  
  if (DB_TYPE === 'supabase') {
    const url = `${DB_URL}/rest/v1/subscribers?email=eq.${encodeURIComponent(email)}`;
    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        'apikey': DB_API_KEY,
        'Authorization': `Bearer ${DB_API_KEY}`
      }
    });
    
    return res.status(200).json({ success: true });
  }
  
  return res.status(501).json({ error: 'Database type not implemented' });
}

