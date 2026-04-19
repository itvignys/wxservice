Page({
  data: {
    hasCompanyInfo: false,
    experts: [
      {
        id: 1,
        name: '张工程师',
        title: '高级硬件工程师',
        experience: 12,
        specialty: '专攻NVIDIA显卡维修',
        avatar: '/assets/images/expert1.png'
      },
      {
        id: 2,
        name: '李师傅',
        title: '主板维修专家',
        experience: 15,
        specialty: '显卡主板级维修',
        avatar: '/assets/images/expert2.png'
      },
      {
        id: 3,
        name: '王技师',
        title: '显存修复专家',
        experience: 8,
        specialty: '显存颗粒更换',
        avatar: '/assets/images/expert3.png'
      },
      {
        id: 4,
        name: '刘师傅',
        title: 'BIOS工程师',
        experience: 10,
        specialty: '显卡BIOS修复',
        avatar: '/assets/images/expert4.png'
      }
    ]
  },

  onLoad() {
    // 检查是否有企业信息
    const companyInfo = wx.getStorageSync('companyInfo')
    this.setData({
      hasCompanyInfo: !!companyInfo
    })
  },

  startAIChat() {
    wx.switchTab({
      url: '/pages/index/index'
    })
  },

  bookExpert() {
    wx.navigateTo({
      url: '/pages/expert/book/book?type=phone'
    })
  },

  bookOnsite() {
    wx.navigateTo({
      url: '/pages/expert/book/book?type=onsite'
    })
  },

  fillCompanyInfo() {
    wx.navigateTo({
      url: '/pages/profile/company/company'
    })
  },

  callHotline() {
    wx.makePhoneCall({
      phoneNumber: '400-888-8888'
    })
  }
})
