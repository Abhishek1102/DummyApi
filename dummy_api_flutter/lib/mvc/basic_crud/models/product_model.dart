// LEARNING: Data Model Parsing in Flutter
// In Flutter, backend JSON objects are converted into strongly-typed Dart objects using `fromJson` factory methods.
// Why parse JSON into models?
// 1. Enables compile-time type safety (prevents `NoSuchMethodError: Class 'String' has no instance getter 'price'`).
// 2. Simplifies UI code: `product.name` instead of `productJson['name']`.
// 3. Centralizes data transformations and default fallback values.

class ProductModel {
  final int id;
  final String name;
  final double price;
  final String category;
  final int stock;
  final String? description;
  final String? createdAt;

  ProductModel({
    required this.id,
    required this.name,
    required this.price,
    required this.category,
    required this.stock,
    this.description,
    this.createdAt,
  });

  // LEARNING: Deserialization from JSON Map to Dart Object
  factory ProductModel.fromJson(Map<String, dynamic> json) {
    return ProductModel(
      id: json['id'] is int ? json['id'] : int.tryParse(json['id']?.toString() ?? '0') ?? 0,
      name: json['name'] as String? ?? 'Unnamed Product',
      price: json['price'] != null ? double.tryParse(json['price'].toString()) ?? 0.0 : 0.0,
      category: json['category'] as String? ?? 'General',
      stock: json['stock'] is int ? json['stock'] : int.tryParse(json['stock']?.toString() ?? '0') ?? 0,
      description: json['description'] as String?,
      createdAt: json['createdAt'] as String?,
    );
  }

  // LEARNING: Serialization from Dart Object to JSON Map (for POST / PUT requests)
  Map<String, dynamic> toJson() {
    return {
      if (id > 0) 'id': id,
      'name': name,
      'price': price,
      'category': category,
      'stock': stock,
      if (description != null) 'description': description,
    };
  }
}
