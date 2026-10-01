# 🚀 DummyApi - API Practice Server

A ready-to-deploy Node.js + Express API server with **48 endpoints** designed for Android & Flutter developers to practice API integration, prepare for interviews, and learn REST API concepts.

## 🏃 Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Start the server
npm start

# 3. Open in browser
# Visit http://localhost:3000 for full API docs
```

For development with auto-restart:
```bash
npm run dev
```

## 🔑 Test Credentials

| Type | Value |
|------|-------|
| Email | `test@example.com` |
| Password | `password123` |
| API Key | `practice-api-key-2024` |

## 📋 API Modules

### Module 1: Basic CRUD (No Auth)
- `GET /api/hello` — Simple greeting
- `GET /api/products` — All products
- `GET /api/products/:id` — Single product
- `POST /api/products` — Create product
- `PUT /api/products/:id` — Full update
- `PATCH /api/products/:id` — Partial update
- `DELETE /api/products/:id` — Delete
- `GET /api/categories/:catId/products` — By category

### Module 2: Query Parameters
- `GET /api/users?page=1&limit=10` — Pagination
- `GET /api/users/search?q=&age_min=&age_max=` — Search
- `GET /api/users/sort?sort_by=name&order=asc` — Sort
- `GET /api/users/:id` — Single user

### Module 3: Authentication
- `POST /api/auth/register` — Register
- `POST /api/auth/login` — Login (returns JWT)
- `POST /api/auth/refresh` — Refresh token
- `GET /api/auth/profile` — Get profile 🔒
- `PUT /api/auth/profile` — Update profile 🔒
- `POST /api/auth/change-password` — Change password 🔒
- `POST /api/auth/logout` — Logout 🔒

### Module 4: Headers & API Keys
- `GET /api/secure/data` — Requires X-API-Key
- `GET /api/headers/echo` — Echo all headers
- `POST /api/headers/custom` — Custom headers required
- `GET /api/headers/accept` — Content negotiation

### Module 5: File Uploads
- `POST /api/upload/image` — Single image (5MB)
- `POST /api/upload/images` — Multiple images (5 files)
- `POST /api/upload/video` — Video (50MB)
- `POST /api/upload/document` — Document (10MB)
- `POST /api/upload/avatar` — Image + data
- `GET /api/upload/files/:folder/:filename` — Download

### Module 6: Posts & Comments
- `GET /api/posts` — All posts with author
- `GET /api/posts/:id` — Post with comments
- `POST /api/posts` — Create post 🔒
- `POST /api/posts/:postId/comments` — Add comment 🔒
- `DELETE /api/posts/:postId/comments/:commentId` — Delete comment 🔒
- `POST /api/posts/:id/like` — Like post

### Module 7: Advanced
- `GET /api/advanced/delayed?seconds=3` — Delayed response
- `GET /api/advanced/random-error` — Random 500 error
- `POST /api/advanced/form-data` — Form URL encoded
- `GET /api/advanced/large-response?count=1000` — Large JSON
- `GET /api/advanced/image-response` — Binary image
- `GET /api/advanced/status/:code` — Custom status code
- `GET /api/advanced/rate-limited` — 5 req/min limit
- `POST /api/advanced/validate` — Strict validation

### Module 8: Error Simulation
- `GET /api/errors/400` — Bad Request
- `GET /api/errors/401` — Unauthorized
- `GET /api/errors/403` — Forbidden
- `GET /api/errors/404` — Not Found
- `GET /api/errors/500` — Server Error
- `GET /api/errors/timeout` — Timeout (never responds)

## 🚀 Deploy to Render

1. Push to GitHub
2. Go to [render.com](https://render.com)
3. New → Web Service → Connect your repo
4. It auto-detects `render.yaml`
5. Deploy!

## 📝 License

MIT
