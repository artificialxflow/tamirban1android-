import 'package:dio/dio.dart';

import '../../core/errors/api_error.dart';
import '../../core/network/api_client.dart';
import '../../core/network/api_response.dart';
import '../customers/models/paginated_list.dart';
import 'models/visit.dart';
import 'models/visit_status.dart';
import 'models/visit_summary.dart';

/// Repository برای مدیریت عملیات مربوط به ویزیت‌ها
class VisitsRepository {
  VisitsRepository(this._client);

  final ApiClient _client;
  Dio get _dio => _client.dio;

  /// GET /api/visits - لیست ویزیت‌ها با فیلتر و pagination
  Future<PaginatedList<VisitSummary>> listVisits({
    String? customerId,
    String? marketerId,
    VisitStatus? status,
    DateTime? startDate,
    DateTime? endDate,
    int? page,
    int? limit,
  }) async {
    try {
      final queryParameters = <String, dynamic>{};
      if (customerId != null) {
        queryParameters['customerId'] = customerId;
      }
      if (marketerId != null) {
        queryParameters['marketerId'] = marketerId;
      }
      if (status != null) {
        queryParameters['status'] = status.value;
      }
      if (startDate != null) {
        queryParameters['startDate'] = startDate.toIso8601String();
      }
      if (endDate != null) {
        queryParameters['endDate'] = endDate.toIso8601String();
      }
      if (page != null) {
        queryParameters['page'] = page;
      }
      if (limit != null) {
        queryParameters['limit'] = limit;
      }

      final response = await _dio.get<Map<String, dynamic>>(
        '/visits',
        queryParameters: queryParameters,
      );

      final body = response.data ?? <String, dynamic>{};
      final apiResponse = ApiResponse<Map<String, dynamic>>.fromJson(
        body,
        (json) => json as Map<String, dynamic>,
      );

      if (!apiResponse.success || apiResponse.data == null) {
        throw ApiException(
          apiResponse.message ?? 'خطا در دریافت لیست ویزیت‌ها',
          statusCode: response.statusCode ?? 400,
          code: ApiErrorCode.fromString(apiResponse.code) ?? ApiErrorCode.internalServerError,
        );
      }

      final dataMap = apiResponse.data!;
      return PaginatedList.fromJson(
        dataMap,
        (json) => VisitSummary.fromJson(json),
      );
    } catch (error) {
      if (error is ApiException) {
        rethrow;
      }
      throw ApiException.fromDioError(error);
    }
  }

  /// GET /api/visits/{id} - دریافت جزئیات ویزیت
  Future<Visit> getVisit(String visitId) async {
    try {
      final response = await _dio.get<Map<String, dynamic>>(
        '/visits/$visitId',
      );

      final body = response.data ?? <String, dynamic>{};
      final apiResponse = ApiResponse<Map<String, dynamic>>.fromJson(
        body,
        (json) => json as Map<String, dynamic>,
      );

      if (!apiResponse.success || apiResponse.data == null) {
        throw ApiException(
          apiResponse.message ?? 'ویزیت یافت نشد',
          statusCode: response.statusCode ?? 404,
          code: ApiErrorCode.fromString(apiResponse.code) ?? ApiErrorCode.notFound,
        );
      }

      return Visit.fromJson(apiResponse.data!);
    } catch (error) {
      if (error is ApiException) {
        rethrow;
      }
      throw ApiException.fromDioError(error);
    }
  }

  /// POST /api/visits - ایجاد ویزیت جدید
  Future<Visit> createVisit(Map<String, dynamic> data) async {
    try {
      final response = await _dio.post<Map<String, dynamic>>(
        '/visits',
        data: data,
      );

      final body = response.data ?? <String, dynamic>{};
      final apiResponse = ApiResponse<Map<String, dynamic>>.fromJson(
        body,
        (json) => json as Map<String, dynamic>,
      );

      if (!apiResponse.success || apiResponse.data == null) {
        throw ApiException(
          apiResponse.message ?? 'خطا در ایجاد ویزیت',
          statusCode: response.statusCode ?? 400,
          code: ApiErrorCode.fromString(apiResponse.code) ?? ApiErrorCode.validationError,
        );
      }

      return Visit.fromJson(apiResponse.data!);
    } catch (error) {
      if (error is ApiException) {
        rethrow;
      }
      throw ApiException.fromDioError(error);
    }
  }

  /// PATCH /api/visits/{id} - ویرایش ویزیت
  Future<Visit> updateVisit(
    String visitId,
    Map<String, dynamic> data,
  ) async {
    try {
      final response = await _dio.patch<Map<String, dynamic>>(
        '/visits/$visitId',
        data: data,
      );

      final body = response.data ?? <String, dynamic>{};
      final apiResponse = ApiResponse<Map<String, dynamic>>.fromJson(
        body,
        (json) => json as Map<String, dynamic>,
      );

      if (!apiResponse.success || apiResponse.data == null) {
        throw ApiException(
          apiResponse.message ?? 'خطا در به‌روزرسانی ویزیت',
          statusCode: response.statusCode ?? 400,
          code: ApiErrorCode.fromString(apiResponse.code) ?? ApiErrorCode.validationError,
        );
      }

      return Visit.fromJson(apiResponse.data!);
    } catch (error) {
      if (error is ApiException) {
        rethrow;
      }
      throw ApiException.fromDioError(error);
    }
  }

  /// PATCH /api/visits/{id}/status - تغییر وضعیت ویزیت
  Future<Visit> changeVisitStatus(
    String visitId,
    VisitStatus status, {
    DateTime? completedAt,
  }) async {
    try {
      final data = <String, dynamic>{
        'status': status.value,
      };
      if (completedAt != null) {
        data['completedAt'] = completedAt.toIso8601String();
      }

      final response = await _dio.patch<Map<String, dynamic>>(
        '/visits/$visitId/status',
        data: data,
      );

      final body = response.data ?? <String, dynamic>{};
      final apiResponse = ApiResponse<Map<String, dynamic>>.fromJson(
        body,
        (json) => json as Map<String, dynamic>,
      );

      if (!apiResponse.success || apiResponse.data == null) {
        throw ApiException(
          apiResponse.message ?? 'خطا در تغییر وضعیت ویزیت',
          statusCode: response.statusCode ?? 400,
          code: ApiErrorCode.fromString(apiResponse.code) ?? ApiErrorCode.validationError,
        );
      }

      return Visit.fromJson(apiResponse.data!);
    } catch (error) {
      if (error is ApiException) {
        rethrow;
      }
      throw ApiException.fromDioError(error);
    }
  }

  /// DELETE /api/visits/{id} - حذف ویزیت
  Future<void> deleteVisit(String visitId) async {
    try {
      await _dio.delete<Map<String, dynamic>>(
        '/visits/$visitId',
      );
    } catch (error) {
      throw ApiException.fromDioError(error);
    }
  }
}
