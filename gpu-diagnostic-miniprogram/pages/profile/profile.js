const app = getApp()
const api = require('../../utils/api.js')
const constants = require('../../utils/constants.js')

Page({
  data: {
    isLoggedIn: false,
    userInfo: {},
    serviceLevel: 0,
    serviceLevelName: '普通用户',
    companyInfo: null,
    stats: {
      consultCount: 0,
      appointmentCount: 0,
      orderCount: 0
    },
    cacheSize: '<1MB',
    appVersion: '1.0.0'
  },

  onLoad() {
    this.loadUserData()
    this.calcCacheSize()
    this.loadStats()
  },

  onShow() {
    this.loadUserData()
    this.loadStats()
  },

  loadUserData() {
    const isLoggedIn = app.globalData.isLoggedIn || false
    const userInfo = app.globalData.userInfo || wx.getStorageSync(constants.STORAGE_KEYS.USER_INFO) || {}
    const serviceLevel = app.globalData.serviceLevel || wx.getStorageSync(constants.STORAGE_KEYS.SERVICE_LEVEL) || 0
    const companyInfo = app.globalData.companyInfo || wx.getStorageSync(constants.STORAGE_KEYS.COMPANY_INFO) || null

    const levelNames = ['普通用户', 'VIP会员', '企业用户']

    this.setData({
      isLoggedIn,
      userInfo,
      serviceLevel,
      serviceLevelName: levelNames[serviceLevel] || '普通用户',
      companyInfo
    })
  },

  loadStats() {
    // 从本地存储获取统计数据
    const consultHistory = wx.getStorageSync('chatHistory') || []
    const appointments = wx.getStorageSync('appointments') || []
    const orders = wx.getStorageSync('orders') || []

    this.setData({
      'stats.consultCount': consultHistory.length,
      'stats.appointmentCount': appointments.length,
      'stats.orderCount': orders.length
    })
  },

  calcCacheSize() {
    try {
      const info = wx.getStorageInfoSync()
      const size = info.currentSize
      if (size < 1024) {
        this.setData({ cacheSize: size + 'KB' })
      } else {
        this.setData({ cacheSize: (size / 1024).toFixed(1) + 'MB' })
      }
    } catch (e) {
      this.setData({ cacheSize: '<1MB' })
    }
  },

  handleLogin() {
    if (this.data.isLoggedIn) return
    wx.showModal({
      title: '提示',
      content: '登录后即可享受完整服务',
      confirmText: '立即登录',
      success: (res) => {
        if (res.confirm) {
          app.autoLogin()
        }
      }
    })
  },

  goToAppointments() {
    wx.showToast({ title: '功能开发中', icon: 'none' })
  },

  goToOrders() {
    wx.showToast({ title: '功能开发中', icon: 'none' })
  },

  goToConsultHistory() {
    wx.switchTab({ url: '/pages/chatbot/chatbot' })
  },

  goToFavorites() {
    wx.showToast({ title: '功能开发中', icon: 'none' })
  },

  goToCompanyAuth() {
    wx.navigateTo({ url: '/pages/service/service' })
  },

  clearCache() {
    wx.showModal({
      title: '清除缓存',
      content: '确定要清除所有本地缓存数据吗？',
      confirmColor: '#FF3B30',
      success: (res) => {
        if (res.confirm) {
          wx.clearStorageSync()
          this.setData({ cacheSize: '0KB' })
          wx.showToast({ title: '缓存已清除', icon: 'success' })
          // 重新加载必要数据
          app.loadLocalCache()
        }
      }
    })
  },

  goToAbout() {
    wx.showModal({
      title: '关于我们',
      content: 'GPU智修专家\n专业英伟达显卡故障诊断与维修服务\n\n版本：v1.0.0',
      showCancel: false
    })
  },

  goToFeedback() {
    wx.navigateTo({
      url: '/pages/chatbot/chatbot'
    })
    wx.setStorageSync('feedbackMode', true)
    wx.showToast({ title: '请在AI对话中反馈', icon: 'none' })
  },

  contactService() {
    wx.showModal({
      title: '联系客服',
      content: '客服热线：13826580396\n服务时间：9:00-21:00\n\n是否立即拨打？',
      confirmText: '拨打',
      success: (res) => {
        if (res.confirm) {
          wx.makePhoneCall({ phoneNumber: '13826580396' })
        }
      }
    })
  },

  callHotline() {
    wx.makePhoneCall({ phoneNumber: '13826580396' })
  }
})
