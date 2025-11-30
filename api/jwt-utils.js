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

  // Encode header and payload
  const encodedHeader = Buffer.from(JSON.stringify(header)).toString('base64url');
  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString('base64url');

  // Create signature
  const signatureInput = `${encodedHeader}.${encodedPayload}`;
  const signature = crypto
    .createHmac('sha256', secret)
    .update(signatureInput)
    .digest('base64url');

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
      .digest('base64url');

    // Constant-time comparison to prevent timing attacks
    if (!crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    )) {
      return null;
    }

    // Decode payload
    const payload = JSON.parse(Buffer.from(encodedPayload, 'base64url').toString());

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

