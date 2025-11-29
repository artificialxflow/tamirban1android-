import 'package:hooks_riverpod/hooks_riverpod.dart';

import '../../../core/config/app_environment.dart';
import '../../../core/di/providers.dart';
import '../../../core/errors/api_error.dart';
import '../../../data/customers/customers_repository.dart';
import '../../../data/customers/models/customer.dart';
import '../../../data/customers/models/customer_summary.dart';
import '../../../data/customers/models/customer_status.dart';
import '../../../data/customers/models/paginated_list.dart';
import 'mock_customers_data.dart';

/// Provider برای CustomersRepository
final customersRepositoryProvider = Provider<CustomersRepository>((ref) {
  final apiClient = ref.watch(apiClientProvider);
  return CustomersRepository(apiClient);
});

/// فیلترهای لیست مشتری‌ها
class CustomerListFilters {
  const CustomerListFilters({
    this.status,
    this.marketerId,
    this.search,
    this.city,
    this.page = 1,
    this.limit = 20,
  });

  final CustomerStatus? status;
  final String? marketerId;
  final String? search;
  final String? city;
  final int page;
  final int limit;

  CustomerListFilters copyWith({
    CustomerStatus? status,
    String? marketerId,
    String? search,
    String? city,
    int? page,
    int? limit,
  }) {
    return CustomerListFilters(
      status: status ?? this.status,
      marketerId: marketerId ?? this.marketerId,
      search: search ?? this.search,
      city: city ?? this.city,
      page: page ?? this.page,
      limit: limit ?? this.limit,
    );
  }
}

/// Provider برای فیلترهای لیست مشتری‌ها
final customerListFiltersProvider =
    StateProvider<CustomerListFilters>((ref) => const CustomerListFilters());

/// Provider برای لیست مشتری‌ها
/// در حالت Offline Mode، اگر خطای Connection باشد، داده‌های Mock نمایش داده می‌شود
final customersListProvider = FutureProvider.family<
    PaginatedList<CustomerSummary>,
    CustomerListFilters>((ref, filters) async {
  final repo = ref.watch(customersRepositoryProvider);
  
  try {
    return await repo.listCustomers(
      status: filters.status,
      marketerId: filters.marketerId,
      search: filters.search,
      city: filters.city,
      page: filters.page,
      limit: filters.limit,
    );
  } catch (error) {
    // اگر Offline Mode فعال باشد و خطای Connection باشد، داده‌های Mock استفاده کنیم
    if (AppConfig.enableOfflineMode && error is ApiException) {
      final apiError = error as ApiException;
      if (apiError.code == ApiErrorCode.internalServerError &&
          (apiError.message.contains('Connection refused') ||
           apiError.message.contains('در دسترس نیست') ||
           apiError.message.contains('خطا در اتصال'))) {
        // استفاده از Mock Data
        return MockCustomersData.getMockPaginatedList(
          status: filters.status,
          search: filters.search,
          city: filters.city,
          page: filters.page,
          limit: filters.limit,
        );
      }
    }
    // در غیر این صورت، خطا را throw می‌کنیم
    rethrow;
  }
});

/// Provider برای جزئیات یک مشتری
final customerDetailProvider = FutureProvider.family<Customer, String>((ref, customerId) async {
  final repo = ref.watch(customersRepositoryProvider);
  return await repo.getCustomer(customerId);
});

