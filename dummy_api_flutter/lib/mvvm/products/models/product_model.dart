/// Robust Product domain model with manual serialization for MVVM
class Product {
  final int id;
  final String name;
  final double price;
  final String category;
  final String? description;
  final String? imageUrl;
  final int stock;
  final double rating;
  final List<String> tags;

  const Product({
    required this.id,
    required this.name,
    required this.price,
    required this.category,
    this.description,
    this.imageUrl,
    this.stock = 0,
    this.rating = 0.0,
    this.tags = const [],
  });

  factory Product.fromJson(Map<String, dynamic> json) {
    return Product(
      id: (json['id'] as num?)?.toInt() ?? 0,
      name: json['name'] as String? ?? 'Unnamed Product',
      price: (json['price'] as num?)?.toDouble() ?? 0.0,
      category: json['category'] as String? ?? 'General',
      description: json['description'] as String?,
      imageUrl: json['image_url'] as String? ?? json['imageUrl'] as String?,
      stock: (json['stock'] as num?)?.toInt() ?? 0,
      rating: (json['rating'] as num?)?.toDouble() ?? 0.0,
      tags: (json['tags'] as List<dynamic>?)
              ?.map((item) => item.toString())
              .toList() ??
          const [],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'price': price,
      'category': category,
      if (description != null) 'description': description,
      if (imageUrl != null) 'image_url': imageUrl,
      'stock': stock,
      'rating': rating,
      'tags': tags,
    };
  }

  Product copyWith({
    int? id,
    String? name,
    double? price,
    String? category,
    String? description,
    String? imageUrl,
    int? stock,
    double? rating,
    List<String>? tags,
  }) {
    return Product(
      id: id ?? this.id,
      name: name ?? this.name,
      price: price ?? this.price,
      category: category ?? this.category,
      description: description ?? this.description,
      imageUrl: imageUrl ?? this.imageUrl,
      stock: stock ?? this.stock,
      rating: rating ?? this.rating,
      tags: tags ?? this.tags,
    );
  }
}
