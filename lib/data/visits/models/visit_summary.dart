import 'visit_status.dart';

/// خلاصه اطلاعات ویزیت برای نمایش در لیست
class VisitSummary {
  const VisitSummary({
    required this.id,
    required this.customerId,
    required this.customerName,
    required this.marketerId,
    required this.scheduledAt,
    required this.status,
    this.marketerName,
    this.completedAt,
    this.topics = const [],
    this.notes,
    this.followUpAction,
    this.locationSnapshot,
  });

  final String id;
  final String customerId;
  final String customerName;
  final String marketerId;
  final String? marketerName;
  final DateTime scheduledAt;
  final DateTime? completedAt;
  final VisitStatus status;
  final List<String> topics;
  final String? notes;
  final String? followUpAction;
  final LocationSnapshot? locationSnapshot;

  factory VisitSummary.fromJson(Map<String, dynamic> json) {
    return VisitSummary(
      id: (json['id'] ?? json['_id'] ?? '').toString(),
      customerId: json['customerId'] as String? ?? '',
      customerName: json['customerName'] as String? ?? 'مشتری ناشناس',
      marketerId: json['marketerId'] as String? ?? '',
      marketerName: json['marketerName'] as String?,
      scheduledAt: json['scheduledAt'] != null
          ? DateTime.tryParse(json['scheduledAt'].toString()) ?? DateTime.now()
          : DateTime.now(),
      completedAt: json['completedAt'] != null
          ? DateTime.tryParse(json['completedAt'].toString())
          : null,
      status: VisitStatus.fromString(json['status'] as String?) ?? VisitStatus.scheduled,
      topics: (json['topics'] as List<dynamic>?)?.map((e) => e.toString()).toList() ?? [],
      notes: json['notes'] as String?,
      followUpAction: json['followUpAction'] as String?,
      locationSnapshot: json['locationSnapshot'] != null
          ? LocationSnapshot.fromJson(json['locationSnapshot'] as Map<String, dynamic>)
          : null,
    );
  }
}

/// موقعیت لحظه‌ای ویزیت (Snapshot)
class LocationSnapshot {
  const LocationSnapshot({
    required this.latitude,
    required this.longitude,
    this.address,
  });

  final double latitude;
  final double longitude;
  final String? address;

  factory LocationSnapshot.fromJson(Map<String, dynamic> json) {
    return LocationSnapshot(
      latitude: (json['latitude'] as num?)?.toDouble() ?? 0.0,
      longitude: (json['longitude'] as num?)?.toDouble() ?? 0.0,
      address: json['address'] ?? json['addressLine'] as String?,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'latitude': latitude,
      'longitude': longitude,
      if (address != null) 'address': address,
    };
  }
}
