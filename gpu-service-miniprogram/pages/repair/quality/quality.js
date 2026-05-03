const { orderApi } = require('../../../utils/api')

Page({
  data: {
    orderId: null,
    testPhotos: [],
    form: {
      conclusion: 'passed',
      failReason: ''
    },
    checkItems: [
      { name: '功能测试', checked: false },
      { name: '稳定性测试', checked: false },
      { name: '外观检查', checked: false },
      { name: '性能测试', checked: false },
      { name: '安全检查', checked: false }
    ],
    submitting: false
  },

  onLoad(options) {
    this.setData({ orderId: options.id })
  },

  onInput(e) {
    this.setData({ [`form.${e.currentTarget.dataset.field}`]: e.detail.value })
  },

  onConclusionChange(e) {
    this.setData({ 'form.conclusion': e.currentTarget.dataset.value })
  },

  toggleCheck(e) {
    const index = e.currentTarget.dataset.index
    this.setData({ [`checkItems[${index}].checked`]: !this.data.checkItems[index].checked })
  },

  chooseImage() {
    wx.chooseMedia({
      count: 9 - this.data.testPhotos.length,
      mediaType: ['image'],
      success: (res) => {
        const newImages = res.tempFiles.map(f => f.tempFilePath)
        this.setData({ testPhotos: [...this.data.testPhotos, ...newImages] })
      }
    })
  },

  deleteImage(e) {
    const photos = this.data.testPhotos
    photos.splice(e.currentTarget.dataset.index, 1)
    this.setData({ testPhotos: photos })
  },

  async submitReport() {
    if (this.data.form.conclusion === 'failed' && !this.data.form.failReason) {
      wx.showToast({ title: '请填写不通过原因', icon: 'none' }); return
    }

    this.setData({ submitting: true })
    try {
      await orderApi.submitQualityReport({
        orderId: this.data.orderId,
        conclusion: this.data.form.conclusion,
        failReason: this.data.form.failReason,
        checkItems: JSON.stringify(this.data.checkItems),
        testPhotos: JSON.stringify(this.data.testPhotos)
      })
      wx.showToast({ title: '提交成功', icon: 'success' })
      setTimeout(() => wx.navigateBack(), 1500)
    } catch (e) {
      wx.showToast({ title: '提交失败', icon: 'none' })
    } finally {
      this.setData({ submitting: false })
    }
  }
})
