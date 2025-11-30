import 'package:hooks_riverpod/hooks_riverpod.dart';

import '../../../core/di/providers.dart';
import '../../../data/customers/models/paginated_list.dart';
import '../../../data/marketers/marketers_repository.dart';
import '../../../data/marketers/models/marketer.dart';
import '../../../data/marketers/models/marketer_summary.dart';

/// Provider برای MarketersRepository
final marketersRepositoryProvider = Provider<MarketersRepository>((ref) {
  final apiClient = ref.watch(apiClientProvider);
  return MarketersRepository(apiClient);
});

/// فیلترهای لیست بازاریاب‌ها
class MarketerListFilters {
  const MarketerListFilters({
    this.region,
    this.isActive,
    this.page = 1,
    this.limit = 20,
  });

  final String? region;
  final bool? isActive;
  final int page;
  final int limit;

  MarketerListFilters copyWith({
    String? region,
    bool? isActive,
    int? page,
    int? limit,
  }) {
    return MarketerListFilters(
      region: region ?? this.region,
      isActive: isActive ?? this.isActive,
      page: page ?? this.page,
      limit: limit ?? this.limit,
    );
  }
}

/// Provider برای فیلترهای لیست بازاریاب‌ها
final marketerListFiltersProvider =
    StateProvider<MarketerListFilters>((ref) => const MarketerListFilters());

/// Provider برای لیست بازاریاب‌ها
final marketersListProvider = FutureProvider.family<
    PaginatedList<MarketerSummary>,
    MarketerListFilters>((ref, filters) async {
  final repo = ref.watch(marketersRepositoryProvider);
  
  try {
    return await repo.listMarketers(
      region: filters.region,
      isActive: filters.isActive,
      page: filters.page,
      limit: filters.limit,
    );
  } catch (error) {
    rethrow;
  }
});

/// Provider برای جزئیات یک بازاریاب
final marketerDetailProvider = FutureProvider.family<Marketer, String>((ref, marketerId) async {
  final repo = ref.watch(marketersRepositoryProvider);
  return await repo.getMarketer(marketerId);
});

