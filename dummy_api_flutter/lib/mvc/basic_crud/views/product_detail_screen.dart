import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/widgets/learning_banner.dart';
import '../../../core/widgets/loading_indicator.dart';
import '../../../core/widgets/error_display.dart';
import '../../../core/widgets/response_card.dart';
import '../../../core/widgets/custom_button.dart';
import '../../../core/widgets/custom_text_field.dart';
import '../controllers/product_controller.dart';

// LEARNING: Product Detail & Edit Screen
// Demonstrates single resource GET request (`GET /api/products/:id`) and PUT updates (`PUT /api/products/:id`).

class ProductDetailScreen extends StatefulWidget {
  final int productId;

  const ProductDetailScreen({super.key, required this.productId});

  @override
  State<ProductDetailScreen> createState() => _ProductDetailScreenState();
}

class _ProductDetailScreenState extends State<ProductDetailScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<ProductController>().fetchProductById(widget.productId);
    });
  }

  void _showEditModal(BuildContext context) {
    final controller = context.read<ProductController>();
    final product = controller.selectedProduct;
    if (product == null) return;

    final nameController = TextEditingController(text: product.name);
    final priceController = TextEditingController(text: product.price.toString());
    final stockController = TextEditingController(text: product.stock.toString());

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      builder: (bContext) => Padding(
        padding: EdgeInsets.only(
          top: 20,
          left: 20,
          right: 20,
          bottom: MediaQuery.of(bContext).viewInsets.bottom + 20,
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Update Product (PUT /api/products/${product.id})', style: GoogleFonts.poppins(fontSize: 16, fontWeight: FontWeight.bold)),
            const SizedBox(height: 12),
            CustomTextField(controller: nameController, label: 'Name'),
            const SizedBox(height: 10),
            CustomTextField(controller: priceController, label: 'Price (\$)', keyboardType: TextInputType.number),
            const SizedBox(height: 10),
            CustomTextField(controller: stockController, label: 'Stock', keyboardType: TextInputType.number),
            const SizedBox(height: 20),
            CustomButton(
              label: 'Save Changes (PUT)',
              onPressed: () async {
                final success = await controller.updateProduct(product.id, {
                  'name': nameController.text.trim(),
                  'price': double.tryParse(priceController.text) ?? product.price,
                  'stock': int.tryParse(stockController.text) ?? product.stock,
                });
                if (success && mounted) {
                  Navigator.pop(bContext);
                  ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Product updated!')));
                }
              },
            ),
          ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Product #${widget.productId} Details'),
      ),
      body: Consumer<ProductController>(
        builder: (context, controller, child) {
          if (controller.isLoading) {
            return const LoadingIndicator(message: 'Fetching Product Details...');
          }

          if (controller.errorMessage != null) {
            return ErrorDisplay(
              error: controller.errorMessage,
              onRetry: () => controller.fetchProductById(widget.productId),
            );
          }

          final product = controller.selectedProduct;
          if (product == null) {
            return const Center(child: Text('Product not found.'));
          }

          return SingleChildScrollView(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                LearningBanner(
                  title: 'LEARNING: Single Resource Endpoints',
                  description: 'GET /api/products/${product.id} fetches a specific object by ID path parameter.',
                  keyConcepts: ['Path Parameter', 'GET /products/:id', 'PUT /products/:id'],
                ),
                Card(
                  child: Padding(
                    padding: const EdgeInsets.all(16),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Text(product.name, style: GoogleFonts.poppins(fontSize: 18, fontWeight: FontWeight.bold)),
                            Text('\$${product.price.toStringAsFixed(2)}', style: GoogleFonts.poppins(fontSize: 18, fontWeight: FontWeight.bold, color: AppColors.primary)),
                          ],
                        ),
                        const Divider(height: 24),
                        Text('Category: ${product.category}', style: GoogleFonts.inter(fontSize: 14)),
                        const SizedBox(height: 6),
                        Text('Stock Level: ${product.stock} units', style: GoogleFonts.inter(fontSize: 14)),
                        if (product.description != null) ...[
                          const SizedBox(height: 6),
                          Text('Description: ${product.description}', style: GoogleFonts.inter(fontSize: 14, color: AppColors.textSecondary)),
                        ],
                        const SizedBox(height: 20),
                        Row(
                          children: [
                            Expanded(
                              child: CustomButton(
                                label: 'Edit Product (PUT)',
                                icon: Icons.edit_outlined,
                                onPressed: () => _showEditModal(context),
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                ),
                const SizedBox(height: 16),
                if (controller.lastRawResponse != null)
                  ResponseCard(title: 'Response Payload', jsonResponse: controller.lastRawResponse),
              ],
            ),
          );
        },
      ),
    );
  }
}
