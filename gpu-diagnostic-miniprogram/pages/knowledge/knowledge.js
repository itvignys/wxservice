const api = require('../../utils/api.js')
const constants = require('../../utils/constants.js')
const knowledgeData = require('../../data/knowledge.js') // 离线兜底数据

Page({
  data: {
    searchKeyword: '',
    currentCategory: '全部',
    categories: [],
    categoryStats: {},
    knowledgeList: [],
    totalCount: 0,
    isRefreshing: false,
    showDetail: false,
    selectedItem: null,
    isLoading: false, // 新增：API加载状态
    categoryColors: {
      '显示类': '#065A82',
      '驱动类': '#02C39A',
      '供电与过热': '#FF9500',
      '物理与接口': '#5856D6',
      '显存与核心': '#FF3B30',
      'BIOS与固件': '#8E8E93'
    }
  },

  onLoad() {
    this.loadData()
  },

  onShow() {
    const keyword = wx.getStorageSync('searchKeyword')
    if (keyword) {
      this.setData({ searchKeyword: keyword })
      this.performSearch()
      wx.removeStorageSync('searchKeyword')
    }
  },

  // ========== 数据加载（优先API，降级到本地） ==========
  
  loadData() {
    this.setData({ isLoading: true })

    // 并行加载分类统计和列表
    Promise.all([
      api.getKnowledgeCategories(),
      api.getKnowledgeList('全部')
    ]).then(([categoryRes, listRes]) => {
      const statsData = categoryRes.data
      const list = listRes.data || []

      this.setData({
        categories: statsData.categories || ['显示类', '驱动类', '供电与过热', '物理与接口', '显存与核心', 'BIOS与固件'],
        categoryStats: statsData.stats || {},
        knowledgeList: list,
        totalCount: list.length,
        isLoading: false
      })
    }).catch(err => {
      console.warn('知识库API加载失败，使用本地数据:', err.message)
      // API失败时降级使用本地数据
      const fallbackCategories = knowledgeData.categories
      const fallbackStats = knowledgeData.getCategoryStats()
      const fallbackList = knowledgeData.knowledgeList

      this.setData({
        categories: fallbackCategories,
        categoryStats: fallbackStats,
        knowledgeList: fallbackList,
        totalCount: fallbackList.length,
        isLoading: false
      })
      
      wx.showToast({ title: '已切换离线模式', icon: 'none' })
    })
  },

  // 搜索输入（防抖300ms）
  onSearchInput(e) {
    this.setData({ searchKeyword: e.detail.value })
    clearTimeout(this.searchTimer)
    this.searchTimer = setTimeout(() => { this.performSearch() }, 300)
  },

  // 执行搜索（优先调API）
  performSearch() {
    const keyword = this.data.searchKeyword
    const category = this.data.currentCategory

    if (app.globalData.isLoggedIn) {
      // 已登录 -> 调用API搜索
      this.setData({ isLoading: true })
      api.searchKnowledge(keyword || '', category).then(res => {
        this.setData({
          knowledgeList: res.data || [],
          isLoading: false
        })
      }).catch(err => {
        console.warn('搜索API失败，使用本地搜索:', err.message)
        this.localSearch(keyword, category)
      })
    } else {
      // 未登录 -> 使用本地搜索
      this.localSearch(keyword, category)
    }
  },

  // 本地搜索（离线兜底）
  localSearch(keyword, category) {
    let list = knowledgeData.knowledgeList
    
    if (category !== '全部') {
      list = list.filter(item => item.category === category)
    }
    
    if (keyword) {
      const lowerKeyword = keyword.toLowerCase()
      list = list.filter(item => {
        return item.question.toLowerCase().includes(lowerKeyword) ||
               item.causes.toLowerCase().includes(lowerKeyword) ||
               item.diagnosis.toLowerCase().includes(lowerKeyword) ||
               item.solution.toLowerCase().includes(lowerKeyword)
      })
    }

    this.setData({ knowledgeList: list })
  },

  clearSearch() {
    this.setData({ searchKeyword: '' })
    this.performSearch()
  },

  selectCategory(e) {
    const category = e.currentTarget.dataset.category
    this.setData({ currentCategory: category })
    this.performSearch()
  },

  viewDetail(e) {
    const id = e.currentTarget.dataset.id
    // 先尝试从当前列表中获取
    const item = this.data.knowledgeList.find(k => k.id === id)
    
    this.setData({
      showDetail: true,
      selectedItem: item || null
    })

    // 如果列表中没有，尝试从API或本地数据获取详情
    if (!item) {
      if (app.globalData.isLoggedIn) {
        api.getKnowledgeDetail(id).then(res => {
          this.setData({ selectedItem: res.data })
        }).catch(() => {
          this.setData({ selectedItem: knowledgeData.getById(id) })
        })
      } else {
        this.setData({ selectedItem: knowledgeData.getById(id) })
      }
    }
  },

  closeDetail() {
    this.setData({ showDetail: false, selectedItem: null })
  },

  preventClose() {}, // 阻止事件冒泡

  consultExpert() {
    this.closeDetail()
    wx.showModal({
      title: '联系专家',
      content: '专家服务热线：13826580396\n服务时间：9:00-21:00',
      confirmText: '立即拨打',
      success: (res) => {
        if (res.confirm) {
          wx.makePhoneCall({ phoneNumber: '13826580396' })
        }
      }
    })
  },

  goToDiagnose() {
    this.closeDetail()
    wx.switchTab({ url: '/pages/chatbot/chatbot' })
  },

  onRefresh() {
    this.setData({ isRefreshing: true })
    
    setTimeout(() => {
      this.loadData()
      this.setData({ isRefreshing: false })
      wx.showToast({ title: '刷新成功', icon: 'success' })
    }, 1000)
  }
})
