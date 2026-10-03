import 'package:flutter/foundation.dart';
import '../models/product_model.dart';
import '../repositories/product_repository.dart';

enum ViewState { initial, loading, success, error }

/// Production-ready MVVM ViewModel using Flutter native ChangeNotifier
class ProductViewModel extends ChangeNotifier {
  final ProductRepository repository;

  ProductViewModel({ProductRepository? repo})
      : repository = repo ?? ProductRepositoryImpl();

  ViewState _state = ViewState.initial;
  List<Product> _products = [];
  String? _errorMessage;
  bool _isDisposed = false;

  ViewState get state => _state;
  List<Product> get products => List.unmodifiable(_products);
  String? get errorMessage => _errorMessage;
  bool get isLoading => _state == ViewState.loading;
  bool get hasError => _state == ViewState.error;
  bool get isEmpty => _state == ViewState.success && _products.isEmpty;

  @override
  void notifyListeners() {
    if (!_isDisposed) {
      super.notifyListeners();
    }
  }

  @override
  void dispose() {
    _isDisposed = true;
    super.dispose();
  }

  Future<void> fetchProducts() async {
    _state = ViewState.loading;
    _errorMessage = null;
    notifyListeners();

    final result = await repository.getProducts();

    switch (result) {
      case Success(data: final items):
        _products = items;
        _state = ViewState.success;
      case Failure(message: final error):
        _errorMessage = error;
        _state = ViewState.error;
    }

    notifyListeners();
  }

  Future<void> refresh() async {
    final result = await repository.getProducts();
    if (result is Success<List<Product>>) {
      _products = result.data;
      _state = ViewState.success;
      _errorMessage = null;
      notifyListeners();
    }
  }

  Future<bool> addProduct(Product newProduct) async {
    final result = await repository.createProduct(newProduct);
    if (result is Success<Product>) {
      _products = [result.data, ..._products];
      notifyListeners();
      return true;
    }
    return false;
  }
}
