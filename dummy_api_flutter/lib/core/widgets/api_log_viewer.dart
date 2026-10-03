import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:google_fonts/google_fonts.dart';
import '../constants/app_colors.dart';
import '../network/api_client.dart';

// LEARNING: Network Log Inspection Widget
// Allows learners to see exact HTTP request headers, body, status code, and response JSON in real time.

class ApiLogViewerSheet extends StatefulWidget {
  const ApiLogViewerSheet({super.key});

  static void show(BuildContext context) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => const ApiLogViewerSheet(),
    );
  }

  @override
  State<ApiLogViewerSheet> createState() => _ApiLogViewerSheetState();
}

class _ApiLogViewerSheetState extends State<ApiLogViewerSheet> {
  @override
  Widget build(BuildContext context) {
    final logs = ApiClient().logs;

    return Container(
      height: MediaQuery.of(context).size.height * 0.85,
      decoration: const BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      child: Column(
        children: [
          // Header
          Container(
            padding: const EdgeInsets.all(16),
            decoration: const BoxDecoration(
              border: Border(bottom: BorderSide(color: AppColors.border)),
            ),
            child: Row(
              children: [
                const Icon(Icons.bug_report_rounded, color: AppColors.primary),
                const SizedBox(width: 8),
                Text(
                  'Live API Network Logs (${logs.length})',
                  style: GoogleFonts.poppins(
                    fontSize: 16,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const Spacer(),
                IconButton(
                  icon: const Icon(Icons.delete_outline_rounded, color: AppColors.error),
                  onPressed: () {
                    setState(() {
                      ApiClient().clearLogs();
                    });
                  },
                  tooltip: 'Clear Logs',
                ),
                IconButton(
                  icon: const Icon(Icons.close),
                  onPressed: () => Navigator.pop(context),
                ),
              ],
            ),
          ),
          // Logs list
          Expanded(
            child: logs.isEmpty
                ? Center(
                    child: Text(
                      'No HTTP logs captured yet.\nPerform an API call to see traffic details!',
                      textAlign: TextAlign.center,
                      style: GoogleFonts.inter(color: AppColors.textSecondary),
                    ),
                  )
                : ListView.separated(
                    padding: const EdgeInsets.all(16),
                    itemCount: logs.length,
                    separatorBuilder: (c, i) => const SizedBox(height: 12),
                    itemBuilder: (context, index) {
                      final log = logs[index];
                      return _LogTile(log: log);
                    },
                  ),
          ),
        ],
      ),
    );
  }
}

class _LogTile extends StatelessWidget {
  final ApiLogEntry log;
  const _LogTile({required this.log});

  Color get _statusColor {
    if (log.isError || (log.statusCode != null && log.statusCode! >= 400)) {
      return AppColors.error;
    }
    return AppColors.success;
  }

  String _formatJson(dynamic json) {
    if (json == null) return 'null';
    try {
      if (json is Map || json is List) {
        const encoder = JsonEncoder.withIndent('  ');
        return encoder.convert(json);
      }
      return json.toString();
    } catch (_) {
      return json.toString();
    }
  }

  @override
  Widget build(BuildContext context) {
    return Card(
      child: ExpansionTile(
        key: PageStorageKey(log.timestamp.toIso8601String()),
        leading: Container(
          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
          decoration: BoxDecoration(
            color: _statusColor.withOpacity(0.1),
            borderRadius: BorderRadius.circular(6),
          ),
          child: Text(
            log.method,
            style: GoogleFonts.poppins(
              fontSize: 12,
              fontWeight: FontWeight.bold,
              color: _statusColor,
            ),
          ),
        ),
        title: Text(
          log.url,
          maxLines: 1,
          overflow: TextOverflow.ellipsis,
          style: GoogleFonts.inter(fontSize: 13, fontWeight: FontWeight.w600),
        ),
        subtitle: Text(
          'Status: ${log.statusCode ?? "Pending"} • ${log.timestamp.hour}:${log.timestamp.minute}:${log.timestamp.second}',
          style: GoogleFonts.inter(fontSize: 11, color: AppColors.textSecondary),
        ),
        children: [
          Padding(
            padding: const EdgeInsets.all(12),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                _buildSectionTitle('Headers', context, log.requestHeaders),
                _buildCodeBox(_formatJson(log.requestHeaders)),
                const SizedBox(height: 10),
                _buildSectionTitle('Request Data/Body', context, log.requestBody),
                _buildCodeBox(_formatJson(log.requestBody)),
                const SizedBox(height: 10),
                _buildSectionTitle('Response Body', context, log.responseBody),
                _buildCodeBox(_formatJson(log.responseBody)),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSectionTitle(String title, BuildContext context, dynamic content) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(
          title,
          style: GoogleFonts.poppins(fontSize: 12, fontWeight: FontWeight.bold, color: AppColors.primary),
        ),
        IconButton(
          icon: const Icon(Icons.copy_rounded, size: 16),
          onPressed: () {
            Clipboard.setData(ClipboardData(text: _formatJson(content)));
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(content: Text('$title copied to clipboard!'), duration: const Duration(seconds: 1)),
            );
          },
        ),
      ],
    );
  }

  Widget _buildCodeBox(String code) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(10),
      decoration: BoxDecoration(
        color: const Color(0xFF1E1E1E), // Dark code block
        borderRadius: BorderRadius.circular(8),
      ),
      child: SelectableText(
        code,
        style: GoogleFonts.firaCode(fontSize: 11, color: const Color(0xFFD4D4D4)),
      ),
    );
  }
}
