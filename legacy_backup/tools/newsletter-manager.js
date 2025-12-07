#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

class NewsletterManager {
  constructor() {
    this.subscribersFile = path.join(__dirname, '..', 'data', 'subscribers.json');
    this.ensureDataDirectory();
    this.loadSubscribers();
  }

  ensureDataDirectory() {
    const dataDir = path.dirname(this.subscribersFile);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
  }

  loadSubscribers() {
    try {
      if (fs.existsSync(this.subscribersFile)) {
        const data = fs.readFileSync(this.subscribersFile, 'utf8');
        this.subscribers = JSON.parse(data);
      } else {
        this.subscribers = [];
        this.saveSubscribers();
      }
    } catch (error) {
      console.error('Error loading subscribers:', error);
      this.subscribers = [];
    }
  }

  saveSubscribers() {
    try {
      fs.writeFileSync(this.subscribersFile, JSON.stringify(this.subscribers, null, 2));
    } catch (error) {
      console.error('Error saving subscribers:', error);
    }
  }

  addSubscriber(email, name = '') {
    // Check if email already exists
    const existingIndex = this.subscribers.findIndex(sub => sub.email === email);
    
    if (existingIndex !== -1) {
      // Update existing subscriber
      this.subscribers[existingIndex] = {
        email,
        name,
        subscribedAt: this.subscribers[existingIndex].subscribedAt,
        updatedAt: new Date().toISOString(),
        active: true
      };
    } else {
      // Add new subscriber
      this.subscribers.push({
        email,
        name,
        subscribedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        active: true
      });
    }
    
    this.saveSubscribers();
    console.log(`✅ Subscriber added/updated: ${email}`);
    return true;
  }

  removeSubscriber(email) {
    const index = this.subscribers.findIndex(sub => sub.email === email);
    if (index !== -1) {
      this.subscribers[index].active = false;
      this.subscribers[index].updatedAt = new Date().toISOString();
      this.saveSubscribers();
      console.log(`✅ Subscriber deactivated: ${email}`);
      return true;
    }
    return false;
  }

  getActiveSubscribers() {
    return this.subscribers.filter(sub => sub.active);
  }

  getSubscriberCount() {
    return this.getActiveSubscribers().length;
  }

  // Send newsletter to all active subscribers
  async sendNewsletter(articleData) {
    const activeSubscribers = this.getActiveSubscribers();
    
    if (activeSubscribers.length === 0) {
      console.log('📧 No active subscribers to send newsletter to');
      return;
    }

    console.log(`📧 Sending newsletter to ${activeSubscribers.length} subscribers...`);

    // EmailJS configuration - read from environment or config
    // Note: This should be set via environment variables or config file
    const emailjsConfig = {
      serviceId: process.env.EMAILJS_SERVICE_ID || 'service_dygzcoh',
      templateId: process.env.EMAILJS_NEWSLETTER_TEMPLATE || 'template_uwh1kil',
      publicKey: process.env.EMAILJS_PUBLIC_KEY || ''
    };
    
    if (!emailjsConfig.publicKey) {
      console.error('❌ EMAILJS_PUBLIC_KEY not set. Set it as an environment variable.');
      return;
    }

    // Newsletter content
    const newsletterContent = {
      articleTitle: articleData.title,
      articleDescription: articleData.description,
      articleUrl: `https://hemangpandhi.com/articles/${articleData.slug}.html`,
      articleDate: articleData.date,
      unsubscribeUrl: `https://hemangpandhi.com/unsubscribe?email={{email}}`
    };

    // Prepare email data for each subscriber
    const emailQueue = [];
    for (const subscriber of activeSubscribers) {
      try {
        const emailData = await this.sendEmailToSubscriber(subscriber, newsletterContent, emailjsConfig);
        emailQueue.push(emailData);
        console.log(`✅ Newsletter prepared for: ${subscriber.email}`);
      } catch (error) {
        console.error(`❌ Failed to prepare newsletter for ${subscriber.email}:`, error);
      }
    }

    // Save the newsletter queue for browser-based sending
    this.saveNewsletterQueue(emailQueue, articleData);
    console.log(`📧 Newsletter queue saved with ${emailQueue.length} emails ready to send`);
    console.log(`📧 To send newsletters, visit: http://localhost:8080/newsletter-admin.html`);

    console.log(`📧 Newsletter campaign completed!`);
  }

  async sendEmailToSubscriber(subscriber, content, config) {
    const emailData = {
      to_name: subscriber.name || subscriber.email,
      to_email: subscriber.email,
      from_name: 'Android Internals Newsletter',
      from_email: 'noreply@hemangpandhi.com',
      subject: `New Article: ${content.articleTitle}`,
      message: `Hi ${subscriber.name || subscriber.email},\n\nA new article has been published on Android Internals:\n\nTitle: ${content.articleTitle}\nDescription: ${content.articleDescription}\nDate: ${content.articleDate}\n\nRead the full article: ${content.articleUrl}\n\nTo unsubscribe, click here: ${content.unsubscribeUrl.replace('{{email}}', subscriber.email)}\n\nBest regards,\nAndroid Internals Team`,
      reply_to: 'noreply@hemangpandhi.com',
      // Additional parameter names for EmailJS compatibility
      email: subscriber.email,
      name: subscriber.name || subscriber.email,
      recipient_email: subscriber.email,
      recipient_name: subscriber.name || subscriber.email,
      to: subscriber.email,
      recipient: subscriber.email
    };

    console.log(`📧 Newsletter email prepared for ${subscriber.email}`);
    console.log(`📧 Email data:`, emailData);
    
    // Since EmailJS only works from browsers, we'll return the email data
    // for the browser-based newsletter sending system
    return emailData;
  }

