const express = require('express');
const router = express.Router();
const { authenticateApiKey } = require('../middleware/auth');

// ========================================
// 19. GET /api/secure/data - API Key auth
// ========================================
router.get('/secure/data', authenticateApiKey, (req, res) => {
  res.json({
    success: true,
    message: 'Access granted! You provided a valid API key.',
    data: {
      secret_message: 'This is protected data that requires an X-API-Key header.',
      tips: [
        'In Retrofit, add headers using @Header annotation or OkHttp Interceptor',
        'In Dio (Flutter), use dio.options.headers or interceptors',
        'Store API keys securely - never hardcode them in your app',
      ],
      server_info: {
        uptime: process.uptime(),
        memory_usage: process.memoryUsage().heapUsed,
        node_version: process.version,
      },
    },
    timestamp: new Date().toISOString(),
  });
});

// ========================================
// 20. GET /api/headers/echo - Echo headers
// ========================================
router.get('/echo', (req, res) => {
  res.json({
    success: true,
    message: 'Here are all the headers you sent with this request',
    data: {
      headers: req.headers,
      method: req.method,
      url: req.originalUrl,
      ip: req.ip,
      protocol: req.protocol,
    },
    timestamp: new Date().toISOString(),
  });
});

// ========================================
// 21. POST /api/headers/custom - Custom headers
// ========================================
router.post('/custom', (req, res) => {
  const appVersion = req.headers['x-app-version'];
  const deviceType = req.headers['x-device-type'];
  const platform = req.headers['x-platform'];

  const missingHeaders = [];
  if (!appVersion) missingHeaders.push('X-App-Version (e.g., "1.0.0")');
  if (!deviceType) missingHeaders.push('X-Device-Type (e.g., "mobile", "tablet", "desktop")');

  if (missingHeaders.length > 0) {
    return res.status(400).json({
      success: false,
      error: {
        code: 400,
        type: 'MISSING_HEADERS',
        message: 'Required custom headers are missing',
        details: missingHeaders.map(h => ({ header: h, message: `Header ${h} is required` })),
        hint: 'In Android/Flutter, add custom headers to your HTTP client',
      },
      timestamp: new Date().toISOString(),
    });
  }

  res.json({
    success: true,
    message: 'Custom headers received successfully!',
    data: {
      received_headers: {
        app_version: appVersion,
        device_type: deviceType,
        platform: platform || 'not provided (optional)',
      },
      body: req.body,
      tip: 'Great! You can now add custom headers to any request.',
    },
    timestamp: new Date().toISOString(),
  });
});

// ========================================
// 22. GET /api/headers/accept - Content negotiation
// ========================================
router.get('/accept', (req, res) => {
  const acceptHeader = req.headers['accept'] || 'application/json';

  if (acceptHeader.includes('application/xml') || acceptHeader.includes('text/xml')) {
    res.set('Content-Type', 'application/xml');
    return res.send(`<?xml version="1.0" encoding="UTF-8"?>
<response>
  <success>true</success>
  <message>Response in XML format based on your Accept header</message>
  <data>
    <format>XML</format>
    <accept_header>${acceptHeader}</accept_header>
    <tip>You requested XML! Change Accept header to application/json for JSON.</tip>
    <items>
      <item><id>1</id><name>Item One</name></item>
      <item><id>2</id><name>Item Two</name></item>
      <item><id>3</id><name>Item Three</name></item>
    </items>
  </data>
  <timestamp>${new Date().toISOString()}</timestamp>
</response>`);
  }

  if (acceptHeader.includes('text/plain')) {
    res.set('Content-Type', 'text/plain');
    return res.send(`Response in Plain Text format
Accept Header: ${acceptHeader}
Tip: Change Accept header to application/json or application/xml for other formats.
Items: Item One, Item Two, Item Three
Timestamp: ${new Date().toISOString()}`);
  }

  // Default: JSON
  res.json({
    success: true,
    message: 'Response in JSON format based on your Accept header',
    data: {
      format: 'JSON',
      accept_header: acceptHeader,
      tip: 'Try changing the Accept header to "application/xml" or "text/plain" for different response formats.',
      items: [
        { id: 1, name: 'Item One' },
        { id: 2, name: 'Item Two' },
        { id: 3, name: 'Item Three' },
      ],
    },
    timestamp: new Date().toISOString(),
  });
});

module.exports = router;
