const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { authenticateToken, optionalAuth } = require('../middleware/auth');

// ========================================
// 29. GET /api/posts - Get all posts
// ========================================
router.get('/', (req, res) => {
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 10));
  const offset = (page - 1) * limit;

  const totalItems = db.prepare('SELECT COUNT(*) as count FROM posts').get().count;
  const totalPages = Math.ceil(totalItems / limit);

  const posts = db.prepare(`
    SELECT 
      p.id, p.title, p.content, p.image_url, p.likes, p.created_at,
      u.id as author_id, u.name as author_name, u.email as author_email, u.avatar as author_avatar,
      (SELECT COUNT(*) FROM comments c WHERE c.post_id = p.id) as comment_count
    FROM posts p
    LEFT JOIN users u ON p.user_id = u.id
    ORDER BY p.created_at DESC
    LIMIT ? OFFSET ?
  `).all(limit, offset);

  // Format response with nested author object
  const formattedPosts = posts.map(post => ({
    id: post.id,
    title: post.title,
    content: post.content,
    image_url: post.image_url,
    likes: post.likes,
    comment_count: post.comment_count,
    created_at: post.created_at,
    author: {
      id: post.author_id,
      name: post.author_name,
      email: post.author_email,
      avatar: post.author_avatar,
    },
  }));

  res.json({
    success: true,
    message: 'Posts fetched successfully',
    data: formattedPosts,
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
// 30. GET /api/posts/:id - Get post with comments
// ========================================
router.get('/:id', (req, res) => {
  const { id } = req.params;

  const post = db.prepare(`
    SELECT 
      p.id, p.title, p.content, p.image_url, p.likes, p.created_at,
      u.id as author_id, u.name as author_name, u.email as author_email, u.avatar as author_avatar
    FROM posts p
    LEFT JOIN users u ON p.user_id = u.id
    WHERE p.id = ?
  `).get(id);

  if (!post) {
    return res.status(404).json({
      success: false,
      error: {
        code: 404,
        type: 'NOT_FOUND',
        message: `Post with ID ${id} not found`,
      },
      timestamp: new Date().toISOString(),
    });
  }

  // Get comments for this post
  const comments = db.prepare(`
    SELECT 
      c.id, c.content, c.created_at,
      u.id as user_id, u.name as user_name, u.avatar as user_avatar
    FROM comments c
    LEFT JOIN users u ON c.user_id = u.id
    WHERE c.post_id = ?
    ORDER BY c.created_at ASC
  `).all(id);

  const formattedComments = comments.map(c => ({
    id: c.id,
    content: c.content,
    created_at: c.created_at,
    user: {
      id: c.user_id,
      name: c.user_name,
      avatar: c.user_avatar,
    },
  }));

  res.json({
    success: true,
    message: 'Post fetched successfully with comments',
    data: {
      id: post.id,
      title: post.title,
      content: post.content,
      image_url: post.image_url,
      likes: post.likes,
      created_at: post.created_at,
      author: {
        id: post.author_id,
        name: post.author_name,
        email: post.author_email,
        avatar: post.author_avatar,
      },
      comments: formattedComments,
      comment_count: formattedComments.length,
    },
    timestamp: new Date().toISOString(),
  });
});

// ========================================
// 31. POST /api/posts - Create post (auth)
// ========================================
router.post('/', authenticateToken, (req, res) => {
  const { title, content, image_url } = req.body;

  const errors = [];
  if (!title || title.trim().length < 3) errors.push({ field: 'title', message: 'Title is required and must be at least 3 characters' });
  if (!content || content.trim().length < 10) errors.push({ field: 'content', message: 'Content is required and must be at least 10 characters' });

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
    'INSERT INTO posts (user_id, title, content, image_url) VALUES (?, ?, ?, ?)'
  ).run(req.user.id, title.trim(), content.trim(), image_url || null);

  const post = db.prepare(`
    SELECT 
      p.id, p.title, p.content, p.image_url, p.likes, p.created_at,
      u.id as author_id, u.name as author_name, u.email as author_email
    FROM posts p
    LEFT JOIN users u ON p.user_id = u.id
    WHERE p.id = ?
  `).get(result.lastInsertRowid);

  res.status(201).json({
    success: true,
    message: 'Post created successfully',
    data: {
      id: post.id,
      title: post.title,
      content: post.content,
      image_url: post.image_url,
      likes: post.likes,
      created_at: post.created_at,
      author: {
        id: post.author_id,
        name: post.author_name,
        email: post.author_email,
      },
    },
    timestamp: new Date().toISOString(),
  });
});

// ========================================
// 32. POST /api/posts/:postId/comments
// ========================================
router.post('/:postId/comments', authenticateToken, (req, res) => {
  const { postId } = req.params;
  const { content } = req.body;

  // Check if post exists
  const post = db.prepare('SELECT id FROM posts WHERE id = ?').get(postId);
  if (!post) {
    return res.status(404).json({
      success: false,
      error: {
        code: 404,
        type: 'NOT_FOUND',
        message: `Post with ID ${postId} not found`,
      },
      timestamp: new Date().toISOString(),
    });
  }

  if (!content || content.trim().length < 1) {
    return res.status(400).json({
      success: false,
      error: {
        code: 400,
        type: 'VALIDATION_ERROR',
        message: 'Comment content is required',
      },
      timestamp: new Date().toISOString(),
    });
  }

  const result = db.prepare(
    'INSERT INTO comments (post_id, user_id, content) VALUES (?, ?, ?)'
  ).run(postId, req.user.id, content.trim());

  const comment = db.prepare(`
    SELECT 
      c.id, c.content, c.created_at,
      u.id as user_id, u.name as user_name, u.avatar as user_avatar
    FROM comments c
    LEFT JOIN users u ON c.user_id = u.id
    WHERE c.id = ?
  `).get(result.lastInsertRowid);

  res.status(201).json({
    success: true,
    message: 'Comment added successfully',
    data: {
      id: comment.id,
      content: comment.content,
      created_at: comment.created_at,
      post_id: parseInt(postId),
      user: {
        id: comment.user_id,
        name: comment.user_name,
        avatar: comment.user_avatar,
      },
    },
    timestamp: new Date().toISOString(),
  });
});

// ========================================
// 33. DELETE /api/posts/:postId/comments/:commentId
// ========================================
router.delete('/:postId/comments/:commentId', authenticateToken, (req, res) => {
  const { postId, commentId } = req.params;

  const comment = db.prepare('SELECT * FROM comments WHERE id = ? AND post_id = ?').get(commentId, postId);
  if (!comment) {
    return res.status(404).json({
      success: false,
      error: {
        code: 404,
        type: 'NOT_FOUND',
        message: `Comment with ID ${commentId} not found in post ${postId}`,
      },
      timestamp: new Date().toISOString(),
    });
  }

  // Only the comment author or admin can delete
  if (comment.user_id !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      error: {
        code: 403,
        type: 'FORBIDDEN',
        message: 'You can only delete your own comments',
      },
      timestamp: new Date().toISOString(),
    });
  }

  db.prepare('DELETE FROM comments WHERE id = ?').run(commentId);

  res.json({
    success: true,
    message: 'Comment deleted successfully',
    data: {
      deleted_comment_id: parseInt(commentId),
      post_id: parseInt(postId),
    },
    timestamp: new Date().toISOString(),
  });
});

// ========================================
// 34. POST /api/posts/:id/like - Toggle like
// ========================================
router.post('/:id/like', optionalAuth, (req, res) => {
  const { id } = req.params;

  const post = db.prepare('SELECT * FROM posts WHERE id = ?').get(id);
  if (!post) {
    return res.status(404).json({
      success: false,
      error: {
        code: 404,
        type: 'NOT_FOUND',
        message: `Post with ID ${id} not found`,
      },
      timestamp: new Date().toISOString(),
    });
  }

  // Simple toggle: increment likes
  const newLikes = post.likes + 1;
  db.prepare('UPDATE posts SET likes = ? WHERE id = ?').run(newLikes, id);

  res.json({
    success: true,
    message: 'Post liked successfully',
    data: {
      post_id: parseInt(id),
      likes: newLikes,
      previous_likes: post.likes,
    },
    timestamp: new Date().toISOString(),
  });
});

module.exports = router;
