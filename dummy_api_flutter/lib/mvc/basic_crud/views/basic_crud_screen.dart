import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/widgets/learning_banner.dart';
import '../../../core/widgets/loading_indicator.dart';
import '../../../core/widgets/error_display.dart';
import '../../../core/widgets/empty_state.dart';
import '../../../core/widgets/response_card.dart';
import '../../../core/widgets/custom_button.dart';
import '../../../core/widgets/custom_text_field.dart';
import '../controllers/product_controller.dart';
import 'product_detail_screen.dart';

// LEARNING: Basic CRUD Operations View
// Demonstrates how a Flutter UI uses `Provider` to observe controller state and trigger API calls:
// 1. `GET /api/hello` -> Test Connectivity
// 2. `GET /api/products` -> Fetch List
// 3. `POST /api/products` -> Create Entry Modal
// 4. Category Filter Buttons -> `GET /api/categories/:catId/products`

class BasicCrudScreen extends StatefulWidget {
  const BasicCrudScreen({super.key});

  @override
  State<BasicCrudScreen> createState() => _BasicCrudScreenState();
}

class _BasicCrudScreenState extends State<BasicCrudScreen> {
  String _selectedCategory = 'all';

  @override
  void initState() {
    super.initState();
    // LEARNING: Fetch initial data after first frame render
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final controller = context.read<ProductController>();
      controller.fetchHelloMessage();
      controller.fetchAllProducts();
    });
  }

  void _showAddProductModal(BuildContext context) {
    final nameController = TextEditingController();
    final priceController = TextEditingController();
    final categoryController = TextEditingController(text: 'electronics');
    final stockController = TextEditingController(text: '10');
    final descController = TextEditingController();
    final formKey = GlobalKey<FormState>();

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (bottomSheetContext) {
        return Padding(
          padding: EdgeInsets.only(
            top: 20,
            left: 20,
            right: 20,
            bottom: MediaQuery.of(bottomSheetContext).viewInsets.bottom + 20,
          ),
          child: Form(
            key: formKey,
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Add New Product (POST /api/products)',
                  style: GoogleFonts.poppins(fontSize: 16, fontWeight: FontWeight.bold),
                ),
                const SizedBox(height: 12),
                CustomTextField(
                  controller: nameController,
                  label: 'Product Name',
                  prefixIcon: Icons.shopping_bag_outlined,
                  validator: (val) => val == null || val.isEmpty ? 'Required' : null,
                ),
                const SizedBox(height: 10),
                Row(
                  children: [
                    Expanded(
                      child: CustomTextField(
                        controller: priceController,
                        label: 'Price (\$)',
                        keyboardType: TextInputType.number,
                        prefixIcon: Icons.attach_money,
                        validator: (val) => val == null || double.tryParse(val) == null ? 'Invalid price' : null,
                      ),
                    ),
                    const SizedBox(width: 10),
                    Expanded(
                      child: CustomTextField(
                        controller: stockController,
                        label: 'Stock Quantity',
                        keyboardType: TextInputType.number,
                        prefixIcon: Icons.inventory_2_outlined,
                        validator: (val) => val == null || int.tryParse(val) == null ? 'Invalid stock' : null,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 10),
                CustomTextField(
                  controller: categoryController,
                  label: 'Category',
                  prefixIcon: Icons.category_outlined,
                ),
                const SizedBox(height: 10),
                CustomTextField(
                  controller: descController,
                  label: 'Description (Optional)',
                  prefixIcon: Icons.description_outlined,
                ),
                const SizedBox(height: 20),
                Consumer<ProductController>(
                  builder: (context, controller, child) {
                    return CustomButton(
                      label: 'Create Product (POST)',
                      isLoading: controller.isLoading,
                      icon: Icons.add_circle_outline,
                      onPressed: () async {
                        if (formKey.currentState!.validate()) {
                          final success = await controller.createProduct(
                            name: nameController.text.trim(),
                            price: double.parse(priceController.text.trim()),
                            category: categoryController.text.trim(),
                            stock: int.parse(stockController.text.trim()),
                            description: descController.text.trim().isNotEmpty ? descController.text.trim() : null,
                          );
                          if (success && mounted) {
                            Navigator.pop(bottomSheetContext);
                            ScaffoldMessenger.of(context).showSnackBar(
                              const SnackBar(content: Text('Product created successfully!')),
                            );
                          }
                        }
                      },
                    );
                  },
                ),
              ],
            ),
          ),
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Module 1: Basic CRUD'),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh_rounded),
            onPressed: () {
              final controller = context.read<ProductController>();
              if (_selectedCategory == 'all') {
                controller.fetchAllProducts();
              } else {
                controller.fetchProductsByCategory(_selectedCategory);
              }
            },
          ),
        ],
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () => _showAddProductModal(context),
        backgroundColor: AppColors.primary,
        icon: const Icon(Icons.add, color: Colors.white),
        label: const Text('New Product', style: TextStyle(color: Colors.white)),
      ),
      body: Consumer<ProductController>(
        builder: (context, controller, child) {
          return SingleChildScrollView(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const LearningBanner(
                  title: 'LEARNING: Standard REST CRUD & Path Parameters',
                  description:
                      'This screen demonstrates standard REST verbs: GET (fetch all/filtered), POST (create product), PUT (update product), and DELETE (remove product), along with path parameter parsing (/categories/:catId/products).',
                  keyConcepts: ['GET /products', 'POST /products', 'PUT /products/:id', 'DELETE /products/:id', 'Path Params'],
                ),

                // Hello Message Banner (Testing Server Connection)
                if (controller.helloMessage != null)
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 16),
                    child: Container(
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: AppColors.badgeGreen,
                        borderRadius: BorderRadius.circular(8),
                        border: Border.all(color: Colors.green.shade200),
                      ),
                      child: Row(
                        children: [
                          const Icon(Icons.check_circle_outline, color: AppColors.success, size: 20),
                          const SizedBox(width: 8),
                          Expanded(
                            child: Text(
                              'Server Connection Active: "${controller.helloMessage}"',
                              style: GoogleFonts.inter(fontSize: 12, color: AppColors.success, fontWeight: FontWeight.w600),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),

                // Category Filter Pills
                Padding(
                  padding: const EdgeInsets.all(16.0),
                  child: SingleChildScrollView(
                    scrollDirection: Axis.horizontal,
                    child: Row(
                      children: ['all', 'electronics', 'clothing', 'books', 'accessories'].map((cat) {
                        final isSelected = _selectedCategory == cat;
                        return Padding(
                          padding: const EdgeInsets.only(right: 8.0),
                          child: ChoiceChip(
                            label: Text(cat.toUpperCase()),
                            selected: isSelected,
                            onSelected: (selected) {
                              if (selected) {
                                setState(() => _selectedCategory = cat);
                                if (cat == 'all') {
                                  controller.fetchAllProducts();
                                } else {
                                  controller.fetchProductsByCategory(cat);
                                }
                              }
                            },
                          ),
                        );
                      }).toList(),
                    ),
                  ),
                ),

                // State Handling
                if (controller.isLoading && controller.products.isEmpty)
                  const LoadingIndicator(message: 'Loading Products from REST API...')
                else if (controller.errorMessage != null && controller.products.isEmpty)
                  ErrorDisplay(
                    error: controller.errorMessage,
                    onRetry: () => controller.fetchAllProducts(),
                  )
                else if (controller.products.isEmpty)
                  const EmptyState(message: 'No products returned for this filter.')
                else
                  ListView.separated(
                    shrinkWrap: true,
                    physics: const NeverScrollableScrollPhysics(),
                    padding: const EdgeInsets.symmetric(horizontal: 16),
                    itemCount: controller.products.length,
                    separatorBuilder: (c, i) => const SizedBox(height: 10),
                    itemBuilder: (context, index) {
                      final product = controller.products[index];
                      return Card(
                        child: ListTile(
                          title: Text(
                            product.name,
                            style: GoogleFonts.poppins(fontWeight: FontWeight.w600, fontSize: 14),
                          ),
                          subtitle: Text(
                            'Category: ${product.category} • Stock: ${product.stock}',
                            style: GoogleFonts.inter(fontSize: 12, color: AppColors.textSecondary),
                          ),
                          trailing: Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Text(
                                '\$${product.price.toStringAsFixed(2)}',
                                style: GoogleFonts.poppins(fontWeight: FontWeight.bold, color: AppColors.primary),
                              ),
                              IconButton(
                                icon: const Icon(Icons.delete_outline_rounded, color: AppColors.error, size: 20),
                                onPressed: () async {
                                  final confirm = await showDialog<bool>(
                                    context: context,
                                    builder: (c) => AlertDialog(
                                      title: const Text('Delete Product?'),
                                      content: Text('Send DELETE /api/products/${product.id}?'),
                                      actions: [
                                        TextButton(onPressed: () => Navigator.pop(c, false), child: const Text('Cancel')),
                                        ElevatedButton(
                                          style: ElevatedButton.styleFrom(backgroundColor: AppColors.error),
                                          onPressed: () => Navigator.pop(c, true),
                                          child: const Text('Delete'),
                                        ),
                                      ],
                                    ),
                                  );
                                  if (confirm == true) {
                                    await controller.deleteProduct(product.id);
                                  }
                                },
                              ),
                            ],
                          ),
                          onTap: () {
                            Navigator.push(
                              context,
                              MaterialPageRoute(
                                builder: (_) => ProductDetailScreen(productId: product.id),
                              ),
                            );
                          },
                        ),
                      );
                    },
                  ),

                // Raw JSON Response Inspector Card
                if (controller.lastRawResponse != null)
                  Padding(
                    padding: const EdgeInsets.all(16),
                    child: ResponseCard(
                      title: 'Latest Raw Response JSON',
                      jsonResponse: controller.lastRawResponse,
                    ),
                  ),

                const SizedBox(height: 80), // Padding for FAB
              ],
            ),
          );
        },
      ),
    );
  }
}
