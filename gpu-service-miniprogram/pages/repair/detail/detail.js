const { orderApi } = require('../../../utils/api')
const { STATUS_TEXT, STATUS_COLOR, SERVICE_TYPE_TEXT, USER_ROLE, ORDER_STATUS } = require('../../../utils/constants')

Page({
  data: {
    order: null,
    statusText: '',
    statusColor: '',
    stepIndex: 0,
    serviceTypeText: '',
    faultImages: [],
    inspectionReport: null,
    quotation: null,
    repairProcess: null,
    qualityReport: null,
    deliveryRecord: null,
    isCustomer: false,
    isService: false,
    isEngineer: false,
    isInspector: false,
    isStaff: false
  },

  onLoad(options) {
    this.orderId = options.id
    const role = wx.getStorageSync('userRole') || 'customer'
    this.setData({
      isCustomer: role === USER_ROLE.CUSTOMER,
      isService: role === USER_ROLE.SERVICE || role === USER_ROLE.ADMIN,
      isEngineer: role === USER_ROLE.ENGINEER || role === USER_ROLE.ADMIN,
      isInspector: role === USER_ROLE.INSPECTOR || role === USER_ROLE.ADMIN,
      isStaff: role !== USER_ROLE.CUSTOMER
    })
    this.loadOrder()
  },

  onShow() {
    this.loadOrder()
  },

  async loadOrder() {
    try {
      const order = await orderApi.getDetail(this.orderId)
      const statusStepMap = {
        [ORDER_STATUS.PENDING]: 0,
        [ORDER_STATUS.ACCEPTED]: 0,
        [ORDER_STATUS.INSPECTING]: 1,
        [ORDER_STATUS.SCHEME_PENDING]: 1,
        [ORDER_STATUS.QUOTATION_PENDING]: 2,
        [ORDER_STATUS.WAITING_REPAIR]: 2,
        [ORDER_STATUS.REPAIRING]: 3,
        [ORDER_STATUS.WAITING_INSPECTION]: 4,
        [ORDER_STATUS.QUALITY_PASSED]: 4,
        [ORDER_STATUS.DELIVERED]: 5,
        [ORDER_STATUS.AFTER_SALE]: 5,
        [ORDER_STATUS.CLOSED]: 5,
        [ORDER_STATUS.CANCELLED]: 0
      }
      this.setData({
        order,
        statusText: STATUS_TEXT[order.status] || order.status,
        statusColor: STATUS_COLOR[order.status] || '#a0a0a0',
        stepIndex: statusStepMap[order.status] || 0,
        serviceTypeText: SERVICE_TYPE_TEXT[order.serviceType] || order.serviceType,
        faultImages: order.faultImages ? JSON.parse(order.faultImages) : []
      })
    } catch (e) {
      wx.showToast({ title: '加载失败', icon: 'none' })
    }
  },

  previewImage(e) {
    wx.previewImage({
      current: e.currentTarget.dataset.url,
      urls: this.data.faultImages
    })
  },

  callCustomer() {
    if (this.data.order.customerPhone) {
      wx.makePhoneCall({ phoneNumber: this.data.order.customerPhone })
    }
  },

  // 客户操作
  editOrder() {
    wx.navigateTo({ url: `/pages/repair/create/create?id=${this.orderId}` })
  },

  async confirmScheme() {
    try {
      await orderApi.confirmScheme({ orderId: this.orderId })
      wx.showToast({ title: '方案已确认', icon: 'success' })
      this.loadOrder()
    } catch (e) { wx.showToast({ title: '操作失败', icon: 'none' }) }
  },

  rejectScheme() {
    wx.showModal({
      title: '拒绝方案',
      editable: true,
      placeholderText: '请输入拒绝原因',
      success: async (res) => {
        if (res.confirm) {
          try {
            await orderApi.rejectScheme({ orderId: this.orderId, reason: res.content || '' })
            wx.showToast({ title: '已拒绝', icon: 'success' })
            this.loadOrder()
          } catch (e) { wx.showToast({ title: '操作失败', icon: 'none' }) }
        }
      }
    })
  },

  async confirmQuotation() {
    try {
      await orderApi.confirmQuotation({ orderId: this.orderId })
      wx.showToast({ title: '报价已确认', icon: 'success' })
      this.loadOrder()
    } catch (e) { wx.showToast({ title: '操作失败', icon: 'none' }) }
  },

  rejectQuotation() {
    wx.showModal({
      title: '拒绝报价',
      editable: true,
      placeholderText: '请输入拒绝原因或协商要求',
      success: async (res) => {
        if (res.confirm) {
          try {
            await orderApi.rejectQuotation({ orderId: this.orderId, reason: res.content || '' })
            wx.showToast({ title: '已拒绝', icon: 'success' })
            this.loadOrder()
          } catch (e) { wx.showToast({ title: '操作失败', icon: 'none' }) }
        }
      }
    })
  },

  async signDelivery() {
    wx.navigateTo({ url: `/pages/repair/sign/sign?id=${this.orderId}` })
  },

  submitRating() {
    wx.navigateTo({ url: `/pages/repair/rating/rating?id=${this.orderId}` })
  },

  // 客服操作
  acceptOrder() {
    wx.navigateTo({ url: `/pages/repair/accept/accept?id=${this.orderId}` })
  },

  async confirmPayment() {
    wx.showModal({
      title: '确认收款',
      content: '确认已收到客户付款？',
      success: async (res) => {
        if (res.confirm) {
          try {
            await orderApi.confirmPayment({ orderId: this.orderId })
            wx.showToast({ title: '收款确认成功', icon: 'success' })
            this.loadOrder()
          } catch (e) { wx.showToast({ title: '操作失败', icon: 'none' }) }
        }
      }
    })
  },

  closeOrder() {
    wx.showModal({
      title: '关闭工单',
      editable: true,
      placeholderText: '请输入关闭原因',
      success: async (res) => {
        if (res.confirm) {
          try {
            await orderApi.closeOrder({ orderId: this.orderId, reason: res.content || '', closedBy: wx.getStorageSync('openid') })
            wx.showToast({ title: '工单已关闭', icon: 'success' })
            this.loadOrder()
          } catch (e) { wx.showToast({ title: '操作失败', icon: 'none' }) }
        }
      }
    })
  },

  // 工程师操作
  async startInspection() {
    try {
      await orderApi.startInspection({ orderId: this.orderId })
      wx.showToast({ title: '开始检测', icon: 'success' })
      this.loadOrder()
    } catch (e) { wx.showToast({ title: '操作失败', icon: 'none' }) }
  },

  goToInspectionReport() {
    wx.navigateTo({ url: `/pages/repair/inspection/inspection?id=${this.orderId}` })
  },

  goToQuotation() {
    wx.navigateTo({ url: `/pages/repair/quotation/quotation?id=${this.orderId}` })
  },

  async startRepair() {
    try {
      await orderApi.startRepair({ orderId: this.orderId })
      wx.showToast({ title: '开始维修', icon: 'success' })
      this.loadOrder()
    } catch (e) { wx.showToast({ title: '操作失败', icon: 'none' }) }
  },

  goToRepairProcess() {
    wx.navigateTo({ url: `/pages/repair/process/process?id=${this.orderId}` })
  },

  async completeRepair() {
    try {
      await orderApi.completeRepair({ orderId: this.orderId })
      wx.showToast({ title: '维修完成', icon: 'success' })
      this.loadOrder()
    } catch (e) { wx.showToast({ title: '操作失败', icon: 'none' }) }
  },

  goToSupplementQuotation() {
    wx.navigateTo({ url: `/pages/repair/quotation/quotation?id=${this.orderId}&type=supplement` })
  },

  // 质检员操作
  goToQualityReport() {
    wx.navigateTo({ url: `/pages/repair/quality/quality?id=${this.orderId}` })
  }
})
