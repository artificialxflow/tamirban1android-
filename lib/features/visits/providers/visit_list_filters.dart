import '../../../data/visits/models/visit_status.dart';

/// فیلترهای لیست ویزیت‌ها
class VisitListFilters {
  const VisitListFilters({
    this.customerId,
    this.marketerId,
    this.status,
    this.startDate,
    this.endDate,
    this.page = 1,
    this.limit = 20,
  });

  final String? customerId;
  final String? marketerId;
  final VisitStatus? status;
  final DateTime? startDate;
  final DateTime? endDate;
  final int page;
  final int limit;

  VisitListFilters copyWith({
    String? customerId,
    String? marketerId,
    VisitStatus? status,
    DateTime? startDate,
    DateTime? endDate,
    int? page,
    int? limit,
  }) {
    return VisitListFilters(
      customerId: customerId ?? this.customerId,
      marketerId: marketerId ?? this.marketerId,
      status: status ?? this.status,
      startDate: startDate ?? this.startDate,
      endDate: endDate ?? this.endDate,
      page: page ?? this.page,
      limit: limit ?? this.limit,
    );
  }
}
