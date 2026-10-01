# 📮 DummyApi Postman Collection — Complete Guide & Documentation

This directory contains the production-grade **Postman Collection (v2.1.0)** and pre-configured **Environments** for all **48 REST API endpoints** of the DummyApi Practice Server.

---

## 📁 Files in this Directory

| File | Description |
|---|---|
| [`DummyApi.postman_collection.json`](./DummyApi.postman_collection.json) | The complete collection with **52 requests across 8 modules**, automated JWT capture tests, pre-filled payloads, and Android/Flutter tips |
| [`DummyApi_Render_Environment.postman_environment.json`](./DummyApi_Render_Environment.postman_environment.json) | Environment configured for the live Render cloud deployment (`https://dummyapi-tk55.onrender.com`) |
| [`DummyApi_Local_Environment.postman_environment.json`](./DummyApi_Local_Environment.postman_environment.json) | Environment configured for local development (`http://localhost:3000`) |
| [`generate_collection.js`](./generate_collection.js) | Node.js script used to re-generate the collection programmatically |

---

## 🚀 Quick Setup (Importing into Postman)

1. Open **Postman**.
2. Click **Import** (top left corner or `Ctrl + O` / `Cmd + O`).
3. Drag and drop or select the following files:
   - `DummyApi.postman_collection.json`
   - `DummyApi_Render_Environment.postman_environment.json`
   - `DummyApi_Local_Environment.postman_environment.json`
4. In the top right corner of Postman, select your desired environment:
   - **`DummyApi - Cloud (Render)`** (to test against the live cloud server)
   - **`DummyApi - Localhost (Port 3000)`** (if running `npm start` locally)
5. You are ready to make requests!

---

## ⚡ Smart Automation Built into the Collection

### 1. 🔑 Automatic JWT Token Handling
You don't need to manually copy-paste tokens!
- When you run **`Module 3 -> 13. Login User`** or **`12. Register New User`**, Postman automatically extracts the `access_token` and `refresh_token` from the response and saves them into the collection variable:
  ```javascript
  pm.collectionVariables.set("authToken", jsonData.data.access_token);
  pm.collectionVariables.set("refreshToken", jsonData.data.refresh_token);
  ```
- All protected endpoints (Profile, Update Profile, Change Password, Logout, Create Post, Add Comment, Delete Comment) already have their **Authorization header** set to `Bearer {{authToken}}`.

### 2. 🔄 Dynamic Resource Chaining
- Creating a product (`POST /api/products`) automatically updates `{{productId}}`.
- Creating a post (`POST /api/posts`) automatically updates `{{postId}}`.
- Adding a comment (`POST /api/posts/:postId/comments`) automatically updates `{{commentId}}`.
- Getting the user profile (`GET /api/auth/profile`) automatically updates `{{userId}}`.

### 3. 🧪 Built-in Test Assertions
Every request includes automated tests verifying:
- Correct HTTP status code (`200 OK`, `201 Created`, `400 Bad Request`, `422 Unprocessable Entity`, etc.)
- JSON schema structure and expected fields
- Response latency and headers

---

## 📋 Collection Structure & Modules

### 🟢 Module 1: Basic CRUD (7 Requests)
- `1. Hello World Greeting` — `GET /api/hello`
- `2. Get All Products` — `GET /api/products`
- `3. Get Product by ID` — `GET /api/products/:id`
- `4. Create Product (POST)` — `POST /api/products` (pre-filled JSON body)
- `5. Full Update Product (PUT)` — `PUT /api/products/:id` (all fields required)
- `6. Partial Update Product (PATCH)` — `PATCH /api/products/:id` (subset of fields)
- `7. Delete Product` — `DELETE /api/products/:id`

### 🔵 Module 2: Query Parameters & Filtering (5 Requests)
- `8. Paginated Users List` — `GET /api/users?page=1&limit=10`
- `9. Search Users (Multi-Filter)` — `GET /api/users/search?q=john&age_min=18&age_max=40&city=New York&role=user`
- `10. Sort Users` — `GET /api/users/sort?sort_by=name&order=asc`
- `11. Get Products by Category` — `GET /api/categories/:catId/products`
- `11b. Get User by ID` — `GET /api/users/:id`

### 🟡 Module 3: Authentication & Authorization (7 Requests)
- `12. Register New User` — `POST /api/auth/register` (randomized unique email pre-request script)
- `13. Login User` — `POST /api/auth/login` (auto-saves `{{authToken}}` and `{{refreshToken}}`)
- `14. Refresh Access Token` — `POST /api/auth/refresh` (exchanges refresh token for new access token)
- `15. Get Current User Profile` — `GET /api/auth/profile` (🔒 Bearer token)
- `16. Update User Profile` — `PUT /api/auth/profile` (🔒 Bearer token)
- `17. Change Password` — `POST /api/auth/change-password` (🔒 Bearer token)
- `18. Logout` — `POST /api/auth/logout` (🔒 Invalidation & blacklisting in SQLite)

