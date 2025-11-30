import 'package:hooks_riverpod/hooks_riverpod.dart';

import '../../../core/di/providers.dart';
import '../../../data/customers/models/paginated_list.dart';
import '../../../data/invoices/invoices_repository.dart';
import '../../../data/invoices/models/invoice.dart';
import '../../../data/invoices/models/invoice_status.dart';
import '../../../data/invoices/models/invoice_summary.dart';

/// Provider برای InvoicesRepository
final invoicesRepositoryProvider = Provider<InvoicesRepository>((ref) {
  final apiClient = ref.watch(apiClientProvider);
  return InvoicesRepository(apiClient);
});

/// فیلترهای لیست پیش‌فاکتورها
class InvoiceListFilters {
  const InvoiceListFilters({
    this.status,
    this.customerId,
    this.marketerId,
    this.startDate,
    this.endDate,
    this.page = 1,
    this.limit = 20,
  });

  final InvoiceStatus? status;
  final String? customerId;
  final String? marketerId;
  final DateTime? startDate;
  final DateTime? endDate;
  final int page;
  final int limit;

  InvoiceListFilters copyWith({
    InvoiceStatus? status,
    String? customerId,
    String? marketerId,
    DateTime? startDate,
    DateTime? endDate,
    int? page,
    int? limit,
  }) {
    return InvoiceListFilters(
      status: status ?? this.status,
      customerId: customerId ?? this.customerId,
      marketerId: marketerId ?? this.marketerId,
      startDate: startDate ?? this.startDate,
      endDate: endDate ?? this.endDate,
      page: page ?? this.page,
      limit: limit ?? this.limit,
    );
  }
}

/// Provider برای فیلترهای لیست پیش‌فاکتورها
final invoiceListFiltersProvider =
    StateProvider<InvoiceListFilters>((ref) => const InvoiceListFilters());

/// Provider برای لیست پیش‌فاکتورها
final invoicesListProvider = FutureProvider.family<
    PaginatedList<InvoiceSummary>,
    InvoiceListFilters>((ref, filters) async {
  final repo = ref.watch(invoicesRepositoryProvider);
  
  try {
    return await repo.listInvoices(
      customerId: filters.customerId,
      marketerId: filters.marketerId,
      status: filters.status,
      startDate: filters.startDate,
      endDate: filters.endDate,
      page: filters.page,
      limit: filters.limit,
    );
  } catch (error) {
    rethrow;
  }
});

/// Provider برای جزئیات یک پیش‌فاکتور
final invoiceDetailProvider = FutureProvider.family<Invoice, String>((ref, invoiceId) async {
  final repo = ref.watch(invoicesRepositoryProvider);
  return await repo.getInvoice(invoiceId);
});

