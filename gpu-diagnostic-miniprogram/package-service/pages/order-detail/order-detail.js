const app = getApp()
const api = require('../../../utils/api.js')

Page({
  data: {
    orderId: null,
    order: null,
    showSkeleton: true,
    statusSteps: [],
    currentStepIndex: 0
  },

  onLoad(options) {
    const orderId = options.id
    if (!orderId) {
      wx.showToast({ title: '工单ID不存在', icon: 'none' })
      wx.navigateBack()
      return
    }
    this.setData({ orderId })
    this.loadOrderDetail(orderId)
  },

  async loadOrderDetail(orderId) {
    this.setData({ showSkeleton: true })
    try {
      const res = await api.getOrderDetail(orderId)
      const order = res.data
      // 格式化
      order.statusText = this.formatStatus(order.status)
      order.statusColor = this.getStatusColor(order.status)
      order.serviceTypeText = this.formatServiceType(order.serviceType)
      order.urgencyText = this.formatUrgency(order.urgency)
      order.createdAtText = this.formatDate(order.createdAt)

      // 构建状态时间线
      const steps = this.buildStatusSteps(order.status)

      this.setData({
        order,
        statusSteps: steps,
        currentStepIndex: steps.findIndex(s => s.active),
        showSkeleton: false
      })
    } catch (err) {
      console.error('加载工单详情失败:', err)
      this.setData({ showSkeleton: false })
      wx.showToast({ title: '加载失败', icon: 'none' })
    }
  },

  // 拨打电话
  callPhone(e) {
    const phone = e.currentTarget.dataset.phone
    if (phone) {
      wx.makePhoneCall({ phoneNumber: phone })
    }
  },

  // 复制工单号
  copyOrderNo() {
    const orderNo = this.data.order.orderNo || this.data.order.id
    wx.setClipboardData({
      data: String(orderNo),
      success: () => wx.showToast({ title: '已复制工单号', icon: 'success' })
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

  formatServiceType(type) {
    const map = { 'onsite': '上门服务', 'instore': '到店维修', 'mail': '邮寄维修' }
    return map[type] || type
  },

  formatUrgency(urgency) {
    const map = { 'normal': '普通', 'urgent': '紧急', 'emergency': '特急' }
    return map[urgency] || urgency
  },

  formatDate(dateStr) {
    if (!dateStr) return ''
    const d = new Date(dateStr)
    if (isNaN(d.getTime())) return dateStr
    return `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}-${d.getDate().toString().padStart(2, '0')} ${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`
  },

  // 构建状态时间线
  buildStatusSteps(currentStatus) {
    const allSteps = [
      { key: 'pending', label: '提交工单', desc: '等待客服受理' },
      { key: 'accepted', label: '受理工单', desc: '客服已受理' },
      { key: 'inspecting', label: '故障检测', desc: '工程师检测中' },
      { key: 'scheme_submitted', label: '提交方案', desc: '等待确认维修方案' },
      { key: 'quotation_submitted', label: '提交报价', desc: '等待确认报价' },
      { key: 'repairing', label: '维修中', desc: '正在进行维修' },
      { key: 'repaired', label: '维修完成', desc: '等待质检' },
      { key: 'delivered', label: '已签收', desc: '工单已完成' }
    ]

    // 简化的状态映射到步骤
    const statusOrder = [
      'pending', 'accepted', 'inspecting', 'scheme_submitted',
      'scheme_confirmed', 'quotation_submitted', 'quotation_confirmed',
      'repairing', 'repaired', 'quality_checking', 'delivering', 'delivered'
    ]
    const currentIdx = statusOrder.indexOf(currentStatus)

    // 根据当前状态选取要展示的步骤
    let displaySteps = []
    if (currentIdx <= statusOrder.indexOf('accepted')) {
      displaySteps = ['pending', 'accepted', 'inspecting', 'repairing', 'delivered']
    } else if (currentIdx <= statusOrder.indexOf('repairing')) {
      displaySteps = ['pending', 'accepted', 'inspecting', 'repairing', 'delivered']
    } else {
      displaySteps = ['pending', 'accepted', 'inspecting', 'repairing', 'delivered']
    }

    return displaySteps.map((key, idx) => {
      const stepInfo = allSteps.find(s => s.key === key) || { label: key, desc: '' }
      const stepIdx = statusOrder.indexOf(key)
      const isActive = currentIdx >= stepIdx
      const isCurrent = currentStatus === key ||
        (key === 'repairing' && currentIdx > statusOrder.indexOf('repairing') && currentIdx < statusOrder.indexOf('delivered'))
      return {
        ...stepInfo,
        active: isActive,
        current: isCurrent
      }
    })
  }
})
