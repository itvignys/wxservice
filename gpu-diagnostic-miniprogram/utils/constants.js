/**
 * 常量配置 - 环境切换、API地址等
 */

// 环境标识：dev=开发环境 prod=生产环境
const ENV = 'dev'

const CONFIG = {
  dev: {
    baseUrl: 'https://gpu.yuboshi.club',
    uploadUrl: 'https://gpu.yuboshi.club/api/upload'
    // baseUrl: 'http://127.0.0.1:8080',
    // uploadUrl: 'http://127.0.0.1:8080/api/upload'
  },
  prod: {
    baseUrl: 'https://gpu.yuboshi.club',
    uploadUrl: 'https://gpu.yuboshi.club/api/upload'
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
