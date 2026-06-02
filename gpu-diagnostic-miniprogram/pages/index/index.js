const app = getApp()
const api = require('../../utils/api.js')
const constants = require('../../utils/constants.js')

Page({
  data: {
    currentLevel: 0,
    companyInfo: null,
    isLoggedIn: false,
    userNickname: '',
    stats: {
      diagnosisCount: 12580,
      knowledgeCount: 17,
      successRate: 92,
      expertCount: 8
    },
    showSkeleton: true,
    banners: [
      { id: 1, title: 'GPU智修专家', subtitle: '专业英伟达显卡故障诊断与维修服务', bg: 'linear-gradient(135deg, #065A82 0%, #1C7293 50%, #02C39A 100%)', icon: '🔧', path: '/pages/chatbot/chatbot' },
      { id: 2, title: 'AI智能诊断', subtitle: '24小时在线，秒级响应，精准定位故障', bg: 'linear-gradient(135deg, #5856D6 0%, #7B68EE 100%)', icon: '🤖', path: '/pages/chatbot/chatbot' },
      { id: 3, title: '免费上门服务', subtitle: '企业用户首次上门检测完全免费', bg: 'linear-gradient(135deg, #FF9500 0%, #FF7700 100%)', icon: '🚪', path: '/package-service/pages/service/service' }
    ],
    currentBanner: 0,
    commonIssues: [
      { id: 1, icon: '\uD83D\uDFE5', question: '黑屏/无信号' },
      { id: 2, icon: '\uD83C\uDFA8', question: '花屏/条纹' },
      { id: 3, icon: '\uD83C\uDF21\uFE0F', question: '显卡过热' },
      { id: 4, icon: '\u26A1', question: '供电故障' },
      { id: 5, icon: '\uD83D\uDCBE', question: '显存报错' },
      { id: 6, icon: '\uD83D\uDD04', question: '驱动崩溃' }
    ]
  },

  onLoad() {
    this.loadUserData()
    this.loadDashboardStats()
  },

  onShow() {
    this.loadUserData()
    this.loadDashboardStats()
  },

  loadUserData() {
    const serviceLevel = app.globalData.serviceLevel || wx.getStorageSync(constants.STORAGE_KEYS.SERVICE_LEVEL) || 0
    const userInfo = app.globalData.userInfo
    const isLoggedIn = app.globalData.isLoggedIn || false
    const userNickname = (userInfo && userInfo.nickname) ? userInfo.nickname : ''

    this.setData({
      currentLevel: serviceLevel,
      isLoggedIn,
      userNickname,
      // 先用缓存立即展示
      companyInfo: app.globalData.companyInfo || wx.getStorageSync(constants.STORAGE_KEYS.COMPANY_INFO) || null
    })

    // 已登录时从接口获取最新企业信息，并更新缓存
    if (isLoggedIn && userInfo && userInfo.openid) {
      api.getCompanyInfo(userInfo.openid).then(result => {
        if (result && result.data) {
          const companyInfo = result.data
          app.saveCompanyInfo(companyInfo)
          this.setData({ companyInfo })
        } else {
          // 接口确认企业信息不存在，清空缓存
          app.globalData.companyInfo = null
          wx.removeStorageSync(constants.STORAGE_KEYS.COMPANY_INFO)
          this.setData({ companyInfo: null })
        }
      }).catch(() => {})
    }
  },

  // 加载首页统计数据（对接后端真实数据）
  loadDashboardStats() {
    this.setData({ showSkeleton: true })
    api.getDashboardStats()
      .then(result => {
        if (result && result.data) {
          const stats = result.data
          this.setData({ showSkeleton: false })
          // 数字滚动动画
          this.animateNumber('stats.diagnosisCount', stats.diagnosisCount || 0, 1500)
          this.animateNumber('stats.knowledgeCount', stats.knowledgeCount || 0, 1200)
          this.animateNumber('stats.successRate', stats.successRate || 92, 1000)
          this.animateNumber('stats.expertCount', stats.expertCount || 8, 1000)
        }
      })
      .catch(err => {
        console.warn('首页统计数据加载失败，使用本地兜底:', err)
        this.setData({ showSkeleton: false })
        // 降级：使用本地知识库数量兜底
        try {
          const kb = require('../../data/knowledge.js')
          this.animateNumber('stats.knowledgeCount', kb.knowledgeList.length, 1000)
        } catch (e) {}
      })
  },

  // 数字滚动动画
  animateNumber(key, targetValue, duration = 1000) {
    const startTime = Date.now()
    const startValue = 0
    const step = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)
      // easeOutQuart 缓动函数
      const ease = 1 - Math.pow(1 - progress, 4)
      const current = Math.floor(startValue + (targetValue - startValue) * ease)
      this.setData({ [key]: current })
      if (progress < 1) {
        requestAnimationFrame(step)
      }
    }
    // 小程序使用 setTimeout 模拟 requestAnimationFrame
    const raf = typeof requestAnimationFrame !== 'undefined' ? requestAnimationFrame : (cb) => setTimeout(cb, 16)
    raf(step)
  },

  goToChatbot() {
    wx.switchTab({ url: '/pages/chatbot/chatbot' })
  },

  goToKnowledge() {
    wx.switchTab({ url: '/pages/knowledge/knowledge' })
  },

  goToTools() {
    wx.switchTab({ url: '/pages/tools/tools' })
  },

  goToAdmin() {
    wx.navigateTo({ url: '/package-service/pages/admin/admin' })
  },

  quickSearch(e) {
    const keyword = e.currentTarget.dataset.keyword
    wx.switchTab({ url: '/pages/knowledge/knowledge' })
    wx.setStorageSync('searchKeyword', keyword)
  },

  callExpert() {
    wx.showModal({
      title: '联系专家',
      content: '专家咨询热线：400-888-GPU1\n服务时间：9:00-21:00',
      confirmText: '立即拨打',
      success: (res) => {
        if (res.confirm) {
          wx.makePhoneCall({ phoneNumber: '13826580396' })
        }
      }
    })
  },

  fillCompanyInfo() {
    wx.navigateTo({ url: '/package-service/pages/service/service' })
  },

  // Banner轮播切换
  onBannerChange(e) {
    this.setData({ currentBanner: e.detail.current })
  },

  // 点击Banner跳转
  onBannerTap(e) {
    const index = e.currentTarget.dataset.index
    const banner = this.data.banners[index]
    if (banner.path.startsWith('/package-service')) {
      wx.navigateTo({ url: banner.path })
    } else {
      wx.switchTab({ url: banner.path })
    }
  }
})
