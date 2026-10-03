import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'core/constants/app_colors.dart';
import 'core/widgets/api_log_viewer.dart';
import 'mvc/basic_crud/views/basic_crud_screen.dart';
import 'mvc/query_params/views/query_params_screen.dart';
import 'mvc/auth/views/auth_screen.dart';
import 'mvc/headers/views/headers_screen.dart';
import 'mvc/upload/views/upload_screen.dart';
import 'mvc/posts_comments/views/posts_screen.dart';
import 'mvc/advanced/views/advanced_screen.dart';
import 'mvc/errors/views/error_simulation_screen.dart';

// LEARNING: Dashboard Home Screen
// Lists all 8 API modules in an interactive card grid.
// Provides a top action button to launch the live Network Log Inspector sheet anytime.

class HomeScreen extends StatelessWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Row(
          children: [
            const Icon(Icons.api_rounded, color: AppColors.primary, size: 28),
            const SizedBox(width: 10),
            Text(
              'Dummy API Learn',
              style: GoogleFonts.poppins(fontWeight: FontWeight.bold),
            ),
          ],
        ),
        actions: [
          IconButton.filledTonal(
            icon: const Icon(Icons.bug_report_rounded, color: AppColors.primary),
            onPressed: () => ApiLogViewerSheet.show(context),
            tooltip: 'View Live Network Logs',
          ),
          const SizedBox(width: 12),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Welcome Header
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(18),
              decoration: BoxDecoration(
                gradient: const LinearGradient(
                  colors: [AppColors.primary, AppColors.primaryDark],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
                borderRadius: BorderRadius.circular(16),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Flutter API Integration Masterclass',
                    style: GoogleFonts.poppins(
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                      color: Colors.white,
                    ),
                  ),
                  const SizedBox(height: 6),
                  Text(
                    'Explore 48 REST API endpoints across 8 modules using clean MVC architecture with detailed educational comments.',
                    style: GoogleFonts.inter(
                      fontSize: 13,
                      color: Colors.white.withOpacity(0.9),
                      height: 1.4,
                    ),
                  ),
                ],
              ),
            ),

            const SizedBox(height: 20),

            Text(
              'API Learning Modules (MVC)',
              style: GoogleFonts.poppins(
                fontSize: 16,
                fontWeight: FontWeight.bold,
                color: AppColors.textPrimary,
              ),
            ),

            const SizedBox(height: 12),

            // Modules Grid
            ListView(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              children: [
                _ModuleCard(
                  number: '01',
                  title: 'Basic CRUD Operations',
                  subtitle: 'GET, POST, PUT, DELETE, path parameters (/products/:id)',
                  icon: Icons.inventory_2_outlined,
                  color: const Color(0xFF1565C0),
                  onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const BasicCrudScreen())),
                ),
                _ModuleCard(
                  number: '02',
                  title: 'Query Parameters & Search',
                  subtitle: 'Pagination (?page=1&limit=5), searching, sorting, filtering',
                  icon: Icons.search_rounded,
                  color: const Color(0xFF00897B),
                  onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const QueryParamsScreen())),
                ),
                _ModuleCard(
                  number: '03',
                  title: 'Auth & JWT Tokens',
                  subtitle: 'Login, Register, Refresh Token, Bearer Headers, Profile',
                  icon: Icons.lock_outline_rounded,
                  color: const Color(0xFF6A1B9A),
                  onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const AuthScreen())),
                ),
                _ModuleCard(
                  number: '04',
                  title: 'Headers & Security',
                  subtitle: 'X-API-Key, Custom headers, Echo request, Accept header',
                  icon: Icons.security_rounded,
                  color: const Color(0xFFD84315),
                  onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const HeadersScreen())),
                ),
                _ModuleCard(
                  number: '05',
                  title: 'File Upload & Download',
                  subtitle: 'Single image, Multiple images, Documents, Avatar + Form',
                  icon: Icons.cloud_upload_outlined,
                  color: const Color(0xFF0277BD),
                  onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const UploadScreen())),
                ),
                _ModuleCard(
                  number: '06',
                  title: 'Posts & Comments',
                  subtitle: 'Nested JSON structures, Likes, Comments relational data',
                  icon: Icons.forum_outlined,
                  color: const Color(0xFF2E7D32),
                  onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const PostsScreen())),
                ),
                _ModuleCard(
                  number: '07',
                  title: 'Advanced Scenarios',
                  subtitle: 'Delayed response, UrlEncoded forms, Rate limits (429), Validation',
                  icon: Icons.tune_rounded,
                  color: const Color(0xFFF57F17),
                  onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const AdvancedScreen())),
                ),
                _ModuleCard(
                  number: '08',
                  title: 'Error Simulation Lab',
                  subtitle: 'Test 400, 401, 403, 404, 500, and Timeout handling in UI',
                  icon: Icons.bug_report_outlined,
                  color: const Color(0xFFC62828),
                  onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const ErrorSimulationScreen())),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

class _ModuleCard extends StatelessWidget {
  final String number;
  final String title;
  final String subtitle;
  final IconData icon;
  final Color color;
  final VoidCallback onTap;

  const _ModuleCard({
    required this.number,
    required this.title,
    required this.subtitle,
    required this.icon,
    required this.color,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(12),
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Row(
            children: [
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: color.withOpacity(0.12),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Icon(icon, color: color, size: 28),
              ),
              const SizedBox(width: 14),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Text(
                          'MODULE $number',
                          style: GoogleFonts.poppins(
                            fontSize: 10,
                            fontWeight: FontWeight.bold,
                            color: color,
                            letterSpacing: 1,
                          ),
                        ),
                      ],
                    ),
                    Text(
                      title,
                      style: GoogleFonts.poppins(
                        fontSize: 15,
                        fontWeight: FontWeight.bold,
                        color: AppColors.textPrimary,
                      ),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      subtitle,
                      style: GoogleFonts.inter(
                        fontSize: 12,
                        color: AppColors.textSecondary,
                      ),
                    ),
                  ],
                ),
              ),
              const Icon(Icons.chevron_right_rounded, color: AppColors.textLight),
            ],
          ),
        ),
      ),
    );
  }
}
