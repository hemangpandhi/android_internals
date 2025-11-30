#!/usr/bin/env node

const http = require('http');
const url = require('url');
const fs = require('fs');
const path = require('path');
const NewsletterManager = require('./newsletter-manager');

const PORT = 3001; // Different port from the main server

class APIServer {
  constructor() {
    this.newsletterManager = new NewsletterManager();
  }

  handleRequest(req, res) {
    const parsedUrl = url.parse(req.url, true);
    const pathname = parsedUrl.pathname;
    const method = req.method;

    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Handle preflight requests
    if (method === 'OPTIONS') {
      res.writeHead(200);
      res.end();
      return;
    }

    // Parse JSON body
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });

    req.on('end', () => {
      try {
        const data = body ? JSON.parse(body) : {};

        if (pathname === '/api/subscribe' && method === 'POST') {
          this.handleSubscribe(req, res, data);
        } else if (pathname === '/api/unsubscribe' && method === 'POST') {
          this.handleUnsubscribe(req, res, data);
        } else if (pathname === '/api/subscribers' && method === 'GET') {
          this.handleGetSubscribers(req, res);
        } else if (pathname === '/api/subscribers/count' && method === 'GET') {
          this.handleGetSubscriberCount(req, res);
        } else if (pathname === '/api/sync-emailjs' && method === 'POST') {
          this.handleSyncEmailJS(req, res, data);
        } else {
          this.sendResponse(res, 404, { error: 'Not Found' });
        }
      } catch (error) {
        console.error('API Error:', error);
        this.sendResponse(res, 500, { error: 'Internal Server Error' });
      }
    });
  }

  handleSubscribe(req, res, data) {
    const { email, name = '' } = data;

    if (!email || !email.includes('@')) {
      this.sendResponse(res, 400, { 
        success: false, 
        error: 'Valid email address is required' 
      });
      return;
    }

    try {
      this.newsletterManager.addSubscriber(email, name);
      this.sendResponse(res, 200, { 
        success: true, 
        message: 'Successfully subscribed to newsletter' 
      });
    } catch (error) {
      console.error('Subscribe error:', error);
      this.sendResponse(res, 500, { 
        success: false, 
        error: 'Failed to subscribe' 
      });
    }
  }

  handleUnsubscribe(req, res, data) {
    const { email } = data;

    if (!email) {
      this.sendResponse(res, 400, { 
        success: false, 
        error: 'Email address is required' 
      });
      return;
    }

    try {
      const removed = this.newsletterManager.removeSubscriber(email);
      if (removed) {
        this.sendResponse(res, 200, { 
          success: true, 
          message: 'Successfully unsubscribed from newsletter' 
        });
      } else {
        this.sendResponse(res, 404, { 
          success: false, 
          error: 'Email not found in subscribers list' 
        });
      }
    } catch (error) {
      console.error('Unsubscribe error:', error);
      this.sendResponse(res, 500, { 
        success: false, 
        error: 'Failed to unsubscribe' 
      });
    }
  }

  handleGetSubscribers(req, res) {
    try {
      const subscribers = this.newsletterManager.getActiveSubscribers();
      this.sendResponse(res, 200, { 
        success: true, 
        subscribers: subscribers 
      });
    } catch (error) {
      console.error('Get subscribers error:', error);
      this.sendResponse(res, 500, { 
        success: false, 
        error: 'Failed to get subscribers' 
      });
    }
  }

  handleGetSubscriberCount(req, res) {
    try {
      const count = this.newsletterManager.getSubscriberCount();
      this.sendResponse(res, 200, { 
        success: true, 
        count: count 
      });
    } catch (error) {
      console.error('Get subscriber count error:', error);
      this.sendResponse(res, 500, { 
        success: false, 
        error: 'Failed to get subscriber count' 
      });
    }
  }

  handleSyncEmailJS(req, res, data) {
    try {
      const EmailJSSync = require('./sync-emailjs-contacts');
      const sync = new EmailJSSync();
      const csvPath = data.csvPath;
      
      sync.sync(csvPath)
        .then(result => {
          this.sendResponse(res, 200, {
            success: true,
            message: 'Contacts synced successfully',
            result: result
          });
        })
        .catch(error => {
          this.sendResponse(res, 500, {
            success: false,
            error: error.message
          });
        });
    } catch (error) {
      this.sendResponse(res, 500, {
        success: false,
        error: 'Failed to sync contacts: ' + error.message
      });
    }
  }

  sendResponse(res, statusCode, data) {
    res.writeHead(statusCode, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(data));
  }

  start() {
    const server = http.createServer((req, res) => {
      this.handleRequest(req, res);
    });

    server.listen(PORT, () => {
      console.log(`📧 Newsletter API Server running on port ${PORT}`);
      console.log(`📧 Available endpoints:`);
      console.log(`   POST /api/subscribe - Add new subscriber`);
      console.log(`   POST /api/unsubscribe - Remove subscriber`);
      console.log(`   GET /api/subscribers - Get all subscribers`);
      console.log(`   GET /api/subscribers/count - Get subscriber count`);
      console.log(`   POST /api/sync-emailjs - Sync contacts from EmailJS CSV`);
    });

    return server;
  }
}

// Start the server if this file is run directly
if (require.main === module) {
  const apiServer = new APIServer();
  apiServer.start();
}

module.exports = APIServer;
