const { orderApi } = require('../../../utils/api')

Page({
  data: {
    orderId: null,
    engineers: [
      { openid: 'eng1', name: '张工' },
      { openid: 'eng2', name: '李工' },
      { openid: 'eng3', name: '王工' }
    ],
    selectedEngineer: null,
    submitting: false
  },

  onLoad(options) {
    this.setData({ orderId: options.id })
  },

  onEngineerChange(e) {
    this.setData({ selectedEngineer: this.data.engineers[e.detail.value] })
  },

  async acceptOrder() {
    if (!this.data.selectedEngineer) {
      wx.showToast({ title: '请选择工程师', icon: 'none' }); return
    }
    this.setData({ submitting: true })
    try {
      await orderApi.accept({
        orderId: this.data.orderId,
        acceptorOpenid: wx.getStorageSync('openid'),
        engineerOpenid: this.data.selectedEngineer.openid
      })
      wx.showToast({ title: '受理成功', icon: 'success' })
      setTimeout(() => wx.navigateBack(), 1500)
    } catch (e) {
      wx.showToast({ title: '受理失败', icon: 'none' })
    } finally {
      this.setData({ submitting: false })
    }
  }
})
