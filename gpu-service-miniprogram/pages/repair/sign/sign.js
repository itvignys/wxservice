const { orderApi } = require('../../../utils/api')

Page({
  data: {
    orderId: null,
    form: {
      warrantyDays: '90',
      warrantyScope: ''
    },
    submitting: false,
    hasSignature: false
  },

  onLoad(options) {
    this.setData({ orderId: options.id })
  },

  onReady() {
    this.ctx = wx.createCanvasContext('signature')
    this.ctx.setStrokeStyle('#fff')
    this.ctx.setLineWidth(3)
    this.ctx.setLineCap('round')
  },

  onInput(e) {
    this.setData({ [`form.${e.currentTarget.dataset.field}`]: e.detail.value })
  },

  onTouchStart(e) {
    this.drawing = true
    const { x, y } = e.touches[0]
    this.ctx.beginPath()
    this.ctx.moveTo(x, y)
  },

  onTouchMove(e) {
    if (!this.drawing) return
    const { x, y } = e.touches[0]
    this.ctx.lineTo(x, y)
    this.ctx.stroke()
    this.ctx.draw(true)
    this.setData({ hasSignature: true })
  },

  onTouchEnd() {
    this.drawing = false
  },

  clearSignature() {
    this.ctx.draw()
    this.setData({ hasSignature: false })
  },

  async signDelivery() {
    this.setData({ submitting: true })
    try {
      await orderApi.signDelivery({
        orderId: this.data.orderId,
        warrantyDays: parseInt(this.data.form.warrantyDays) || 90,
        warrantyScope: this.data.form.warrantyScope
      })
      wx.showToast({ title: '签收成功', icon: 'success' })
      setTimeout(() => wx.navigateBack(), 1500)
    } catch (e) {
      wx.showToast({ title: '签收失败', icon: 'none' })
    } finally {
      this.setData({ submitting: false })
    }
  }
})
