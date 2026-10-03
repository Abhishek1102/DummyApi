import 'package:flutter/foundation.dart';
import '../../../core/constants/api_endpoints.dart';
import '../../../core/network/api_client.dart';
import '../models/product_model.dart';

// LEARNING: MVC Architecture - Controller Layer
// The Controller acts as the glue between the Network Layer (ApiClient) and the View Layer (UI screens).
// It manages asynchronous loading states (`isLoading`), error states (`errorMessage`), and state updates (`notifyListeners()`).

class ProductController extends ChangeNotifier {
  final ApiClient _apiClient = ApiClient();

  // Controller State Variables
  bool _isLoading = false;
  String? _errorMessage;
  List<ProductModel> _products = [];
  ProductModel? _selectedProduct;
  String? _helloMessage;
  dynamic _lastRawResponse;

  // Getters for UI consumption
  bool get isLoading => _isLoading;
  String? get errorMessage => _errorMessage;
  List<ProductModel> get products => _products;
  ProductModel? get selectedProduct => _selectedProduct;
  String? get helloMessage => _helloMessage;
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
  // 1. GET /api/hello
  // Description: Simple GET request returning a greeting message
  // URL: http://10.0.2.2:3000/api/hello
  // Auth Required: None
  // Response Format: { "success": true, "message": "Hello from Dummy API!", "data": null }
  // ---------------------------------------------------------------------------
  Future<void> fetchHelloMessage() async {
    _setLoading(true);
    _setError(null);

    try {
      final response = await _apiClient.get<dynamic>(ApiEndpoints.hello);
      _lastRawResponse = {'success': response.success, 'message': response.message, 'statusCode': response.statusCode};
      if (response.success) {
        _helloMessage = response.message ?? 'Hello response received!';
      } else {
        _setError(response.error?.message ?? 'Failed to load hello message.');
      }
    } catch (e) {
      _setError(e.toString());
    } finally {
      _setLoading(false);
    }
  }

  // ---------------------------------------------------------------------------
  // 2. GET /api/products
  // Description: Fetch all products array
  // URL: http://10.0.2.2:3000/api/products
  // Auth Required: None
  // Response Format: { "success": true, "data": [ { "id": 1, "name": "Laptop", ... } ] }
  // ---------------------------------------------------------------------------
  Future<void> fetchAllProducts() async {
    _setLoading(true);
    _setError(null);

    try {
      final response = await _apiClient.get<List<ProductModel>>(
        ApiEndpoints.products,
        createData: (jsonList) {
          if (jsonList is List) {
            return jsonList.map((item) => ProductModel.fromJson(item as Map<String, dynamic>)).toList();
          }
          return [];
        },
      );

      _lastRawResponse = {'success': response.success, 'count': response.data?.length, 'data': response.data?.map((p) => p.toJson()).toList()};

      if (response.success && response.data != null) {
        _products = response.data!;
      } else {
        _setError(response.error?.message ?? 'Failed to load products.');
      }
    } catch (e) {
      _setError(e.toString());
    } finally {
      _setLoading(false);
    }
  }

  // ---------------------------------------------------------------------------
  // 3. GET /api/products/:id
  // Description: Fetch single product details by integer ID
  // URL: http://10.0.2.2:3000/api/products/1
  // Params: Path param `id` (int)
  // Auth Required: None
  // ---------------------------------------------------------------------------
  Future<void> fetchProductById(int id) async {
    _setLoading(true);
    _setError(null);

    try {
      final response = await _apiClient.get<ProductModel>(
        ApiEndpoints.productById(id),
        createData: (json) => ProductModel.fromJson(json as Map<String, dynamic>),
      );

      _lastRawResponse = {'success': response.success, 'data': response.data?.toJson()};

      if (response.success && response.data != null) {
        _selectedProduct = response.data;
      } else {
        _setError(response.error?.message ?? 'Product not found.');
      }
    } catch (e) {
      _setError(e.toString());
    } finally {
      _setLoading(false);
    }
  }

