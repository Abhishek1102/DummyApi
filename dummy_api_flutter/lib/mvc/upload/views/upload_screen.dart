import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:image_picker/image_picker.dart';
import 'package:file_picker/file_picker.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/widgets/learning_banner.dart';
import '../../../core/widgets/loading_indicator.dart';
import '../../../core/widgets/error_display.dart';
import '../../../core/widgets/response_card.dart';
import '../../../core/widgets/custom_button.dart';
import '../../../core/widgets/custom_text_field.dart';
import '../controllers/upload_controller.dart';

// LEARNING: File Upload & Multipart Form View
// Demonstrates picking single/multiple files and submitting via `Dio` `FormData` and `MultipartFile`.

class UploadScreen extends StatefulWidget {
  const UploadScreen({super.key});

  @override
  State<UploadScreen> createState() => _UploadScreenState();
}

class _UploadScreenState extends State<UploadScreen> {
  final ImagePicker _picker = ImagePicker();
  final _nameController = TextEditingController(text: 'John Doe');
  final _emailController = TextEditingController(text: 'john@example.com');

  Future<void> _pickAndUploadSingleImage(BuildContext context) async {
    final XFile? file = await _picker.pickImage(source: ImageSource.gallery);
    if (file != null && context.mounted) {
      final controller = context.read<UploadController>();
      await controller.uploadSingleImage(file.path);
    }
  }

  Future<void> _pickAndUploadMultipleImages(BuildContext context) async {
    final List<XFile> files = await _picker.pickMultiImage();
    if (files.isNotEmpty && context.mounted) {
      final paths = files.map((f) => f.path).toList();
      final controller = context.read<UploadController>();
      await controller.uploadMultipleImages(paths);
    }
  }

  Future<void> _pickAndUploadDocument(BuildContext context) async {
    final result = await FilePicker.platform.pickFiles();
    if (result != null && result.files.single.path != null && context.mounted) {
      final controller = context.read<UploadController>();
      await controller.uploadDocument(result.files.single.path!);
    }
  }

  Future<void> _pickAndUploadAvatarWithData(BuildContext context) async {
    final XFile? file = await _picker.pickImage(source: ImageSource.gallery);
    if (file != null && context.mounted) {
      final controller = context.read<UploadController>();
      await controller.uploadAvatarWithData(
        filePath: file.path,
        name: _nameController.text.trim(),
        email: _emailController.text.trim(),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Module 5: File Upload & Download'),
      ),
      body: Consumer<UploadController>(
        builder: (context, controller, child) {
          return SingleChildScrollView(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const LearningBanner(
                  title: 'LEARNING: Multipart Form Data & File Uploads',
                  description:
                      'Binary files (Images, PDFs, Videos) are transmitted using `FormData` instead of standard JSON. Dio handles binary chunking and progress reporting.',
                  keyConcepts: ['FormData.fromMap()', 'MultipartFile.fromFile()', 'onSendProgress', 'Mixed Text + Binary'],
                ),

                // Upload Cards Grid / Options
                Card(
                  child: Padding(
                    padding: const EdgeInsets.all(16),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text('1. Single Image Upload (POST /upload/single)', style: GoogleFonts.poppins(fontSize: 14, fontWeight: FontWeight.bold)),
                        const SizedBox(height: 6),
                        Text('Selects one image file and uploads to server.', style: GoogleFonts.inter(fontSize: 12, color: AppColors.textSecondary)),
                        const SizedBox(height: 10),
                        CustomButton(
                          label: 'Pick & Upload Image',
                          icon: Icons.image_rounded,
                          onPressed: () => _pickAndUploadSingleImage(context),
                        ),
                      ],
                    ),
                  ),
                ),

                const SizedBox(height: 12),

                Card(
                  child: Padding(
                    padding: const EdgeInsets.all(16),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text('2. Multiple Files Batch Upload (POST /upload/multiple)', style: GoogleFonts.poppins(fontSize: 14, fontWeight: FontWeight.bold)),
                        const SizedBox(height: 6),
                        Text('Selects multiple images and sends array of MultipartFiles.', style: GoogleFonts.inter(fontSize: 12, color: AppColors.textSecondary)),
                        const SizedBox(height: 10),
                        CustomButton(
                          label: 'Pick Batch Images',
                          isOutlined: true,
                          icon: Icons.collections_rounded,
                          onPressed: () => _pickAndUploadMultipleImages(context),
                        ),
                      ],
                    ),
                  ),
                ),

                const SizedBox(height: 12),

                Card(
                  child: Padding(
                    padding: const EdgeInsets.all(16),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text('3. Document Upload (POST /upload/document)', style: GoogleFonts.poppins(fontSize: 14, fontWeight: FontWeight.bold)),
                        const SizedBox(height: 6),
                        Text('Uploads PDF, TXT, or DOC file.', style: GoogleFonts.inter(fontSize: 12, color: AppColors.textSecondary)),
                        const SizedBox(height: 10),
                        CustomButton(
                          label: 'Pick Document',
                          isOutlined: true,
                          icon: Icons.picture_as_pdf_rounded,
                          onPressed: () => _pickAndUploadDocument(context),
                        ),
                      ],
                    ),
                  ),
                ),

                const SizedBox(height: 12),

                Card(
                  child: Padding(
                    padding: const EdgeInsets.all(16),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text('4. Mixed Form: Text + Avatar (POST /upload/avatar-with-data)', style: GoogleFonts.poppins(fontSize: 14, fontWeight: FontWeight.bold)),
                        const SizedBox(height: 10),
                        CustomTextField(controller: _nameController, label: 'Name'),
                        const SizedBox(height: 8),
                        CustomTextField(controller: _emailController, label: 'Email'),
                        const SizedBox(height: 12),
                        CustomButton(
                          label: 'Pick Avatar & Submit Form',
                          icon: Icons.account_circle_rounded,
                          onPressed: () => _pickAndUploadAvatarWithData(context),
                        ),
                      ],
                    ),
                  ),
                ),

                const SizedBox(height: 16),

                // Upload Progress Bar
                if (controller.isLoading) ...[
                  LoadingIndicator(message: 'Uploading File... (${(controller.uploadProgress * 100).toStringAsFixed(0)}%)'),
                  LinearProgressIndicator(value: controller.uploadProgress, color: AppColors.primary),
                  const SizedBox(height: 16),
                ],

                if (controller.errorMessage != null) ErrorDisplay(error: controller.errorMessage, onRetry: () {}),

                if (controller.lastRawResponse != null)
                  ResponseCard(title: 'Server Upload Response Payload', jsonResponse: controller.lastRawResponse),
              ],
            ),
          );
        },
      ),
    );
  }
}
