const express = require('express');
const router = express.Router();
const db = require('../config/db');

// ========================================
// 8. GET /api/users - Paginated user list
// ========================================
router.get('/', (req, res) => {
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 10));
  const offset = (page - 1) * limit;

  const totalItems = db.prepare('SELECT COUNT(*) as count FROM users').get().count;
  const totalPages = Math.ceil(totalItems / limit);

  const users = db.prepare(
    'SELECT id, name, email, avatar, age, city, bio, role, created_at FROM users ORDER BY id ASC LIMIT ? OFFSET ?'
  ).all(limit, offset);

  res.json({
    success: true,
    message: 'Users fetched successfully',
    data: users,
    pagination: {
      current_page: page,
      total_pages: totalPages,
      total_items: totalItems,
      per_page: limit,
      has_next: page < totalPages,
      has_previous: page > 1,
    },
    timestamp: new Date().toISOString(),
  });
});

// ========================================
// 9. GET /api/users/search - Search users
// ========================================
router.get('/search', (req, res) => {
  const { q, age_min, age_max, city, role } = req.query;

  let query = 'SELECT id, name, email, avatar, age, city, bio, role, created_at FROM users WHERE 1=1';
  const params = [];

  if (q) {
    query += ' AND (name LIKE ? OR email LIKE ? OR bio LIKE ?)';
    const searchTerm = `%${q}%`;
    params.push(searchTerm, searchTerm, searchTerm);
  }

  if (age_min) {
    query += ' AND age >= ?';
    params.push(parseInt(age_min));
  }

  if (age_max) {
    query += ' AND age <= ?';
    params.push(parseInt(age_max));
  }

  if (city) {
    query += ' AND LOWER(city) = ?';
    params.push(city.toLowerCase());
  }

  if (role) {
    query += ' AND role = ?';
    params.push(role);
  }

  query += ' ORDER BY id ASC';

  const users = db.prepare(query).all(...params);

  res.json({
    success: true,
    message: `Found ${users.length} user(s) matching your criteria`,
    data: users,
    filters_applied: {
      search_query: q || null,
      age_min: age_min ? parseInt(age_min) : null,
      age_max: age_max ? parseInt(age_max) : null,
      city: city || null,
      role: role || null,
    },
    total: users.length,
    timestamp: new Date().toISOString(),
  });
});

// ========================================
// 10. GET /api/users/sort - Sorted users
// ========================================
router.get('/sort', (req, res) => {
  const { sort_by, order } = req.query;

  const allowedSortFields = ['name', 'email', 'age', 'city', 'created_at', 'id'];
  const sortField = allowedSortFields.includes(sort_by) ? sort_by : 'id';
  const sortOrder = order && order.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';

  const users = db.prepare(
    `SELECT id, name, email, avatar, age, city, bio, role, created_at FROM users ORDER BY ${sortField} ${sortOrder}`
  ).all();

  res.json({
    success: true,
    message: 'Users fetched and sorted successfully',
    data: users,
    sort: {
      sort_by: sortField,
      order: sortOrder,
      available_fields: allowedSortFields,
    },
    total: users.length,
    timestamp: new Date().toISOString(),
  });
});

// ========================================
// GET /api/users/:id - Get single user
// ========================================
router.get('/:id', (req, res) => {
  const { id } = req.params;
  const user = db.prepare(
    'SELECT id, name, email, avatar, age, city, bio, role, created_at FROM users WHERE id = ?'
  ).get(id);

  if (!user) {
    return res.status(404).json({
      success: false,
      error: {
        code: 404,
        type: 'NOT_FOUND',
        message: `User with ID ${id} not found`,
      },
      timestamp: new Date().toISOString(),
    });
  }

  res.json({
    success: true,
    message: 'User fetched successfully',
    data: user,
    timestamp: new Date().toISOString(),
  });
});

module.exports = router;
