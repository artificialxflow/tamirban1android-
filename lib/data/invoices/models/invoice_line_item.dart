/// آیتم خط پیش‌فاکتور
class InvoiceLineItem {
  const InvoiceLineItem({
    required this.title,
    required this.quantity,
    required this.unitPrice,
    this.unit,
    this.taxRate,
    this.discount,
    this.productId,
    this.total,
  });

  final String title;
  final double quantity;
  final String? unit;
  final double unitPrice;
  final double? taxRate;
  final double? discount;
  final String? productId;
  final double? total; // محاسبه شده

  factory InvoiceLineItem.fromJson(Map<String, dynamic> json) {
    return InvoiceLineItem(
      title: json['title'] as String? ?? '',
      quantity: (json['quantity'] as num?)?.toDouble() ?? 0.0,
      unit: json['unit'] as String?,
      unitPrice: (json['unitPrice'] as num?)?.toDouble() ?? 0.0,
      taxRate: (json['taxRate'] as num?)?.toDouble(),
      discount: (json['discount'] as num?)?.toDouble(),
      productId: json['productId'] as String?,
      total: (json['total'] as num?)?.toDouble(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'title': title,
      'quantity': quantity,
      if (unit != null) 'unit': unit,
      'unitPrice': unitPrice,
      if (taxRate != null) 'taxRate': taxRate,
      if (discount != null) 'discount': discount,
      if (productId != null) 'productId': productId,
      if (total != null) 'total': total,
    };
  }

  /// محاسبه کل آیتم (با در نظر گیری تخفیف و مالیات)
  double calculateTotal() {
    final subtotal = quantity * unitPrice;
    final discountAmount = discount != null ? (subtotal * discount! / 100) : 0.0;
    final afterDiscount = subtotal - discountAmount;
    final taxAmount = taxRate != null ? (afterDiscount * taxRate! / 100) : 0.0;
    return afterDiscount + taxAmount;
  }
}

