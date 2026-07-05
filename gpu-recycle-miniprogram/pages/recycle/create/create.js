const { RECYCLE_METHOD, RECYCLE_METHOD_TEXT, RECYCLE_METHOD_DESC, RECYCLE_METHOD_ICON, CONDITION_TEXT } = require('../../../utils/constants')
const { formatPrice, validatePhone, generateOrderNo } = require('../../../utils/util')
const { recycleOrderApi } = require('../../../utils/api')
const { serverConfigOptions } = require('../../../data/recycleData')

Page({
  data: {
    quoteData: {},
    conditionText: '',
    configText: '',
    totalPriceText: '',
    methods: [
      { method: RECYCLE_METHOD.ONSITE, text: RECYCLE_METHOD_TEXT.onsite, desc: RECYCLE_METHOD_DESC.onsite, icon: RECYCLE_METHOD_ICON.onsite },
      { method: RECYCLE_METHOD.MAIL, text: RECYCLE_METHOD_TEXT.mail, desc: RECYCLE_METHOD_DESC.mail, icon: RECYCLE_METHOD_ICON.mail },
      { method: RECYCLE_METHOD.INSTORE, text: RECYCLE_METHOD_TEXT.instore, desc: RECYCLE_METHOD_DESC.instore, icon: RECYCLE_METHOD_ICON.instore }
    ],
    selectedMethod: RECYCLE_METHOD.ONSITE,
    form: { name: '', phone: '', address: '', appointmentTime: '', store: '', remark: '' },
    stores: ['杭州余杭网点', '杭州滨江网点', '深圳南山网点', '北京海淀网点']
  },

  onLoad() {
    const app = getApp()
    const qd = app.globalData.quoteData
    const total = (qd.price || 0) + (qd.configAddPrice || 0)

    // 构建配置文字
    let configText = ''
    if (qd.config && qd.category.hasConfig) {
      const parts = []
      if (qd.config.cpu) {
        const o = serverConfigOptions.cpu.find(o => o.id === qd.config.cpu)
        if (o) parts.push(o.label)
      }
      if (qd.config.memory) {
        const o = serverConfigOptions.memory.find(o => o.id === qd.config.memory)
        if (o) parts.push(o.label)
      }
      if (qd.config.storage) {
        const o = serverConfigOptions.storage.find(o => o.id === qd.config.storage)
        if (o) parts.push(o.label)
      }
      configText = parts.join(' / ')
    }

    // 预填用户信息
    const userInfo = wx.getStorageSync('userInfo')
    this.setData({
      quoteData: qd,
      conditionText: CONDITION_TEXT[qd.condition],
      configText,
      totalPriceText: formatPrice(total),
      'form.name': userInfo?.nickname || '',
      'form.phone': userInfo?.phone || ''
    })
  },

  selectMethod(e) {
    this.setData({ selectedMethod: e.currentTarget.dataset.method })
  },

  onInput(e) {
    const field = e.currentTarget.dataset.field
    this.setData({ [`form.${field}`]: e.detail.value })
  },

  chooseAddress() {
    wx.chooseAddress({
      success: (res) => {
        const address = `${res.provinceName}${res.cityName}${res.countyName}${res.detailInfo}`
        this.setData({
          'form.address': address,
          'form.name': res.userName,
          'form.phone': res.telNumber
        })
      }
    })
  },

  chooseTime() {
    // 简化：用日期+时间选择器
    wx.showActionSheet({
      itemList: ['今天 14:00-16:00', '今天 16:00-18:00', '明天 10:00-12:00', '明天 14:00-16:00', '后天 10:00-12:00'],
      success: (res) => {
        const times = ['今天 14:00-16:00', '今天 16:00-18:00', '明天 10:00-12:00', '明天 14:00-16:00', '后天 10:00-12:00']
        this.setData({ 'form.appointmentTime': times[res.tapIndex] })
      }
    })
  },

  chooseStore() {
    wx.showActionSheet({
      itemList: this.data.stores,
      success: (res) => {
        this.setData({ 'form.store': this.data.stores[res.tapIndex] })
      }
    })
  },

  submit() {
    const { form, selectedMethod, quoteData } = this.data

    if (!form.name) { wx.showToast({ title: '请输入姓名', icon: 'none' }); return }
    if (!validatePhone(form.phone)) { wx.showToast({ title: '请输入正确手机号', icon: 'none' }); return }

    if (selectedMethod === 'onsite' && !form.address) { wx.showToast({ title: '请选择上门地址', icon: 'none' }); return }
    if (selectedMethod === 'onsite' && !form.appointmentTime) { wx.showToast({ title: '请选择预约时间', icon: 'none' }); return }
    if (selectedMethod === 'instore' && !form.store) { wx.showToast({ title: '请选择回收网点', icon: 'none' }); return }

    const total = (quoteData.price || 0) + (quoteData.configAddPrice || 0)
    const orderNo = generateOrderNo()

    const orderData = {
      orderNo,
      categoryName: quoteData.category.name,
      categoryId: quoteData.category.id,
      modelName: quoteData.model.name,
      modelId: quoteData.model.id,
      modelSpec: quoteData.model.spec,
      condition: quoteData.condition,
      config: quoteData.config || null,
      estimatedPrice: total,
      recycleMethod: selectedMethod,
      contactName: form.name,
      contactPhone: form.phone,
      address: form.address || '',
      appointmentTime: form.appointmentTime || '',
      store: form.store || '',
      remark: form.remark || '',
      images: quoteData.images || []
    }

    wx.showLoading({ title: '提交中...' })
    recycleOrderApi.create(orderData).then((result) => {
      wx.hideLoading()
      // 保存到本地记录
      const records = wx.getStorageSync('recycleRecords') || []
      records.unshift({
        ...orderData,
        status: 'pending_inspection',
        statusText: '待验机',
        createdAt: Date.now(),
        id: result?.id || orderNo
      })
      wx.setStorageSync('recycleRecords', records)

      wx.showModal({
        title: '提交成功',
        content: '回收订单已提交，工程师将尽快与您联系安排验机。',
        showCancel: false,
        success: () => {
          // 清除估价数据
          getApp().globalData.quoteData = { category: null, model: null, condition: null, config: null, price: 0 }
          wx.redirectTo({ url: '/pages/order/detail/detail?orderNo=' + orderNo })
        }
      })
    }).catch(() => {
      wx.hideLoading()
      // 演示模式：本地保存
      const records = wx.getStorageSync('recycleRecords') || []
      records.unshift({
        ...orderData,
        status: 'pending_inspection',
        statusText: '待验机',
        createdAt: Date.now(),
        id: orderNo
      })
      wx.setStorageSync('recycleRecords', records)
      wx.showModal({
        title: '提交成功',
        content: '回收订单已提交（演示模式），工程师将尽快与您联系安排验机。',
        showCancel: false,
        success: () => {
          getApp().globalData.quoteData = { category: null, model: null, condition: null, config: null, price: 0 }
          wx.redirectTo({ url: '/pages/order/detail/detail?orderNo=' + orderNo })
        }
      })
    })
  }
})
