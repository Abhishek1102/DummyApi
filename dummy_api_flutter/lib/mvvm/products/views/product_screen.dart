import 'package:flutter/material.dart';
import '../viewmodels/product_viewmodel.dart';
import '../../../../core/widgets/loading_indicator.dart';
import '../../../../core/widgets/error_display.dart';
import '../../../../core/widgets/empty_state.dart';

class ProductScreen extends StatefulWidget {
  const ProductScreen({super.key});

  @override
  State<ProductScreen> createState() => _ProductScreenState();
}

class _ProductScreenState extends State<ProductScreen> {
  late final ProductViewModel _viewModel;

  @override
  void initState() {
    super.initState();
    _viewModel = ProductViewModel()..fetchProducts();
  }

  @override
  void dispose() {
    _viewModel.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Products (MVVM)'),
      ),
      body: ListenableBuilder(
        listenable: _viewModel,
        builder: (context, _) {
          if (_viewModel.isLoading) {
            return const LoadingIndicator(message: 'Loading products...');
          }

          if (_viewModel.hasError) {
            return ErrorDisplay(
              error: _viewModel.errorMessage,
              onRetry: _viewModel.fetchProducts,
            );
          }

          if (_viewModel.isEmpty) {
            return const EmptyState(
              title: 'No Products',
              message: 'No products were found in the database.',
            );
          }

          return RefreshIndicator(
            onRefresh: _viewModel.refresh,
            child: ListView.separated(
              itemCount: _viewModel.products.length,
              separatorBuilder: (_, __) => const Divider(height: 1),
              itemBuilder: (context, index) {
                final product = _viewModel.products[index];
                return ListTile(
                  leading: CircleAvatar(
                    backgroundColor: Colors.teal.shade50,
                    child: Text(
                      '${index + 1}',
                      style: TextStyle(color: Colors.teal.shade800),
                    ),
                  ),
                  title: Text(product.name),
                  subtitle: Text(
                    '\$${product.price.toStringAsFixed(2)} • ${product.category}',
                  ),
                );
              },
            ),
          );
        },
      ),
    );
  }
}