  // Save newsletter queue for browser-based sending
  saveNewsletterQueue(emailQueue, articleData) {
    const queueData = {
      article: articleData,
      emails: emailQueue,
      createdAt: new Date().toISOString(),
      status: 'pending'
    };

    const queueFile = path.join(__dirname, '..', 'data', 'newsletter-queue.json');
    try {
      fs.writeFileSync(queueFile, JSON.stringify(queueData, null, 2));
      console.log(`✅ Newsletter queue saved to ${queueFile}`);
    } catch (error) {
      console.error('❌ Error saving newsletter queue:', error);
    }
  }

  // Generate newsletter HTML template
  generateNewsletterHTML(articleData) {
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>New Article: ${articleData.title}</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #3ddc84; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; }
        .button { display: inline-block; background: #3ddc84; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; }
        .footer { background: #f5f5f5; padding: 20px; text-align: center; font-size: 12px; color: #666; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Android Internals</h1>
            <p>New Article Published!</p>
        </div>
        
        <div class="content">
            <h2>${articleData.title}</h2>
            <p>${articleData.description}</p>
            
            <p><strong>Published:</strong> ${articleData.date}</p>
            
            <p style="text-align: center; margin: 30px 0;">
                <a href="${articleData.url}" class="button">Read Full Article</a>
            </p>
            
            <p>Stay tuned for more insights into Android internals, system programming, and development tools!</p>
        </div>
        
        <div class="footer">
            <p>You're receiving this email because you subscribed to Android Internals newsletter.</p>
            <p><a href="{{unsubscribe_url}}">Unsubscribe</a> | <a href="https://www.hemangpandhi.com">Visit Website</a></p>
        </div>
    </div>
</body>
</html>`;
  }

  // Export subscribers list
  exportSubscribers(format = 'json') {
    const activeSubscribers = this.getActiveSubscribers();
    
    switch (format.toLowerCase()) {
      case 'csv':
        const csvHeader = 'Email,Name,Subscribed Date\n';
        const csvData = activeSubscribers.map(sub => 
          `${sub.email},${sub.name || ''},${sub.subscribedAt}`
        ).join('\n');
        return csvHeader + csvData;
      
      case 'txt':
        return activeSubscribers.map(sub => 
          `${sub.email} - ${sub.name || 'No name'} (${sub.subscribedAt})`
        ).join('\n');
      
      default:
        return JSON.stringify(activeSubscribers, null, 2);
    }
  }

  // Import subscribers from file
  importSubscribers(filePath) {
    try {
      const data = fs.readFileSync(filePath, 'utf8');
      const imported = JSON.parse(data);
      
      let added = 0;
      for (const subscriber of imported) {
        if (subscriber.email) {
          this.addSubscriber(subscriber.email, subscriber.name || '');
          added++;
        }
      }
      
      console.log(`✅ Imported ${added} subscribers from ${filePath}`);
      return added;
    } catch (error) {
      console.error('❌ Error importing subscribers:', error);
      return 0;
    }
  }
}

// CLI interface
if (require.main === module) {
  const manager = new NewsletterManager();
  const command = process.argv[2];
  
  switch (command) {
    case 'add':
      const email = process.argv[3];
      const name = process.argv[4] || '';
      if (email) {
        manager.addSubscriber(email, name);
      } else {
        console.log('Usage: node newsletter-manager.js add <email> [name]');
      }
      break;
      
    case 'remove':
      const removeEmail = process.argv[3];
      if (removeEmail) {
        manager.removeSubscriber(removeEmail);
      } else {
        console.log('Usage: node newsletter-manager.js remove <email>');
      }
      break;
      
    case 'list':
      const subscribers = manager.getActiveSubscribers();
      console.log(`📧 Active Subscribers (${subscribers.length}):`);
      subscribers.forEach(sub => {
        console.log(`  - ${sub.email} (${sub.name || 'No name'}) - ${sub.subscribedAt}`);
      });
      break;
      
    case 'count':
      console.log(`📧 Total active subscribers: ${manager.getSubscriberCount()}`);
      break;
      
    case 'export':
      const format = process.argv[3] || 'json';
      const output = manager.exportSubscribers(format);
      const outputFile = `subscribers-export.${format}`;
      fs.writeFileSync(outputFile, output);
      console.log(`✅ Exported subscribers to ${outputFile}`);
      break;
      
    case 'import':
      const importFile = process.argv[3];
      if (importFile) {
        manager.importSubscribers(importFile);
      } else {
        console.log('Usage: node newsletter-manager.js import <file>');
      }
      break;
      
    default:
      console.log(`
📧 Newsletter Manager - Available Commands:

  add <email> [name]     - Add a new subscriber
  remove <email>         - Remove a subscriber
  list                   - List all active subscribers
  count                  - Show subscriber count
  export [format]        - Export subscribers (json/csv/txt)
  import <file>          - Import subscribers from file

Examples:
  node newsletter-manager.js add user@example.com "John Doe"
  node newsletter-manager.js list
  node newsletter-manager.js export csv
      `);
  }
}

module.exports = NewsletterManager;
