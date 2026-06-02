/// 用户信息模型
class UserInfo {
  final String openid;
  final String? nickname;
  final String? avatarUrl;
  final String? phone;
  final int serviceLevel;
  final String role;

  UserInfo({
    required this.openid,
    this.nickname,
    this.avatarUrl,
    this.phone,
    this.serviceLevel = 0,
    this.role = 'customer',
  });

  factory UserInfo.fromJson(Map<String, dynamic> json) {
    return UserInfo(
      openid: json['openid'] ?? '',
      nickname: json['nickname'],
      avatarUrl: json['avatarUrl'] ?? json['avatar_url'],
      phone: json['phone'],
      serviceLevel: json['serviceLevel'] ?? json['service_level'] ?? 0,
      role: json['role'] ?? 'customer',
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'openid': openid,
      'nickname': nickname,
      'avatarUrl': avatarUrl,
      'phone': phone,
      'serviceLevel': serviceLevel,
      'role': role,
    };
  }

  bool get isAdmin => role == 'admin';
  bool get isCustomer => role == 'customer';

  factory UserInfo.fromJsonString(String jsonStr) {
    // 简单解析，生产环境应使用 jsonDecode
    return UserInfo(openid: '');
  }

  String toJsonString() {
    return '{"openid":"$openid","nickname":"$nickname","avatarUrl":"$avatarUrl","phone":"$phone","serviceLevel":$serviceLevel,"role":"$role"}';
  }
}
