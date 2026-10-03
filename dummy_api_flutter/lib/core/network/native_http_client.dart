import 'dart:async';
import 'dart:convert';
import 'dart:io';
import 'package:http/http.dart' as http;
import 'api_exceptions.dart';

/// Lightweight HTTP Client built using standard [package:http].
/// Perfect for coding interviews where third-party packages like Dio are restricted.
class NativeHttpClient {
  static final NativeHttpClient _instance = NativeHttpClient._internal();
  factory NativeHttpClient() => _instance;

  final http.Client _client = http.Client();
  static const String baseUrl = 'https://dummy-api.onrender.com';
  static const Duration timeoutDuration = Duration(seconds: 15);

  NativeHttpClient._internal();

  /// Build URI with optional query parameters
  Uri _buildUri(String path, [Map<String, dynamic>? queryParameters]) {
    final cleanPath = path.startsWith('/') ? path : '/$path';
    final fullUrl = '$baseUrl$cleanPath';
    final uri = Uri.parse(fullUrl);

    if (queryParameters == null || queryParameters.isEmpty) {
      return uri;
    }

    final stringParams = queryParameters.map(
      (key, value) => MapEntry(key, value.toString()),
    );
    return uri.replace(queryParameters: stringParams);
  }

  /// Standard headers including Content-Type and Bearer token
  Map<String, String> _buildHeaders({String? token, Map<String, String>? extraHeaders}) {
    return {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      if (token != null && token.isNotEmpty) 'Authorization': 'Bearer $token',
      if (extraHeaders != null) ...extraHeaders,
    };
  }

  /// Generic GET Request
  Future<dynamic> get(
    String path, {
    Map<String, dynamic>? queryParameters,
    String? token,
  }) async {
    try {
      final uri = _buildUri(path, queryParameters);
      final response = await _client
          .get(uri, headers: _buildHeaders(token: token))
          .timeout(timeoutDuration);
      return _processResponse(response);
    } on SocketException {
      throw NetworkConnectionException();
    } on TimeoutException {
      throw RequestTimeoutException();
    }
  }

  /// Generic POST Request
  Future<dynamic> post(
    String path, {
    dynamic body,
    String? token,
  }) async {
    try {
      final uri = _buildUri(path);
      final response = await _client
          .post(
            uri,
            headers: _buildHeaders(token: token),
            body: body != null ? jsonEncode(body) : null,
          )
          .timeout(timeoutDuration);
      return _processResponse(response);
    } on SocketException {
      throw NetworkConnectionException();
    } on TimeoutException {
      throw RequestTimeoutException();
    }
  }

  /// Generic PUT Request
  Future<dynamic> put(
    String path, {
    dynamic body,
    String? token,
  }) async {
    try {
      final uri = _buildUri(path);
      final response = await _client
          .put(
            uri,
            headers: _buildHeaders(token: token),
            body: body != null ? jsonEncode(body) : null,
          )
          .timeout(timeoutDuration);
      return _processResponse(response);
    } on SocketException {
      throw NetworkConnectionException();
    } on TimeoutException {
      throw RequestTimeoutException();
    }
  }

  /// Generic DELETE Request
  Future<dynamic> delete(
    String path, {
    String? token,
  }) async {
    try {
      final uri = _buildUri(path);
      final response = await _client
          .delete(uri, headers: _buildHeaders(token: token))
          .timeout(timeoutDuration);
      return _processResponse(response);
    } on SocketException {
      throw NetworkConnectionException();
    } on TimeoutException {
      throw RequestTimeoutException();
    }
  }

  /// Unified response processor and status code mapper
  dynamic _processResponse(http.Response response) {
    dynamic decodedBody;
    try {
      decodedBody = jsonDecode(response.body);
    } catch (_) {
      decodedBody = response.body;
    }

    final statusCode = response.statusCode;
    if (statusCode >= 200 && statusCode < 300) {
      return decodedBody;
    }

    final message = (decodedBody is Map && decodedBody['error']?['message'] != null)
        ? decodedBody['error']['message']
        : (decodedBody is Map && decodedBody['message'] != null)
            ? decodedBody['message']
            : 'HTTP $statusCode Error';

    switch (statusCode) {
      case 400:
        throw BadRequestException(message: message, statusCode: 400);
      case 401:
        throw UnauthorizedException(message: message, statusCode: 401);
      case 403:
        throw ForbiddenException(message: message, statusCode: 403);
      case 404:
        throw NotFoundException(message: message, statusCode: 404);
      case 429:
        throw RateLimitException(message: message, statusCode: 429);
      case 500:
      default:
        throw InternalServerErrorException(message: message, statusCode: statusCode);
    }
  }

  /// Close client when app shuts down
  void dispose() {
    _client.close();
  }
}
