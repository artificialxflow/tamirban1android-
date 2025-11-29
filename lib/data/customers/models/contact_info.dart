/// اطلاعات تماس مشتری
class ContactInfo {
  const ContactInfo({
    required this.phone,
    this.email,
    this.telegramId,
    this.whatsappNumber,
    this.city,
    this.address,
  });

  final String phone;
  final String? email;
  final String? telegramId;
  final String? whatsappNumber;
  final String? city;
  final String? address;

  factory ContactInfo.fromJson(Map<String, dynamic> json) {
    return ContactInfo(
      phone: json['phone'] as String? ?? '',
      email: json['email'] as String?,
      telegramId: json['telegramId'] as String?,
      whatsappNumber: json['whatsappNumber'] as String?,
      city: json['city'] as String?,
      address: json['address'] as String?,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'phone': phone,
      if (email != null) 'email': email,
      if (telegramId != null) 'telegramId': telegramId,
      if (whatsappNumber != null) 'whatsappNumber': whatsappNumber,
      if (city != null) 'city': city,
      if (address != null) 'address': address,
    };
  }
}

