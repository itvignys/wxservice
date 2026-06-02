/// 应用常量配置
class AppConstants {
  AppConstants._();

  // 应用信息
  static const String appName = 'GPU智修专家';
  static const String version = '1.0.0';

  // 客服电话
  static const String servicePhone = '13826580396';
  static const String serviceTime = '9:00-21:00';

  // Storage Keys（与小程序保持一致，便于数据迁移）
  static const String keyToken = 'token';
  static const String keyOpenid = 'openid';
  static const String keyUserInfo = 'userInfo';
  static const String keyCompanyInfo = 'companyInfo';
  static const String keyServiceLevel = 'serviceLevel';
  static const String keyHasUsedFreeService = 'hasUsedFreeService';
  static const String keySearchKeyword = 'searchKeyword';

  // 分类颜色映射（与小程序一致）
  static const Map<String, int> categoryColors = {
    '显示类': 0xFF065A82,
    '驱动类': 0xFF02C39A,
    '供电与过热': 0xFFFF9500,
    '物理与接口': 0xFF5856D6,
    '显存与核心': 0xFFFF3B30,
    'BIOS与固件': 0xFF8E8E93,
  };
}
