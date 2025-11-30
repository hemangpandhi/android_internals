// Vercel serverless function to proxy EmailJS contacts API
// This allows the admin panel to fetch subscribers at runtime without recompilation

import https from 'https';

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
    const { EMAILJS_PRIVATE_KEY, EMAILJS_USER_ID } = process.env;

    if (!EMAILJS_PRIVATE_KEY || !EMAILJS_USER_ID) {
      return res.status(500).json({ 
        error: 'EmailJS credentials not configured',
        message: 'Set EMAILJS_PRIVATE_KEY and EMAILJS_USER_ID environment variables in Vercel'
      });
    }

    // Fetch contacts from EmailJS API
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
          } else if (response.statusCode === 404) {
            resolve(res.status(404).json({ 
              error: 'Contacts API endpoint not found',
              message: 'EmailJS may not support this endpoint. Use CSV export method instead.'
            }));
          } else {
            resolve(res.status(response.statusCode).json({ 
              error: `EmailJS API error: ${response.statusCode}`,
              details: data.substring(0, 200)
            }));
          }
        });
      });

      request.on('error', (error) => {
        resolve(res.status(500).json({ error: 'Network error', details: error.message }));
      });

      request.end();
    });

  } catch (error) {
    return res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}

