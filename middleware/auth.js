const jwt = require('jsonwebtoken');
const db = require('../config/db');

/**
 * JWT Authentication Middleware
 * Verifies Bearer token from Authorization header
 */
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({
      success: false,
      error: {
        code: 401,
        type: 'AUTHENTICATION_ERROR',
        message: 'Access token is required. Send it in the Authorization header as: Bearer <token>',
      },
      timestamp: new Date().toISOString(),
    });
  }

  // Check if token is blacklisted (logged out)
  const blacklisted = db.prepare('SELECT id FROM blacklisted_tokens WHERE token = ?').get(token);
  if (blacklisted) {
    return res.status(401).json({
      success: false,
      error: {
        code: 401,
        type: 'AUTHENTICATION_ERROR',
        message: 'Token has been invalidated. Please login again.',
      },
      timestamp: new Date().toISOString(),
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    req.token = token;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        error: {
          code: 401,
          type: 'TOKEN_EXPIRED',
          message: 'Access token has expired. Use /api/auth/refresh to get a new token.',
        },
        timestamp: new Date().toISOString(),
      });
    }
    return res.status(403).json({
      success: false,
      error: {
        code: 403,
        type: 'INVALID_TOKEN',
        message: 'Invalid or malformed token.',
      },
      timestamp: new Date().toISOString(),
    });
  }
}

/**
 * Optional Auth Middleware
 * Attaches user info if token present, but doesn't block if missing
 */
function optionalAuth(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token) {
    try {
      const blacklisted = db.prepare('SELECT id FROM blacklisted_tokens WHERE token = ?').get(token);
      if (!blacklisted) {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        req.token = token;
      }
    } catch (err) {
      // Token invalid, but that's okay for optional auth
    }
  }
  next();
}

/**
 * API Key Authentication Middleware
 * Verifies X-API-Key header
 */
function authenticateApiKey(req, res, next) {
  const apiKey = req.headers['x-api-key'];

  if (!apiKey) {
    return res.status(401).json({
      success: false,
      error: {
        code: 401,
        type: 'API_KEY_MISSING',
        message: 'API key is required. Send it in the X-API-Key header.',
      },
      timestamp: new Date().toISOString(),
    });
  }

  if (apiKey !== process.env.API_KEY) {
    return res.status(403).json({
      success: false,
      error: {
        code: 403,
        type: 'INVALID_API_KEY',
        message: 'Invalid API key provided.',
      },
      timestamp: new Date().toISOString(),
    });
  }

  next();
}

module.exports = { authenticateToken, optionalAuth, authenticateApiKey };
