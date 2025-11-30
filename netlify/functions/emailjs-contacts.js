// Netlify serverless function to proxy EmailJS contacts API
// This allows the admin panel to fetch subscribers at runtime without recompilation

const https = require('https');

exports.handler = async (event, context) => {
  // Enable CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const { EMAILJS_PRIVATE_KEY, EMAILJS_USER_ID } = process.env;

    if (!EMAILJS_PRIVATE_KEY || !EMAILJS_USER_ID) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ 
          error: 'EmailJS credentials not configured',
          message: 'Set EMAILJS_PRIVATE_KEY and EMAILJS_USER_ID environment variables in Netlify'
        })
      };
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

      const req = https.request(options, (response) => {
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

              resolve({
                statusCode: 200,
                headers,
                body: JSON.stringify({ subscribers })
              });
            } catch (error) {
              resolve({
                statusCode: 500,
                headers,
                body: JSON.stringify({ error: 'Failed to parse response', details: error.message })
              });
            }
          } else if (response.statusCode === 404) {
            resolve({
              statusCode: 404,
              headers,
              body: JSON.stringify({ 
                error: 'Contacts API endpoint not found',
                message: 'EmailJS may not support this endpoint. Use CSV export method instead.'
              })
            });
          } else {
            resolve({
              statusCode: response.statusCode,
              headers,
              body: JSON.stringify({ 
                error: `EmailJS API error: ${response.statusCode}`,
                details: data.substring(0, 200)
              })
            });
          }
        });
      });

      req.on('error', (error) => {
        resolve({
          statusCode: 500,
          headers,
          body: JSON.stringify({ error: 'Network error', details: error.message })
        });
      });

      req.end();
    });

  } catch (error) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Internal server error', details: error.message })
    };
  }
};

