// JWT Token Utilities for Secure Authentication
// Uses HMAC-SHA256 for signing tokens

import crypto from 'crypto';

/**
 * Sign a JWT token with HMAC-SHA256
 * @param {Object} payload - Token payload
 * @param {string} secret - Secret key for signing
 * @returns {string} Signed JWT token
 */
function signToken(payload, secret) {
  if (!secret || secret.trim() === '') {
    throw new Error('JWT_SECRET is required but not set. Please set JWT_SECRET environment variable in Vercel.');
  }

  const header = {
    alg: 'HS256',
    typ: 'JWT'
  };

  // Encode header and payload (base64url = base64 with URL-safe characters)
  const base64UrlEncode = (str) => {
    return Buffer.from(str)
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');
  };

  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(payload));

  // Create signature
  const signatureInput = `${encodedHeader}.${encodedPayload}`;
  const signature = crypto
    .createHmac('sha256', secret)
    .update(signatureInput)
    .digest('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');

  return `${encodedHeader}.${encodedPayload}.${signature}`;
}

/**
 * Verify and decode a JWT token
 * @param {string} token - JWT token to verify
 * @param {string} secret - Secret key for verification
 * @returns {Object|null} Decoded payload or null if invalid
 */
function verifyToken(token, secret) {
  if (!token || !secret) {
    return null;
  }

  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      return null;
    }

    const [encodedHeader, encodedPayload, signature] = parts;

    // Verify signature
    const signatureInput = `${encodedHeader}.${encodedPayload}`;
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(signatureInput)
      .digest('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');

    // Constant-time comparison to prevent timing attacks
    if (!crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    )) {
      return null;
    }

    // Decode payload (base64url decode = add padding and convert back)
    const base64UrlDecode = (str) => {
      let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
      // Add padding if needed
      while (base64.length % 4) {
        base64 += '=';
      }
      return Buffer.from(base64, 'base64').toString('utf8');
    };
    
    const payload = JSON.parse(base64UrlDecode(encodedPayload));

    // Check expiration
    if (payload.exp && payload.exp < Date.now()) {
      return null;
    }

    return payload;
  } catch (error) {
    return null;
  }
}

/**
 * Create access token (short-lived, 15 minutes)
 * @param {Object} userData - User data to include in token
 * @param {string} secret - Secret key
 * @returns {string} Access token
 */
function createAccessToken(userData, secret) {
  const payload = {
    ...userData,
    type: 'access',
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + (15 * 60) // 15 minutes
  };
  return signToken(payload, secret);
}

/**
 * Create refresh token (long-lived, 7 days)
 * @param {Object} userData - User data to include in token
 * @param {string} secret - Secret key
 * @returns {string} Refresh token
 */
function createRefreshToken(userData, secret) {
  const payload = {
    id: userData.id,
    provider: userData.provider,
    type: 'refresh',
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60) // 7 days
  };
  return signToken(payload, secret);
}

export {
  signToken,
  verifyToken,
  createAccessToken,
  createRefreshToken
};

