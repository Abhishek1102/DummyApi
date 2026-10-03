// LEARNING: Standardized API Response Wrapper
// Our Node.js backend returns all JSON responses in a unified envelope format:
// Success: { "success": true, "message": "...", "data": {...}, "timestamp": "..." }
// Error:   { "success": false, "error": { "code": 404, "type": "...", "message": "..." }, "timestamp": "..." }
//
// By creating a generic `ApiResponse<T>` wrapper class in Flutter:
// 1. Controllers receive typed objects (e.g., `ApiResponse<List<Product>>`).
// 2. UI can easily check `response.success` before displaying data.
// 3. Error details are cleanly accessible everywhere.

class ApiResponse<T> {
  final bool success;
  final String? message;
  final T? data;
  final ApiErrorDetails? error;
  final String? timestamp;
  final int statusCode;

  ApiResponse({
    required this.success,
    this.message,
    this.data,
    this.error,
    this.timestamp,
    required this.statusCode,
  });

  // LEARNING: Factory constructor to parse JSON response map safely
  factory ApiResponse.fromJson(
    Map<String, dynamic> json,
    int statusCode,
    T Function(dynamic dataJson)? createData,
  ) {
    final bool isSuccess = json['success'] ?? (statusCode >= 200 && statusCode < 300);

    T? parsedData;
    if (isSuccess && json['data'] != null && createData != null) {
      try {
        parsedData = createData(json['data']);
      } catch (e) {
        // Log parsing errors for debugging
        print('LEARNING DEBUG: JSON Parsing error for $T -> $e');
      }
    } else if (isSuccess && json['data'] != null) {
      // If no custom deserializer function was passed, assign raw data
      parsedData = json['data'] as T?;
    }

    ApiErrorDetails? parsedError;
    if (!isSuccess && json['error'] != null) {
      parsedError = ApiErrorDetails.fromJson(json['error']);
    } else if (!isSuccess) {
      parsedError = ApiErrorDetails(
        code: statusCode,
        type: 'HTTP_ERROR',
        message: json['message'] ?? 'An error occurred with status code $statusCode',
      );
    }

    return ApiResponse<T>(
      success: isSuccess,
      message: json['message'] as String?,
      data: parsedData,
      error: parsedError,
      timestamp: json['timestamp'] as String?,
      statusCode: statusCode,
    );
  }
}

// LEARNING: Standardized API Error Details Model
// Captures error code, error type string, message, and field-level validation errors.
class ApiErrorDetails {
  final int code;
  final String type;
  final String message;
  final List<ValidationErrorField>? validationDetails;

  ApiErrorDetails({
    required this.code,
    required this.type,
    required this.message,
    this.validationDetails,
  });

  factory ApiErrorDetails.fromJson(Map<String, dynamic> json) {
    List<ValidationErrorField>? detailsList;
    if (json['details'] != null && json['details'] is List) {
      detailsList = (json['details'] as List)
          .map((item) => ValidationErrorField.fromJson(item as Map<String, dynamic>))
          .toList();
    }

    return ApiErrorDetails(
      code: json['code'] is int ? json['code'] : int.tryParse(json['code']?.toString() ?? '0') ?? 0,
      type: json['type'] as String? ?? 'UNKNOWN_ERROR',
      message: json['message'] as String? ?? 'An unexpected error occurred.',
      validationDetails: detailsList,
    );
  }
}

// LEARNING: Field-level validation model (for 400 Bad Request responses)
class ValidationErrorField {
  final String field;
  final String message;

  ValidationErrorField({required this.field, required this.message});

  factory ValidationErrorField.fromJson(Map<String, dynamic> json) {
    return ValidationErrorField(
      field: json['field'] as String? ?? '',
      message: json['message'] as String? ?? '',
    );
  }
}
