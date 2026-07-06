const { formatPrice } = require('../../utils/util')
const { RECYCLE_STATUS } = require('../../utils/constants')

Page({
  data: {
    userInfo: null,
    stats: { totalCount: 0, totalAmount: '0', activeCount: 0 }
  },

  onShow() {
    this.loadUserInfo()
    this.loadStats()
  },

  loadUserInfo() {
    const userInfo = wx.getStorageSync('userInfo')
    this.setData({ userInfo })
  },

  loadStats() {
    const records = wx.getStorageSync('recycleRecords') || []
    const completed = records.filter(r => r.status === RECYCLE_STATUS.COMPLETED)
    const active = records.filter(r => ![RECYCLE_STATUS.COMPLETED, RECYCLE_STATUS.CANCELLED].includes(r.status))
    const totalAmount = completed.reduce((sum, r) => sum + (r.finalPrice || r.estimatedPrice || 0), 0)

    this.setData({
      stats: {
        totalCount: records.length,
        totalAmount: formatPrice(totalAmount),
        activeCount: active.length
      }
    })
  },

  goLogin() {
    const app = getApp()
    app.wxLogin()
    setTimeout(() => this.loadUserInfo(), 2000)
  },

  editProfile() {
    wx.showToast({ title: '功能开发中', icon: 'none' })
  },

  goAddress() { wx.navigateTo({ url: '/pages/profile/address/address' }) },
  goHistory() { wx.navigateTo({ url: '/pages/profile/history/history' }) },
  goPayment() { wx.showToast({ title: '功能开发中', icon: 'none' }) },
  goAbout() { wx.navigateTo({ url: '/pages/profile/about/about' }) },
  goFeedback() { wx.navigateTo({ url: '/pages/profile/feedback/feedback' }) },
  callService() { wx.makePhoneCall({ phoneNumber: '13826580396' }) }
})
