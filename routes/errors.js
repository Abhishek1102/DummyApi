const express = require('express');
const router = express.Router();

// ========================================
// 43. GET /api/errors/400 - Bad Request
// ========================================
router.get('/400', (req, res) => {
  res.status(400).json({
    success: false,
    error: {
      code: 400,
      type: 'BAD_REQUEST',
      message: 'The server could not understand the request due to invalid syntax.',
      tip: 'This usually means you sent malformed JSON, missing required fields, or invalid parameter types.',
      android_handling: 'In Retrofit, catch this in onResponse() by checking response.isSuccessful(). Parse error body with response.errorBody().',
    },
    timestamp: new Date().toISOString(),
  });
});

// ========================================
// 44. GET /api/errors/401 - Unauthorized
// ========================================
router.get('/401', (req, res) => {
  res.status(401).json({
    success: false,
    error: {
      code: 401,
      type: 'UNAUTHORIZED',
      message: 'Authentication is required to access this resource.',
      tip: 'This means you need to provide valid credentials (token/API key). Check your Authorization header.',
      android_handling: 'Redirect the user to the login screen. Clear stored tokens. Implement token refresh logic.',
    },
    timestamp: new Date().toISOString(),
  });
});

// ========================================
// 45. GET /api/errors/403 - Forbidden
// ========================================
router.get('/403', (req, res) => {
  res.status(403).json({
    success: false,
    error: {
      code: 403,
      type: 'FORBIDDEN',
      message: 'You do not have permission to access this resource.',
      tip: 'Unlike 401, this means you ARE authenticated but don\'t have the required permissions/role.',
      android_handling: 'Show a permission denied message. Don\'t redirect to login since the user IS authenticated.',
    },
    timestamp: new Date().toISOString(),
  });
});

// ========================================
// 46. GET /api/errors/404 - Not Found
// ========================================
router.get('/404', (req, res) => {
  res.status(404).json({
    success: false,
    error: {
      code: 404,
      type: 'NOT_FOUND',
      message: 'The requested resource was not found on this server.',
      tip: 'Check the URL, path parameters, and resource IDs. The resource may have been deleted.',
      android_handling: 'Show a "not found" UI state. Maybe show a retry button or navigate back.',
    },
    timestamp: new Date().toISOString(),
  });
});

// ========================================
// 47. GET /api/errors/500 - Server Error
// ========================================
router.get('/500', (req, res) => {
  res.status(500).json({
    success: false,
    error: {
      code: 500,
      type: 'INTERNAL_SERVER_ERROR',
      message: 'An unexpected error occurred on the server.',
      tip: 'This is a server-side error. The client did nothing wrong. Implement retry with exponential backoff.',
      android_handling: 'Show a generic error message like "Something went wrong. Please try again." with a retry button.',
    },
    timestamp: new Date().toISOString(),
  });
});

// ========================================
// 48. GET /api/errors/timeout - Timeout sim
// ========================================
router.get('/timeout', (req, res) => {
  // Never responds - simulates a timeout
  // The client's timeout setting will trigger the error
  // We'll keep the connection open without responding
  // After 5 minutes, send a response (but client should timeout before this)
  req.on('close', () => {
    // Client disconnected (timed out or cancelled)
  });

  // Don't call res.json() - let it hang
  // Set a very long timeout so Express doesn't close it
  req.setTimeout(300000); // 5 minutes
});

module.exports = router;
