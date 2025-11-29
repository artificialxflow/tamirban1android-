import 'contact_info.dart';
import 'customer_status.dart';
import 'geo_location.dart';

/// مدل مشتری
class Customer {
  const Customer({
    required this.id,
    required this.code,
    required this.displayName,
    required this.contact,
    required this.status,
    this.legalName,
    this.assignedMarketerId,
    this.assignedMarketerName,
    this.tags = const [],
    this.lastVisitAt,
    this.revenueMonthly,
    this.loyaltyScore,
    this.grade,
    this.geoLocation,
    this.notes,
    this.createdAt,
    this.updatedAt,
  });

  final String id;
  final String code;
  final String displayName;
  final String? legalName;
  final ContactInfo contact;
  final String? assignedMarketerId;
  final String? assignedMarketerName;
  final CustomerStatus status;
  final List<String> tags;
  final DateTime? lastVisitAt;
  final double? revenueMonthly;
  final int? loyaltyScore;
  final String? grade; // "A" | "B" | "C" | "D"
  final GeoLocation? geoLocation;
  final String? notes;
  final DateTime? createdAt;
  final DateTime? updatedAt;

  factory Customer.fromJson(Map<String, dynamic> json) {
    return Customer(
      id: (json['id'] ?? json['_id'] ?? '').toString(),
      code: json['code'] as String? ?? '',
      displayName: json['displayName'] as String? ?? '',
      legalName: json['legalName'] as String?,
      contact: ContactInfo.fromJson(json['contact'] as Map<String, dynamic>? ?? {}),
      assignedMarketerId: json['assignedMarketerId'] as String?,
      assignedMarketerName: json['assignedMarketerName'] as String?,
      status: CustomerStatus.fromString(json['status'] as String?) ?? CustomerStatus.active,
      tags: (json['tags'] as List<dynamic>?)?.map((e) => e.toString()).toList() ?? [],
      lastVisitAt: json['lastVisitAt'] != null
          ? DateTime.tryParse(json['lastVisitAt'].toString())
          : null,
      revenueMonthly: (json['revenueMonthly'] as num?)?.toDouble(),
      loyaltyScore: json['loyaltyScore'] as int?,
      grade: json['grade'] as String?,
      geoLocation: json['geoLocation'] != null
          ? GeoLocation.fromJson(json['geoLocation'] as Map<String, dynamic>)
          : null,
      notes: json['notes'] as String?,
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
      'code': code,
      'displayName': displayName,
      if (legalName != null) 'legalName': legalName,
      'contact': contact.toJson(),
      if (assignedMarketerId != null) 'assignedMarketerId': assignedMarketerId,
      if (assignedMarketerName != null) 'assignedMarketerName': assignedMarketerName,
      'status': status.value,
      'tags': tags,
      if (lastVisitAt != null) 'lastVisitAt': lastVisitAt!.toIso8601String(),
      if (revenueMonthly != null) 'revenueMonthly': revenueMonthly,
      if (loyaltyScore != null) 'loyaltyScore': loyaltyScore,
      if (grade != null) 'grade': grade,
      if (geoLocation != null) 'geoLocation': geoLocation!.toJson(),
      if (notes != null) 'notes': notes,
      if (createdAt != null) 'createdAt': createdAt!.toIso8601String(),
      if (updatedAt != null) 'updatedAt': updatedAt!.toIso8601String(),
    };
  }
}

