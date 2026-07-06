const { RECYCLE_STATUS, STATUS_TEXT, STATUS_COLOR, STATUS_TIMELINE, RECYCLE_METHOD_TEXT, CONDITION_TEXT } = require('../../../utils/constants')
const { formatPrice } = require('../../../utils/util')
const { recycleOrderApi } = require('../../../utils/api')

const STATUS_DESC = {
  [RECYCLE_STATUS.PENDING_INSPECTION]: '订单已提交，等待工程师安排验机',
  [RECYCLE_STATUS.INSPECTING]: '工程师正在验机，请耐心等待',
  [RECYCLE_STATUS.PRICE_PENDING]: '验机完成，请确认回收价格',
  [RECYCLE_STATUS.NEGOTIATING]: '正在与客服协商价格',
  [RECYCLE_STATUS.PAYMENT_PENDING]: '价格已确认，等待平台打款',
  [RECYCLE_STATUS.COMPLETED]: '回收已完成，感谢您的信任',
  [RECYCLE_STATUS.CANCELLED]: '订单已取消'
}

Page({
  data: {
    orderNo: '',
    order: null,
    statusText: '',
    statusColor: '',
    statusDesc: '',
    timeline: [],
    currentStepIndex: 0,
    estimatedPriceText: '',
    inspectionPriceText: '',
    finalPriceText: '',
    conditionText: '',
    methodText: '',
    showInspection: false,
    actions: []
  },

  onLoad(options) {
    this.setData({ orderNo: options.orderNo })
    this.loadOrder()
  },

  onShow() {
    if (this.data.orderNo) this.loadOrder()
  },

  loadOrder() {
    recycleOrderApi.getDetail(this.data.orderNo).then((data) => {
      if (data) {
        this.processOrder(data)
      } else {
        this.loadLocalOrder()
      }
    }).catch(() => {
      this.loadLocalOrder()
    })
  },

  loadLocalOrder() {
    const records = wx.getStorageSync('recycleRecords') || []
    const order = records.find(r => r.orderNo === this.data.orderNo)
    if (order) {
      this.processOrder(order)
    }
  },

  processOrder(order) {
    const status = order.status
    const timeline = STATUS_TIMELINE.map(t => ({ ...t }))
    const stepIndex = timeline.findIndex(t => t.status === status)
    const showInspection = [RECYCLE_STATUS.INSPECTING, RECYCLE_STATUS.PRICE_PENDING, RECYCLE_STATUS.NEGOTIATING, RECYCLE_STATUS.PAYMENT_PENDING, RECYCLE_STATUS.COMPLETED].includes(status)

    // 根据状态确定操作按钮
    let actions = ['contact']
    if (status === RECYCLE_STATUS.PENDING_INSPECTION) actions.push('cancel')
    if (status === RECYCLE_STATUS.PRICE_PENDING) actions = ['contact', 'reject', 'confirm']
    if (status === RECYCLE_STATUS.PAYMENT_PENDING) actions.push('payment')

    this.setData({
      order,
      statusText: STATUS_TEXT[status],
      statusColor: STATUS_COLOR[status],
      statusDesc: STATUS_DESC[status] || '',
      timeline,
      currentStepIndex: stepIndex >= 0 ? stepIndex : 0,
      estimatedPriceText: formatPrice(order.estimatedPrice || 0),
      inspectionPriceText: formatPrice(order.inspectionPrice || 0),
      finalPriceText: formatPrice(order.finalPrice || 0),
      conditionText: CONDITION_TEXT[order.condition] || '',
      methodText: RECYCLE_METHOD_TEXT[order.recycleMethod] || '',
      showInspection,
      actions
    })
  },

  previewPhoto(e) {
    wx.previewImage({
      current: this.data.order.images[e.currentTarget.dataset.index],
      urls: this.data.order.images
    })
  },

  callPhone() {
    wx.makePhoneCall({ phoneNumber: this.data.order.contactPhone })
  },

  goInspection() {
    wx.navigateTo({ url: `/pages/order/inspection/inspection?orderNo=${this.data.orderNo}` })
  },

  goNegotiate() {
    wx.navigateTo({ url: `/pages/order/negotiate/negotiate?orderNo=${this.data.orderNo}` })
  },

  callService() {
    wx.makePhoneCall({ phoneNumber: '13826580396' })
  },

  cancelOrder() {
    wx.showModal({
      title: '取消订单',
      content: '确定取消此回收订单吗？',
      success: (res) => {
        if (res.confirm) {
          this.updateOrderStatus(RECYCLE_STATUS.CANCELLED)
        }
      }
    })
  },

  confirmPrice() {
    wx.showModal({
      title: '确认价格',
      content: `确认接受验机报价 ¥${this.data.inspectionPriceText} 吗？`,
      success: (res) => {
        if (res.confirm) {
          this.updateOrderStatus(RECYCLE_STATUS.PAYMENT_PENDING, { finalPrice: this.data.order.inspectionPrice })
        }
      }
    })
  },

  rejectPrice() {
    wx.showModal({
      title: '价格协商',
      content: '如果您对验机报价不满意，可进入协商由客服为您处理',
      confirmText: '进入协商',
      success: (res) => {
        if (res.confirm) {
          this.updateOrderStatus(RECYCLE_STATUS.NEGOTIATING)
        }
      }
    })
  },

  confirmPayment() {
    wx.showModal({
      title: '确认收款',
      content: '确认已收到回收款项吗？',
      success: (res) => {
        if (res.confirm) {
          this.updateOrderStatus(RECYCLE_STATUS.COMPLETED)
        }
      }
    })
  },

  // 更新订单状态（本地+后端）
  updateOrderStatus(status, extra = {}) {
    // 本地更新
    const records = wx.getStorageSync('recycleRecords') || []
    const idx = records.findIndex(r => r.orderNo === this.data.orderNo)
    if (idx >= 0) {
      records[idx] = { ...records[idx], ...extra, status }
      wx.setStorageSync('recycleRecords', records)
      this.processOrder(records[idx])
    }

    // 后端更新（静默）
    const apiMap = {
      [RECYCLE_STATUS.CANCELLED]: () => recycleOrderApi.cancel({ orderNo: this.data.orderNo }),
      [RECYCLE_STATUS.PAYMENT_PENDING]: () => recycleOrderApi.confirmPrice({ orderNo: this.data.orderNo, ...extra }),
      [RECYCLE_STATUS.NEGOTIATING]: () => recycleOrderApi.rejectPrice({ orderNo: this.data.orderNo }),
      [RECYCLE_STATUS.COMPLETED]: () => recycleOrderApi.confirmPayment({ orderNo: this.data.orderNo })
    }
    if (apiMap[status]) {
      apiMap[status]().catch(() => {})
    }

    wx.showToast({ title: '操作成功', icon: 'success' })
  }
})
