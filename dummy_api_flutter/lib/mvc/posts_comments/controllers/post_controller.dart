import 'package:flutter/foundation.dart';
import '../../../core/constants/api_endpoints.dart';
import '../../../core/network/api_client.dart';
import '../models/post_model.dart';

// LEARNING: Posts & Comments Controller
// Manages relational endpoints, like toggles, nested comments, and post creation.

class PostController extends ChangeNotifier {
  final ApiClient _apiClient = ApiClient();

  bool _isLoading = false;
  String? _errorMessage;
  List<PostModel> _posts = [];
  PostModel? _selectedPost;
  dynamic _lastRawResponse;

  bool get isLoading => _isLoading;
  String? get errorMessage => _errorMessage;
  List<PostModel> get posts => _posts;
  PostModel? get selectedPost => _selectedPost;
  dynamic get lastRawResponse => _lastRawResponse;

  void _setLoading(bool loading) {
    _isLoading = loading;
    notifyListeners();
  }

  void _setError(String? error) {
    _errorMessage = error;
    notifyListeners();
  }

  // ---------------------------------------------------------------------------
  // 1. GET /api/posts
  // Description: Fetch all posts array
  // URL: http://10.0.2.2:3000/api/posts
  // ---------------------------------------------------------------------------
  Future<void> fetchPosts() async {
    _setLoading(true);
    _setError(null);

    try {
      final response = await _apiClient.get<List<PostModel>>(
        ApiEndpoints.posts,
        createData: (jsonList) {
          if (jsonList is List) {
            return jsonList.map((item) => PostModel.fromJson(item as Map<String, dynamic>)).toList();
          }
          return [];
        },
      );

      _lastRawResponse = {'endpoint': 'GET /posts', 'count': response.data?.length, 'response': response.data?.map((p) => p.toJson()).toList()};

      if (response.success && response.data != null) {
        _posts = response.data!;
      } else {
        _setError(response.error?.message ?? 'Failed to load posts.');
      }
    } catch (e) {
      _setError(e.toString());
    } finally {
      _setLoading(false);
    }
  }

  // ---------------------------------------------------------------------------
  // 2. GET /api/posts/:id
  // Description: Fetch detailed post with nested comments
  // URL: http://10.0.2.2:3000/api/posts/1
  // ---------------------------------------------------------------------------
  Future<void> fetchPostById(int id) async {
    _setLoading(true);
    _setError(null);

    try {
      final response = await _apiClient.get<PostModel>(
        ApiEndpoints.postById(id),
        createData: (json) => PostModel.fromJson(json as Map<String, dynamic>),
      );

      _lastRawResponse = {'endpoint': 'GET /posts/$id', 'response': response.data?.toJson()};

      if (response.success && response.data != null) {
        _selectedPost = response.data;
      } else {
        _setError(response.error?.message ?? 'Post not found.');
      }
    } catch (e) {
      _setError(e.toString());
    } finally {
      _setLoading(false);
    }
  }

  // ---------------------------------------------------------------------------
  // 3. POST /api/posts
  // Description: Create new post
  // URL: http://10.0.2.2:3000/api/posts
  // ---------------------------------------------------------------------------
  Future<bool> createPost({required String title, required String content, required List<String> tags}) async {
    _setLoading(true);
    _setError(null);

    try {
      final response = await _apiClient.post<PostModel>(
        ApiEndpoints.posts,
        data: {'title': title, 'content': content, 'tags': tags},
        createData: (json) => PostModel.fromJson(json as Map<String, dynamic>),
      );

      _lastRawResponse = {'endpoint': 'POST /posts', 'response': response.data?.toJson()};

      if (response.success && response.data != null) {
        _posts.insert(0, response.data!);
        notifyListeners();
        return true;
      } else {
        _setError(response.error?.message ?? 'Failed to create post.');
        return false;
      }
    } catch (e) {
      _setError(e.toString());
      return false;
    } finally {
      _setLoading(false);
    }
  }

  // ---------------------------------------------------------------------------
  // 4. POST /api/posts/:id/comments
  // Description: Add nested comment to post
  // URL: http://10.0.2.2:3000/api/posts/1/comments
  // Body: { "text": "Awesome post!", "author": "Alice" }
  // ---------------------------------------------------------------------------
  Future<bool> addComment(int postId, {required String text, required String author}) async {
    try {
      final response = await _apiClient.post<CommentModel>(
        ApiEndpoints.postComments(postId),
        data: {'text': text, 'author': author},
        createData: (json) => CommentModel.fromJson(json as Map<String, dynamic>),
      );

      if (response.success && response.data != null) {
        if (_selectedPost != null && _selectedPost!.id == postId) {
          _selectedPost!.comments.add(response.data!);
          notifyListeners();
        }
        return true;
      }
      return false;
    } catch (e) {
      _setError(e.toString());
      return false;
    }
  }

  // ---------------------------------------------------------------------------
  // 5. POST /api/posts/:id/like
  // Description: Increment post like counter
  // URL: http://10.0.2.2:3000/api/posts/1/like
  // ---------------------------------------------------------------------------
  Future<void> likePost(int postId) async {
    try {
      final response = await _apiClient.post<dynamic>(
        ApiEndpoints.postLike(postId),
      );

      if (response.success) {
        final index = _posts.indexWhere((p) => p.id == postId);
        if (index != -1) {
          final updatedLikes = response.data['likes'] ?? (_posts[index].likes + 1);
          _posts[index] = PostModel(
            id: _posts[index].id,
            title: _posts[index].title,
            content: _posts[index].content,
            author: _posts[index].author,
            tags: _posts[index].tags,
            likes: updatedLikes,
            comments: _posts[index].comments,
            createdAt: _posts[index].createdAt,
          );
          notifyListeners();
        }
      }
    } catch (e) {
      print('Error liking post: $e');
    }
  }
}
