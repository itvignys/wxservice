const { orderApi } = require('../../../utils/api')
const { SERVICE_TYPE, URGENCY } = require('../../../utils/constants')

Page({
  data: {
    isEdit: false,
    orderId: null,
    deviceTypes: ['GPU显卡', '服务器', '工作站', '笔记本', '其他'],
    faultImages: [],
    form: {
      deviceType: '',
      brandModel: '',
      serialNo: '',
      faultDesc: '',
      serviceType: 'onsite',
      customerAddress: '',
      urgency: 'normal',
      expectedTime: '',
      relatedOrderNo: ''
    },
    submitting: false
  },

  onLoad(options) {
    if (options.id) {
      this.setData({ isEdit: true, orderId: options.id })
      this.loadOrder(options.id)
    }
    const openid = wx.getStorageSync('openid')
    const userInfo = wx.getStorageSync('userInfo')
    this.setData({
      'form.customerOpenid': openid,
      'form.customerName': userInfo?.nickName || '',
      'form.customerPhone': userInfo?.phone || ''
    })
  },

  async loadOrder(orderId) {
    try {
      const order = await orderApi.getDetail(orderId)
      this.setData({
        form: {
          deviceType: order.deviceType || '',
          brandModel: order.brandModel || '',
          serialNo: order.serialNo || '',
          faultDesc: order.faultDesc || '',
          serviceType: order.serviceType || 'onsite',
          customerAddress: order.customerAddress || '',
          urgency: order.urgency || 'normal',
          expectedTime: order.expectedTime || '',
          relatedOrderNo: order.relatedOrderNo || ''
        },
        faultImages: order.faultImages ? JSON.parse(order.faultImages) : []
      })
    } catch (e) {
      wx.showToast({ title: '加载失败', icon: 'none' })
    }
  },

  onInput(e) {
    const field = e.currentTarget.dataset.field
    this.setData({ [`form.${field}`]: e.detail.value })
  },

  onDeviceTypeChange(e) {
    this.setData({ 'form.deviceType': this.data.deviceTypes[e.detail.value] })
  },

  onServiceTypeChange(e) {
    this.setData({ 'form.serviceType': e.currentTarget.dataset.value })
  },

  onUrgencyChange(e) {
    this.setData({ 'form.urgency': e.currentTarget.dataset.value })
  },

  onDateChange(e) {
    this.setData({ 'form.expectedTime': e.detail.value })
  },

  chooseImage() {
    const count = 6 - this.data.faultImages.length
    wx.chooseMedia({
      count,
      mediaType: ['image'],
      success: (res) => {
        const newImages = res.tempFiles.map(f => f.tempFilePath)
        this.setData({ faultImages: [...this.data.faultImages, ...newImages] })
      }
    })
  },

  previewImage(e) {
    wx.previewImage({
      current: e.currentTarget.dataset.url,
      urls: this.data.faultImages
    })
  },

  deleteImage(e) {
    const index = e.currentTarget.dataset.index
    const images = this.data.faultImages
    images.splice(index, 1)
    this.setData({ faultImages: images })
  },

  validateForm() {
    const { form } = this.data
    if (!form.deviceType) { wx.showToast({ title: '请选择设备类型', icon: 'none' }); return false }
    if (!form.brandModel) { wx.showToast({ title: '请填写品牌型号', icon: 'none' }); return false }
    if (!form.faultDesc) { wx.showToast({ title: '请描述故障情况', icon: 'none' }); return false }
    if (form.serviceType === 'onsite' && !form.customerAddress) {
      wx.showToast({ title: '请填写上门地址', icon: 'none' }); return false
    }
    return true
  },

  async submitOrder() {
    if (!this.validateForm()) return
    this.setData({ submitting: true })
    try {
      const data = {
        ...this.data.form,
        faultImages: JSON.stringify(this.data.faultImages)
      }
      if (this.data.isEdit) {
        data.id = this.data.orderId
        await orderApi.update(data)
        wx.showToast({ title: '修改成功', icon: 'success' })
      } else {
        await orderApi.create(data)
        wx.showToast({ title: '报修成功', icon: 'success' })
      }
      setTimeout(() => wx.navigateBack(), 1500)
    } catch (e) {
      wx.showToast({ title: '提交失败', icon: 'none' })
    } finally {
      this.setData({ submitting: false })
    }
  }
})
