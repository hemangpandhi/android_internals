// Serverless function to fetch subscribers (protected)
// This requires authentication to prevent public access to subscriber data
// Deploy this to Vercel, Netlify, or similar serverless platform

import https from 'https';
import crypto from 'crypto';

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Simple password authentication via query parameter
    // In production, use proper authentication (OAuth, JWT, etc.)
    const { password } = req.query;
    const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'CHANGE_THIS_PASSWORD';

    if (!password || password !== ADMIN_PASSWORD) {
      return res.status(401).json({ 
        error: 'Unauthorized',
        message: 'Invalid password'
      });
    }

    // Fetch subscribers from EmailJS API (if available)
    const { EMAILJS_PRIVATE_KEY, EMAILJS_USER_ID } = process.env;

    if (EMAILJS_PRIVATE_KEY && EMAILJS_USER_ID) {
      // Try to fetch from EmailJS API
      return new Promise((resolve) => {
        const options = {
          hostname: 'api.emailjs.com',
          path: `/api/v1.0/contacts?user_id=${EMAILJS_USER_ID}`,
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${EMAILJS_PRIVATE_KEY}`,
            'Content-Type': 'application/json'
          }
        };

        const request = https.request(options, (response) => {
          let data = '';

          response.on('data', (chunk) => {
            data += chunk;
          });

          response.on('end', () => {
            if (response.statusCode === 200) {
              try {
                const contacts = JSON.parse(data);
                // Transform to our format
                const subscribers = (contacts.data || []).map(contact => ({
                  email: contact.email || contact.contact_email,
                  name: contact.name || contact.contact_name || contact.email?.split('@')[0] || 'Newsletter Subscriber',
                  subscribedAt: contact.created_at || new Date().toISOString(),
                  updatedAt: contact.updated_at || new Date().toISOString(),
                  active: true
                })).filter(c => c.email && c.email.includes('@'));

                resolve(res.status(200).json({ subscribers }));
              } catch (error) {
                resolve(res.status(500).json({ error: 'Failed to parse response', details: error.message }));
              }
            } else {
              // API failed, return empty array (fallback to CSV method)
              resolve(res.status(200).json({ subscribers: [] }));
            }
          });
        });

        request.on('error', (error) => {
          resolve(res.status(500).json({ error: 'Network error', details: error.message }));
        });

        request.end();
      });
    } else {
      // No EmailJS API, return empty array
      // Admin should use CSV import method
      return res.status(200).json({ 
        subscribers: [],
        message: 'EmailJS API not configured. Use CSV import method.'
      });
    }

  } catch (error) {
    return res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}

