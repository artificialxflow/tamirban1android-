/// وضعیت مشتری
enum CustomerStatus {
  active('ACTIVE'),
  inactive('INACTIVE'),
  pending('PENDING'),
  atRisk('AT_RISK'),
  loyal('LOYAL'),
  suspended('SUSPENDED');

  const CustomerStatus(this.value);

  final String value;

  static CustomerStatus? fromString(String? value) {
    if (value == null) return null;
    return CustomerStatus.values.firstWhere(
      (status) => status.value == value,
      orElse: () => CustomerStatus.active,
    );
  }

  String get displayName {
    switch (this) {
      case CustomerStatus.active:
        return 'فعال';
      case CustomerStatus.inactive:
        return 'غیرفعال';
      case CustomerStatus.pending:
        return 'در انتظار';
      case CustomerStatus.atRisk:
        return 'در معرض خطر';
      case CustomerStatus.loyal:
        return 'وفادار';
      case CustomerStatus.suspended:
        return 'تعلیق شده';
    }
  }
}

