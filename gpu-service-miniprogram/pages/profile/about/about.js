Page({
  data: {},

  callHotline() {
    wx.makePhoneCall({
      phoneNumber: '400-888-8888'
    })
  }
})
