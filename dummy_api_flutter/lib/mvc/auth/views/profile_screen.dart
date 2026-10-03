import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/widgets/learning_banner.dart';
import '../../../core/widgets/response_card.dart';
import '../../../core/widgets/custom_button.dart';
import '../../../core/widgets/custom_text_field.dart';
import '../controllers/auth_controller.dart';

// LEARNING: Authenticated Profile & Token Actions View
// Displays logged-in user state and allows calling protected endpoints:
// - `GET /api/auth/profile`
// - `PUT /api/auth/profile`
// - `POST /api/auth/change-password`
// - `POST /api/auth/logout`

class ProfileScreen extends StatelessWidget {
  const ProfileScreen({super.key});

  void _showChangePasswordModal(BuildContext context) {
    final curController = TextEditingController();
    final newController = TextEditingController();

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
            Text('Change Password (POST /api/auth/change-password)', style: GoogleFonts.poppins(fontSize: 16, fontWeight: FontWeight.bold)),
            const SizedBox(height: 12),
            CustomTextField(controller: curController, label: 'Current Password', obscureText: true),
            const SizedBox(height: 10),
            CustomTextField(controller: newController, label: 'New Password', obscureText: true),
            const SizedBox(height: 20),
            Consumer<AuthController>(
              builder: (context, controller, child) {
                return CustomButton(
                  label: 'Submit Password Change',
                  isLoading: controller.isLoading,
                  onPressed: () async {
                    final success = await controller.changePassword(
                      currentPassword: curController.text.trim(),
                      newPassword: newController.text.trim(),
                    );
                    if (success && context.mounted) {
                      Navigator.pop(bContext);
                      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Password changed!')));
                    }
                  },
                );
              },
            ),
          ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Consumer<AuthController>(
      builder: (context, controller, child) {
        final user = controller.currentUser;

        return SingleChildScrollView(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const LearningBanner(
                title: 'LEARNING: Authenticated Session Active',
                description:
                    'You are logged in! All requests made now automatically attach `Authorization: Bearer <accessToken>`. If expired, the interceptor refreshes it automatically.',
                keyConcepts: ['Bearer Token Injection', 'GET /auth/profile', 'PUT /auth/profile', 'POST /auth/logout'],
              ),

              Card(
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    children: [
                      const CircleAvatar(
                        radius: 36,
                        backgroundColor: AppColors.badgeBlue,
                        child: Icon(Icons.person, size: 40, color: AppColors.primary),
                      ),
                      const SizedBox(height: 12),
                      Text(user?.name ?? 'User', style: GoogleFonts.poppins(fontSize: 18, fontWeight: FontWeight.bold)),
                      Text(user?.email ?? '', style: GoogleFonts.inter(fontSize: 13, color: AppColors.textSecondary)),
                      const SizedBox(height: 8),
                      Chip(
                        label: Text('Role: ${user?.role.toUpperCase()}'),
                        backgroundColor: AppColors.badgeGreen,
                      ),
                      const Divider(height: 30),
                      Row(
                        children: [
                          Expanded(
                            child: CustomButton(
                              label: 'Fetch Profile (GET)',
                              isOutlined: true,
                              icon: Icons.refresh,
                              onPressed: () => controller.fetchProfile(),
                            ),
                          ),
                          const SizedBox(width: 8),
                          Expanded(
                            child: CustomButton(
                              label: 'Change Pass',
                              isOutlined: true,
                              icon: Icons.lock,
                              onPressed: () => _showChangePasswordModal(context),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 10),
                      SizedBox(
                        width: double.infinity,
                        child: CustomButton(
                          label: 'Logout (POST /auth/logout)',
                          color: AppColors.error,
                          icon: Icons.logout,
                          onPressed: () => controller.logout(),
                        ),
                      ),
                    ],
                  ),
                ),
              ),

              const SizedBox(height: 16),

              if (controller.lastRawResponse != null)
                ResponseCard(title: 'Latest Auth Response Payload', jsonResponse: controller.lastRawResponse),
            ],
          ),
        );
      },
    );
  }
}
