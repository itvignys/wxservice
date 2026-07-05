const { addressApi } = require('../../../utils/api')
const { validatePhone } = require('../../../utils/util')

Page({
  data: {
    id: '',
    form: { name: '', phone: '', province: '', city: '', district: '', detail: '', isDefault: false }
  },

  onLoad(options) {
    if (options.id) {
      this.setData({ id: options.id })
      this.loadAddress(options.id)
    }
  },

  loadAddress(id) {
    const addresses = wx.getStorageSync('addresses') || []
    const addr = addresses.find(a => a.id == id)
    if (addr) this.setData({ form: addr })
  },

  onInput(e) {
    this.setData({ [`form.${e.currentTarget.dataset.field}`]: e.detail.value })
  },

  chooseRegion() {
    wx.chooseLocation({
      success: (res) => {
        // 简化：用chooseLocation返回的地址
        this.setData({
          'form.province': res.address || '',
          'form.city': '',
          'form.district': '',
          'form.detail': res.name || ''
        })
      },
      fail: () => {
        // 兜底：手动输入
        wx.showActionSheet({
          itemList: ['浙江省杭州市余杭区', '浙江省杭州市滨江区', '广东省深圳市南山区', '北京市海淀区'],
          success: (res) => {
            const regions = [
              { province: '浙江省', city: '杭州市', district: '余杭区' },
              { province: '浙江省', city: '杭州市', district: '滨江区' },
              { province: '广东省', city: '深圳市', district: '南山区' },
              { province: '北京市', city: '北京市', district: '海淀区' }
            ]
            const r = regions[res.tapIndex]
            this.setData({ 'form.province': r.province, 'form.city': r.city, 'form.district': r.district })
          }
        })
      }
    })
  },

  onDefaultChange(e) {
    this.setData({ 'form.isDefault': e.detail.value })
  },

  save() {
    const { form, id } = this.data
    if (!form.name) { wx.showToast({ title: '请输入姓名', icon: 'none' }); return }
    if (!validatePhone(form.phone)) { wx.showToast({ title: '请输入正确手机号', icon: 'none' }); return }
    if (!form.province) { wx.showToast({ title: '请选择地区', icon: 'none' }); return }
    if (!form.detail) { wx.showToast({ title: '请输入详细地址', icon: 'none' }); return }

    const addresses = wx.getStorageSync('addresses') || []
    if (id) {
      const idx = addresses.findIndex(a => a.id == id)
      if (idx >= 0) addresses[idx] = { ...addresses[idx], ...form }
    } else {
      addresses.unshift({ ...form, id: Date.now().toString() })
    }

    // 如果设为默认，取消其他默认
    if (form.isDefault) {
      addresses.forEach(a => { if (a.id != id) a.isDefault = false })
    }

    wx.setStorageSync('addresses', addresses)
    addressApi.save({ ...form, id: id || undefined }).catch(() => {})
    wx.showToast({ title: '保存成功', icon: 'success' })
    setTimeout(() => wx.navigateBack(), 1000)
  }
})
