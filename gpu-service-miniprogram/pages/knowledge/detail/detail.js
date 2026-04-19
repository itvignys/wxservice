const knowledgeData = require('../../../data/knowledge.js')

Page({
  data: {
    problem: {},
    relatedProblems: []
  },

  onLoad(options) {
    const id = parseInt(options.id)
    this.loadProblem(id)
  },

  loadProblem(id) {
    const problem = knowledgeData.problems.find(p => p.id === id)
    if (problem) {
      const icon = this.getCategoryIcon(problem.category)
      const difficultyStr = '★'.repeat(problem.difficulty)
      
      this.setData({
        problem: {
          ...problem,
          icon,
          difficultyStr
        }
      })

      // 加载相关问题（同分类的其他问题）
      this.loadRelatedProblems(problem)
    }
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

  loadRelatedProblems(currentProblem) {
    const related = knowledgeData.problems
      .filter(p => p.category === currentProblem.category && p.id !== currentProblem.id)
      .slice(0, 3)
      .map(p => ({
        id: p.id,
        title: p.title,
        successRate: p.successRate,
        icon: this.getCategoryIcon(p.category)
      }))
    
    this.setData({ relatedProblems: related })
  },

  goToRelated(e) {
    const id = e.currentTarget.dataset.id
    wx.redirectTo({
      url: `/pages/knowledge/detail/detail?id=${id}`
    })
  },

  goToChat() {
    wx.switchTab({ url: '/pages/chat/chat' })
  },

  goToExpert() {
    wx.navigateTo({ url: '/pages/expert/expert' })
  },

  onShareAppMessage() {
    return {
      title: `GPU智修专家：${this.data.problem.title}`,
      path: `/pages/knowledge/detail/detail?id=${this.data.problem.id}`
    }
  }
})
