import 'package:flutter/foundation.dart';
import '../../../core/constants/api_endpoints.dart';
import '../../../core/network/api_client.dart';
import '../models/user_model.dart';

// LEARNING: Query Parameter Controller
// Demonstrates building dynamic URL query string parameter maps (`Map<String, dynamic> queryParameters`)
// for searching, filtering, sorting, and paginating API data.

class UserController extends ChangeNotifier {
  final ApiClient _apiClient = ApiClient();

  bool _isLoading = false;
  String? _errorMessage;
  List<UserModel> _users = [];
  PaginationMeta? _pagination;
  UserModel? _selectedUser;
  dynamic _lastRawResponse;

  // Filter States
  int _currentPage = 1;
  int _limit = 5;
  String _searchQuery = '';
  String _sortBy = 'id';
  String _sortOrder = 'asc';
  String? _roleFilter;

  // Getters
  bool get isLoading => _isLoading;
  String? get errorMessage => _errorMessage;
  List<UserModel> get users => _users;
  PaginationMeta? get pagination => _pagination;
  UserModel? get selectedUser => _selectedUser;
  dynamic get lastRawResponse => _lastRawResponse;
  int get currentPage => _currentPage;
  String get searchQuery => _searchQuery;

  void _setLoading(bool loading) {
    _isLoading = loading;
    notifyListeners();
  }

  void _setError(String? error) {
    _errorMessage = error;
    notifyListeners();
  }

  // ---------------------------------------------------------------------------
  // 1. GET /api/users?page=1&limit=5&search=john&sort=name&order=asc&role=admin
  // Description: Query parameters parsing and pagination handling
  // URL: http://10.0.2.2:3000/api/users
  // Auth Required: None
  // Query Params:
  // - page: int (1-indexed page number)
  // - limit: int (items per page)
  // - search: String (filters by name/email)
  // - sort: String (column to sort by: 'name', 'email', 'id')
  // - order: String ('asc' or 'desc')
  // - role: String ('admin', 'user', etc.)
  // ---------------------------------------------------------------------------
  Future<void> fetchUsers({
    int? page,
    int? limit,
    String? search,
    String? sortBy,
    String? order,
    String? role,
  }) async {
    _setLoading(true);
    _setError(null);

    if (page != null) _currentPage = page;
    if (limit != null) _limit = limit;
    if (search != null) _searchQuery = search;
    if (sortBy != null) _sortBy = sortBy;
    if (order != null) _sortOrder = order;
    _roleFilter = role;

    // LEARNING: Build query parameters map dynamically
    final Map<String, dynamic> queryParams = {
      'page': _currentPage,
      'limit': _limit,
      if (_searchQuery.isNotEmpty) 'search': _searchQuery,
      'sort': _sortBy,
      'order': _sortOrder,
      if (_roleFilter != null && _roleFilter!.isNotEmpty) 'role': _roleFilter,
    };

    try {
      final response = await _apiClient.get<dynamic>(
        ApiEndpoints.users,
        queryParameters: queryParams,
      );

      _lastRawResponse = {
        'queryParamsSent': queryParams,
        'response': response.data,
      };

      if (response.success && response.data != null) {
        final dataMap = response.data as Map<String, dynamic>;
        if (dataMap['users'] is List) {
          _users = (dataMap['users'] as List).map((u) => UserModel.fromJson(u as Map<String, dynamic>)).toList();
        }
        if (dataMap['pagination'] != null) {
          _pagination = PaginationMeta.fromJson(dataMap['pagination'] as Map<String, dynamic>);
        }
      } else {
        _setError(response.error?.message ?? 'Failed to fetch users.');
      }
    } catch (e) {
      _setError(e.toString());
    } finally {
      _setLoading(false);
    }
  }

  // ---------------------------------------------------------------------------
  // 2. GET /api/users/:id
  // Description: Single user detail lookup
  // URL: http://10.0.2.2:3000/api/users/1
  // ---------------------------------------------------------------------------
  Future<void> fetchUserById(int id) async {
    _setLoading(true);
    _setError(null);

    try {
      final response = await _apiClient.get<UserModel>(
        ApiEndpoints.userById(id),
        createData: (json) => UserModel.fromJson(json as Map<String, dynamic>),
      );

      _lastRawResponse = {'success': response.success, 'user': response.data?.toJson()};

      if (response.success && response.data != null) {
        _selectedUser = response.data;
      } else {
        _setError(response.error?.message ?? 'User not found.');
      }
    } catch (e) {
      _setError(e.toString());
    } finally {
      _setLoading(false);
    }
  }
}
