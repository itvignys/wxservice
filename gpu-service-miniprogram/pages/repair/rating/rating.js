const { orderApi } = require('../../../utils/api')

Page({
  data: {
    orderId: null,
    rating: 5,
    form: { review: '' },
    submitting: false
  },

  onLoad(options) {
    this.setData({ orderId: options.id })
  },

  setRating(e) {
    this.setData({ rating: e.currentTarget.dataset.value })
  },

  onInput(e) {
    this.setData({ [`form.${e.currentTarget.dataset.field}`]: e.detail.value })
  },

  async submitRating() {
    this.setData({ submitting: true })
    try {
      await orderApi.submitRating({
        orderId: this.data.orderId,
        rating: this.data.rating,
        review: this.data.form.review
      })
      wx.showToast({ title: '评价成功', icon: 'success' })
      setTimeout(() => wx.navigateBack(), 1500)
    } catch (e) {
      wx.showToast({ title: '评价失败', icon: 'none' })
    } finally {
      this.setData({ submitting: false })
    }
  }
})
