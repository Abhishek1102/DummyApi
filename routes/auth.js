const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const db = require('../config/db');
const { authenticateToken } = require('../middleware/auth');

const JWT_SECRET = process.env.JWT_SECRET || 'practice-jwt-secret-key-2024-secure-random-string';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'practice-jwt-refresh-secret-key-2024-secure-random-string';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1h';
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '7d';

// ========================================
// 12. POST /api/auth/register - Register
// ========================================
router.post('/register', (req, res) => {
  const { name, email, password, age, city, bio } = req.body;

  // Validation
  const errors = [];
  if (!name || name.trim().length < 2) errors.push({ field: 'name', message: 'Name is required and must be at least 2 characters' });
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.push({ field: 'email', message: 'A valid email address is required' });
  if (!password || password.length < 6) errors.push({ field: 'password', message: 'Password must be at least 6 characters' });
  if (age !== undefined && (typeof age !== 'number' || age < 1 || age > 150)) errors.push({ field: 'age', message: 'Age must be a number between 1 and 150' });

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      error: {
        code: 400,
        type: 'VALIDATION_ERROR',
        message: 'Registration failed due to invalid input',
        details: errors,
      },
      timestamp: new Date().toISOString(),
    });
  }

  // Check if email already exists
  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
  if (existing) {
    return res.status(409).json({
      success: false,
      error: {
        code: 409,
        type: 'CONFLICT',
        message: 'A user with this email already exists',
      },
      timestamp: new Date().toISOString(),
    });
  }

  // Hash password
  const salt = bcrypt.genSaltSync(10);
  const hashedPassword = bcrypt.hashSync(password, salt);

  // Insert user
  const result = db.prepare(
    'INSERT INTO users (name, email, password, age, city, bio) VALUES (?, ?, ?, ?, ?, ?)'
  ).run(name.trim(), email.toLowerCase().trim(), hashedPassword, age || null, city || null, bio || null);

  const user = db.prepare('SELECT id, name, email, age, city, bio, role, created_at FROM users WHERE id = ?').get(result.lastInsertRowid);

  // Generate tokens
  const accessToken = jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );

  const refreshToken = jwt.sign(
    { id: user.id, email: user.email },
    JWT_REFRESH_SECRET,
    { expiresIn: JWT_REFRESH_EXPIRES_IN }
  );

  res.status(201).json({
    success: true,
    message: 'User registered successfully',
    data: {
      user,
      access_token: accessToken,
      refresh_token: refreshToken,
      token_type: 'Bearer',
      expires_in: JWT_EXPIRES_IN,
    },
    timestamp: new Date().toISOString(),
  });
});

// ========================================
// 13. POST /api/auth/login - Login
// ========================================
router.post('/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      error: {
        code: 400,
        type: 'VALIDATION_ERROR',
        message: 'Email and password are required',
        details: [
          ...(!email ? [{ field: 'email', message: 'Email is required' }] : []),
          ...(!password ? [{ field: 'password', message: 'Password is required' }] : []),
        ],
      },
      timestamp: new Date().toISOString(),
    });
  }

  // Find user
  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email.toLowerCase().trim());
  if (!user) {
    return res.status(401).json({
      success: false,
      error: {
        code: 401,
        type: 'AUTHENTICATION_ERROR',
        message: 'Invalid email or password',
      },
      timestamp: new Date().toISOString(),
    });
  }

  // Check password
  const isMatch = bcrypt.compareSync(password, user.password);
  if (!isMatch) {
    return res.status(401).json({
      success: false,
      error: {
        code: 401,
        type: 'AUTHENTICATION_ERROR',
        message: 'Invalid email or password',
      },
      timestamp: new Date().toISOString(),
    });
  }

  // Generate tokens
  const accessToken = jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );

  const refreshToken = jwt.sign(
    { id: user.id, email: user.email },
    JWT_REFRESH_SECRET,
    { expiresIn: JWT_REFRESH_EXPIRES_IN }
  );

  const { password: _, ...userWithoutPassword } = user;

  res.json({
    success: true,
    message: 'Login successful',
    data: {
      user: userWithoutPassword,
      access_token: accessToken,
      refresh_token: refreshToken,
      token_type: 'Bearer',
      expires_in: JWT_EXPIRES_IN,
    },
    timestamp: new Date().toISOString(),
  });
});

