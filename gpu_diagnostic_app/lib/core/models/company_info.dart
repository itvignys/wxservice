/// 企业信息模型
class CompanyInfo {
  final int? id;
  final String openid;
  final String name;
  final String? creditCode;
  final String contact;
  final String phone;
  final String address;
  final String? remark;
  final String? gpuCount;
  final List<String>? services;
  final String status;
  final bool hasUsedFreeService;

  CompanyInfo({
    this.id,
    required this.openid,
    required this.name,
    this.creditCode,
    required this.contact,
    required this.phone,
    required this.address,
    this.remark,
    this.gpuCount,
    this.services,
    this.status = 'pending',
    this.hasUsedFreeService = false,
  });

  factory CompanyInfo.fromJson(Map<String, dynamic> json) {
    return CompanyInfo(
      id: json['id'],
      openid: json['openid'] ?? '',
      name: json['name'] ?? '',
      creditCode: json['creditCode'] ?? json['credit_code'],
      contact: json['contact'] ?? '',
      phone: json['phone'] ?? '',
      address: json['address'] ?? '',
      remark: json['remark'],
      gpuCount: json['gpuCount'] ?? json['gpu_count'],
      services: json['services'] != null
          ? List<String>.from(json['services'])
          : null,
      status: json['status'] ?? 'pending',
      hasUsedFreeService:
          json['hasUsedFreeService'] == 1 || json['has_used_free_service'] == 1,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'openid': openid,
      'name': name,
      'creditCode': creditCode,
      'contact': contact,
      'phone': phone,
      'address': address,
      'remark': remark,
      'gpuCount': gpuCount,
      'services': services,
    };
  }
}
