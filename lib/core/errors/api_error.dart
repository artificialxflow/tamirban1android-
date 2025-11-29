import 'package:dio/dio.dart';

/// کدهای خطای استاندارد API هماهنگ با backend
enum ApiErrorCode {
  unauthorized('UNAUTHORIZED'),
  forbidden('FORBIDDEN'),
  notFound('NOT_FOUND'),
  validationError('VALIDATION_ERROR'),
  rateLimitExceeded('RATE_LIMIT_EXCEEDED'),
  internalServerError('INTERNAL_SERVER_ERROR'),
  badRequest('BAD_REQUEST'),
  tokenExpired('TOKEN_EXPIRED'),
  invalidToken('INVALID_TOKEN');

  const ApiErrorCode(this.value);

  final String value;

  static ApiErrorCode? fromString(String? code) {
    if (code == null) return null;
    try {
      return ApiErrorCode.values.firstWhere(
        (e) => e.value == code.toUpperCase(),
        orElse: () => internalServerError,
      );
    } catch (_) {
      return null;
    }
  }
}

/// کلاس خطای سفارشی برای API
class ApiException implements Exception {
  ApiException(
    this.message, {
    this.statusCode = 400,
    this.code,
    this.errors,
  });

  final String message;
  final int statusCode;
  final ApiErrorCode? code;
  final List<ApiValidationError>? errors;

  @override
  String toString() => 'ApiException: $message (${code?.value ?? 'UNKNOWN'})';

  /// ایجاد ApiException از پاسخ خطای Dio
  factory ApiException.fromDioError(dynamic error) {
    if (error is DioException) {
      final response = error.response;
      final statusCode = response?.statusCode ?? 500;
      final data = response?.data;

      if (data is Map<String, dynamic>) {
        final message = data['message'] as String? ?? 'خطای غیرمنتظره رخ داد';
        final codeString = data['code'] as String?;
        final code = ApiErrorCode.fromString(codeString);

        List<ApiValidationError>? errors;
        if (data['errors'] is List) {
          errors = (data['errors'] as List)
              .map((e) => ApiValidationError.fromJson(e as Map<String, dynamic>))
              .toList();
        }

        return ApiException(
          message,
          statusCode: statusCode,
          code: code ?? ApiErrorCode.internalServerError,
          errors: errors,
        );
      }

      // خطای شبکه یا دیگر خطاهای Dio
      String message = 'خطای غیرمنتظره رخ داد';
      ApiErrorCode? code;

      switch (error.type) {
        case DioExceptionType.connectionTimeout:
        case DioExceptionType.sendTimeout:
        case DioExceptionType.receiveTimeout:
          message = 'زمان اتصال به سرور به پایان رسید';
          code = ApiErrorCode.internalServerError;
          break;
        case DioExceptionType.badResponse:
          message = 'پاسخ نامعتبر از سرور دریافت شد';
          code = ApiErrorCode.badRequest;
          break;
        case DioExceptionType.cancel:
          message = 'درخواست لغو شد';
          break;
        case DioExceptionType.connectionError:
          // Check if it's a connection refused error (backend not running)
          if (error.message?.contains('Connection refused') == true ||
              error.message?.contains('ERR_CONNECTION_REFUSED') == true) {
            message = 'سرور در دسترس نیست. لطفاً مطمئن شوید که backend در حال اجرا است.';
          } else {
            message = 'خطا در اتصال به اینترنت';
          }
          code = ApiErrorCode.internalServerError;
          break;
        default:
          message = error.message ?? 'خطای غیرمنتظره رخ داد';
      }

      return ApiException(
        message,
        statusCode: statusCode,
        code: code ?? ApiErrorCode.internalServerError,
      );
    }

    // خطای غیر Dio
    if (error is ApiException) {
      return error;
    }

    if (error is Exception) {
      return ApiException(
        error.toString(),
        statusCode: 500,
        code: ApiErrorCode.internalServerError,
      );
    }

    return ApiException(
      'خطای غیرمنتظره رخ داد',
      statusCode: 500,
      code: ApiErrorCode.internalServerError,
    );
  }
}

/// خطای اعتبارسنجی فیلد
class ApiValidationError {
  ApiValidationError({
    required this.field,
    required this.message,
  });

  final String field;
  final String message;

  factory ApiValidationError.fromJson(Map<String, dynamic> json) {
    return ApiValidationError(
      field: json['field'] as String? ?? '',
      message: json['message'] as String? ?? '',
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'field': field,
      'message': message,
    };
  }
}

