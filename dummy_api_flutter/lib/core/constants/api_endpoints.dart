// LEARNING: API Endpoints Constant File
// In Flutter applications, centralizing API URLs makes it easy to switch between:
// 1. Live Render Cloud Server: `https://dummyapi-tk55.onrender.com/api`
// 2. Android Emulator Localhost: `http://10.0.2.2:3000/api`
// 3. Local Desktop / Web: `http://localhost:3000/api`

class ApiEndpoints {
  // LEARNING: Live Render URL (No local npm start required!)
  static const String baseUrl = 'https://dummyapi-tk55.onrender.com/api';

  // Alternative Localhost URLs (Uncomment if testing local Node server offline):
  // static const String baseUrl = 'http://10.0.2.2:3000/api'; // Android Emulator
  // static const String baseUrl = 'http://localhost:3000/api'; // Windows / Web

  // ---------------------------------------------------------------------------
  // Module 1: Basic CRUD
  // ---------------------------------------------------------------------------
  static const String hello = '$baseUrl/hello';
  static const String products = '$baseUrl/products';
  static String productById(int id) => '$baseUrl/products/$id';
  static String productsByCategory(String catId) => '$baseUrl/categories/$catId/products';

  // ---------------------------------------------------------------------------
  // Module 2: Query Parameters
  // ---------------------------------------------------------------------------
  static const String users = '$baseUrl/users';
  static String userById(int id) => '$baseUrl/users/$id';

  // ---------------------------------------------------------------------------
  // Module 3: Authentication (JWT)
  // ---------------------------------------------------------------------------
  static const String register = '$baseUrl/auth/register';
  static const String login = '$baseUrl/auth/login';
  static const String refresh = '$baseUrl/auth/refresh';
  static const String profile = '$baseUrl/auth/profile';
  static const String changePassword = '$baseUrl/auth/change-password';
  static const String logout = '$baseUrl/auth/logout';

  // ---------------------------------------------------------------------------
  // Module 4: Headers & Security
  // ---------------------------------------------------------------------------
  static const String secureData = '$baseUrl/secure/data';
  static const String headersEcho = '$baseUrl/headers/echo';
  static const String headersCustom = '$baseUrl/headers/custom';
  static const String headersAccept = '$baseUrl/headers/accept';

  // ---------------------------------------------------------------------------
  // Module 5: File Upload & Download
  // ---------------------------------------------------------------------------
  static const String uploadSingle = '$baseUrl/upload/single';
  static const String uploadMultiple = '$baseUrl/upload/multiple';
  static const String uploadVideo = '$baseUrl/upload/video';
  static const String uploadDocument = '$baseUrl/upload/document';
  static const String uploadAvatarWithData = '$baseUrl/upload/avatar-with-data';
  static String downloadFile(String filename) => '$baseUrl/download/$filename';

  // ---------------------------------------------------------------------------
  // Module 6: Posts & Comments (Nested Data)
  // ---------------------------------------------------------------------------
  static const String posts = '$baseUrl/posts';
  static String postById(int id) => '$baseUrl/posts/$id';
  static String postComments(int postId) => '$baseUrl/posts/$postId/comments';
  static String postLike(int postId) => '$baseUrl/posts/$postId/like';

  // ---------------------------------------------------------------------------
  // Module 7: Advanced Scenarios
  // ---------------------------------------------------------------------------
  static const String advancedDelayed = '$baseUrl/advanced/delayed';
  static const String advancedRandomError = '$baseUrl/advanced/random-error';
  static const String advancedFormData = '$baseUrl/advanced/form-data';
  static const String advancedLargeResponse = '$baseUrl/advanced/large-response';
  static const String advancedImageResponse = '$baseUrl/advanced/image-response';
  static String advancedStatus(int code) => '$baseUrl/advanced/status/$code';
  static const String advancedRateLimited = '$baseUrl/advanced/rate-limited';
  static const String advancedValidate = '$baseUrl/advanced/validate';

  // ---------------------------------------------------------------------------
  // Module 8: Error Simulation
  // ---------------------------------------------------------------------------
  static const String error400 = '$baseUrl/errors/400';
  static const String error401 = '$baseUrl/errors/401';
  static const String error403 = '$baseUrl/errors/403';
  static const String error404 = '$baseUrl/errors/404';
  static const String error500 = '$baseUrl/errors/500';
  static const String errorTimeout = '$baseUrl/errors/timeout';
}
