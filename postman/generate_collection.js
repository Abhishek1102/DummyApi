const fs = require('fs');
const path = require('path');

// Helper to create test script item
function createTestScript(tests = []) {
  if (!tests.length) return undefined;
  return {
    listen: "test",
    script: {
      type: "text/javascript",
      exec: tests
    }
  };
}

// Helper to create pre-request script
function createPreRequestScript(lines = []) {
  if (!lines.length) return undefined;
  return {
    listen: "prerequest",
    script: {
      type: "text/javascript",
      exec: lines
    }
  };
}

// Helper to create request items
function createRequest({
  name,
  method = "GET",
  urlPath,
  pathVariables = {},
  queryParams = {},
  headers = {},
  body = null,
  bodyType = "raw", // 'raw', 'formdata', 'urlencoded'
  auth = null,
  description = "",
  tests = [],
  prerequest = []
}) {
  const events = [];
  const testEvent = createTestScript(tests);
  if (testEvent) events.push(testEvent);
  const preEvent = createPreRequestScript(prerequest);
  if (preEvent) events.push(preEvent);

  // Parse path segments
  const cleanPath = urlPath.startsWith('/') ? urlPath.slice(1) : urlPath;
  const pathSegments = cleanPath.split('/').map(seg => {
    if (seg.startsWith(':')) return `:${seg.slice(1)}`;
    return seg;
  });

  // Query parameters array
  const queryArray = Object.entries(queryParams).map(([key, value]) => ({
    key,
    value: String(value),
    description: `Filter or parameter: ${key}`
  }));

  // Path variables array
  const pathVarArray = Object.entries(pathVariables).map(([key, value]) => ({
    key,
    value: String(value),
    description: `Path variable ${key}`
  }));

  // Headers array
  const headerArray = Object.entries(headers).map(([key, value]) => ({
    key,
    value: String(value),
    type: "text"
  }));

  const urlObj = {
    raw: `{{baseUrl}}/${cleanPath}${queryArray.length ? '?' + queryArray.map(q => `${q.key}=${encodeURIComponent(q.value)}`).join('&') : ''}`,
    host: ["{{baseUrl}}"],
    path: pathSegments,
    query: queryArray.length ? queryArray : undefined,
    variable: pathVarArray.length ? pathVarArray : undefined
  };

  const reqObj = {
    method: method.toUpperCase(),
    header: headerArray,
    url: urlObj,
    description: description
  };

  if (auth) {
    reqObj.auth = auth;
  }

  if (body) {
    if (bodyType === "raw") {
      reqObj.body = {
        mode: "raw",
        raw: typeof body === 'string' ? body : JSON.stringify(body, null, 2),
        options: {
          raw: {
            language: "json"
          }
        }
      };
      // Ensure application/json header is present
      if (!headerArray.find(h => h.key.toLowerCase() === 'content-type')) {
        headerArray.push({ key: "Content-Type", value: "application/json", type: "text" });
      }
    } else if (bodyType === "formdata") {
      reqObj.body = {
        mode: "formdata",
        formdata: body // Array of { key, value, type, description, src }
      };
    } else if (bodyType === "urlencoded") {
      reqObj.body = {
        mode: "urlencoded",
        urlencoded: body // Array of { key, value, type, description }
      };
    }
  }

  return {
    name,
    event: events.length ? events : undefined,
    request: reqObj,
    response: []
  };
}

