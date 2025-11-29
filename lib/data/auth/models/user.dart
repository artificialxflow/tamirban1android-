class User {
  const User({
    required this.id,
    required this.fullName,
    required this.mobile,
    required this.role,
    required this.isActive,
  });

  final String id;
  final String? fullName;
  final String mobile;
  final String role;
  final bool isActive;

  factory User.fromJson(Map<String, dynamic> json) {
    return User(
      id: (json['id'] ?? json['_id'] ?? '').toString(),
      fullName: json['fullName'] as String?,
      mobile: json['mobile'] as String? ?? '',
      role: json['role'] as String? ?? '',
      isActive: json['isActive'] as bool? ?? true,
    );
  }
}


