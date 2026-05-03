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
  },

  onShow() {
    this.loadUserData()
  },

  loadUserData() {
    const serviceLevel = app.globalData.serviceLevel || wx.getStorageSync(constants.STORAGE_KEYS.SERVICE_LEVEL) || 0
    const userInfo = app.globalData.userInfo
    const isLoggedIn = app.globalData.isLoggedIn || false
    const userNickname = (userInfo && userInfo.nickname) ? userInfo.nickname : ''
    
    // 从API获取知识库数量（如果已登录）
    let knowledgeCount = this.data.stats.knowledgeCount
    if (!isLoggedIn) {
      try {
        const kb = require('../../data/knowledge.js')
        knowledgeCount = kb.knowledgeList.length
      } catch (e) {}
    }

    this.setData({
      currentLevel: serviceLevel,
      isLoggedIn,
      userNickname,
      'stats.knowledgeCount': knowledgeCount,
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

  goToChatbot() {
    wx.switchTab({ url: '/pages/chatbot/chatbot' })
  },

  goToKnowledge() {
    wx.switchTab({ url: '/pages/knowledge/knowledge' })
  },

  goToTools() {
    wx.switchTab({ url: '/pages/tools/tools' })
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
    wx.navigateTo({ url: '/pages/service/service' })
  }
})
