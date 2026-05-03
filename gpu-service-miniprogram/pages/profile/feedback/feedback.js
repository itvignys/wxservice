Page({
  data: {
    feedbackTypes: [
      { label: '功能建议', value: 'feature' },
      { label: 'Bug反馈', value: 'bug' },
      { label: '服务投诉', value: 'complaint' },
      { label: '其他', value: 'other' }
    ],
    form: {
      type: 'feature',
      content: '',
      contact: ''
    }
  },

  selectType(e) {
    const type = e.currentTarget.dataset.type
    this.setData({
      'form.type': type
    })
  },

  onContentInput(e) {
    this.setData({
      'form.content': e.detail.value
    })
  },

  onContactInput(e) {
    this.setData({
      'form.contact': e.detail.value
    })
  },

  submitFeedback() {
    const { form } = this.data

    if (!form.content.trim()) {
      wx.showToast({
        title: '请输入反馈内容',
        icon: 'none'
      })
      return
    }

    // 构造反馈数据
    const feedbackData = {
      ...form,
      createTime: new Date().toISOString()
    }

    // 保存反馈记录
    let feedbacks = wx.getStorageSync('feedbacks') || []
    feedbacks.push(feedbackData)
    wx.setStorageSync('feedbacks', feedbacks)

    wx.showToast({
      title: '提交成功',
      icon: 'success',
      success: () => {
        setTimeout(() => {
          wx.navigateBack()
        }, 1500)
      }
    })
  }
})
