#!/usr/bin/env node

// Load environment variables from .env file
require('dotenv').config();

const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const crypto = require('crypto');
const cookieParser = require('cookie-parser');

const app = express();
const PORT = 3001;

// Admin credentials from environment variables (secure for public repos)
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'android_internals_2025';

// Session storage (in production, use Redis or database)
const sessions = new Map();

// Middleware
app.use(cors());
app.use(express.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, '..', 'build')));

// Authentication middleware
function requireAuth(req, res, next) {
    const sessionId = req.cookies?.sessionId || req.headers['x-session-id'];
    
    if (!sessionId || !sessions.has(sessionId)) {
        return res.status(401).json({ error: 'Authentication required' });
    }
    
    const session = sessions.get(sessionId);
    if (Date.now() > session.expires) {
        sessions.delete(sessionId);
        return res.status(401).json({ error: 'Session expired' });
    }
    
    req.user = session.user;
    next();
}

// Login endpoint
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    
    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
        const sessionId = crypto.randomBytes(32).toString('hex');
        const expires = Date.now() + (24 * 60 * 60 * 1000); // 24 hours
        
        sessions.set(sessionId, {
            user: { username },
            expires
        });
        

        
        res.cookie('sessionId', sessionId, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
            maxAge: 24 * 60 * 60 * 1000 // 24 hours
        });
        
        res.json({ 
            success: true, 
            message: 'Login successful',
            sessionId
        });
    } else {
        res.status(401).json({ error: 'Invalid credentials' });
    }
});

// Logout endpoint
app.post('/api/logout', (req, res) => {
    const sessionId = req.cookies?.sessionId || req.headers['x-session-id'];
    
    if (sessionId) {
        sessions.delete(sessionId);
    }
    
    res.clearCookie('sessionId');
    res.json({ success: true, message: 'Logged out successfully' });
});

// Check authentication status
app.get('/api/auth/status', (req, res) => {
    const sessionId = req.cookies?.sessionId || req.headers['x-session-id'];
    
    if (sessionId && sessions.has(sessionId)) {
        const session = sessions.get(sessionId);
        if (Date.now() <= session.expires) {
            return res.json({ authenticated: true, user: session.user });
        } else {
            sessions.delete(sessionId);
        }
    }
    
    res.json({ authenticated: false });
});

// Login page route
app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'build', 'admin-login.html'));
});

// Redirect old admin URL to login
app.get('/newsletter-admin.html', (req, res) => {
    res.redirect('/login');
});

// Protected admin panel route
app.get('/admin', requireAuth, (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'build', 'newsletter-admin.html'));
});

// Protected API routes
app.get('/api/subscribers', requireAuth, (req, res) => {
    try {
        const subscribersPath = path.join(__dirname, '..', 'build', 'data', 'subscribers.json');
        const subscribers = JSON.parse(fs.readFileSync(subscribersPath, 'utf8'));
        res.json(subscribers);
    } catch (error) {
        res.status(500).json({ error: 'Failed to load subscribers' });
    }
});