// Generate the full collection
function generateCollection() {
  const collection = {
    info: {
      _postman_id: "7f4c9c1b-29a3-4a33-bf98-dummyapi1234",
      name: "DummyApi - Complete REST API Suite (48 Endpoints)",
      description: `# 🚀 DummyApi - Complete REST API Practice Server

Welcome to the **official Postman Collection** for **DummyApi** — a production-ready practice REST API server built specifically for **Android (Retrofit/OkHttp/Ktor)** and **Flutter (Dio/Http)** developers, QA testers, and backend learners.

---

### 🌐 Quick Reference & Credentials
- **Live Base URL:** \`https://dummyapi-tk55.onrender.com\`
- **Localhost URL:** \`http://localhost:3000\`
- **Test Account Email:** \`test@example.com\`
- **Test Account Password:** \`password123\`
- **Master API Key:** \`practice-api-key-2024\`

---

### ⚡ Smart Collection Features
1. **Automated JWT Token Capture:** Running **Module 3: Login** or **Register** automatically captures the \`access_token\` and sets the collection variable \`{{authToken}}\`, authorizing all protected routes immediately!
2. **Refresh Token Flow:** Automated capture for \`{{refreshToken}}\` seamlessly updates your tokens.
3. **Dynamic Resource Chaining:** Creating a product, post, or comment automatically saves \`{{productId}}\`, \`{{postId}}\`, and \`{{commentId}}\` for dependent requests.
4. **Multi-Environment Support:** Switch seamlessly between **Render Cloud** and **Localhost** environments.
5. **Real-World Scenarios:** Covers multipart file uploads, rate limiting, token invalidation/blacklisting, content negotiation, random 500 errors, timeout simulation, and comprehensive HTTP status codes.

---

### 📚 Structure (8 Core Modules)
1. **🟢 Module 1: Basic CRUD** — Hello, Products CRUD (GET, POST, PUT, PATCH, DELETE)
2. **🔵 Module 2: Query Parameters & Filtering** — Pagination, multi-field search, sorting, categories
3. **🟡 Module 3: Authentication & Authorization** — JWT auth, refresh token flow, profile, password change, logout
4. **🟠 Module 4: Custom Headers & API Keys** — API key auth, header echo, device headers, content negotiation
5. **🔴 Module 5: File Uploads** — Single & multiple image uploads, video, document, mixed multipart
6. **🟣 Module 6: Posts & Comments** — Nested resources, relations, toggle likes
7. **⚫ Module 7: Advanced & Interview Topics** — Delayed response, random errors, form URL-encoded, binary image stream, status code mock, rate limits, strict validation
8. **⚪ Module 8: Error Simulation** — 400, 401, 403, 404, 500, and infinite timeout simulation`,
      schema: "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
    },
    variable: [
      { key: "baseUrl", value: "https://dummyapi-tk55.onrender.com", type: "string" },
      { key: "apiKey", value: "practice-api-key-2024", type: "string" },
      { key: "authToken", value: "", type: "string" },
      { key: "refreshToken", value: "", type: "string" },
      { key: "testEmail", value: "test@example.com", type: "string" },
      { key: "testPassword", value: "password123", type: "string" },
      { key: "productId", value: "1", type: "string" },
      { key: "postId", value: "1", type: "string" },
      { key: "commentId", value: "1", type: "string" },
      { key: "userId", value: "1", type: "string" }
    ],
    item: [
      // ==========================================
      // MODULE 1: BASIC CRUD
      // ==========================================
      {
        name: "🟢 Module 1: Basic CRUD",
        description: "Standard REST operations: GET, POST, PUT, PATCH, DELETE without authentication requirements. Perfect for practicing Retrofit/Dio basic setup.",
        item: [
          createRequest({
            name: "1. Hello World Greeting",
            method: "GET",
            urlPath: "/api/hello",
            description: "Returns a friendly greeting message. Used to verify server uptime and connectivity.\n\n### Response\n- `200 OK`: Server info & confirmation message.",
            tests: [
              'pm.test("Status code is 200", function () {',
              '    pm.response.to.have.status(200);',
              '});',
              'pm.test("Response is successful", function () {',
              '    var jsonData = pm.response.json();',
              '    pm.expect(jsonData.success).to.eql(true);',
              '});'
            ]
          }),
          createRequest({
            name: "2. Get All Products",
            method: "GET",
            urlPath: "/api/products",
            description: "Retrieves the complete list of products from SQLite.\n\n### Android/Flutter Tip\nGreat for populating a RecyclerView or Flutter ListView.builder.",
            tests: [
              'pm.test("Status code is 200", function () {',
              '    pm.response.to.have.status(200);',
              '});',
              'pm.test("Products array returned", function () {',
              '    var jsonData = pm.response.json();',
              '    pm.expect(jsonData.data).to.be.an("array");',
              '    if (jsonData.data.length > 0) {',
              '        pm.collectionVariables.set("productId", jsonData.data[0].id);',
              '    }',
              '});'
            ]
          }),
          createRequest({
            name: "3. Get Product by ID",
            method: "GET",
            urlPath: "/api/products/:id",
            pathVariables: { id: "{{productId}}" },
            description: "Retrieves details of a single product using a path parameter.\n\n### Android Tip (Retrofit)\n```kotlin\n@GET(\"api/products/{id}\")\nsuspend fun getProduct(@Path(\"id\") id: Int): Response<ProductResponse>\n```",
            tests: [
              'pm.test("Status code is 200", function () {',
              '    pm.response.to.have.status(200);',
              '});',
              'pm.test("Product data has valid id", function () {',
              '    var jsonData = pm.response.json();',
              '    pm.expect(jsonData.data).to.have.property("id");',
              '});'
            ]
          }),
          createRequest({
            name: "4. Create Product (POST)",
            method: "POST",
            urlPath: "/api/products",
            description: "Creates a new product record in the database.\n\n### Required Fields\n- `name` (String)\n- `price` (Number)\n- `category` (String: Electronics, Clothing, Books, Sports, Home)",
            body: {
              name: "Sony WH-1000XM5 Wireless Headphones",
              description: "Industry leading noise canceling with two processors and 8 microphones.",
              price: 399.99,
              category: "Electronics",
              image_url: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e",
              stock: 25,
              rating: 4.9
            },
            tests: [
              'pm.test("Status code is 201 Created", function () {',
              '    pm.response.to.have.status(201);',
              '});',
              'pm.test("Auto-save newly created productId", function () {',
              '    var jsonData = pm.response.json();',
              '    pm.expect(jsonData.success).to.eql(true);',
              '    if (jsonData.data && jsonData.data.id) {',
              '        pm.collectionVariables.set("productId", jsonData.data.id);',
              '        console.log("Updated productId variable to: " + jsonData.data.id);',
              '    }',
              '});'
            ]
          }),
          createRequest({
            name: "5. Full Update Product (PUT)",
            method: "PUT",
            urlPath: "/api/products/:id",
            pathVariables: { id: "{{productId}}" },
            description: "Full update of a product. In REST convention, PUT requires sending all required fields.",
            body: {
              name: "Sony WH-1000XM5 (Special Edition)",
              description: "Updated description with premium silver finish and bundle case.",
              price: 429.99,
              category: "Electronics",
              image_url: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e",
              stock: 18,
              rating: 5.0
            },
            tests: [
              'pm.test("Status code is 200", function () {',
              '    pm.response.to.have.status(200);',
              '});',
              'pm.test("Product price updated", function () {',
              '    var jsonData = pm.response.json();',
              '    pm.expect(jsonData.data.price).to.eql(429.99);',
              '});'
            ]
          }),
          createRequest({
            name: "6. Partial Update Product (PATCH)",
            method: "PATCH",
            urlPath: "/api/products/:id",
            pathVariables: { id: "{{productId}}" },
            description: "Partial update. Unlike PUT, PATCH only requires the specific fields you wish to modify.",
            body: {
              price: 379.99,
              stock: 12
            },
            tests: [
              'pm.test("Status code is 200", function () {',
              '    pm.response.to.have.status(200);',
              '});',
              'pm.test("Patched fields verified", function () {',
              '    var jsonData = pm.response.json();',
              '    pm.expect(jsonData.data.price).to.eql(379.99);',
              '    pm.expect(jsonData.data.stock).to.eql(12);',
              '});'
            ]
          }),
          createRequest({
            name: "7. Delete Product",
            method: "DELETE",
            urlPath: "/api/products/:id",
            pathVariables: { id: "{{productId}}" },
            description: "Deletes the product with the given ID from the database.",
            tests: [
              'pm.test("Status code is 200", function () {',
              '    pm.response.to.have.status(200);',
              '});',
              'pm.test("Product deletion confirmed", function () {',
              '    var jsonData = pm.response.json();',
              '    pm.expect(jsonData.success).to.eql(true);',
              '});'
            ]
          })
        ]
      },

      // ==========================================
      // MODULE 2: QUERY PARAMETERS & FILTERING
      // ==========================================
      {
        name: "🔵 Module 2: Query Parameters & Filtering",
        description: "Learn how to use query strings for pagination, multi-field search, ordering, and nested category endpoints.",
        item: [
          createRequest({
            name: "8. Paginated Users List",
            method: "GET",
            urlPath: "/api/users",
            queryParams: { page: 1, limit: 10 },
            description: "Fetches users using `page` and `limit` query parameters.\n\n### Response Metadata\nReturns `pagination` object with `current_page`, `total_pages`, `total_items`, `has_next`, `has_previous`.",
            tests: [
              'pm.test("Status code is 200", function () {',
              '    pm.response.to.have.status(200);',
              '});',
              'pm.test("Pagination metadata is accurate", function () {',
              '    var jsonData = pm.response.json();',
              '    pm.expect(jsonData.pagination).to.have.property("current_page", 1);',
              '    pm.expect(jsonData.pagination).to.have.property("per_page", 10);',
              '});'
            ]
          }),
          createRequest({
            name: "9. Search Users (Multi-Filter)",
            method: "GET",
            urlPath: "/api/users/search",
            queryParams: {
              q: "john",
              age_min: 18,
              age_max: 40,
              city: "New York",
              role: "user"
            },
            description: "Advanced search combining keyword string `q` with numerical age ranges, city filtering, and role filters.\n\n### Android Tip\nUse `@QueryMap` in Retrofit when passing variable filters.",
            tests: [
              'pm.test("Status code is 200", function () {',
              '    pm.response.to.have.status(200);',
              '});',
              'pm.test("Filters applied echoed back", function () {',
              '    var jsonData = pm.response.json();',
              '    pm.expect(jsonData).to.have.property("filters_applied");',
              '});'
            ]
          }),
          createRequest({
            name: "10. Sort Users",
            method: "GET",
            urlPath: "/api/users/sort",
            queryParams: {
              sort_by: "name",
              order: "asc"
            },
            description: "Sort users by specific column (`name`, `email`, `age`, `city`, `created_at`, `id`) in `asc` or `desc` order.",
            tests: [
              'pm.test("Status code is 200", function () {',
              '    pm.response.to.have.status(200);',
              '});'
            ]
          }),
          createRequest({
            name: "11. Get Products by Category",
            method: "GET",
            urlPath: "/api/categories/:catId/products",
            pathVariables: { catId: "electronics" },
            description: "Nested REST resource: retrieves all products belonging to a given category slug (`electronics`, `clothing`, `books`, `sports`, `home`).",
            tests: [
              'pm.test("Status code is 200", function () {',
              '    pm.response.to.have.status(200);',
              '});',
              'pm.test("Category matches query", function () {',
              '    var jsonData = pm.response.json();',
              '    pm.expect(jsonData.category.toLowerCase()).to.eql("electronics");',
              '});'
            ]
          }),
          createRequest({
            name: "11b. Get User by ID",
            method: "GET",
            urlPath: "/api/users/:id",
            pathVariables: { id: "{{userId}}" },
            description: "Retrieves public profile details for a specific user ID.",
            tests: [
              'pm.test("Status code is 200", function () {',
              '    pm.response.to.have.status(200);',
              '});'
            ]
          })
        ]
      },

      // ==========================================
      // MODULE 3: AUTHENTICATION & AUTHORIZATION
      // ==========================================
      {
        name: "🟡 Module 3: Authentication & Authorization",
        description: "Full JWT Authentication workflow: Register, Login, Refresh Token, Protected Profile, Change Password, and Logout (Token Invalidation).",
        item: [
          createRequest({
            name: "12. Register New User",
            method: "POST",
            urlPath: "/api/auth/register",
            description: "Registers a new user and returns JWT `access_token` and `refresh_token`.\n\n*Note:* The Pre-request Script appends a timestamp to the email to avoid duplicate key conflicts.",
            body: {
              name: "Alex Mercer",
              email: "alex.mercer.dev@example.com",
              password: "password123",
              age: 28,
              city: "San Francisco",
              bio: "Mobile App Engineer specializing in Jetpack Compose & Flutter"
            },
            prerequest: [
              '// Ensure unique email on each run if needed',
              'var randomEmail = "alex_" + Date.now() + "@example.com";',
              'pm.variables.set("tempEmail", randomEmail);',
              'var body = JSON.parse(pm.request.body.raw);',
              'body.email = randomEmail;',
              'pm.request.body.raw = JSON.stringify(body, null, 2);'
            ],
            tests: [
              'pm.test("Status code is 201 Created", function () {',
              '    pm.response.to.have.status(201);',
              '});',
              'pm.test("Captures access and refresh tokens", function () {',
              '    var jsonData = pm.response.json();',
              '    if (jsonData.data && jsonData.data.access_token) {',
              '        pm.collectionVariables.set("authToken", jsonData.data.access_token);',
              '        pm.collectionVariables.set("refreshToken", jsonData.data.refresh_token);',
              '        console.log("Tokens updated from registration!");',
              '    }',
              '});'
            ]
          }),
          createRequest({
            name: "13. Login User (Auto-captures Token)",
            method: "POST",
            urlPath: "/api/auth/login",
            description: "Authenticates test user and automatically populates `{{authToken}}` and `{{refreshToken}}` in the Collection Variables.\n\n### Test Credentials\n- **Email:** `{{testEmail}}` (`test@example.com`)\n- **Password:** `{{testPassword}}` (`password123`)",
            body: {
              email: "{{testEmail}}",
              password: "{{testPassword}}"
            },
            tests: [
              'pm.test("Status code is 200 OK", function () {',
              '    pm.response.to.have.status(200);',
              '});',
              'pm.test("Auto-capture JWT tokens to collection variables", function () {',
              '    var jsonData = pm.response.json();',
              '    pm.expect(jsonData.success).to.eql(true);',
              '    pm.expect(jsonData.data.access_token).to.be.a("string");',
              '    pm.collectionVariables.set("authToken", jsonData.data.access_token);',
              '    pm.collectionVariables.set("refreshToken", jsonData.data.refresh_token);',
              '    console.log("authToken and refreshToken saved successfully!");',
              '});'
            ]
          }),
          createRequest({
            name: "14. Refresh Access Token",
            method: "POST",
            urlPath: "/api/auth/refresh",
            description: "Exchanges a valid `refresh_token` for a brand new `access_token` and updated `refresh_token`.\n\n### Android Architecture Tip\nUse OkHttp `Authenticator` interface to automatically intercept 401s and call this refresh endpoint!",
            body: {
              refresh_token: "{{refreshToken}}"
            },
            tests: [
              'pm.test("Status code is 200", function () {',
              '    pm.response.to.have.status(200);',
              '});',
              'pm.test("Tokens updated", function () {',
              '    var jsonData = pm.response.json();',
              '    if (jsonData.data && jsonData.data.access_token) {',
              '        pm.collectionVariables.set("authToken", jsonData.data.access_token);',
              '        pm.collectionVariables.set("refreshToken", jsonData.data.refresh_token);',
              '    }',
              '});'
            ]
          }),
          createRequest({
            name: "15. Get Current User Profile",
            method: "GET",
            urlPath: "/api/auth/profile",
            auth: {
              type: "bearer",
              bearer: [{ key: "token", value: "{{authToken}}", type: "string" }]
            },
            description: "Fetches profile info for the currently authenticated user.\n\n### Header Required\n`Authorization: Bearer {{authToken}}`",
            tests: [
              'pm.test("Status code is 200", function () {',
              '    pm.response.to.have.status(200);',
              '});',
              'pm.test("User data returned", function () {',
              '    var jsonData = pm.response.json();',
              '    pm.expect(jsonData.data).to.have.property("email");',
              '    pm.collectionVariables.set("userId", jsonData.data.id);',
              '});'
            ]
          }),
          createRequest({
            name: "16. Update User Profile",
            method: "PUT",
            urlPath: "/api/auth/profile",
            auth: {
              type: "bearer",
              bearer: [{ key: "token", value: "{{authToken}}", type: "string" }]
            },
            description: "Updates the authenticated user's name, age, city, and biography.",
            body: {
              name: "Test User (Verified Developer)",
              age: 29,
              city: "Austin, Texas",
              bio: "Lead Mobile Architect specializing in Kotlin, Jetpack Compose, and Flutter."
            },
            tests: [
              'pm.test("Status code is 200", function () {',
              '    pm.response.to.have.status(200);',
              '});',
              'pm.test("Profile updated successfully", function () {',
              '    var jsonData = pm.response.json();',
              '    pm.expect(jsonData.data.city).to.eql("Austin, Texas");',
              '});'
            ]
          }),
          createRequest({
            name: "17. Change Password",
            method: "POST",
            urlPath: "/api/auth/change-password",
            auth: {
              type: "bearer",
              bearer: [{ key: "token", value: "{{authToken}}", type: "string" }]
            },
            description: "Updates password after verifying the user's current password.",
            body: {
              current_password: "password123",
              new_password: "password123"
            },
            tests: [
              'pm.test("Status code is 200", function () {',
              '    pm.response.to.have.status(200);',
              '});'
            ]
          }),
          createRequest({
            name: "18. Logout (Invalidate Token)",
            method: "POST",
            urlPath: "/api/auth/logout",
            auth: {
              type: "bearer",
              bearer: [{ key: "token", value: "{{authToken}}", type: "string" }]
            },
            description: "Logs out the user and blacklists the current JWT token in SQLite. Subsequent requests with this token will return 401 Unauthorized.",
            tests: [
              'pm.test("Status code is 200", function () {',
              '    pm.response.to.have.status(200);',
              '});'
            ]
          })
        ]
      },

      // ==========================================
      // MODULE 4: CUSTOM HEADERS & API KEYS
      // ==========================================
      {
        name: "🟠 Module 4: Custom Headers & API Keys",
        description: "Test API Key protection, custom header inspection, header validation, and Content Negotiation (JSON, XML, Plain Text).",
        item: [
          createRequest({
            name: "19. API Key Protected Data",
            method: "GET",
            urlPath: "/api/secure/data",
            headers: {
              "X-API-Key": "{{apiKey}}"
            },
            description: "Demonstrates API Key authentication via custom header `X-API-Key: practice-api-key-2024`.\n\n### Error Scenarios\n- Missing Header: `401 Unauthorized`\n- Invalid Key: `403 Forbidden`",
            tests: [
              'pm.test("Status code is 200", function () {',
              '    pm.response.to.have.status(200);',
              '});',
              'pm.test("Secret data received", function () {',
              '    var jsonData = pm.response.json();',
              '    pm.expect(jsonData.data).to.have.property("secret_message");',
              '});'
            ]
          }),
          createRequest({
            name: "20. Echo All Request Headers",
            method: "GET",
            urlPath: "/api/headers/echo",
            headers: {
              "X-Client-Platform": "Android",
              "X-Device-Model": "Google Pixel 8 Pro",
              "X-App-Build": "204"
            },
            description: "Returns an exact mirror of every HTTP header sent in the incoming request. Ideal for debugging interceptors.",
            tests: [
              'pm.test("Status code is 200", function () {',
              '    pm.response.to.have.status(200);',
              '});',
              'pm.test("Custom headers reflected in response", function () {',
              '    var jsonData = pm.response.json();',
              '    pm.expect(jsonData.data.headers).to.have.property("x-client-platform");',
              '});'
            ]
          }),
          createRequest({
            name: "21. Custom Headers Validation",
            method: "POST",
            urlPath: "/api/headers/custom",
            headers: {
              "X-App-Version": "1.0.0",
              "X-Device-Type": "mobile",
              "X-Platform": "Android"
            },
            body: {
              ping: true,
              screen: "dashboard"
            },
            description: "Validates that client sends required custom headers: `X-App-Version` and `X-Device-Type`.\n\nReturns `400 Bad Request` if either header is missing.",
            tests: [
              'pm.test("Status code is 200", function () {',
              '    pm.response.to.have.status(200);',
              '});'
            ]
          }),
          createRequest({
            name: "22a. Content Negotiation - JSON",
            method: "GET",
            urlPath: "/api/headers/accept",
            headers: {
              "Accept": "application/json"
            },
            description: "Requests JSON representation via `Accept: application/json` header.",
            tests: [
              'pm.test("Status code is 200", function () {',
              '    pm.response.to.have.status(200);',
              '});',
              'pm.test("Format is JSON", function () {',
              '    var jsonData = pm.response.json();',
              '    pm.expect(jsonData.data.format).to.eql("JSON");',
              '});'
            ]
          }),
          createRequest({
            name: "22b. Content Negotiation - XML",
            method: "GET",
            urlPath: "/api/headers/accept",
            headers: {
              "Accept": "application/xml"
            },
            description: "Requests XML representation via `Accept: application/xml` header. Server dynamically responds with XML document!",
            tests: [
              'pm.test("Status code is 200", function () {',
              '    pm.response.to.have.status(200);',
              '});',
              'pm.test("Content-Type is XML", function () {',
              '    pm.expect(pm.response.headers.get("Content-Type")).to.include("xml");',
              '});'
            ]
          }),
          createRequest({
            name: "22c. Content Negotiation - Plain Text",
            method: "GET",
            urlPath: "/api/headers/accept",
            headers: {
              "Accept": "text/plain"
            },
            description: "Requests raw string representation via `Accept: text/plain` header.",
            tests: [
              'pm.test("Status code is 200", function () {',
              '    pm.response.to.have.status(200);',
              '});',
              'pm.test("Content-Type is text/plain", function () {',
              '    pm.expect(pm.response.headers.get("Content-Type")).to.include("text/plain");',
              '});'
            ]
          })
        ]
      },

      // ==========================================
      // MODULE 5: FILE UPLOADS
      // ==========================================
      {
        name: "🔴 Module 5: File Uploads",
        description: "Multipart/form-data endpoints handling image, video, document uploads, mixed metadata, and static file download.",
        item: [
          createRequest({
            name: "23. Upload Single Image",
            method: "POST",
            urlPath: "/api/upload/image",
            bodyType: "formdata",
            body: [
              {
                key: "image",
                type: "file",
                description: "Select an image file (JPEG, PNG, WebP up to 5MB)"
              }
            ],
            description: "Uploads a single image.\n\n### Multer Form Field\n- Field key: `image` (Type: File)\n\n### Android Tip (Retrofit)\n```kotlin\n@Multipart\n@POST(\"api/upload/image\")\nsuspend fun uploadImage(@Part image: MultipartBody.Part): Response<UploadResponse>\n```",
            tests: [
              '// If a file was selected in Postman:',
              'if (pm.response.code === 201) {',
              '    pm.test("Status code is 201 Created", function () {',
              '        pm.response.to.have.status(201);',
              '    });',
              '}'
            ]
          }),
          createRequest({
            name: "24. Upload Multiple Images (Max 5)",
            method: "POST",
            urlPath: "/api/upload/images",
            bodyType: "formdata",
            body: [
              { key: "images", type: "file", description: "Image file 1" },
              { key: "images", type: "file", description: "Image file 2" }
            ],
            description: "Uploads up to 5 images concurrently in a single multipart request.\n\n### Form Field\n- Key: `images`",
            tests: [
              'if (pm.response.code === 201) {',
              '    pm.test("Multiple images uploaded", function () {',
              '        pm.expect(pm.response.json().success).to.eql(true);',
              '    });',
              '}'
            ]
          }),
          createRequest({
            name: "25. Upload Video (Max 50MB)",
            method: "POST",
            urlPath: "/api/upload/video",
            bodyType: "formdata",
            body: [
              { key: "video", type: "file", description: "Select video (MP4, MKV, WebM up to 50MB)" }
            ],
            description: "Accepts video media up to 50MB. Field key: `video`.",
            tests: [
              'if (pm.response.code === 201) {',
              '    pm.test("Video uploaded successfully", function () {',
              '        pm.response.to.have.status(201);',
              '    });',
              '}'
            ]
          }),
          createRequest({
            name: "26. Upload Document (PDF/DOC/XLSX)",
            method: "POST",
            urlPath: "/api/upload/document",
            bodyType: "formdata",
            body: [
              { key: "document", type: "file", description: "Select PDF, DOCX, CSV or XLSX file" }
            ],
            description: "Uploads document file up to 10MB. Field key: `document`.",
            tests: [
              'if (pm.response.code === 201) {',
              '    pm.test("Document uploaded", function () {',
              '        pm.response.to.have.status(201);',
              '    });',
              '}'
            ]
          }),
          createRequest({
            name: "27. Upload Avatar + User Form Data",
            method: "POST",
            urlPath: "/api/upload/avatar",
            bodyType: "formdata",
            body: [
              { key: "avatar", type: "file", description: "Avatar image file" },
              { key: "name", value: "Alex Mercer", type: "text", description: "User full name" },
              { key: "bio", value: "Mobile Developer & Architect", type: "text", description: "Biography" },
              { key: "user_id", value: "1", type: "text", description: "Associated user ID" }
            ],
            description: "Mixed multipart request: sends a binary file (`avatar`) alongside standard text fields (`name`, `bio`, `user_id`).",
            tests: [
              'if (pm.response.code === 201) {',
              '    pm.test("Mixed multipart uploaded", function () {',
              '        pm.response.to.have.status(201);',
              '    });',
              '}'
            ]
          }),
          createRequest({
            name: "28. Download / View Uploaded File",
            method: "GET",
            urlPath: "/api/upload/files/:folder/:filename",
            pathVariables: {
              folder: "images",
              filename: "sample.png"
            },
            description: "Streams uploaded files back to client.\n\n### Path Params\n- `folder`: `images`, `videos`, or `documents`\n- `filename`: name of the saved file",
            tests: [
              '// Validates file route',
              'pm.test("Status code is 200 or 404", function () {',
              '    pm.expect([200, 404]).to.include(pm.response.code);',
              '});'
            ]
          })
        ]
      },

      // ==========================================
      // MODULE 6: POSTS & COMMENTS (NESTED)
      // ==========================================
      {
        name: "🟣 Module 6: Posts & Comments (Nested Resources)",
        description: "Nested relationships, social interactions, comment threads, and toggling likes.",
        item: [
          createRequest({
            name: "29. Get All Posts (with Author Info)",
            method: "GET",
            urlPath: "/api/posts",
            queryParams: { page: 1, limit: 10 },
            description: "Fetches posts feed with nested `author` objects and `comment_count` for each post.",
            tests: [
              'pm.test("Status code is 200", function () {',
              '    pm.response.to.have.status(200);',
              '});',
              'pm.test("Post list has items", function () {',
              '    var jsonData = pm.response.json();',
              '    pm.expect(jsonData.data).to.be.an("array");',
              '    if (jsonData.data.length > 0) {',
              '        pm.collectionVariables.set("postId", jsonData.data[0].id);',
              '    }',
              '});'
            ]
          }),
          createRequest({
            name: "30. Get Post with All Comments",
            method: "GET",
            urlPath: "/api/posts/:id",
            pathVariables: { id: "{{postId}}" },
            description: "Fetches full details of a single post along with an array of nested comments and author details.",
            tests: [
              'pm.test("Status code is 200", function () {',
              '    pm.response.to.have.status(200);',
              '});',
              'pm.test("Post has comments array", function () {',
              '    var jsonData = pm.response.json();',
              '    pm.expect(jsonData.data).to.have.property("comments");',
              '    if (jsonData.data.comments && jsonData.data.comments.length > 0) {',
              '        pm.collectionVariables.set("commentId", jsonData.data.comments[0].id);',
              '    }',
              '});'
            ]
          }),
          createRequest({
            name: "31. Create Post (Auth Required)",
            method: "POST",
            urlPath: "/api/posts",
            auth: {
              type: "bearer",
              bearer: [{ key: "token", value: "{{authToken}}", type: "string" }]
            },
            description: "Publishes a new blog post. Requires valid Bearer token.",
            body: {
              title: "Mastering Clean Architecture with Kotlin & Jetpack Compose",
              content: "A comprehensive guide on decoupling domain logic from UI presentation in modern Android apps using Flow, StateFlow, and Coroutines.",
              image_url: "https://images.unsplash.com/photo-1555066931-4365d14bab8c"
            },
            tests: [
              'pm.test("Status code is 201 Created", function () {',
              '    pm.response.to.have.status(201);',
              '});',
              'pm.test("Capture new postId", function () {',
              '    var jsonData = pm.response.json();',
              '    if (jsonData.data && jsonData.data.id) {',
              '        pm.collectionVariables.set("postId", jsonData.data.id);',
              '        console.log("Saved postId: " + jsonData.data.id);',
              '    }',
              '});'
            ]
          }),
          createRequest({
            name: "32. Add Comment to Post",
            method: "POST",
            urlPath: "/api/posts/:postId/comments",
            pathVariables: { postId: "{{postId}}" },
            auth: {
              type: "bearer",
              bearer: [{ key: "token", value: "{{authToken}}", type: "string" }]
            },
            description: "Adds a comment to the specified post.",
            body: {
              content: "Incredible guide! The StateFlow explanation saved me hours of debugging."
            },
            tests: [
              'pm.test("Status code is 201 Created", function () {',
              '    pm.response.to.have.status(201);',
              '});',
              'pm.test("Capture new commentId", function () {',
              '    var jsonData = pm.response.json();',
              '    if (jsonData.data && jsonData.data.id) {',
              '        pm.collectionVariables.set("commentId", jsonData.data.id);',
              '    }',
              '});'
            ]
          }),
          createRequest({
            name: "33. Delete Comment",
            method: "DELETE",
            urlPath: "/api/posts/:postId/comments/:commentId",
            pathVariables: {
              postId: "{{postId}}",
              commentId: "{{commentId}}"
            },
            auth: {
              type: "bearer",
              bearer: [{ key: "token", value: "{{authToken}}", type: "string" }]
            },
            description: "Deletes a comment. Only the comment author or an admin can delete.",
            tests: [
              'pm.test("Status code is 200 or 404/403", function () {',
              '    pm.expect([200, 403, 404]).to.include(pm.response.code);',
              '});'
            ]
          }),
          createRequest({
            name: "34. Toggle Like on Post",
            method: "POST",
            urlPath: "/api/posts/:id/like",
            pathVariables: { id: "{{postId}}" },
            description: "Increments like counter for a post. Supports optional authentication.",
            tests: [
              'pm.test("Status code is 200", function () {',
              '    pm.response.to.have.status(200);',
              '});',
              'pm.test("Likes count returned", function () {',
              '    var jsonData = pm.response.json();',
              '    pm.expect(jsonData.data).to.have.property("likes");',
              '});'
            ]
          })
        ]
      },

      // ==========================================
      // MODULE 7: ADVANCED & INTERVIEW-LEVEL
      // ==========================================
      {
        name: "⚫ Module 7: Advanced & Interview-Level",
        description: "Complex scenarios asked in senior developer interviews: simulated network delays, random 500 retries, binary image streams, form-urlencoded payloads, and strict validator errors.",
        item: [
          createRequest({
            name: "35. Delayed Response (Timeout Practice)",
            method: "GET",
            urlPath: "/api/advanced/delayed",
            queryParams: { seconds: 3 },
            description: "Holds the connection and only responds after N seconds (1-30s).\n\n### Interview Practice\nConfigure your OkHttp/Dio connectTimeout and readTimeout lower than this delay to test timeout exception handling in your app!",
            tests: [
              'pm.test("Status code is 200", function () {',
              '    pm.response.to.have.status(200);',
              '});',
              'pm.test("Delayed response verified", function () {',
              '    var jsonData = pm.response.json();',
              '    pm.expect(jsonData.data.delay_seconds).to.eql(3);',
              '});'
            ]
          }),
          createRequest({
            name: "36. Random Server Error (50% Chance)",
            method: "GET",
            urlPath: "/api/advanced/random-error",
            description: "Randomly returns `200 OK` (50% chance) or `500 Internal Server Error` (50% chance).\n\n### Interview Practice\nImplement exponential backoff retry logic in your HTTP client (e.g. using OkHttp Interceptor or Polly/Dio retry).",
            tests: [
              'pm.test("Status code is either 200 or 500", function () {',
              '    pm.expect([200, 500]).to.include(pm.response.code);',
              '});'
            ]
          }),
          createRequest({
            name: "37. Form URL-Encoded POST",
            method: "POST",
            urlPath: "/api/advanced/form-data",
            bodyType: "urlencoded",
            body: [
              { key: "username", value: "johndoe", type: "text" },
              { key: "country", value: "India", type: "text" },
              { key: "experience_years", value: "5", type: "text" }
            ],
            description: "Accepts `application/x-www-form-urlencoded` payloads.\n\n### Android Retrofit Tip\n```kotlin\n@FormUrlEncoded\n@POST(\"api/advanced/form-data\")\nsuspend fun submitForm(@Field(\"username\") user: String): Response<ApiResponse>\n```",
            tests: [
              'pm.test("Status code is 200", function () {',
              '    pm.response.to.have.status(200);',
              '});',
              'pm.test("Form data recognized", function () {',
              '    var jsonData = pm.response.json();',
              '    pm.expect(jsonData.data.received_fields.username).to.eql("johndoe");',
              '});'
            ]
          }),
          createRequest({
            name: "38. Large Response (1000+ Items)",
            method: "GET",
            urlPath: "/api/advanced/large-response",
            queryParams: { count: 1000 },
            description: "Generates 1000+ items on-the-fly (query `count` can be 100 to 5000).\n\n### Android Practice\nTest memory footprints and background JSON parsing with Moshi/Kotlinx Serialization.",
            tests: [
              'pm.test("Status code is 200", function () {',
              '    pm.response.to.have.status(200);',
              '});',
              'pm.test("1000 items returned", function () {',
              '    var jsonData = pm.response.json();',
              '    pm.expect(jsonData.total).to.eql(1000);',
              '});'
            ]
          }),
          createRequest({
            name: "39. Binary Image Stream Response",
            method: "GET",
            urlPath: "/api/advanced/image-response",
            description: "Returns binary raw image data (`image/png`) directly in the HTTP stream instead of JSON.\n\n### Android Practice\nLoad directly into Coil, Glide, or Coil3 using `ResponseBody.byteStream()`.",
            tests: [
              'pm.test("Status code is 200", function () {',
              '    pm.response.to.have.status(200);',
              '});',
              'pm.test("Content-Type is image/png", function () {',
              '    pm.expect(pm.response.headers.get("Content-Type")).to.include("image/png");',
              '});'
            ]
          }),
          createRequest({
            name: "40. HTTP Status Code Simulator",
            method: "GET",
            urlPath: "/api/advanced/status/:code",
            pathVariables: { code: "404" },
            description: "Simulates ANY requested HTTP status code.\n\nSupported codes: `200`, `201`, `204`, `301`, `302`, `400`, `401`, `403`, `404`, `405`, `409`, `422`, `429`, `500`, `502`, `503`.",
            tests: [
              'pm.test("Status code matches requested code", function () {',
              '    pm.expect(pm.response.code).to.eql(404);',
              '});'
            ]
          }),
          createRequest({
            name: "41. Rate Limited Endpoint (5 req/min)",
            method: "GET",
            urlPath: "/api/advanced/rate-limited",
            description: "Strictly rate-limited to 5 requests per minute.\n\nSend 6 requests in a row to observe HTTP `429 Too Many Requests`.",
            tests: [
              'pm.test("Status code is 200 or 429", function () {',
              '    pm.expect([200, 429]).to.include(pm.response.code);',
              '});'
            ]
          }),
          createRequest({
            name: "42a. Strict Validation - Success",
            method: "POST",
            urlPath: "/api/advanced/validate",
            body: {
              email: "alex.mercer@example.com",
              password: "SecurePassword123!",
              name: "Alex Mercer",
              age: 28,
              phone: "+919876543210",
              website: "https://example.com",
              agree_terms: true
            },
            description: "Validates strict criteria across all fields (regex email, uppercase/lowercase/symbol password, phone number format, URL format).",
            tests: [
              'pm.test("Status code is 200 OK", function () {',
              '    pm.response.to.have.status(200);',
              '});',
              'pm.test("Validation succeeded", function () {',
              '    pm.expect(pm.response.json().success).to.eql(true);',
              '});'
            ]
          }),
          createRequest({
            name: "42b. Strict Validation - Field Errors",
            method: "POST",
            urlPath: "/api/advanced/validate",
            body: {
              email: "not-an-email",
              password: "short",
              name: "A",
              age: 5,
              phone: "123",
              website: "invalid-url",
              agree_terms: false
            },
            description: "Intentionally sends invalid fields to test client-side rendering of multiple form error messages.",
            tests: [
              'pm.test("Status code is 422 Unprocessable Entity", function () {',
              '    pm.response.to.have.status(422);',
              '});',
              'pm.test("Detailed validation errors list returned", function () {',
              '    var jsonData = pm.response.json();',
              '    pm.expect(jsonData.error.details).to.be.an("array");',
              '    pm.expect(jsonData.error.details.length).to.be.above(0);',
              '});'
            ]
          })
        ]
      },

      // ==========================================
      // MODULE 8: ERROR SIMULATION
      // ==========================================
      {
        name: "⚪ Module 8: Error Simulation",
        description: "Deterministic error status codes with detailed educational explanations and tips for Retrofit and Dio error handling.",
        item: [
          createRequest({
            name: "43. 400 Bad Request",
            method: "GET",
            urlPath: "/api/errors/400",
            description: "Returns HTTP 400 Bad Request.\n\n### Android Retrofit Tip\nInspect response with `response.errorBody()?.string()`.",
            tests: [
              'pm.test("Status code is 400", function () {',
              '    pm.response.to.have.status(400);',
              '});'
            ]
          }),
          createRequest({
            name: "44. 401 Unauthorized",
            method: "GET",
            urlPath: "/api/errors/401",
            description: "Returns HTTP 401 Unauthorized.\n\n### Android Action\nClear stored credentials and navigate user back to the login screen.",
            tests: [
              'pm.test("Status code is 401", function () {',
              '    pm.response.to.have.status(401);',
              '});'
            ]
          }),
          createRequest({
            name: "45. 403 Forbidden",
            method: "GET",
            urlPath: "/api/errors/403",
            description: "Returns HTTP 403 Forbidden. User is authenticated but lacks required authorization/role.",
            tests: [
              'pm.test("Status code is 403", function () {',
              '    pm.response.to.have.status(403);',
              '});'
            ]
          }),
          createRequest({
            name: "46. 404 Not Found",
            method: "GET",
            urlPath: "/api/errors/404",
            description: "Returns HTTP 404 Not Found. Resource or endpoint does not exist.",
            tests: [
              'pm.test("Status code is 404", function () {',
              '    pm.response.to.have.status(404);',
              '});'
            ]
          }),
          createRequest({
            name: "47. 500 Internal Server Error",
            method: "GET",
            urlPath: "/api/errors/500",
            description: "Returns HTTP 500 Internal Server Error. Demonstrates server-side crash or unhandled condition.",
            tests: [
              'pm.test("Status code is 500", function () {',
              '    pm.response.to.have.status(500);',
              '});'
            ]
          }),
          createRequest({
            name: "48. Timeout Simulator (Hangs)",
            method: "GET",
            urlPath: "/api/errors/timeout",
            description: "Keeps connection open indefinitely without sending a response.\n\nTest that your client's readTimeout triggers a SocketTimeoutException as expected.",
            tests: [
              '// This request is expected to trigger a client timeout'
            ]
          })
        ]
      }
    ]
  };

  return collection;
}

