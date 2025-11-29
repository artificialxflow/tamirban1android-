import 'customer_status.dart';

/// خلاصه اطلاعات مشتری برای نمایش در لیست
class CustomerSummary {
  const CustomerSummary({
    required this.id,
    required this.code,
    required this.name,
    required this.status,
    this.marketer,
    this.city,
    this.lastVisitAt,
    this.grade,
    this.monthlyRevenue,
    this.tags = const [],
  });

  final String id;
  final String code;
  final String name;
  final String? marketer;
  final String? city;
  final DateTime? lastVisitAt;
  final CustomerStatus status;
  final String? grade; // "A" | "B" | "C" | "D"
  final double? monthlyRevenue;
  final List<String> tags;

  factory CustomerSummary.fromJson(Map<String, dynamic> json) {
    return CustomerSummary(
      id: (json['id'] ?? json['_id'] ?? '').toString(),
      code: json['code'] as String? ?? '',
      name: json['name'] ?? json['displayName'] ?? '',
      marketer: json['marketer'] ?? json['assignedMarketerName'] as String?,
      city: json['city'] as String?,
      lastVisitAt: json['lastVisitAt'] != null
          ? DateTime.tryParse(json['lastVisitAt'].toString())
          : null,
      status: CustomerStatus.fromString(json['status'] as String?) ?? CustomerStatus.active,
      grade: json['grade'] as String?,
      monthlyRevenue: (json['monthlyRevenue'] ?? json['revenueMonthly'] as num?)?.toDouble(),
      tags: (json['tags'] as List<dynamic>?)?.map((e) => e.toString()).toList() ?? [],
    );
  }
}

