import 'package:hooks_riverpod/hooks_riverpod.dart';

import '../../../core/di/providers.dart';
import '../../../data/customers/customers_repository.dart';
import '../../../data/customers/models/customer.dart';
import '../../../data/customers/models/customer_summary.dart';
import '../../../data/customers/models/customer_status.dart';
import '../../../data/customers/models/paginated_list.dart';

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
final customersListProvider = FutureProvider.family<
    PaginatedList<CustomerSummary>,
    CustomerListFilters>((ref, filters) async {
  final repo = ref.watch(customersRepositoryProvider);
  return await repo.listCustomers(
    status: filters.status,
    marketerId: filters.marketerId,
    search: filters.search,
    city: filters.city,
    page: filters.page,
    limit: filters.limit,
  );
});

/// Provider برای جزئیات یک مشتری
final customerDetailProvider = FutureProvider.family<Customer, String>((ref, customerId) async {
  final repo = ref.watch(customersRepositoryProvider);
  return await repo.getCustomer(customerId);
});

