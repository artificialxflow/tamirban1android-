import 'invoice_status.dart';

/// خلاصه اطلاعات پیش‌فاکتور برای نمایش در لیست
class InvoiceSummary {
  const InvoiceSummary({
    required this.id,
    required this.customerId,
    required this.customerName,
    required this.status,
    required this.issuedAt,
    required this.dueAt,
    required this.grandTotal,
    this.marketerId,
    this.marketerName,
    this.currency = 'IRR',
    this.paidAt,
    this.paymentReference,
  });

  final String id;
  final String customerId;
  final String customerName;
  final String? marketerId;
  final String? marketerName;
  final InvoiceStatus status;
  final DateTime issuedAt;
  final DateTime dueAt;
  final String currency;
  final double grandTotal;
  final DateTime? paidAt;
  final String? paymentReference;

  factory InvoiceSummary.fromJson(Map<String, dynamic> json) {
    return InvoiceSummary(
      id: (json['id'] ?? json['_id'] ?? '').toString(),
      customerId: json['customerId'] as String? ?? '',
      customerName: json['customerName'] ?? json['customer']?['displayName'] ?? 'مشتری ناشناس',
      marketerId: json['marketerId'] as String?,
      marketerName: json['marketerName'] ?? json['marketer']?['name'],
      status: InvoiceStatus.fromString(json['status'] as String?) ?? InvoiceStatus.draft,
      issuedAt: json['issuedAt'] != null
          ? DateTime.tryParse(json['issuedAt'].toString()) ?? DateTime.now()
          : DateTime.now(),
      dueAt: json['dueAt'] != null
          ? DateTime.tryParse(json['dueAt'].toString()) ?? DateTime.now()
          : DateTime.now(),
      currency: json['currency'] as String? ?? 'IRR',
      grandTotal: (json['grandTotal'] as num?)?.toDouble() ?? 0.0,
      paidAt: json['paidAt'] != null
          ? DateTime.tryParse(json['paidAt'].toString())
          : null,
      paymentReference: json['paymentReference'] as String?,
    );
  }
}

