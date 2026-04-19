Page({
  data: {
    companyInfo: {
      name: '',
      code: '',
      status: 'unverified'
    },
    form: {
      name: '',
      code: '',
      licenseImage: '',
      contact: '',
      phone: '',
      address: ''
    },
    isFormValid: false
  },

  onLoad() {
    this.loadCompanyInfo()
  },

  loadCompanyInfo() {
    const companyInfo = wx.getStorageSync('companyInfo')
    if (companyInfo) {
      this.setData({
        companyInfo: {
          name: companyInfo.name,
          code: companyInfo.code,
          status: companyInfo.status || 'verified'
        },
        form: {
          name: companyInfo.name || '',
          code: companyInfo.code || '',
          licenseImage: companyInfo.licenseImage || '',
          contact: companyInfo.contact || '',
          phone: companyInfo.phone || '',
          address: companyInfo.address || ''
        }
      }, () => {
        this.checkFormValid()
      })
    }
  },

  onInput(e) {
    const field = e.currentTarget.dataset.field
    const value = e.detail.value
    this.setData({
      [`form.${field}`]: value
    }, () => {
      this.checkFormValid()
    })
  },

  checkFormValid() {
    const { form } = this.data
    const isValid = form.name.trim() && 
                    form.code.trim() && 
                    form.code.length === 18 &&
                    form.contact.trim() &&
                    form.phone.trim() &&
                    /^1[3-9]\d{9}$/.test(form.phone) &&
                    form.address.trim()
    this.setData({
      isFormValid: isValid
    })
  },

  chooseLicense() {
    wx.chooseMedia({
      count: 1,
      mediaType: ['image'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const tempFilePath = res.tempFiles[0].tempFilePath
        this.setData({
          'form.licenseImage': tempFilePath
        }, () => {
          this.checkFormValid()
        })
      }
    })
  },

  previewImage() {
    wx.previewImage({
      urls: [this.data.form.licenseImage]
    })
  },

  deleteLicense() {
    this.setData({
      'form.licenseImage': ''
    }, () => {
      this.checkFormValid()
    })
  },

  submitForm() {
    if (!this.data.isFormValid) {
      wx.showToast({
        title: '请填写完整信息',
        icon: 'none'
      })
      return
    }

    const { form } = this.data

    // 验证统一社会信用代码格式（简化验证）
    if (!/^[A-Z0-9]{18}$/i.test(form.code)) {
      wx.showToast({
        title: '信用代码格式错误',
        icon: 'none'
      })
      return
    }

    // 保存企业信息
    const companyInfo = {
      ...form,
      status: 'verified',
      createTime: new Date().toISOString()
    }

    wx.setStorageSync('companyInfo', companyInfo)

    wx.showToast({
      title: '提交成功',
      icon: 'success',
      success: () => {
        setTimeout(() => {
          wx.navigateBack()
        }, 1500)
      }
    })
  }
})
