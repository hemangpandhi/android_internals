#!/usr/bin/env node
// Enhanced debugging script for EmailJS API

const https = require('https');

const EMAILJS_PRIVATE_KEY = process.env.EMAILJS_PRIVATE_KEY;
const EMAILJS_USER_ID = process.env.EMAILJS_USER_ID || process.env.EMAILJS_PUBLIC_KEY;

console.log('🔍 EmailJS API Debugging');
console.log('========================');
console.log('');

if (!EMAILJS_PRIVATE_KEY || !EMAILJS_USER_ID) {
  console.error('❌ Missing credentials!');
  process.exit(1);
}

// Debug info
console.log('📋 Credentials Check:');
console.log(`   User ID: ${EMAILJS_USER_ID}`);
console.log(`   User ID length: ${EMAILJS_USER_ID.length}`);
console.log(`   Private Key length: ${EMAILJS_PRIVATE_KEY.length}`);
console.log(`   Private Key starts with: ${EMAILJS_PRIVATE_KEY.substring(0, 10)}...`);
console.log(`   Private Key ends with: ...${EMAILJS_PRIVATE_KEY.substring(EMAILJS_PRIVATE_KEY.length - 4)}`);
console.log('');

// Check for common issues
console.log('🔍 Checking for common issues:');
if (EMAILJS_PRIVATE_KEY.includes(' ')) {
  console.log('   ⚠️  WARNING: Private key contains spaces!');
}
if (EMAILJS_PRIVATE_KEY.startsWith("'") || EMAILJS_PRIVATE_KEY.startsWith('"')) {
  console.log('   ⚠️  WARNING: Private key may have quotes at start!');
}
if (EMAILJS_PRIVATE_KEY.endsWith("'") || EMAILJS_PRIVATE_KEY.endsWith('"')) {
  console.log('   ⚠️  WARNING: Private key may have quotes at end!');
}
if (EMAILJS_PRIVATE_KEY.length < 20) {
  console.log('   ⚠️  WARNING: Private key seems too short!');
}
console.log('');

// Try different API endpoints
const endpoints = [
  {
    name: 'Contacts API (v1.0)',
    path: `/api/v1.0/contacts?user_id=${EMAILJS_USER_ID}`
  },
  {
    name: 'Contacts API (v1.1)',
    path: `/api/v1.1/contacts?user_id=${EMAILJS_USER_ID}`
  },
  {
    name: 'User Info API',
    path: `/api/v1.0/user/info?user_id=${EMAILJS_USER_ID}`
  }
];

let tested = 0;
let success = false;

endpoints.forEach((endpoint, index) => {
  console.log(`🧪 Testing ${endpoint.name}...`);
  
  const options = {
    hostname: 'api.emailjs.com',
    path: endpoint.path,
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${EMAILJS_PRIVATE_KEY}`,
      'Content-Type': 'application/json',
      'User-Agent': 'EmailJS-API-Test/1.0'
    }
  };

  const req = https.request(options, (res) => {
    let data = '';
    res.on('data', (chunk) => { data += chunk; });
    res.on('end', () => {
      tested++;
      console.log(`   Status: ${res.statusCode}`);
      
      if (res.statusCode === 200) {
        console.log(`   ✅ SUCCESS with ${endpoint.name}!`);
        console.log(`   Response: ${data.substring(0, 200)}`);
        success = true;
      } else if (res.statusCode === 401 || res.statusCode === 403) {
        console.log(`   ❌ Auth failed: ${data.substring(0, 100)}`);
      } else if (res.statusCode === 404) {
        console.log(`   ⚠️  Endpoint not found`);
      } else {
        console.log(`   ⚠️  Status ${res.statusCode}: ${data.substring(0, 100)}`);
      }
      console.log('');
      
      // If all tested, show summary
      if (tested === endpoints.length) {
        console.log('📊 Summary:');
        if (success) {
          console.log('   ✅ At least one endpoint worked!');
        } else {
          console.log('   ❌ All endpoints failed');
          console.log('');
          console.log('💡 Troubleshooting:');
          console.log('   1. Verify Private Key at: https://dashboard.emailjs.com/admin/integration');
          console.log('   2. Make sure you copied the ENTIRE key (no spaces, no quotes)');
          console.log('   3. Check that Private Key matches the account with Public Key:', EMAILJS_USER_ID);
          console.log('   4. Try regenerating the Private Key in EmailJS Dashboard');
          console.log('   5. Check EmailJS documentation for API changes');
        }
      }
    });
  });

  req.on('error', (error) => {
    tested++;
    console.log(`   ❌ Network error: ${error.message}`);
    console.log('');
  });

  req.setTimeout(10000, () => {
    tested++;
    console.log(`   ❌ Timeout`);
    console.log('');
    req.destroy();
  });

  req.end();
});

