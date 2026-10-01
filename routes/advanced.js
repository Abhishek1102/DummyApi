const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const { strictLimiter } = require('../middleware/rateLimit');

// ========================================
// 35. GET /api/advanced/delayed - Delayed response
// ========================================
router.get('/delayed', (req, res) => {
  const seconds = Math.min(30, Math.max(1, parseInt(req.query.seconds) || 3));

  // Set a header to indicate intended delay
  res.set('X-Intended-Delay', `${seconds}s`);

  setTimeout(() => {
    res.json({
      success: true,
      message: `Response delayed by ${seconds} second(s) as requested`,
      data: {
        delay_seconds: seconds,
        tip: 'Use this to test timeout handling in your HTTP client. Set OkHttp/Dio timeout lower than this delay to see timeout errors.',
      },
      timestamp: new Date().toISOString(),
    });
  }, seconds * 1000);
});

// ========================================
// 36. GET /api/advanced/random-error
// ========================================
router.get('/random-error', (req, res) => {
  const random = Math.random();

  if (random < 0.5) {
    return res.status(500).json({
      success: false,
      error: {
        code: 500,
        type: 'RANDOM_SERVER_ERROR',
        message: 'Random server error occurred (50% chance). Try again!',
        tip: 'Implement retry logic in your app to handle intermittent failures.',
      },
      timestamp: new Date().toISOString(),
    });
  }

  res.json({
    success: true,
    message: 'Request succeeded (50% chance). You got lucky!',
    data: {
      random_value: random.toFixed(4),
      tip: 'This endpoint randomly fails 50% of the time. Use it to practice error handling and retry logic.',
    },
    timestamp: new Date().toISOString(),
  });
});

// ========================================
// 37. POST /api/advanced/form-data
// ========================================
router.post('/form-data', express.urlencoded({ extended: true }), (req, res) => {
  if (Object.keys(req.body).length === 0) {
    return res.status(400).json({
      success: false,
      error: {
        code: 400,
        type: 'EMPTY_BODY',
        message: 'No form data received. Send data as application/x-www-form-urlencoded.',
        hint: 'In Retrofit, use @FormUrlEncoded and @Field annotations. In Dio, use FormData.',
      },
      timestamp: new Date().toISOString(),
    });
  }

  res.json({
    success: true,
    message: 'Form URL-encoded data received successfully',
    data: {
      received_fields: req.body,
      content_type: req.headers['content-type'],
      tip: 'This endpoint accepts application/x-www-form-urlencoded data, not JSON.',
    },
    timestamp: new Date().toISOString(),
  });
});

// ========================================
// 38. GET /api/advanced/large-response
// ========================================
router.get('/large-response', (req, res) => {
  const count = Math.min(5000, Math.max(100, parseInt(req.query.count) || 1000));

  const items = [];
  for (let i = 1; i <= count; i++) {
    items.push({
      id: i,
      name: `Item #${i}`,
      description: `This is the description for item number ${i}. It contains some text to make the response larger.`,
      price: parseFloat((Math.random() * 10000).toFixed(2)),
      category: ['Electronics', 'Clothing', 'Books', 'Sports', 'Home'][i % 5],
      in_stock: Math.random() > 0.3,
      rating: parseFloat((Math.random() * 5).toFixed(1)),
      created_at: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
    });
  }

  res.json({
    success: true,
    message: `Generated ${count} items. Use ?count=N to change the number (100-5000).`,
    data: items,
    total: items.length,
    tip: 'Use this to test how your app handles large JSON responses. Consider implementing lazy loading or pagination.',
    timestamp: new Date().toISOString(),
  });
});

// ========================================
// 39. GET /api/advanced/image-response
// ========================================
router.get('/image-response', (req, res) => {
  // Generate a simple 1x1 pixel PNG as binary response
  const pngBuffer = Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
    'base64'
  );

  res.set('Content-Type', 'image/png');
  res.set('Content-Disposition', 'inline; filename="sample.png"');
  res.set('X-Image-Info', 'This is a 1x1 pixel PNG image returned as binary');
  res.send(pngBuffer);
});

