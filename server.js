require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// ===== Ensure upload directories exist =====
const uploadDirs = ['uploads/images', 'uploads/videos', 'uploads/documents'];
uploadDirs.forEach(dir => {
  const fullPath = path.join(__dirname, dir);
  if (!fs.existsSync(fullPath)) {
    fs.mkdirSync(fullPath, { recursive: true });
  }
});

// ===== Middleware =====
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Request logger middleware
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`${req.method} ${req.originalUrl} ${res.statusCode} - ${duration}ms`);
  });
  next();
});

// ===== Seed Database =====
const seedDatabase = require('./data/seed');
seedDatabase();

// ===== Routes =====
const basicRoutes = require('./routes/basic');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const postRoutes = require('./routes/posts');
const uploadRoutes = require('./routes/upload');
const headerRoutes = require('./routes/headers');
const advancedRoutes = require('./routes/advanced');
const errorRoutes = require('./routes/errors');

app.use('/api', basicRoutes);          // /api/hello, /api/products, /api/categories
app.use('/api/auth', authRoutes);       // /api/auth/login, register, etc.
app.use('/api/users', userRoutes);      // /api/users, /api/users/search, etc.
app.use('/api/posts', postRoutes);      // /api/posts, /api/posts/:id/comments, etc.
app.use('/api/upload', uploadRoutes);   // /api/upload/image, video, document, etc.
app.use('/api/headers', headerRoutes);  // /api/headers/echo, custom, accept
app.use('/api/secure', headerRoutes);   // /api/secure/data (API key)
app.use('/api/advanced', advancedRoutes); // /api/advanced/delayed, rate-limited, etc.
app.use('/api/errors', errorRoutes);    // /api/errors/400, 401, 404, 500, timeout

// ===== Root - API Documentation Page =====
app.get('/', (req, res) => {
  const baseUrl = `${req.protocol}://${req.get('host')}`;
  res.send(generateDocPage(baseUrl));
});

// ===== 404 Handler =====
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: {
      code: 404,
      type: 'ENDPOINT_NOT_FOUND',
      message: `The endpoint ${req.method} ${req.originalUrl} does not exist.`,
      hint: `Visit ${req.protocol}://${req.get('host')}/ for the full API documentation.`,
    },
    timestamp: new Date().toISOString(),
  });
});

// ===== Global Error Handler =====
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    success: false,
    error: {
      code: 500,
      type: 'INTERNAL_SERVER_ERROR',
      message: 'An unexpected error occurred on the server.',
    },
    timestamp: new Date().toISOString(),
  });
});

// ===== Start Server =====
app.listen(PORT, () => {
  console.log('');
  console.log('╔══════════════════════════════════════════════════╗');
  console.log('║                                                  ║');
  console.log('║   🚀 DummyApi Practice Server is RUNNING!       ║');
  console.log(`║   📡 URL: http://localhost:${PORT}                  ║`);
  console.log('║   📖 Docs: Visit root URL in browser            ║');
  console.log('║                                                  ║');
  console.log('║   📌 Test Account:                               ║');
  console.log('║      Email:    test@example.com                  ║');
  console.log('║      Password: password123                       ║');
  console.log('║      API Key:  practice-api-key-2024             ║');
  console.log('║                                                  ║');
  console.log('╚══════════════════════════════════════════════════╝');
  console.log('');
});

