const { CONDITION_TEXT, CONDITION_FACTOR, RECYCLE_METHOD, RECYCLE_METHOD_TEXT, RECYCLE_METHOD_DESC, RECYCLE_METHOD_ICON } = require('../../../utils/constants')
const { formatPrice, countUp } = require('../../../utils/util')
const { upload } = require('../../../utils/api')

Page({
  data: {
    category: {},
    model: {},
    conditionText: '',
    conditionFactor: 1,
    basePriceText: '',
    configAddPrice: 0,
    configAddPriceText: '',
    totalPrice: 0,
    totalPriceText: '',
    displayPrice: 0,
    images: []
  },

  onLoad() {
    const app = getApp()
    const { category, model, condition, config, price } = app.globalData.quoteData

    const configAddPrice = app.globalData.quoteData.configAddPrice || 0
    const total = price + configAddPrice

    this.setData({
      category,
      model,
      conditionText: CONDITION_TEXT[condition],
      conditionFactor: CONDITION_FACTOR[condition],
      basePriceText: formatPrice(model.basePrice || 0),
      configAddPrice,
      configAddPriceText: formatPrice(configAddPrice),
      totalPrice: total,
      totalPriceText: formatPrice(total)
    })

    // 价格滚动动画
    countUp(this, 'displayPrice', total, 1000)

    // 保存到最近估价
    this.saveRecentQuote(model, total, category.id)
  },

  saveRecentQuote(model, price, catId) {
    const recent = wx.getStorageSync('recentQuotes') || []
    recent.unshift({
      modelName: model.name,
      modelId: model.id,
      catId,
      price: price,
      time: Date.now()
    })
    wx.setStorageSync('recentQuotes', recent.slice(0, 10))
  },

  chooseImage() {
    wx.chooseMedia({
      count: 6 - this.data.images.length,
      mediaType: ['image'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const newImages = res.tempFiles.map(f => f.tempFilePath)
        this.setData({ images: [...this.data.images, ...newImages] })
      }
    })
  },

  previewImage(e) {
    wx.previewImage({
      current: this.data.images[e.currentTarget.dataset.index],
      urls: this.data.images
    })
  },

  deleteImage(e) {
    const index = e.currentTarget.dataset.index
    const images = [...this.data.images]
    images.splice(index, 1)
    this.setData({ images })
  },

  goCreate() {
    const app = getApp()
    app.globalData.quoteData.images = this.data.images
    wx.navigateTo({ url: '/pages/recycle/create/create' })
  }
})
