# 🚀 Dummy API Flutter Masterclass (MVC Architecture)

A comprehensive, production-grade Flutter learning application designed to teach **REST API Integration**, **State Management**, **Network Interceptors**, **JWT Authentication**, **File Uploads**, and **Error Handling** across **48 API endpoints**.

---

## 📌 Project Overview & Tech Stack

- **Flutter Version:** `3.47.4` (Dart SDK `3.13.3`)
- **SDK Path:** `D:\flutter_version\flutter_3.47.4\`
- **Architecture Pattern:** **MVC (Model-View-Controller)** with modular structure ready for future **MVVM** extension.
- **HTTP Engine:** `Dio ^5.4.0` (with custom Interceptors, Logging, and File Upload support)
- **State Management:** `Provider ^6.1.1` (`ChangeNotifier`)
- **Local Persistence:** `shared_preferences ^2.2.2`
- **UI & Fonts:** Material Design 3, Google Fonts (`Inter` + `Poppins`), custom harmonic palette (NO neon colors).

---

## 📁 Directory Architecture

```
dummy_api_flutter/
├── lib/
│   ├── core/                           # Shared App Foundations
│   │   ├── constants/                  # API URLs & Color System
│   │   │   ├── api_endpoints.dart      # Centralized 48 Endpoint Map
│   │   │   └── app_colors.dart         # Harmonic Color Palette Tokens
│   │   ├── network/                    # Centralized Network Engine
│   │   │   ├── api_client.dart         # Dio Singleton Wrapper & Live Logger
│   │   │   ├── api_exceptions.dart     # Custom Exception Classes (400, 401, 403, 404, 500, Timeout)
│   │   │   ├── api_response.dart       # Generic ApiResponse<T> Envelope & Error Models
│   │   │   └── auth_interceptor.dart   # Dio Interceptor for JWT Bearer Tokens & Auto Refresh
│   │   ├── services/
│   │   │   ├── auth_service.dart       # Global Reactive Auth State (ChangeNotifier)
│   │   │   └── storage_service.dart    # SharedPreferences JWT Token Storage
│   │   ├── theme/
│   │   │   └── app_theme.dart          # Material 3 Theme with Google Fonts
│   │   └── widgets/                    # Reusable Educational UI Components
│   │       ├── api_log_viewer.dart     # Real-time HTTP Log Inspector Sheet
│   │       ├── custom_button.dart      # Action Button with Spinner
│   │       ├── custom_text_field.dart  # Form Input Field
│   │       ├── empty_state.dart        # Empty State Display
│   │       ├── error_display.dart      # Status Code Error Banner
│   │       ├── learning_banner.dart    # Concept Callout Header Banner
│   │       ├── loading_indicator.dart # Loading Spinner
│   │       └── response_card.dart      # Formatted JSON Response Viewer
│   ├── mvc/                            # Model-View-Controller Implementation
│   │   ├── basic_crud/                 # Module 1: GET, POST, PUT, DELETE, Path Params
│   │   ├── query_params/               # Module 2: Pagination, Search, Sort, Filters
│   │   ├── auth/                       # Module 3: JWT Login, Register, Refresh, Profile
│   │   ├── headers/                    # Module 4: X-API-Key, Echo, Custom Headers
│   │   ├── upload/                     # Module 5: Multipart Single/Multi Images, Docs
│   │   ├── posts_comments/             # Module 6: Relational & Nested JSON Objects
│   │   ├── advanced/                   # Module 7: Latency, Form-UrlEncoded, Rate Limits
│   │   └── errors/                     # Module 8: Intentionally Triggered Exception Lab
│   ├── mvvm/                           # Future Architecture Migration Directory Placeholder
│   │   └── .gitkeep
│   ├── app.dart                        # Root Application & MultiProvider Injection
│   ├── home_screen.dart                # Dashboard Card Navigation & Log Viewer Launcher
│   └── main.dart                       # App Entrypoint
```

---

## 🎓 Learning Callouts Pattern

Every source file contains inline **`// LEARNING:`** explanations highlighting key concepts:
- **`ApiResponse<T>` Pattern:** Standard envelope wrapping `{ success, message, data, error, timestamp }`.
- **Dio Interceptors:** How `AuthInterceptor` intercepts HTTP calls to add `Authorization: Bearer <token>` or automatically refresh expired tokens on HTTP 401.
- **Path vs Query Parameters:** Difference between `/products/:id` (Path) and `/users?page=1&search=john` (Query).
- **Multipart Form Uploads:** Creating `FormData` with `MultipartFile.fromFile()` for binary files.
- **Custom Exception Handling:** Catching `BadRequestException`, `UnauthorizedException`, `NotFoundException`, and `NetworkConnectionException`.

---

## 🗺️ 8 API Modules & 48 Endpoints Covered

| Module | Features & Endpoints |
| :--- | :--- |
| **01. Basic CRUD** | `GET /api/hello`, `GET /api/products`, `GET /api/products/:id`, `POST /api/products`, `PUT /api/products/:id`, `DELETE /api/products/:id`, `GET /api/categories/:catId/products` |
| **02. Query Parameters** | `GET /api/users?page=1&limit=5&search=john&sort=name&order=asc&role=admin`, `GET /api/users/:id` |
| **03. Auth & JWT** | `POST /api/auth/register`, `POST /api/auth/login`, `POST /api/auth/refresh`, `GET /api/auth/profile`, `PUT /api/auth/profile`, `POST /api/auth/change-password`, `POST /api/auth/logout` |
| **04. Headers & Security** | `GET /api/secure/data` (X-API-Key), `GET /api/headers/echo`, `POST /api/headers/custom`, `GET /api/headers/accept` |
| **05. File Upload & Download** | `POST /api/upload/single`, `POST /api/upload/multiple`, `POST /api/upload/video`, `POST /api/upload/document`, `POST /api/upload/avatar-with-data`, `GET /api/download/:filename` |
| **06. Posts & Comments** | `GET /api/posts`, `GET /api/posts/:id`, `POST /api/posts`, `POST /api/posts/:id/comments`, `POST /api/posts/:id/like`, `DELETE /api/posts/:id` |
| **07. Advanced Scenarios** | `GET /api/advanced/delayed`, `GET /api/advanced/random-error`, `POST /api/advanced/form-data`, `GET /api/advanced/large-response`, `GET /api/advanced/image-response`, `GET /api/advanced/status/:code`, `GET /api/advanced/rate-limited`, `POST /api/advanced/validate` |
| **08. Error Simulation** | `GET /api/errors/400`, `GET /api/errors/401`, `GET /api/errors/403`, `GET /api/errors/404`, `GET /api/errors/500`, `GET /api/errors/timeout` |

---

## ⚙️ How to Run the Project

### 🌐 Option A: Connect to Live Render Cloud (Default - Recommended!)
Since the API is live on Render, **you do NOT need to run `npm start` locally!**

Simply open terminal in `dummy_api_flutter` and launch:
```bash
D:\flutter_version\flutter_3.47.4\bin\flutter.bat run
```
The app will connect to: `https://dummyapi-tk55.onrender.com/api`

---

### 💻 Option B: Run Node.js Server Locally (Optional / Offline)
If you want to run offline or test local changes to backend code:
1. Open terminal in `D:\DummyApi\` and run: `npm start`
2. Change `baseUrl` in `lib/core/constants/api_endpoints.dart` to `http://10.0.2.2:3000/api` (Android Emulator) or `http://localhost:3000/api`.

---

## 🔑 Test Credentials & Keys

- **Auth Login Email:** `test@example.com`
- **Auth Login Password:** `password123`
- **Valid API Key:** `practice-api-key-2024`
