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
    cacheSize: '0KB',
    userRoles: [],
    isService: false,
    isEngineer: false,
    isInspector: false,
    isAdmin: false,
    showWorkMenu: false,
    pendingCount: 0,
    pendingAcceptCount: 0,
    engineerTaskCount: 0,
    inspectionCount: 0
  },

  onLoad() {
    this.loadUserInfo()
    this.loadCompanyInfo()
    this.loadStats()
    this.loadUserRole()
    this.calculateCacheSize()
  },

  onShow() {
    this.loadCompanyInfo()
    this.loadStats()
    this.loadUserRole()
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

  loadUserRole() {
    const role = wx.getStorageSync('userRole') || 'customer'
    const { ROLE_TEXT } = require('../../utils/constants')
    const roleMap = {
      isService: role === 'service' || role === 'admin',
      isEngineer: role === 'engineer' || role === 'admin',
      isInspector: role === 'inspector' || role === 'admin',
      isAdmin: role === 'admin',
      showWorkMenu: true // 所有人都能看到工单管理
    }
    // 角色标签
    const roles = []
    if (role === 'customer') roles.push('客户')
    if (roleMap.isService) roles.push('客服')
    if (roleMap.isEngineer) roles.push('工程师')
    if (roleMap.isInspector) roles.push('质检员')
    if (roleMap.isAdmin) roles.push('管理员')

    this.setData({
      ...roleMap,
      userRoles: roles
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
        orderCount: 0
      }
    })
  },

  calculateCacheSize() {
    this.setData({ cacheSize: '< 1MB' })
  },

  onChooseAvatar(e) {
    const avatarUrl = e.detail.avatarUrl
    this.setData({ 'userInfo.avatarUrl': avatarUrl })
    const userInfo = wx.getStorageSync('userInfo') || {}
    userInfo.avatarUrl = avatarUrl
    wx.setStorageSync('userInfo', userInfo)
  },

  // 工单相关导航
  goToCreateOrder() {
    wx.navigateTo({ url: '/pages/repair/create/create' })
  },

  goToMyOrders() {
    wx.navigateTo({ url: '/pages/repair/list/list' })
  },

  goToPendingOrders() {
    wx.navigateTo({ url: '/pages/repair/list/list?tab=pending' })
  },

  goToAllOrders() {
    wx.navigateTo({ url: '/pages/repair/list/list?tab=all' })
  },

  goToEngineerTasks() {
    wx.navigateTo({ url: '/pages/repair/list/list?tab=engineer' })
  },

  goToInspectionTasks() {
    wx.navigateTo({ url: '/pages/repair/list/list?tab=inspection' })
  },

  goToBookings() {
    wx.navigateTo({ url: '/pages/profile/bookings/bookings' })
  },

  goToHistory() {
    wx.navigateTo({ url: '/pages/profile/history/history' })
  },

  goToFavorites() {
    wx.navigateTo({ url: '/pages/profile/favorites/favorites' })
  },

  editCompanyInfo() {
    wx.navigateTo({ url: '/pages/profile/company/company' })
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
    wx.navigateTo({ url: '/pages/profile/about/about' })
  },

  goToFeedback() {
    wx.navigateTo({ url: '/pages/profile/feedback/feedback' })
  },

  callHotline() {
    wx.makePhoneCall({ phoneNumber: '400-888-8888' })
  }
})
