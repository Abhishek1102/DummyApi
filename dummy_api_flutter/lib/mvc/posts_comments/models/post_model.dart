// LEARNING: Nested JSON Deserialization Models
// Backend models often contain nested lists (e.g. `PostModel` contains `List<CommentModel>`).
// We safely map nested arrays using `.map((c) => CommentModel.fromJson(c))` in the parent model.

class CommentModel {
  final int id;
  final String text;
  final String author;
  final String createdAt;

  CommentModel({
    required this.id,
    required this.text,
    required this.author,
    required this.createdAt,
  });

  factory CommentModel.fromJson(Map<String, dynamic> json) {
    return CommentModel(
      id: json['id'] is int ? json['id'] : int.tryParse(json['id']?.toString() ?? '0') ?? 0,
      text: json['text'] as String? ?? '',
      author: json['author'] as String? ?? 'Anonymous',
      createdAt: json['createdAt'] as String? ?? '',
    );
  }

  Map<String, dynamic> toJson() => {'id': id, 'text': text, 'author': author, 'createdAt': createdAt};
}

class PostModel {
  final int id;
  final String title;
  final String content;
  final String author;
  final List<String> tags;
  final int likes;
  final List<CommentModel> comments;
  final String createdAt;

  PostModel({
    required this.id,
    required this.title,
    required this.content,
    required this.author,
    required this.tags,
    required this.likes,
    required this.comments,
    required this.createdAt,
  });

  factory PostModel.fromJson(Map<String, dynamic> json) {
    List<CommentModel> commentsList = [];
    if (json['comments'] != null && json['comments'] is List) {
      commentsList = (json['comments'] as List).map((c) => CommentModel.fromJson(c as Map<String, dynamic>)).toList();
    }

    List<String> tagsList = [];
    if (json['tags'] != null && json['tags'] is List) {
      tagsList = (json['tags'] as List).map((t) => t.toString()).toList();
    }

    return PostModel(
      id: json['id'] is int ? json['id'] : int.tryParse(json['id']?.toString() ?? '0') ?? 0,
      title: json['title'] as String? ?? '',
      content: json['content'] as String? ?? '',
      author: json['author'] as String? ?? 'Anonymous',
      tags: tagsList,
      likes: json['likes'] is int ? json['likes'] : int.tryParse(json['likes']?.toString() ?? '0') ?? 0,
      comments: commentsList,
      createdAt: json['createdAt'] as String? ?? '',
    );
  }

  Map<String, dynamic> toJson() => {
        'id': id,
        'title': title,
        'content': content,
        'author': author,
        'tags': tags,
        'likes': likes,
        'comments': comments.map((c) => c.toJson()).toList(),
      };
}
