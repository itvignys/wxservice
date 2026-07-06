const { models, categories } = require('../../../data/recycleData')
const { CONDITION_FACTOR } = require('../../../utils/constants')
const { formatPrice } = require('../../../utils/util')

Page({
  data: {
    category: {},
    brands: [],
    currentBrand: '全部',
    filteredModels: [],
    selectedId: ''
  },

  onLoad(options) {
    const app = getApp()
    const category = app.globalData.quoteData.category || categories.find(c => c.id === options.categoryId)
    const modelList = models[category.id] || []

    // 提取品牌
    const brandSet = ['全部', ...new Set(modelList.map(m => m.brand))]

    // 计算价格区间
    const listWithPrice = modelList.map(m => ({
      ...m,
      priceMin: formatPrice(Math.round(m.basePrice * CONDITION_FACTOR.N80)),
      priceMax: formatPrice(Math.round(m.basePrice * CONDITION_FACTOR.BRAND_NEW))
    }))

    this.setData({
      category,
      brands: brandSet,
      filteredModels: listWithPrice
    })
  },

  switchBrand(e) {
    const brand = e.currentTarget.dataset.brand
    const modelList = models[this.data.category.id] || []
    let filtered = modelList
    if (brand !== '全部') {
      filtered = modelList.filter(m => m.brand === brand)
    }
    const listWithPrice = filtered.map(m => ({
      ...m,
      priceMin: formatPrice(Math.round(m.basePrice * CONDITION_FACTOR.N80)),
      priceMax: formatPrice(Math.round(m.basePrice * CONDITION_FACTOR.BRAND_NEW))
    }))
    this.setData({ currentBrand: brand, filteredModels: listWithPrice })
  },

  selectModel(e) {
    const model = e.currentTarget.dataset.model
    this.setData({ selectedId: model.id })

    const app = getApp()
    // 找回原始model对象(含basePrice)
    const original = models[this.data.category.id].find(m => m.id === model.id)
    app.globalData.quoteData.model = original
  },

  next() {
    if (!this.data.selectedId) {
      wx.showToast({ title: '请选择型号', icon: 'none' })
      return
    }
    wx.navigateTo({ url: '/pages/recycle/condition/condition' })
  }
})
