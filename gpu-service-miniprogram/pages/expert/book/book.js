Page({
  data: {
    serviceType: 'phone',
    today: '',
    purchaseTimeRange: ['1个月内', '1-6个月', '6-12个月', '1-2年', '2年以上', '不确定'],
    timeSlots: ['09:00-11:00', '11:00-13:00', '13:00-15:00', '15:00-17:00', '17:00-19:00'],
    form: {
      name: '',
      phone: '',
      address: '',
      gpuModel: '',
      issue: '',
      purchaseTime: '',
      companyName: '',
      creditCode: '',
      date: '',
      timeSlot: ''
    }
  },

  onLoad(options) {
    const today = new Date().toISOString().split('T')[0]
    this.setData({
      serviceType: options.type || 'phone',
      today: today
    })

    // 加载缓存的用户信息
    const userInfo = wx.getStorageSync('userInfo')
    if (userInfo) {
      this.setData({
        'form.name': userInfo.name || '',
        'form.phone': userInfo.phone || ''
      })
    }

    // 加载企业信息
    const companyInfo = wx.getStorageSync('companyInfo')
    if (companyInfo) {
      this.setData({
        'form.companyName': companyInfo.name || '',
        'form.creditCode': companyInfo.code || ''
      })
    }
  },

  onInput(e) {
    const field = e.currentTarget.dataset.field
    const value = e.detail.value
    this.setData({
      [`form.${field}`]: value
    })
  },

  onPurchaseTimeChange(e) {
    const index = e.detail.value
    this.setData({
      'form.purchaseTime': this.data.purchaseTimeRange[index]
    })
  },

  onDateChange(e) {
    this.setData({
      'form.date': e.detail.value
    })
  },

  selectTimeSlot(e) {
    const slot = e.currentTarget.dataset.slot
    this.setData({
      'form.timeSlot': slot
    })
  },

  submitBooking() {
    const { form, serviceType } = this.data

    // 验证必填项
    if (!form.name.trim()) {
      wx.showToast({ title: '请输入联系人姓名', icon: 'none' })
      return
    }
    if (!form.phone.trim() || !/^1[3-9]\d{9}$/.test(form.phone)) {
      wx.showToast({ title: '请输入正确的手机号', icon: 'none' })
      return
    }
    if (serviceType === 'onsite' && !form.address.trim()) {
      wx.showToast({ title: '请输入服务地址', icon: 'none' })
      return
    }
    if (!form.gpuModel.trim()) {
      wx.showToast({ title: '请输入显卡型号', icon: 'none' })
      return
    }
    if (!form.issue.trim()) {
      wx.showToast({ title: '请描述故障现象', icon: 'none' })
      return
    }
    if (!form.date) {
      wx.showToast({ title: '请选择预约日期', icon: 'none' })
      return
    }
    if (!form.timeSlot) {
      wx.showToast({ title: '请选择预约时段', icon: 'none' })
      return
    }

    // 构造预约数据
    const bookingData = {
      ...form,
      serviceType,
      createTime: new Date().toISOString(),
      status: 'pending'
    }

    // 保存预约记录
    let bookings = wx.getStorageSync('bookings') || []
    bookings.push(bookingData)
    wx.setStorageSync('bookings', bookings)

    // 保存用户信息
    wx.setStorageSync('userInfo', {
      name: form.name,
      phone: form.phone
    })

    // 如果填写了企业信息，保存企业信息
    if (form.companyName && form.creditCode) {
      wx.setStorageSync('companyInfo', {
        name: form.companyName,
        code: form.creditCode
      })
    }

    wx.showToast({
      title: '预约成功',
      icon: 'success',
      success: () => {
        setTimeout(() => {
          wx.navigateBack()
        }, 1500)
      }
    })
  }
})
