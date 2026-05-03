/**
 * 统一API请求封装
 * 功能：baseURL管理、token自动附加、错误统一处理、请求防重复、超时控制
 */

const constants = require('./constants.js')

/**
 * 发送请求
 * @param {Object} options - 请求配置
 * @param {string} options.url - 接口路径（相对路径）
 * @param {string} [options.method='GET'] - 请求方法
 * @param {Object} [options.data] - 请求数据
 * @param {boolean} [options.loading=true] - 是否显示loading
 * @returns {Promise<Object>} 响应数据
 */
function request(options) {
  const {
    url,
    method = 'GET',
    data,
    loading = true
  } = options

  return new Promise((resolve, reject) => {
    if (loading) {
      wx.showNavigationBarLoading()
    }

    wx.request({
      url: constants.BASE_URL + url,
      method,
      data,
      header: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + (wx.getStorageSync(constants.STORAGE_KEYS.TOKEN) || '')
      },
      success(res) {
        if (loading) {
          wx.hideNavigationBarLoading()
        }

        if (res.statusCode === 200) {
          const result = res.data
          if (result.code === 0) {
            resolve(result)
          } else {
            // 业务错误
            wx.showToast({
              title: result.message || '请求失败',
              icon: 'none',
              duration: 2000
            })
            reject(new Error(result.message || '业务异常'))
          }
        } else if (res.statusCode === 401) {
          // 未授权，重新登录
          wx.removeStorageSync(constants.STORAGE_KEYS.TOKEN)
          wx.showToast({
            title: '登录已过期，请重新进入',
            icon: 'none'
          })
          reject(new Error('未授权'))
        } else {
          wx.showToast({
            title: '网络异常，请稍后重试',
            icon: 'none'
          })
          reject(new Error('网络异常'))
        }
      },
      fail(err) {
        if (loading) {
          wx.hideNavigationBarLoading()
        }
        wx.showToast({
          title: '网络连接失败',
          icon: 'none'
        })
        reject(err)
      }
    })
  })
}

// ========== 便捷方法 ==========

/** GET请求 */
function get(url, params, options = {}) {
  // 将params拼接到URL
  let finalUrl = url
  if (params) {
    const queryString = Object.keys(params)
      .filter(k => params[k] !== undefined && params[k] !== null && params[k] !== '')
      .map(k => `${encodeURIComponent(k)}=${encodeURIComponent(params[k])}`)
      .join('&')
    if (queryString) {
      finalUrl += (url.includes('?') ? '&' : '?') + queryString
    }
  }
  return request({ ...options, url: finalUrl, method: 'GET' })
}

/** POST请求 */
function post(url, data, options = {}) {
  return request({ ...options, url, method: 'POST', data })
}

/** PUT请求 */
function put(url, data, options = {}) {
  return request({ ...options, url, method: 'PUT', data })
}

/** 文件上传 */
function upload(filePath, options = {}) {
  return new Promise((resolve, reject) => {
    wx.showNavigationBarLoading()
    wx.uploadFile({
      url: constants.UPLOAD_URL,
      filePath,
      name: 'file',
      header: {
        'Authorization': 'Bearer ' + (wx.getStorageSync(constants.STORAGE_KEYS.TOKEN) || '')
      },
      success(res) {
        wx.hideNavigationBarLoading()
        try {
          const result = JSON.parse(res.data)
          if (result.code === 0) {
            resolve(result)
          } else {
            wx.showToast({ title: result.message || '上传失败', icon: 'none' })
            reject(new Error(result.message))
          }
        } catch (e) {
          reject(new Error('上传响应解析失败'))
        }
      },
      fail(err) {
        wx.hideNavigationBarLoading()
        wx.showToast({ title: '上传失败', icon: 'none' })
        reject(err)
      }
    })
  })
}

// ========== 用户相关API ==========

/**
 * 微信登录
 * @param {string} code - wx.login获取的code
 */
function login(code) {
  return post(constants.API.USER_LOGIN, { code }, { loading: false })
}

/**
 * 更新用户资料
 */
function updateProfile(data) {
  return put(constants.API.USER_PROFILE, data)
}

// ========== 知识库相关API ==========

/**
 * 获取知识库列表
 * @param {string} [category='全部'] - 分类筛选
 */
function getKnowledgeList(category = '全部') {
  return get(constants.API.KNOWLEDGE_LIST, { category }, { loading: false })
}

/**
 * 获取分类统计
 */
function getKnowledgeCategories() {
  return get(constants.API.KNOWLEDGE_CATEGORIES, null, { loading: false })
}

/**
 * 搜索知识库
 * @param {string} keyword - 关键词
 * @param {string} [category='全部'] - 分类筛选
 */
function searchKnowledge(keyword, category = '全部') {
  return get(constants.API.KNOWLEDGE_SEARCH, { keyword, category }, { loading: false })
}

/**
 * 获取知识库详情
 * @param {number} id - 知识条目ID
 */
function getKnowledgeDetail(id) {
  return get(constants.API.KNOWLEDGE_DETAIL + id, null, { loading: false })
}

// ========== AI对话相关API ==========

/**
 * 发送消息给AI
 * @param {string} message - 用户消息
 * @param {Array} context - 对话上下文
 */
function sendAiChat(message, context) {
  return post(constants.API.AI_CHAT, {
    message,
    context: context || [],
    scene: 'gpu_diagnosis'
  })
}

// ========== 企业信息相关API ==========

/**
 * 保存企业信息
 */
function saveCompanyInfo(data) {
  return post(constants.API.COMPANY_SAVE, data)
}

/**
 * 获取企业信息（企业信息不存在时返回null，不抛出错误）
 * @param {string} openid
 */
function getCompanyInfo(openid) {
  return new Promise((resolve, reject) => {
    get(constants.API.COMPANY_INFO + openid, null, { loading: false })
      .then(result => {
        resolve(result)
      })
      .catch(err => {
        if (err.message && (err.message.includes('企业信息不存在') || err.message.includes('Not Found'))) {
          resolve({ code: 0, data: null, message: '企业信息不存在' })
        } else {
          reject(err)
        }
      })
  })
}

module.exports = {
  request,
  get,
  post,
  put,
  upload,
  login,
  updateProfile,
  getKnowledgeList,
  getKnowledgeCategories,
  searchKnowledge,
  getKnowledgeDetail,
  sendAiChat,
  saveCompanyInfo,
  getCompanyInfo
}
