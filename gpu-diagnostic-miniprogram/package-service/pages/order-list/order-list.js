const app = getApp()
const api = require('../../../utils/api.js')
const constants = require('../../../utils/constants.js')

Page({
  data: {
    orders: [],
    currentStatus: '',
    statusTabs: [
      { value: '', label: '全部' },
      { value: 'pending', label: '待受理' },
      { value: 'accepted', label: '已受理' },
      { value: 'repairing', label: '维修中' },
      { value: 'delivered', label: '已完成' }
    ],
    page: 1,
    size: 10,
    hasMore: true,
    isLoading: false,
    isRefreshing: false,
    showSkeleton: true
  },

  onLoad() {
    this.loadOrders(true)
  },

  onShow() {
    // 从详情页返回时刷新
    this.loadOrders(true)
  },

  // 切换状态筛选
  switchStatus(e) {
    const status = e.currentTarget.dataset.status
    this.setData({ currentStatus: status, page: 1, orders: [], hasMore: true })
    this.loadOrders(true)
  },

  // 加载工单列表
  async loadOrders(reset = false) {
    if (this.data.isLoading) return
    if (!reset && !this.data.hasMore) return

    const openid = app.globalData.userInfo ? app.globalData.userInfo.openid : null
    if (!openid) {
      this.setData({ showSkeleton: false })
      wx.showToast({ title: '请先登录', icon: 'none' })
      return
    }

    this.setData({ isLoading: true })
    try {
      const page = reset ? 1 : this.data.page
      const res = await api.getMyOrders(page, this.data.size, this.data.currentStatus)
      const records = res.data ? (res.data.records || res.data) : []
      const total = res.data ? (res.data.total || records.length) : 0

      // 格式化状态文本
      const formatted = records.map(item => ({
        ...item,
        statusText: this.formatStatus(item.status),
        statusColor: this.getStatusColor(item.status),
        createdAtText: this.formatDate(item.createdAt)
      }))

      const newOrders = reset ? formatted : this.data.orders.concat(formatted)
      const hasMore = newOrders.length < total

      this.setData({
        orders: newOrders,
        page: page + 1,
        hasMore,
        isLoading: false,
        showSkeleton: false
      })
    } catch (err) {
      console.error('加载工单失败:', err)
      this.setData({ isLoading: false, showSkeleton: false })
      wx.showToast({ title: '加载失败', icon: 'none' })
    }
  },

  // 下拉刷新
  onRefresh() {
    this.setData({ isRefreshing: true })
    this.loadOrders(true).finally(() => {
      this.setData({ isRefreshing: false })
    })
  },

  // 触底加载更多
  onReachBottom() {
    this.loadOrders(false)
  },

  // 查看工单详情
  goToDetail(e) {
    const orderId = e.currentTarget.dataset.id
    wx.navigateTo({
      url: `/package-service/pages/order-detail/order-detail?id=${orderId}`
    })
  },

  // 创建新工单
  createOrder() {
    // 请求订阅消息授权（工单状态变更通知）
    this.requestOrderSubscribe()
    wx.navigateTo({
      url: '/package-service/pages/service/service?mode=create'
    })
  },

  // 请求工单相关订阅消息授权
  requestOrderSubscribe() {
    const tmplIds = []
    if (constants.SUBSCRIBE_TEMPLATES.ORDER_STATUS) {
      tmplIds.push(constants.SUBSCRIBE_TEMPLATES.ORDER_STATUS)
    }
    if (constants.SUBSCRIBE_TEMPLATES.REPAIR_COMPLETE) {
      tmplIds.push(constants.SUBSCRIBE_TEMPLATES.REPAIR_COMPLETE)
    }
    if (tmplIds.length === 0) return

    wx.requestSubscribeMessage({
      tmplIds,
      success: (res) => {
        console.log('订阅消息授权结果:', res)
        // 用户允许后，可在后端记录订阅状态（可选）
        const accepted = tmplIds.filter(id => res[id] === 'accept')
        if (accepted.length > 0) {
          wx.showToast({ title: '已开启消息通知', icon: 'success' })
        }
      },
      fail: (err) => {
        console.warn('订阅消息授权失败:', err)
      }
    })
  },

  // 状态格式化
  formatStatus(status) {
    const map = {
      'pending': '待受理',
      'accepted': '已受理',
      'inspecting': '检测中',
      'scheme_submitted': '待确认方案',
      'scheme_confirmed': '方案已确认',
      'quotation_submitted': '待确认报价',
      'quotation_confirmed': '报价已确认',
      'repairing': '维修中',
      'repaired': '维修完成',
      'quality_checking': '质检中',
      'delivering': '配送中',
      'delivered': '已签收',
      'after_sale': '售后中',
      'closed': '已关闭'
    }
    return map[status] || status
  },

  // 状态颜色
  getStatusColor(status) {
    const map = {
      'pending': '#FF9500',
      'accepted': '#065A82',
      'inspecting': '#5856D6',
      'scheme_submitted': '#FF9500',
      'scheme_confirmed': '#02C39A',
      'quotation_submitted': '#FF9500',
      'quotation_confirmed': '#02C39A',
      'repairing': '#065A82',
      'repaired': '#02C39A',
      'quality_checking': '#5856D6',
      'delivering': '#065A82',
      'delivered': '#02C39A',
      'after_sale': '#FF3B30',
      'closed': '#8E8E93'
    }
    return map[status] || '#999'
  },

  // 日期格式化
  formatDate(dateStr) {
    if (!dateStr) return ''
    const d = new Date(dateStr)
    if (isNaN(d.getTime())) return dateStr
    const now = new Date()
    const diff = now - d
    if (diff < 86400000 && now.getDate() === d.getDate()) {
      return `今天 ${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`
    }
    if (diff < 172800000 && diff >= 86400000) {
      return `昨天 ${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`
    }
    return `${d.getMonth() + 1}月${d.getDate()}日`
  }
})
