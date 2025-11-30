/// خلاصه اطلاعات بازاریاب برای نمایش در لیست
class MarketerSummary {
  const MarketerSummary({
    required this.id,
    required this.userId,
    required this.fullName,
    required this.mobile,
    required this.role,
    required this.region,
    required this.isActive,
    required this.assignedCustomersCount,
    this.email,
    this.performanceScore,
    this.lastVisitAt,
  });

  final String id;
  final String userId;
  final String fullName;
  final String mobile;
  final String? email;
  final String role; // SUPER_ADMIN, FINANCE_MANAGER, MARKETER, CUSTOMER
  final String region;
  final bool isActive;
  final int assignedCustomersCount;
  final double? performanceScore;
  final DateTime? lastVisitAt;

  factory MarketerSummary.fromJson(Map<String, dynamic> json) {
    return MarketerSummary(
      id: (json['id'] ?? json['_id'] ?? json['userId'] ?? '').toString(),
      userId: (json['userId'] ?? json['id'] ?? json['_id'] ?? '').toString(),
      fullName: json['fullName'] as String? ?? '',
      mobile: json['mobile'] as String? ?? '',
      email: json['email'] as String?,
      role: json['role'] as String? ?? 'MARKETER',
      region: json['region'] as String? ?? 'نامشخص',
      isActive: json['isActive'] as bool? ?? true,
      assignedCustomersCount: (json['assignedCustomersCount'] as num?)?.toInt() ?? 0,
      performanceScore: (json['performanceScore'] as num?)?.toDouble(),
      lastVisitAt: json['lastVisitAt'] != null
          ? DateTime.tryParse(json['lastVisitAt'].toString())
          : null,
    );
  }

  String get roleDisplayName {
    switch (role) {
      case 'SUPER_ADMIN':
        return 'مدیر کل';
      case 'FINANCE_MANAGER':
        return 'مدیر مالی';
      case 'MARKETER':
        return 'بازاریاب';
      case 'CUSTOMER':
        return 'مشتری';
      default:
        return role;
    }
  }
}

