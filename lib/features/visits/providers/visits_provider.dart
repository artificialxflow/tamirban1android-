import 'package:hooks_riverpod/hooks_riverpod.dart';

import '../../../core/config/app_environment.dart';
import '../../../core/di/providers.dart';
import '../../../core/errors/api_error.dart';
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
    // اگر Offline Mode فعال باشد و خطای Connection باشد، داده‌های Mock استفاده کنیم
    if (AppConfig.enableOfflineMode && error is ApiException) {
      final apiError = error;
      if (apiError.code == ApiErrorCode.internalServerError &&
          (apiError.message.contains('Connection refused') ||
           apiError.message.contains('در دسترس نیست') ||
           apiError.message.contains('خطا در اتصال'))) {
        // TODO: استفاده از Mock Data (بعداً اضافه می‌شود)
        rethrow;
      }
    }
    // در غیر این صورت، خطا را throw می‌کنیم
    rethrow;
  }
});

/// Provider برای جزئیات یک ویزیت
final visitDetailProvider = FutureProvider.family<Visit, String>((ref, visitId) async {
  final repo = ref.watch(visitsRepositoryProvider);
  return await repo.getVisit(visitId);
});
