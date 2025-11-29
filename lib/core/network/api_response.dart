import '../errors/api_error.dart';

/// Generic API response model aligned with the Next.js backend.
class ApiResponse<T> {
  ApiResponse({
    required this.success,
    this.data,
    this.message,
    this.code,
    this.errors,
    this.pagination,
  });

  final bool success;
  final T? data;
  final String? message;
  final String? code;
  final List<ApiValidationError>? errors;
  final ApiPagination? pagination;

  factory ApiResponse.fromJson(
    Map<String, dynamic> json,
    T Function(Object? json) fromJsonT,
  ) {
    return ApiResponse<T>(
      success: json['success'] as bool? ?? false,
      data: json['data'] != null ? fromJsonT(json['data']) : null,
      message: json['message'] as String?,
      code: json['code'] as String?,
      errors: (json['errors'] as List?)
          ?.map((e) => ApiValidationError.fromJson(e as Map<String, dynamic>))
          .toList(),
      pagination: json['pagination'] != null
          ? ApiPagination.fromJson(json['pagination'] as Map<String, dynamic>)
          : null,
    );
  }
}

// ApiValidationError moved to lib/core/errors/api_error.dart

class ApiPagination {
  ApiPagination({
    required this.page,
    required this.limit,
    required this.total,
    this.totalPages,
  });

  final int page;
  final int limit;
  final int total;
  final int? totalPages;

  factory ApiPagination.fromJson(Map<String, dynamic> json) {
    return ApiPagination(
      page: json['page'] as int? ?? 1,
      limit: json['limit'] as int? ?? 20,
      total: json['total'] as int? ?? 0,
      totalPages: json['totalPages'] as int?,
    );
  }
}


