import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/widgets/learning_banner.dart';
import '../../../core/widgets/loading_indicator.dart';
import '../../../core/widgets/error_display.dart';
import '../../../core/widgets/empty_state.dart';
import '../../../core/widgets/response_card.dart';
import '../../../core/widgets/custom_text_field.dart';
import '../controllers/user_controller.dart';

// LEARNING: Query Parameters View
// Demonstrates live searching, pagination control, sorting toggles, and role filters.

class QueryParamsScreen extends StatefulWidget {
  const QueryParamsScreen({super.key});

  @override
  State<QueryParamsScreen> createState() => _QueryParamsScreenState();
}

class _QueryParamsScreenState extends State<QueryParamsScreen> {
  final TextEditingController _searchController = TextEditingController();

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<UserController>().fetchUsers();
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Module 2: Query Parameters'),
      ),
      body: Consumer<UserController>(
        builder: (context, controller, child) {
          final pagination = controller.pagination;

          return SingleChildScrollView(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const LearningBanner(
                  title: 'LEARNING: Query Parameters & Pagination',
                  description:
                      'Query params are appended to the URL (e.g. ?page=1&limit=5&search=john&sort=name&order=asc). In Flutter Dio, pass them via the `queryParameters` map.',
                  keyConcepts: ['?search=keyword', '?page=N&limit=M', '?sort=field&order=asc/desc', '?role=admin'],
                ),

                // Search Bar
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 16),
                  child: Row(
                    children: [
                      Expanded(
                        child: CustomTextField(
                          controller: _searchController,
                          label: 'Search users by name/email...',
                          prefixIcon: Icons.search_rounded,
                        ),
                      ),
                      const SizedBox(width: 8),
                      IconButton.filled(
                        icon: const Icon(Icons.send_rounded),
                        onPressed: () {
                          controller.fetchUsers(page: 1, search: _searchController.text.trim());
                        },
                      ),
                    ],
                  ),
                ),

                const SizedBox(height: 12),

                // Sorting & Role Controls
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 16),
                  child: SingleChildScrollView(
                    scrollDirection: Axis.horizontal,
                    child: Row(
                      children: [
                        FilterChip(
                          label: const Text('Sort: Name'),
                          onSelected: (val) => controller.fetchUsers(sortBy: 'name', order: 'asc'),
                        ),
                        const SizedBox(width: 8),
                        FilterChip(
                          label: const Text('Sort: ID Desc'),
                          onSelected: (val) => controller.fetchUsers(sortBy: 'id', order: 'desc'),
                        ),
                        const SizedBox(width: 8),
                        FilterChip(
                          label: const Text('Role: Admin'),
                          onSelected: (val) => controller.fetchUsers(role: 'admin'),
                        ),
                        const SizedBox(width: 8),
                        FilterChip(
                          label: const Text('Reset All Filters'),
                          onSelected: (val) {
                            _searchController.clear();
                            controller.fetchUsers(page: 1, search: '', sortBy: 'id', order: 'asc', role: '');
                          },
                        ),
                      ],
                    ),
                  ),
                ),

                const SizedBox(height: 16),

                // Content
                if (controller.isLoading)
                  const LoadingIndicator(message: 'Executing Query Parameter Request...')
                else if (controller.errorMessage != null)
                  ErrorDisplay(error: controller.errorMessage, onRetry: () => controller.fetchUsers())
                else if (controller.users.isEmpty)
                  const EmptyState(message: 'No users match your query parameters.')
                else
                  ListView.separated(
                    shrinkWrap: true,
                    physics: const NeverScrollableScrollPhysics(),
                    padding: const EdgeInsets.symmetric(horizontal: 16),
                    itemCount: controller.users.length,
                    separatorBuilder: (c, i) => const SizedBox(height: 8),
                    itemBuilder: (context, index) {
                      final user = controller.users[index];
                      return Card(
                        child: ListTile(
                          leading: CircleAvatar(
                            backgroundColor: AppColors.badgeBlue,
                            child: Text(user.name.substring(0, 1).toUpperCase()),
                          ),
                          title: Text(user.name, style: GoogleFonts.poppins(fontWeight: FontWeight.w600, fontSize: 14)),
                          subtitle: Text(user.email, style: GoogleFonts.inter(fontSize: 12, color: AppColors.textSecondary)),
                          trailing: Container(
                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                            decoration: BoxDecoration(
                              color: user.role == 'admin' ? AppColors.badgeRed : AppColors.badgeGreen,
                              borderRadius: BorderRadius.circular(6),
                            ),
                            child: Text(
                              user.role.toUpperCase(),
                              style: GoogleFonts.poppins(
                                fontSize: 10,
                                fontWeight: FontWeight.bold,
                                color: user.role == 'admin' ? AppColors.error : AppColors.success,
                              ),
                            ),
                          ),
                        ),
                      );
                    },
                  ),

                // Pagination Row
                if (pagination != null)
                  Padding(
                    padding: const EdgeInsets.all(16),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        OutlinedButton.icon(
                          icon: const Icon(Icons.arrow_back),
                          label: const Text('Prev'),
                          onPressed: pagination.page > 1 ? () => controller.fetchUsers(page: pagination.page - 1) : null,
                        ),
                        Text(
                          'Page ${pagination.page} of ${pagination.totalPages} (${pagination.total} total)',
                          style: GoogleFonts.inter(fontSize: 12, fontWeight: FontWeight.w600),
                        ),
                        OutlinedButton.icon(
                          icon: const Icon(Icons.arrow_forward),
                          label: const Text('Next'),
                          onPressed: pagination.page < pagination.totalPages ? () => controller.fetchUsers(page: pagination.page + 1) : null,
                        ),
                      ],
                    ),
                  ),

                // Raw JSON Card
                if (controller.lastRawResponse != null)
                  Padding(
                    padding: const EdgeInsets.all(16),
                    child: ResponseCard(title: 'Query Response & Params Payload', jsonResponse: controller.lastRawResponse),
                  ),
              ],
            ),
          );
        },
      ),
    );
  }
}
