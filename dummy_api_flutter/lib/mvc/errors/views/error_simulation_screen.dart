import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../../core/constants/api_endpoints.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/widgets/learning_banner.dart';
import '../../../core/widgets/loading_indicator.dart';
import '../../../core/widgets/error_display.dart';
import '../../../core/widgets/response_card.dart';
import '../controllers/error_simulation_controller.dart';

// LEARNING: Error Handling Laboratory View
// Allows developers to intentionally trigger 400, 401, 403, 404, 500, and Timeout errors to inspect error rendering logic.

class ErrorSimulationScreen extends StatelessWidget {
  const ErrorSimulationScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Module 8: Error Simulation'),
      ),
      body: Consumer<ErrorSimulationController>(
        builder: (context, controller, child) {
          return SingleChildScrollView(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const LearningBanner(
                  title: 'LEARNING: Professional HTTP Error Handling',
                  description:
                      'Test how your Flutter app gracefully handles bad user inputs (400), expired credentials (401), access forbidden (403), missing resources (404), server crashes (500), and network timeouts.',
                  keyConcepts: ['400 Bad Request', '401 Unauthorized', '403 Forbidden', '404 Not Found', '500 Server Error', 'Timeout'],
                ),

                Text('Trigger Specific HTTP Exceptions:', style: GoogleFonts.poppins(fontSize: 15, fontWeight: FontWeight.bold)),
                const SizedBox(height: 12),

                // Error Buttons Grid
                GridView.count(
                  crossAxisCount: 2,
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
                  crossAxisSpacing: 10,
                  mainAxisSpacing: 10,
                  childAspectRatio: 2.3,
                  children: [
                    _buildErrorButton('Trigger HTTP 400', 'Bad Request', AppColors.warning, () {
                      controller.triggerErrorEndpoint(ApiEndpoints.error400);
                    }),
                    _buildErrorButton('Trigger HTTP 401', 'Unauthorized', AppColors.error, () {
                      controller.triggerErrorEndpoint(ApiEndpoints.error401);
                    }),
                    _buildErrorButton('Trigger HTTP 403', 'Forbidden', AppColors.error, () {
                      controller.triggerErrorEndpoint(ApiEndpoints.error403);
                    }),
                    _buildErrorButton('Trigger HTTP 404', 'Not Found', AppColors.warning, () {
                      controller.triggerErrorEndpoint(ApiEndpoints.error404);
                    }),
                    _buildErrorButton('Trigger HTTP 500', 'Server Error', AppColors.error, () {
                      controller.triggerErrorEndpoint(ApiEndpoints.error500);
                    }),
                    _buildErrorButton('Trigger Timeout', 'Connect Timeout', AppColors.warning, () {
                      controller.triggerErrorEndpoint(ApiEndpoints.errorTimeout);
                    }),
                  ],
                ),

                const SizedBox(height: 20),

                if (controller.isLoading) const LoadingIndicator(message: 'Simulating Backend Error...'),

                // Display Rendered Error Widget
                if (controller.caughtException != null) ...[
                  Text('Rendered UI Exception State:', style: GoogleFonts.poppins(fontSize: 14, fontWeight: FontWeight.bold)),
                  const SizedBox(height: 8),
                  Card(
                    child: Padding(
                      padding: const EdgeInsets.all(12),
                      child: ErrorDisplay(
                        error: controller.caughtException,
                        onRetry: () {},
                      ),
                    ),
                  ),
                  const SizedBox(height: 16),
                ],

                if (controller.lastRawResponse != null)
                  ResponseCard(title: 'Caught Error Payload & Exception Type', jsonResponse: controller.lastRawResponse),
              ],
            ),
          );
        },
      ),
    );
  }

  Widget _buildErrorButton(String title, String subtitle, Color color, VoidCallback onPressed) {
    return ElevatedButton(
      style: ElevatedButton.styleFrom(
        backgroundColor: color.withOpacity(0.1),
        foregroundColor: color,
        side: BorderSide(color: color, width: 1.2),
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
      ),
      onPressed: onPressed,
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Text(title, style: GoogleFonts.poppins(fontSize: 12, fontWeight: FontWeight.bold)),
          Text(subtitle, style: GoogleFonts.inter(fontSize: 10)),
        ],
      ),
    );
  }
}
