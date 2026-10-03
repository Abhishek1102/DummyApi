// LEARNING: File Upload Result Data Models

class UploadedFileInfo {
  final String originalName;
  final String filename;
  final String mimeType;
  final int size;
  final String path;
  final String url;

  UploadedFileInfo({
    required this.originalName,
    required this.filename,
    required this.mimeType,
    required this.size,
    required this.path,
    required this.url,
  });

  factory UploadedFileInfo.fromJson(Map<String, dynamic> json) {
    return UploadedFileInfo(
      originalName: json['originalName'] as String? ?? json['originalname'] as String? ?? '',
      filename: json['filename'] as String? ?? '',
      mimeType: json['mimetype'] as String? ?? json['mimeType'] as String? ?? '',
      size: json['size'] is int ? json['size'] : int.tryParse(json['size']?.toString() ?? '0') ?? 0,
      path: json['path'] as String? ?? '',
      url: json['url'] as String? ?? '',
    );
  }

  Map<String, dynamic> toJson() => {
        'originalName': originalName,
        'filename': filename,
        'mimeType': mimeType,
        'size': size,
        'url': url,
      };
}
