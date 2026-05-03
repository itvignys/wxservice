const knowledgeData = require('../../data/knowledge.js')

Page({
  data: {
    hotIssues: []
  },

  onLoad() {
    // 获取热门问题（成功率高的前4个）
    const problems = knowledgeData.problems
      .sort((a, b) => parseInt(b.successRate) - parseInt(a.successRate))
      .slice(0, 4)
      .map(item => ({
        id: item.id,
        title: item.title,
        type: item.type,
        successRate: item.successRate,
        icon: this.getCategoryIcon(item.category)
      }))
    
    this.setData({ hotIssues: problems })
  },

  getCategoryIcon(category) {
    const icons = {
      display: '🖥️',
      driver: '🔧',
      power: '⚡',
      physical: '🔌',
      memory: '💾',
      bios: '💿'
    }
    return icons[category] || '🔧'
  },

  goToChat() {
    wx.switchTab({ url: '/pages/chat/chat' })
  },

  goToKnowledge() {
    wx.switchTab({ url: '/pages/knowledge/knowledge' })
  },

  goToTools() {
    wx.switchTab({ url: '/pages/tools/tools' })
  },

  goToExpert() {
    wx.navigateTo({ url: '/pages/expert/expert' })
  },

  goToOnsite() {
    wx.navigateTo({ url: '/pages/onsite/onsite' })
  },

  goToDetail(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({
      url: `/pages/knowledge/detail/detail?id=${id}`
    })
  }
})
