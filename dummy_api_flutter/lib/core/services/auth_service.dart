import 'package:flutter/foundation.dart';
import '../services/storage_service.dart';

// LEARNING: Global Auth State Service
// Inherits from `ChangeNotifier` to notify listeners (UI screens, navigation guards)
// whenever the user logs in or logs out.

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

  // Check if token exists on app launch
  Future<void> _checkInitialAuth() async {
    final token = await StorageService.getAccessToken();
    _isLoggedIn = token != null && token.isNotEmpty;
    notifyListeners();
  }

  // Set user state after successful login/register
  void setAuthData({required String email, required String name, required String accessToken, required String refreshToken}) async {
    _isLoggedIn = true;
    _userEmail = email;
    _userName = name;
    await StorageService.saveTokens(accessToken: accessToken, refreshToken: refreshToken);
    notifyListeners();
  }

  // Logout user and clear tokens
  Future<void> logout() async {
    await StorageService.clearAuthData();
    _isLoggedIn = false;
    _userEmail = null;
    _userName = null;
    notifyListeners();
  }
}
