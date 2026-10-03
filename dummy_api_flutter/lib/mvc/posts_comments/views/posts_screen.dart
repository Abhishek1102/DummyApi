import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/widgets/learning_banner.dart';
import '../../../core/widgets/loading_indicator.dart';
import '../../../core/widgets/error_display.dart';
import '../../../core/widgets/empty_state.dart';
import '../../../core/widgets/response_card.dart';
import '../../../core/widgets/custom_button.dart';
import '../../../core/widgets/custom_text_field.dart';
import '../controllers/post_controller.dart';
import 'post_detail_screen.dart';

// LEARNING: Posts List View
// Demonstrates displaying relational resources with nested counts (Comments, Likes).

class PostsScreen extends StatefulWidget {
  const PostsScreen({super.key});

  @override
  State<PostsScreen> createState() => _PostsScreenState();
}

class _PostsScreenState extends State<PostsScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<PostController>().fetchPosts();
    });
  }

  void _showCreatePostModal(BuildContext context) {
    final titleController = TextEditingController();
    final contentController = TextEditingController();
    final tagsController = TextEditingController(text: 'flutter, api, rest');

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
            Text('Create New Post (POST /api/posts)', style: GoogleFonts.poppins(fontSize: 16, fontWeight: FontWeight.bold)),
            const SizedBox(height: 12),
            CustomTextField(controller: titleController, label: 'Title'),
            const SizedBox(height: 10),
            CustomTextField(controller: contentController, label: 'Content', maxLines: 3),
            const SizedBox(height: 10),
            CustomTextField(controller: tagsController, label: 'Tags (comma separated)'),
            const SizedBox(height: 20),
            Consumer<PostController>(
              builder: (context, controller, child) {
                return CustomButton(
                  label: 'Publish Post',
                  isLoading: controller.isLoading,
                  onPressed: () async {
                    final tags = tagsController.text.split(',').map((t) => t.trim()).toList();
                    final success = await controller.createPost(
                      title: titleController.text.trim(),
                      content: contentController.text.trim(),
                      tags: tags,
                    );
                    if (success && context.mounted) {
                      Navigator.pop(bContext);
                      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Post published!')));
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
    return Scaffold(
      appBar: AppBar(
        title: const Text('Module 6: Posts & Comments'),
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () => _showCreatePostModal(context),
        backgroundColor: AppColors.primary,
        icon: const Icon(Icons.edit, color: Colors.white),
        label: const Text('New Post', style: TextStyle(color: Colors.white)),
      ),
      body: Consumer<PostController>(
        builder: (context, controller, child) {
          return SingleChildScrollView(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const LearningBanner(
                  title: 'LEARNING: Nested JSON & Relational Endpoints',
                  description:
                      'Demonstrates relational JSON payloads: Posts containing nested comments arrays (`List<CommentModel>`), plus nested actions like `/posts/:id/like` and `/posts/:id/comments`.',
                  keyConcepts: ['GET /posts', 'POST /posts/:id/comments', 'POST /posts/:id/like', 'Nested Deserialization'],
                ),

                if (controller.isLoading && controller.posts.isEmpty)
                  const LoadingIndicator(message: 'Loading Posts...')
                else if (controller.errorMessage != null && controller.posts.isEmpty)
                  ErrorDisplay(error: controller.errorMessage, onRetry: () => controller.fetchPosts())
                else if (controller.posts.isEmpty)
                  const EmptyState(message: 'No posts found.')
                else
                  ListView.separated(
                    shrinkWrap: true,
                    physics: const NeverScrollableScrollPhysics(),
                    padding: const EdgeInsets.symmetric(horizontal: 16),
                    itemCount: controller.posts.length,
                    separatorBuilder: (c, i) => const SizedBox(height: 12),
                    itemBuilder: (context, index) {
                      final post = controller.posts[index];
                      return Card(
                        child: Padding(
                          padding: const EdgeInsets.all(16),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(post.title, style: GoogleFonts.poppins(fontSize: 16, fontWeight: FontWeight.bold)),
                              const SizedBox(height: 4),
                              Text('By ${post.author}', style: GoogleFonts.inter(fontSize: 12, color: AppColors.textSecondary)),
                              const SizedBox(height: 8),
                              Text(post.content, maxLines: 2, overflow: TextOverflow.ellipsis, style: GoogleFonts.inter(fontSize: 13)),
                              const SizedBox(height: 12),
                              Row(
                                children: [
                                  IconButton(
                                    icon: const Icon(Icons.thumb_up_alt_outlined, color: AppColors.primary, size: 20),
                                    onPressed: () => controller.likePost(post.id),
                                  ),
                                  Text('${post.likes} Likes', style: GoogleFonts.inter(fontSize: 12, fontWeight: FontWeight.w600)),
                                  const SizedBox(width: 16),
                                  const Icon(Icons.comment_outlined, color: AppColors.textSecondary, size: 20),
                                  const SizedBox(width: 4),
                                  Text('${post.comments.length} Comments', style: GoogleFonts.inter(fontSize: 12, color: AppColors.textSecondary)),
                                  const Spacer(),
                                  TextButton(
                                    onPressed: () {
                                      Navigator.push(
                                        context,
                                        MaterialPageRoute(builder: (_) => PostDetailScreen(postId: post.id)),
                                      );
                                    },
                                    child: const Text('View Comments'),
                                  ),
                                ],
                              ),
                            ],
                          ),
                        ),
                      );
                    },
                  ),

                const SizedBox(height: 16),

                if (controller.lastRawResponse != null)
                  Padding(
                    padding: const EdgeInsets.all(16),
                    child: ResponseCard(title: 'Posts Response JSON', jsonResponse: controller.lastRawResponse),
                  ),

                const SizedBox(height: 80),
              ],
            ),
          );
        },
      ),
    );
  }
}
