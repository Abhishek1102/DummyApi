import 'dart:io';
import 'package:dio/dio.dart';
import '../core/network/api_client.dart';
import '../core/network/api_exceptions.dart';
import '../mvc/basic_crud/models/product_model.dart';

/// Comprehensive practical cheatsheet showing how to call any REST API endpoint using ApiClient.
class ApiUsageExamples {
  final ApiClient _api = ApiClient();

  // 1. GET Request: Fetching a List of Items
  Future<List<ProductModel>> fetchProducts() async {
    try {
      final response = await _api.get<List<dynamic>>('/api/products');

      if (response.success && response.data != null) {
        return response.data!
            .map((item) => ProductModel.fromJson(item as Map<String, dynamic>))
            .toList();
      }
      return [];
    } on ApiException catch (e) {
      print('API Error [${e.statusCode}]: ${e.message}');
      rethrow;
    }
  }

  // 2. GET Request with Query Parameters (Search & Pagination)
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
      print('Search failed: ${e.message}');
      return [];
    }
  }

  // 3. GET Request with Path Parameter: Fetch by ID
  Future<ProductModel?> fetchProductById(int productId) async {
    try {
      final response = await _api.get<Map<String, dynamic>>('/api/products/$productId');

      if (response.success && response.data != null) {
        return ProductModel.fromJson(response.data!);
      }
      return null;
    } on NotFoundException {
      print('Product #$productId was not found.');
      return null;
    } on ApiException catch (e) {
      print('Error: ${e.message}');
      return null;
    }
  }

  // 4. POST Request with JSON Body: Creating a Resource
  Future<ProductModel?> createProduct({
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
        return ProductModel.fromJson(response.data!);
      }
      return null;
    } on BadRequestException catch (e) {
      print('Validation failed: ${e.message}');
      return null;
    }
  }

  // 5. POST Request for Authentication (Login)
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
        print('Logged in successfully! Token: $accessToken');
        return true;
      }
      return false;
    } on UnauthorizedException {
      print('Invalid email or password.');
      return false;
    }
  }

  // 6. PUT Request: Full Resource Update
  Future<bool> updateProduct(int id, ProductModel updatedProduct) async {
    try {
      final response = await _api.put<Map<String, dynamic>>(
        '/api/products/$id',
        data: updatedProduct.toJson(),
      );
      return response.success;
    } on ApiException catch (e) {
      print('Update error: ${e.message}');
      return false;
    }
  }

  // 7. PATCH Request: Partial Update
  Future<bool> updateProductPrice(int id, double newPrice) async {
    try {
      final response = await _api.patch<Map<String, dynamic>>(
        '/api/products/$id',
        data: {'price': newPrice},
      );
      return response.success;
    } on ApiException catch (e) {
      print('Price patch error: ${e.message}');
      return false;
    }
  }

  // 8. DELETE Request: Deleting by ID
  Future<bool> deleteProduct(int id) async {
    try {
      final response = await _api.delete<Map<String, dynamic>>('/api/products/$id');
      return response.success;
    } on ApiException catch (e) {
      print('Delete error: ${e.message}');
      return false;
    }
  }

  // 9. Multipart File / Image Upload with Progress
  Future<String?> uploadProfileImage(File file) async {
    try {
      final response = await _api.uploadFile<Map<String, dynamic>>(
        '/api/upload/image',
        filePath: file.path,
        fileFieldName: 'file',
        extraFields: {'description': 'Profile Avatar'},
        onSendProgress: (sent, total) {
          final progress = (sent / total * 100).toStringAsFixed(0);
          print('Upload progress: $progress%');
        },
      );

      if (response.success && response.data != null) {
        return response.data!['file_url'];
      }
      return null;
    } on ApiException catch (e) {
      print('Upload failed: ${e.message}');
      return null;
    }
  }

  // 10. Cancelling In-flight Requests
  Future<void> cancellableRequest(CancelToken cancelToken) async {
    try {
      final response = await _api.get<dynamic>(
        '/api/advanced/delayed?seconds=5',
        cancelToken: cancelToken,
      );
      print('Result: ${response.data}');
    } on ApiException catch (e) {
      print('Request was safely aborted: ${e.message}');
    }
  }
}
