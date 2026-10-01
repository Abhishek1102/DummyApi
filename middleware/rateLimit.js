const rateLimit = require('express-rate-limit');

/**
 * Strict rate limiter for demo purposes
 * 5 requests per minute
 */
const strictLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      code: 429,
      type: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many requests. You are limited to 5 requests per minute on this endpoint.',
      retry_after_seconds: 60,
    },
    timestamp: new Date().toISOString(),
  },
});

/**
 * General rate limiter for the whole API
 * 100 requests per minute
 */
const generalLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      code: 429,
      type: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many requests. Please slow down.',
    },
    timestamp: new Date().toISOString(),
  },
});

module.exports = { strictLimiter, generalLimiter };
