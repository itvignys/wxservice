// API基础配置 - 复用 wx-login-service 后端
const BASE_URL = 'http://localhost:8080'

// 统一请求方法（复用现有项目 X-Openid 鉴权模式）
function request(options) {
  return new Promise((resolve, reject) => {
    const openid = wx.getStorageSync('openid')
    wx.request({
      url: BASE_URL + options.url,
      method: options.method || 'GET',
      data: options.data || {},
      header: {
        'Content-Type': 'application/json',
        'X-Openid': openid || '',
        ...options.header
      },
      success(res) {
        if (res.data.code === 0) {
          resolve(res.data.data)
        } else {
          wx.showToast({ title: res.data.message || '请求失败', icon: 'none' })
          reject(res.data)
        }
      },
      fail(err) {
        wx.showToast({ title: '网络异常', icon: 'none' })
        reject(err)
      }
    })
  })
}

// 文件上传（复用现有 UploadController）
function upload(filePath) {
  return new Promise((resolve, reject) => {
    const openid = wx.getStorageSync('openid')
    wx.uploadFile({
      url: BASE_URL + '/api/upload',
      filePath: filePath,
      name: 'file',
      header: {
        'X-Openid': openid || ''
      },
      success(res) {
        const data = JSON.parse(res.data)
        if (data.code === 0) {
          resolve(data.data)
        } else {
          wx.showToast({ title: data.message || '上传失败', icon: 'none' })
          reject(data)
        }
      },
      fail(err) {
        wx.showToast({ title: '上传失败', icon: 'none' })
        reject(err)
      }
    })
  })
}

// 回收订单API
const recycleOrderApi = {
  // 创建回收订单
  create: (data) => request({ url: '/api/recycle/order/create', method: 'POST', data }),
  // 获取订单详情
  getDetail: (orderId) => request({ url: `/api/recycle/order/${orderId}` }),
  // 获取我的回收订单列表（分页）
  getMyOrders: (params) => request({ url: '/api/recycle/order/my', data: params }),
  // 取消订单
  cancel: (data) => request({ url: '/api/recycle/order/cancel', method: 'POST', data }),
  // 确认价格
  confirmPrice: (data) => request({ url: '/api/recycle/order/confirm-price', method: 'POST', data }),
  // 拒绝价格（进入协商）
  rejectPrice: (data) => request({ url: '/api/recycle/order/reject-price', method: 'POST', data }),
  // 确认收款
  confirmPayment: (data) => request({ url: '/api/recycle/order/confirm-payment', method: 'POST', data }),
  // 获取验机报告
  getInspection: (orderId) => request({ url: `/api/recycle/order/inspection/${orderId}` }),
  // 获取协商记录
  getNegotiations: (orderId) => request({ url: `/api/recycle/order/negotiations/${orderId}` }),
  // 发送协商消息
  sendNegotiation: (data) => request({ url: '/api/recycle/order/negotiate', method: 'POST', data }),
}

// 估价API
const recyclePriceApi = {
  // 计算预估价
  calculate: (data) => request({ url: '/api/recycle/price/calculate', method: 'POST', data }),
  // 获取估价规则（缓存到本地）
  getRules: () => request({ url: '/api/recycle/price/rules' }),
  // 获取型号列表
  getModels: (params) => request({ url: '/api/recycle/price/models', data: params }),
}

// 品类API
const recycleCategoryApi = {
  // 获取品类列表
  getList: () => request({ url: '/api/recycle/category/list' }),
  // 获取热门型号
  getHotModels: () => request({ url: '/api/recycle/category/hot-models' }),
}

// 用户API（复用现有接口）
const userApi = {
  login: (code) => request({ url: '/api/user/login', method: 'POST', data: { code } }),
  getProfile: (openid) => request({ url: `/api/user/${openid}` }),
  updateProfile: (data) => request({ url: '/api/user/profile', method: 'PUT', data }),
}

// 地址API
const addressApi = {
  getList: () => request({ url: '/api/recycle/address/list' }),
  save: (data) => request({ url: '/api/recycle/address/save', method: 'POST', data }),
  delete: (id) => request({ url: `/api/recycle/address/${id}`, method: 'DELETE' }),
  setDefault: (id) => request({ url: `/api/recycle/address/default/${id}`, method: 'PUT' }),
}

module.exports = {
  BASE_URL,
  request,
  upload,
  recycleOrderApi,
  recyclePriceApi,
  recycleCategoryApi,
  userApi,
  addressApi
}
