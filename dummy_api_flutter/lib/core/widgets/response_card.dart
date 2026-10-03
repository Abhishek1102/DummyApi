import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:google_fonts/google_fonts.dart';
import '../constants/app_colors.dart';

// LEARNING: Raw Response Inspector Card
// Renders readable, formatted JSON responses returned by API endpoints.

class ResponseCard extends StatelessWidget {
  final String title;
  final dynamic jsonResponse;
  final int? statusCode;

  const ResponseCard({
    super.key,
    required this.title,
    required this.jsonResponse,
    this.statusCode,
  });

  String _prettyJson(dynamic data) {
    if (data == null) return 'null';
    try {
      if (data is Map || data is List) {
        const encoder = JsonEncoder.withIndent('  ');
        return encoder.convert(data);
      }
      return data.toString();
    } catch (_) {
      return data.toString();
    }
  }

  @override
  Widget build(BuildContext context) {
    final formatted = _prettyJson(jsonResponse);

    return Card(
      margin: const EdgeInsets.symmetric(vertical: 8),
      child: Padding(
        padding: const EdgeInsets.all(14),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                const Icon(Icons.code_rounded, color: AppColors.primary, size: 18),
                const SizedBox(width: 8),
                Text(
                  title,
                  style: GoogleFonts.poppins(
                    fontSize: 13,
                    fontWeight: FontWeight.bold,
                    color: AppColors.textPrimary,
                  ),
                ),
                if (statusCode != null) ...[
                  const SizedBox(width: 8),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                    decoration: BoxDecoration(
                      color: statusCode! < 400 ? AppColors.badgeGreen : AppColors.badgeRed,
                      borderRadius: BorderRadius.circular(4),
                    ),
                    child: Text(
                      'HTTP $statusCode',
                      style: GoogleFonts.poppins(
                        fontSize: 10,
                        fontWeight: FontWeight.bold,
                        color: statusCode! < 400 ? AppColors.success : AppColors.error,
                      ),
                    ),
                  ),
                ],
                const Spacer(),
                IconButton(
                  icon: const Icon(Icons.copy_rounded, size: 16),
                  onPressed: () {
                    Clipboard.setData(ClipboardData(text: formatted));
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(
                        content: Text('Response JSON copied!'),
                        duration: Duration(seconds: 1),
                      ),
                    );
                  },
                  tooltip: 'Copy JSON',
                ),
              ],
            ),
            const SizedBox(height: 8),
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: const Color(0xFF1E1E1E), // Dark theme JSON view
                borderRadius: BorderRadius.circular(8),
              ),
              child: SelectableText(
                formatted,
                style: GoogleFonts.firaCode(
                  fontSize: 12,
                  color: const Color(0xFFCE9178), // Warm JSON text highlight color
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