### 🟠 Module 4: Custom Headers & API Keys (6 Requests)
- `19. API Key Protected Data` — `GET /api/secure/data` (Header: `X-API-Key: {{apiKey}}`)
- `20. Echo All Request Headers` — `GET /api/headers/echo` (echoes client headers)
- `21. Custom Headers Validation` — `POST /api/headers/custom` (validates `X-App-Version` & `X-Device-Type`)
- `22a. Content Negotiation - JSON` — `GET /api/headers/accept` (`Accept: application/json`)
- `22b. Content Negotiation - XML` — `GET /api/headers/accept` (`Accept: application/xml`)
- `22c. Content Negotiation - Plain Text` — `GET /api/headers/accept` (`Accept: text/plain`)

### 🔴 Module 5: File Uploads (6 Requests)
- `23. Upload Single Image` — `POST /api/upload/image` (form-data: `image` file)
- `24. Upload Multiple Images (Max 5)` — `POST /api/upload/images` (form-data: `images` array)
- `25. Upload Video (Max 50MB)` — `POST /api/upload/video` (form-data: `video` file)
- `26. Upload Document (PDF/DOC/XLSX)` — `POST /api/upload/document` (form-data: `document` file)
- `27. Upload Avatar + User Form Data` — `POST /api/upload/avatar` (mixed file + metadata)
- `28. Download / View Uploaded File` — `GET /api/upload/files/:folder/:filename`

### 🟣 Module 6: Posts & Comments — Nested Resources (6 Requests)
- `29. Get All Posts (with Author Info)` — `GET /api/posts?page=1&limit=10`
- `30. Get Post with All Comments` — `GET /api/posts/:id`
- `31. Create Post` — `POST /api/posts` (🔒 Bearer token)
- `32. Add Comment to Post` — `POST /api/posts/:postId/comments` (🔒 Bearer token)
- `33. Delete Comment` — `DELETE /api/posts/:postId/comments/:commentId` (🔒 Author only)
- `34. Toggle Like on Post` — `POST /api/posts/:id/like`

### ⚫ Module 7: Advanced & Interview-Level (9 Requests)
- `35. Delayed Response (Timeout Practice)` — `GET /api/advanced/delayed?seconds=3`
- `36. Random Server Error (50% Chance)` — `GET /api/advanced/random-error` (test retry policies)
- `37. Form URL-Encoded POST` — `POST /api/advanced/form-data` (`application/x-www-form-urlencoded`)
- `38. Large Response (1000+ Items)` — `GET /api/advanced/large-response?count=1000`
- `39. Binary Image Stream Response` — `GET /api/advanced/image-response` (`image/png` stream)
- `40. HTTP Status Code Simulator` — `GET /api/advanced/status/:code` (mock 200, 201, 204, 400, 404, 500, etc.)
- `41. Rate Limited Endpoint (5 req/min)` — `GET /api/advanced/rate-limited` (observe HTTP 429)
- `42a. Strict Validation - Success` — `POST /api/advanced/validate`
- `42b. Strict Validation - Field Errors` — `POST /api/advanced/validate` (inspect HTTP 422 error details)

### ⚪ Module 8: Error Simulation (6 Requests)
- `43. 400 Bad Request` — `GET /api/errors/400`
- `44. 401 Unauthorized` — `GET /api/errors/401`
- `45. 403 Forbidden` — `GET /api/errors/403`
- `46. 404 Not Found` — `GET /api/errors/404`
- `47. 500 Internal Server Error` — `GET /api/errors/500`
- `48. Timeout Simulator (Hangs)` — `GET /api/errors/timeout` (tests client socket read timeout)

---

## 📱 Developer Pro-Tips

### For Android Developers (Retrofit / OkHttp)
1. **JWT Header Interceptor:** Add an OkHttp Interceptor to automatically add `Authorization: Bearer <token>` to requests.
2. **Token Refresh with Authenticator:** Implement OkHttp `Authenticator` interface to intercept 401 errors, invoke `POST /api/auth/refresh`, and retry the original failed request seamlessly.
3. **Multipart File Uploads:** Use `@Multipart` and `@Part image: MultipartBody.Part` with `RequestBody.create("image/*".toMediaTypeOrNull(), file)`.
4. **Error Body Parsing:** When `response.isSuccessful()` is false, parse `response.errorBody()?.string()` into your error data model.

### For Flutter Developers (Dio / Http)
1. **Dio Interceptor:** Use `InterceptorsWrapper(onRequest, onError)` to attach the Bearer token and handle token expiration globally.
2. **Form Data Uploads:** Use `FormData.fromMap({'image': await MultipartFile.fromFile(path)})`.
3. **Timeouts:** Configure `BaseOptions(connectTimeout: Duration(seconds: 5), receiveTimeout: Duration(seconds: 5))` to test against `/api/advanced/delayed` and `/api/errors/timeout`.
