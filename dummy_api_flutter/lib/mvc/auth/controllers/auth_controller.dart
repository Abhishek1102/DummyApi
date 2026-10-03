import 'package:flutter/foundation.dart';
import '../../../core/constants/api_endpoints.dart';
import '../../../core/network/api_client.dart';
import '../../../core/services/storage_service.dart';
import '../models/auth_models.dart';

// LEARNING: Authentication Controller
// Demonstrates JWT Authentication workflows in Flutter:
// 1. Register user -> `POST /api/auth/register`
// 2. Login user -> `POST /api/auth/login` (receives access & refresh tokens)
// 3. Refresh token -> `POST /api/auth/refresh`
// 4. Secured Profile access -> `GET /api/auth/profile` (Authorization: Bearer <token>)
// 5. Update Profile -> `PUT /api/auth/profile`
// 6. Change Password -> `POST /api/auth/change-password`
// 7. Logout -> `POST /api/auth/logout`

class AuthController extends ChangeNotifier {
  final ApiClient _apiClient = ApiClient();

  bool _isLoading = false;
  String? _errorMessage;
  AuthUser? _currentUser;
  dynamic _lastRawResponse;

  bool get isLoading => _isLoading;
  String? get errorMessage => _errorMessage;
  AuthUser? get currentUser => _currentUser;
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
  // 1. POST /api/auth/register
  // Description: Create new user account
  // URL: http://10.0.2.2:3000/api/auth/register
  // Body: { "name": "...", "email": "...", "password": "..." }
  // ---------------------------------------------------------------------------
  Future<bool> register({required String name, required String email, required String password}) async {
    _setLoading(true);
    _setError(null);

    try {
      final response = await _apiClient.post<dynamic>(
        ApiEndpoints.register,
        data: {'name': name, 'email': email, 'password': password},
      );

      _lastRawResponse = {'endpoint': 'POST /auth/register', 'response': response.data};

      if (response.success && response.data != null) {
        final data = response.data as Map<String, dynamic>;
        final user = AuthUser.fromJson(data['user'] as Map<String, dynamic>);
        final tokens = AuthTokens.fromJson(data['tokens'] as Map<String, dynamic>);

        await StorageService.saveTokens(accessToken: tokens.accessToken, refreshToken: tokens.refreshToken);
        _currentUser = user;
        notifyListeners();
        return true;
      } else {
        _setError(response.error?.message ?? 'Registration failed.');
        return false;
      }
    } catch (e) {
      _setError(e.toString());
      return false;
    } finally {
      _setLoading(false);
    }
  }

  // ---------------------------------------------------------------------------
  // 2. POST /api/auth/login
  // Description: User authentication yielding JWT bearer tokens
  // URL: http://10.0.2.2:3000/api/auth/login
  // Body: { "email": "test@example.com", "password": "password123" }
  // ---------------------------------------------------------------------------
  Future<bool> login({required String email, required String password}) async {
    _setLoading(true);
    _setError(null);

    try {
      final response = await _apiClient.post<dynamic>(
        ApiEndpoints.login,
        data: {'email': email, 'password': password},
      );

      _lastRawResponse = {'endpoint': 'POST /auth/login', 'response': response.data};

      if (response.success && response.data != null) {
        final data = response.data as Map<String, dynamic>;
        final user = AuthUser.fromJson(data['user'] as Map<String, dynamic>);
        final tokens = AuthTokens.fromJson(data['tokens'] as Map<String, dynamic>);

        await StorageService.saveTokens(accessToken: tokens.accessToken, refreshToken: tokens.refreshToken);
        _currentUser = user;
        notifyListeners();
        return true;
      } else {
        _setError(response.error?.message ?? 'Invalid credentials.');
        return false;
      }
    } catch (e) {
      _setError(e.toString());
      return false;
    } finally {
      _setLoading(false);
    }
  }

  // ---------------------------------------------------------------------------
  // 3. GET /api/auth/profile
  // Description: Secured profile request carrying Bearer Token header
  // URL: http://10.0.2.2:3000/api/auth/profile
  // Header: Authorization: Bearer <accessToken>
  // ---------------------------------------------------------------------------
  Future<void> fetchProfile() async {
    _setLoading(true);
    _setError(null);

    try {
      final response = await _apiClient.get<AuthUser>(
        ApiEndpoints.profile,
        createData: (json) => AuthUser.fromJson(json as Map<String, dynamic>),
      );

      _lastRawResponse = {'endpoint': 'GET /auth/profile', 'response': response.data?.toJson()};

      if (response.success && response.data != null) {
        _currentUser = response.data;
      } else {
        _setError(response.error?.message ?? 'Failed to load profile. Token may be invalid.');
      }
    } catch (e) {
      _setError(e.toString());
    } finally {
      _setLoading(false);
    }
  }

  // ---------------------------------------------------------------------------
  // 4. PUT /api/auth/profile
  // Description: Update logged-in user profile details
  // URL: http://10.0.2.2:3000/api/auth/profile
  // Header: Authorization: Bearer <accessToken>
  // ---------------------------------------------------------------------------
  Future<bool> updateProfile({required String name, required String email}) async {
    _setLoading(true);
    _setError(null);

    try {
      final response = await _apiClient.put<AuthUser>(
        ApiEndpoints.profile,
        data: {'name': name, 'email': email},
        createData: (json) => AuthUser.fromJson(json as Map<String, dynamic>),
      );

      _lastRawResponse = {'endpoint': 'PUT /auth/profile', 'response': response.data?.toJson()};

      if (response.success && response.data != null) {
        _currentUser = response.data;
        notifyListeners();
        return true;
      } else {
        _setError(response.error?.message ?? 'Profile update failed.');
        return false;
      }
    } catch (e) {
      _setError(e.toString());
      return false;
    } finally {
      _setLoading(false);
    }
  }

  // ---------------------------------------------------------------------------
  // 5. POST /api/auth/change-password
  // Description: Change password secured endpoint
  // URL: http://10.0.2.2:3000/api/auth/change-password
  // ---------------------------------------------------------------------------
  Future<bool> changePassword({required String currentPassword, required String newPassword}) async {
    _setLoading(true);
    _setError(null);

    try {
      final response = await _apiClient.post<dynamic>(
        ApiEndpoints.changePassword,
        data: {'currentPassword': currentPassword, 'newPassword': newPassword},
      );

      _lastRawResponse = {'endpoint': 'POST /auth/change-password', 'response': response.message};

      if (response.success) {
        return true;
      } else {
        _setError(response.error?.message ?? 'Failed to change password.');
        return false;
      }
    } catch (e) {
      _setError(e.toString());
      return false;
    } finally {
      _setLoading(false);
    }
  }

  // ---------------------------------------------------------------------------
  // 6. POST /api/auth/logout
  // Description: Invalidate refresh token on server and clear local token storage
  // ---------------------------------------------------------------------------
  Future<void> logout() async {
    _setLoading(true);
    try {
      final refreshToken = await StorageService.getRefreshToken();
      if (refreshToken != null) {
        await _apiClient.post<dynamic>(
          ApiEndpoints.logout,
          data: {'refreshToken': refreshToken},
        );
      }
    } catch (_) {
      // Ignore network failures on logout
    } finally {
      await StorageService.clearAuthData();
      _currentUser = null;
      _lastRawResponse = null;
      _setLoading(false);
    }
  }
}