// ========================================
// 14. POST /api/auth/refresh - Refresh token
// ========================================
router.post('/refresh', (req, res) => {
  const { refresh_token } = req.body;

  if (!refresh_token) {
    return res.status(400).json({
      success: false,
      error: {
        code: 400,
        type: 'VALIDATION_ERROR',
        message: 'Refresh token is required in the request body',
      },
      timestamp: new Date().toISOString(),
    });
  }

  try {
    const decoded = jwt.verify(refresh_token, JWT_REFRESH_SECRET);
    const user = db.prepare('SELECT id, email, role FROM users WHERE id = ?').get(decoded.id);

    if (!user) {
      return res.status(401).json({
        success: false,
        error: {
          code: 401,
          type: 'AUTHENTICATION_ERROR',
          message: 'User no longer exists',
        },
        timestamp: new Date().toISOString(),
      });
    }

    const newAccessToken = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    const newRefreshToken = jwt.sign(
      { id: user.id, email: user.email },
      JWT_REFRESH_SECRET,
      { expiresIn: JWT_REFRESH_EXPIRES_IN }
    );

    res.json({
      success: true,
      message: 'Token refreshed successfully',
      data: {
        access_token: newAccessToken,
        refresh_token: newRefreshToken,
        token_type: 'Bearer',
        expires_in: JWT_EXPIRES_IN,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    return res.status(401).json({
      success: false,
      error: {
        code: 401,
        type: 'INVALID_REFRESH_TOKEN',
        message: 'Invalid or expired refresh token. Please login again.',
      },
      timestamp: new Date().toISOString(),
    });
  }
});

// ========================================
// 15. GET /api/auth/profile - Get profile
// ========================================
router.get('/profile', authenticateToken, (req, res) => {
  const user = db.prepare('SELECT id, name, email, avatar, age, city, bio, role, created_at, updated_at FROM users WHERE id = ?').get(req.user.id);

  if (!user) {
    return res.status(404).json({
      success: false,
      error: {
        code: 404,
        type: 'NOT_FOUND',
        message: 'User profile not found',
      },
      timestamp: new Date().toISOString(),
    });
  }

  res.json({
    success: true,
    message: 'Profile fetched successfully',
    data: user,
    timestamp: new Date().toISOString(),
  });
});

// ========================================
// 16. PUT /api/auth/profile - Update profile
// ========================================
router.put('/profile', authenticateToken, (req, res) => {
  const { name, age, city, bio } = req.body;

  const errors = [];
  if (name !== undefined && name.trim().length < 2) errors.push({ field: 'name', message: 'Name must be at least 2 characters' });
  if (age !== undefined && (typeof age !== 'number' || age < 1 || age > 150)) errors.push({ field: 'age', message: 'Age must be between 1 and 150' });

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      error: {
        code: 400,
        type: 'VALIDATION_ERROR',
        message: 'Invalid input data',
        details: errors,
      },
      timestamp: new Date().toISOString(),
    });
  }

  const existing = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.id);

  db.prepare(
    'UPDATE users SET name = ?, age = ?, city = ?, bio = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?'
  ).run(
    name !== undefined ? name.trim() : existing.name,
    age !== undefined ? age : existing.age,
    city !== undefined ? city : existing.city,
    bio !== undefined ? bio : existing.bio,
    req.user.id
  );

  const user = db.prepare('SELECT id, name, email, avatar, age, city, bio, role, created_at, updated_at FROM users WHERE id = ?').get(req.user.id);

  res.json({
    success: true,
    message: 'Profile updated successfully',
    data: user,
    timestamp: new Date().toISOString(),
  });
});

// ========================================
// 17. POST /api/auth/change-password
// ========================================
router.post('/change-password', authenticateToken, (req, res) => {
  const { current_password, new_password } = req.body;

  if (!current_password || !new_password) {
    return res.status(400).json({
      success: false,
      error: {
        code: 400,
        type: 'VALIDATION_ERROR',
        message: 'Both current_password and new_password are required',
      },
      timestamp: new Date().toISOString(),
    });
  }

  if (new_password.length < 6) {
    return res.status(400).json({
      success: false,
      error: {
        code: 400,
        type: 'VALIDATION_ERROR',
        message: 'New password must be at least 6 characters',
      },
      timestamp: new Date().toISOString(),
    });
  }

  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.id);
  const isMatch = bcrypt.compareSync(current_password, user.password);

  if (!isMatch) {
    return res.status(401).json({
      success: false,
      error: {
        code: 401,
        type: 'AUTHENTICATION_ERROR',
        message: 'Current password is incorrect',
      },
      timestamp: new Date().toISOString(),
    });
  }

  const salt = bcrypt.genSaltSync(10);
  const hashedPassword = bcrypt.hashSync(new_password, salt);

  db.prepare('UPDATE users SET password = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(hashedPassword, req.user.id);

  res.json({
    success: true,
    message: 'Password changed successfully',
    timestamp: new Date().toISOString(),
  });
});

// ========================================
// 18. POST /api/auth/logout - Logout
// ========================================
router.post('/logout', authenticateToken, (req, res) => {
  // Blacklist the current token
  db.prepare('INSERT OR IGNORE INTO blacklisted_tokens (token) VALUES (?)').run(req.token);

  res.json({
    success: true,
    message: 'Logged out successfully. Token has been invalidated.',
    timestamp: new Date().toISOString(),
  });
});

module.exports = router;
