const { hotModels, categories, promises, flowSteps, contactInfo } = require('../../data/recycleData')
const { CONDITION_FACTOR } = require('../../utils/constants')
const { formatPrice } = require('../../utils/util')

Page({
  data: {
    totalAmount: '12,580',
    totalOrders: '3,200+',
    hotModels: [],
    categories: [],
    promises: [],
    flowSteps: []
  },

  onLoad() {
    this.initData()
  },

  onShow() {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({ selected: 0 })
    }
  },

  initData() {
    // 计算热门机型价格区间（基础价 × 成色系数范围 0.6~1.0）
    const hotList = hotModels.map(m => {
      const min = Math.round(m.basePrice * CONDITION_FACTOR.N80)
      const max = Math.round(m.basePrice * CONDITION_FACTOR.BRAND_NEW)
      return {
        ...m,
        priceMin: formatPrice(min),
        priceMax: formatPrice(max)
      }
    })

    this.setData({
      hotModels: hotList,
      categories,
      promises,
      flowSteps
    })
  },

  // 跳转到回收估价页
  goRecycle() {
    wx.switchTab({ url: '/pages/recycle/recycle' })
  },

  // 点击热门机型直接进入估价流程
  goEstimate(e) {
    const model = e.currentTarget.dataset.model
    const app = getApp()
    app.globalData.quoteData = {
      category: categories.find(c => c.id === model.catId || this._inferCategory(model)),
      model: model,
      condition: null,
      config: null,
      price: 0
    }
    wx.navigateTo({ url: '/pages/recycle/condition/condition' })
  },

  _inferCategory(model) {
    if (model.id.startsWith('dgx') || model.id.startsWith('hgx') || model.id.includes('server')) return categories[0]
    if (model.id.startsWith('mi300x_server') || model.id.startsWith('mi300a_server')) return categories[0]
    return categories.find(c => c.id === 'gpu_card')
  },

  // 选择品类进入估价
  goCategory(e) {
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

  // 拨打客服
  callService() {
    wx.makePhoneCall({ phoneNumber: contactInfo.phone })
  },

  onPullDownRefresh() {
    this.initData()
    wx.stopPullDownRefresh()
  }
})
