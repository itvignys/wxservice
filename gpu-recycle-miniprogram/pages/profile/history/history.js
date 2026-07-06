const { STATUS_TEXT, STATUS_COLOR, RECYCLE_STATUS } = require('../../../utils/constants')
const { formatPrice, formatTime } = require('../../../utils/util')

Page({
  data: {
    records: [],
    summary: { count: 0, amount: '0' }
  },

  onShow() { this.loadRecords() },

  loadRecords() {
    const records = (wx.getStorageSync('recycleRecords') || []).map(r => ({
      ...r,
      statusText: STATUS_TEXT[r.status] || r.status,
      statusColor: STATUS_COLOR[r.status] || '#86868B',
      priceText: formatPrice(r.finalPrice || r.estimatedPrice || 0),
      timeText: formatTime(r.createdAt)
    }))

    const completed = records.filter(r => r.status === RECYCLE_STATUS.COMPLETED)
    const totalAmount = completed.reduce((sum, r) => sum + (r.finalPrice || r.estimatedPrice || 0), 0)

    this.setData({
      records,
      summary: { count: records.length, amount: formatPrice(totalAmount) }
    })
  },

  goDetail(e) {
    wx.navigateTo({ url: `/pages/order/detail/detail?orderNo=${e.currentTarget.dataset.orderno}` })
  },

  goRecycle() { wx.switchTab({ url: '/pages/recycle/recycle' }) }
})
