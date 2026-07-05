const { serverConfigOptions } = require('../../../data/recycleData')
const { formatPrice } = require('../../../utils/util')

Page({
  data: {
    cpuOptions: [],
    memoryOptions: [],
    storageOptions: [],
    config: { cpu: '', memory: '', storage: '' },
    totalAddPrice: 0,
    totalAddPriceText: ''
  },

  onLoad() {
    const formatOpts = (opts) => opts.map(o => ({ ...o, priceText: formatPrice(o.addPrice) }))
    this.setData({
      cpuOptions: formatOpts(serverConfigOptions.cpu),
      memoryOptions: formatOpts(serverConfigOptions.memory),
      storageOptions: formatOpts(serverConfigOptions.storage)
    })
  },

  selectOption(e) {
    const { type, id } = e.currentTarget.dataset
    const config = { ...this.data.config, [type]: this.data.config[type] === id ? '' : id }
    // 计算总加价
    let total = 0
    if (config.cpu) total += serverConfigOptions.cpu.find(o => o.id === config.cpu).addPrice
    if (config.memory) total += serverConfigOptions.memory.find(o => o.id === config.memory).addPrice
    if (config.storage) total += serverConfigOptions.storage.find(o => o.id === config.storage).addPrice

    const app = getApp()
    app.globalData.quoteData.config = config
    app.globalData.quoteData.configAddPrice = total

    this.setData({ config, totalAddPrice: total, totalAddPriceText: formatPrice(total) })
  },

  next() {
    wx.navigateTo({ url: '/pages/recycle/quote/quote' })
  }
})
