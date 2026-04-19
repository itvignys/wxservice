const { orderApi } = require('../../../utils/api')
const { FAULT_CATEGORIES } = require('../../../utils/constants')

Page({
  data: {
    orderId: null,
    faultCategories: FAULT_CATEGORIES,
    inspectionPhotos: [],
    form: {
      mainCause: '',
      secondaryCause: '',
      faultCategory: '',
      repairScheme: '',
      estimatedHours: '',
      estimatedCostParts: '',
      estimatedCostLabor: '',
      estimatedCostVisit: ''
    },
    submitting: false
  },

  onLoad(options) {
    this.setData({ orderId: options.id })
  },

  onInput(e) {
    this.setData({ [`form.${e.currentTarget.dataset.field}`]: e.detail.value })
  },

  onCategoryChange(e) {
    this.setData({ 'form.faultCategory': FAULT_CATEGORIES[e.detail.value] })
  },

  chooseImage() {
    wx.chooseMedia({
      count: 9 - this.data.inspectionPhotos.length,
      mediaType: ['image'],
      success: (res) => {
        const newImages = res.tempFiles.map(f => f.tempFilePath)
        this.setData({ inspectionPhotos: [...this.data.inspectionPhotos, ...newImages] })
      }
    })
  },

  deleteImage(e) {
    const photos = this.data.inspectionPhotos
    photos.splice(e.currentTarget.dataset.index, 1)
    this.setData({ inspectionPhotos: photos })
  },

  async submitReport() {
    const { form } = this.data
    if (!form.mainCause) { wx.showToast({ title: '请填写故障主因', icon: 'none' }); return }
    if (!form.repairScheme) { wx.showToast({ title: '请填写维修方案', icon: 'none' }); return }

    this.setData({ submitting: true })
    try {
      await orderApi.submitScheme({
        orderId: this.data.orderId,
        ...form,
        inspectionPhotos: JSON.stringify(this.data.inspectionPhotos)
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
