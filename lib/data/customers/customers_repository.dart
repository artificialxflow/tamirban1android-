import 'package:dio/dio.dart';

import '../../core/errors/api_error.dart';
import '../../core/network/api_client.dart';
import '../../core/network/api_response.dart';
import 'models/customer.dart';
import 'models/customer_summary.dart';
import 'models/customer_status.dart';
import 'models/paginated_list.dart';

class CustomersRepository {
  CustomersRepository(this._client);

  final ApiClient _client;
  Dio get _dio => _client.dio;

  /// GET /api/customers - لیست مشتری‌ها با فیلتر و pagination
  Future<PaginatedList<CustomerSummary>> listCustomers({
    CustomerStatus? status,
    String? marketerId,
    String? search,
    String? city,
    int? page,
    int? limit,
  }) async {
    try {
      final queryParameters = <String, dynamic>{};
      
      if (status != null) {
        queryParameters['status'] = status.value;
      }
      if (marketerId != null) {
        queryParameters['marketerId'] = marketerId;
      }
      if (search != null && search.isNotEmpty) {
        queryParameters['search'] = search;
      }
      if (city != null && city.isNotEmpty) {
        queryParameters['city'] = city;
      }
      if (page != null) {
        queryParameters['page'] = page;
      }
      if (limit != null) {
        queryParameters['limit'] = limit;
      }

      final response = await _dio.get<Map<String, dynamic>>(
        '/customers',
        queryParameters: queryParameters,
      );

      final body = response.data ?? <String, dynamic>{};
      final apiResponse = ApiResponse<Map<String, dynamic>>.fromJson(
        body,
        (json) => json as Map<String, dynamic>,
      );

      if (!apiResponse.success || apiResponse.data == null) {
        throw ApiException(
          apiResponse.message ?? 'خطا در دریافت لیست مشتری‌ها',
          statusCode: response.statusCode ?? 400,
          code: ApiErrorCode.fromString(apiResponse.code) ?? ApiErrorCode.internalServerError,
        );
      }

      // Backend returns: { data: [...], total: ..., page: ..., limit: ... }
      final dataMap = apiResponse.data!;
      return PaginatedList.fromJson(
        dataMap,
        (json) => CustomerSummary.fromJson(json),
      );
    } catch (error) {
      if (error is ApiException) {
        rethrow;
      }
      throw ApiException.fromDioError(error);
    }
  }

  /// GET /api/customers/{id} - دریافت جزئیات مشتری
  Future<Customer> getCustomer(String customerId) async {
    try {
      final response = await _dio.get<Map<String, dynamic>>(
        '/customers/$customerId',
      );

      final body = response.data ?? <String, dynamic>{};
      final apiResponse = ApiResponse<Map<String, dynamic>>.fromJson(
        body,
        (json) => json as Map<String, dynamic>,
      );

      if (!apiResponse.success || apiResponse.data == null) {
        throw ApiException(
          apiResponse.message ?? 'مشتری یافت نشد',
          statusCode: response.statusCode ?? 404,
          code: ApiErrorCode.fromString(apiResponse.code) ?? ApiErrorCode.notFound,
        );
      }

      return Customer.fromJson(apiResponse.data!);
    } catch (error) {
      if (error is ApiException) {
        rethrow;
      }
      throw ApiException.fromDioError(error);
    }
  }

  /// POST /api/customers - ایجاد مشتری جدید
  Future<Customer> createCustomer(Map<String, dynamic> data) async {
    try {
      final response = await _dio.post<Map<String, dynamic>>(
        '/customers',
        data: data,
      );

      final body = response.data ?? <String, dynamic>{};
      final apiResponse = ApiResponse<Map<String, dynamic>>.fromJson(
        body,
        (json) => json as Map<String, dynamic>,
      );

      if (!apiResponse.success || apiResponse.data == null) {
        throw ApiException(
          apiResponse.message ?? 'خطا در ایجاد مشتری',
          statusCode: response.statusCode ?? 400,
          code: ApiErrorCode.fromString(apiResponse.code) ?? ApiErrorCode.validationError,
        );
      }

      return Customer.fromJson(apiResponse.data!);
    } catch (error) {
      if (error is ApiException) {
        rethrow;
      }
      throw ApiException.fromDioError(error);
    }
  }

  /// PATCH /api/customers/{id} - ویرایش مشتری
  Future<Customer> updateCustomer(
    String customerId,
    Map<String, dynamic> data,
  ) async {
    try {
      final response = await _dio.patch<Map<String, dynamic>>(
        '/customers/$customerId',
        data: data,
      );

      final body = response.data ?? <String, dynamic>{};
      final apiResponse = ApiResponse<Map<String, dynamic>>.fromJson(
        body,
        (json) => json as Map<String, dynamic>,
      );

      if (!apiResponse.success || apiResponse.data == null) {
        throw ApiException(
          apiResponse.message ?? 'خطا در ویرایش مشتری',
          statusCode: response.statusCode ?? 400,
          code: ApiErrorCode.fromString(apiResponse.code) ?? ApiErrorCode.validationError,
        );
      }

      return Customer.fromJson(apiResponse.data!);
    } catch (error) {
      if (error is ApiException) {
        rethrow;
      }
      throw ApiException.fromDioError(error);
    }
  }

  /// DELETE /api/customers/{id} - حذف مشتری
  Future<void> deleteCustomer(String customerId) async {
    try {
      await _dio.delete<Map<String, dynamic>>('/customers/$customerId');
    } catch (error) {
      throw ApiException.fromDioError(error);
    }
  }
}

