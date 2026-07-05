const { categories, models } = require('../../data/recycleData')
const { CONDITION_FACTOR } = require('../../utils/constants')
const { formatPrice, formatTime, debounce } = require('../../utils/util')

Page({
  data: {
    categories: [],
    searchResults: [],
    recentQuotes: [],
    keyword: ''
  },

  onLoad() {
    this.setData({ categories })
    this.loadRecentQuotes()
  },

  onShow() {
    this.loadRecentQuotes()
  },

  // 加载最近估价记录
  loadRecentQuotes() {
    const recent = wx.getStorageSync('recentQuotes') || []
    this.setData({
      recentQuotes: recent.slice(0, 5).map(q => ({
        ...q,
        price: formatPrice(q.price),
        time: formatTime(q.time)
      }))
    })
  },

  // 搜索
  onSearch: debounce(function (e) {
    const keyword = (e.detail.value || '').trim().toUpperCase()
    if (!keyword) {
      this.setData({ searchResults: [] })
      return
    }
    const results = []
    Object.keys(models).forEach(catId => {
      models[catId].forEach(m => {
        if (m.name.toUpperCase().includes(keyword) || m.brand.toUpperCase().includes(keyword) || m.id.toUpperCase().includes(keyword)) {
          const min = Math.round(m.basePrice * CONDITION_FACTOR.N80)
          const max = Math.round(m.basePrice * CONDITION_FACTOR.BRAND_NEW)
          results.push({
            ...m,
            catId,
            priceMin: formatPrice(min),
            priceMax: formatPrice(max)
          })
        }
      })
    })
    this.setData({ searchResults: results })
  }, 300),

  onSearchConfirm(e) {
    this.onSearch(e)
  },

  // 选择品类
  selectCategory(e) {
    const cat = e.currentTarget.dataset.cat
    const app = getApp()
    app.globalData.quoteData = {
      category: cat,
      model: null,
      condition: null,
      config: null,
      price: 0
    }
    wx.navigateTo({ url: `/pages/recycle/model/model?categoryId=${cat.id}` })
  },

  // 选择搜索结果中的型号
  selectModel(e) {
    const model = e.currentTarget.dataset.model
    const app = getApp()
    const cat = categories.find(c => c.id === model.catId)
    app.globalData.quoteData = {
      category: cat,
      model: model,
      condition: null,
      config: null,
      price: 0
    }
    wx.navigateTo({ url: '/pages/recycle/condition/condition' })
  },

  // 重新估价
  reQuote(e) {
    const item = e.currentTarget.dataset.model
    const app = getApp()
    const cat = categories.find(c => c.id === item.catId)
    // 从models中找回完整model对象
    let model = null
    if (item.modelId) {
      const list = models[item.catId] || []
      model = list.find(m => m.id === item.modelId)
    }
    app.globalData.quoteData = {
      category: cat,
      model: model,
      condition: null,
      config: null,
      price: 0
    }
    if (model) {
      wx.navigateTo({ url: '/pages/recycle/condition/condition' })
    } else {
      wx.navigateTo({ url: `/pages/recycle/model/model?categoryId=${item.catId}` })
    }
  },

  callService() {
    wx.makePhoneCall({ phoneNumber: '13826580396' })
  }
})
