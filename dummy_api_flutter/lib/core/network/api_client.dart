import 'package:dio/dio.dart';
import '../network/api_exceptions.dart';
import '../network/api_response.dart';
import '../network/auth_interceptor.dart';

// LEARNING: API Client Architecture
// The `ApiClient` serves as the centralized HTTP engine for the entire app.
// Features included:
// 1. Configurable Base URL & Timeout settings
// 2. Dio Interceptors for Auth tokens and Live Logging
// 3. Methods for GET, POST, PUT, DELETE, and Multipart Form Uploads
// 4. Conversion of raw HTTP responses into strongly-typed `ApiResponse<T>`
// 5. Global log history buffer so users can inspect real API payloads directly in UI!

class ApiLogEntry {
  final String method;
  final String url;
  final int? statusCode;
  final dynamic requestHeaders;
  final dynamic requestBody;
  final dynamic responseBody;
  final DateTime timestamp;
  final bool isError;

  ApiLogEntry({
    required this.method,
    required this.url,
    this.statusCode,
    this.requestHeaders,
    this.requestBody,
    this.responseBody,
    required this.timestamp,
    this.isError = false,
  });
}

class ApiClient {
  static final ApiClient _instance = ApiClient._internal();
  factory ApiClient() => _instance;

  late final Dio _dio;

  // LEARNING: In-memory network logs list for educational UI inspection
  final List<ApiLogEntry> logs = [];

  ApiClient._internal() {
    _dio = Dio(
      BaseOptions(
        connectTimeout: const Duration(seconds: 10),
        receiveTimeout: const Duration(seconds: 10),
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      ),
    );

    // Attach custom interceptors
    _dio.interceptors.add(AuthInterceptor(dio: _dio));

    // LEARNING: Logging Interceptor to capture live request & response traffic
    _dio.interceptors.add(
      InterceptorsWrapper(
        onRequest: (options, handler) {
          logs.insert(
            0,
            ApiLogEntry(
              method: options.method,
              url: options.uri.toString(),
              requestHeaders: options.headers,
              requestBody: options.data,
              timestamp: DateTime.now(),
            ),
          );
          return handler.next(options);
        },
        onResponse: (response, handler) {
          if (logs.isNotEmpty) {
            final entry = logs.firstWhere(
              (l) => l.url == response.requestOptions.uri.toString(),
              orElse: () => logs.first,
            );
            logs.remove(entry);
            logs.insert(
              0,
              ApiLogEntry(
                method: entry.method,
                url: entry.url,
                statusCode: response.statusCode,
                requestHeaders: entry.requestHeaders,
                requestBody: entry.requestBody,
                responseBody: response.data,
                timestamp: DateTime.now(),
              ),
            );
          }
          return handler.next(response);
        },
        onError: (DioException e, handler) {
          logs.insert(
            0,
            ApiLogEntry(
              method: e.requestOptions.method,
              url: e.requestOptions.uri.toString(),
              statusCode: e.response?.statusCode,
              requestHeaders: e.requestOptions.headers,
              requestBody: e.requestOptions.data,
              responseBody: e.response?.data ?? e.message,
              timestamp: DateTime.now(),
              isError: true,
            ),
          );
          return handler.next(e);
        },
      ),
    );
  }

  // Clear logs helper
  void clearLogs() {
    logs.clear();
  }

  // ---------------------------------------------------------------------------
  // LEARNING: HTTP GET Method Wrapper
  // ---------------------------------------------------------------------------
  Future<ApiResponse<T>> get<T>(
    String endpoint, {
    Map<String, dynamic>? queryParameters,
    Options? options,
    T Function(dynamic json)? createData,
  }) async {
    try {
      final response = await _dio.get(
        endpoint,
        queryParameters: queryParameters,
        options: options,
      );
      return ApiResponse.fromJson(
        response.data as Map<String, dynamic>,
        response.statusCode ?? 200,
        createData,
      );
    } on DioException catch (e) {
      throw ApiExceptionHandler.fromDioException(e);
    }
  }

  // ---------------------------------------------------------------------------
  // LEARNING: HTTP POST Method Wrapper
  // ---------------------------------------------------------------------------
  Future<ApiResponse<T>> post<T>(
    String endpoint, {
    dynamic data,
    Map<String, dynamic>? queryParameters,
    Options? options,
    T Function(dynamic json)? createData,
  }) async {
    try {
      final response = await _dio.post(
        endpoint,
        data: data,
        queryParameters: queryParameters,
        options: options,
      );
      return ApiResponse.fromJson(
        response.data as Map<String, dynamic>,
        response.statusCode ?? 200,
        createData,
      );
    } on DioException catch (e) {
      throw ApiExceptionHandler.fromDioException(e);
    }
  }

  // ---------------------------------------------------------------------------
  // LEARNING: HTTP PUT Method Wrapper
  // ---------------------------------------------------------------------------
  Future<ApiResponse<T>> put<T>(
    String endpoint, {
    dynamic data,
    Options? options,
    T Function(dynamic json)? createData,
  }) async {
    try {
      final response = await _dio.put(
        endpoint,
        data: data,
        options: options,
      );
      return ApiResponse.fromJson(
        response.data as Map<String, dynamic>,
        response.statusCode ?? 200,
        createData,
      );
    } on DioException catch (e) {
      throw ApiExceptionHandler.fromDioException(e);
    }
  }

  // ---------------------------------------------------------------------------
  // LEARNING: HTTP DELETE Method Wrapper
  // ---------------------------------------------------------------------------
  Future<ApiResponse<T>> delete<T>(
    String endpoint, {
    dynamic data,
    Options? options,
    T Function(dynamic json)? createData,
  }) async {
    try {
      final response = await _dio.delete(
        endpoint,
        data: data,
        options: options,
      );
      return ApiResponse.fromJson(
        response.data as Map<String, dynamic>,
        response.statusCode ?? 200,
        createData,
      );
    } on DioException catch (e) {
      throw ApiExceptionHandler.fromDioException(e);
    }
  }

  // ---------------------------------------------------------------------------
  // LEARNING: Multipart Form Upload Wrapper (For File & Image Uploads)
  // ---------------------------------------------------------------------------
  Future<ApiResponse<T>> uploadMultipart<T>(
    String endpoint, {
    required FormData formData,
    void Function(int sent, int total)? onSendProgress,
    Options? options,
    T Function(dynamic json)? createData,
  }) async {
    try {
      final response = await _dio.post(
        endpoint,
        data: formData,
        onSendProgress: onSendProgress,
        options: options,
      );
      return ApiResponse.fromJson(
        response.data as Map<String, dynamic>,
        response.statusCode ?? 200,
        createData,
      );
    } on DioException catch (e) {
      throw ApiExceptionHandler.fromDioException(e);
    }
  }
}
