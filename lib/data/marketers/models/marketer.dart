import 'marketer_summary.dart';

/// مدل کامل بازاریاب
class Marketer {
  const Marketer({
    required this.id,
    required this.userId,
    required this.fullName,
    required this.mobile,
    required this.role,
    required this.region,
    required this.isActive,
    required this.assignedCustomers,
    this.email,
    this.performanceScore,
    this.lastVisitAt,
    this.createdAt,
    this.updatedAt,
  });

  final String id;
  final String userId;
  final String fullName;
  final String mobile;
  final String? email;
  final String role;
  final String region;
  final bool isActive;
  final List<String> assignedCustomers;
  final double? performanceScore;
  final DateTime? lastVisitAt;
  final DateTime? createdAt;
  final DateTime? updatedAt;

  factory Marketer.fromJson(Map<String, dynamic> json) {
    return Marketer(
      id: (json['id'] ?? json['_id'] ?? json['userId'] ?? '').toString(),
      userId: (json['userId'] ?? json['id'] ?? json['_id'] ?? '').toString(),
      fullName: json['fullName'] as String? ?? '',
      mobile: json['mobile'] as String? ?? '',
      email: json['email'] as String?,
      role: json['role'] as String? ?? 'MARKETER',
      region: json['region'] as String? ?? 'نامشخص',
      isActive: json['isActive'] as bool? ?? true,
      assignedCustomers: (json['assignedCustomers'] as List<dynamic>?)
              ?.map((e) => e.toString())
              .toList() ??
          [],
      performanceScore: (json['performanceScore'] as num?)?.toDouble(),
      lastVisitAt: json['lastVisitAt'] != null
          ? DateTime.tryParse(json['lastVisitAt'].toString())
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
      'userId': userId,
      'fullName': fullName,
      'mobile': mobile,
      if (email != null) 'email': email,
      'role': role,
      'region': region,
      'isActive': isActive,
      'assignedCustomers': assignedCustomers,
      if (performanceScore != null) 'performanceScore': performanceScore,
      if (lastVisitAt != null) 'lastVisitAt': lastVisitAt!.toIso8601String(),
      if (createdAt != null) 'createdAt': createdAt!.toIso8601String(),
      if (updatedAt != null) 'updatedAt': updatedAt!.toIso8601String(),
    };
  }

  /// تبدیل به MarketerSummary (برای استفاده در لیست)
  MarketerSummary toSummary() {
    return MarketerSummary(
      id: id,
      userId: userId,
      fullName: fullName,
      mobile: mobile,
      email: email,
      role: role,
      region: region,
      isActive: isActive,
      assignedCustomersCount: assignedCustomers.length,
      performanceScore: performanceScore,
      lastVisitAt: lastVisitAt,
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

