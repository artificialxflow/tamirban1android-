/// وضعیت پیش‌فاکتور
enum InvoiceStatus {
  draft('DRAFT'),
  sent('SENT'),
  paid('PAID'),
  overdue('OVERDUE'),
  cancelled('CANCELLED');

  const InvoiceStatus(this.value);

  final String value;

  static InvoiceStatus? fromString(String? value) {
    if (value == null) return null;
    return InvoiceStatus.values.firstWhere(
      (status) => status.value == value,
      orElse: () => InvoiceStatus.draft,
    );
  }

  String get displayName {
    switch (this) {
      case InvoiceStatus.draft:
        return 'پیش‌نویس';
      case InvoiceStatus.sent:
        return 'ارسال شده';
      case InvoiceStatus.paid:
        return 'پرداخت شده';
      case InvoiceStatus.overdue:
        return 'معوق';
      case InvoiceStatus.cancelled:
        return 'لغو شده';
    }
  }

  /// رنگ مناسب برای هر وضعیت
  String get colorClass {
    switch (this) {
      case InvoiceStatus.draft:
        return 'secondary';
      case InvoiceStatus.sent:
        return 'primary';
      case InvoiceStatus.paid:
        return 'success';
      case InvoiceStatus.overdue:
        return 'danger';
      case InvoiceStatus.cancelled:
        return 'danger';
    }
  }
}

