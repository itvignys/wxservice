/**
 * 常量配置 - 环境切换、API地址等
 */

// 环境标识：dev=开发环境 prod=生产环境
const ENV = 'test'

const CONFIG = {
  dev: {
    baseUrl: 'https://gpu.yuboshi.club:8443',
    uploadUrl: 'https://gpu.yuboshi.club:8443/api/upload'
    // baseUrl: 'http://110.42.209.219:8080',
    // uploadUrl: 'http://110.42.209.219:8080/api/upload'
  },
  test: {
    baseUrl: 'https://gpu.yuboshi.club:8443',
    uploadUrl: 'https://gpu.yuboshi.club:8443/api/upload'
  },
  prod: {
    baseUrl: 'https://gpu.yuboshi.club:8443',
    uploadUrl: 'https://gpu.yuboshi.club:8443/api/upload'
    // baseUrl: 'http://110.42.209.219:8080',
    // uploadUrl: 'http://110.42.209.219:8080/api/upload'
  }
}

module.exports = {
  // 当前环境
  ENV,
  
  // API基础路径
  BASE_URL: CONFIG[ENV].baseUrl,
  
  // 上传地址
  UPLOAD_URL: CONFIG[ENV].uploadUrl,
  
  // 接口路径常量
  API: {
    // 用户相关
    USER_LOGIN: '/api/user/login',
    USER_PROFILE: '/api/user/profile',
    
    // 知识库相关
    KNOWLEDGE_LIST: '/api/knowledge/list',
    KNOWLEDGE_CATEGORIES: '/api/knowledge/categories',
    KNOWLEDGE_SEARCH: '/api/knowledge/search',
    KNOWLEDGE_DETAIL: '/api/knowledge/',
    
    // AI对话
    AI_CHAT: '/api/ai/chat',
    AI_FEEDBACK: '/api/ai/feedback',
    AI_SEARCH: '/api/ai/search',
    AI_STATS: '/api/ai/stats',

    // 管理后台
    ADMIN_PENDING_KNOWLEDGE: '/api/ai/admin/pending-knowledge',
    ADMIN_CONFIRM_KNOWLEDGE: '/api/ai/admin/confirm-knowledge',
    ADMIN_TRIGGER_DISTILL: '/api/ai/admin/trigger-distill',

    // 企业信息
    COMPANY_SAVE: '/api/company/save',
    COMPANY_INFO: '/api/company/'
  },
  
  // Storage Key常量
  STORAGE_KEYS: {
    TOKEN: 'token',
    OPENID: 'openid',
    USER_INFO: 'userInfo',
    COMPANY_INFO: 'companyInfo',
    SERVICE_LEVEL: 'serviceLevel',
    HAS_USED_FREE_SERVICE: 'hasUsedFreeService'
  }
}
