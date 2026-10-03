/**
 * Flutter Architecture & Production Code Recipes
 * Educational tutorial database with production-ready Dart snippets for technical interviews.
 */

const tutorials = [
  // =========================================================================
  // 1. HOW TO USE API CLIENT (PRACTICAL API CALLING GUIDE)
  // =========================================================================
  {
    id: 'api-calling-guide',
    slug: 'how-to-call-apis',
    title: 'Complete Practical Guide: How to Use ApiClient to Call APIs',
    category: '🌐 Network & API Layer',
    badge: 'Hands-on Guide',
    difficulty: 'All Levels',
    readTime: '7 min read',
    description: 'Direct copy-paste examples showing exactly how to execute GET, POST, PUT, PATCH, DELETE, query params, auth tokens, file uploads, and error handling using ApiClient.',
    whyThisPattern: 'In a live coding interview, you often have 20 minutes to connect a screen to an API. This guide gives you the exact syntax for every HTTP method, demonstrating senior-level practices: typing responses, handling errors, and avoiding memory leaks.',
    pubspecDeps: `dependencies:
  dio: ^5.7.0`,
    fileName: 'lib/examples/api_client_usage_guide.dart',
    code: `import 'dart:io';
import 'package:dio/dio.dart';
import '../core/network/api_client.dart';
import '../core/network/api_exceptions.dart';
import '../core/network/api_response.dart';
import '../data/models/product_model.dart';

/// Comprehensive cheatsheet showing how to call any REST API endpoint using ApiClient.
class ApiUsageExamples {
  final ApiClient _api = ApiClient();

  // ---------------------------------------------------------------------------
  // 1. GET Request: Fetching a List of Items
  // ---------------------------------------------------------------------------
  Future<List<Product>> fetchProducts() async {
    try {
      final response = await _api.get<List<dynamic>>('/api/products');

      if (response.success && response.data != null) {
        return response.data!
            .map((item) => Product.fromJson(item as Map<String, dynamic>))
            .toList();
      }
      return [];
    } on ApiException catch (e) {
      print('API Error [\${e.statusCode}]: \${e.message}');
      rethrow;
    }
  }

  // ---------------------------------------------------------------------------
  // 2. GET Request with Query Parameters (Search & Pagination)
  // ---------------------------------------------------------------------------
  Future<List<dynamic>> searchUsers({
    required String query,
    int page = 1,
    int limit = 10,
  }) async {
    try {
      final response = await _api.get<Map<String, dynamic>>(
        '/api/users/search',
        queryParameters: {
          'q': query,
          'page': page,
          'limit': limit,
          'sort_by': 'created_at',
          'order': 'desc',
        },
      );

      return response.data?['users'] as List<dynamic>? ?? [];
    } on ApiException catch (e) {
      print('Search failed: \${e.message}');
      return [];
    }
  }

  // ---------------------------------------------------------------------------
  // 3. GET Request with Path Parameter: Fetch by ID
  // ---------------------------------------------------------------------------
  Future<Product?> fetchProductById(int productId) async {
    try {
      final response = await _api.get<Map<String, dynamic>>('/api/products/$productId');

      if (response.success && response.data != null) {
        return Product.fromJson(response.data!);
      }
      return null;
    } on NotFoundException {
      print('Product #$productId was not found.');
      return null;
    } on ApiException catch (e) {
      print('Error: \${e.message}');
      return null;
    }
  }

  // ---------------------------------------------------------------------------
  // 4. POST Request with JSON Body: Creating a Resource
  // ---------------------------------------------------------------------------
  Future<Product?> createProduct({
    required String name,
    required double price,
    required String category,
  }) async {
    try {
      final response = await _api.post<Map<String, dynamic>>(
        '/api/products',
        data: {
          'name': name,
          'price': price,
          'category': category,
        },
      );

      if (response.success && response.data != null) {
        return Product.fromJson(response.data!);
      }
      return null;
    } on BadRequestException catch (e) {
      // Handles 400 validation error from backend
      print('Validation failed: \${e.message}');
      return null;
    }
  }

  // ---------------------------------------------------------------------------
  // 5. POST Request for Authentication (Login)
  // ---------------------------------------------------------------------------
  Future<bool> login(String email, String password) async {
    try {
      final response = await _api.post<Map<String, dynamic>>(
        '/api/auth/login',
        data: {
          'email': email,
          'password': password,
        },
      );

      if (response.success && response.data != null) {
        final accessToken = response.data!['accessToken'];
        final refreshToken = response.data!['refreshToken'];
        print('Logged in successfully! Token: \$accessToken');
        return true;
      }
      return false;
    } on UnauthorizedException {
      print('Invalid email or password.');
      return false;
    }
  }

  // ---------------------------------------------------------------------------
  // 6. PUT Request: Full Resource Update
  // ---------------------------------------------------------------------------
  Future<bool> updateProduct(int id, Product updatedProduct) async {
    try {
      final response = await _api.put<Map<String, dynamic>>(
        '/api/products/$id',
        data: updatedProduct.toJson(),
      );
      return response.success;
    } on ApiException catch (e) {
      print('Update error: \${e.message}');
      return false;
    }
  }

  // ---------------------------------------------------------------------------
  // 7. PATCH Request: Partial Update (Only changed fields)
  // ---------------------------------------------------------------------------
  Future<bool> updateProductPrice(int id, double newPrice) async {
    try {
      final response = await _api.patch<Map<String, dynamic>>(
        '/api/products/$id',
        data: {'price': newPrice},
      );
      return response.success;
    } on ApiException catch (e) {
      print('Price patch error: \${e.message}');
      return false;
    }
  }

  // ---------------------------------------------------------------------------
  // 8. DELETE Request: Deleting by ID
  // ---------------------------------------------------------------------------
  Future<bool> deleteProduct(int id) async {
    try {
      final response = await _api.delete<Map<String, dynamic>>('/api/products/$id');
      return response.success;
    } on ApiException catch (e) {
      print('Delete error: \${e.message}');
      return false;
    }
  }

  // ---------------------------------------------------------------------------
  // 9. Multipart File / Image Upload with Progress
  // ---------------------------------------------------------------------------
  Future<String?> uploadProfileImage(File file) async {
    try {
      final response = await _api.uploadFile<Map<String, dynamic>>(
        '/api/upload/image',
        filePath: file.path,
        fileFieldName: 'file',
        extraFields: {'description': 'Profile Avatar'},
        onSendProgress: (sent, total) {
          final progress = (sent / total * 100).toStringAsFixed(0);
          print('Upload progress: \$progress%');
        },
      );

      if (response.success && response.data != null) {
        return response.data!['file_url'];
      }
      return null;
    } on ApiException catch (e) {
      print('Upload failed: \${e.message}');
      return null;
    }
  }

  // ---------------------------------------------------------------------------
  // 10. Cancelling In-flight Requests (e.g. When User Navigates Back)
  // ---------------------------------------------------------------------------
  Future<void> cancellableRequest(CancelToken cancelToken) async {
    try {
      final response = await _api.get<dynamic>(
        '/api/advanced/delayed?seconds=5',
        cancelToken: cancelToken,
      );
      print('Result: \${response.data}');
    } on ApiException catch (e) {
      print('Request was safely aborted: \${e.message}');
    }
  }
}`,
    usageExample: `// How to call in a Flutter Widget or State:
ElevatedButton(
  onPressed: () async {
    final examples = ApiUsageExamples();
    final products = await examples.fetchProducts();
    print('Fetched \${products.length} products');
  },
  child: const Text('Fetch Products'),
)`,
    interviewTips: [
      {
        question: 'What is the difference between PUT and PATCH?',
        answer: 'PUT is idempotent and replaces the entire resource representation (all fields must be provided). PATCH updates only the specific fields included in the request body.'
      },
      {
        question: 'How do you handle query parameters cleanly?',
        answer: 'Pass a Map<String, dynamic> to queryParameters in Dio or NativeHttpClient. Dio automatically URL-encodes values, handles booleans, lists, and removes nulls.'
      }
    ]
  },

  // =========================================================================
  // 2. PRODUCTION DIO API CLIENT
  // =========================================================================
  {
    id: 'api-client-dio',
    slug: 'api-client',
    title: 'Production-Ready Dio HTTP Client',
    category: '🌐 Network & API Layer',
    badge: 'Core Architecture',
    difficulty: 'Intermediate',
    readTime: '6 min read',
    description: 'A robust, centralized Dio network client featuring BaseOptions, configurable timeouts, custom interceptors, automated error translation, and multipart file upload support.',
    whyThisPattern: 'Directly invoking raw HTTP calls inside Flutter widgets leads to tight coupling, duplicate header logic, memory leaks, and brittle error handling. A centralized ApiClient encapsulates network configurations, enforces consistent timeout handling, injects authentication headers automatically, and unifies error parsing across your entire app.',
    pubspecDeps: `dependencies:
  flutter:
    sdk: flutter
  dio: ^5.7.0`,
    fileName: 'lib/core/network/api_client.dart',
    code: `import 'package:dio/dio.dart';
import 'api_exceptions.dart';
import 'api_response.dart';
import 'auth_interceptor.dart';

/// Production-ready HTTP client wrapper built on top of [Dio].
/// Implements Singleton pattern for centralized network configuration,
/// request interception, error handling, and file uploads.
class ApiClient {
  static final ApiClient _instance = ApiClient._internal();
  factory ApiClient() => _instance;

  late final Dio _dio;

  // Base URL configuration - Replace with your server URL
  static const String baseUrl = 'https://dummy-api.onrender.com';
  static const Duration connectTimeout = Duration(seconds: 15);
  static const Duration receiveTimeout = Duration(seconds: 15);

  ApiClient._internal() {
    final options = BaseOptions(
      baseUrl: baseUrl,
      connectTimeout: connectTimeout,
      receiveTimeout: receiveTimeout,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      responseType: ResponseType.json,
    );

    _dio = Dio(options);

    // Attach custom interceptors
    _dio.interceptors.addAll([
      AuthInterceptor(dio: _dio),
      LogInterceptor(
        request: true,
        requestHeader: true,
        requestBody: true,
        responseHeader: false,
        responseBody: true,
        error: true,
      ),
    ]);
  }

  /// Expose underlying Dio instance if custom access is needed
  Dio get client => _dio;

  /// HTTP GET Request
  Future<ApiResponse<T>> get<T>(
    String path, {
    Map<String, dynamic>? queryParameters,
    Options? options,
    CancelToken? cancelToken,
  }) async {
    try {
      final response = await _dio.get(
        path,
        queryParameters: queryParameters,
        options: options,
        cancelToken: cancelToken,
      );
      return ApiResponse<T>.fromJson(response.data, response.statusCode ?? 200);
    } on DioException catch (e) {
      throw ApiExceptionHandler.fromDioException(e);
    } catch (e) {
      throw ApiException(message: 'Unexpected network error occurred: $e');
    }
  }

  /// HTTP POST Request
  Future<ApiResponse<T>> post<T>(
    String path, {
    dynamic data,
    Map<String, dynamic>? queryParameters,
    Options? options,
    CancelToken? cancelToken,
  }) async {
    try {
      final response = await _dio.post(
        path,
        data: data,
        queryParameters: queryParameters,
        options: options,
        cancelToken: cancelToken,
      );
      return ApiResponse<T>.fromJson(response.data, response.statusCode ?? 200);
    } on DioException catch (e) {
      throw ApiExceptionHandler.fromDioException(e);
    } catch (e) {
      throw ApiException(message: 'Unexpected network error occurred: $e');
    }
  }

  /// HTTP PUT Request (Full Update)
  Future<ApiResponse<T>> put<T>(
    String path, {
    dynamic data,
    Map<String, dynamic>? queryParameters,
    Options? options,
    CancelToken? cancelToken,
  }) async {
    try {
      final response = await _dio.put(
        path,
        data: data,
        queryParameters: queryParameters,
        options: options,
        cancelToken: cancelToken,
      );
      return ApiResponse<T>.fromJson(response.data, response.statusCode ?? 200);
    } on DioException catch (e) {
      throw ApiExceptionHandler.fromDioException(e);
    } catch (e) {
      throw ApiException(message: 'Unexpected network error occurred: $e');
    }
  }

  /// HTTP PATCH Request (Partial Update)
  Future<ApiResponse<T>> patch<T>(
    String path, {
    dynamic data,
    Map<String, dynamic>? queryParameters,
    Options? options,
    CancelToken? cancelToken,
  }) async {
    try {
      final response = await _dio.patch(
        path,
        data: data,
        queryParameters: queryParameters,
        options: options,
        cancelToken: cancelToken,
      );
      return ApiResponse<T>.fromJson(response.data, response.statusCode ?? 200);
    } on DioException catch (e) {
      throw ApiExceptionHandler.fromDioException(e);
    } catch (e) {
      throw ApiException(message: 'Unexpected network error occurred: $e');
    }
  }

  /// HTTP DELETE Request
  Future<ApiResponse<T>> delete<T>(
    String path, {
    dynamic data,
    Map<String, dynamic>? queryParameters,
    Options? options,
    CancelToken? cancelToken,
  }) async {
    try {
      final response = await _dio.delete(
        path,
        data: data,
        queryParameters: queryParameters,
        options: options,
        cancelToken: cancelToken,
      );
      return ApiResponse<T>.fromJson(response.data, response.statusCode ?? 200);
    } on DioException catch (e) {
      throw ApiExceptionHandler.fromDioException(e);
    } catch (e) {
      throw ApiException(message: 'Unexpected network error occurred: $e');
    }
  }

  /// Multipart File & Image Upload
  Future<ApiResponse<T>> uploadFile<T>(
    String path, {
    required String filePath,
    required String fileFieldName,
    Map<String, dynamic>? extraFields,
    ProgressCallback? onSendProgress,
  }) async {
    try {
      final fileName = filePath.split('/').last;
      final formData = FormData.fromMap({
        fileFieldName: await MultipartFile.fromFile(filePath, filename: fileName),
        if (extraFields != null) ...extraFields,
      });

      final response = await _dio.post(
        path,
        data: formData,
        onSendProgress: onSendProgress,
      );
      return ApiResponse<T>.fromJson(response.data, response.statusCode ?? 200);
    } on DioException catch (e) {
      throw ApiExceptionHandler.fromDioException(e);
    } catch (e) {
      throw ApiException(message: 'File upload failed: $e');
    }
  }
}`,
    usageExample: `// Example: How to invoke the ApiClient in a repository or controller
void loadProducts() async {
  final apiClient = ApiClient();
  try {
    final response = await apiClient.get<List<dynamic>>('/api/products');
    if (response.success && response.data != null) {
      final products = response.data!
          .map((item) => Product.fromJson(item as Map<String, dynamic>))
          .toList();
      print('Loaded \${products.length} products');
    }
  } on ApiException catch (e) {
    print('Failed to load products: \${e.message}');
  }
}`,
    interviewTips: [
      {
        question: 'Why choose Dio over standard http package?',
        answer: 'Dio provides out-of-the-box support for interceptors, global BaseOptions, automatic JSON transformation, request cancellation via CancelToken, file upload progress callbacks, and retry mechanisms without requiring custom wrapper layers.'
      },
      {
        question: 'How do you avoid memory leaks with long-running HTTP requests in Flutter?',
        answer: 'Use CancelToken in Dio. Instantiate a CancelToken in your State or ViewModel and call cancelToken.cancel() in the dispose() lifecycle method so in-flight requests abort immediately when the user exits the screen.'
      }
    ]
  },

  // =========================================================================
  // 3. API RESPONSE ENVELOPE MODEL
  // =========================================================================
  {
    id: 'api-response-model',
    slug: 'api-response',
    title: 'Standardized Generic API Response Envelope',
    category: '🌐 Network & API Layer',
    badge: 'Core Model',
    difficulty: 'Intermediate',
    readTime: '5 min read',
    description: 'Generic ApiResponse<T> wrapper mapping unified backend JSON structures (success, message, data, error details, and status codes).',
    whyThisPattern: 'Backend services almost always return an envelope like { "success": true, "data": {...} }. Wrapping responses in a strongly-typed generic class allows controllers and repositories to handle success and failure payloads uniformly.',
    pubspecDeps: `dependencies:
  flutter:
    sdk: flutter`,
    fileName: 'lib/core/network/api_response.dart',
    code: `/// Standardized API Response Wrapper
class ApiResponse<T> {
  final bool success;
  final String? message;
  final T? data;
  final ApiErrorDetails? error;
  final String? timestamp;
  final int statusCode;

  ApiResponse({
    required this.success,
    this.message,
    this.data,
    this.error,
    this.timestamp,
    required this.statusCode,
  });

  /// Factory constructor to parse JSON response map safely
  factory ApiResponse.fromJson(
    Map<String, dynamic> json,
    int statusCode, [
    T Function(dynamic dataJson)? createData,
  ]) {
    final bool isSuccess = json['success'] ?? (statusCode >= 200 && statusCode < 300);

    T? parsedData;
    if (isSuccess && json['data'] != null && createData != null) {
      try {
        parsedData = createData(json['data']);
      } catch (e) {
        print('JSON Parsing error for $T -> $e');
      }
    } else if (isSuccess && json['data'] != null) {
      parsedData = json['data'] as T?;
    }

    ApiErrorDetails? parsedError;
    if (!isSuccess && json['error'] != null) {
      parsedError = ApiErrorDetails.fromJson(json['error']);
    } else if (!isSuccess) {
      parsedError = ApiErrorDetails(
        code: statusCode,
        type: 'HTTP_ERROR',
        message: json['message'] ?? 'An error occurred with status code $statusCode',
      );
    }

    return ApiResponse<T>(
      success: isSuccess,
      message: json['message'] as String?,
      data: parsedData,
      error: parsedError,
      timestamp: json['timestamp'] as String?,
      statusCode: statusCode,
    );
  }
}

/// Standardized API Error Details Model
class ApiErrorDetails {
  final int code;
  final String type;
  final String message;
  final List<ValidationErrorField>? validationDetails;

  ApiErrorDetails({
    required this.code,
    required this.type,
    required this.message,
    this.validationDetails,
  });

  factory ApiErrorDetails.fromJson(Map<String, dynamic> json) {
    List<ValidationErrorField>? detailsList;
    if (json['details'] != null && json['details'] is List) {
      detailsList = (json['details'] as List)
          .map((item) => ValidationErrorField.fromJson(item as Map<String, dynamic>))
          .toList();
    }

    return ApiErrorDetails(
      code: json['code'] is int ? json['code'] : int.tryParse(json['code']?.toString() ?? '0') ?? 0,
      type: json['type'] as String? ?? 'UNKNOWN_ERROR',
      message: json['message'] as String? ?? 'An unexpected error occurred.',
      validationDetails: detailsList,
    );
  }
}

/// Field-level validation error
class ValidationErrorField {
  final String field;
  final String message;

  ValidationErrorField({required this.field, required this.message});

  factory ValidationErrorField.fromJson(Map<String, dynamic> json) {
    return ValidationErrorField(
      field: json['field'] as String? ?? '',
      message: json['message'] as String? ?? '',
    );
  }
}`,
    usageExample: `final res = ApiResponse<List<dynamic>>.fromJson(responseMap, 200);
if (res.success) {
  print('Data count: \${res.data?.length}');
}`,
    interviewTips: [
      {
        question: 'Why generic ApiResponse<T>?',
        answer: 'Generics avoid dynamic type-casting errors across the app. T can be Product, List<User>, Map, or bool.'
      }
    ]
  },

  // =========================================================================
  // 4. API EXCEPTIONS & ERROR MAPPER
  // =========================================================================
  {
    id: 'api-exceptions-handler',
    slug: 'error-handling',
    title: 'Custom API Exception Hierarchy & Error Mapper',
    category: '🌐 Network & API Layer',
    badge: 'Clean Architecture',
    difficulty: 'Intermediate',
    readTime: '5 min read',
    description: 'Transform low-level network exceptions and raw HTTP error codes into strongly-typed Dart exceptions with friendly, actionable user messages.',
    whyThisPattern: 'Never let raw DioException or SocketException crash your UI or display technical jargon like "SocketException: OS Error 111". Translating errors into a typed domain exception hierarchy enables UI layers to cleanly react (e.g. show a retry button on timeout, redirect to login on 401, or highlight field errors on 400).',
    pubspecDeps: `dependencies:
  dio: ^5.7.0`,
    fileName: 'lib/core/network/api_exceptions.dart',
    code: `import 'package:dio/dio.dart';

/// Base exception class for all API and network errors
class ApiException implements Exception {
  final String message;
  final int? statusCode;
  final dynamic details;

  ApiException({
    required this.message,
    this.statusCode,
    this.details,
  });

  @override
  String toString() => message;
}

/// HTTP 400 - Validation or bad request
class BadRequestException extends ApiException {
  final List<dynamic>? validationErrors;

  BadRequestException({
    required super.message,
    super.statusCode = 400,
    super.details,
    this.validationErrors,
  });
}

/// HTTP 401 - Unauthorized / Missing or expired session
class UnauthorizedException extends ApiException {
  UnauthorizedException({
    required super.message,
    super.statusCode = 401,
    super.details,
  });
}

/// HTTP 403 - Forbidden / Insufficient permissions
class ForbiddenException extends ApiException {
  ForbiddenException({
    required super.message,
    super.statusCode = 403,
    super.details,
  });
}

/// HTTP 404 - Resource not found
class NotFoundException extends ApiException {
  NotFoundException({
    required super.message,
    super.statusCode = 404,
    super.details,
  });
}

/// HTTP 429 - Rate limit exceeded
class RateLimitException extends ApiException {
  RateLimitException({
    required super.message,
    super.statusCode = 429,
    super.details,
  });
}

/// HTTP 500 - Server failure
class InternalServerErrorException extends ApiException {
  InternalServerErrorException({
    required super.message,
    super.statusCode = 500,
    super.details,
  });
}

/// No internet connectivity
class NetworkConnectionException extends ApiException {
  NetworkConnectionException({
    super.message = 'No Internet connection. Please check your network and retry.',
  });
}

/// Network timeout
class RequestTimeoutException extends ApiException {
  RequestTimeoutException({
    super.message = 'Connection timed out. The server took too long to respond.',
  });
}

/// Converter utility that maps a DioException to an ApiException
class ApiExceptionHandler {
  static ApiException fromDioException(DioException dioException) {
    switch (dioException.type) {
      case DioExceptionType.connectionTimeout:
      case DioExceptionType.sendTimeout:
      case DioExceptionType.receiveTimeout:
        return RequestTimeoutException();

      case DioExceptionType.connectionError:
        return NetworkConnectionException();

      case DioExceptionType.badResponse:
        final response = dioException.response;
        final statusCode = response?.statusCode ?? 500;
        final data = response?.data;

        String message = 'An error occurred (HTTP $statusCode)';
        List<dynamic>? validationErrors;

        if (data is Map<String, dynamic>) {
          if (data['error'] != null && data['error'] is Map) {
            message = data['error']['message'] ?? message;
            validationErrors = data['error']['validation'];
          } else if (data['message'] != null) {
            message = data['message'];
          }
        }

        switch (statusCode) {
          case 400:
            return BadRequestException(
              message: message,
              validationErrors: validationErrors,
            );
          case 401:
            return UnauthorizedException(message: message);
          case 403:
            return ForbiddenException(message: message);
          case 404:
            return NotFoundException(message: message);
          case 429:
            return RateLimitException(message: message);
          case 500:
          default:
            return InternalServerErrorException(
              message: message,
              statusCode: statusCode,
            );
        }

      case DioExceptionType.cancel:
        return ApiException(message: 'Request was cancelled.');

      case DioExceptionType.unknown:
      default:
        return ApiException(
          message: dioException.message ?? 'Unexpected error occurred.',
        );
    }
  }
}`,
    usageExample: `try {
  await apiClient.post('/api/auth/login', data: credentials);
} on UnauthorizedException catch (e) {
  showToast('Invalid credentials');
} on NetworkConnectionException {
  showOfflineBanner();
}`,
    interviewTips: [
      {
        question: 'Why not catch generic Exception?',
        answer: 'Catching specific exceptions allows UI to provide targeted feedback (e.g. 401 brings up login sheet, 429 informs user to wait, connection error shows retry).'
      }
    ]
  },

  // =========================================================================
  // 5. AUTH INTERCEPTOR & SILENT REFRESH
  // =========================================================================
  {
    id: 'auth-interceptor-refresh',
    slug: 'auth-interceptor',
    title: 'Auth Interceptor & Silent JWT Token Refresh',
    category: '🌐 Network & API Layer',
    badge: 'Enterprise Security',
    difficulty: 'Advanced',
    readTime: '7 min read',
    description: 'Intercepts outgoing HTTP requests to append JWT Bearer tokens, monitors for 401 Unauthorized responses, transparently issues a refresh token request, and replays failed queries seamlessly.',
    whyThisPattern: 'In production apps, access tokens expire quickly (e.g. after 15 minutes). Forcing users to log in repeatedly results in poor UX. A silent refresh interceptor catches the 401 error behind the scenes, requests a fresh token, updates secure storage, and retries the original request without user interruption.',
    pubspecDeps: `dependencies:
  dio: ^5.7.0
  shared_preferences: ^2.3.2`,
    fileName: 'lib/core/network/auth_interceptor.dart',
    code: `import 'package:dio/dio.dart';
import '../services/storage_service.dart';

/// Interceptor that handles Bearer token attachment and automatic
/// JWT token refresh on 401 Unauthorized responses.
class AuthInterceptor extends Interceptor {
  final Dio dio;

  AuthInterceptor({required this.dio});

  @override
  void onRequest(
    RequestOptions options,
    RequestInterceptorHandler handler,
  ) async {
    final isAuthEndpoint = options.path.contains('/api/auth/login') ||
        options.path.contains('/api/auth/register') ||
        options.path.contains('/api/auth/refresh');

    if (!isAuthEndpoint) {
      final token = await StorageService.getAccessToken();
      if (token != null && token.isNotEmpty) {
        options.headers['Authorization'] = 'Bearer $token';
      }
    }

    return handler.next(options);
  }

  @override
  void onError(
    DioException err,
    ErrorInterceptorHandler handler,
  ) async {
    if (err.response?.statusCode == 401 &&
        !err.requestOptions.path.contains('/api/auth/refresh') &&
        !err.requestOptions.path.contains('/api/auth/login')) {
      
      final refreshToken = await StorageService.getRefreshToken();

      if (refreshToken != null && refreshToken.isNotEmpty) {
        try {
          final tokenDio = Dio(BaseOptions(
            baseUrl: dio.options.baseUrl,
            headers: {'Content-Type': 'application/json'},
          ));

          final refreshResponse = await tokenDio.post(
            '/api/auth/refresh',
            data: {'refreshToken': refreshToken},
          );

          if (refreshResponse.statusCode == 200 &&
              refreshResponse.data['success'] == true) {
            
            final newAccessToken = refreshResponse.data['data']['accessToken'];
            final newRefreshToken = refreshResponse.data['data']['refreshToken'];

            await StorageService.saveTokens(
              accessToken: newAccessToken,
              refreshToken: newRefreshToken,
            );

            final requestOptions = err.requestOptions;
            requestOptions.headers['Authorization'] = 'Bearer $newAccessToken';

            final response = await dio.fetch(requestOptions);
            return handler.resolve(response);
          }
        } catch (refreshError) {
          await StorageService.clearAuthData();
        }
      }
    }

    return handler.next(err);
  }
}`,
    usageExample: `// Attached automatically inside ApiClient:
_dio.interceptors.add(AuthInterceptor(dio: _dio));`,
    interviewTips: [
      {
        question: 'Why create a separate Dio instance for refreshing token?',
        answer: 'If the refresh request itself fails with 401, using the same Dio instance would cause an infinite retry loop and crash the application.'
      }
    ]
  },

  // =========================================================================
  // 6. CENTRALIZED API ENDPOINTS FILE
  // =========================================================================
  {
    id: 'api-endpoints-file',
    slug: 'api-endpoints',
    title: 'Centralized API Endpoints & Routes Constants',
    category: '🌐 Network & API Layer',
    badge: 'Constants',
    difficulty: 'Beginner',
    readTime: '3 min read',
    description: 'Clean constant definitions for all REST routes, path parameter builders, and environment base URLs (Render live server, Android emulator, localhost).',
    whyThisPattern: 'Hardcoding string URLs like "/api/products/12" throughout ViewModels creates duplicate code and makes changing endpoints or server hosts prone to bugs. Centralizing all URLs ensures single-point configuration.',
    pubspecDeps: `dependencies:
  flutter:
    sdk: flutter`,
    fileName: 'lib/core/constants/api_endpoints.dart',
    code: `/// Centralized API Endpoints Constants
class ApiEndpoints {
  // Live Cloud URL
  static const String baseUrl = 'https://dummy-api.onrender.com/api';

  // Localhost alternatives:
  // static const String baseUrl = 'http://10.0.2.2:3000/api'; // Android Emulator
  // static const String baseUrl = 'http://localhost:3000/api'; // Desktop / Web

  // Module 1: Basic CRUD
  static const String hello = '$baseUrl/hello';
  static const String products = '$baseUrl/products';
  static String productById(int id) => '$baseUrl/products/$id';
  static String productsByCategory(String catId) => '$baseUrl/categories/$catId/products';

  // Module 2: Users & Filtering
  static const String users = '$baseUrl/users';
  static String userById(int id) => '$baseUrl/users/$id';
  static const String usersSearch = '$baseUrl/users/search';

  // Module 3: Authentication
  static const String register = '$baseUrl/auth/register';
  static const String login = '$baseUrl/auth/login';
  static const String refresh = '$baseUrl/auth/refresh';
  static const String profile = '$baseUrl/auth/profile';
  static const String logout = '$baseUrl/auth/logout';

  // Module 4: Uploads
  static const String uploadImage = '$baseUrl/upload/image';
  static const String uploadDocument = '$baseUrl/upload/document';
  static const String uploadAvatar = '$baseUrl/upload/avatar';
}`,
    usageExample: `final url = ApiEndpoints.productById(42);
final res = await apiClient.get(url);`,
    interviewTips: [
      {
        question: 'Why use 10.0.2.2 on Android emulator?',
        answer: 'Android emulators run in an isolated virtual router. 127.0.0.1 refers to the emulator itself, while 10.0.2.2 points to the development host machine computer.'
      }
    ]
  },

  // =========================================================================
  // 7. PURE HTTP CLIENT (NO DIO)
  // =========================================================================
  {
    id: 'native-http-client',
    slug: 'native-http',
    title: 'Pure HTTP Package Client (No Third-Party Dio)',
    category: '🌐 Network & API Layer',
    badge: 'Fundamental',
    difficulty: 'Beginner',
    readTime: '5 min read',
    description: 'When interviewers explicitly restrict libraries to standard Dart packages, this lightweight HTTP client uses package:http/http.dart with full JSON encoding, query parameter handling, and custom error mapping.',
    whyThisPattern: 'Many technical interviews test your foundational knowledge by forbidding high-level libraries like Dio or Retrofit. Knowing how to write a clean, generic HTTP client using only the official Dart http package demonstrates strong core software engineering skills.',
    pubspecDeps: `dependencies:
  http: ^1.2.2`,
    fileName: 'lib/core/network/native_http_client.dart',
    code: `import 'dart:async';
import 'dart:convert';
import 'dart:io';
import 'package:http/http.dart' as http;
import 'api_exceptions.dart';

/// Lightweight HTTP Client built using standard [package:http].
class NativeHttpClient {
  static final NativeHttpClient _instance = NativeHttpClient._internal();
  factory NativeHttpClient() => _instance;

  final http.Client _client = http.Client();
  static const String baseUrl = 'https://dummy-api.onrender.com';
  static const Duration timeoutDuration = Duration(seconds: 15);

  NativeHttpClient._internal();

  Uri _buildUri(String path, [Map<String, dynamic>? queryParameters]) {
    final cleanPath = path.startsWith('/') ? path : '/$path';
    final uri = Uri.parse('$baseUrl$cleanPath');

    if (queryParameters == null || queryParameters.isEmpty) {
      return uri;
    }

    final stringParams = queryParameters.map(
      (key, value) => MapEntry(key, value.toString()),
    );
    return uri.replace(queryParameters: stringParams);
  }

  Map<String, String> _buildHeaders({String? token}) {
    return {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      if (token != null && token.isNotEmpty) 'Authorization': 'Bearer $token',
    };
  }

  Future<dynamic> get(String path, {Map<String, dynamic>? queryParameters, String? token}) async {
    try {
      final uri = _buildUri(path, queryParameters);
      final response = await _client.get(uri, headers: _buildHeaders(token: token)).timeout(timeoutDuration);
      return _processResponse(response);
    } on SocketException {
      throw NetworkConnectionException();
    } on TimeoutException {
      throw RequestTimeoutException();
    }
  }

  Future<dynamic> post(String path, {dynamic body, String? token}) async {
    try {
      final uri = _buildUri(path);
      final response = await _client.post(
        uri,
        headers: _buildHeaders(token: token),
        body: body != null ? jsonEncode(body) : null,
      ).timeout(timeoutDuration);
      return _processResponse(response);
    } on SocketException {
      throw NetworkConnectionException();
    } on TimeoutException {
      throw RequestTimeoutException();
    }
  }

  dynamic _processResponse(http.Response response) {
    dynamic decoded;
    try {
      decoded = jsonDecode(response.body);
    } catch (_) {
      decoded = response.body;
    }

    if (response.statusCode >= 200 && response.statusCode < 300) {
      return decoded;
    }

    final message = (decoded is Map && decoded['error']?['message'] != null)
        ? decoded['error']['message']
        : 'HTTP \${response.statusCode} Error';

    if (response.statusCode == 400) throw BadRequestException(message: message);
    if (response.statusCode == 401) throw UnauthorizedException(message: message);
    if (response.statusCode == 404) throw NotFoundException(message: message);
    throw InternalServerErrorException(message: message, statusCode: response.statusCode);
  }

  void dispose() {
    _client.close();
  }
}`,
    usageExample: `final client = NativeHttpClient();
final data = await client.get('/api/products');`,
    interviewTips: [
      {
        question: 'How do you close the client?',
        answer: 'Call client.dispose() or client.close() when the application closes to release socket file descriptors.'
      }
    ]
  },

  // =========================================================================
  // 8. GLOBAL AUTH SERVICE (SERVICES)
  // =========================================================================
  {
    id: 'auth-service-state',
    slug: 'auth-service',
    title: 'Global Authentication State Service',
    category: '⚙️ Core Services Layer',
    badge: 'State Service',
    difficulty: 'Intermediate',
    readTime: '4 min read',
    description: 'Centralized authentication state controller using ChangeNotifier to notify widgets, route guards, and navigation observers upon login and logout.',
    whyThisPattern: 'Rather than polling storage in multiple screens, a single AuthService notifies the entire widget tree when credentials change, enabling instantaneous redirect to Login or Home screens.',
    pubspecDeps: `dependencies:
  flutter:
    sdk: flutter
  shared_preferences: ^2.3.2`,
    fileName: 'lib/core/services/auth_service.dart',
    code: `import 'package:flutter/foundation.dart';
import 'storage_service.dart';

/// Global Authentication Service inheriting from ChangeNotifier.
/// Notifies listeners (UI screens, navigation guards) on auth changes.
class AuthService extends ChangeNotifier {
  bool _isLoggedIn = false;
  String? _userEmail;
  String? _userName;

  bool get isLoggedIn => _isLoggedIn;
  String? get userEmail => _userEmail;
  String? get userName => _userName;

  AuthService() {
    _checkInitialAuth();
  }

  /// Check if user has active tokens on app launch
  Future<void> _checkInitialAuth() async {
    final token = await StorageService.getAccessToken();
    _isLoggedIn = token != null && token.isNotEmpty;
    notifyListeners();
  }

  /// Store tokens and update user session
  Future<void> setAuthData({
    required String email,
    required String name,
    required String accessToken,
    required String refreshToken,
  }) async {
    _isLoggedIn = true;
    _userEmail = email;
    _userName = name;
    await StorageService.saveTokens(
      accessToken: accessToken,
      refreshToken: refreshToken,
    );
    notifyListeners();
  }

  /// Logout user and wipe credentials
  Future<void> logout() async {
    await StorageService.clearAuthData();
    _isLoggedIn = false;
    _userEmail = null;
    _userName = null;
    notifyListeners();
  }
}`,
    usageExample: `// Listen in main app router:
ListenableBuilder(
  listenable: authService,
  builder: (context, _) {
    return authService.isLoggedIn ? const HomeScreen() : const LoginScreen();
  },
)`,
    interviewTips: [
      {
        question: 'How do you protect routes in Flutter?',
        answer: 'Bind an AuthService (ChangeNotifier) to your router (e.g. GoRouter refreshListenable). When logout() is called, the router automatically redirects to /login.'
      }
    ]
  },

  // =========================================================================
  // 9. LOCAL STORAGE SERVICE (SERVICES)
  // =========================================================================
  {
    id: 'local-storage-service',
    slug: 'storage-service',
    title: 'Secure Session & Local Storage Manager',
    category: '⚙️ Core Services Layer',
    badge: 'Persistence',
    difficulty: 'Beginner',
    readTime: '4 min read',
    description: 'Encapsulated SharedPreferences wrapper with safe typed methods and centralized keys for tokens, user IDs, and application preferences.',
    whyThisPattern: 'Accessing raw SharedPreferences strings across random widgets leads to typo bugs and scattered keys. A centralized StorageService consolidates keys as private constants and provides typed getters, setters, and clean session wipe on logout.',
    pubspecDeps: `dependencies:
  shared_preferences: ^2.3.2`,
    fileName: 'lib/core/services/storage_service.dart',
    code: `import 'package:shared_preferences/shared_preferences.dart';

/// Centralized local storage service wrapping SharedPreferences.
class StorageService {
  static SharedPreferences? _prefs;

  static const String _keyAccessToken = 'auth_access_token';
  static const String _keyRefreshToken = 'auth_refresh_token';
  static const String _keyUserId = 'auth_user_id';
  static const String _keyUserEmail = 'auth_user_email';
  static const String _keyIsDarkMode = 'settings_dark_mode';

  static Future<void> init() async {
    _prefs ??= await SharedPreferences.getInstance();
  }

  static Future<SharedPreferences> get _instance async {
    return _prefs ??= await SharedPreferences.getInstance();
  }

  static Future<void> saveTokens({
    required String accessToken,
    String? refreshToken,
  }) async {
    final prefs = await _instance;
    await prefs.setString(_keyAccessToken, accessToken);
    if (refreshToken != null) {
      await prefs.setString(_keyRefreshToken, refreshToken);
    }
  }

  static Future<String?> getAccessToken() async {
    final prefs = await _instance;
    return prefs.getString(_keyAccessToken);
  }

  static Future<String?> getRefreshToken() async {
    final prefs = await _instance;
    return prefs.getString(_keyRefreshToken);
  }

  static Future<void> clearAuthData() async {
    final prefs = await _instance;
    await prefs.remove(_keyAccessToken);
    await prefs.remove(_keyRefreshToken);
    await prefs.remove(_keyUserId);
    await prefs.remove(_keyUserEmail);
  }

  static Future<void> setDarkMode(bool isDark) async {
    final prefs = await _instance;
    await prefs.setBool(_keyIsDarkMode, isDark);
  }

  static Future<bool> isDarkMode() async {
    final prefs = await _instance;
    return prefs.getBool(_keyIsDarkMode) ?? false;
  }
}`,
    usageExample: `await StorageService.saveTokens(accessToken: 'token_123');
final token = await StorageService.getAccessToken();`,
    interviewTips: [
      {
        question: 'Is SharedPreferences secure for sensitive credentials?',
        answer: 'SharedPreferences stores unencrypted XML/plist on disk. For banking or HIPAA apps, flutter_secure_storage (Keychain/Keystore) is preferred. For general tokens and interview tests, SharedPreferences is standard.'
      }
    ]
  },

  // =========================================================================
  // 10. LOADING INDICATOR (WIDGETS)
  // =========================================================================
  {
    id: 'widget-loading-indicator',
    slug: 'loading-indicator',
    title: 'Standardized Loading Indicator Widget',
    category: '🎨 Core UI Widgets Layer',
    badge: 'Reusable UI',
    difficulty: 'Beginner',
    readTime: '3 min read',
    description: 'Clean, centered loading spinner widget with custom status message and smooth brand color theming.',
    whyThisPattern: 'Avoid duplicating CircularProgressIndicator and custom padding across every screen. A unified loading widget ensures consistent spinner styling and accessible loading messages.',
    pubspecDeps: `dependencies:
  flutter:
    sdk: flutter`,
    fileName: 'lib/core/widgets/loading_indicator.dart',
    code: `import 'package:flutter/material.dart';

/// Standardized Loading Indicator Widget
class LoadingIndicator extends StatelessWidget {
  final String message;
  final Color? color;

  const LoadingIndicator({
    super.key,
    this.message = 'Loading data from server...',
    this.color,
  });

  @override
  Widget build(BuildContext context) {
    final primaryColor = color ?? Theme.of(context).primaryColor;

    return Center(
      child: Padding(
        padding: const EdgeInsets.all(24.0),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            CircularProgressIndicator(
              valueColor: AlwaysStoppedAnimation<Color>(primaryColor),
            ),
            const SizedBox(height: 16),
            Text(
              message,
              textAlign: TextAlign.center,
              style: TextStyle(
                fontSize: 14,
                color: Colors.grey.shade600,
              ),
            ),
          ],
        ),
      ),
    );
  }
}`,
    usageExample: `if (isLoading) const LoadingIndicator(message: 'Fetching products...')`,
    interviewTips: [
      {
        question: 'Why show an informative loading message?',
        answer: 'Reduces perceived user wait time and meets accessibility standards for screen readers.'
      }
    ]
  },

  // =========================================================================
  // 11. ERROR DISPLAY WIDGET (WIDGETS)
  // =========================================================================
  {
    id: 'widget-error-display',
    slug: 'error-display',
    title: 'Standardized Error Display with Retry Action',
    category: '🎨 Core UI Widgets Layer',
    badge: 'Reusable UI',
    difficulty: 'Beginner',
    readTime: '3 min read',
    description: 'Polished error state presentation displaying HTTP status badges, error description, and a 1-tap Retry button.',
    whyThisPattern: 'Interviewers look closely at how you handle edge cases. Showing an intuitive error view with a retry callback demonstrates production-grade UX.',
    pubspecDeps: `dependencies:
  flutter:
    sdk: flutter`,
    fileName: 'lib/core/widgets/error_display.dart',
    code: `import 'package:flutter/material.dart';
import '../network/api_exceptions.dart';

/// Standardized Error Display Widget with Retry Action
class ErrorDisplay extends StatelessWidget {
  final Object? error;
  final VoidCallback onRetry;

  const ErrorDisplay({
    super.key,
    required this.error,
    required this.onRetry,
  });

  @override
  Widget build(BuildContext context) {
    String message = 'An unexpected error occurred.';
    int? code;

    if (error is ApiException) {
      final apiEx = error as ApiException;
      message = apiEx.message;
      code = apiEx.statusCode;
    } else if (error != null) {
      message = error.toString();
    }

    return Center(
      child: Padding(
        padding: const EdgeInsets.all(24.0),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              padding: const EdgeInsets.all(16),
              decoration: const BoxDecoration(
                color: Color(0xFFFFEBEE),
                shape: BoxShape.circle,
              ),
              child: const Icon(
                Icons.error_outline_rounded,
                color: Colors.red,
                size: 40,
              ),
            ),
            const SizedBox(height: 16),
            if (code != null) ...[
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                decoration: BoxDecoration(
                  color: Colors.red.shade700,
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Text(
                  'HTTP Status $code',
                  style: const TextStyle(
                    fontSize: 12,
                    fontWeight: FontWeight.bold,
                    color: Colors.white,
                  ),
                ),
              ),
              const SizedBox(height: 12),
            ],
            const Text(
              'API Request Failed',
              style: TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 8),
            Text(
              message,
              textAlign: TextAlign.center,
              style: TextStyle(
                fontSize: 13,
                color: Colors.grey.shade600,
              ),
            ),
            const SizedBox(height: 20),
            ElevatedButton.icon(
              onPressed: onRetry,
              icon: const Icon(Icons.refresh_rounded, size: 18),
              label: const Text('Try Again'),
              style: ElevatedButton.styleFrom(
                backgroundColor: Colors.red.shade600,
                foregroundColor: Colors.white,
              ),
            ),
          ],
        ),
      ),
    );
  }
}`,
    usageExample: `if (hasError) ErrorDisplay(error: error, onRetry: loadData)`,
    interviewTips: [
      {
        question: 'Why include a Retry button?',
        answer: 'Transient network drops happen often. Allowing users to retry without restarting the screen is essential for mobile resilience.'
      }
    ]
  },

  // =========================================================================
  // 12. EMPTY STATE WIDGET (WIDGETS)
  // =========================================================================
  {
    id: 'widget-empty-state',
    slug: 'empty-state',
    title: 'Clean Empty State Widget with Optional Action',
    category: '🎨 Core UI Widgets Layer',
    badge: 'Reusable UI',
    difficulty: 'Beginner',
    readTime: '3 min read',
    description: 'Clean placeholder widget displayed when an API succeeds but returns 0 records, featuring an icon, message, and call-to-action button.',
    whyThisPattern: 'Never leave the user looking at a blank white screen when an API returns an empty list. An empty state widget provides clear guidance.',
    pubspecDeps: `dependencies:
  flutter:
    sdk: flutter`,
    fileName: 'lib/core/widgets/empty_state.dart',
    code: `import 'package:flutter/material.dart';

/// Clean Empty State Placeholder Widget
class EmptyState extends StatelessWidget {
  final String title;
  final String message;
  final IconData icon;
  final VoidCallback? onAction;
  final String? actionLabel;

  const EmptyState({
    super.key,
    this.title = 'No Records Found',
    this.message = 'The requested query returned zero records.',
    this.icon = Icons.inbox_rounded,
    this.onAction,
    this.actionLabel,
  });

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32.0),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(icon, size: 60, color: Colors.grey.shade400),
            const SizedBox(height: 16),
            Text(
              title,
              style: const TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 8),
            Text(
              message,
              textAlign: TextAlign.center,
              style: TextStyle(
                fontSize: 13,
                color: Colors.grey.shade600,
              ),
            ),
            if (onAction != null && actionLabel != null) ...[
              const SizedBox(height: 20),
              OutlinedButton(
                onPressed: onAction,
                child: Text(actionLabel!),
              ),
            ],
          ],
        ),
      ),
    );
  }
}`,
    usageExample: `if (items.isEmpty) const EmptyState(title: 'No Products Available')`,
    interviewTips: [
      {
        question: 'When should empty state be displayed?',
        answer: 'Only after an API request completes successfully and data.isEmpty is true (not during initial loading).'
      }
    ]
  },

  // =========================================================================
  // 13. CUSTOM BUTTON WITH LOADING (WIDGETS)
  // =========================================================================
  {
    id: 'widget-custom-button',
    slug: 'custom-button',
    title: 'Custom Action Button with Built-in Loading State',
    category: '🎨 Core UI Widgets Layer',
    badge: 'Reusable UI',
    difficulty: 'Beginner',
    readTime: '3 min read',
    description: 'Versatile button component that manages its own loading spinner, disables repeated taps during async operations, and supports leading icons.',
    whyThisPattern: 'Prevents double-submit bugs where users furiously tap "Submit" multiple times before the first HTTP request finishes.',
    pubspecDeps: `dependencies:
  flutter:
    sdk: flutter`,
    fileName: 'lib/core/widgets/custom_button.dart',
    code: `import 'package:flutter/material.dart';

/// Reusable Action Button with Integrated Loading Indicator
class CustomButton extends StatelessWidget {
  final String label;
  final VoidCallback? onPressed;
  final bool isLoading;
  final IconData? icon;
  final bool isOutlined;
  final Color? color;

  const CustomButton({
    super.key,
    required this.label,
    required this.onPressed,
    this.isLoading = false,
    this.icon,
    this.isOutlined = false,
    this.color,
  });

  @override
  Widget build(BuildContext context) {
    if (isOutlined) {
      return OutlinedButton(
        onPressed: isLoading ? null : onPressed,
        style: color != null
            ? OutlinedButton.styleFrom(
                foregroundColor: color,
                side: BorderSide(color: color!),
              )
            : null,
        child: _buildChild(),
      );
    }

    return ElevatedButton(
      onPressed: isLoading ? null : onPressed,
      style: color != null ? ElevatedButton.styleFrom(backgroundColor: color) : null,
      child: _buildChild(),
    );
  }

  Widget _buildChild() {
    if (isLoading) {
      return const SizedBox(
        height: 20,
        width: 20,
        child: CircularProgressIndicator(
          strokeWidth: 2,
          valueColor: AlwaysStoppedAnimation(Colors.white),
        ),
      );
    }

    if (icon != null) {
      return Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 18),
          const SizedBox(width: 8),
          Text(label),
        ],
      );
    }

    return Text(label);
  }
}`,
    usageExample: `CustomButton(
  label: 'Sign In',
  isLoading: isSubmitting,
  onPressed: handleSubmit,
)`,
    interviewTips: [
      {
        question: 'Why disable button when isLoading is true?',
        answer: 'Passing null to onPressed disables the button, preventing duplicate HTTP requests and backend concurrency errors.'
      }
    ]
  },

  // =========================================================================
  // 14. CUSTOM TEXT FIELD (WIDGETS)
  // =========================================================================
  {
    id: 'widget-custom-text-field',
    slug: 'custom-text-field',
    title: 'Custom Form Text Field with Icons & Validation',
    category: '🎨 Core UI Widgets Layer',
    badge: 'Reusable UI',
    difficulty: 'Beginner',
    readTime: '3 min read',
    description: 'Encapsulated TextFormField providing consistent label styling, prefix icons, obscureText toggles, and form validation.',
    whyThisPattern: 'Writing InputDecoration repeatedly across 5 form fields wastes time in an interview. A custom field ensures high UI consistency in seconds.',
    pubspecDeps: `dependencies:
  flutter:
    sdk: flutter`,
    fileName: 'lib/core/widgets/custom_text_field.dart',
    code: `import 'package:flutter/material.dart';

/// Reusable Form Text Field Component
class CustomTextField extends StatelessWidget {
  final TextEditingController controller;
  final String label;
  final String? hint;
  final IconData? prefixIcon;
  final Widget? suffixIcon;
  final bool obscureText;
  final TextInputType keyboardType;
  final String? Function(String?)? validator;
  final int maxLines;

  const CustomTextField({
    super.key,
    required this.controller,
    required this.label,
    this.hint,
    this.prefixIcon,
    this.suffixIcon,
    this.obscureText = false,
    this.keyboardType = TextInputType.text,
    this.validator,
    this.maxLines = 1,
  });

  @override
  Widget build(BuildContext context) {
    return TextFormField(
      controller: controller,
      obscureText: obscureText,
      keyboardType: keyboardType,
      validator: validator,
      maxLines: maxLines,
      decoration: InputDecoration(
        labelText: label,
        hintText: hint,
        border: const OutlineInputBorder(),
        prefixIcon: prefixIcon != null ? Icon(prefixIcon, size: 20) : null,
        suffixIcon: suffixIcon,
      ),
    );
  }
}`,
    usageExample: `CustomTextField(
  controller: emailCtrl,
  label: 'Email Address',
  prefixIcon: Icons.email,
  validator: (v) => v!.isEmpty ? 'Required' : null,
)`,
    interviewTips: [
      {
        question: 'What is the purpose of validator in TextFormField?',
        answer: 'Returns null if the input is valid, or an error string if invalid when Form.validate() is called.'
      }
    ]
  },

  // =========================================================================
  // 15. RESPONSE INSPECTION CARD (WIDGETS)
  // =========================================================================
  {
    id: 'widget-response-card',
    slug: 'response-card',
    title: 'Raw Response Inspector Card with Formatted JSON',
    category: '🎨 Core UI Widgets Layer',
    badge: 'Debugging UI',
    difficulty: 'Beginner',
    readTime: '3 min read',
    description: 'Formatted card component that pretty-prints live API payloads, status codes, and copy-to-clipboard functionality.',
    whyThisPattern: 'During live coding demonstrations, displaying real-time formatted JSON on screen instantly proves to the interviewer that your network calls are succeeding.',
    pubspecDeps: `dependencies:
  flutter:
    sdk: flutter`,
    fileName: 'lib/core/widgets/response_card.dart',
    code: `import 'dart:convert';
import 'package:flutter/material.dart';

/// Card that pretty-prints JSON responses returned by API endpoints
class ResponseCard extends StatelessWidget {
  final String title;
  final dynamic jsonResponse;
  final int? statusCode;

  const ResponseCard({
    super.key,
    required this.title,
    required this.jsonResponse,
    this.statusCode,
  });

  String _prettyJson(dynamic data) {
    if (data == null) return 'null';
    try {
      if (data is Map || data is List) {
        const encoder = JsonEncoder.withIndent('  ');
        return encoder.convert(data);
      }
      return data.toString();
    } catch (_) {
      return data.toString();
    }
  }

  @override
  Widget build(BuildContext context) {
    final formatted = _prettyJson(jsonResponse);

    return Card(
      margin: const EdgeInsets.symmetric(vertical: 8),
      color: const Color(0xFF1E293B),
      child: Padding(
        padding: const EdgeInsets.all(14),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                const Icon(Icons.code_rounded, color: Colors.lightBlueAccent, size: 18),
                const SizedBox(width: 8),
                Text(
                  title,
                  style: const TextStyle(
                    fontSize: 13,
                    fontWeight: FontWeight.bold,
                    color: Colors.white,
                  ),
                ),
                if (statusCode != null) ...[
                  const Spacer(),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                    decoration: BoxDecoration(
                      color: statusCode! >= 200 && statusCode! < 300 ? Colors.green : Colors.red,
                      borderRadius: BorderRadius.circular(4),
                    ),
                    child: Text(
                      'HTTP $statusCode',
                      style: const TextStyle(fontSize: 11, color: Colors.white),
                    ),
                  ),
                ],
              ],
            ),
            const SizedBox(height: 10),
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: const Color(0xFF0F172A),
                borderRadius: BorderRadius.circular(6),
              ),
              child: SingleChildScrollView(
                scrollDirection: Axis.horizontal,
                child: Text(
                  formatted,
                  style: const TextStyle(
                    fontFamily: 'monospace',
                    fontSize: 12,
                    color: Color(0xFF38BDF8),
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}`,
    usageExample: `ResponseCard(
  title: 'User Profile Response',
  statusCode: 200,
  jsonResponse: response.data,
)`,
    interviewTips: [
      {
        question: 'How do you pretty print JSON in Dart?',
        answer: 'Use JsonEncoder.withIndent("  ").convert(mapOrList).'
      }
    ]
  },

  // =========================================================================
  // 16. CLEAN REPOSITORY PATTERN
  // =========================================================================
  {
    id: 'clean-repository-pattern',
    slug: 'repository-pattern',
    title: 'Clean Architecture Repository & Result Pattern',
    category: '🏛️ Architecture & Data Layer',
    badge: 'Design Pattern',
    difficulty: 'Intermediate',
    readTime: '6 min read',
    description: 'Implements abstract repository interfaces, concrete data sources, and the functional Result<T> pattern (Success / Failure) for predictable error handling.',
    whyThisPattern: 'The Repository Pattern mediates between domain logic and data mapping layers. It abstracts away where data comes from (remote API, local SQLite database, or memory cache), allowing you to swap data sources or mock test repositories effortlessly.',
    pubspecDeps: `dependencies:
  flutter:
    sdk: flutter`,
    fileName: 'lib/data/repositories/product_repository.dart',
    code: `import '../../core/network/api_client.dart';
import '../../core/network/api_exceptions.dart';
import '../models/product_model.dart';

/// Lightweight Result type to encapsulate Success or Failure
sealed class Result<T> {
  const Result();
}

class Success<T> extends Result<T> {
  final T data;
  const Success(this.data);
}

class Failure<T> extends Result<T> {
  final String message;
  final ApiException? exception;
  const Failure(this.message, {this.exception});
}

/// Abstract Repository Contract
abstract class ProductRepository {
  Future<Result<List<Product>>> getProducts({int page = 1, int limit = 10});
  Future<Result<Product>> getProductById(int id);
  Future<Result<Product>> createProduct(Product product);
  Future<Result<bool>> deleteProduct(int id);
}

/// Concrete Implementation using ApiClient
class ProductRepositoryImpl implements ProductRepository {
  final ApiClient apiClient;

  ProductRepositoryImpl({ApiClient? client})
      : apiClient = client ?? ApiClient();

  @override
  Future<Result<List<Product>>> getProducts({
    int page = 1,
    int limit = 10,
  }) async {
    try {
      final response = await apiClient.get<List<dynamic>>(
        '/api/products',
        queryParameters: {'page': page, 'limit': limit},
      );

      if (response.success && response.data != null) {
        final products = response.data!
            .map((item) => Product.fromJson(item as Map<String, dynamic>))
            .toList();
        return Success(products);
      } else {
        return Failure(response.message ?? 'Failed to fetch products');
      }
    } on ApiException catch (e) {
      return Failure(e.message, exception: e);
    } catch (e) {
      return Failure('Unexpected error: $e');
    }
  }

  @override
  Future<Result<Product>> getProductById(int id) async {
    try {
      final response = await apiClient.get<Map<String, dynamic>>('/api/products/$id');
      if (response.success && response.data != null) {
        return Success(Product.fromJson(response.data!));
      }
      return Failure(response.message ?? 'Product not found');
    } on ApiException catch (e) {
      return Failure(e.message, exception: e);
    }
  }

  @override
  Future<Result<Product>> createProduct(Product product) async {
    try {
      final response = await apiClient.post<Map<String, dynamic>>(
        '/api/products',
        data: product.toJson(),
      );
      if (response.success && response.data != null) {
        return Success(Product.fromJson(response.data!));
      }
      return Failure(response.message ?? 'Failed to create product');
    } on ApiException catch (e) {
      return Failure(e.message, exception: e);
    }
  }

  @override
  Future<Result<bool>> deleteProduct(int id) async {
    try {
      final response = await apiClient.delete<Map<String, dynamic>>('/api/products/$id');
      return Success(response.success);
    } on ApiException catch (e) {
      return Failure(e.message, exception: e);
    }
  }
}`,
    usageExample: `final result = await repository.getProducts();
switch (result) {
  case Success(data: final products):
    print('Loaded \${products.length} products');
  case Failure(message: final error):
    print('Error: \$error');
}`,
    interviewTips: [
      {
        question: 'Why define an abstract interface for repositories?',
        answer: 'It satisfies the Dependency Inversion Principle (SOLID). ViewModels depend on the contract, making unit testing straightforward with Mockito.'
      }
    ]
  },

  // =========================================================================
  // 17. SAFE JSON SERIALIZATION & MODELS
  // =========================================================================
  {
    id: 'json-models-serialization',
    slug: 'json-models',
    title: 'Safe JSON Serialization & Pure Dart Model',
    category: '🏛️ Architecture & Data Layer',
    badge: 'Code Quality',
    difficulty: 'Beginner',
    readTime: '4 min read',
    description: 'Hand-crafted, type-safe Dart model template with fromJson, toJson, copyWith, null-safety guards, and nested list parsing without requiring build_runner.',
    whyThisPattern: 'In fast-paced coding interviews, you will not have time to set up code generators like json_serializable or freezed. Writing bulletproof manual deserialization with safe num-to-double casting and null fallback prevents the infamous "type int is not a subtype of type double" runtime exception.',
    pubspecDeps: `dependencies:
  flutter:
    sdk: flutter`,
    fileName: 'lib/data/models/product_model.dart',
    code: `/// Robust Product domain model with manual serialization
class Product {
  final int id;
  final String name;
  final double price;
  final String category;
  final String? description;
  final String? imageUrl;
  final int stock;
  final double rating;
  final List<String> tags;

  const Product({
    required this.id,
    required this.name,
    required this.price,
    required this.category,
    this.description,
    this.imageUrl,
    this.stock = 0,
    this.rating = 0.0,
    this.tags = const [],
  });

  /// Factory constructor for parsing backend JSON safely
  factory Product.fromJson(Map<String, dynamic> json) {
    return Product(
      id: (json['id'] as num?)?.toInt() ?? 0,
      name: json['name'] as String? ?? 'Unnamed Product',
      // Safe conversion for num to double (handles both 10 and 10.5)
      price: (json['price'] as num?)?.toDouble() ?? 0.0,
      category: json['category'] as String? ?? 'General',
      description: json['description'] as String?,
      imageUrl: json['image_url'] as String? ?? json['imageUrl'] as String?,
      stock: (json['stock'] as num?)?.toInt() ?? 0,
      rating: (json['rating'] as num?)?.toDouble() ?? 0.0,
      // Safe list parsing
      tags: (json['tags'] as List<dynamic>?)
              ?.map((item) => item.toString())
              .toList() ??
          const [],
    );
  }

  /// Convert model back to JSON map for POST / PUT requests
  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'price': price,
      'category': category,
      if (description != null) 'description': description,
      if (imageUrl != null) 'image_url': imageUrl,
      'stock': stock,
      'rating': rating,
      'tags': tags,
    };
  }

  Product copyWith({
    int? id,
    String? name,
    double? price,
    String? category,
    String? description,
    String? imageUrl,
    int? stock,
    double? rating,
    List<String>? tags,
  }) {
    return Product(
      id: id ?? this.id,
      name: name ?? this.name,
      price: price ?? this.price,
      category: category ?? this.category,
      description: description ?? this.description,
      imageUrl: imageUrl ?? this.imageUrl,
      stock: stock ?? this.stock,
      rating: rating ?? this.rating,
      tags: tags ?? this.tags,
    );
  }

  @override
  String toString() => 'Product(id: $id, name: $name, price: $price)';

  @override
  bool operator ==(Object other) {
    if (identical(this, other)) return true;
    return other is Product && other.id == id;
  }

  @override
  int get hashCode => id.hashCode;
}`,
    usageExample: `final product = Product.fromJson(jsonMap);`,
    interviewTips: [
      {
        question: 'Why cast numbers with (json["price"] as num?)?.toDouble()?',
        answer: 'JSON decodes 20 as int and 20.5 as double. Casting to num handles both integers and floats without throwing a TypeError.'
      }
    ]
  },

  // =========================================================================
  // 18. MVVM WITH CHANGENOTIFIER
  // =========================================================================
  {
    id: 'mvvm-changenotifier-viewmodel',
    slug: 'mvvm-state',
    title: 'MVVM Architecture with ChangeNotifier & ViewState',
    category: '📱 State Management & UX',
    badge: 'Architecture',
    difficulty: 'Intermediate',
    readTime: '6 min read',
    description: 'A clean, boilerplate-free ViewModel utilizing Flutter’s native ChangeNotifier, explicit ViewState lifecycle (initial, loading, success, error), and memory safety.',
    whyThisPattern: 'Interviewers often ask candidates to implement state management without heavy dependencies like Bloc or Riverpod. ChangeNotifier is built directly into the Flutter SDK, perfectly implements the MVVM pattern, and pairs seamlessly with ListenableBuilder.',
    pubspecDeps: `dependencies:
  flutter:
    sdk: flutter`,
    fileName: 'lib/viewmodels/product_viewmodel.dart',
    code: `import 'package:flutter/foundation.dart';
import '../data/models/product_model.dart';
import '../data/repositories/product_repository.dart';

enum ViewState { initial, loading, success, error }

/// Production-ready MVVM ViewModel using Flutter native ChangeNotifier
class ProductViewModel extends ChangeNotifier {
  final ProductRepository repository;

  ProductViewModel({ProductRepository? repo})
      : repository = repo ?? ProductRepositoryImpl();

  ViewState _state = ViewState.initial;
  List<Product> _products = [];
  String? _errorMessage;
  bool _isDisposed = false;

  ViewState get state => _state;
  List<Product> get products => List.unmodifiable(_products);
  String? get errorMessage => _errorMessage;
  bool get isLoading => _state == ViewState.loading;
  bool get hasError => _state == ViewState.error;
  bool get isEmpty => _state == ViewState.success && _products.isEmpty;

  @override
  void notifyListeners() {
    if (!_isDisposed) {
      super.notifyListeners();
    }
  }

  @override
  void dispose() {
    _isDisposed = true;
    super.dispose();
  }

  Future<void> fetchProducts() async {
    _state = ViewState.loading;
    _errorMessage = null;
    notifyListeners();

    final result = await repository.getProducts();

    switch (result) {
      case Success(data: final items):
        _products = items;
        _state = ViewState.success;
      case Failure(message: final error):
        _errorMessage = error;
        _state = ViewState.error;
    }

    notifyListeners();
  }

  Future<void> refresh() async {
    final result = await repository.getProducts();
    if (result is Success<List<Product>>) {
      _products = result.data;
      _state = ViewState.success;
      _errorMessage = null;
      notifyListeners();
    }
  }
}`,
    usageExample: `ListenableBuilder(
  listenable: viewModel,
  builder: (context, _) {
    if (viewModel.isLoading) return const CircularProgressIndicator();
    return ListView.builder(...);
  },
)`,
    interviewTips: [
      {
        question: 'Why use ListenableBuilder over setState()?',
        answer: 'ListenableBuilder restricts rebuilds to its local subtree, avoiding re-rendering parent scaffolds and AppBars.'
      }
    ]
  },

  // =========================================================================
  // 19. INFINITE SCROLL PAGINATION
  // =========================================================================
  {
    id: 'infinite-scroll-pagination',
    slug: 'infinite-scroll',
    title: 'Infinite Scroll Pagination & Pull-to-Refresh',
    category: '📱 State Management & UX',
    badge: 'UI Pattern',
    difficulty: 'Intermediate',
    readTime: '6 min read',
    description: 'Production scroll pagination using ScrollController threshold detection, bottom loading spinners, end-of-list detection, and pull-to-refresh.',
    whyThisPattern: 'A classic technical interview live-coding prompt is: "Implement a paginated list of items that fetches the next page when the user scrolls near the bottom." This pattern handles debounce, prevent-duplicate requests, and edge cases.',
    pubspecDeps: `dependencies:
  flutter:
    sdk: flutter`,
    fileName: 'lib/views/paginated_list_view.dart',
    code: `import 'package:flutter/material.dart';

/// Production-ready paginated list view with pull-to-refresh
class PaginatedListView<T> extends StatefulWidget {
  final Future<List<T>> Function(int page) fetchPage;
  final Widget Function(BuildContext context, T item, int index) itemBuilder;
  final Widget? emptyWidget;

  const PaginatedListView({
    super.key,
    required this.fetchPage,
    required this.itemBuilder,
    this.emptyWidget,
  });

  @override
  State<PaginatedListView<T>> createState() => _PaginatedListViewState<T>();
}

class _PaginatedListViewState<T> extends State<PaginatedListView<T>> {
  final ScrollController _scrollController = ScrollController();
  final List<T> _items = [];

  int _currentPage = 1;
  bool _isLoadingInitial = true;
  bool _isLoadingMore = false;
  bool _hasMore = true;
  String? _errorMessage;

  @override
  void initState() {
    super.initState();
    _fetchInitialData();
    _scrollController.addListener(_onScroll);
  }

  @override
  void dispose() {
    _scrollController.removeListener(_onScroll);
    _scrollController.dispose();
    super.dispose();
  }

  void _onScroll() {
    if (!_scrollController.hasClients) return;
    final maxScroll = _scrollController.position.maxScrollExtent;
    final currentScroll = _scrollController.position.pixels;

    if (currentScroll >= (maxScroll - 200)) {
      if (!_isLoadingMore && _hasMore && !_isLoadingInitial) {
        _fetchNextPage();
      }
    }
  }

  Future<void> _fetchInitialData() async {
    setState(() {
      _isLoadingInitial = true;
      _errorMessage = null;
      _currentPage = 1;
      _hasMore = true;
    });

    try {
      final newItems = await widget.fetchPage(1);
      setState(() {
        _items.clear();
        _items.addAll(newItems);
        _isLoadingInitial = false;
        _hasMore = newItems.isNotEmpty;
      });
    } catch (e) {
      setState(() {
        _isLoadingInitial = false;
        _errorMessage = e.toString();
      });
    }
  }

  Future<void> _fetchNextPage() async {
    setState(() => _isLoadingMore = true);

    try {
      final nextPage = _currentPage + 1;
      final newItems = await widget.fetchPage(nextPage);

      setState(() {
        _currentPage = nextPage;
        _items.addAll(newItems);
        _isLoadingMore = false;
        _hasMore = newItems.isNotEmpty;
      });
    } catch (e) {
      setState(() => _isLoadingMore = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoadingInitial) {
      return const Center(child: CircularProgressIndicator());
    }

    if (_errorMessage != null) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Text(_errorMessage!, style: const TextStyle(color: Colors.red)),
            const SizedBox(height: 12),
            ElevatedButton(
              onPressed: _fetchInitialData,
              child: const Text('Retry'),
            ),
          ],
        ),
      );
    }

    if (_items.isEmpty) {
      return widget.emptyWidget ?? const Center(child: Text('No records found.'));
    }

    return RefreshIndicator(
      onRefresh: _fetchInitialData,
      child: ListView.separated(
        controller: _scrollController,
        itemCount: _items.length + (_hasMore ? 1 : 0),
        separatorBuilder: (_, __) => const Divider(height: 1),
        itemBuilder: (context, index) {
          if (index == _items.length) {
            return const Padding(
              padding: EdgeInsets.symmetric(vertical: 20),
              child: Center(
                child: SizedBox(
                  width: 24,
                  height: 24,
                  child: CircularProgressIndicator(strokeWidth: 2),
                ),
              ),
            );
          }
          return widget.itemBuilder(context, _items[index], index);
        },
      ),
    );
  }
}`,
    usageExample: `PaginatedListView<Product>(
  fetchPage: (page) => repository.getProducts(page: page),
  itemBuilder: (context, p, index) => ListTile(title: Text(p.name)),
)`,
    interviewTips: [
      {
        question: 'How do you avoid multiple simultaneous page requests?',
        answer: 'Assert !_isLoadingMore && _hasMore before initiating the next page request and toggle _isLoadingMore in a finally block.'
      }
    ]
  },

  // =========================================================================
  // 20. FORM VALIDATION & CONTROLLER LIFECYCLE
  // =========================================================================
  {
    id: 'form-validation-controller',
    slug: 'form-validation',
    title: 'Form Validation & TextEditingController Lifecycle',
    category: '📱 State Management & UX',
    badge: 'Forms & UX',
    difficulty: 'Beginner',
    readTime: '5 min read',
    description: 'Best practice login form screen using GlobalKey<FormState>, email/password regex validation, password visibility toggle, keyboard unfocus, and controller disposal.',
    whyThisPattern: 'Interview coding challenges frequently ask candidates to build a login or sign-up form in 15 minutes. This snippet provides clean validation rules, avoids memory leaks by disposing controllers, and demonstrates professional Flutter form handling.',
    pubspecDeps: `dependencies:
  flutter:
    sdk: flutter`,
    fileName: 'lib/views/login_form_screen.dart',
    code: `import 'package:flutter/material.dart';

class LoginFormScreen extends StatefulWidget {
  const LoginFormScreen({super.key});

  @override
  State<LoginFormScreen> createState() => _LoginFormScreenState();
}

class _LoginFormScreenState extends State<LoginFormScreen> {
  final _formKey = GlobalKey<FormState>();
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();

  bool _obscurePassword = true;
  bool _isLoading = false;

  @override
  void dispose() {
    _emailController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  String? _validateEmail(String? value) {
    if (value == null || value.trim().isEmpty) return 'Email is required';
    final emailRegex = RegExp(r'^[\\w-\\.]+@([\\w-]+\\.)+[\\w-]{2,4}\$');
    if (!emailRegex.hasMatch(value.trim())) return 'Please enter a valid email address';
    return null;
  }

  String? _validatePassword(String? value) {
    if (value == null || value.isEmpty) return 'Password is required';
    if (value.length < 6) return 'Password must be at least 6 characters';
    return null;
  }

  Future<void> _submitForm() async {
    FocusScope.of(context).unfocus();

    if (_formKey.currentState?.validate() ?? false) {
      setState(() => _isLoading = true);

      try {
        final email = _emailController.text.trim();
        final password = _passwordController.text;

        await Future.delayed(const Duration(seconds: 1)); // Mock network call

        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text('Logged in successfully as $email')),
          );
        }
      } catch (e) {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text('Login failed: $e'), backgroundColor: Colors.red),
          );
        }
      } finally {
        if (mounted) {
          setState(() => _isLoading = false);
        }
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Login Form')),
      body: Center(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24.0),
          child: Form(
            key: _formKey,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                TextFormField(
                  controller: _emailController,
                  keyboardType: TextInputType.emailAddress,
                  decoration: const InputDecoration(
                    labelText: 'Email Address',
                    prefixIcon: Icon(Icons.email_outlined),
                    border: OutlineInputBorder(),
                  ),
                  validator: _validateEmail,
                ),
                const SizedBox(height: 16),
                TextFormField(
                  controller: _passwordController,
                  obscureText: _obscurePassword,
                  decoration: InputDecoration(
                    labelText: 'Password',
                    prefixIcon: const Icon(Icons.lock_outline),
                    border: const OutlineInputBorder(),
                    suffixIcon: IconButton(
                      icon: Icon(_obscurePassword ? Icons.visibility_off : Icons.visibility),
                      onPressed: () => setState(() => _obscurePassword = !_obscurePassword),
                    ),
                  ),
                  validator: _validatePassword,
                ),
                const SizedBox(height: 24),
                ElevatedButton(
                  onPressed: _isLoading ? null : _submitForm,
                  child: _isLoading ? const CircularProgressIndicator() : const Text('Sign In'),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}`,
    usageExample: `home: const LoginFormScreen()`,
    interviewTips: [
      {
        question: 'Why check if (mounted) before calling setState()?',
        answer: 'If the user navigates away before async request finishes, calling setState on an unmounted element causes a runtime framework exception.'
      }
    ]
  },

  // =========================================================================
  // 21. DEBOUNCED SEARCH
  // =========================================================================
  {
    id: 'debounced-search-filter',
    slug: 'search-debounce',
    title: 'Debounced Search & Live Filter Query',
    category: '📱 State Management & UX',
    badge: 'Optimization',
    difficulty: 'Intermediate',
    readTime: '5 min read',
    description: 'Implements live search with a 350ms debounce timer to prevent firing an API call on every keystroke, complete with cancel and clear actions.',
    whyThisPattern: 'Live search is a very common interview prompt. If a user types "Flutter", without debouncing the app fires 7 concurrent HTTP requests. A debounce timer resets on each keystroke and only triggers the API once the user pauses typing.',
    pubspecDeps: `dependencies:
  flutter:
    sdk: flutter`,
    fileName: 'lib/views/search_screen.dart',
    code: `import 'dart:async';
import 'package:flutter/material.dart';

class SearchScreen extends StatefulWidget {
  const SearchScreen({super.key});

  @override
  State<SearchScreen> createState() => _SearchScreenState();
}

class _SearchScreenState extends State<SearchScreen> {
  final TextEditingController _searchController = TextEditingController();
  Timer? _debounceTimer;

  bool _isSearching = false;
  List<String> _searchResults = [];

  @override
  void dispose() {
    _debounceTimer?.cancel();
    _searchController.dispose();
    super.dispose();
  }

  void _onSearchChanged(String query) {
    if (_debounceTimer?.isActive ?? false) {
      _debounceTimer!.cancel();
    }

    _debounceTimer = Timer(const Duration(milliseconds: 350), () {
      if (query.trim().isNotEmpty) {
        _performSearch(query.trim());
      } else {
        setState(() => _searchResults = []);
      }
    });
  }

  Future<void> _performSearch(String query) async {
    setState(() => _isSearching = true);

    try {
      await Future.delayed(const Duration(milliseconds: 400)); // Mock API delay

      final mockList = [
        'Flutter Development',
        'Flutter Architecture',
        'Dart Null Safety',
        'Dio Interceptors Tutorial',
      ].where((item) => item.toLowerCase().contains(query.toLowerCase())).toList();

      if (mounted) {
        setState(() {
          _searchResults = mockList;
          _isSearching = false;
        });
      }
    } catch (e) {
      if (mounted) setState(() => _isSearching = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Live Search with Debounce')),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          children: [
            TextField(
              controller: _searchController,
              onChanged: _onSearchChanged,
              decoration: InputDecoration(
                hintText: 'Type to search...',
                prefixIcon: const Icon(Icons.search),
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
              ),
            ),
            const SizedBox(height: 16),
            if (_isSearching)
              const Center(child: CircularProgressIndicator())
            else
              Expanded(
                child: ListView.builder(
                  itemCount: _searchResults.length,
                  itemBuilder: (context, index) => ListTile(
                    title: Text(_searchResults[index]),
                  ),
                ),
              ),
          ],
        ),
      ),
    );
  }
}`,
    usageExample: `home: const SearchScreen()`,
    interviewTips: [
      {
        question: 'Why cancel the timer on every keystroke?',
        answer: 'Canceling ensures only the final pause triggers the callback, reducing server queries.'
      }
    ]
  },

  // =========================================================================
  // 22. SENIOR INTERVIEW CHEATSHEET
  // =========================================================================
  {
    id: 'interview-architecture-cheatsheet',
    slug: 'interview-cheatsheet',
    title: 'Senior Flutter Interview Cheatsheet: Concepts & Solutions',
    category: '🎯 Interview Quick Reference',
    badge: 'Interview High Yield',
    difficulty: 'All Levels',
    readTime: '8 min read',
    description: 'High-yield conceptual answers for senior Flutter interview rounds: Widget Tree vs Element Tree, Keys, Isolates, BuildContext, InheritedWidgets, and const performance.',
    whyThisPattern: 'Interviewers often evaluate your conceptual depth before or after coding. Having clear, concise, senior-grade explanations ready allows you to answer tricky architectural questions confidently.',
    pubspecDeps: `dependencies:
  flutter:
    sdk: flutter`,
    fileName: 'lib/core/interview/interview_reference.md',
    code: `// SUMMARY OF TOP FLUTTER ARCHITECTURAL QUESTIONS & ANSWERS:

1. WIDGET TREE vs ELEMENT TREE vs RENDEROBJECT:
   - Widget: Lightweight, immutable blueprint/configuration of the UI. Recreated frequently.
   - Element: The mutable instantiation connecting Widget to RenderObject. Controls the lifecycle and manages State.
   - RenderObject: The actual low-level object handling layout calculation, sizing, and painting on screen.

2. STATEFULWIDGET LIFECYCLE (In Execution Order):
   1. createState() -> Called once to instantiate State object.
   2. initState() -> Called once when element enters tree. Ideal for controllers & initial listeners.
   3. didChangeDependencies() -> Called immediately after initState and whenever InheritedWidgets (Theme, MediaQuery) change.
   4. build() -> Invoked to return widget tree whenever setState() is called.
   5. didUpdateWidget() -> Called when the parent widget rebuilds and passes new configuration properties.
   6. deactivate() -> State removed temporarily (e.g. Navigation animation).
   7. dispose() -> Permanently destroyed. Clean up controllers, streams, timers, listeners!

3. KEYS IN FLUTTER:
   - ValueKey: Preserves widget identity based on a primitive value (e.g. ID string/int) in re-ordered lists.
   - ObjectKey: Based on object identity.
   - UniqueKey: Guarantees a unique key, forcing recreation.
   - GlobalKey: Accesses state or BuildContext across the entire application; allows reparenting without losing state. Use sparingly due to performance cost.

4. DART CONCURRENCY & ISOLATES:
   - Dart is single-threaded with an Event Loop (Microtask queue + Event queue).
   - Heavy CPU computations (like parsing 50,000 JSON records or image processing) freeze the main UI isolate causing dropped frames.
   - Solution: Use compute(function, data) or Isolate.spawn() to offload CPU-intensive operations to a background isolate.

5. FUTUREBUILDER vs STREAMBUILDER:
   - FutureBuilder: For one-off asynchronous operations that return a single value (e.g., standard HTTP GET).
   - StreamBuilder: For continuous, multiple events over time (e.g., WebSockets, Firebase real-time listeners, GPS location updates).

6. WHY CONST CONSTRUCTORS IMPROVE PERFORMANCE:
   - const widgets are canonicalized in memory at compile-time.
   - When a parent widget rebuilds, Flutter compares widget instances; if a child is const, Flutter skips rebuilding that entire subtree.`,
    usageExample: `// Example of compute() for parsing large JSON lists:
Future<List<Product>> parseProductsInIsolate(String jsonString) async {
  return await compute(_decodeAndParse, jsonString);
}`,
    interviewTips: [
      {
        question: 'When should you NOT use const constructors?',
        answer: 'When a widget requires dynamic parameters evaluated at runtime, or when creating mutable objects that must update their internal state.'
      }
    ]
  }
];

module.exports = tutorials;
