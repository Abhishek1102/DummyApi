import '../../../../core/network/api_client.dart';
import '../../../../core/network/api_exceptions.dart';
import '../models/product_model.dart';

sealed class Result<T> {
  const Result();
}

class Success<T> extends Result<T> {
  final T data;
  const Success(this.data);
}

class Failure<T> extends Result<T> {
  final String message;
  final ApiException? exception;
  const Failure(this.message, {this.exception});
}

abstract class ProductRepository {
  Future<Result<List<Product>>> getProducts({int page = 1, int limit = 10});
  Future<Result<Product>> getProductById(int id);
  Future<Result<Product>> createProduct(Product product);
  Future<Result<bool>> deleteProduct(int id);
}

class ProductRepositoryImpl implements ProductRepository {
  final ApiClient apiClient;

  ProductRepositoryImpl({ApiClient? client})
      : apiClient = client ?? ApiClient();

  @override
  Future<Result<List<Product>>> getProducts({int page = 1, int limit = 10}) async {
    try {
      final response = await apiClient.get<List<dynamic>>(
        '/api/products',
        queryParameters: {'page': page, 'limit': limit},
      );

      if (response.success && response.data != null) {
        final products = response.data!
            .map((item) => Product.fromJson(item as Map<String, dynamic>))
            .toList();
        return Success(products);
      } else {
        return Failure(response.message ?? 'Failed to fetch products');
      }
    } on ApiException catch (e) {
      return Failure(e.message, exception: e);
    } catch (e) {
      return Failure('Unexpected error: $e');
    }
  }

  @override
  Future<Result<Product>> getProductById(int id) async {
    try {
      final response = await apiClient.get<Map<String, dynamic>>('/api/products/$id');
      if (response.success && response.data != null) {
        return Success(Product.fromJson(response.data!));
      }
      return Failure(response.message ?? 'Product not found');
    } on ApiException catch (e) {
      return Failure(e.message, exception: e);
    }
  }

  @override
  Future<Result<Product>> createProduct(Product product) async {
    try {
      final response = await apiClient.post<Map<String, dynamic>>(
        '/api/products',
        data: product.toJson(),
      );
      if (response.success && response.data != null) {
        return Success(Product.fromJson(response.data!));
      }
      return Failure(response.message ?? 'Failed to create product');
    } on ApiException catch (e) {
      return Failure(e.message, exception: e);
    }
  }

  @override
  Future<Result<bool>> deleteProduct(int id) async {
    try {
      final response = await apiClient.delete<Map<String, dynamic>>('/api/products/$id');
      return Success(response.success);
    } on ApiException catch (e) {
      return Failure(e.message, exception: e);
    }
  }
}
