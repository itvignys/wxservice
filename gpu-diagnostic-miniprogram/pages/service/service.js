const app = getApp()
const api = require('../../utils/api.js')
const constants = require('../../utils/constants.js')

Page({
  data: {
    isEdit: false,
    agreed: false,
    hasUsedFreeService: false,
    companyInfo: null,
    form: {
      name: '',
      creditCode: '',
      contact: '',
      phone: '',
      address: '',
      remark: ''
    },
    errors: {},
    gpuCountIndex: 0,
    gpuCountOptions: ['1-5张', '6-20张', '21-50张', '50张以上'],
    serviceOptions: [
      { name: '故障检测', value: 'detection', checked: false },
      { name: '维修保养', value: 'repair', checked: false },
      { name: '算力租赁', value: 'rental', checked: false },
      { name: '技术咨询', value: 'consulting', checked: false }
    ],
    isSubmitting: false // 提交状态
  },

  onLoad() {
    this.loadCompanyInfo()
  },

  onShow() {
    this.loadCompanyInfo()
  },

  loadCompanyInfo() {
    const openid = app.globalData.userInfo ? app.globalData.userInfo.openid : null
    if (!openid) return

    api.getCompanyInfo(openid).then(result => {
      const companyInfo = result.data
      if (!companyInfo) return

      // 解析已保存的 gpuCount 和 services
      let gpuCountIndex = 0
      if (companyInfo.gpuCount) {
        const idx = this.data.gpuCountOptions.indexOf(companyInfo.gpuCount)
        if (idx !== -1) gpuCountIndex = idx
      }

      // 解析已保存的服务需求
      let savedServices = []
      if (companyInfo.services) {
        try {
          savedServices = typeof companyInfo.services === 'string'
            ? JSON.parse(companyInfo.services)
            : companyInfo.services
        } catch (e) {}
      }
      const serviceOptions = this.data.serviceOptions.map(item => ({
        ...item,
        checked: savedServices.includes(item.name)
      }))

      this.setData({
        companyInfo,
        hasUsedFreeService: companyInfo.hasUsedFreeService === 1,
        isEdit: true,
        form: {
          name: companyInfo.name || '',
          creditCode: companyInfo.creditCode || '',
          contact: companyInfo.contact || '',
          phone: companyInfo.phone || '',
          address: companyInfo.address || '',
          remark: companyInfo.remark || ''
        },
        gpuCountIndex,
        serviceOptions,
        agreed: true
      })
    }).catch(err => {
      console.warn('获取企业信息失败:', err.message)
    })
  },

  onInput(e) {
    const field = e.currentTarget.dataset.field
    const value = e.detail.value
    this.setData({
      [`form.${field}`]: value,
      [`errors.${field}`]: ''
    })
  },

  onGpuCountChange(e) {
    this.setData({ gpuCountIndex: e.detail.value })
  },

  onServiceChange(e) {
    const values = e.detail.value
    const options = this.data.serviceOptions.map(item => ({
      ...item,
      checked: values.includes(item.value)
    }))
    this.setData({ serviceOptions: options })
  },

  toggleAgreement() {
    this.setData({ agreed: !this.data.agreed })
  },

  validateForm() {
    const { form } = this.data
    const errors = {}

    if (!form.name.trim()) errors.name = '请输入企业名称'
    if (!form.creditCode.trim()) {
      errors.creditCode = '请输入统一社会信用代码'
    } else if (!/^([0-9A-HJ-NPQRTUWXY]{2}\d{6}[0-9A-HJ-NPQRTUWXY]{10}|[1-9]\d{6})$/.test(form.creditCode)) {
      errors.creditCode = '统一社会信用代码格式不正确'
    }
    if (!form.contact.trim()) errors.contact = '请输入联系人姓名'
    if (!form.phone.trim()) {
      errors.phone = '请输入联系电话'
    } else if (!/^1[3-9]\d{9}$/.test(form.phone)) {
      errors.phone = '手机号码格式不正确'
    }
    if (!form.address.trim()) errors.address = '请输入企业地址'

    this.setData({ errors })
    return Object.keys(errors).length === 0
  },

  submitForm() {
    if (!this.data.agreed) {
      wx.showToast({ title: '请先同意服务协议', icon: 'none' })
      return
    }

    if (!this.validateForm()) {
      wx.showToast({ title: '请检查填写内容', icon: 'none' })
      return
    }

    const { form, gpuCountOptions, gpuCountIndex, serviceOptions } = this.data
    
    // 收集选中的服务需求
    const selectedServices = serviceOptions
      .filter(item => item.checked)
      .map(item => item.name)

    const openid = app.globalData.userInfo ? app.globalData.userInfo.openid : null
    if (!openid) {
      wx.showToast({ title: '请稍候，正在登录...', icon: 'none' })
      return
    }

    const companyData = {
      openid,
      ...form,
      gpuCount: gpuCountOptions[gpuCountIndex],
      services: JSON.stringify(selectedServices),
      status: 'pending',
      hasUsedFreeService: this.data.hasUsedFreeService ? 1 : 0
    }

    // 调用后端API提交
    this.setData({ isSubmitting: true })
    
    api.saveCompanyInfo(companyData)
      .then(result => {
        const savedData = result.data
        
        // 更新全局状态和本地缓存
        app.saveCompanyInfo(savedData)
        
        wx.showToast({
          title: this.data.isEdit ? '更新成功' : '提交成功',
          icon: 'success',
          success: () => {
            this.setData({
              companyInfo: savedData,
              isEdit: true,
              isSubmitting: false
            })
            setTimeout(() => { wx.navigateBack() }, 1500)
          }
        })
      })
      .catch(err => {
        console.error('企业信息提交失败:', err)
        
        // API提交失败时，保存到本地作为降级方案
        const fallbackData = {
          ...companyData,
          services: selectedServices,
          submitTime: new Date().toISOString()
        }
        app.saveCompanyInfo(fallbackData)
        
        this.setData({ isSubmitting: false })
        wx.showToast({ 
          title: '已保存(离线模式)', 
          icon: 'none',
          duration: 2000
        })
        setTimeout(() => { wx.navigateBack() }, 1500)
      })
  },

  viewAgreement() {
    wx.showModal({
      title: '服务协议',
      content: '这里是服务协议的详细内容...\n\n1. 用户需要提供真实有效的企业信息\n2. 免费上门检测服务每个企业限使用一次\n3. 服务范围限中国大陆地区\n4. 最终解释权归秀源智能科技所有',
      showCancel: false
    })
  },

  viewPrivacy() {
    wx.showModal({
      title: '隐私政策',
      content: '我们非常重视您的隐私保护...\n\n1. 我们将严格保护您的企业信息\n2. 信息仅用于提供服务，不会泄露给第三方\n3. 您有权随时查看、修改或删除您的信息',
      showCancel: false
    })
  },

  callService() {
    wx.makePhoneCall({ phoneNumber: '13826580396' })
  },

  openChat() {
    wx.showModal({
      title: '在线客服',
      content: '客服工作时间：9:00-21:00\n您可以直接在小程序中使用AI诊断或留言，我们的客服会尽快回复。',
      showCancel: false
    })
  }
})
