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
    loginType: 'wx',
    stats: {
      consultCount: 0,
      appointmentCount: 0,
      orderCount: 0
    },
    cacheSize: '<1MB',
    appVersion: '1.0.0',
    // 手机号登录弹窗
    showLoginPanel: false,
    phone: '',
    verifyCode: '',
    countdown: 0,
    isSending: false,
    isLogining: false
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
    const loginType = app.globalData.loginType || 'wx'

    const levelNames = ['普通用户', 'VIP会员', '企业用户']

    this.setData({
      isLoggedIn,
      userInfo,
      serviceLevel,
      serviceLevelName: levelNames[serviceLevel] || '普通用户',
      companyInfo,
      loginType
    })
  },

  async loadStats() {
    // 从本地存储获取咨询数量（所有会话的消息总数估算）
    let consultCount = 0
    try {
      const sessions = wx.getStorageSync('chatSessions') || []
      consultCount = sessions.length
      // 加上当前会话的消息数
      const currentSid = wx.getStorageSync('currentSessionId')
      if (currentSid) {
        const currentMsgs = wx.getStorageSync('chatHistory_' + currentSid) || []
        if (currentMsgs.length > 0 && !sessions.find(s => s.sessionId === currentSid)) {
          consultCount += 1
        }
      }
      if (consultCount === 0) {
        // 兜底：统计所有chatHistory_前缀的存储项
        const info = wx.getStorageInfoSync()
        consultCount = info.keys.filter(k => k.startsWith('chatHistory_')).length
      }
    } catch (e) {}

    // 从后端获取工单数量
    let orderCount = 0
    const openid = app.globalData.userInfo ? app.globalData.userInfo.openid : null
    if (openid) {
      try {
        const res = await api.getMyOrders(1, 1)
        const total = res.data ? (res.data.total || 0) : 0
        orderCount = total
      } catch (e) {}
    }

    this.setData({
      'stats.consultCount': consultCount,
      'stats.appointmentCount': orderCount, // 用工单数代替预约数
      'stats.orderCount': orderCount
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
    // 显示登录面板，支持微信一键登录和手机号登录
    this.setData({ showLoginPanel: true })
  },

  onCloseLoginPanel() {
    this.setData({ showLoginPanel: false })
  },

  // 微信一键登录
  onWxLogin() {
    this.setData({ showLoginPanel: false })
    app.autoLogin()
    wx.showToast({ title: '登录中...', icon: 'loading' })
  },

  // 手机号输入
  onPhoneInput(e) {
    this.setData({ phone: e.detail.value })
  },

  // 验证码输入
  onCodeInput(e) {
    this.setData({ verifyCode: e.detail.value })
  },

  // 发送验证码
  async onSendCode() {
    const phone = this.data.phone.trim()
    if (!/^1[3-9]\d{9}$/.test(phone)) {
      wx.showToast({ title: '请输入正确的手机号', icon: 'none' })
      return
    }
    if (this.data.isSending || this.data.countdown > 0) return

    this.setData({ isSending: true })
    try {
      const res = await api.sendSmsCode(phone)
      wx.showToast({ title: '验证码已发送', icon: 'success' })

      // 演示环境：后端直接返回验证码，自动填入
      if (res.data && res.data.length === 6) {
        this.setData({ verifyCode: res.data })
      }

      // 启动60秒倒计时
      this.setData({ countdown: 60 })
      this.countdownTimer = setInterval(() => {
        const cd = this.data.countdown - 1
        if (cd <= 0) {
          clearInterval(this.countdownTimer)
          this.setData({ countdown: 0, isSending: false })
        } else {
          this.setData({ countdown: cd })
        }
      }, 1000)
    } catch (err) {
      wx.showToast({ title: err.message || '发送失败', icon: 'none' })
      this.setData({ isSending: false })
    }
  },

  // 手机号验证码登录
  async onPhoneLogin() {
    const phone = this.data.phone.trim()
    const verifyCode = this.data.verifyCode.trim()

    if (!/^1[3-9]\d{9}$/.test(phone)) {
      wx.showToast({ title: '请输入正确的手机号', icon: 'none' })
      return
    }
    if (!/^\d{6}$/.test(verifyCode)) {
      wx.showToast({ title: '请输入6位验证码', icon: 'none' })
      return
    }

    this.setData({ isLogining: true })
    try {
      const res = await api.appLogin(phone, verifyCode)
      const userData = res.data
      app.handlePhoneLogin(userData)

      this.setData({
        showLoginPanel: false,
        isLoggedIn: true,
        userInfo: userData,
        loginType: 'phone',
        isLogining: false,
        phone: '',
        verifyCode: '',
        countdown: 0
      })
      if (this.countdownTimer) clearInterval(this.countdownTimer)

      wx.showToast({ title: '登录成功', icon: 'success' })
      this.loadUserData()
    } catch (err) {
      wx.showToast({ title: err.message || '登录失败', icon: 'none' })
      this.setData({ isLogining: false })
    }
  },

  // 退出登录
  onLogout() {
    wx.showModal({
      title: '退出登录',
      content: '确定要退出当前账号吗？',
      confirmColor: '#FF3B30',
      success: (res) => {
        if (res.confirm) {
          app.logout()
          this.setData({
            isLoggedIn: false,
            userInfo: {},
            serviceLevel: 0,
            serviceLevelName: '普通用户',
            companyInfo: null,
            loginType: 'wx'
          })
          wx.showToast({ title: '已退出登录', icon: 'success' })
        }
      }
    })
  },

  onUnload() {
    if (this.countdownTimer) clearInterval(this.countdownTimer)
  },

  goToAppointments() {
    wx.navigateTo({
      url: '/package-service/pages/order-list/order-list'
    })
  },

  goToOrders() {
    wx.navigateTo({
      url: '/package-service/pages/order-list/order-list'
    })
  },

  goToConsultHistory() {
    wx.switchTab({ url: '/pages/chatbot/chatbot' })
  },

  goToFavorites() {
    wx.showToast({ title: '功能开发中', icon: 'none' })
  },

  goToCompanyAuth() {
    wx.navigateTo({ url: '/package-service/pages/service/service' })
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

  // 订阅消息设置
  openSubscribeSettings() {
    const tmplIds = []
    if (constants.SUBSCRIBE_TEMPLATES.ORDER_STATUS) {
      tmplIds.push(constants.SUBSCRIBE_TEMPLATES.ORDER_STATUS)
    }
    if (constants.SUBSCRIBE_TEMPLATES.REPAIR_COMPLETE) {
      tmplIds.push(constants.SUBSCRIBE_TEMPLATES.REPAIR_COMPLETE)
    }
    if (tmplIds.length === 0) {
      wx.showModal({
        title: '提示',
        content: '订阅消息模板尚未配置，请联系管理员在小程序后台申请模板后配置到constants.js',
        showCancel: false
      })
      return
    }

    wx.requestSubscribeMessage({
      tmplIds,
      success: (res) => {
        const accepted = tmplIds.filter(id => res[id] === 'accept')
        const rejected = tmplIds.filter(id => res[id] === 'reject' || res[id] === 'ban')
        if (accepted.length > 0) {
          wx.showToast({ title: `已订阅${accepted.length}项通知`, icon: 'success' })
        } else if (rejected.length > 0) {
          wx.showModal({
            title: '订阅提示',
            content: '开启消息通知后，工单状态变更将第一时间推送给您',
            confirmText: '去开启',
            success: (r) => {
              if (r.confirm) {
                wx.openSetting({})
              }
            }
          })
        }
      },
      fail: (err) => {
        console.warn('订阅消息授权失败:', err)
        wx.showToast({ title: '授权失败', icon: 'none' })
      }
    })
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
