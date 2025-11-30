#!/usr/bin/env node
// Check EmailJS key format and verify credentials

const EMAILJS_PRIVATE_KEY = process.env.EMAILJS_PRIVATE_KEY || '';
const EMAILJS_USER_ID = process.env.EMAILJS_USER_ID || 'ZV2P-4FW2xmtKUGWl';

console.log('🔍 EmailJS Key Analysis');
console.log('=====================');
console.log('');

console.log('📋 Current Keys:');
console.log(`   Public Key (User ID): ${EMAILJS_USER_ID}`);
console.log(`   Public Key length: ${EMAILJS_USER_ID.length} characters`);
console.log(`   Private Key: ${EMAILJS_PRIVATE_KEY.substring(0, 10)}...${EMAILJS_PRIVATE_KEY.substring(EMAILJS_PRIVATE_KEY.length - 4)}`);
console.log(`   Private Key length: ${EMAILJS_PRIVATE_KEY.length} characters`);
console.log('');

// Check private key format
console.log('🔍 Private Key Analysis:');
if (EMAILJS_PRIVATE_KEY.length < 30) {
  console.log('   ⚠️  WARNING: Private key seems too short!');
  console.log('   ⚠️  EmailJS private keys are typically 40+ characters');
  console.log('   ⚠️  You may have copied an incomplete key');
} else if (EMAILJS_PRIVATE_KEY.length >= 30 && EMAILJS_PRIVATE_KEY.length < 40) {
  console.log('   ⚠️  Private key length is shorter than typical (usually 40+)');
} else {
  console.log('   ✅ Private key length looks reasonable');
}

if (!EMAILJS_PRIVATE_KEY.match(/^[A-Za-z0-9_-]+$/)) {
  console.log('   ⚠️  Private key contains invalid characters');
} else {
  console.log('   ✅ Private key format looks valid (alphanumeric + _ -)');
}

console.log('');
console.log('💡 Important Notes:');
console.log('');
console.log('1. Private Key Location:');
console.log('   Go to: https://dashboard.emailjs.com/admin/integration');
console.log('   Look for "Private Key" or "Access Token"');
console.log('   It should be a LONG string (40+ characters)');
console.log('');
console.log('2. Common Issues:');
console.log('   - Copying only part of the key');
console.log('   - Using Public Key instead of Private Key');
console.log('   - Extra spaces or line breaks');
console.log('');
console.log('3. If Private Key is Short:');
console.log('   - You may have copied the wrong field');
console.log('   - Check if there\'s a "Show Full Key" or "Copy" button');
console.log('   - Try regenerating the key in EmailJS Dashboard');
console.log('');
console.log('4. Alternative Solution:');
console.log('   If API access doesn\'t work, use CSV export:');
console.log('   - EmailJS Dashboard → Contacts → Export CSV');
console.log('   - Use "Sync from EmailJS CSV" in admin panel');
console.log('   - This method works without API access!');
console.log('');