// ===== HTML Documentation Page Generator =====
function generateDocPage(baseUrl) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>DummyApi - API Practice Server</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
      background: #0f172a;
      color: #e2e8f0;
      line-height: 1.6;
    }
    .container { max-width: 1100px; margin: 0 auto; padding: 20px; }
    header {
      text-align: center;
      padding: 40px 20px;
      background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
      border-bottom: 1px solid #1e293b;
    }
    header h1 { font-size: 2.5rem; color: #38bdf8; margin-bottom: 10px; }
    header p { color: #94a3b8; font-size: 1.1rem; }
    .badge {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 0.8rem;
      font-weight: 600;
      margin: 5px 3px;
    }
    .badge-get { background: #065f46; color: #6ee7b7; }
    .badge-post { background: #92400e; color: #fbbf24; }
    .badge-put { background: #1e3a5f; color: #60a5fa; }
    .badge-patch { background: #581c87; color: #c084fc; }
    .badge-delete { background: #7f1d1d; color: #fca5a5; }
    .creds-box {
      background: #1e293b;
      border: 1px solid #334155;
      border-radius: 12px;
      padding: 20px;
      margin: 20px auto;
      max-width: 500px;
    }
    .creds-box h3 { color: #fbbf24; margin-bottom: 10px; }
    .creds-box code { background: #334155; padding: 2px 8px; border-radius: 4px; color: #38bdf8; }
    .module {
      background: #1e293b;
      border: 1px solid #334155;
      border-radius: 12px;
      margin: 20px 0;
      overflow: hidden;
    }
    .module-header {
      padding: 16px 20px;
      background: #334155;
      cursor: pointer;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .module-header h2 { font-size: 1.2rem; color: #f1f5f9; }
    .module-header .count { color: #94a3b8; font-size: 0.9rem; }
    .module-body { padding: 0; }
    .endpoint {
      padding: 16px 20px;
      border-bottom: 1px solid #334155;
      transition: background 0.2s;
    }
    .endpoint:hover { background: #334155; }
    .endpoint:last-child { border-bottom: none; }
    .endpoint-header { display: flex; align-items: center; gap: 10px; margin-bottom: 6px; flex-wrap: wrap; }
    .method {
      padding: 3px 10px;
      border-radius: 4px;
      font-size: 0.75rem;
      font-weight: 700;
      min-width: 60px;
      text-align: center;
    }
    .method-get { background: #065f46; color: #6ee7b7; }
    .method-post { background: #92400e; color: #fbbf24; }
    .method-put { background: #1e3a5f; color: #60a5fa; }
    .method-patch { background: #581c87; color: #c084fc; }
    .method-delete { background: #7f1d1d; color: #fca5a5; }
    .endpoint-url { font-family: 'Consolas', 'Courier New', monospace; color: #38bdf8; font-size: 0.95rem; word-break: break-all; }
    .endpoint-desc { color: #94a3b8; font-size: 0.9rem; margin-left: 70px; }
    .auth-tag {
      font-size: 0.7rem;
      padding: 2px 8px;
      border-radius: 10px;
      background: #7f1d1d;
      color: #fca5a5;
    }
    .copy-btn {
      background: #334155;
      border: 1px solid #475569;
      color: #94a3b8;
      padding: 2px 8px;
      border-radius: 4px;
      cursor: pointer;
      font-size: 0.75rem;
    }
    .copy-btn:hover { background: #475569; color: #e2e8f0; }
    footer { text-align: center; padding: 30px; color: #64748b; font-size: 0.9rem; }
    a { color: #38bdf8; text-decoration: none; }
    a:hover { text-decoration: underline; }
    .tip { background: #1a2332; border-left: 3px solid #fbbf24; padding: 12px 16px; margin: 10px 20px; border-radius: 0 8px 8px 0; font-size: 0.9rem; color: #94a3b8; }
  </style>
</head>
<body>
  <header>
    <h1>🚀 DummyApi</h1>
    <p>API Practice Server for Android & Flutter Developers</p>
    <p style="margin-top:10px;">
      <span class="badge badge-get">GET</span>
      <span class="badge badge-post">POST</span>
      <span class="badge badge-put">PUT</span>
      <span class="badge badge-patch">PATCH</span>
      <span class="badge badge-delete">DELETE</span>
    </p>
    <div class="creds-box">
      <h3>🔑 Test Credentials</h3>
      <p>Email: <code>test@example.com</code></p>
      <p>Password: <code>password123</code></p>
      <p>API Key: <code>practice-api-key-2024</code></p>
      <p style="margin-top:8px;font-size:0.85rem;color:#64748b;">Base URL: <code>${baseUrl}</code></p>
    </div>
  </header>

  <div class="container">

    <!-- Module 1: Basic CRUD -->
    <div class="module">
      <div class="module-header">
        <h2>🟢 Module 1: Basic CRUD</h2>
        <span class="count">8 endpoints</span>
      </div>
      <div class="module-body">
        <div class="endpoint">
          <div class="endpoint-header">
            <span class="method method-get">GET</span>
            <span class="endpoint-url">/api/hello</span>
          </div>
          <div class="endpoint-desc">Simple greeting - test your connection</div>
        </div>
        <div class="endpoint">
          <div class="endpoint-header">
            <span class="method method-get">GET</span>
            <span class="endpoint-url">/api/products</span>
          </div>
          <div class="endpoint-desc">Get all products (for RecyclerView/ListView practice)</div>
        </div>
        <div class="endpoint">
          <div class="endpoint-header">
            <span class="method method-get">GET</span>
            <span class="endpoint-url">/api/products/:id</span>
          </div>
          <div class="endpoint-desc">Get single product by ID (path parameter)</div>
        </div>
        <div class="endpoint">
          <div class="endpoint-header">
            <span class="method method-post">POST</span>
            <span class="endpoint-url">/api/products</span>
          </div>
          <div class="endpoint-desc">Create product — Body: { name, price, category, description?, image_url?, stock?, rating? }</div>
        </div>
        <div class="endpoint">
          <div class="endpoint-header">
            <span class="method method-put">PUT</span>
            <span class="endpoint-url">/api/products/:id</span>
          </div>
          <div class="endpoint-desc">Full update — All required fields: name, price, category</div>
        </div>
        <div class="endpoint">
          <div class="endpoint-header">
            <span class="method method-patch">PATCH</span>
            <span class="endpoint-url">/api/products/:id</span>
          </div>
          <div class="endpoint-desc">Partial update — Send only the fields you want to change</div>
        </div>
        <div class="endpoint">
          <div class="endpoint-header">
            <span class="method method-delete">DELETE</span>
            <span class="endpoint-url">/api/products/:id</span>
          </div>
          <div class="endpoint-desc">Delete a product by ID</div>
        </div>
        <div class="endpoint">
          <div class="endpoint-header">
            <span class="method method-get">GET</span>
            <span class="endpoint-url">/api/categories/:catId/products</span>
          </div>
          <div class="endpoint-desc">Products by category — catId: electronics, clothing, books, sports, home</div>
        </div>
      </div>
    </div>

    <!-- Module 2: Query Params -->
    <div class="module">
      <div class="module-header">
        <h2>🔵 Module 2: Query Parameters & Filtering</h2>
        <span class="count">4 endpoints</span>
      </div>
      <div class="module-body">
        <div class="endpoint">
          <div class="endpoint-header">
            <span class="method method-get">GET</span>
            <span class="endpoint-url">/api/users?page=1&limit=10</span>
          </div>
          <div class="endpoint-desc">Paginated user list — Returns pagination metadata</div>
        </div>
        <div class="endpoint">
          <div class="endpoint-header">
            <span class="method method-get">GET</span>
            <span class="endpoint-url">/api/users/search?q=&age_min=&age_max=&city=&role=</span>
          </div>
          <div class="endpoint-desc">Search users with multiple filters</div>
        </div>
        <div class="endpoint">
          <div class="endpoint-header">
            <span class="method method-get">GET</span>
            <span class="endpoint-url">/api/users/sort?sort_by=name&order=asc</span>
          </div>
          <div class="endpoint-desc">Sorted results — sort_by: name, email, age, city, created_at, id | order: asc, desc</div>
        </div>
        <div class="endpoint">
          <div class="endpoint-header">
            <span class="method method-get">GET</span>
            <span class="endpoint-url">/api/users/:id</span>
          </div>
          <div class="endpoint-desc">Get single user by ID</div>
        </div>
      </div>
    </div>

    <!-- Module 3: Auth -->
    <div class="module">
      <div class="module-header">
        <h2>🟡 Module 3: Authentication & Authorization</h2>
        <span class="count">7 endpoints</span>
      </div>
      <div class="module-body">
        <div class="endpoint">
          <div class="endpoint-header">
            <span class="method method-post">POST</span>
            <span class="endpoint-url">/api/auth/register</span>
          </div>
          <div class="endpoint-desc">Register — Body: { name, email, password, age?, city?, bio? }</div>
        </div>
        <div class="endpoint">
          <div class="endpoint-header">
            <span class="method method-post">POST</span>
            <span class="endpoint-url">/api/auth/login</span>
          </div>
          <div class="endpoint-desc">Login — Body: { email, password } → Returns access_token & refresh_token</div>
        </div>
        <div class="endpoint">
          <div class="endpoint-header">
            <span class="method method-post">POST</span>
            <span class="endpoint-url">/api/auth/refresh</span>
          </div>
          <div class="endpoint-desc">Refresh token — Body: { refresh_token } → Returns new tokens</div>
        </div>
        <div class="endpoint">
          <div class="endpoint-header">
            <span class="method method-get">GET</span>
            <span class="endpoint-url">/api/auth/profile</span>
            <span class="auth-tag">🔒 Bearer Token</span>
          </div>
          <div class="endpoint-desc">Get your profile — Header: Authorization: Bearer &lt;token&gt;</div>
        </div>
        <div class="endpoint">
          <div class="endpoint-header">
            <span class="method method-put">PUT</span>
            <span class="endpoint-url">/api/auth/profile</span>
            <span class="auth-tag">🔒 Bearer Token</span>
          </div>
          <div class="endpoint-desc">Update profile — Body: { name?, age?, city?, bio? }</div>
        </div>
        <div class="endpoint">
          <div class="endpoint-header">
            <span class="method method-post">POST</span>
            <span class="endpoint-url">/api/auth/change-password</span>
            <span class="auth-tag">🔒 Bearer Token</span>
          </div>
          <div class="endpoint-desc">Change password — Body: { current_password, new_password }</div>
        </div>
        <div class="endpoint">
          <div class="endpoint-header">
            <span class="method method-post">POST</span>
            <span class="endpoint-url">/api/auth/logout</span>
            <span class="auth-tag">🔒 Bearer Token</span>
          </div>
          <div class="endpoint-desc">Logout — Invalidates the current token</div>
        </div>
      </div>
    </div>

    <!-- Module 4: Headers -->
    <div class="module">
      <div class="module-header">
        <h2>🟠 Module 4: Custom Headers & API Keys</h2>
        <span class="count">4 endpoints</span>
      </div>
      <div class="module-body">
        <div class="endpoint">
          <div class="endpoint-header">
            <span class="method method-get">GET</span>
            <span class="endpoint-url">/api/secure/data</span>
            <span class="auth-tag">🔑 X-API-Key</span>
          </div>
          <div class="endpoint-desc">Requires X-API-Key header — Value: practice-api-key-2024</div>
        </div>
        <div class="endpoint">
          <div class="endpoint-header">
            <span class="method method-get">GET</span>
            <span class="endpoint-url">/api/headers/echo</span>
          </div>
          <div class="endpoint-desc">Returns all headers you sent (debug your HTTP client)</div>
        </div>
        <div class="endpoint">
          <div class="endpoint-header">
            <span class="method method-post">POST</span>
            <span class="endpoint-url">/api/headers/custom</span>
          </div>
          <div class="endpoint-desc">Requires: X-App-Version & X-Device-Type headers</div>
        </div>
        <div class="endpoint">
          <div class="endpoint-header">
            <span class="method method-get">GET</span>
            <span class="endpoint-url">/api/headers/accept</span>
          </div>
          <div class="endpoint-desc">Returns JSON/XML/Text based on Accept header</div>
        </div>
      </div>
    </div>

    <!-- Module 5: File Uploads -->
    <div class="module">
      <div class="module-header">
        <h2>🔴 Module 5: File Uploads</h2>
        <span class="count">6 endpoints</span>
      </div>
      <div class="module-body">
        <div class="endpoint">
          <div class="endpoint-header">
            <span class="method method-post">POST</span>
            <span class="endpoint-url">/api/upload/image</span>
          </div>
          <div class="endpoint-desc">Upload single image — Field: "image" | Max: 5MB | Types: jpg, png, webp, gif</div>
        </div>
        <div class="endpoint">
          <div class="endpoint-header">
            <span class="method method-post">POST</span>
            <span class="endpoint-url">/api/upload/images</span>
          </div>
          <div class="endpoint-desc">Upload multiple images — Field: "images" | Max: 5 files, 5MB each</div>
        </div>
        <div class="endpoint">
          <div class="endpoint-header">
            <span class="method method-post">POST</span>
            <span class="endpoint-url">/api/upload/video</span>
          </div>
          <div class="endpoint-desc">Upload video — Field: "video" | Max: 50MB | Types: mp4, mkv, mov, avi, webm</div>
        </div>
        <div class="endpoint">
          <div class="endpoint-header">
            <span class="method method-post">POST</span>
            <span class="endpoint-url">/api/upload/document</span>
          </div>
          <div class="endpoint-desc">Upload document — Field: "document" | Max: 10MB | Types: pdf, doc, docx, xls, xlsx, txt, csv</div>
        </div>
        <div class="endpoint">
          <div class="endpoint-header">
            <span class="method method-post">POST</span>
            <span class="endpoint-url">/api/upload/avatar</span>
          </div>
          <div class="endpoint-desc">Upload image + data — Field: "avatar" + additional fields like "name", "bio"</div>
        </div>
        <div class="endpoint">
          <div class="endpoint-header">
            <span class="method method-get">GET</span>
            <span class="endpoint-url">/api/upload/files/:folder/:filename</span>
          </div>
          <div class="endpoint-desc">Download/serve uploaded file — Folders: images, videos, documents</div>
        </div>
      </div>
    </div>

    <!-- Module 6: Posts & Comments -->
    <div class="module">
      <div class="module-header">
        <h2>🟣 Module 6: Posts & Comments (Nested Resources)</h2>
        <span class="count">6 endpoints</span>
      </div>
      <div class="module-body">
        <div class="endpoint">
          <div class="endpoint-header">
            <span class="method method-get">GET</span>
            <span class="endpoint-url">/api/posts?page=1&limit=10</span>
          </div>
          <div class="endpoint-desc">Get all posts with author info (nested JSON)</div>
        </div>
        <div class="endpoint">
          <div class="endpoint-header">
            <span class="method method-get">GET</span>
            <span class="endpoint-url">/api/posts/:id</span>
          </div>
          <div class="endpoint-desc">Get post with all comments (deeply nested JSON)</div>
        </div>
        <div class="endpoint">
          <div class="endpoint-header">
            <span class="method method-post">POST</span>
            <span class="endpoint-url">/api/posts</span>
            <span class="auth-tag">🔒 Bearer Token</span>
          </div>
          <div class="endpoint-desc">Create post — Body: { title, content, image_url? }</div>
        </div>
        <div class="endpoint">
          <div class="endpoint-header">
            <span class="method method-post">POST</span>
            <span class="endpoint-url">/api/posts/:postId/comments</span>
            <span class="auth-tag">🔒 Bearer Token</span>
          </div>
          <div class="endpoint-desc">Add comment to post — Body: { content }</div>
        </div>
        <div class="endpoint">
          <div class="endpoint-header">
            <span class="method method-delete">DELETE</span>
            <span class="endpoint-url">/api/posts/:postId/comments/:commentId</span>
            <span class="auth-tag">🔒 Bearer Token</span>
          </div>
          <div class="endpoint-desc">Delete a comment (only your own or admin)</div>
        </div>
        <div class="endpoint">
          <div class="endpoint-header">
            <span class="method method-post">POST</span>
            <span class="endpoint-url">/api/posts/:id/like</span>
          </div>
          <div class="endpoint-desc">Like a post (increments like count)</div>
        </div>
      </div>
    </div>

    <!-- Module 7: Advanced -->
    <div class="module">
      <div class="module-header">
        <h2>⚫ Module 7: Advanced & Interview-Level</h2>
        <span class="count">8 endpoints</span>
      </div>
      <div class="module-body">
        <div class="endpoint">
          <div class="endpoint-header">
            <span class="method method-get">GET</span>
            <span class="endpoint-url">/api/advanced/delayed?seconds=3</span>
          </div>
          <div class="endpoint-desc">Delayed response (1-30 seconds) — Test timeout handling</div>
        </div>
        <div class="endpoint">
          <div class="endpoint-header">
            <span class="method method-get">GET</span>
            <span class="endpoint-url">/api/advanced/random-error</span>
          </div>
          <div class="endpoint-desc">50% chance of 500 error — Practice retry logic</div>
        </div>
        <div class="endpoint">
          <div class="endpoint-header">
            <span class="method method-post">POST</span>
            <span class="endpoint-url">/api/advanced/form-data</span>
          </div>
          <div class="endpoint-desc">Accepts application/x-www-form-urlencoded (not JSON)</div>
        </div>
        <div class="endpoint">
          <div class="endpoint-header">
            <span class="method method-get">GET</span>
            <span class="endpoint-url">/api/advanced/large-response?count=1000</span>
          </div>
          <div class="endpoint-desc">Returns 100-5000 items — Test large JSON handling</div>
        </div>
        <div class="endpoint">
          <div class="endpoint-header">
            <span class="method method-get">GET</span>
            <span class="endpoint-url">/api/advanced/image-response</span>
          </div>
          <div class="endpoint-desc">Returns a PNG image as binary — Handle binary responses</div>
        </div>
        <div class="endpoint">
          <div class="endpoint-header">
            <span class="method method-get">GET</span>
            <span class="endpoint-url">/api/advanced/status/:code</span>
          </div>
          <div class="endpoint-desc">Returns any HTTP status code — Codes: 200,201,204,301,400,401,403,404,429,500,502,503</div>
        </div>
        <div class="endpoint">
          <div class="endpoint-header">
            <span class="method method-get">GET</span>
            <span class="endpoint-url">/api/advanced/rate-limited</span>
          </div>
          <div class="endpoint-desc">Rate limited: 5 requests/minute — Handle 429 errors</div>
        </div>
        <div class="endpoint">
          <div class="endpoint-header">
            <span class="method method-post">POST</span>
            <span class="endpoint-url">/api/advanced/validate</span>
          </div>
          <div class="endpoint-desc">Strict validation — Body: { email, password, name, age, phone?, website?, agree_terms }</div>
        </div>
      </div>
    </div>

    <!-- Module 8: Errors -->
    <div class="module">
      <div class="module-header">
        <h2>⚪ Module 8: Error Simulation</h2>
        <span class="count">6 endpoints</span>
      </div>
      <div class="module-body">
        <div class="endpoint">
          <div class="endpoint-header">
            <span class="method method-get">GET</span>
            <span class="endpoint-url">/api/errors/400</span>
          </div>
          <div class="endpoint-desc">400 Bad Request — with Android handling tips</div>
        </div>
        <div class="endpoint">
          <div class="endpoint-header">
            <span class="method method-get">GET</span>
            <span class="endpoint-url">/api/errors/401</span>
          </div>
          <div class="endpoint-desc">401 Unauthorized</div>
        </div>
        <div class="endpoint">
          <div class="endpoint-header">
            <span class="method method-get">GET</span>
            <span class="endpoint-url">/api/errors/403</span>
          </div>
          <div class="endpoint-desc">403 Forbidden</div>
        </div>
        <div class="endpoint">
          <div class="endpoint-header">
            <span class="method method-get">GET</span>
            <span class="endpoint-url">/api/errors/404</span>
          </div>
          <div class="endpoint-desc">404 Not Found</div>
        </div>
        <div class="endpoint">
          <div class="endpoint-header">
            <span class="method method-get">GET</span>
            <span class="endpoint-url">/api/errors/500</span>
          </div>
          <div class="endpoint-desc">500 Internal Server Error</div>
        </div>
        <div class="endpoint">
          <div class="endpoint-header">
            <span class="method method-get">GET</span>
            <span class="endpoint-url">/api/errors/timeout</span>
          </div>
          <div class="endpoint-desc">⏳ Never responds — Test your timeout configuration</div>
        </div>
      </div>
    </div>

    <div class="tip">
      💡 <strong>Tip:</strong> All error responses follow a consistent format with <code>success</code>, <code>error.code</code>, <code>error.type</code>, <code>error.message</code>, and <code>timestamp</code> fields. Parse them consistently in your Android app!
    </div>

  </div>

  <footer>
    <p>DummyApi v1.0.0 — Built for Android & Flutter developers 🤖</p>
    <p style="margin-top:5px;">48 endpoints • JWT Auth • File Uploads • Error Simulation</p>
  </footer>
</body>
</html>`;
}
