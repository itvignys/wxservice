Page({
  data: {
    userInfo: {
      nickName: '',
      avatarUrl: '',
      isEnterprise: false
    },
    companyInfo: {
      name: '',
      code: '',
      status: 'unverified',
      statusText: '未认证'
    },
    stats: {
      consultCount: 0,
      bookingCount: 0,
      orderCount: 0
    },
    cacheSize: '0KB'
  },

  onLoad() {
    this.loadUserInfo()
    this.loadCompanyInfo()
    this.loadStats()
    this.calculateCacheSize()
  },

  onShow() {
    this.loadCompanyInfo()
    this.loadStats()
  },

  loadUserInfo() {
    const userInfo = wx.getStorageSync('userInfo') || {}
    this.setData({
      userInfo: {
        nickName: userInfo.nickName || '',
        avatarUrl: userInfo.avatarUrl || '',
        isEnterprise: !!wx.getStorageSync('companyInfo')
      }
    })
  },

  loadCompanyInfo() {
    const companyInfo = wx.getStorageSync('companyInfo')
    if (companyInfo) {
      this.setData({
        companyInfo: {
          name: companyInfo.name || '',
          code: companyInfo.code || '',
          status: 'verified',
          statusText: '已认证'
        },
        'userInfo.isEnterprise': true
      })
    } else {
      this.setData({
        companyInfo: {
          name: '',
          code: '',
          status: 'unverified',
          statusText: '未认证'
        }
      })
    }
  },

  loadStats() {
    const chatHistory = wx.getStorageSync('chatHistory') || []
    const bookings = wx.getStorageSync('bookings') || []
    
    this.setData({
      stats: {
        consultCount: chatHistory.length,
        bookingCount: bookings.length,
        orderCount: 0 // 订单数量需要从订单数据获取
      }
    })
  },

  calculateCacheSize() {
    // 简化的缓存大小计算
    this.setData({
      cacheSize: '< 1MB'
    })
  },

  onChooseAvatar(e) {
    const avatarUrl = e.detail.avatarUrl
    this.setData({
      'userInfo.avatarUrl': avatarUrl
    })
    
    const userInfo = wx.getStorageSync('userInfo') || {}
    userInfo.avatarUrl = avatarUrl
    wx.setStorageSync('userInfo', userInfo)
  },

  goToBookings() {
    wx.navigateTo({
      url: '/pages/profile/bookings/bookings'
    })
  },

  goToOrders() {
    wx.showToast({
      title: '功能开发中',
      icon: 'none'
    })
  },

  goToHistory() {
    wx.navigateTo({
      url: '/pages/profile/history/history'
    })
  },

  goToFavorites() {
    wx.navigateTo({
      url: '/pages/profile/favorites/favorites'
    })
  },

  editCompanyInfo() {
    wx.navigateTo({
      url: '/pages/profile/company/company'
    })
  },

  clearCache() {
    wx.showModal({
      title: '清除缓存',
      content: '确定要清除所有缓存数据吗？此操作不可恢复。',
      confirmColor: '#ff6b6b',
      success: (res) => {
        if (res.confirm) {
          wx.clearStorage()
          wx.showToast({
            title: '清除成功',
            icon: 'success',
            success: () => {
              this.setData({
                cacheSize: '0KB',
                stats: { consultCount: 0, bookingCount: 0, orderCount: 0 },
                userInfo: { nickName: '', avatarUrl: '', isEnterprise: false },
                companyInfo: { name: '', code: '', status: 'unverified', statusText: '未认证' }
              })
            }
          })
        }
      }
    })
  },

  goToAbout() {
    wx.navigateTo({
      url: '/pages/profile/about/about'
    })
  },

  goToFeedback() {
    wx.navigateTo({
      url: '/pages/profile/feedback/feedback'
    })
  },

  callHotline() {
    wx.makePhoneCall({
      phoneNumber: '400-888-8888'
    })
  }
})
