const { orderApi } = require('../../../utils/api')
const { STATUS_TEXT, STATUS_COLOR, USER_ROLE } = require('../../../utils/constants')

Page({
  data: {
    activeTab: 'my',
    filterStatus: '',
    orders: [],
    loading: false,
    page: 1,
    hasMore: true,
    isService: false,
    isEngineer: false,
    isInspector: false,
    isAdmin: false,
    statusTextMap: STATUS_TEXT,
    statusColorMap: STATUS_COLOR
  },

  onLoad(options) {
    const role = wx.getStorageSync('userRole') || 'customer'
    this.setData({
      isService: role === USER_ROLE.SERVICE || role === USER_ROLE.ADMIN,
      isEngineer: role === USER_ROLE.ENGINEER || role === USER_ROLE.ADMIN,
      isInspector: role === USER_ROLE.INSPECTOR || role === USER_ROLE.ADMIN,
      isAdmin: role === USER_ROLE.ADMIN,
      activeTab: options.tab || 'my'
    })
    this.loadOrders()
  },

  onPullDownRefresh() {
    this.setData({ page: 1, hasMore: true, orders: [] })
    this.loadOrders().then(() => wx.stopPullDownRefresh())
  },

  onReachBottom() {
    if (this.data.hasMore && !this.data.loading) {
      this.loadOrders()
    }
  },

  switchTab(e) {
    const tab = e.currentTarget.dataset.tab
    this.setData({
      activeTab: tab,
      filterStatus: '',
      page: 1,
      hasMore: true,
      orders: []
    })
    this.loadOrders()
  },

  filterByStatus(e) {
    const status = e.currentTarget.dataset.status
    this.setData({
      filterStatus: status,
      page: 1,
      hasMore: true,
      orders: []
    })
    this.loadOrders()
  },

  async loadOrders() {
    if (this.data.loading) return
    this.setData({ loading: true })
    try {
      const { activeTab, filterStatus, page } = this.data
      const params = { page, size: 10 }
      if (filterStatus) params.status = filterStatus

      let result
      switch (activeTab) {
        case 'pending':
          result = await orderApi.getPendingOrders(params)
          break
        case 'engineer':
          result = await orderApi.getEngineerTasks(params)
          break
        case 'inspection':
          result = await orderApi.getInspectionTasks(params)
          break
        case 'all':
          result = await orderApi.getAllOrders(params)
          break
        default:
          result = await orderApi.getMyOrders(params)
      }

      const newOrders = result.records || []
      this.setData({
        orders: page === 1 ? newOrders : [...this.data.orders, ...newOrders],
        hasMore: newOrders.length === 10,
        page: page + 1
      })
    } catch (e) {
      wx.showToast({ title: '加载失败', icon: 'none' })
    } finally {
      this.setData({ loading: false })
    }
  },

  goToDetail(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({ url: `/pages/repair/detail/detail?id=${id}` })
  },

  goToCreate() {
    wx.navigateTo({ url: '/pages/repair/create/create' })
  }
})
