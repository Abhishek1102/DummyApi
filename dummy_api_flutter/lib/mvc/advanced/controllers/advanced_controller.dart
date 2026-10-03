import 'package:dio/dio.dart';
import 'package:flutter/foundation.dart';
import '../../../core/constants/api_endpoints.dart';
import '../../../core/network/api_client.dart';

// LEARNING: Advanced API Scenarios Controller
// Covers edge cases: URL-encoded forms, delayed requests, rate limits, custom status codes, large payloads, and validation details.

class AdvancedController extends ChangeNotifier {
  final ApiClient _apiClient = ApiClient();

  bool _isLoading = false;
  String? _errorMessage;
  dynamic _lastRawResponse;

  bool get isLoading => _isLoading;
  String? get errorMessage => _errorMessage;
  dynamic get lastRawResponse => _lastRawResponse;

  void _setLoading(bool loading) {
    _isLoading = loading;
    notifyListeners();
  }

  void _setError(String? error) {
    _errorMessage = error;
    notifyListeners();
  }

  // 1. GET /api/advanced/delayed?delay=3
  Future<void> fetchDelayedResponse(int delaySeconds) async {
    _setLoading(true);
    _setError(null);
    try {
      final response = await _apiClient.get<dynamic>(
        ApiEndpoints.advancedDelayed,
        queryParameters: {'delay': delaySeconds},
      );
      _lastRawResponse = response.data ?? response.message;
    } catch (e) {
      _setError(e.toString());
    } finally {
      _setLoading(false);
    }
  }

  // 2. GET /api/advanced/random-error
  Future<void> fetchRandomError() async {
    _setLoading(true);
    _setError(null);
    try {
      final response = await _apiClient.get<dynamic>(ApiEndpoints.advancedRandomError);
      _lastRawResponse = response.data ?? response.message;
    } catch (e) {
      _setError(e.toString());
    } finally {
      _setLoading(false);
    }
  }

  // 3. POST /api/advanced/form-data (application/x-www-form-urlencoded)
  Future<void> sendFormUrlEncoded(String key1, String val1) async {
    _setLoading(true);
    _setError(null);
    try {
      final response = await _apiClient.post<dynamic>(
        ApiEndpoints.advancedFormData,
        data: {'key1': key1, 'val1': val1},
        options: Options(contentType: Headers.formUrlEncodedContentType),
      );
      _lastRawResponse = response.data;
    } catch (e) {
      _setError(e.toString());
    } finally {
      _setLoading(false);
    }
  }

  // 4. GET /api/advanced/large-response
  Future<void> fetchLargeResponse() async {
    _setLoading(true);
    _setError(null);
    try {
      final response = await _apiClient.get<dynamic>(ApiEndpoints.advancedLargeResponse);
      _lastRawResponse = {'count': (response.data as List?)?.length, 'sample': (response.data as List?)?.take(3).toList()};
    } catch (e) {
      _setError(e.toString());
    } finally {
      _setLoading(false);
    }
  }

  // 5. GET /api/advanced/status/:code
  Future<void> fetchStatus(int statusCode) async {
    _setLoading(true);
    _setError(null);
    try {
      final response = await _apiClient.get<dynamic>(ApiEndpoints.advancedStatus(statusCode));
      _lastRawResponse = {'requestedCode': statusCode, 'response': response.data ?? response.message};
    } catch (e) {
      _setError(e.toString());
    } finally {
      _setLoading(false);
    }
  }

  // 6. GET /api/advanced/rate-limited
  Future<void> fetchRateLimited() async {
    _setLoading(true);
    _setError(null);
    try {
      final response = await _apiClient.get<dynamic>(ApiEndpoints.advancedRateLimited);
      _lastRawResponse = response.data ?? response.message;
    } catch (e) {
      _setError(e.toString());
    } finally {
      _setLoading(false);
    }
  }

  // 7. POST /api/advanced/validate
  Future<void> submitValidationTest({required String email, required int age}) async {
    _setLoading(true);
    _setError(null);
    try {
      final response = await _apiClient.post<dynamic>(
        ApiEndpoints.advancedValidate,
        data: {'email': email, 'age': age},
      );
      _lastRawResponse = response.data;
    } catch (e) {
      _setError(e.toString());
    } finally {
      _setLoading(false);
    }
  }
}
