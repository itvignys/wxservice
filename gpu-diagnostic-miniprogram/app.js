const api = require('./utils/api.js')
const constants = require('./utils/constants.js')
const knowledgeData = require('./data/knowledge.js')

App({
  globalData: {
    userInfo: null,
    serviceLevel: 0, // 0: AI问答, 1: 专家咨询, 2: 上门服务
    companyInfo: null,
    hasUsedFreeService: false,
    isLoggedIn: false // 是否已登录后端
  },

  onLaunch() {
    console.log('GPU智修专家小程序启动')

    // 加载本地缓存数据（作为离线降级方案）
    this.loadLocalCache()

    // 初始化知识库数据到本地（作为离线兜底）
    wx.setStorageSync('knowledgeBase', knowledgeData.default)

    // 自动登录后端
    this.autoLogin()
  },

  // 加载本地缓存
  loadLocalCache() {
    const userInfo = wx.getStorageSync(constants.STORAGE_KEYS.USER_INFO)
    const companyInfo = wx.getStorageSync(constants.STORAGE_KEYS.COMPANY_INFO)
    const serviceLevel = wx.getStorageSync(constants.STORAGE_KEYS.SERVICE_LEVEL)
    const hasUsedFreeService = wx.getStorageSync(constants.STORAGE_KEYS.HAS_USED_FREE_SERVICE)

    if (userInfo) {
      this.globalData.userInfo = userInfo
      this.globalData.isLoggedIn = true
    }
    if (companyInfo) {
      this.globalData.companyInfo = companyInfo
    }
    if (serviceLevel !== undefined && serviceLevel !== '') {
      this.globalData.serviceLevel = serviceLevel
    }
    if (hasUsedFreeService) {
      this.globalData.hasUsedFreeService = true
    }
  },

  // 自动静默登录
  autoLogin() {
    wx.login({
      success: (res) => {
        if (res.code) {
          api.login(res.code)
            .then(result => {
              const userData = result.data
              console.log('后端登录成功:', userData.openid)
              console.log('【运营人员配置】请将以下openid填入后端application.yml的admin.allowed-openids列表:', userData.openid)

              // 存储用户信息
              this.globalData.userInfo = userData
              this.globalData.isLoggedIn = true
              wx.setStorageSync(constants.STORAGE_KEYS.USER_INFO, userData)
              wx.setStorageSync(constants.STORAGE_KEYS.OPENID, userData.openid)

              // 登录成功后立即通知页面刷新（此时companyInfo可能还没拿到，但isLoggedIn已更新）
              this.notifyPagesRefresh()

              // 同步本地存储的服务等级等字段到后端（如果有）
              if (this.globalData.serviceLevel > 0 && (!userData.serviceLevel || userData.serviceLevel === 0)) {
                api.updateProfile({
                  openid: userData.openid,
                  serviceLevel: this.globalData.serviceLevel
                }).catch(e => console.log('同步服务等级失败(非致命):', e.message))
              }

              // 加载企业信息
              return api.getCompanyInfo(userData.openid)
            })
            .then(result => {
              if (result && result.data) {
                this.globalData.companyInfo = result.data
                wx.setStorageSync(constants.STORAGE_KEYS.COMPANY_INFO, result.data)
                if (result.data.hasUsedFreeService) {
                  this.globalData.hasUsedFreeService = true
                }
              } else {
                this.globalData.companyInfo = null
                wx.removeStorageSync(constants.STORAGE_KEYS.COMPANY_INFO)
                // 企业信息不存在，弹框提示用户填写
                this.showCompanyInfoPrompt()
              }
              // 通知当前页面刷新数据
              this.notifyPagesRefresh()
            })
            .catch(err => {
              // 登录失败不阻塞用户使用，降级为游客模式
              console.warn('后端登录失败，使用游客模式:', err.message)
              this.globalData.isLoggedIn = false
            })
        } else {
          console.warn('wx.login 获取 code 失败')
        }
      },
      fail: (err) => {
        console.warn('wx.login 失败，使用游客模式:', err)
      }
    })
  },

  // 通知当前页面刷新数据（autoLogin异步完成后调用）
  notifyPagesRefresh() {
    const pages = getCurrentPages()
    if (pages.length > 0) {
      const currentPage = pages[pages.length - 1]
      if (currentPage && typeof currentPage.loadUserData === 'function') {
        currentPage.loadUserData()
      }
    }
  },

  // 升级服务等级
  upgradeServiceLevel(level) {
    this.globalData.serviceLevel = level
    wx.setStorageSync(constants.STORAGE_KEYS.SERVICE_LEVEL, level)

    // 同步到后端
    if (this.globalData.userInfo && this.globalData.userInfo.openid) {
      api.updateProfile({
        openid: this.globalData.userInfo.openid,
        serviceLevel: level
      }).catch(e => console.log('同步服务等级失败(非致命):', e.message))
    }
  },

  // 保存企业信息
  saveCompanyInfo(info) {
    this.globalData.companyInfo = info
    wx.setStorageSync(constants.STORAGE_KEYS.COMPANY_INFO, info)
  },

  // 企业信息不存在时弹框提示
  showCompanyInfoPrompt() {
    wx.showModal({
      title: '提示',
      content: '您还未填写企业信息，是否前往填写？',
      confirmText: '去填写',
      cancelText: '先看看',
      success: (res) => {
        if (res.confirm) {
          wx.navigateTo({
            url: '/pages/service/service'
          })
        }
      }
    })
  }
})
