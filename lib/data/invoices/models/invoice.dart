import 'invoice_line_item.dart';
import 'invoice_status.dart';
import 'invoice_summary.dart';

/// مدل کامل پیش‌فاکتور
class Invoice {
  const Invoice({
    required this.id,
    required this.customerId,
    required this.status,
    required this.issuedAt,
    required this.dueAt,
    required this.items,
    required this.subtotal,
    required this.taxTotal,
    required this.grandTotal,
    this.marketerId,
    this.currency = 'IRR',
    this.discountTotal,
    this.paymentReference,
    this.paidAt,
    this.createdAt,
    this.updatedAt,
  });

  final String id;
  final String customerId;
  final String? marketerId;
  final InvoiceStatus status;
  final DateTime issuedAt;
  final DateTime dueAt;
  final String currency;
  final List<InvoiceLineItem> items;
  final double subtotal;
  final double taxTotal;
  final double? discountTotal;
  final double grandTotal;
  final String? paymentReference;
  final DateTime? paidAt;
  final DateTime? createdAt;
  final DateTime? updatedAt;

  factory Invoice.fromJson(Map<String, dynamic> json) {
    return Invoice(
      id: (json['id'] ?? json['_id'] ?? '').toString(),
      customerId: json['customerId'] as String? ?? '',
      marketerId: json['marketerId'] as String?,
      status: InvoiceStatus.fromString(json['status'] as String?) ?? InvoiceStatus.draft,
      issuedAt: json['issuedAt'] != null
          ? DateTime.tryParse(json['issuedAt'].toString()) ?? DateTime.now()
          : DateTime.now(),
      dueAt: json['dueAt'] != null
          ? DateTime.tryParse(json['dueAt'].toString()) ?? DateTime.now()
          : DateTime.now(),
      currency: json['currency'] as String? ?? 'IRR',
      items: (json['items'] as List<dynamic>?)
              ?.map((e) => InvoiceLineItem.fromJson(e as Map<String, dynamic>))
              .toList() ??
          [],
      subtotal: (json['subtotal'] as num?)?.toDouble() ?? 0.0,
      taxTotal: (json['taxTotal'] as num?)?.toDouble() ?? 0.0,
      discountTotal: (json['discountTotal'] as num?)?.toDouble(),
      grandTotal: (json['grandTotal'] as num?)?.toDouble() ?? 0.0,
      paymentReference: json['paymentReference'] as String?,
      paidAt: json['paidAt'] != null
          ? DateTime.tryParse(json['paidAt'].toString())
          : null,
      createdAt: json['createdAt'] != null
          ? DateTime.tryParse(json['createdAt'].toString())
          : null,
      updatedAt: json['updatedAt'] != null
          ? DateTime.tryParse(json['updatedAt'].toString())
          : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'customerId': customerId,
      if (marketerId != null) 'marketerId': marketerId,
      'status': status.value,
      'issuedAt': issuedAt.toIso8601String(),
      'dueAt': dueAt.toIso8601String(),
      'currency': currency,
      'items': items.map((e) => e.toJson()).toList(),
      'subtotal': subtotal,
      'taxTotal': taxTotal,
      if (discountTotal != null) 'discountTotal': discountTotal,
      'grandTotal': grandTotal,
      if (paymentReference != null) 'paymentReference': paymentReference,
      if (paidAt != null) 'paidAt': paidAt!.toIso8601String(),
      if (createdAt != null) 'createdAt': createdAt!.toIso8601String(),
      if (updatedAt != null) 'updatedAt': updatedAt!.toIso8601String(),
    };
  }

  /// تبدیل به InvoiceSummary (برای استفاده در لیست)
  InvoiceSummary toSummary({
    required String customerName,
    String? marketerName,
  }) {
    return InvoiceSummary(
      id: id,
      customerId: customerId,
      customerName: customerName,
      marketerId: marketerId,
      marketerName: marketerName,
      status: status,
      issuedAt: issuedAt,
      dueAt: dueAt,
      currency: currency,
      grandTotal: grandTotal,
      paidAt: paidAt,
      paymentReference: paymentReference,
    );
  }
}

