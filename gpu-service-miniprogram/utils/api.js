// API基础配置
const BASE_URL = 'https://your-api-domain.com'

// 统一请求方法
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

// 工单API
const orderApi = {
  create: (data) => request({ url: '/api/order/create', method: 'POST', data }),
  update: (data) => request({ url: '/api/order/update', method: 'PUT', data }),
  getDetail: (orderId) => request({ url: `/api/order/${orderId}` }),
  getMyOrders: (params) => request({ url: '/api/order/my', data: params }),
  getPendingOrders: (params) => request({ url: '/api/order/pending', data: params }),
  getEngineerTasks: (params) => request({ url: '/api/order/engineer', data: params }),
  getInspectionTasks: (params) => request({ url: '/api/order/inspection', data: params }),
  getAllOrders: (params) => request({ url: '/api/order/all', data: params }),
  accept: (data) => request({ url: '/api/order/accept', method: 'POST', data }),
  startInspection: (data) => request({ url: '/api/order/start-inspection', method: 'POST', data }),
  submitScheme: (data) => request({ url: '/api/order/submit-scheme', method: 'POST', data }),
  confirmScheme: (data) => request({ url: '/api/order/confirm-scheme', method: 'POST', data }),
  rejectScheme: (data) => request({ url: '/api/order/reject-scheme', method: 'POST', data }),
  submitQuotation: (data) => request({ url: '/api/order/submit-quotation', method: 'POST', data }),
  confirmQuotation: (data) => request({ url: '/api/order/confirm-quotation', method: 'POST', data }),
  rejectQuotation: (data) => request({ url: '/api/order/reject-quotation', method: 'POST', data }),
  reviseQuotation: (data) => request({ url: '/api/order/revise-quotation', method: 'POST', data }),
  supplementQuotation: (data) => request({ url: '/api/order/supplement-quotation', method: 'POST', data }),
  startRepair: (data) => request({ url: '/api/order/start-repair', method: 'POST', data }),
  submitRepairProcess: (data) => request({ url: '/api/order/repair-process', method: 'POST', data }),
  completeRepair: (data) => request({ url: '/api/order/complete-repair', method: 'POST', data }),
  submitQualityReport: (data) => request({ url: '/api/order/quality-report', method: 'POST', data }),
  signDelivery: (data) => request({ url: '/api/order/sign-delivery', method: 'POST', data }),
  submitRating: (data) => request({ url: '/api/order/rating', method: 'POST', data }),
  closeOrder: (data) => request({ url: '/api/order/close', method: 'POST', data }),
  confirmPayment: (data) => request({ url: '/api/order/confirm-payment', method: 'POST', data }),
  submitAfterSale: (data) => request({ url: '/api/order/after-sale', method: 'POST', data }),
  addVisitRecord: (data) => request({ url: '/api/order/visit-record', method: 'POST', data }),
}

// 用户API
const userApi = {
  login: (code) => request({ url: '/api/user/login', method: 'POST', data: { code } }),
  getProfile: (openid) => request({ url: `/api/user/${openid}` }),
  updateProfile: (data) => request({ url: '/api/user/profile', method: 'PUT', data }),
}

module.exports = {
  BASE_URL,
  request,
  orderApi,
  userApi
}
