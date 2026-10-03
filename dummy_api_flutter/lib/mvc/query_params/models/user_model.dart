// LEARNING: UserModel Data Class
// Represents user objects returned by `/api/users` with pagination metadata support.

class UserModel {
  final int id;
  final String name;
  final String email;
  final String role;
  final String avatar;
  final String status;

  UserModel({
    required this.id,
    required this.name,
    required this.email,
    required this.role,
    required this.avatar,
    required this.status,
  });

  factory UserModel.fromJson(Map<String, dynamic> json) {
    return UserModel(
      id: json['id'] is int ? json['id'] : int.tryParse(json['id']?.toString() ?? '0') ?? 0,
      name: json['name'] as String? ?? 'User',
      email: json['email'] as String? ?? '',
      role: json['role'] as String? ?? 'user',
      avatar: json['avatar'] as String? ?? '',
      status: json['status'] as String? ?? 'active',
    );
  }

  Map<String, dynamic> toJson() => {
        'id': id,
        'name': name,
        'email': email,
        'role': role,
        'avatar': avatar,
        'status': status,
      };
}

class PaginationMeta {
  final int page;
  final int limit;
  final int total;
  final int totalPages;

  PaginationMeta({
    required this.page,
    required this.limit,
    required this.total,
    required this.totalPages,
  });

  factory PaginationMeta.fromJson(Map<String, dynamic> json) {
    return PaginationMeta(
      page: json['page'] is int ? json['page'] : int.tryParse(json['page']?.toString() ?? '1') ?? 1,
      limit: json['limit'] is int ? json['limit'] : int.tryParse(json['limit']?.toString() ?? '10') ?? 10,
      total: json['total'] is int ? json['total'] : int.tryParse(json['total']?.toString() ?? '0') ?? 0,
      totalPages: json['totalPages'] is int ? json['totalPages'] : int.tryParse(json['totalPages']?.toString() ?? '1') ?? 1,
    );
  }
}
