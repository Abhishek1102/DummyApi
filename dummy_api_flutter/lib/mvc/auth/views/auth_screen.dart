import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/widgets/learning_banner.dart';
import '../../../core/widgets/response_card.dart';
import '../../../core/widgets/custom_button.dart';
import '../../../core/widgets/custom_text_field.dart';
import '../controllers/auth_controller.dart';
import 'profile_screen.dart';

// LEARNING: Authentication & JWT Management View
// Demonstrates login (`POST /api/auth/login`), registration (`POST /api/auth/register`), and token storage.

class AuthScreen extends StatefulWidget {
  const AuthScreen({super.key});

  @override
  State<AuthScreen> createState() => _AuthScreenState();
}

class _AuthScreenState extends State<AuthScreen> {
  bool _isLoginTab = true;

  // Form Controllers
  final _emailController = TextEditingController(text: 'test@example.com');
  final _passwordController = TextEditingController(text: 'password123');
  final _nameController = TextEditingController(text: 'Test User');
  final _formKey = GlobalKey<FormState>();

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Module 3: Authentication & JWT'),
      ),
      body: Consumer<AuthController>(
        builder: (context, controller, child) {
          if (controller.currentUser != null) {
            return const ProfileScreen();
          }

          return SingleChildScrollView(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const LearningBanner(
                  title: 'LEARNING: JWT Authentication Flow',
                  description:
                      'Auth flow exchanges credentials for JWT Access & Refresh Tokens. Access tokens are automatically attached in `Authorization: Bearer <token>` via Dio Interceptors.',
                  keyConcepts: ['POST /auth/login', 'POST /auth/register', 'JWT Tokens', 'Auto Token Refresh'],
                ),

                // Toggle Login / Register
                Row(
                  children: [
                    Expanded(
                      child: ElevatedButton(
                        style: ElevatedButton.styleFrom(
                          backgroundColor: _isLoginTab ? AppColors.primary : Colors.grey.shade200,
                          foregroundColor: _isLoginTab ? Colors.white : AppColors.textPrimary,
                        ),
                        onPressed: () => setState(() => _isLoginTab = true),
                        child: const Text('Login Tab'),
                      ),
                    ),
                    const SizedBox(width: 10),
                    Expanded(
                      child: ElevatedButton(
                        style: ElevatedButton.styleFrom(
                          backgroundColor: !_isLoginTab ? AppColors.primary : Colors.grey.shade200,
                          foregroundColor: !_isLoginTab ? Colors.white : AppColors.textPrimary,
                        ),
                        onPressed: () => setState(() => _isLoginTab = false),
                        child: const Text('Register Tab'),
                      ),
                    ),
                  ],
                ),

                const SizedBox(height: 20),

                // Form Card
                Card(
                  child: Padding(
                    padding: const EdgeInsets.all(16),
                    child: Form(
                      key: _formKey,
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            _isLoginTab ? 'Sign In to Account' : 'Create New Account',
                            style: GoogleFonts.poppins(fontSize: 16, fontWeight: FontWeight.bold),
                          ),
                          const SizedBox(height: 12),
                          if (!_isLoginTab) ...[
                            CustomTextField(
                              controller: _nameController,
                              label: 'Full Name',
                              prefixIcon: Icons.person_outlined,
                              validator: (v) => v == null || v.isEmpty ? 'Required' : null,
                            ),
                            const SizedBox(height: 10),
                          ],
                          CustomTextField(
                            controller: _emailController,
                            label: 'Email Address',
                            keyboardType: TextInputType.emailAddress,
                            prefixIcon: Icons.email_outlined,
                            validator: (v) => v == null || !v.contains('@') ? 'Enter valid email' : null,
                          ),
                          const SizedBox(height: 10),
                          CustomTextField(
                            controller: _passwordController,
                            label: 'Password',
                            obscureText: true,
                            prefixIcon: Icons.lock_outlined,
                            validator: (v) => v == null || v.length < 6 ? 'Min 6 chars' : null,
                          ),
                          if (controller.errorMessage != null) ...[
                            const SizedBox(height: 12),
                            Text(
                              controller.errorMessage!,
                              style: GoogleFonts.inter(color: AppColors.error, fontSize: 13),
                            ),
                          ],
                          const SizedBox(height: 20),
                          SizedBox(
                            width: double.infinity,
                            child: CustomButton(
                              label: _isLoginTab ? 'Login (POST /auth/login)' : 'Register (POST /auth/register)',
                              isLoading: controller.isLoading,
                              icon: _isLoginTab ? Icons.login_rounded : Icons.person_add_rounded,
                              onPressed: () async {
                                if (_formKey.currentState!.validate()) {
                                  if (_isLoginTab) {
                                    await controller.login(
                                      email: _emailController.text.trim(),
                                      password: _passwordController.text.trim(),
                                    );
                                  } else {
                                    await controller.register(
                                      name: _nameController.text.trim(),
                                      email: _emailController.text.trim(),
                                      password: _passwordController.text.trim(),
                                    );
                                  }
                                }
                              },
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ),

                const SizedBox(height: 16),

                if (controller.lastRawResponse != null)
                  ResponseCard(title: 'Auth Response Payload', jsonResponse: controller.lastRawResponse),
              ],
            ),
          );
        },
      ),
    );
  }
}
