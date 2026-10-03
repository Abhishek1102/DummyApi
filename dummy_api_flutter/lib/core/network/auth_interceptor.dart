import 'package:dio/dio.dart';
import '../constants/api_endpoints.dart';
import '../services/storage_service.dart';

// LEARNING: Dio Interceptors
// Interceptors sit between your app and the network. They allow you to:
// 1. Inspect or modify outgoing requests (e.g., adding `Authorization: Bearer <token>`).
// 2. Inspect incoming responses before they reach controllers.
// 3. Intercept HTTP errors (e.g., auto-refreshing expired JWT access tokens on 401 Unauthorized).

class AuthInterceptor extends Interceptor {
  final Dio dio;

  AuthInterceptor({required this.dio});

  @override
  void onRequest(RequestOptions options, RequestInterceptorHandler handler) async {
    // LEARNING: Step 1 - Attach Access Token automatically to every outgoing request if available
    final token = await StorageService.getAccessToken();

    // Skip adding auth header for login or register endpoints
    final isAuthEndpoint = options.path.contains('/auth/login') || options.path.contains('/auth/register');

    if (token != null && token.isNotEmpty && !isAuthEndpoint) {
      options.headers['Authorization'] = 'Bearer $token';
      print('LEARNING DEBUG: Attached Bearer token to request -> ${options.path}');
    }

    return handler.next(options);
  }

  @override
  void onError(DioException err, ErrorInterceptorHandler handler) async {
    // LEARNING: Step 2 - Handle Token Expiration (HTTP 401 Unauthorized)
    // If the server returns 401 Unauthorized, we attempt to transparently refresh the access token!
    if (err.response?.statusCode == 401 && !err.requestOptions.path.contains('/auth/refresh')) {
      print('LEARNING DEBUG: Received 401 Unauthorized. Attempting token refresh...');
      final refreshToken = await StorageService.getRefreshToken();

      if (refreshToken != null && refreshToken.isNotEmpty) {
        try {
          // Call refresh endpoint with existing refresh token in body
          final refreshDio = Dio(); // Clean dio instance without interceptors to avoid infinite loop
          final response = await refreshDio.post(
            ApiEndpoints.refresh,
            data: {'refreshToken': refreshToken},
          );

          if (response.statusCode == 200 && response.data['success'] == true) {
            final newAccessToken = response.data['data']['accessToken'];
            final newRefreshToken = response.data['data']['refreshToken'];

            // Save new tokens to storage
            await StorageService.saveTokens(accessToken: newAccessToken, refreshToken: newRefreshToken);
            print('LEARNING DEBUG: Token refreshed successfully! Retrying failed request...');

            // Retry the original request with updated access token
            final options = err.requestOptions;
            options.headers['Authorization'] = 'Bearer $newAccessToken';

            final retriedResponse = await dio.fetch(options);
            return handler.resolve(retriedResponse);
          }
        } catch (refreshError) {
          print('LEARNING DEBUG: Token refresh failed -> $refreshError. Clearing auth state.');
          await StorageService.clearAuthData();
        }
      }
    }

    return handler.next(err);
  }
}
