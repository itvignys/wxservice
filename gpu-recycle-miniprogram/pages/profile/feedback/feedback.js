Page({
  data: {
    types: ['功能建议', '估价问题', '订单问题', '验机问题', '其他'],
    form: { type: '功能建议', content: '', contact: '' }
  },

  selectType(e) { this.setData({ 'form.type': e.currentTarget.dataset.type }) },
  onContentInput(e) { this.setData({ 'form.content': e.detail.value }) },
  onContactInput(e) { this.setData({ 'form.contact': e.detail.value }) },

  submit() {
    const { content, type } = this.data.form
    if (content.length < 10) { wx.showToast({ title: '请至少输入10个字', icon: 'none' }); return }

    // 保存到本地
    const feedbacks = wx.getStorageSync('feedbacks') || []
    feedbacks.unshift({ ...this.data.form, time: Date.now() })
    wx.setStorageSync('feedbacks', feedbacks)

    wx.showToast({ title: '提交成功，感谢反馈', icon: 'success' })
    setTimeout(() => wx.navigateBack(), 1500)
  }
})
