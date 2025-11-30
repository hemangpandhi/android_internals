#!/usr/bin/env node

/**
 * EmailJS Contacts Sync Script
 * 
 * This script fetches contacts from EmailJS and syncs them to subscribers.json
 * 
 * Usage:
 *   node tools/sync-emailjs-contacts.js
 * 
 * Environment Variables Required:
 *   EMAILJS_PRIVATE_KEY - Your EmailJS private key (get from dashboard)
 *   EMAILJS_SERVICE_ID - Your EmailJS service ID
 *   EMAILJS_TEMPLATE_ID - Template ID to filter contacts (optional)
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const NewsletterManager = require('./newsletter-manager');

// EmailJS API Configuration
const EMAILJS_API_BASE = 'https://api.emailjs.com/api/v1.0';
const EMAILJS_PRIVATE_KEY = process.env.EMAILJS_PRIVATE_KEY;
const EMAILJS_SERVICE_ID = process.env.EMAILJS_SERVICE_ID || 'service_dygzcoh';
const EMAILJS_TEMPLATE_ID = process.env.EMAILJS_TEMPLATE_ID; // Optional: filter by template

// Paths
const subscribersFile = path.join(__dirname, '..', 'data', 'subscribers.json');
const buildSubscribersFile = path.join(__dirname, '..', 'build', 'data', 'subscribers.json');

class EmailJSSync {
  constructor() {
    this.newsletterManager = new NewsletterManager();
  }

  /**
   * Fetch contacts from EmailJS API using REST API
   * Requires EmailJS Private Key (accessToken) and User ID (Public Key)
   */
  async fetchContactsFromEmailJS() {
    console.log('📧 Fetching contacts from EmailJS API...');
    
    if (!EMAILJS_PRIVATE_KEY) {
      throw new Error('EMAILJS_PRIVATE_KEY (Private Key/Access Token) is required');
    }

    // Get User ID - In EmailJS, User ID is the same as Public Key
    // Since there's no separate User ID field, we use the Public Key as User ID
    const EMAILJS_USER_ID = process.env.EMAILJS_USER_ID || process.env.EMAILJS_PUBLIC_KEY;
    if (!EMAILJS_USER_ID) {
      throw new Error('EMAILJS_USER_ID or EMAILJS_PUBLIC_KEY is required (use your Public Key value)');
    }
    
    console.log(`   Using User ID (Public Key): ${EMAILJS_USER_ID.substring(0, 10)}...`);

    try {
      // EmailJS API endpoint for contacts
      // Based on EmailJS API documentation
      const apiUrl = `${EMAILJS_API_BASE}/contacts?user_id=${EMAILJS_USER_ID}`;
      
      console.log('🔗 Fetching from EmailJS API...');
      console.log(`   API Base: ${EMAILJS_API_BASE}`);
      console.log(`   User ID: ${EMAILJS_USER_ID.substring(0, 10)}...`);
      
      return new Promise((resolve, reject) => {
        // EmailJS API endpoint for contacts
        // Note: The user_id parameter should match your EmailJS account User ID
        // This is typically the same as your Public Key, but verify in EmailJS Dashboard
        // EmailJS API authentication - try different methods
        // Method 1: Standard Bearer token
        const options = {
          hostname: 'api.emailjs.com',
          path: `/api/v1.0/contacts?user_id=${EMAILJS_USER_ID}`,
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${EMAILJS_PRIVATE_KEY}`,
            'Content-Type': 'application/json',
            'User-Agent': 'Android-Internals-Sync/1.0'
          }
        };
        
        console.log(`   API Path: ${options.path}`);
        console.log(`   Authorization: Bearer ${EMAILJS_PRIVATE_KEY.substring(0, 10)}...`);
        console.log(`   ⚠️  Note: EmailJS may not have a public contacts API endpoint`);
        console.log(`   📋 If this fails, use CSV export method instead`);

        const req = https.request(options, (res) => {
          let data = '';

          res.on('data', (chunk) => {
            data += chunk;
          });

          res.on('end', () => {
            try {
              if (res.statusCode === 200) {
                const response = JSON.parse(data);
                console.log(`✅ Successfully fetched ${response.data?.length || 0} contacts from EmailJS API`);
                
                // Transform EmailJS contact format to our format
                const contacts = (response.data || []).map(contact => ({
                  email: contact.email || contact.contact_email,
                  name: contact.name || contact.contact_name || '',
                  source: 'emailjs-api'
                })).filter(c => c.email && c.email.includes('@'));
                
                console.log(`✅ Processed ${contacts.length} valid contacts`);
                resolve(contacts);
              } else if (res.statusCode === 401) {
                console.error('❌ Authentication failed - check EMAILJS_PRIVATE_KEY');
                reject(new Error('EmailJS API authentication failed. Check your private key.'));
              } else if (res.statusCode === 404) {
                console.log('⚠️  Contacts API endpoint not found - EmailJS may not support this endpoint');
                console.log('📋 Falling back to CSV method');
                resolve([]);
              } else {
                console.error(`❌ API Error: ${res.statusCode} - ${data}`);
                reject(new Error(`EmailJS API error: ${res.statusCode} - ${data.substring(0, 100)}`));
              }
            } catch (error) {
              console.error('❌ Error parsing API response:', error.message);
              console.error('Response data:', data.substring(0, 200));
              reject(error);
            }
          });
        });

        req.on('error', (error) => {
          console.error('❌ Network error fetching from EmailJS API:', error.message);
          reject(error);
        });

        req.setTimeout(10000, () => {
          req.destroy();
          reject(new Error('EmailJS API request timeout'));
        });

        req.end();
      });
      
    } catch (error) {
      console.error('❌ Error fetching contacts from EmailJS API:', error.message);
      throw error;
    }
  }

  /**
   * Alternative: Parse CSV file from EmailJS export
   */
  async syncFromCSV(csvFilePath) {
    console.log(`📧 Syncing contacts from CSV file: ${csvFilePath}`);
    
    if (!fs.existsSync(csvFilePath)) {
      throw new Error(`CSV file not found: ${csvFilePath}`);
    }

    const csvContent = fs.readFileSync(csvFilePath, 'utf8');
    const lines = csvContent.split('\n').filter(line => line.trim());
    
    if (lines.length < 2) {
      throw new Error('CSV file appears to be empty or invalid');
    }

    // Parse CSV header
    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    const emailIndex = headers.findIndex(h => h.toLowerCase().includes('email'));
    const nameIndex = headers.findIndex(h => h.toLowerCase().includes('name') || h.toLowerCase().includes('contact'));
    
    if (emailIndex === -1) {
      throw new Error('CSV file must contain an email column');
    }

    const contacts = [];
    
    // Parse CSV rows (skip header)
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      
      const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
      const email = values[emailIndex];
      const name = nameIndex !== -1 ? values[nameIndex] : '';
      
      if (email && email.includes('@')) {
        contacts.push({
          email: email,
          name: name || email.split('@')[0],
          source: 'emailjs'
        });
      }
    }

    console.log(`✅ Parsed ${contacts.length} contacts from CSV`);
    return contacts;
  }

  /**
   * Sync contacts to subscribers.json
   * Only keeps subscribers that exist in EmailJS contacts (removes others)
   */
  async syncContacts(contacts) {
    console.log(`🔄 Syncing ${contacts.length} contacts to subscribers.json...`);
    console.log(`📋 Will only keep subscribers that exist in EmailJS contacts`);
    
    // Load existing subscribers
    this.newsletterManager.loadSubscribers();
    const existingSubscribers = this.newsletterManager.subscribers || [];
    const existingEmails = new Set(existingSubscribers.map(sub => sub.email.toLowerCase()));
    
    // Create set of EmailJS contact emails (source of truth)
    const emailjsEmails = new Set(contacts.map(c => c.email.toLowerCase()));
    
    let added = 0;
    let updated = 0;
    let removed = 0;
    
    // Build new subscribers list - only from EmailJS contacts
    const newSubscribers = [];
    const processedEmails = new Set();
    
    // Process each contact from EmailJS
    for (const contact of contacts) {
      const emailLower = contact.email.toLowerCase();
      processedEmails.add(emailLower);
      
      // Find existing subscriber if it exists
      const existingSubscriber = existingSubscribers.find(
        sub => sub.email.toLowerCase() === emailLower
      );
      
      if (existingSubscriber) {
        // Update existing subscriber
        newSubscribers.push({
          email: contact.email,
          name: contact.name || existingSubscriber.name || contact.email.split('@')[0],
          subscribedAt: existingSubscriber.subscribedAt || new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          active: true
        });
        updated++;
      } else {
        // Add new subscriber
        newSubscribers.push({
          email: contact.email,
          name: contact.name || contact.email.split('@')[0],
          subscribedAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          active: true
        });
        added++;
      }
    }
    
    // Count removed subscribers (those not in EmailJS contacts)
    for (const existing of existingSubscribers) {
      const emailLower = existing.email.toLowerCase();
      if (!emailjsEmails.has(emailLower)) {
        removed++;
        console.log(`   🗑️  Removing subscriber not in EmailJS: ${existing.email}`);
      }
    }
    
    // Replace subscribers with only EmailJS contacts
    this.newsletterManager.subscribers = newSubscribers;
    this.newsletterManager.saveSubscribers();
    
    // Also update build directory
    const buildDataDir = path.dirname(buildSubscribersFile);
    if (!fs.existsSync(buildDataDir)) {
      fs.mkdirSync(buildDataDir, { recursive: true });
    }
    fs.writeFileSync(buildSubscribersFile, JSON.stringify(newSubscribers, null, 2));
    
    console.log(`✅ Sync completed:`);
    console.log(`   📥 Added: ${added} new subscribers`);
    console.log(`   🔄 Updated: ${updated} existing subscribers`);
    console.log(`   🗑️  Removed: ${removed} subscribers not in EmailJS`);
    console.log(`   📊 Total active subscribers: ${newSubscribers.length}`);
    
    return { added, updated, removed, total: newSubscribers.length };
  }

  /**
   * Main sync function
   * Tries API first, falls back to CSV if API fails
   */
  async sync(csvFilePath = null) {
    try {
      let contacts = [];
      
      if (csvFilePath) {
        // Sync from CSV file (manual method)
        console.log('📋 Using CSV file method');
        contacts = await this.syncFromCSV(csvFilePath);
      } else {
        // Try to fetch from EmailJS API first (automatic)
        console.log('🔌 Attempting to fetch from EmailJS API...');
        try {
          contacts = await this.fetchContactsFromEmailJS();
          
          if (contacts.length === 0) {
            console.log('⚠️  No contacts returned from API');
            console.log('💡 This might mean:');
            console.log('   1. API endpoint not available (EmailJS may not support contacts API)');
            console.log('   2. No contacts in EmailJS yet');
            console.log('   3. Authentication issue - check EMAILJS_PRIVATE_KEY');
            console.log('');
            console.log('📋 Alternative: Use CSV export method');
            console.log('   Export from EmailJS Dashboard → Contacts → Export to CSV');
            console.log('   Then run: node tools/sync-emailjs-contacts.js path/to/contacts.csv');
            return;
          }
        } catch (apiError) {
          console.error('❌ EmailJS API fetch failed:', apiError.message);
          console.log('📋 Falling back to CSV method');
          console.log('💡 To use API: Set EMAILJS_PRIVATE_KEY and EMAILJS_USER_ID environment variables');
          console.log('💡 Alternative: Export CSV from EmailJS Dashboard and use CSV method');
          return;
        }
      }
      
      if (contacts.length === 0) {
        console.log('⚠️  No contacts to sync');
        return;
      }
      
      const result = await this.syncContacts(contacts);
      return result;
      
    } catch (error) {
      console.error('❌ Sync failed:', error.message);
      process.exit(1);
    }
  }
}

// CLI interface
if (require.main === module) {
  const sync = new EmailJSSync();
  const csvPath = process.argv[2];
  
  if (csvPath) {
    sync.sync(csvPath).then(() => {
      console.log('✅ Sync completed successfully');
      process.exit(0);
    }).catch(error => {
      console.error('❌ Sync failed:', error);
      process.exit(1);
    });
  } else {
    sync.sync().then(() => {
      console.log('✅ Sync completed successfully');
      process.exit(0);
    }).catch(error => {
      console.error('❌ Sync failed:', error);
      process.exit(1);
    });
  }
}

module.exports = EmailJSSync;

