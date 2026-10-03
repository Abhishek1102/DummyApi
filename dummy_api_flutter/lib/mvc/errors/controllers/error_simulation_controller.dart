import 'package:flutter/foundation.dart';
import '../../../core/network/api_client.dart';
import '../../../core/network/api_exceptions.dart';

// LEARNING: Error Simulation Controller
// Demonstrates how Flutter apps catch and handle specific HTTP error codes (400, 401, 403, 404, 500, Timeout).

class ErrorSimulationController extends ChangeNotifier {
  final ApiClient _apiClient = ApiClient();

  bool _isLoading = false;
  ApiException? _caughtException;
  dynamic _lastRawResponse;

  bool get isLoading => _isLoading;
  ApiException? get caughtException => _caughtException;
  dynamic get lastRawResponse => _lastRawResponse;

  void _setLoading(bool loading) {
    _isLoading = loading;
    notifyListeners();
  }

  Future<void> triggerErrorEndpoint(String endpointUrl) async {
    _setLoading(true);
    _caughtException = null;
    _lastRawResponse = null;

    try {
      final response = await _apiClient.get<dynamic>(endpointUrl);
      _lastRawResponse = response.data ?? response.message;
    } on ApiException catch (e) {
      // LEARNING: Catch custom ApiException thrown by Dio Interceptor / ApiExceptionHandler
      _caughtException = e;
      _lastRawResponse = {
        'errorCaught': true,
        'type': e.runtimeType.toString(),
        'statusCode': e.statusCode,
        'message': e.message,
        'errorDetails': e.errorDetails?.message,
      };
    } catch (e) {
      _lastRawResponse = {'unexpectedError': e.toString()};
    } finally {
      _setLoading(false);
    }
  }
}