  // ---------------------------------------------------------------------------
  // 4. POST /api/products
  // Description: Create a new product entry
  // URL: http://10.0.2.2:3000/api/products
  // Body: { "name": "Wireless Mouse", "price": 29.99, "category": "electronics", "stock": 50 }
  // Auth Required: None
  // ---------------------------------------------------------------------------
  Future<bool> createProduct({
    required String name,
    required double price,
    required String category,
    required int stock,
    String? description,
  }) async {
    _setLoading(true);
    _setError(null);

    try {
      final body = {
        'name': name,
        'price': price,
        'category': category,
        'stock': stock,
        if (description != null) 'description': description,
      };

      final response = await _apiClient.post<ProductModel>(
        ApiEndpoints.products,
        data: body,
        createData: (json) => ProductModel.fromJson(json as Map<String, dynamic>),
      );

      _lastRawResponse = {'success': response.success, 'created': response.data?.toJson()};

      if (response.success && response.data != null) {
        _products.insert(0, response.data!); // Refresh local state
        notifyListeners();
        return true;
      } else {
        _setError(response.error?.message ?? 'Failed to create product.');
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
  // 5. PUT /api/products/:id
  // Description: Update existing product details
  // URL: http://10.0.2.2:3000/api/products/1
  // Body: { "name": "Updated Laptop Name", "price": 1099.99 }
  // ---------------------------------------------------------------------------
  Future<bool> updateProduct(int id, Map<String, dynamic> updatedFields) async {
    _setLoading(true);
    _setError(null);

    try {
      final response = await _apiClient.put<ProductModel>(
        ApiEndpoints.productById(id),
        data: updatedFields,
        createData: (json) => ProductModel.fromJson(json as Map<String, dynamic>),
      );

      _lastRawResponse = {'success': response.success, 'updated': response.data?.toJson()};

      if (response.success && response.data != null) {
        final index = _products.indexWhere((p) => p.id == id);
        if (index != -1) {
          _products[index] = response.data!;
        }
        _selectedProduct = response.data;
        notifyListeners();
        return true;
      } else {
        _setError(response.error?.message ?? 'Failed to update product.');
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
  // 6. DELETE /api/products/:id
  // Description: Delete product by ID
  // URL: http://10.0.2.2:3000/api/products/1
  // ---------------------------------------------------------------------------
  Future<bool> deleteProduct(int id) async {
    _setLoading(true);
    _setError(null);

    try {
      final response = await _apiClient.delete<dynamic>(ApiEndpoints.productById(id));
      _lastRawResponse = {'success': response.success, 'message': response.message};

      if (response.success) {
        _products.removeWhere((p) => p.id == id);
        notifyListeners();
        return true;
      } else {
        _setError(response.error?.message ?? 'Failed to delete product.');
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
  // 7. GET /api/categories/:catId/products
  // Description: Filter products by category path parameter
  // URL: http://10.0.2.2:3000/api/categories/electronics/products
  // ---------------------------------------------------------------------------
  Future<void> fetchProductsByCategory(String categoryId) async {
    _setLoading(true);
    _setError(null);

    try {
      final response = await _apiClient.get<List<ProductModel>>(
        ApiEndpoints.productsByCategory(categoryId),
        createData: (jsonList) {
          if (jsonList is List) {
            return jsonList.map((item) => ProductModel.fromJson(item as Map<String, dynamic>)).toList();
          }
          return [];
        },
      );

      _lastRawResponse = {'category': categoryId, 'success': response.success, 'products': response.data?.map((p) => p.toJson()).toList()};

      if (response.success && response.data != null) {
        _products = response.data!;
      } else {
        _setError(response.error?.message ?? 'No products found in category $categoryId.');
      }
    } catch (e) {
      _setError(e.toString());
    } finally {
      _setLoading(false);
    }
  }
}
