import 'package:dio/dio.dart';
import 'package:flutter/foundation.dart';
import '../../../core/constants/api_endpoints.dart';
import '../../../core/network/api_client.dart';

// LEARNING: Header & Security Controller
// Demonstrates explicitly attaching custom HTTP Headers to individual requests in Dio using `Options(headers: {...})`.

class HeaderController extends ChangeNotifier {
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

  // ---------------------------------------------------------------------------
  // 1. GET /api/secure/data
  // Description: Custom API Key Header verification
  // URL: http://10.0.2.2:3000/api/secure/data
  // Header Required: `X-API-Key: practice-api-key-2024`
  // ---------------------------------------------------------------------------
  Future<void> fetchSecureDataWithApiKey(String apiKey) async {
    _setLoading(true);
    _setError(null);

    try {
      final response = await _apiClient.get<dynamic>(
        ApiEndpoints.secureData,
        options: Options(headers: {'X-API-Key': apiKey}),
      );

      _lastRawResponse = {
        'sentHeader': {'X-API-Key': apiKey},
        'response': response.data ?? response.message,
      };

      if (!response.success) {
        _setError(response.error?.message ?? 'API key rejected.');
      }
    } catch (e) {
      _setError(e.toString());
    } finally {
      _setLoading(false);
    }
  }

  // ---------------------------------------------------------------------------
  // 2. GET /api/headers/echo
  // Description: Server echoes back all headers received from the Flutter app
  // URL: http://10.0.2.2:3000/api/headers/echo
  // ---------------------------------------------------------------------------
  Future<void> fetchHeadersEcho() async {
    _setLoading(true);
    _setError(null);

    try {
      final response = await _apiClient.get<dynamic>(
        ApiEndpoints.headersEcho,
        options: Options(
          headers: {
            'X-Flutter-Version': '3.47.4',
            'X-Client-Platform': 'Android',
            'X-Request-Timestamp': DateTime.now().toIso8601String(),
          },
        ),
      );

      _lastRawResponse = response.data;
    } catch (e) {
      _setError(e.toString());
    } finally {
      _setLoading(false);
    }
  }

  // ---------------------------------------------------------------------------
  // 3. POST /api/headers/custom
  // Description: Send custom metadata headers with request body
  // URL: http://10.0.2.2:3000/api/headers/custom
  // ---------------------------------------------------------------------------
  Future<void> sendCustomHeaders({required String customHeaderValue, required String appVersion}) async {
    _setLoading(true);
    _setError(null);

    try {
      final response = await _apiClient.post<dynamic>(
        ApiEndpoints.headersCustom,
        data: {'note': 'Testing custom headers'},
        options: Options(
          headers: {
            'X-Custom-Header': customHeaderValue,
            'X-App-Version': appVersion,
          },
        ),
      );

      _lastRawResponse = response.data;
    } catch (e) {
      _setError(e.toString());
    } finally {
      _setLoading(false);
    }
  }

  // ---------------------------------------------------------------------------
  // 4. GET /api/headers/accept
  // Description: Content negotiation test (`Accept: application/json`)
  // URL: http://10.0.2.2:3000/api/headers/accept
  // ---------------------------------------------------------------------------
  Future<void> fetchAcceptHeader({required String acceptHeader}) async {
    _setLoading(true);
    _setError(null);

    try {
      final response = await _apiClient.get<dynamic>(
        ApiEndpoints.headersAccept,
        options: Options(headers: {'Accept': acceptHeader}),
      );

      _lastRawResponse = response.data ?? response.message;
    } catch (e) {
      _setError(e.toString());
    } finally {
      _setLoading(false);
    }
  }
}
