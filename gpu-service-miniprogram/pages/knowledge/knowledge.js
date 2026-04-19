const knowledgeData = require('../../data/knowledge.js')

Page({
  data: {
    categories: [],
    problems: [],
    filteredProblems: [],
    currentCategory: 'all',
    searchKeyword: ''
  },

  onLoad() {
    this.loadData()
  },

  loadData() {
    const categories = knowledgeData.categories
    const problems = knowledgeData.problems.map(p => ({
      ...p,
      icon: this.getCategoryIcon(p.category),
      difficultyStr: '★'.repeat(p.difficulty)
    }))

    this.setData({
      categories,
      problems,
      filteredProblems: problems
    })
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

  switchCategory(e) {
    const category = e.currentTarget.dataset.category
    this.setData({ currentCategory: category })
    this.filterProblems()
  },

  onSearch(e) {
    this.setData({ searchKeyword: e.detail.value })
    this.filterProblems()
  },

  filterProblems() {
    const { problems, currentCategory, searchKeyword } = this.data
    
    let filtered = problems

    // 按分类筛选
    if (currentCategory !== 'all') {
      filtered = filtered.filter(p => p.category === currentCategory)
    }

    // 按关键词搜索
    if (searchKeyword) {
      const keyword = searchKeyword.toLowerCase()
      filtered = filtered.filter(p => 
        p.title.includes(keyword) ||
        p.causes.includes(keyword) ||
        p.symptoms.some(s => s.includes(keyword)) ||
        p.type.includes(keyword)
      )
    }

    this.setData({ filteredProblems: filtered })
  },

  goToDetail(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({
      url: `/pages/knowledge/detail/detail?id=${id}`
    })
  },

  goToExpert() {
    wx.navigateTo({ url: '/pages/expert/expert' })
  }
})
