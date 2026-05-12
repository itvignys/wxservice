const api = require('../../utils/api.js')

const categoryColors = {
  '显示类': '#065A82',
  '驱动类': '#02C39A',
  '供电与过热': '#FF9500',
  '物理与接口': '#5856D6',
  '显存与核心': '#FF3B30',
  'BIOS与固件': '#8E8E93',
  '其他': '#999999'
}

Page({
  data: {
    stats: {
      valuableCount: 0,
      totalCount: 0,
      pendingCount: 0
    },
    dailyStats: [],
    satisfaction: { like: 0, dislike: 0 },
    topQuestions: [],
    pendingList: [],
    isLoading: false,
    isDistilling: false,
    showDetail: false,
    selectedItem: null,
    searchKeyword: '',
    historyList: []
  },

  onLoad() {
    this.loadStats()
    this.loadPendingList()
  },

  onPullDownRefresh() {
    Promise.all([
      this.loadStats(),
      this.loadPendingList()
    ]).finally(() => {
      wx.stopPullDownRefresh()
    })
  },

  async loadStats() {
    try {
      const res = await api.getAiStats()
      const data = res.data || {}
      this.setData({
        'stats.valuableCount': data.valuableCount || 0,
        'stats.totalCount': data.totalCount || 0,
        'stats.pendingCount': data.pendingCount || 0,
        'dailyStats': data.dailyStats || [],
        'satisfaction': data.satisfaction || { like: 0, dislike: 0 },
        'topQuestions': data.topQuestions || []
      })
    } catch (err) {
      console.error('加载统计数据失败:', err)
    }
  },

  async loadPendingList() {
    this.setData({ isLoading: true })
    try {
      const res = await api.getPendingKnowledge()
      const list = res.data || []
      this.setData({
        pendingList: list,
        isLoading: false
      })
      this.setData({ 'stats.pendingCount': list.length })
    } catch (err) {
      console.error('加载待确认列表失败:', err)
      this.setData({ isLoading: false })
      wx.showToast({ title: '加载失败', icon: 'none' })
    }
  },

  // 手动触发知识提纯
  async onTriggerDistill() {
    wx.showModal({
      title: '触发知识提纯',
      content: '将扫描所有未处理的优质对话，调用AI自动提炼为结构化知识。是否继续？',
      confirmText: '开始提纯',
      success: async (res) => {
        if (res.confirm) {
          this.setData({ isDistilling: true })
          try {
            const result = await api.triggerDistill(50)
            const generatedCount = result.data.generatedCount || 0
            wx.showToast({
              title: `生成${generatedCount}条草稿`,
              icon: 'success'
            })
            this.loadPendingList()
            this.loadStats()
          } catch (err) {
            console.error('触发提纯失败:', err)
            wx.showToast({ title: '提纯失败', icon: 'none' })
          } finally {
            this.setData({ isDistilling: false })
          }
        }
      }
    })
  },

  // 查看详情
  onViewDetail(e) {
    const id = Number(e.currentTarget.dataset.id)
    const item = this.data.pendingList.find(k => k.id === id)
    if (item) {
      item._categoryColor = categoryColors[item.category] || categoryColors['其他']
      this.setData({
        selectedItem: item,
        showDetail: true
      })
    }
  },

  // 关闭详情
  onCloseDetail() {
    this.setData({ showDetail: false, selectedItem: null })
  },

  // 确认入库
  async onConfirm(e) {
    const id = Number(e.currentTarget.dataset.id)
    wx.showModal({
      title: '确认入库',
      content: '确认将该条目加入正式知识库？确认后将可被RAG检索召回。',
      confirmText: '确认入库',
      confirmColor: '#02C39A',
      success: async (res) => {
        if (res.confirm) {
          try {
            await api.confirmKnowledge(id)
            wx.showToast({ title: '入库成功', icon: 'success' })
            this.loadPendingList()
            this.loadStats()
          } catch (err) {
            console.error('确认入库失败:', err)
            wx.showToast({ title: '入库失败', icon: 'none' })
          }
        }
      }
    })
  },

  // 删除草稿
  onDelete(e) {
    const id = Number(e.currentTarget.dataset.id)
    wx.showModal({
      title: '删除草稿',
      content: '删除后不可恢复，是否确认？',
      confirmText: '删除',
      confirmColor: '#FF3B30',
      success: async (res) => {
        if (res.confirm) {
          try {
            await api.confirmKnowledge(id)
            wx.showToast({ title: '已删除', icon: 'success' })
            this.loadPendingList()
          } catch (err) {
            console.error('删除失败:', err)
            wx.showToast({ title: '删除失败', icon: 'none' })
          }
        }
      }
    })
  },

  // 搜索历史问答
  onSearchInput(e) {
    this.setData({ searchKeyword: e.detail.value })
  },

  async onSearchConfirm() {
    const keyword = this.data.searchKeyword.trim()
    if (!keyword) {
      this.setData({ historyList: [] })
      return
    }
    try {
      const res = await api.searchAiHistory(keyword, 10)
      this.setData({ historyList: res.data || [] })
    } catch (err) {
      console.error('搜索失败:', err)
      wx.showToast({ title: '搜索失败', icon: 'none' })
    }
  },

  onClearSearch() {
    this.setData({ searchKeyword: '', historyList: [] })
  }
})
