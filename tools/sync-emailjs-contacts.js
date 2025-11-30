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
   * Fetch contacts from EmailJS API
   * Note: EmailJS doesn't have a public REST API for contacts
   * This is a workaround using their internal API or CSV export
   */
  async fetchContactsFromEmailJS() {
    console.log('📧 Fetching contacts from EmailJS...');
    
    if (!EMAILJS_PRIVATE_KEY) {
      throw new Error('EMAILJS_PRIVATE_KEY environment variable is required');
    }

    try {
      // Method 1: Try to use EmailJS API (if available)
      // Note: EmailJS may not expose contacts via REST API
      // We'll use an alternative approach: parse from CSV export URL
      
      console.log('⚠️  EmailJS REST API for contacts may not be publicly available.');
      console.log('📋 Alternative: Use CSV export method (see EMAILJS_SYNC_SETUP.md)');
      
      // For now, return empty array - user should use CSV import method
      return [];
      
    } catch (error) {
      console.error('❌ Error fetching contacts from EmailJS:', error.message);
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
   */
  async sync(csvFilePath = null) {
    try {
      let contacts = [];
      
      if (csvFilePath) {
        // Sync from CSV file
        contacts = await this.syncFromCSV(csvFilePath);
      } else {
        // Try to fetch from EmailJS API
        contacts = await this.fetchContactsFromEmailJS();
      }
      
      if (contacts.length === 0) {
        console.log('⚠️  No contacts to sync');
        console.log('💡 Tip: Export contacts from EmailJS Dashboard as CSV and use:');
        console.log('   node tools/sync-emailjs-contacts.js path/to/contacts.csv');
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

