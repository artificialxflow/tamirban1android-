import 'visit_status.dart';
import 'visit_summary.dart';

/// مدل کامل ویزیت
class Visit {
  const Visit({
    required this.id,
    required this.customerId,
    required this.marketerId,
    required this.scheduledAt,
    required this.status,
    this.completedAt,
    this.topics = const [],
    this.notes,
    this.locationSnapshot,
    this.followUpAction,
    this.createdAt,
    this.updatedAt,
  });

  final String id;
  final String customerId;
  final String marketerId;
  final DateTime scheduledAt;
  final DateTime? completedAt;
  final VisitStatus status;
  final List<String> topics;
  final String? notes;
  final LocationSnapshot? locationSnapshot;
  final String? followUpAction;
  final DateTime? createdAt;
  final DateTime? updatedAt;

  factory Visit.fromJson(Map<String, dynamic> json) {
    return Visit(
      id: (json['id'] ?? json['_id'] ?? '').toString(),
      customerId: json['customerId'] as String? ?? '',
      marketerId: json['marketerId'] as String? ?? '',
      scheduledAt: json['scheduledAt'] != null
          ? DateTime.tryParse(json['scheduledAt'].toString()) ?? DateTime.now()
          : DateTime.now(),
      completedAt: json['completedAt'] != null
          ? DateTime.tryParse(json['completedAt'].toString())
          : null,
      status: VisitStatus.fromString(json['status'] as String?) ?? VisitStatus.scheduled,
      topics: (json['topics'] as List<dynamic>?)?.map((e) => e.toString()).toList() ?? [],
      notes: json['notes'] as String?,
      locationSnapshot: json['locationSnapshot'] != null
          ? LocationSnapshot.fromJson(json['locationSnapshot'] as Map<String, dynamic>)
          : null,
      followUpAction: json['followUpAction'] as String?,
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
      'marketerId': marketerId,
      'scheduledAt': scheduledAt.toIso8601String(),
      if (completedAt != null) 'completedAt': completedAt!.toIso8601String(),
      'status': status.value,
      'topics': topics,
      if (notes != null) 'notes': notes,
      if (locationSnapshot != null) 'locationSnapshot': locationSnapshot!.toJson(),
      if (followUpAction != null) 'followUpAction': followUpAction,
      if (createdAt != null) 'createdAt': createdAt!.toIso8601String(),
      if (updatedAt != null) 'updatedAt': updatedAt!.toIso8601String(),
    };
  }

  /// تبدیل به VisitSummary (برای استفاده در لیست)
  VisitSummary toSummary({
    required String customerName,
    String? marketerName,
  }) {
    return VisitSummary(
      id: id,
      customerId: customerId,
      customerName: customerName,
      marketerId: marketerId,
      marketerName: marketerName,
      scheduledAt: scheduledAt,
      completedAt: completedAt,
      status: status,
      topics: topics,
      notes: notes,
      followUpAction: followUpAction,
      locationSnapshot: locationSnapshot,
    );
  }
}