// ========================================
// 40. GET /api/advanced/status/:code
// ========================================
router.get('/status/:code', (req, res) => {
  const code = parseInt(req.params.code);
  const validCodes = {
    200: { type: 'OK', message: 'Request was successful' },
    201: { type: 'CREATED', message: 'Resource was created successfully' },
    204: { type: 'NO_CONTENT', message: 'Request successful, no content to return' },
    301: { type: 'MOVED_PERMANENTLY', message: 'Resource has been permanently moved' },
    302: { type: 'FOUND', message: 'Resource temporarily at a different URI' },
    400: { type: 'BAD_REQUEST', message: 'The request was malformed or invalid' },
    401: { type: 'UNAUTHORIZED', message: 'Authentication is required' },
    403: { type: 'FORBIDDEN', message: 'You do not have permission to access this resource' },
    404: { type: 'NOT_FOUND', message: 'The requested resource was not found' },
    405: { type: 'METHOD_NOT_ALLOWED', message: 'The HTTP method is not allowed for this endpoint' },
    409: { type: 'CONFLICT', message: 'Request conflicts with current state of the resource' },
    422: { type: 'UNPROCESSABLE_ENTITY', message: 'The request was well-formed but has semantic errors' },
    429: { type: 'TOO_MANY_REQUESTS', message: 'Rate limit exceeded, slow down' },
    500: { type: 'INTERNAL_SERVER_ERROR', message: 'An unexpected error occurred on the server' },
    502: { type: 'BAD_GATEWAY', message: 'Invalid response from upstream server' },
    503: { type: 'SERVICE_UNAVAILABLE', message: 'Server is temporarily unavailable' },
  };

  const statusInfo = validCodes[code];

  if (!statusInfo) {
    return res.status(400).json({
      success: false,
      error: {
        code: 400,
        type: 'INVALID_STATUS_CODE',
        message: `Status code ${code} is not in our demo list.`,
        available_codes: Object.keys(validCodes).map(Number),
      },
      timestamp: new Date().toISOString(),
    });
  }

  if (code === 204) {
    return res.status(204).send();
  }

  const isSuccess = code >= 200 && code < 300;

  res.status(code).json({
    success: isSuccess,
    ...(isSuccess
      ? {
          message: `Status ${code}: ${statusInfo.message}`,
          data: { status_code: code, status_type: statusInfo.type },
        }
      : {
          error: {
            code: code,
            type: statusInfo.type,
            message: `Status ${code}: ${statusInfo.message}`,
          },
        }),
    tip: `This endpoint returns whatever HTTP status code you specify. Available codes: ${Object.keys(validCodes).join(', ')}`,
    timestamp: new Date().toISOString(),
  });
});

// ========================================
// 41. GET /api/advanced/rate-limited
// ========================================
router.get('/rate-limited', strictLimiter, (req, res) => {
  res.json({
    success: true,
    message: 'Request successful! This endpoint is rate-limited to 5 requests per minute.',
    data: {
      requests_info: 'Check the X-RateLimit-* response headers for rate limit details',
      tip: 'When you get a 429 response, implement exponential backoff in your app.',
    },
    timestamp: new Date().toISOString(),
  });
});

// ========================================
// 42. POST /api/advanced/validate
// ========================================
router.post('/validate', (req, res) => {
  const { email, password, name, age, phone, website, agree_terms } = req.body;
  const errors = [];

  // Email validation
  if (!email) {
    errors.push({ field: 'email', message: 'Email is required' });
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.push({ field: 'email', message: 'Must be a valid email address (e.g., user@example.com)' });
  }

  // Password validation
  if (!password) {
    errors.push({ field: 'password', message: 'Password is required' });
  } else {
    if (password.length < 8) errors.push({ field: 'password', message: 'Must be at least 8 characters long' });
    if (!/[A-Z]/.test(password)) errors.push({ field: 'password', message: 'Must contain at least one uppercase letter' });
    if (!/[a-z]/.test(password)) errors.push({ field: 'password', message: 'Must contain at least one lowercase letter' });
    if (!/[0-9]/.test(password)) errors.push({ field: 'password', message: 'Must contain at least one number' });
    if (!/[!@#$%^&*]/.test(password)) errors.push({ field: 'password', message: 'Must contain at least one special character (!@#$%^&*)' });
  }

  // Name validation
  if (!name) {
    errors.push({ field: 'name', message: 'Name is required' });
  } else if (name.trim().length < 2 || name.trim().length > 50) {
    errors.push({ field: 'name', message: 'Must be between 2 and 50 characters' });
  }

  // Age validation
  if (age === undefined || age === null) {
    errors.push({ field: 'age', message: 'Age is required' });
  } else if (typeof age !== 'number' || age < 13 || age > 120) {
    errors.push({ field: 'age', message: 'Must be a number between 13 and 120' });
  }

  // Phone validation (optional but must be valid if provided)
  if (phone && !/^\+?[1-9]\d{6,14}$/.test(phone)) {
    errors.push({ field: 'phone', message: 'Must be a valid phone number (e.g., +919876543210)' });
  }

  // Website validation (optional but must be valid if provided)
  if (website && !/^https?:\/\/.+\..+$/.test(website)) {
    errors.push({ field: 'website', message: 'Must be a valid URL starting with http:// or https://' });
  }

  // Terms agreement
  if (agree_terms !== true) {
    errors.push({ field: 'agree_terms', message: 'You must agree to the terms and conditions (send true)' });
  }

  if (errors.length > 0) {
    return res.status(422).json({
      success: false,
      error: {
        code: 422,
        type: 'VALIDATION_ERROR',
        message: `Validation failed with ${errors.length} error(s)`,
        details: errors,
      },
      timestamp: new Date().toISOString(),
    });
  }

  res.json({
    success: true,
    message: 'All validations passed! Your data is valid.',
    data: {
      validated_fields: { email, name, age, phone: phone || null, website: website || null, agree_terms },
    },
    timestamp: new Date().toISOString(),
  });
});

module.exports = router;
