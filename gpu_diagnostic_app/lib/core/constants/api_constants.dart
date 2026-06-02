/// API 接口常量（完全复用小程序后端接口）
class ApiConstants {
  ApiConstants._();

  // Base URL
  static const String baseUrl = 'https://gpu.yuboshi.club:8443';
  static const String uploadUrl = 'https://gpu.yuboshi.club:8443/api/upload';

  // 用户相关
  static const String userLogin = '/api/user/login';
  static const String userLoginApp = '/api/user/login/app';
  static const String userProfile = '/api/user/profile';
  static const String smsSend = '/api/user/sms/send';

  // 知识库相关
  static const String knowledgeList = '/api/knowledge/list';
  static const String knowledgeCategories = '/api/knowledge/categories';
  static const String knowledgeSearch = '/api/knowledge/search';
  static const String knowledgeDetail = '/api/knowledge/';

  // AI对话相关
  static const String aiChat = '/api/ai/chat';
  static const String aiFeedback = '/api/ai/feedback';
  static const String aiSearch = '/api/ai/search';
  static const String aiStats = '/api/ai/stats';

  // 管理后台
  static const String adminPendingKnowledge = '/api/ai/admin/pending-knowledge';
  static const String adminConfirmKnowledge = '/api/ai/admin/confirm-knowledge';
  static const String adminTriggerDistill = '/api/ai/admin/trigger-distill';

  // 企业信息
  static const String companySave = '/api/company/save';
  static const String companyInfo = '/api/company/';
}
