import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/widgets/learning_banner.dart';
import '../../../core/widgets/loading_indicator.dart';
import '../../../core/widgets/error_display.dart';
import '../../../core/widgets/response_card.dart';
import '../../../core/widgets/custom_button.dart';
import '../controllers/advanced_controller.dart';

// LEARNING: Advanced Scenarios View
// Demonstrates delayed responses, urlencoded form-data, custom HTTP status code simulation, rate limiting, and large dataset handling.

class AdvancedScreen extends StatelessWidget {
  const AdvancedScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Module 7: Advanced Scenarios'),
      ),
      body: Consumer<AdvancedController>(
        builder: (context, controller, child) {
          return SingleChildScrollView(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const LearningBanner(
                  title: 'LEARNING: Complex Network Edge Cases',
                  description:
                      'Covers real-world production challenges: handling artificial backend latency, URL-encoded forms, rate limit (HTTP 429) backoffs, and strict field validation errors.',
                  keyConcepts: ['Delayed Responses', 'UrlEncoded Body', 'HTTP 429 Rate Limit', 'Field Validation Errors'],
                ),

                // Delayed & Latency
                Card(
                  child: Padding(
                    padding: const EdgeInsets.all(16),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text('1. Simulated Latency (GET /advanced/delayed?delay=3)', style: GoogleFonts.poppins(fontSize: 14, fontWeight: FontWeight.bold)),
                        const SizedBox(height: 10),
                        CustomButton(
                          label: 'Trigger 3-Second Delayed Request',
                          icon: Icons.timer_outlined,
                          onPressed: () => controller.fetchDelayedResponse(3),
                        ),
                      ],
                    ),
                  ),
                ),

                const SizedBox(height: 12),

                // Random Error Test
                Card(
                  child: Padding(
                    padding: const EdgeInsets.all(16),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text('2. Intermittent Error Simulation (GET /advanced/random-error)', style: GoogleFonts.poppins(fontSize: 14, fontWeight: FontWeight.bold)),
                        const SizedBox(height: 10),
                        CustomButton(
                          label: 'Trigger Random 500 Error Test',
                          isOutlined: true,
                          icon: Icons.shuffle_rounded,
                          onPressed: () => controller.fetchRandomError(),
                        ),
                      ],
                    ),
                  ),
                ),

                const SizedBox(height: 12),

                // UrlEncoded Form Data
                Card(
                  child: Padding(
                    padding: const EdgeInsets.all(16),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text('3. URL-Encoded Form (POST /advanced/form-data)', style: GoogleFonts.poppins(fontSize: 14, fontWeight: FontWeight.bold)),
                        const SizedBox(height: 6),
                        Text('Content-Type: application/x-www-form-urlencoded', style: GoogleFonts.inter(fontSize: 12, color: AppColors.textSecondary)),
                        const SizedBox(height: 10),
                        CustomButton(
                          label: 'Submit UrlEncoded Payload',
                          onPressed: () => controller.sendFormUrlEncoded('sampleKey', 'sampleValue'),
                        ),
                      ],
                    ),
                  ),
                ),

                const SizedBox(height: 12),

                // Custom HTTP Status Codes
                Card(
                  child: Padding(
                    padding: const EdgeInsets.all(16),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text('4. Custom HTTP Status Codes (GET /advanced/status/:code)', style: GoogleFonts.poppins(fontSize: 14, fontWeight: FontWeight.bold)),
                        const SizedBox(height: 10),
                        Wrap(
                          spacing: 8,
                          children: [201, 202, 204, 429].map((code) {
                            return OutlinedButton(
                              onPressed: () => controller.fetchStatus(code),
                              child: Text('HTTP $code'),
                            );
                          }).toList(),
                        ),
                      ],
                    ),
                  ),
                ),

                const SizedBox(height: 12),

                // Validation Error Test
                Card(
                  child: Padding(
                    padding: const EdgeInsets.all(16),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text('5. Strict Validation Details (POST /advanced/validate)', style: GoogleFonts.poppins(fontSize: 14, fontWeight: FontWeight.bold)),
                        const SizedBox(height: 10),
                        Row(
                          children: [
                            Expanded(
                              child: CustomButton(
                                label: 'Submit Invalid Form',
                                color: AppColors.warning,
                                onPressed: () => controller.submitValidationTest(email: 'not-an-email', age: -5),
                              ),
                            ),
                            const SizedBox(width: 8),
                            Expanded(
                              child: CustomButton(
                                label: 'Submit Valid Form',
                                onPressed: () => controller.submitValidationTest(email: 'valid@example.com', age: 25),
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                ),

                const SizedBox(height: 16),

                if (controller.isLoading) const LoadingIndicator(message: 'Executing Advanced API Operation...'),
                if (controller.errorMessage != null) ErrorDisplay(error: controller.errorMessage, onRetry: () {}),

                if (controller.lastRawResponse != null)
                  ResponseCard(title: 'Advanced API Response JSON', jsonResponse: controller.lastRawResponse),
              ],
            ),
          );
        },
      ),
    );
  }
}
