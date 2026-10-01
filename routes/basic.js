const express = require('express');
const router = express.Router();
const db = require('../config/db');

// ========================================
// 1. GET /api/hello - Simple greeting
// ========================================
router.get('/hello', (req, res) => {
  res.json({
    success: true,
    message: 'Hello from DummyApi! 🚀 Your API is working perfectly.',
    data: {
      server: 'DummyApi Practice Server',
      version: '1.0.0',
      documentation: 'Visit the root URL (/) for full API documentation',
    },
    timestamp: new Date().toISOString(),
  });
});

// ========================================
// 2. GET /api/products - Get all products
// ========================================
router.get('/products', (req, res) => {
  const products = db.prepare('SELECT * FROM products ORDER BY id ASC').all();
  res.json({
    success: true,
    message: 'Products fetched successfully',
    data: products,
    total: products.length,
    timestamp: new Date().toISOString(),
  });
});

// ========================================
// 3. GET /api/products/:id - Get product by ID
// ========================================
router.get('/products/:id', (req, res) => {
  const { id } = req.params;
  const product = db.prepare('SELECT * FROM products WHERE id = ?').get(id);

  if (!product) {
    return res.status(404).json({
      success: false,
      error: {
        code: 404,
        type: 'NOT_FOUND',
        message: `Product with ID ${id} not found`,
      },
      timestamp: new Date().toISOString(),
    });
  }

  res.json({
    success: true,
    message: 'Product fetched successfully',
    data: product,
    timestamp: new Date().toISOString(),
  });
});

// ========================================
// 4. POST /api/products - Create product
// ========================================
router.post('/products', (req, res) => {
  const { name, description, price, category, image_url, stock, rating } = req.body;

  // Validation
  const errors = [];
  if (!name || name.trim() === '') errors.push({ field: 'name', message: 'Product name is required' });
  if (price === undefined || price === null) errors.push({ field: 'price', message: 'Price is required' });
  else if (typeof price !== 'number' || price < 0) errors.push({ field: 'price', message: 'Price must be a positive number' });
  if (!category || category.trim() === '') errors.push({ field: 'category', message: 'Category is required' });

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

  const result = db.prepare(
    'INSERT INTO products (name, description, price, category, image_url, stock, rating) VALUES (?, ?, ?, ?, ?, ?, ?)'
  ).run(name, description || '', price, category, image_url || '', stock || 0, rating || 0);

  const product = db.prepare('SELECT * FROM products WHERE id = ?').get(result.lastInsertRowid);

  res.status(201).json({
    success: true,
    message: 'Product created successfully',
    data: product,
    timestamp: new Date().toISOString(),
  });
});

// ========================================
// 5. PUT /api/products/:id - Full update
// ========================================
router.put('/products/:id', (req, res) => {
  const { id } = req.params;
  const { name, description, price, category, image_url, stock, rating } = req.body;

  const existing = db.prepare('SELECT * FROM products WHERE id = ?').get(id);
  if (!existing) {
    return res.status(404).json({
      success: false,
      error: {
        code: 404,
        type: 'NOT_FOUND',
        message: `Product with ID ${id} not found`,
      },
      timestamp: new Date().toISOString(),
    });
  }

  // For PUT, all fields are expected
  const errors = [];
  if (!name || name.trim() === '') errors.push({ field: 'name', message: 'Product name is required for full update' });
  if (price === undefined || price === null) errors.push({ field: 'price', message: 'Price is required for full update' });
  if (!category || category.trim() === '') errors.push({ field: 'category', message: 'Category is required for full update' });

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      error: {
        code: 400,
        type: 'VALIDATION_ERROR',
        message: 'PUT requires all required fields (name, price, category)',
        details: errors,
      },
      timestamp: new Date().toISOString(),
    });
  }

  db.prepare(
    'UPDATE products SET name = ?, description = ?, price = ?, category = ?, image_url = ?, stock = ?, rating = ? WHERE id = ?'
  ).run(name, description || '', price, category, image_url || '', stock || 0, rating || 0, id);

  const product = db.prepare('SELECT * FROM products WHERE id = ?').get(id);

  res.json({
    success: true,
    message: 'Product fully updated successfully (PUT)',
    data: product,
    timestamp: new Date().toISOString(),
  });
});

// ========================================
// 6. PATCH /api/products/:id - Partial update
// ========================================
router.patch('/products/:id', (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  const existing = db.prepare('SELECT * FROM products WHERE id = ?').get(id);
  if (!existing) {
    return res.status(404).json({
      success: false,
      error: {
        code: 404,
        type: 'NOT_FOUND',
        message: `Product with ID ${id} not found`,
      },
      timestamp: new Date().toISOString(),
    });
  }

  if (Object.keys(updates).length === 0) {
    return res.status(400).json({
      success: false,
      error: {
        code: 400,
        type: 'VALIDATION_ERROR',
        message: 'At least one field is required for partial update (PATCH)',
      },
      timestamp: new Date().toISOString(),
    });
  }

  // Merge existing with updates
  const allowedFields = ['name', 'description', 'price', 'category', 'image_url', 'stock', 'rating'];
  const merged = { ...existing };
  for (const field of allowedFields) {
    if (updates[field] !== undefined) {
      merged[field] = updates[field];
    }
  }

  db.prepare(
    'UPDATE products SET name = ?, description = ?, price = ?, category = ?, image_url = ?, stock = ?, rating = ? WHERE id = ?'
  ).run(merged.name, merged.description, merged.price, merged.category, merged.image_url, merged.stock, merged.rating, id);

  const product = db.prepare('SELECT * FROM products WHERE id = ?').get(id);

  res.json({
    success: true,
    message: 'Product partially updated successfully (PATCH)',
    data: product,
    timestamp: new Date().toISOString(),
  });
});

// ========================================
// 7. DELETE /api/products/:id - Delete product
// ========================================
router.delete('/products/:id', (req, res) => {
  const { id } = req.params;

  const existing = db.prepare('SELECT * FROM products WHERE id = ?').get(id);
  if (!existing) {
    return res.status(404).json({
      success: false,
      error: {
        code: 404,
        type: 'NOT_FOUND',
        message: `Product with ID ${id} not found`,
      },
      timestamp: new Date().toISOString(),
    });
  }

  db.prepare('DELETE FROM products WHERE id = ?').run(id);

  res.json({
    success: true,
    message: 'Product deleted successfully',
    data: existing,
    timestamp: new Date().toISOString(),
  });
});

// ========================================
// 11. GET /api/categories/:catId/products
// ========================================
router.get('/categories/:catId/products', (req, res) => {
  const { catId } = req.params;
  const validCategories = ['electronics', 'clothing', 'books', 'sports', 'home'];

  if (!validCategories.includes(catId.toLowerCase())) {
    return res.status(404).json({
      success: false,
      error: {
        code: 404,
        type: 'NOT_FOUND',
        message: `Category '${catId}' not found. Valid categories: ${validCategories.join(', ')}`,
      },
      timestamp: new Date().toISOString(),
    });
  }

  const products = db.prepare('SELECT * FROM products WHERE LOWER(category) = ? ORDER BY id ASC').all(catId.toLowerCase());

  res.json({
    success: true,
    message: `Products in category '${catId}' fetched successfully`,
    data: products,
    category: catId,
    total: products.length,
    timestamp: new Date().toISOString(),
  });
});

module.exports = router;
