import 'package:dio/dio.dart';

import '../../core/errors/api_error.dart';
import '../../core/network/api_client.dart';
import '../../core/network/api_response.dart';
import '../customers/models/paginated_list.dart';
import 'models/marketer.dart';
import 'models/marketer_summary.dart';

/// Repository برای مدیریت عملیات مربوط به بازاریاب‌ها
class MarketersRepository {
  MarketersRepository(this._client);

  final ApiClient _client;
  Dio get _dio => _client.dio;

  /// GET /api/marketers - لیست بازاریاب‌ها با فیلتر و pagination
  Future<PaginatedList<MarketerSummary>> listMarketers({
    String? region,
    bool? isActive,
    int? page,
    int? limit,
  }) async {
    try {
      final queryParameters = <String, dynamic>{};
      if (region != null && region.isNotEmpty) {
        queryParameters['region'] = region;
      }
      if (isActive != null) {
        queryParameters['isActive'] = isActive.toString();
      }
      if (page != null) {
        queryParameters['page'] = page;
      }
      if (limit != null) {
        queryParameters['limit'] = limit;
      }

      final response = await _dio.get<Map<String, dynamic>>(
        '/marketers',
        queryParameters: queryParameters,
      );

      final body = response.data ?? <String, dynamic>{};
      final apiResponse = ApiResponse<Map<String, dynamic>>.fromJson(
        body,
        (json) => json as Map<String, dynamic>,
      );

      if (!apiResponse.success || apiResponse.data == null) {
        throw ApiException(
          apiResponse.message ?? 'خطا در دریافت لیست بازاریاب‌ها',
          statusCode: response.statusCode ?? 400,
          code: ApiErrorCode.fromString(apiResponse.code) ?? ApiErrorCode.internalServerError,
        );
      }

      final dataMap = apiResponse.data!;
      return PaginatedList.fromJson(
        dataMap,
        (json) => MarketerSummary.fromJson(json),
      );
    } catch (error) {
      if (error is ApiException) {
        rethrow;
      }
      throw ApiException.fromDioError(error);
    }
  }

  /// GET /api/marketers/{id} - دریافت جزئیات بازاریاب
  Future<Marketer> getMarketer(String marketerId) async {
    try {
      final response = await _dio.get<Map<String, dynamic>>(
        '/marketers/$marketerId',
      );

      final body = response.data ?? <String, dynamic>{};
      final apiResponse = ApiResponse<Map<String, dynamic>>.fromJson(
        body,
        (json) => json as Map<String, dynamic>,
      );

      if (!apiResponse.success || apiResponse.data == null) {
        throw ApiException(
          apiResponse.message ?? 'بازاریاب یافت نشد',
          statusCode: response.statusCode ?? 404,
          code: ApiErrorCode.fromString(apiResponse.code) ?? ApiErrorCode.notFound,
        );
      }

      return Marketer.fromJson(apiResponse.data!);
    } catch (error) {
      if (error is ApiException) {
        rethrow;
      }
      throw ApiException.fromDioError(error);
    }
  }

  /// POST /api/marketers - ایجاد بازاریاب جدید
  Future<Marketer> createMarketer(Map<String, dynamic> data) async {
    try {
      final response = await _dio.post<Map<String, dynamic>>(
        '/marketers',
        data: data,
      );

      final body = response.data ?? <String, dynamic>{};
      final apiResponse = ApiResponse<Map<String, dynamic>>.fromJson(
        body,
        (json) => json as Map<String, dynamic>,
      );

      if (!apiResponse.success || apiResponse.data == null) {
        throw ApiException(
          apiResponse.message ?? 'خطا در ایجاد بازاریاب',
          statusCode: response.statusCode ?? 400,
          code: ApiErrorCode.fromString(apiResponse.code) ?? ApiErrorCode.validationError,
        );
      }

      return Marketer.fromJson(apiResponse.data!);
    } catch (error) {
      if (error is ApiException) {
        rethrow;
      }
      throw ApiException.fromDioError(error);
    }
  }

  /// PATCH /api/marketers/{id} - ویرایش بازاریاب
  Future<Marketer> updateMarketer(
    String marketerId,
    Map<String, dynamic> data,
  ) async {
    try {
      final response = await _dio.patch<Map<String, dynamic>>(
        '/marketers/$marketerId',
        data: data,
      );

      final body = response.data ?? <String, dynamic>{};
      final apiResponse = ApiResponse<Map<String, dynamic>>.fromJson(
        body,
        (json) => json as Map<String, dynamic>,
      );

      if (!apiResponse.success || apiResponse.data == null) {
        throw ApiException(
          apiResponse.message ?? 'خطا در به‌روزرسانی بازاریاب',
          statusCode: response.statusCode ?? 400,
          code: ApiErrorCode.fromString(apiResponse.code) ?? ApiErrorCode.validationError,
        );
      }

      return Marketer.fromJson(apiResponse.data!);
    } catch (error) {
      if (error is ApiException) {
        rethrow;
      }
      throw ApiException.fromDioError(error);
    }
  }

  /// DELETE /api/marketers/{id} - حذف بازاریاب
  Future<void> deleteMarketer(String marketerId) async {
    try {
      await _dio.delete<Map<String, dynamic>>(
        '/marketers/$marketerId',
      );
    } catch (error) {
      throw ApiException.fromDioError(error);
    }
  }
}

