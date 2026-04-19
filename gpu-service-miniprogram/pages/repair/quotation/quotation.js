const { orderApi } = require('../../../utils/api')
const { QUOTATION_TYPE, QUOTATION_TYPE_TEXT } = require('../../../utils/constants')

Page({
  data: {
    orderId: null,
    quotationType: 'normal',
    quotationTypeText: '正式报价',
    feeItems: [{ name: '', amount: '' }],
    form: {
      discountAmount: '',
      discountReason: '',
      supplementReason: ''
    },
    totalAmount: '0.00',
    actualAmount: '0.00',
    submitting: false
  },

  onLoad(options) {
    const type = options.type || 'normal'
    this.setData({
      orderId: options.id,
      quotationType: type,
      quotationTypeText: QUOTATION_TYPE_TEXT[type] || '报价'
    })
  },

  onInput(e) {
    const field = e.currentTarget.dataset.field
    this.setData({ [`form.${field}`]: e.detail.value }, this.calcTotal)
  },

  onFeeInput(e) {
    const { index, field } = e.currentTarget.dataset
    this.setData({ [`feeItems[${index}].${field}`]: e.detail.value }, this.calcTotal)
  },

  addFeeItem() {
    this.setData({ feeItems: [...this.data.feeItems, { name: '', amount: '' }] })
  },

  deleteFeeItem(e) {
    if (this.data.feeItems.length <= 1) return
    const items = this.data.feeItems
    items.splice(e.currentTarget.dataset.index, 1)
    this.setData({ feeItems: items }, this.calcTotal)
  },

  calcTotal() {
    const total = this.data.feeItems.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0)
    const discount = parseFloat(this.data.form.discountAmount) || 0
    this.setData({
      totalAmount: total.toFixed(2),
      actualAmount: Math.max(0, total - discount).toFixed(2)
    })
  },

  async submitQuotation() {
    const validItems = this.data.feeItems.filter(i => i.name && i.amount)
    if (validItems.length === 0) {
      wx.showToast({ title: '请至少添加一项费用', icon: 'none' }); return
    }

    this.setData({ submitting: true })
    try {
      const data = {
        orderId: this.data.orderId,
        quotationType: this.data.quotationType,
        feeItems: JSON.stringify(validItems),
        totalAmount: this.data.totalAmount,
        discountAmount: this.data.form.discountAmount || '0',
        discountReason: this.data.form.discountReason,
        actualAmount: this.data.actualAmount,
        supplementReason: this.data.form.supplementReason
      }

      if (this.data.quotationType === 'supplement') {
        await orderApi.supplementQuotation(data)
      } else if (this.data.quotationType === 'revision') {
        await orderApi.reviseQuotation(data)
      } else {
        await orderApi.submitQuotation(data)
      }

      wx.showToast({ title: '报价提交成功', icon: 'success' })
      setTimeout(() => wx.navigateBack(), 1500)
    } catch (e) {
      wx.showToast({ title: '提交失败', icon: 'none' })
    } finally {
      this.setData({ submitting: false })
    }
  }
})
