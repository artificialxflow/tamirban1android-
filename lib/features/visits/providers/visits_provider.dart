import 'package:hooks_riverpod/hooks_riverpod.dart';

import '../../../core/di/providers.dart';
import '../../../data/customers/models/paginated_list.dart';
import '../../../data/visits/models/visit.dart';
import '../../../data/visits/models/visit_summary.dart';
import '../../../data/visits/visits_repository.dart';
import 'visit_list_filters.dart';

/// Provider برای VisitsRepository
final visitsRepositoryProvider = Provider<VisitsRepository>((ref) {
  final apiClient = ref.watch(apiClientProvider);
  return VisitsRepository(apiClient);
});

/// Provider برای فیلترهای لیست ویزیت‌ها
final visitListFiltersProvider =
    StateProvider<VisitListFilters>((ref) => const VisitListFilters());

/// Provider برای لیست ویزیت‌ها
/// در حالت Offline Mode، اگر خطای Connection باشد، داده‌های Mock نمایش داده می‌شود
final visitsListProvider = FutureProvider.family<
    PaginatedList<VisitSummary>,
    VisitListFilters>((ref, filters) async {
  final repo = ref.watch(visitsRepositoryProvider);
  
  try {
    return await repo.listVisits(
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

/// Provider برای جزئیات یک ویزیت
final visitDetailProvider = FutureProvider.family<Visit, String>((ref, visitId) async {
  final repo = ref.watch(visitsRepositoryProvider);
  return await repo.getVisit(visitId);
});
