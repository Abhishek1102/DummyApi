import 'package:dio/dio.dart';
import 'package:flutter/foundation.dart';
import '../../../core/constants/api_endpoints.dart';
import '../../../core/network/api_client.dart';
import '../models/file_upload_model.dart';

// LEARNING: Multipart File Upload & Download Controller
// Demonstrates how to send binary files (Images, Documents, Videos, Avatars) using Dio `FormData` and `MultipartFile.fromFile`.

class UploadController extends ChangeNotifier {
  final ApiClient _apiClient = ApiClient();

  bool _isLoading = false;
  double _uploadProgress = 0.0;
  String? _errorMessage;
  UploadedFileInfo? _uploadedFile;
  List<UploadedFileInfo> _uploadedFilesList = [];
  dynamic _lastRawResponse;

  bool get isLoading => _isLoading;
  double get uploadProgress => _uploadProgress;
  String? get errorMessage => _errorMessage;
  UploadedFileInfo? get uploadedFile => _uploadedFile;
  List<UploadedFileInfo> get uploadedFilesList => _uploadedFilesList;
  dynamic get lastRawResponse => _lastRawResponse;

  void _setLoading(bool loading) {
    _isLoading = loading;
    _uploadProgress = 0.0;
    notifyListeners();
  }

  void _setError(String? error) {
    _errorMessage = error;
    notifyListeners();
  }

  // ---------------------------------------------------------------------------
  // 1. POST /api/upload/single
  // Description: Single Image Upload via Multipart Form-Data
  // URL: http://10.0.2.2:3000/api/upload/single
  // Field Name: `image`
  // ---------------------------------------------------------------------------
  Future<bool> uploadSingleImage(String filePath) async {
    _setLoading(true);
    _setError(null);

    try {
      // LEARNING: Construct FormData with MultipartFile
      final formData = FormData.fromMap({
        'image': await MultipartFile.fromFile(
          filePath,
          filename: filePath.split('\\').last.split('/').last,
        ),
      });

      final response = await _apiClient.uploadMultipart<dynamic>(
        ApiEndpoints.uploadSingle,
        formData: formData,
        onSendProgress: (sent, total) {
          if (total > 0) {
            _uploadProgress = sent / total;
            notifyListeners();
          }
        },
      );

      _lastRawResponse = response.data;

      if (response.success && response.data != null) {
        final fileData = response.data['file'] ?? response.data;
        _uploadedFile = UploadedFileInfo.fromJson(fileData as Map<String, dynamic>);
        return true;
      } else {
        _setError(response.error?.message ?? 'Image upload failed.');
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
  // 2. POST /api/upload/multiple
  // Description: Multiple Images Upload (Array of files)
  // URL: http://10.0.2.2:3000/api/upload/multiple
  // Field Name: `images` (array)
  // ---------------------------------------------------------------------------
  Future<bool> uploadMultipleImages(List<String> filePaths) async {
    _setLoading(true);
    _setError(null);

    try {
      final List<MultipartFile> files = [];
      for (final path in filePaths) {
        files.add(await MultipartFile.fromFile(path, filename: path.split('\\').last.split('/').last));
      }

      final formData = FormData.fromMap({'images': files});

      final response = await _apiClient.uploadMultipart<dynamic>(
        ApiEndpoints.uploadMultiple,
        formData: formData,
        onSendProgress: (sent, total) {
          if (total > 0) {
            _uploadProgress = sent / total;
            notifyListeners();
          }
        },
      );

      _lastRawResponse = response.data;

      if (response.success && response.data != null) {
        final List filesJson = response.data['files'] ?? [];
        _uploadedFilesList = filesJson.map((f) => UploadedFileInfo.fromJson(f as Map<String, dynamic>)).toList();
        return true;
      } else {
        _setError(response.error?.message ?? 'Multiple image upload failed.');
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
  // 3. POST /api/upload/document
  // Description: Upload PDF/TXT Document file
  // URL: http://10.0.2.2:3000/api/upload/document
  // Field Name: `document`
  // ---------------------------------------------------------------------------
  Future<bool> uploadDocument(String filePath) async {
    _setLoading(true);
    _setError(null);

    try {
      final formData = FormData.fromMap({
        'document': await MultipartFile.fromFile(filePath, filename: filePath.split('\\').last.split('/').last),
      });

      final response = await _apiClient.uploadMultipart<dynamic>(
        ApiEndpoints.uploadDocument,
        formData: formData,
      );

      _lastRawResponse = response.data;

      if (response.success && response.data != null) {
        final fileData = response.data['file'] ?? response.data;
        _uploadedFile = UploadedFileInfo.fromJson(fileData as Map<String, dynamic>);
        return true;
      } else {
        _setError(response.error?.message ?? 'Document upload failed.');
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
  // 4. POST /api/upload/avatar-with-data
  // Description: Upload file alongside textual form fields
  // URL: http://10.0.2.2:3000/api/upload/avatar-with-data
  // Fields: text `name`, text `email`, binary `avatar`
  // ---------------------------------------------------------------------------
  Future<bool> uploadAvatarWithData({
    required String filePath,
    required String name,
    required String email,
  }) async {
    _setLoading(true);
    _setError(null);

    try {
      final formData = FormData.fromMap({
        'name': name,
        'email': email,
        'avatar': await MultipartFile.fromFile(filePath, filename: filePath.split('\\').last.split('/').last),
      });

      final response = await _apiClient.uploadMultipart<dynamic>(
        ApiEndpoints.uploadAvatarWithData,
        formData: formData,
      );

      _lastRawResponse = response.data;
      return response.success;
    } catch (e) {
      _setError(e.toString());
      return false;
    } finally {
      _setLoading(false);
    }
  }
}
