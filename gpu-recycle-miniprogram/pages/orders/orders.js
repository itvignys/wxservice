const { RECYCLE_STATUS, STATUS_TEXT, STATUS_COLOR, RECYCLE_METHOD_TEXT, CONDITION_TEXT } = require('../../utils/constants')
const { formatPrice, formatTime } = require('../../utils/util')
const { recycleOrderApi } = require('../../utils/api')

Page({
  data: {
    tabs: [
      { label: '全部', value: 'all', count: 0 },
      { label: '待验机', value: RECYCLE_STATUS.PENDING_INSPECTION, count: 0 },
      { label: '验机中', value: RECYCLE_STATUS.INSPECTING, count: 0 },
      { label: '待确认', value: RECYCLE_STATUS.PRICE_PENDING, count: 0 },
      { label: '待打款', value: RECYCLE_STATUS.PAYMENT_PENDING, count: 0 },
      { label: '已完成', value: RECYCLE_STATUS.COMPLETED, count: 0 }
    ],
    currentTab: 'all',
    orders: [],
    filteredOrders: [],
    page: 1,
    hasMore: false
  },

  onLoad() {
    this.loadOrders()
  },

  onShow() {
    this.loadOrders()
  },

  loadOrders() {
    // 优先从后端获取，兜底本地存储
    recycleOrderApi.getMyOrders({ page: 1, size: 50 }).then((data) => {
      if (data && data.records) {
        this.processOrders(data.records)
      } else {
        this.loadLocalOrders()
      }
    }).catch(() => {
      this.loadLocalOrders()
    })
  },

  loadLocalOrders() {
    const records = wx.getStorageSync('recycleRecords') || []
    this.processOrders(records)
  },

  processOrders(records) {
    const orders = records.map(r => ({
      ...r,
      statusText: STATUS_TEXT[r.status] || r.status,
      statusColor: STATUS_COLOR[r.status] || '#86868B',
      methodText: RECYCLE_METHOD_TEXT[r.recycleMethod] || '',
      conditionText: CONDITION_TEXT[r.condition] || '',
      priceText: formatPrice(r.estimatedPrice || r.price || 0),
      timeText: formatTime(r.createdAt)
    }))

    // 统计各状态数量
    const tabs = this.data.tabs.map(tab => ({
      ...tab,
      count: tab.value === 'all' ? orders.length : orders.filter(o => o.status === tab.value).length
    }))

    this.setData({ orders, tabs })
    this.filterOrders()
  },

  switchTab(e) {
    this.setData({ currentTab: e.currentTarget.dataset.tab })
    this.filterOrders()
  },

  filterOrders() {
    const { currentTab, orders } = this.data
    const filtered = currentTab === 'all' ? orders : orders.filter(o => o.status === currentTab)
    this.setData({ filteredOrders: filtered })
  },

  goDetail(e) {
    const orderNo = e.currentTarget.dataset.orderno
    wx.navigateTo({ url: `/pages/order/detail/detail?orderNo=${orderNo}` })
  },

  goRecycle() {
    wx.switchTab({ url: '/pages/recycle/recycle' })
  },

  onPullDownRefresh() {
    this.loadOrders()
    wx.stopPullDownRefresh()
  },

  onReachBottom() {
    // 分页加载（后端模式）
  }
})
