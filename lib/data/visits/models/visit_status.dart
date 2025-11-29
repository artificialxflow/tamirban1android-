/// وضعیت ویزیت
enum VisitStatus {
  scheduled('SCHEDULED'),
  inProgress('IN_PROGRESS'),
  completed('COMPLETED'),
  cancelled('CANCELLED');

  const VisitStatus(this.value);

  final String value;

  static VisitStatus? fromString(String? value) {
    if (value == null) return null;
    return VisitStatus.values.firstWhere(
      (status) => status.value == value,
      orElse: () => VisitStatus.scheduled,
    );
  }

  String get displayName {
    switch (this) {
      case VisitStatus.scheduled:
        return 'برنامه‌ریزی شده';
      case VisitStatus.inProgress:
        return 'در حال انجام';
      case VisitStatus.completed:
        return 'تکمیل شده';
      case VisitStatus.cancelled:
        return 'لغو شده';
    }
  }

  /// رنگ مناسب برای هر وضعیت
  String get colorClass {
    switch (this) {
      case VisitStatus.scheduled:
        return 'primary';
      case VisitStatus.inProgress:
        return 'warning';
      case VisitStatus.completed:
        return 'success';
      case VisitStatus.cancelled:
        return 'danger';
    }
  }
}
