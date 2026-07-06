const { CONDITION_LEVEL, CONDITION_TEXT, CONDITION_FACTOR, CONDITION_DESC } = require('../../../utils/constants')
const { formatPrice } = require('../../../utils/util')

Page({
  data: {
    model: {},
    basePriceText: '',
    conditions: [],
    selectedCondition: '',
    selectedConditionText: '',
    estimatedPrice: 0,
    estimatedPriceText: ''
  },

  onLoad() {
    const app = getApp()
    const { model } = app.globalData.quoteData
    if (!model) {
      wx.navigateBack()
      return
    }

    const basePrice = model.basePrice || 0
    const conditions = Object.values(CONDITION_LEVEL).map(level => ({
      level,
      text: CONDITION_TEXT[level],
      factor: CONDITION_FACTOR[level],
      desc: CONDITION_DESC[level],
      estimatedPrice: formatPrice(Math.round(basePrice * CONDITION_FACTOR[level]))
    }))

    this.setData({
      model,
      basePriceText: formatPrice(basePrice),
      conditions
    })
  },

  selectCondition(e) {
    const level = e.currentTarget.dataset.level
    const app = getApp()
    const { model } = app.globalData.quoteData
    const estimatedPrice = Math.round((model.basePrice || 0) * CONDITION_FACTOR[level])

    app.globalData.quoteData.condition = level
    app.globalData.quoteData.price = estimatedPrice

    this.setData({
      selectedCondition: level,
      selectedConditionText: CONDITION_TEXT[level],
      estimatedPrice,
      estimatedPriceText: formatPrice(estimatedPrice)
    })
  },

  next() {
    if (!this.data.selectedCondition) {
      wx.showToast({ title: '请选择成色', icon: 'none' })
      return
    }
    const app = getApp()
    // 服务器整机需要配置详情，其他品类直接估价
    if (app.globalData.quoteData.category.hasConfig) {
      wx.navigateTo({ url: '/pages/recycle/config/config' })
    } else {
      wx.navigateTo({ url: '/pages/recycle/quote/quote' })
    }
  }
})
