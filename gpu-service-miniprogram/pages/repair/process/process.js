const { orderApi } = require('../../../utils/api')

Page({
  data: {
    orderId: null,
    stepRecords: [{ desc: '' }],
    partsReplaced: [],
    form: {
      actualHours: '',
      repairResult: '',
      repairRemark: ''
    },
    submitting: false
  },

  onLoad(options) {
    this.setData({ orderId: options.id })
  },

  onInput(e) {
    this.setData({ [`form.${e.currentTarget.dataset.field}`]: e.detail.value })
  },

  onStepInput(e) {
    const { index, field } = e.currentTarget.dataset
    this.setData({ [`stepRecords[${index}].${field}`]: e.detail.value })
  },

  addStep() {
    this.setData({ stepRecords: [...this.data.stepRecords, { desc: '' }] })
  },

  deleteStep(e) {
    if (this.data.stepRecords.length <= 1) return
    const steps = this.data.stepRecords
    steps.splice(e.currentTarget.dataset.index, 1)
    this.setData({ stepRecords: steps })
  },

  onPartInput(e) {
    const { index, field } = e.currentTarget.dataset
    this.setData({ [`partsReplaced[${index}].${field}`]: e.detail.value })
  },

  addPart() {
    this.setData({ partsReplaced: [...this.data.partsReplaced, { name: '', count: 1 }] })
  },

  deletePart(e) {
    const parts = this.data.partsReplaced
    parts.splice(e.currentTarget.dataset.index, 1)
    this.setData({ partsReplaced: parts })
  },

  async submitProcess() {
    this.setData({ submitting: true })
    try {
      await orderApi.submitRepairProcess({
        orderId: this.data.orderId,
        stepRecords: JSON.stringify(this.data.stepRecords),
        partsReplaced: JSON.stringify(this.data.partsReplaced),
        ...this.data.form
      })
      wx.showToast({ title: '记录已提交', icon: 'success' })
      setTimeout(() => wx.navigateBack(), 1500)
    } catch (e) {
      wx.showToast({ title: '提交失败', icon: 'none' })
    } finally {
      this.setData({ submitting: false })
    }
  }
})
