import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/widgets/learning_banner.dart';
import '../../../core/widgets/loading_indicator.dart';
import '../../../core/widgets/error_display.dart';
import '../../../core/widgets/response_card.dart';
import '../../../core/widgets/custom_text_field.dart';
import '../controllers/post_controller.dart';

// LEARNING: Post Detail & Nested Comments View
// Demonstrates loading single post detail (`GET /api/posts/:id`) and submitting nested comments (`POST /api/posts/:id/comments`).

class PostDetailScreen extends StatefulWidget {
  final int postId;

  const PostDetailScreen({super.key, required this.postId});

  @override
  State<PostDetailScreen> createState() => _PostDetailScreenState();
}

class _PostDetailScreenState extends State<PostDetailScreen> {
  final _commentController = TextEditingController();
  final _authorController = TextEditingController(text: 'Student Learner');

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<PostController>().fetchPostById(widget.postId);
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Post #${widget.postId} Discussion'),
      ),
      body: Consumer<PostController>(
        builder: (context, controller, child) {
          if (controller.isLoading) {
            return const LoadingIndicator(message: 'Loading Post & Comments...');
          }

          if (controller.errorMessage != null) {
            return ErrorDisplay(error: controller.errorMessage, onRetry: () => controller.fetchPostById(widget.postId));
          }

          final post = controller.selectedPost;
          if (post == null) return const Center(child: Text('Post not found.'));

          return SingleChildScrollView(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                LearningBanner(
                  title: 'LEARNING: Nested Resource Data',
                  description: 'GET /api/posts/${post.id} returns nested comments array. POST /api/posts/${post.id}/comments appends new comment entries.',
                  keyConcepts: ['Nested JSON Arrays', 'POST /posts/:id/comments'],
                ),

                // Post Content
                Card(
                  child: Padding(
                    padding: const EdgeInsets.all(16),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(post.title, style: GoogleFonts.poppins(fontSize: 18, fontWeight: FontWeight.bold)),
                        const SizedBox(height: 6),
                        Text('Published by ${post.author}', style: GoogleFonts.inter(fontSize: 12, color: AppColors.textSecondary)),
                        const SizedBox(height: 12),
                        Text(post.content, style: GoogleFonts.inter(fontSize: 14, height: 1.5)),
                      ],
                    ),
                  ),
                ),

                const SizedBox(height: 20),

                // Comments Section
                Text('Comments (${post.comments.length})', style: GoogleFonts.poppins(fontSize: 16, fontWeight: FontWeight.bold)),
                const SizedBox(height: 10),

                // Comment Form
                Row(
                  children: [
                    Expanded(
                      child: CustomTextField(
                        controller: _commentController,
                        label: 'Write a comment...',
                      ),
                    ),
                    const SizedBox(width: 8),
                    IconButton.filled(
                      icon: const Icon(Icons.send),
                      onPressed: () async {
                        if (_commentController.text.trim().isNotEmpty) {
                          final success = await controller.addComment(
                            post.id,
                            text: _commentController.text.trim(),
                            author: _authorController.text.trim(),
                          );
                          if (success) {
                            _commentController.clear();
                          }
                        }
                      },
                    ),
                  ],
                ),

                const SizedBox(height: 16),

                // Comments List
                if (post.comments.isEmpty)
                  Text('No comments yet. Be the first!', style: GoogleFonts.inter(color: AppColors.textSecondary))
                else
                  ListView.separated(
                    shrinkWrap: true,
                    physics: const NeverScrollableScrollPhysics(),
                    itemCount: post.comments.length,
                    separatorBuilder: (c, i) => const SizedBox(height: 8),
                    itemBuilder: (context, index) {
                      final c = post.comments[index];
                      return Container(
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(8),
                          border: Border.all(color: AppColors.border),
                        ),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(c.author, style: GoogleFonts.poppins(fontSize: 12, fontWeight: FontWeight.bold, color: AppColors.primary)),
                            const SizedBox(height: 2),
                            Text(c.text, style: GoogleFonts.inter(fontSize: 13)),
                          ],
                        ),
                      );
                    },
                  ),

                const SizedBox(height: 16),

                if (controller.lastRawResponse != null)
                  ResponseCard(title: 'Post Detail JSON', jsonResponse: controller.lastRawResponse),
              ],
            ),
          );
        },
      ),
    );
  }
}
