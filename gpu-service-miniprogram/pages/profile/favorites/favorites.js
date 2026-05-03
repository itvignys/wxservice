Page({
  data: {
    favorites: []
  },

  onLoad() {
    this.loadFavorites()
  },

  onShow() {
    this.loadFavorites()
  },

  loadFavorites() {
    const favorites = wx.getStorageSync('favorites') || []
    this.setData({
      favorites: favorites
    })
  },

  viewDetail(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({
      url: `/pages/knowledge/detail/detail?id=${id}`
    })
  },

  unfavorite(e) {
    const id = e.currentTarget.dataset.id
    let favorites = wx.getStorageSync('favorites') || []
    favorites = favorites.filter(item => item.id !== id)
    wx.setStorageSync('favorites', favorites)
    this.setData({
      favorites: favorites
    })
    wx.showToast({
      title: '已取消收藏',
      icon: 'success'
    })
  },

  goToKnowledge() {
    wx.switchTab({
      url: '/pages/knowledge/knowledge'
    })
  }
})
