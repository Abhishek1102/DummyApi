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
import '../controllers/header_controller.dart';

// LEARNING: Headers & Security View
// Demonstrates sending API Key headers, Custom Client metadata, and Header Echo inspection.

class HeadersScreen extends StatefulWidget {
  const HeadersScreen({super.key});

  @override
  State<HeadersScreen> createState() => _HeadersScreenState();
}

class _HeadersScreenState extends State<HeadersScreen> {
  final _apiKeyController = TextEditingController(text: 'practice-api-key-2024');
  final _customHeaderController = TextEditingController(text: 'my-custom-token-123');

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Module 4: Headers & Security'),
      ),
      body: Consumer<HeaderController>(
        builder: (context, controller, child) {
          return SingleChildScrollView(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const LearningBanner(
                  title: 'LEARNING: HTTP Request Headers & API Keys',
                  description:
                      'Headers pass metadata (API Keys, Client Versions, Content Types, Accept headers) alongside HTTP requests without putting them in the URL or Body.',
                  keyConcepts: ['X-API-Key', 'Options(headers: {...})', 'Echo Headers', 'Accept Content-Type'],
                ),

                // 1. API Key Test Section
                Card(
                  child: Padding(
                    padding: const EdgeInsets.all(16),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text('1. API Key Verification (GET /secure/data)', style: GoogleFonts.poppins(fontSize: 14, fontWeight: FontWeight.bold)),
                        const SizedBox(height: 8),
                        Text('Valid key: practice-api-key-2024', style: GoogleFonts.inter(fontSize: 12, color: AppColors.textSecondary)),
                        const SizedBox(height: 10),
                        CustomTextField(
                          controller: _apiKeyController,
                          label: 'X-API-Key Header Value',
                          prefixIcon: Icons.key_rounded,
                        ),
                        const SizedBox(height: 12),
                        Row(
                          children: [
                            Expanded(
                              child: CustomButton(
                                label: 'Send Valid Key',
                                isLoading: controller.isLoading,
                                onPressed: () {
                                  controller.fetchSecureDataWithApiKey(_apiKeyController.text.trim());
                                },
                              ),
                            ),
                            const SizedBox(width: 8),
                            Expanded(
                              child: CustomButton(
                                label: 'Send Invalid Key',
                                color: AppColors.error,
                                isOutlined: true,
                                onPressed: () {
                                  controller.fetchSecureDataWithApiKey('invalid-key-999');
                                },
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                ),

                const SizedBox(height: 14),

                // 2. Echo Headers Section
                Card(
                  child: Padding(
                    padding: const EdgeInsets.all(16),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text('2. Inspect Server Echoed Headers (GET /headers/echo)', style: GoogleFonts.poppins(fontSize: 14, fontWeight: FontWeight.bold)),
                        const SizedBox(height: 8),
                        Text('Attaches X-Flutter-Version and X-Client-Platform headers.', style: GoogleFonts.inter(fontSize: 12, color: AppColors.textSecondary)),
                        const SizedBox(height: 12),
                        CustomButton(
                          label: 'Trigger Header Echo Request',
                          isOutlined: true,
                          icon: Icons.alt_route_rounded,
                          onPressed: () => controller.fetchHeadersEcho(),
                        ),
                      ],
                    ),
                  ),
                ),

                const SizedBox(height: 14),

                // 3. Custom Headers Section
                Card(
                  child: Padding(
                    padding: const EdgeInsets.all(16),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text('3. Custom Metadata Headers (POST /headers/custom)', style: GoogleFonts.poppins(fontSize: 14, fontWeight: FontWeight.bold)),
                        const SizedBox(height: 10),
                        CustomTextField(controller: _customHeaderController, label: 'X-Custom-Header'),
                        const SizedBox(height: 12),
                        CustomButton(
                          label: 'Send Custom Headers',
                          onPressed: () {
                            controller.sendCustomHeaders(
                              customHeaderValue: _customHeaderController.text.trim(),
                              appVersion: '1.0.0+1',
                            );
                          },
                        ),
                      ],
                    ),
                  ),
                ),

                const SizedBox(height: 16),

                if (controller.isLoading) const LoadingIndicator(message: 'Sending Headers Request...'),
                if (controller.errorMessage != null) ErrorDisplay(error: controller.errorMessage, onRetry: () {}),

                if (controller.lastRawResponse != null)
                  ResponseCard(title: 'Server Response & Received Headers', jsonResponse: controller.lastRawResponse),
              ],
            ),
          );
        },
      ),
    );
  }
}
