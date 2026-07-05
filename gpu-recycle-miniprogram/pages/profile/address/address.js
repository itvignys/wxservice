const { addressApi } = require('../../../utils/api')

Page({
  data: { addresses: [] },

  onShow() { this.loadAddresses() },

  loadAddresses() {
    addressApi.getList().then((data) => {
      this.setData({ addresses: data || [] })
    }).catch(() => {
      this.setData({ addresses: wx.getStorageSync('addresses') || [] })
    })
  },

  addAddress() { wx.navigateTo({ url: '/pages/profile/address-edit/address-edit' }) },

  editAddress(e) {
    wx.navigateTo({ url: `/pages/profile/address-edit/address-edit?id=${e.currentTarget.dataset.id}` })
  },

  setDefault(e) {
    const id = e.currentTarget.dataset.id
    addressApi.setDefault(id).catch(() => {})
    const addresses = this.data.addresses.map(a => ({ ...a, isDefault: a.id === id }))
    this.setData({ addresses })
    wx.setStorageSync('addresses', addresses)
  },

  deleteAddress(e) {
    const id = e.currentTarget.dataset.id
    wx.showModal({
      title: '提示', content: '确定删除此地址？',
      success: (res) => {
        if (res.confirm) {
          addressApi.delete(id).catch(() => {})
          const addresses = this.data.addresses.filter(a => a.id !== id)
          this.setData({ addresses })
          wx.setStorageSync('addresses', addresses)
        }
      }
    })
  }
})
