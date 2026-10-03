// LEARNING: Custom Exception Hierarchy for Flutter Network Requests
// Creating specific Exception classes allows our controllers and views to catch and handle
// specific errors gracefully (e.g., showing a login modal on UnauthorizedException, or a retry button on TimeoutException).

import 'package:dio/dio.dart';
import 'api_response.dart';

class ApiException implements Exception {
  final String message;
  final int? statusCode;
  final ApiErrorDetails? errorDetails;

  ApiException({required this.message, this.statusCode, this.errorDetails});

  @override
  String toString() => message;
}

// 400 Bad Request / Validation Failure
class BadRequestException extends ApiException {
  final List<ValidationErrorField>? validationErrors;
  BadRequestException({required super.message, super.statusCode = 400, super.errorDetails, this.validationErrors});
}

// 401 Unauthorized (Token missing/expired)
class UnauthorizedException extends ApiException {
  UnauthorizedException({required super.message, super.statusCode = 401, super.errorDetails});
}

// 403 Forbidden (Permission denied)
class ForbiddenException extends ApiException {
  ForbiddenException({required super.message, super.statusCode = 403, super.errorDetails});
}

// 404 Not Found
class NotFoundException extends ApiException {
  NotFoundException({required super.message, super.statusCode = 404, super.errorDetails});
}

// 429 Rate Limit Exceeded
class RateLimitException extends ApiException {
  final int? retryAfterSeconds;
  RateLimitException({required super.message, super.statusCode = 429, super.errorDetails, this.retryAfterSeconds});
}

// 500 Server Error
class InternalServerErrorException extends ApiException {
  InternalServerErrorException({required super.message, super.statusCode = 500, super.errorDetails});
}

// Network / Connection / Timeout Exceptions
class NetworkConnectionException extends ApiException {
  NetworkConnectionException({super.message = 'No Internet connection or server is unreachable.'});
}

class RequestTimeoutException extends ApiException {
  RequestTimeoutException({super.message = 'Request connection timed out. Please try again.'});
}

// LEARNING: Helper utility to map DioException into custom ApiException
class ApiExceptionHandler {
  static ApiException fromDioException(DioException dioException) {
    switch (dioException.type) {
      case DioExceptionType.connectionTimeout:
      case DioExceptionType.sendTimeout:
      case DioExceptionType.receiveTimeout:
        return RequestTimeoutException();

      case DioExceptionType.connectionError:
        return NetworkConnectionException();

      case DioExceptionType.badResponse:
        final response = dioException.response;
        if (response != null && response.data != null && response.data is Map<String, dynamic>) {
          final errorData = response.data['error'];
          ApiErrorDetails? errorDetails;
          if (errorData != null && errorData is Map<String, dynamic>) {
            errorDetails = ApiErrorDetails.fromJson(errorData);
          }

          final String msg = errorDetails?.message ?? response.data['message'] ?? 'HTTP ${response.statusCode} Error';
          final int status = response.statusCode ?? 500;

          switch (status) {
            case 400:
              return BadRequestException(
                message: msg,
                statusCode: 400,
                errorDetails: errorDetails,
                validationErrors: errorDetails?.validationDetails,
              );
            case 401:
              return UnauthorizedException(message: msg, statusCode: 401, errorDetails: errorDetails);
            case 403:
              return ForbiddenException(message: msg, statusCode: 403, errorDetails: errorDetails);
            case 404:
              return NotFoundException(message: msg, statusCode: 404, errorDetails: errorDetails);
            case 429:
              return RateLimitException(message: msg, statusCode: 429, errorDetails: errorDetails);
            case 500:
            default:
              return InternalServerErrorException(message: msg, statusCode: status, errorDetails: errorDetails);
          }
        }
        return InternalServerErrorException(
          message: 'Server error: ${response?.statusCode}',
          statusCode: response?.statusCode ?? 500,
        );

      case DioExceptionType.cancel:
        return ApiException(message: 'Request was cancelled.');

      default:
        return ApiException(message: dioException.message ?? 'An unknown network error occurred.');
    }
  }
}