app.delete('/api/subscribers/:index', requireAuth, (req, res) => {
    try {
        const index = parseInt(req.params.index);
        const subscribersPath = path.join(__dirname, '..', 'build', 'data', 'subscribers.json');
        const subscribers = JSON.parse(fs.readFileSync(subscribersPath, 'utf8'));
        
        if (index < 0 || index >= subscribers.length) {
            return res.status(400).json({ error: 'Invalid subscriber index' });
        }
        
        const removedSubscriber = subscribers.splice(index, 1)[0];
        fs.writeFileSync(subscribersPath, JSON.stringify(subscribers, null, 2));
        
        // Also update the newsletter queue to sync with current subscribers
        updateNewsletterQueue(subscribers);
        
        res.json({ 
            success: true, 
            message: `Subscriber ${removedSubscriber.email} removed successfully`,
            subscribers: subscribers
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to remove subscriber' });
    }
});

// Function to update newsletter queue based on current subscribers
function updateNewsletterQueue(subscribers) {
    try {
        const queuePath = path.join(__dirname, '..', 'build', 'data', 'newsletter-queue.json');
        const queue = JSON.parse(fs.readFileSync(queuePath, 'utf8'));
        
        // Update emails array to match current subscribers
        queue.emails = subscribers.map(subscriber => ({
            to_email: subscriber.email,
            to_name: subscriber.name,
            from_name: 'Android Internals Team',
            from_email: 'noreply@hemangpandhi.com',
            subject: `New Article: ${queue.article.title}`,
            message: `We've just published a comprehensive guide to ADB and Android debugging. Check it out!`,
            reply_to: 'noreply@hemangpandhi.com'
        }));
        
        fs.writeFileSync(queuePath, JSON.stringify(queue, null, 2));
        console.log(`Updated newsletter queue with ${subscribers.length} subscribers`);
    } catch (error) {
        console.error('Error updating newsletter queue:', error);
    }
}

app.post('/api/subscribers', requireAuth, (req, res) => {
    try {
        const { email, name } = req.body;
        const subscribersPath = path.join(__dirname, '..', 'build', 'data', 'subscribers.json');
        const subscribers = JSON.parse(fs.readFileSync(subscribersPath, 'utf8'));
        
        // Check if subscriber already exists
        const existingSubscriber = subscribers.find(s => s.email === email);
        if (existingSubscriber) {
            return res.status(400).json({ error: 'Subscriber already exists' });
        }
        
        // Add new subscriber
        const newSubscriber = {
            email,
            name: name || email.split('@')[0],
            date: new Date().toISOString().split('T')[0],
            status: 'active',
            source: 'admin'
        };
        
        subscribers.push(newSubscriber);
        fs.writeFileSync(subscribersPath, JSON.stringify(subscribers, null, 2));
        
        res.json({ 
            success: true, 
            message: `Subscriber ${email} added successfully`,
            subscriber: newSubscriber,
            subscribers: subscribers
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to add subscriber' });
    }
});

app.get('/api/stats', requireAuth, (req, res) => {
    try {
        const subscribersPath = path.join(__dirname, '..', 'build', 'data', 'subscribers.json');
        const subscribers = JSON.parse(fs.readFileSync(subscribersPath, 'utf8'));
        
        const stats = {
            totalSubscribers: subscribers.length,
            activeSubscribers: subscribers.filter(s => s.status === 'active').length,
            newslettersSent: 0 // This would be tracked separately
        };
        
        res.json(stats);
    } catch (error) {
        res.status(500).json({ error: 'Failed to load stats' });
    }
});

app.post('/api/sync-newsletter-queue', requireAuth, (req, res) => {
    try {
        const subscribersPath = path.join(__dirname, '..', 'build', 'data', 'subscribers.json');
        const subscribers = JSON.parse(fs.readFileSync(subscribersPath, 'utf8'));
        
        updateNewsletterQueue(subscribers);
        
        res.json({ 
            success: true, 
            message: `Newsletter queue synced with ${subscribers.length} subscribers`
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to sync newsletter queue' });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Admin server running on http://localhost:${PORT}`);
    console.log(`🔐 Secure admin panel: http://localhost:${PORT}/admin`);
    
    // Security warnings
    if (ADMIN_USERNAME === 'admin' && ADMIN_PASSWORD === 'android_internals_2025') {
        console.log(`⚠️  WARNING: Using default credentials!`);
        console.log(`⚠️  Set ADMIN_USERNAME and ADMIN_PASSWORD environment variables for security.`);
    } else {
        console.log(`✅ Using custom credentials from environment variables.`);
    }
    
    console.log(`📖 See docs/deployment/ADMIN_SECURITY.md for setup instructions.`);
});

module.exports = app;
