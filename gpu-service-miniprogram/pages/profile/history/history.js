Page({
  data: {
    history: []
  },

  onLoad() {
    this.loadHistory()
  },

  onShow() {
    this.loadHistory()
  },

  loadHistory() {
    const chatHistory = wx.getStorageSync('chatHistory') || []
    
    // 格式化数据
    const formattedHistory = chatHistory.map((item, index) => {
      const date = new Date(item.timestamp)
      const messages = item.messages || []
      const firstUserMsg = messages.find(m => m.type === 'user')
      
      return {
        index: index,
        title: firstUserMsg ? firstUserMsg.content.substring(0, 20) + (firstUserMsg.content.length > 20 ? '...' : '') : 'GPU故障咨询',
        preview: messages.length > 0 ? messages[messages.length - 1].content.substring(0, 50) : '',
        time: `${date.getMonth() + 1}月${date.getDate()}日`,
        messageCount: messages.length
      }
    })

    // 按时间倒序排列
    formattedHistory.reverse()

    this.setData({
      history: formattedHistory
    })
  },

  viewDetail(e) {
    const index = e.currentTarget.dataset.index
    wx.navigateTo({
      url: `/pages/chat/chat?historyIndex=${index}`
    })
  },

  goToChat() {
    wx.switchTab({
      url: '/pages/index/index'
    })
  },

  clearHistory() {
    wx.showModal({
      title: '清空历史',
      content: '确定要清空所有咨询历史吗？此操作不可恢复。',
      confirmColor: '#ff6b6b',
      success: (res) => {
        if (res.confirm) {
          wx.removeStorageSync('chatHistory')
          this.setData({
            history: []
          })
          wx.showToast({
            title: '已清空',
            icon: 'success'
          })
        }
      }
    })
  }
})