// Generate Environments
function generateRenderEnvironment() {
  return {
    id: "a1b2c3d4-render-env-dummyapi",
    name: "DummyApi - Cloud (Render)",
    values: [
      { key: "baseUrl", value: "https://dummyapi-tk55.onrender.com", enabled: true, type: "default" },
      { key: "apiKey", value: "practice-api-key-2024", enabled: true, type: "default" },
      { key: "authToken", value: "", enabled: true, type: "secret" },
      { key: "refreshToken", value: "", enabled: true, type: "secret" },
      { key: "testEmail", value: "test@example.com", enabled: true, type: "default" },
      { key: "testPassword", value: "password123", enabled: true, type: "secret" },
      { key: "productId", value: "1", enabled: true, type: "default" },
      { key: "postId", value: "1", enabled: true, type: "default" },
      { key: "commentId", value: "1", enabled: true, type: "default" },
      { key: "userId", value: "1", enabled: true, type: "default" }
    ],
    _postman_variable_scope: "environment"
  };
}

function generateLocalEnvironment() {
  return {
    id: "e5f6a7b8-local-env-dummyapi",
    name: "DummyApi - Localhost (Port 3000)",
    values: [
      { key: "baseUrl", value: "http://localhost:3000", enabled: true, type: "default" },
      { key: "apiKey", value: "practice-api-key-2024", enabled: true, type: "default" },
      { key: "authToken", value: "", enabled: true, type: "secret" },
      { key: "refreshToken", value: "", enabled: true, type: "secret" },
      { key: "testEmail", value: "test@example.com", enabled: true, type: "default" },
      { key: "testPassword", value: "password123", enabled: true, type: "secret" },
      { key: "productId", value: "1", enabled: true, type: "default" },
      { key: "postId", value: "1", enabled: true, type: "default" },
      { key: "commentId", value: "1", enabled: true, type: "default" },
      { key: "userId", value: "1", enabled: true, type: "default" }
    ],
    _postman_variable_scope: "environment"
  };
}

// Write files
const collectionData = generateCollection();
const renderEnvData = generateRenderEnvironment();
const localEnvData = generateLocalEnvironment();

const postmanDir = path.join(__dirname);
const rootDir = path.join(__dirname, '..');

// Save inside postman directory
fs.writeFileSync(path.join(postmanDir, 'DummyApi.postman_collection.json'), JSON.stringify(collectionData, null, 2));
fs.writeFileSync(path.join(postmanDir, 'DummyApi_Render_Environment.postman_environment.json'), JSON.stringify(renderEnvData, null, 2));
fs.writeFileSync(path.join(postmanDir, 'DummyApi_Local_Environment.postman_environment.json'), JSON.stringify(localEnvData, null, 2));

// Save root copy for easy top-level visibility
fs.writeFileSync(path.join(rootDir, 'DummyApi.postman_collection.json'), JSON.stringify(collectionData, null, 2));

console.log('✅ Postman Collection and Environments generated successfully!');
console.log('Total modules:', collectionData.item.length);
let count = 0;
collectionData.item.forEach(mod => {
  count += mod.item.length;
  console.log(`- ${mod.name}: ${mod.item.length} requests`);
});
console.log(`Total Endpoints in Collection: ${count}`);
