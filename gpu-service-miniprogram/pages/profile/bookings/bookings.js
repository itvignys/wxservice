Page({
  data: {
    bookings: []
  },

  onLoad() {
    this.loadBookings()
  },

  onShow() {
    this.loadBookings()
  },

  loadBookings() {
    const bookings = wx.getStorageSync('bookings') || []
    
    // 格式化数据
    const formattedBookings = bookings.map(item => {
      const date = new Date(item.createTime)
      return {
        ...item,
        createTime: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`,
        statusText: item.status === 'pending' ? '待确认' : 
                    item.status === 'confirmed' ? '已确认' : '已完成'
      }
    })

    // 按时间倒序排列
    formattedBookings.reverse()

    this.setData({
      bookings: formattedBookings
    })
  },

  goToBook() {
    wx.switchTab({
      url: '/pages/expert/expert'
    })
  }
})
