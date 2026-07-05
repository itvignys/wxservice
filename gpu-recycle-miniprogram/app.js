// GPU算力硬件回收小程序
const { userApi } = require('./utils/api')

App({
  onLaunch() {
    console.log('GPU算力回收小程序启动')

    // 初始化本地存储
    const initStorage = (key, defaultValue) => {
      if (wx.getStorageSync(key) === '' || wx.getStorageSync(key) === undefined) {
        wx.setStorageSync(key, defaultValue)
      }
    }

    initStorage('userInfo', null)
    initStorage('openid', '')
    initStorage('recycleRecords', [])
    initStorage('recentQuotes', [])
    initStorage('addresses', [])
    initStorage('priceRules', null)

    // 微信登录获取openid
    this.wxLogin()

    // 检查更新
    this.checkUpdate()
  },

  // 微信静默登录
  wxLogin() {
    const openid = wx.getStorageSync('openid')
    if (openid) {
      // 已有openid，拉取用户信息
      this.loadUserInfo(openid)
      return
    }
    wx.login({
      success: (res) => {
        if (res.code) {
          userApi.login(res.code).then((user) => {
            if (user && user.openid) {
              wx.setStorageSync('openid', user.openid)
              this.globalData.userInfo = user
              this.globalData.openid = user.openid
            }
          }).catch((err) => {
            console.error('登录失败', err)
          })
        }
      }
    })
  },

  // 加载用户信息
  loadUserInfo(openid) {
    userApi.getProfile(openid).then((user) => {
      this.globalData.userInfo = user
    }).catch(() => {})
  },

  // 检查小程序更新
  checkUpdate() {
    if (wx.canIUse('getUpdateManager')) {
      const updateManager = wx.getUpdateManager()
      updateManager.onCheckForUpdate((res) => {
        if (res.hasUpdate) {
          updateManager.onUpdateReady(() => {
            wx.showModal({
              title: '更新提示',
              content: '新版本已经准备好，是否重启应用？',
              success: (res) => {
                if (res.confirm) {
                  updateManager.applyUpdate()
                }
              }
            })
          })
        }
      })
    }
  },

  globalData: {
    userInfo: null,
    openid: '',
    systemInfo: null,
    // 估价流程临时数据，在估价各步骤间传递
    quoteData: {
      category: null,
      model: null,
      condition: null,
      config: null,
      price: 0
    }
  }
})
