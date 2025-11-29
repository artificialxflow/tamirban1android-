/// موقعیت جغرافیایی
class GeoLocation {
  const GeoLocation({
    required this.latitude,
    required this.longitude,
    this.addressLine,
    this.city,
    this.province,
    this.postalCode,
  });

  final double latitude;
  final double longitude;
  final String? addressLine;
  final String? city;
  final String? province;
  final String? postalCode;

  factory GeoLocation.fromJson(Map<String, dynamic> json) {
    return GeoLocation(
      latitude: (json['latitude'] as num?)?.toDouble() ?? 0.0,
      longitude: (json['longitude'] as num?)?.toDouble() ?? 0.0,
      addressLine: json['addressLine'] as String?,
      city: json['city'] as String?,
      province: json['province'] as String?,
      postalCode: json['postalCode'] as String?,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'latitude': latitude,
      'longitude': longitude,
      if (addressLine != null) 'addressLine': addressLine,
      if (city != null) 'city': city,
      if (province != null) 'province': province,
      if (postalCode != null) 'postalCode': postalCode,
    };
  }
}

