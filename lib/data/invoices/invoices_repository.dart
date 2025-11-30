import 'package:dio/dio.dart';

import '../../core/errors/api_error.dart';
import '../../core/network/api_client.dart';
import '../../core/network/api_response.dart';
import '../customers/models/paginated_list.dart';
import 'models/invoice.dart';
import 'models/invoice_status.dart';
import 'models/invoice_summary.dart';

/// Repository برای مدیریت عملیات مربوط به پیش‌فاکتورها
class InvoicesRepository {
  InvoicesRepository(this._client);

  final ApiClient _client;
  Dio get _dio => _client.dio;

  /// GET /api/invoices - لیست پیش‌فاکتورها با فیلتر و pagination
  Future<PaginatedList<InvoiceSummary>> listInvoices({
    String? customerId,
    String? marketerId,
    InvoiceStatus? status,
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
        '/invoices',
        queryParameters: queryParameters,
      );

      final body = response.data ?? <String, dynamic>{};
      final apiResponse = ApiResponse<Map<String, dynamic>>.fromJson(
        body,
        (json) => json as Map<String, dynamic>,
      );

      if (!apiResponse.success || apiResponse.data == null) {
        throw ApiException(
          apiResponse.message ?? 'خطا در دریافت لیست پیش‌فاکتورها',
          statusCode: response.statusCode ?? 400,
          code: ApiErrorCode.fromString(apiResponse.code) ?? ApiErrorCode.internalServerError,
        );
      }

      final dataMap = apiResponse.data!;
      return PaginatedList.fromJson(
        dataMap,
        (json) => InvoiceSummary.fromJson(json),
      );
    } catch (error) {
      if (error is ApiException) {
        rethrow;
      }
      throw ApiException.fromDioError(error);
    }
  }

  /// GET /api/invoices/{id} - دریافت جزئیات پیش‌فاکتور
  Future<Invoice> getInvoice(String invoiceId) async {
    try {
      final response = await _dio.get<Map<String, dynamic>>(
        '/invoices/$invoiceId',
      );

      final body = response.data ?? <String, dynamic>{};
      final apiResponse = ApiResponse<Map<String, dynamic>>.fromJson(
        body,
        (json) => json as Map<String, dynamic>,
      );

      if (!apiResponse.success || apiResponse.data == null) {
        throw ApiException(
          apiResponse.message ?? 'پیش‌فاکتور یافت نشد',
          statusCode: response.statusCode ?? 404,
          code: ApiErrorCode.fromString(apiResponse.code) ?? ApiErrorCode.notFound,
        );
      }

      return Invoice.fromJson(apiResponse.data!);
    } catch (error) {
      if (error is ApiException) {
        rethrow;
      }
      throw ApiException.fromDioError(error);
    }
  }

  /// POST /api/invoices - ایجاد پیش‌فاکتور جدید
  Future<Invoice> createInvoice(Map<String, dynamic> data) async {
    try {
      final response = await _dio.post<Map<String, dynamic>>(
        '/invoices',
        data: data,
      );

      final body = response.data ?? <String, dynamic>{};
      final apiResponse = ApiResponse<Map<String, dynamic>>.fromJson(
        body,
        (json) => json as Map<String, dynamic>,
      );

      if (!apiResponse.success || apiResponse.data == null) {
        throw ApiException(
          apiResponse.message ?? 'خطا در ایجاد پیش‌فاکتور',
          statusCode: response.statusCode ?? 400,
          code: ApiErrorCode.fromString(apiResponse.code) ?? ApiErrorCode.validationError,
        );
      }

      return Invoice.fromJson(apiResponse.data!);
    } catch (error) {
      if (error is ApiException) {
        rethrow;
      }
      throw ApiException.fromDioError(error);
    }
  }

  /// PATCH /api/invoices/{id} - ویرایش پیش‌فاکتور
  Future<Invoice> updateInvoice(
    String invoiceId,
    Map<String, dynamic> data,
  ) async {
    try {
      final response = await _dio.patch<Map<String, dynamic>>(
        '/invoices/$invoiceId',
        data: data,
      );

      final body = response.data ?? <String, dynamic>{};
      final apiResponse = ApiResponse<Map<String, dynamic>>.fromJson(
        body,
        (json) => json as Map<String, dynamic>,
      );

      if (!apiResponse.success || apiResponse.data == null) {
        throw ApiException(
          apiResponse.message ?? 'خطا در به‌روزرسانی پیش‌فاکتور',
          statusCode: response.statusCode ?? 400,
          code: ApiErrorCode.fromString(apiResponse.code) ?? ApiErrorCode.validationError,
        );
      }

      return Invoice.fromJson(apiResponse.data!);
    } catch (error) {
      if (error is ApiException) {
        rethrow;
      }
      throw ApiException.fromDioError(error);
    }
  }

  /// PATCH /api/invoices/{id}/status - تغییر وضعیت پیش‌فاکتور
  Future<Invoice> changeInvoiceStatus(
    String invoiceId,
    InvoiceStatus status, {
    DateTime? paidAt,
    String? paymentReference,
  }) async {
    try {
      final data = <String, dynamic>{
        'status': status.value,
      };
      if (paidAt != null) {
        data['paidAt'] = paidAt.toIso8601String();
      }
      if (paymentReference != null) {
        data['paymentReference'] = paymentReference;
      }

      final response = await _dio.patch<Map<String, dynamic>>(
        '/invoices/$invoiceId/status',
        data: data,
      );

      final body = response.data ?? <String, dynamic>{};
      final apiResponse = ApiResponse<Map<String, dynamic>>.fromJson(
        body,
        (json) => json as Map<String, dynamic>,
      );

      if (!apiResponse.success || apiResponse.data == null) {
        throw ApiException(
          apiResponse.message ?? 'خطا در تغییر وضعیت پیش‌فاکتور',
          statusCode: response.statusCode ?? 400,
          code: ApiErrorCode.fromString(apiResponse.code) ?? ApiErrorCode.validationError,
        );
      }

      return Invoice.fromJson(apiResponse.data!);
    } catch (error) {
      if (error is ApiException) {
        rethrow;
      }
      throw ApiException.fromDioError(error);
    }
  }

  /// DELETE /api/invoices/{id} - حذف پیش‌فاکتور
  Future<void> deleteInvoice(String invoiceId) async {
    try {
      await _dio.delete<Map<String, dynamic>>(
        '/invoices/$invoiceId',
      );
    } catch (error) {
      throw ApiException.fromDioError(error);
    }
  }

  /// GET /api/invoices/{id}/pdf - دانلود PDF پیش‌فاکتور
  Future<List<int>> downloadInvoicePdf(String invoiceId) async {
    try {
      final response = await _dio.get<List<int>>(
        '/invoices/$invoiceId/pdf',
        options: Options(
          responseType: ResponseType.bytes,
        ),
      );

      return response.data ?? [];
    } catch (error) {
      throw ApiException.fromDioError(error);
    }
  }
}

