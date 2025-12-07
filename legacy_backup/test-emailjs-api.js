#!/usr/bin/env node
// Test script for EmailJS API serverless function
// Run: node test-emailjs-api.js

const https = require('https');

// Get credentials from environment or prompt
const EMAILJS_PRIVATE_KEY = process.env.EMAILJS_PRIVATE_KEY;
const EMAILJS_USER_ID = process.env.EMAILJS_USER_ID || process.env.EMAILJS_PUBLIC_KEY;

if (!EMAILJS_PRIVATE_KEY || !EMAILJS_USER_ID) {
  console.error('❌ Missing EmailJS credentials!');
  console.error('');
  console.error('Set environment variables:');
  console.error('  export EMAILJS_PRIVATE_KEY="your_private_key"');
  console.error('  export EMAILJS_USER_ID="your_public_key"');
  console.error('');
  console.error('Or run:');
  console.error('  EMAILJS_PRIVATE_KEY="your_key" EMAILJS_USER_ID="your_id" node test-emailjs-api.js');
  process.exit(1);
}

console.log('🔌 Testing EmailJS API connection...');
console.log(`   User ID: ${EMAILJS_USER_ID.substring(0, 8)}...`);
console.log('');

const options = {
  hostname: 'api.emailjs.com',
  path: `/api/v1.0/contacts?user_id=${EMAILJS_USER_ID}`,
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${EMAILJS_PRIVATE_KEY}`,
    'Content-Type': 'application/json'
  }
};

const req = https.request(options, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    console.log(`📡 Response Status: ${res.statusCode}`);
    console.log('');

    if (res.statusCode === 200) {
      try {
        const response = JSON.parse(data);
        const contacts = response.data || [];
        
        console.log(`✅ Success! Found ${contacts.length} contact(s)`);
        console.log('');
        
        if (contacts.length > 0) {
          console.log('📋 Contacts:');
          contacts.forEach((contact, index) => {
            const email = contact.email || contact.contact_email;
            const name = contact.name || contact.contact_name || 'N/A';
            console.log(`   ${index + 1}. ${name} <${email}>`);
          });
          console.log('');
          
          // Transform to our format
          const subscribers = contacts.map(contact => ({
            email: contact.email || contact.contact_email,
            name: contact.name || contact.contact_name || contact.email?.split('@')[0] || 'Newsletter Subscriber',
            subscribedAt: contact.created_at || new Date().toISOString(),
            updatedAt: contact.updated_at || new Date().toISOString(),
            active: true
          })).filter(c => c.email && c.email.includes('@'));
          
          console.log('✅ Transformed subscribers:');
          console.log(JSON.stringify(subscribers, null, 2));
        } else {
          console.log('ℹ️  No contacts found in EmailJS');
          console.log('💡 Make sure "Save Contacts" is enabled in your EmailJS template');
        }
      } catch (error) {
        console.error('❌ Failed to parse response:', error.message);
        console.error('Response:', data.substring(0, 500));
      }
    } else if (res.statusCode === 401 || res.statusCode === 403) {
      console.error('❌ Authentication failed!');
      console.error('   Check that EMAILJS_PRIVATE_KEY is correct');
      console.error('   Check that EMAILJS_USER_ID matches your EmailJS public key');
      console.error('');
      console.error('Response:', data.substring(0, 500));
    } else if (res.statusCode === 404) {
      console.error('❌ API endpoint not found');
      console.error('   EmailJS may not support the contacts API endpoint');
      console.error('   Use CSV export method instead');
      console.error('');
      console.error('Response:', data.substring(0, 500));
    } else {
      console.error(`❌ API Error: ${res.statusCode}`);
      console.error('Response:', data.substring(0, 500));
    }
  });
});

req.on('error', (error) => {
  console.error('❌ Network error:', error.message);
  process.exit(1);
});

req.setTimeout(10000, () => {
  console.error('❌ Request timeout');
  req.destroy();
  process.exit(1);
});

req.end();

