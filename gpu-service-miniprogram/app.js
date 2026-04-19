App({
  onLaunch() {
    console.log('GPU智修专家小程序启动')
    
    // 初始化本地存储
    const initStorage = (key, defaultValue) => {
      if (!wx.getStorageSync(key)) {
        wx.setStorageSync(key, defaultValue)
      }
    }
    
    initStorage('serviceRecords', [])
    initStorage('chatHistory', [])
    initStorage('bookings', [])
    initStorage('favorites', [])
    initStorage('feedbacks', [])
    initStorage('userInfo', null)
    initStorage('companyInfo', null)
    
    // 检查更新
    this.checkUpdate()
  },
  
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
    serviceTier: 'ai', // ai, expert, onsite
    systemInfo: null
  }
})
